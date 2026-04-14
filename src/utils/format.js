export const formatModifier = (n) => (n >= 0 ? `+${n}` : `${n}`);

export const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export const titleCase = (s) =>
  s ? s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
