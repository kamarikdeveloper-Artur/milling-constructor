const state = {
  workspace: { mode: "milling" },
  cutout: { width: 150, height: 100, left: 225, bottom: 150 },
  template: { type: "none", length: 200, depth: 30, bottom: 100, radiusTop: 0, radiusBottom: 0, center: 300 },
  part: { width: 600, height: 400, thickness: 18 },
  display: { grid: true, axes: true, dimensions: true },
  milling: { enabled: true, x1: "50", y1: "50", x2: "550", y2: "350" },
};
const listeners = new Set();
export const getState = () => Object.fromEntries(Object.entries(state).map(([key, value]) => [key, { ...value }]));
export function updateState(section, patch) {
  Object.assign(state[section], patch);
  listeners.forEach((fn) => fn(getState()));
}
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
