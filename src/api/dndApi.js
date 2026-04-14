const BASE = 'https://www.dnd5eapi.co/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`DnD API ${res.status}: ${path}`);
  return res.json();
}

export const fetchRaces        = () => get('/races').then(d => d.results);
export const fetchRace         = (index) => get(`/races/${index}`);
export const fetchClasses      = () => get('/classes').then(d => d.results);
export const fetchClass        = (index) => get(`/classes/${index}`);
export const fetchClassLevel   = (classIndex, level) => get(`/classes/${classIndex}/levels/${level}`);
export const fetchSpells       = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/spells${qs ? '?' + qs : ''}`).then(d => d.results);
};
export const fetchSpell        = (index) => get(`/spells/${index}`);
export const fetchEquipmentList   = () => get('/equipment').then(d => d.results);
export const fetchEquipment       = (index) => get(`/equipment/${index}`);
export const fetchAllClassLevels  = (classIndex) => get(`/classes/${classIndex}/levels`);
export const fetchFeature         = (index) => get(`/features/${index}`);
export const fetchTrait           = (index) => get(`/traits/${index}`);
export const fetchFeats           = () => get('/feats').then(d => d.results);
export const fetchFeat            = (index) => get(`/feats/${index}`);
