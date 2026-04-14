import { create } from 'zustand';
import { deriveAll } from './derivationEngine';
import { CLASS_SAVING_THROWS, HIT_DICE } from './constants';

// ─── Blank Character Template ────────────────────────────────────────────────

export const BLANK_CHARACTER = {
  _id: null,
  owner: null,
  meta: {
    name: '',
    campaign: '',
    background: '',
    alignment: '',
    xp: 0,
  },
  race: {
    id: '',
    name: '',
    subrace: '',
    speed: 30,
    traits: [],
    languages: [],
    abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
  },
  class: {
    id: '',
    name: '',
    level: 1,
    subclass: '',
    hitDice: 'd8',
    hitDieMax: 8,
    skillChoiceCount: 2,
    allowedSkillIds: [],
  },
  abilityScores: {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  },
  skillProficiencies: [],
  savingThrowProficiencies: [],
  expertiseSkills: [],
  overrides: {},
  conditionFlags: [],
  inventory: [],
  spells: {
    known: [],
    slots: {},
  },
  hp: {
    max: 0,
    current: 0,
    temp: 0,
  },
  deathSaves: {
    successes: 0,
    failures: 0,
  },
  features: {
    racial: [],  // [{ id, label, category:'racial' }]
    class: [],   // [{ id, label, level, category:'class' }]
  },
  feats: [],     // [{ id, label }]
};

// ─── Store ───────────────────────────────────────────────────────────────────

const useCharacterStore = create((set, get) => ({
  character: BLANK_CHARACTER,
  derived: deriveAll(BLANK_CHARACTER),

  /**
   * All mutations go through _update. Pass a function that receives the current
   * character and returns the next character. Derived state is recalculated once.
   */
  _update: (updater) =>
    set((state) => {
      const next = updater(state.character);
      return { character: next, derived: deriveAll(next) };
    }),

  // ── Meta ──────────────────────────────────────────────────────────────────

  setMeta: (field, value) =>
    get()._update((c) => ({ ...c, meta: { ...c.meta, [field]: value } })),

  // ── Ability Scores ────────────────────────────────────────────────────────

  setAbilityScore: (ability, value) =>
    get()._update((c) => ({
      ...c,
      abilityScores: { ...c.abilityScores, [ability]: Number(value) },
    })),

  // ── Race ──────────────────────────────────────────────────────────────────
  // raceData shape: { id, subrace, speed, traits, languages }
  // Typically sourced from dnd5eapi.co /races/{index}

  setRace: (raceData) =>
    get()._update((c) => ({ ...c, race: { ...c.race, ...raceData } })),

  // ── Class ─────────────────────────────────────────────────────────────────
  // Selecting a class resets saving throw proficiencies to class defaults.
  // Existing skill proficiencies are preserved (player may have chosen them).

  // classData: { id, name }
  setClass: ({ id, name = '' }) =>
    get()._update((c) => ({
      ...c,
      class: {
        ...c.class,
        id,
        name,
        hitDice: HIT_DICE[id] ?? 'd8',
        hitDieMax: { 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12 }[HIT_DICE[id] ?? 'd8'] ?? 8,
      },
      savingThrowProficiencies: CLASS_SAVING_THROWS[id] ?? [],
    })),

  setSubclass: (subclass) =>
    get()._update((c) => ({ ...c, class: { ...c.class, subclass } })),

  setLevel: (level) =>
    get()._update((c) => ({ ...c, class: { ...c.class, level: Number(level) } })),

  // Parsed from dnd5eapi.co /classes/{index}.proficiency_choices
  setClassProficiencyChoices: ({ skillChoiceCount, allowedSkillIds }) =>
    get()._update((c) => ({
      ...c,
      class: { ...c.class, skillChoiceCount, allowedSkillIds },
      // Drop any currently selected skills that are no longer in the allowed pool
      skillProficiencies: allowedSkillIds.length > 0
        ? c.skillProficiencies.filter(s => allowedSkillIds.includes(s))
        : c.skillProficiencies,
    })),

  setRacialFeatures: (features) =>
    get()._update((c) => ({ ...c, features: { ...c.features, racial: features } })),

  setClassFeatures: (features) =>
    get()._update((c) => ({ ...c, features: { ...c.features, class: features } })),

  // ── Feats ─────────────────────────────────────────────────────────────────

  addFeat: (feat) =>
    get()._update((c) => ({ ...c, feats: [...c.feats, feat] })),

  removeFeat: (featId) =>
    get()._update((c) => ({ ...c, feats: c.feats.filter((f) => f.id !== featId) })),

  // ── Proficiencies ─────────────────────────────────────────────────────────

  toggleSkillProficiency: (skillId) =>
    get()._update((c) => {
      const has = c.skillProficiencies.includes(skillId);
      return {
        ...c,
        skillProficiencies: has
          ? c.skillProficiencies.filter((s) => s !== skillId)
          : [...c.skillProficiencies, skillId],
        // Removing proficiency also removes any expertise for that skill
        expertiseSkills: has
          ? c.expertiseSkills.filter((s) => s !== skillId)
          : c.expertiseSkills,
      };
    }),

  toggleExpertise: (skillId) =>
    get()._update((c) => {
      const has = c.expertiseSkills.includes(skillId);
      return {
        ...c,
        expertiseSkills: has
          ? c.expertiseSkills.filter((s) => s !== skillId)
          : [...c.expertiseSkills, skillId],
      };
    }),

  toggleSavingThrowProficiency: (abilityId) =>
    get()._update((c) => {
      const has = c.savingThrowProficiencies.includes(abilityId);
      return {
        ...c,
        savingThrowProficiencies: has
          ? c.savingThrowProficiencies.filter((a) => a !== abilityId)
          : [...c.savingThrowProficiencies, abilityId],
      };
    }),

  // ── Overrides ─────────────────────────────────────────────────────────────
  // delta is a signed integer added on top of the calculated base.
  // Valid keys: 'ac', 'speed', 'initiative', 'spellSaveDC', 'spellAttackBonus',
  //             'skill_{skillId}', 'save_{abilityId}'

  setOverride: (key, delta) =>
    get()._update((c) => ({
      ...c,
      overrides: { ...c.overrides, [key]: Number(delta) },
    })),

  clearOverride: (key) =>
    get()._update((c) => {
      const { [key]: _removed, ...rest } = c.overrides;
      return { ...c, overrides: rest };
    }),

  // ── Conditions ────────────────────────────────────────────────────────────

  toggleCondition: (conditionId) =>
    get()._update((c) => {
      const has = c.conditionFlags.includes(conditionId);
      return {
        ...c,
        conditionFlags: has
          ? c.conditionFlags.filter((cond) => cond !== conditionId)
          : [...c.conditionFlags, conditionId],
      };
    }),

  // ── HP ────────────────────────────────────────────────────────────────────

  setHP: (field, value) =>
    get()._update((c) => ({
      ...c,
      hp: { ...c.hp, [field]: Number(value) },
    })),

  // Temp HP absorbs damage first; remainder drains current HP
  applyDamage: (amount) =>
    get()._update((c) => {
      let remaining = amount;
      let temp = c.hp.temp;
      if (temp > 0) {
        const absorbed = Math.min(temp, remaining);
        temp -= absorbed;
        remaining -= absorbed;
      }
      return {
        ...c,
        hp: {
          ...c.hp,
          current: Math.max(0, c.hp.current - remaining),
          temp,
        },
      };
    }),

  heal: (amount) =>
    get()._update((c) => ({
      ...c,
      hp: { ...c.hp, current: Math.min(c.hp.max, c.hp.current + amount) },
    })),

  // ── Death Saves ───────────────────────────────────────────────────────────

  addDeathSave: (type) =>
    get()._update((c) => ({
      ...c,
      deathSaves: {
        ...c.deathSaves,
        [type]: Math.min(3, c.deathSaves[type] + 1),
      },
    })),

  resetDeathSaves: () =>
    get()._update((c) => ({
      ...c,
      deathSaves: { successes: 0, failures: 0 },
    })),

  // ── Inventory ─────────────────────────────────────────────────────────────
  // item shape: { item_id, label, weight, qty, custom?, notes? }

  addInventoryItem: (item) =>
    get()._update((c) => ({ ...c, inventory: [...c.inventory, item] })),

  removeInventoryItem: (index) =>
    get()._update((c) => ({
      ...c,
      inventory: c.inventory.filter((_, i) => i !== index),
    })),

  updateInventoryItem: (index, updates) =>
    get()._update((c) => ({
      ...c,
      inventory: c.inventory.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    })),

  // ── Spells ────────────────────────────────────────────────────────────────
  // spellRef shape: { id, label, level, custom? }

  addSpell: (spellRef) =>
    get()._update((c) => ({
      ...c,
      spells: { ...c.spells, known: [...c.spells.known, spellRef] },
    })),

  removeSpell: (spellId) =>
    get()._update((c) => ({
      ...c,
      spells: {
        ...c.spells,
        known: c.spells.known.filter((s) => s.id !== spellId),
      },
    })),

  // slots shape: { '1': { max: 4, used: 2 }, '2': { max: 3, used: 0 }, ... }
  setSpellSlots: (slots) =>
    get()._update((c) => ({
      ...c,
      spells: { ...c.spells, slots },
    })),

  useSpellSlot: (level) =>
    get()._update((c) => {
      const slot = c.spells.slots[String(level)];
      if (!slot || slot.used >= slot.max) return c;
      return {
        ...c,
        spells: {
          ...c.spells,
          slots: {
            ...c.spells.slots,
            [String(level)]: { ...slot, used: slot.used + 1 },
          },
        },
      };
    }),

  recoverSpellSlot: (level) =>
    get()._update((c) => {
      const slot = c.spells.slots[String(level)];
      if (!slot || slot.used <= 0) return c;
      return {
        ...c,
        spells: {
          ...c.spells,
          slots: {
            ...c.spells.slots,
            [String(level)]: { ...slot, used: slot.used - 1 },
          },
        },
      };
    }),

  recoverAllSpellSlots: () =>
    get()._update((c) => {
      const recovered = {};
      for (const [lvl, slot] of Object.entries(c.spells.slots)) {
        recovered[lvl] = { ...slot, used: 0 };
      }
      return { ...c, spells: { ...c.spells, slots: recovered } };
    }),

  // ── Bulk Operations ───────────────────────────────────────────────────────

  // Load a full character document from the API
  loadCharacter: (characterData) =>
    set({ character: characterData, derived: deriveAll(characterData) }),

  // Reset to a blank sheet
  resetCharacter: () =>
    set({ character: BLANK_CHARACTER, derived: deriveAll(BLANK_CHARACTER) }),
}));

export default useCharacterStore;
