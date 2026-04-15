const BASE = 'https://api.open5e.com';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Open5e API ${res.status}: ${path}`);
  return res.json();
}

// ── Field-name helpers ────────────────────────────────────────────────────────

const ABILITY_NAME_TO_INDEX = {
  Strength: 'str', Dexterity: 'dex', Constitution: 'con',
  Intelligence: 'int', Wisdom: 'wis', Charisma: 'cha',
};

function normalizeRaceList(results) {
  return results.map(r => ({ index: r.slug, name: r.name }));
}

function normalizeRace(r) {
  // asi: [{ attributes: ["Dexterity"], value: 2 }]
  // → ability_bonuses: [{ ability_score: { index: 'dex', name: 'Dexterity' }, bonus: 2 }]
  const ability_bonuses = (r.asi ?? []).flatMap(asi =>
    (asi.attributes ?? []).map(attr => ({
      ability_score: {
        index: ABILITY_NAME_TO_INDEX[attr] ?? attr.toLowerCase().slice(0, 3),
        name: attr,
      },
      bonus: asi.value,
    }))
  );

  // speed: { walk: 30 } → 30
  const speed = r.speed && typeof r.speed === 'object'
    ? (r.speed.walk ?? 30)
    : (r.speed ?? 30);

  // Open5e stores traits/languages as plain strings — no structured list available
  return {
    index: r.slug,
    name: r.name,
    speed,
    ability_bonuses,
    traits: [],
    languages: [],
    subraces: [],
  };
}

function normalizeClassList(results) {
  return results.map(c => ({ index: c.slug, name: c.name }));
}

function normalizeClass(c) {
  // hit_dice: "1d12" → hit_die: 12
  const hit_die = parseInt((c.hit_dice || '').match(/d(\d+)/)?.[1] ?? '0', 10);

  // prof_saving_throws: "Strength, Constitution"
  // → saving_throws: [{ index: 'strength', name: 'Strength' }]
  const saving_throws = (c.prof_saving_throws || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(name => ({ index: name.toLowerCase(), name }));

  // prof_skills: "Choose two from Animal Handling, Athletics, ..."
  // → proficiency_choices compatible with ClassStep expectations
  const proficiency_choices = buildProficiencyChoices(c.prof_skills);

  return {
    index: c.slug,
    name: c.name,
    hit_die,
    saving_throws,
    proficiency_choices,
  };
}

function buildProficiencyChoices(profSkills) {
  if (!profSkills) return [];

  const WORD_TO_NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  const countMatch = profSkills.match(/choose (\w+)/i);
  const chooseWord = countMatch?.[1]?.toLowerCase();
  const choose = WORD_TO_NUM[chooseWord] ?? parseInt(chooseWord, 10) ?? 2;

  const fromIdx = profSkills.toLowerCase().indexOf(' from ');
  if (fromIdx === -1) return [];

  const afterFrom = profSkills.slice(fromIdx + 6);
  const skillNames = afterFrom
    .replace(/ and /gi, ',')
    .split(',')
    .map(s => s.trim().replace(/[.\s]+$/, ''))
    .filter(Boolean);

  const options = skillNames.map(name => ({
    item: {
      index: 'skill-' + name.toLowerCase().replace(/\s+/g, '-'),
      name: `Skill: ${name}`,
    },
  }));

  return [{ choose, from: { options } }];
}

function normalizeSpellList(results) {
  return results.map(s => ({ index: s.slug, name: s.name }));
}

function normalizeSpell(s) {
  const schoolRaw = s.school ?? '';
  const schoolName = schoolRaw.charAt(0).toUpperCase() + schoolRaw.slice(1);
  return {
    index: s.slug,
    name: s.name,
    level: s.level_int ?? s.spell_level ?? 0,
    school: { index: schoolRaw, name: schoolName },
    casting_time: s.casting_time,
    range: s.range,
    duration: s.duration,
    concentration: s.requires_concentration ?? false,
    ritual: s.ritual ?? false,
    components: s.components,
    material: s.material,
    // SpellDetail reads desc[0] and higher_level[0] — wrap strings in arrays
    desc: s.desc ? [s.desc] : [],
    higher_level: s.higher_level ? [s.higher_level] : [],
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export const fetchRaces = () =>
  get('/v1/races/?limit=100').then(d => normalizeRaceList(d.results ?? []));

export const fetchRace = (slug) =>
  get(`/v1/races/${slug}/`).then(normalizeRace);

export const fetchClasses = () =>
  get('/v1/classes/?limit=50').then(d => normalizeClassList(d.results ?? []));

export const fetchClass = (slug) =>
  get(`/v1/classes/${slug}/`).then(normalizeClass);

// Open5e does not expose per-level class data — return stubs
export const fetchClassLevel = (_classIndex, _level) => Promise.resolve({});
export const fetchAllClassLevels = (_classIndex) => Promise.resolve([]);

export const fetchSpells = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/v1/spells/?limit=500${qs ? '&' + qs : ''}`).then(d =>
    normalizeSpellList(d.results ?? [])
  );
};

export const fetchSpellsByClass = (className) => {
  const qs = new URLSearchParams({ dnd_class: className, limit: 500 }).toString();
  return get(`/v1/spells/?${qs}`).then(d => normalizeSpellList(d.results ?? []));
};

export const fetchSpell = (slug) =>
  get(`/v1/spells/${slug}/`).then(normalizeSpell);

export const fetchEquipmentList = async () => {
  const [weapons, armor] = await Promise.all([
    get('/v2/weapons/?limit=200').then(d => d.results ?? []),
    get('/v2/armor/?limit=100').then(d => d.results ?? []),
  ]);
  return [...weapons, ...armor].map(e => ({ index: e.slug, name: e.name }));
};

export const fetchEquipment = async (slug) => {
  try {
    const e = await get(`/v2/weapons/${slug}/`);
    return { index: e.slug, name: e.name, weight: e.weight ?? 0 };
  } catch {
    try {
      const e = await get(`/v2/armor/${slug}/`);
      return { index: e.slug, name: e.name, weight: e.weight ?? 0 };
    } catch {
      return { index: slug, name: slug, weight: 0 };
    }
  }
};

// Open5e has no /features/ or /traits/ endpoints — description fetching unavailable
export const fetchFeature = (_index) => Promise.resolve({ desc: [] });
export const fetchTrait   = (_index) => Promise.resolve({ desc: [] });

export const fetchFeats = () =>
  get('/v2/feats/?limit=200').then(d =>
    (d.results ?? []).map(f => ({ index: f.slug, name: f.name }))
  );

export const fetchFeat = (slug) =>
  get(`/v2/feats/${slug}/`).then(f => ({
    index: f.slug,
    name: f.name,
    desc: f.desc ? [f.desc] : [],
    prerequisites: [],
  }));
