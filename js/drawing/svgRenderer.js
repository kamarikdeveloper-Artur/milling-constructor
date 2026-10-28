import { cutoutFits, cutoutOffsets } from "../core/cutout.js";
import { validateSmile, smileGeometry, smilePath } from "../templates/smile.js";
import { validateLine } from "../core/validation.js";
import { modelToSvg } from "../core/coordinates.js";
import { rectangleCorners, formatMm, niceGridStep } from "../core/geometry.js";
import { renderGrid } from "./gridRenderer.js";
export function add(parent, tag, attrs = {}, text = "") {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (text) el.textContent = text;
  parent.append(el);
  return el;
}
export function render(svg, state, view) {
  svg.setAttribute("viewBox", `0 0 ${view.width} ${view.height}`);
  svg.querySelector("#scene")?.remove();
  svg.querySelector("desc").textContent =
    `Деталь ${formatMm(state.part.width)} на ${formatMm(state.part.height)} мм. Товщина ${formatMm(state.part.thickness)} мм. Початок координат — нижній лівий кут.`;
  const scene = add(svg, "g", { id: "scene" }),
    grid = add(scene, "g", { "aria-hidden": "true" });
  const step = state.display.grid ? renderGrid(grid, view, add) : niceGridStep(view.scale);
  const points = rectangleCorners(state.part).map((p) => modelToSvg(p, view)),
    [o, br, tr, tl] = points;
  const smile = state.workspace.mode === "milling" && state.template.type === "smile" ? validateSmile(state.template, state.part) : null;
  if (smile?.value) {
    const geometry = smileGeometry(smile.value, state.part),
      cut = smilePath(geometry, view, modelToSvg);
    const start = modelToSvg(geometry.points[0], view);
    add(scene, "path", {
      d: `M ${o.x} ${o.y} L ${tl.x} ${tl.y} L ${start.x} ${start.y} ${cut.replace(/^M \S+ \S+ /, "")} L ${tr.x} ${tr.y} L ${br.x} ${br.y} Z`,
      class: "part",
    });
    add(scene, "path", { d: cut, class: "milling-line template-cut" });
    svg.querySelector("desc").textContent +=
      ` Шаблон «Ручка посмішка»: довжина ${formatMm(smile.value.length)} мм, глибина ${formatMm(smile.value.depth)} мм.`;
  } else {
    add(scene, "polygon", { points: points.map((p) => `${p.x},${p.y}`).join(" "), class: "part" });
  }
  if (br.x - o.x > 180 && o.y - tl.y > 65)
    add(scene, "text", { x: (o.x + br.x) / 2, y: (o.y + tl.y) / 2, "text-anchor": "middle", class: "svg-label part-label" }, "ЗАГОТОВКА");
  if (state.display.axes) {
    add(scene, "path", { d: `M ${o.x - 20} ${o.y} H ${br.x + 28} l -7 -4 m 7 4 l -7 4`, class: "axis-x" });
    add(scene, "path", { d: `M ${o.x} ${o.y + 20} V ${tl.y - 28} l -4 7 m 4 -7 l 4 7`, class: "axis-y" });
    add(scene, "text", { x: br.x + 34, y: o.y + 4, class: "svg-label" }, "X");
    add(scene, "text", { x: o.x - 4, y: tl.y - 36, class: "svg-label" }, "Y");
    add(scene, "circle", { cx: o.x, cy: o.y, r: 4, class: "origin" });
    add(scene, "text", { x: o.x - 9, y: o.y + 32, "text-anchor": "end", class: "svg-label" }, "0; 0");
  }
  if (state.display.dimensions) {
    const y = o.y + 47,
      x = tr.x + 42;
    add(scene, "path", {
      d: `M ${o.x} ${o.y + 8} V ${y + 5} M ${br.x} ${br.y + 8} V ${y + 5} M ${o.x} ${y} H ${br.x} M ${o.x - 3} ${y + 4} l 6 -8 M ${br.x - 3} ${y + 4} l 6 -8`,
      class: "dimension",
    });
    add(
      scene,
      "text",
      { x: (o.x + br.x) / 2, y: y - 7, "text-anchor": "middle", class: "svg-label dimension-label" },
      `${formatMm(state.part.width)} мм`,
    );
    add(scene, "path", {
      d: `M ${tr.x + 8} ${tr.y} H ${x + 5} M ${br.x + 8} ${br.y} H ${x + 5} M ${x} ${tr.y} V ${br.y} M ${x - 4} ${tr.y + 3} l 8 -6 M ${x - 4} ${br.y + 3} l 8 -6`,
      class: "dimension",
    });
    add(
      scene,
      "text",
      { transform: `translate(${x - 8} ${(tr.y + br.y) / 2}) rotate(-90)`, "text-anchor": "middle", class: "svg-label dimension-label" },
      `${formatMm(state.part.height)} мм`,
    );
  }
  const segment = validateLine(state.milling, state.part);
  if (state.workspace.mode === "milling" && state.template.type === "none" && state.milling.enabled && segment.value) {
    const v = segment.value,
      a = modelToSvg({ x: v.x1, y: v.y1 }, view),
      b = modelToSvg({ x: v.x2, y: v.y2 }, view);
    const group = add(scene, "g", { class: "milling-segment" });
    add(group, "title", {}, `Фрезерування: (${formatMm(v.x1)}; ${formatMm(v.y1)}) → (${formatMm(v.x2)}; ${formatMm(v.y2)}) мм`);
    add(group, "line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "milling-line" });
    for (const [point, label] of [
      [a, "1"],
      [b, "2"],
    ]) {
      add(group, "circle", { cx: point.x, cy: point.y, r: 4, class: "milling-point" });
      add(group, "text", { x: point.x + 8, y: point.y - 10, class: "svg-label milling-label" }, label);
    }
    svg.querySelector("desc").textContent += ` Відрізок від (${formatMm(v.x1)}; ${formatMm(v.y1)}) до (${formatMm(v.x2)}; ${formatMm(v.y2)}) мм.`;
  }
  if (state.workspace.mode === "cutout" && cutoutFits(state.cutout, state.part)) {
    const c = state.cutout,
      offsets = cutoutOffsets(c, state.part);
    const upper = modelToSvg({ x: c.left, y: c.bottom + c.height }, view);
    add(scene, "rect", { x: upper.x, y: upper.y, width: c.width * view.scale, height: c.height * view.scale, rx: 0, class: "position-cutout" });
    const middle = modelToSvg({ x: c.left + c.width / 2, y: c.bottom + c.height / 2 }, view);
    const right = upper.x + c.width * view.scale,
      bottom = upper.y + c.height * view.scale;
    const gaps = [
      ["Зліва", offsets.left, tl.x, middle.y, upper.x, middle.y],
      ["Справа", offsets.right, right, middle.y, tr.x, middle.y],
      ["Зверху", offsets.top, middle.x, tl.y, middle.x, upper.y],
      ["Знизу", offsets.bottom, middle.x, bottom, middle.x, o.y],
    ];
    for (const [label, value, x1, y1, x2, y2] of gaps) {
      add(scene, "line", { x1, y1, x2, y2, class: "offset-guide" });
      add(
        scene,
        "text",
        { x: (x1 + x2) / 2 + 4, y: (y1 + y2) / 2 - 6, "text-anchor": "middle", class: "svg-label offset-label" },
        `${label}: ${formatMm(Math.round(value))}`,
      );
    }
    svg.querySelector("desc").textContent +=
      ` Прямокутний виріз ${formatMm(c.width)} на ${formatMm(c.height)} мм; зліва ${formatMm(offsets.left)}, справа ${formatMm(offsets.right)}, зверху ${formatMm(offsets.top)}, знизу ${formatMm(offsets.bottom)} мм.`;
  }
  return step;
}
