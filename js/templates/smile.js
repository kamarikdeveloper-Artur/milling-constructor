// Dimensions are actual tangent-to-tangent opening and bottom widths.
export function validateSmile(raw, part) {
  const v = {},
    errors = {};
  for (const key of ["length", "depth", "bottom", "radiusTop", "radiusBottom", "center"]) {
    const text = String(raw[key] ?? "").trim(),
      n = Number(text);
    if (!text || !Number.isFinite(n)) errors[key] = "Введіть коректне число.";
    else if (n < 0 || (["length", "depth", "bottom"].includes(key) && n === 0))
      errors[key] = "Значення має бути додатним (радіус і центр можуть бути 0).";
    else v[key] = n;
  }
  if (Object.keys(errors).length) return { errors, value: null };
  if (v.bottom >= v.length) errors.bottom = "Ширина дна має бути меншою за довжину ручки.";
  if (v.depth >= part.height) errors.depth = "Глибина має бути меншою за висоту деталі.";
  if (v.center - v.length / 2 < 0 || v.center + v.length / 2 > part.width) errors.center = "Ручка виходить за бічні краї деталі.";
  const h = (v.length - v.bottom) / 2;
  if (h > 0) {
    const maxSum = h >= v.depth ? (h * h + v.depth * v.depth) / (2 * v.depth) : h;
    if (v.radiusTop + v.radiusBottom > maxSum + 1e-9) {
      const message = `Сума верхнього й нижнього радіусів має бути не більшою за ${Math.floor(maxSum * 100) / 100} мм.`;
      errors.radiusTop = message;
      errors.radiusBottom = message;
    }
  }
  return { errors, value: Object.keys(errors).length ? null : v };
}
export function smileGeometry(v, part) {
  const h = (v.length - v.bottom) / 2,
    d = v.depth,
    rt = v.radiusTop,
    rb = v.radiusBottom;
  let lo = Math.atan2(d, h),
    hi = Math.min(Math.PI / 2, 2 * Math.atan2(d, h));
  for (let i = 0; i < 70; i++) {
    const a = (lo + hi) / 2;
    if (h * Math.sin(a) - d * Math.cos(a) - (rt + rb) * (1 - Math.cos(a)) < 0) lo = a;
    else hi = a;
  }
  const angle = (lo + hi) / 2,
    tx = rt * Math.sin(angle),
    ty = rt * (1 - Math.cos(angle)),
    bx = rb * Math.sin(angle),
    by = rb * (1 - Math.cos(angle));
  const top = part.height,
    bottom = top - d,
    left = v.center - v.length / 2,
    right = v.center + v.length / 2;
  const bl = v.center - v.bottom / 2,
    br = v.center + v.bottom / 2;
  return {
    radiusTop: rt,
    radiusBottom: rb,
    points: [
      { x: left, y: top },
      { x: left + tx, y: top - ty },
      { x: bl - bx, y: bottom + by },
      { x: bl, y: bottom },
      { x: br, y: bottom },
      { x: br + bx, y: bottom + by },
      { x: right - tx, y: top - ty },
      { x: right, y: top },
    ],
  };
}
export function smilePath(geometry, view, toSvg) {
  const p = geometry.points.map((q) => toSvg(q, view));
  const top = geometry.radiusTop * view.scale,
    bottom = geometry.radiusBottom * view.scale;
  const xy = (i) => `${p[i].x} ${p[i].y}`;
  const arc = (r, sweep, i) => (r ? `A ${r} ${r} 0 0 ${sweep} ${xy(i)}` : `L ${xy(i)}`);
  return `M ${xy(0)} ${arc(top, 1, 1)} L ${xy(2)} ${arc(bottom, 0, 3)} L ${xy(4)} ${arc(bottom, 0, 5)} L ${xy(6)} ${arc(top, 1, 7)}`;
}
export function smileDefaults(part) {
  const length = Math.min(200, part.width * 0.6),
    depth = Math.min(30, part.height * 0.2, length * 0.15);
  return { length, depth, bottom: length * 0.5, radiusTop: 20, radiusBottom: 20, center: part.width / 2 };
}
