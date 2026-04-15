export const SKILLS = {
  acrobatics:     { ability: 'dex', label: 'Acrobatics' },
  animalHandling: { ability: 'wis', label: 'Animal Handling' },
  arcana:         { ability: 'int', label: 'Arcana' },
  athletics:      { ability: 'str', label: 'Athletics' },
  deception:      { ability: 'cha', label: 'Deception' },
  history:        { ability: 'int', label: 'History' },
  insight:        { ability: 'wis', label: 'Insight' },
  intimidation:   { ability: 'cha', label: 'Intimidation' },
  investigation:  { ability: 'int', label: 'Investigation' },
  medicine:       { ability: 'wis', label: 'Medicine' },
  nature:         { ability: 'int', label: 'Nature' },
  perception:     { ability: 'wis', label: 'Perception' },
  performance:    { ability: 'cha', label: 'Performance' },
  persuasion:     { ability: 'cha', label: 'Persuasion' },
  religion:       { ability: 'int', label: 'Religion' },
  sleightOfHand:  { ability: 'dex', label: 'Sleight of Hand' },
  stealth:        { ability: 'dex', label: 'Stealth' },
  survival:       { ability: 'wis', label: 'Survival' },
};

export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const PROFICIENCY_BONUS_BY_LEVEL = {
  1: 2,  2: 2,  3: 2,  4: 2,
  5: 3,  6: 3,  7: 3,  8: 3,
  9: 4,  10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

// Primary spellcasting ability by class index (matches dnd5eapi.co class index strings)
export const SPELLCASTING_ABILITY = {
  bard:      'cha',
  cleric:    'wis',
  druid:     'wis',
  paladin:   'cha',
  ranger:    'wis',
  sorcerer:  'cha',
  warlock:   'cha',
  wizard:    'int',
  artificer: 'int',
};

export const HIT_DICE_MAX = { 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12 };

// Hit dice by class
export const HIT_DICE = {
  barbarian: 'd12',
  fighter:   'd10',
  paladin:   'd10',
  ranger:    'd10',
  bard:      'd8',
  cleric:    'd8',
  druid:     'd8',
  monk:      'd8',
  rogue:     'd8',
  warlock:   'd8',
  artificer:'d8',
  sorcerer:  'd6',
  wizard:    'd6',
};

// Saving throw proficiencies by class
export const CLASS_SAVING_THROWS = {
  barbarian: ['str', 'con'],
  bard:      ['dex', 'cha'],
  cleric:    ['wis', 'cha'],
  druid:     ['int', 'wis'],
  fighter:   ['str', 'con'],
  monk:      ['str', 'dex'],
  paladin:   ['wis', 'cha'],
  ranger:    ['str', 'dex'],
  rogue:     ['dex', 'int'],
  sorcerer:  ['con', 'cha'],
  warlock:   ['wis', 'cha'],
  wizard:    ['int', 'wis'],
  artificer: ['con', 'int'],
};

// Conditions — stores display label and flags used by the UI layer.
// Mathematical penalties (disadvantage, speed reduction) are applied
// contextually when rolling; they are not collapsed into flat stat deltas
// because they are situational (e.g. frightened only triggers near the source).
export const CONDITIONS = {
  blinded:       { label: 'Blinded',       attackDisadvantage: true,  grantsAdvantageToAttackers: true },
  charmed:       { label: 'Charmed' },
  deafened:      { label: 'Deafened' },
  exhaustion1:   { label: 'Exhaustion 1',  skillDisadvantage: true },
  exhaustion2:   { label: 'Exhaustion 2',  skillDisadvantage: true, speedHalved: true },
  exhaustion3:   { label: 'Exhaustion 3',  skillDisadvantage: true, speedHalved: true, attackDisadvantage: true, saveDisadvantage: true },
  exhaustion4:   { label: 'Exhaustion 4',  skillDisadvantage: true, speedHalved: true, attackDisadvantage: true, saveDisadvantage: true, hpMaxHalved: true },
  exhaustion5:   { label: 'Exhaustion 5',  skillDisadvantage: true, speedZero: true,   attackDisadvantage: true, saveDisadvantage: true, hpMaxHalved: true },
  exhaustion6:   { label: 'Exhaustion 6',  dead: true },
  frightened:    { label: 'Frightened',    attackDisadvantage: true, abilityCheckDisadvantage: true },
  grappled:      { label: 'Grappled',      speedZero: true },
  incapacitated: { label: 'Incapacitated', cannotAct: true },
  invisible:     { label: 'Invisible',     grantAttackAdvantage: true, attacksAgainstDisadvantage: true },
  paralyzed:     { label: 'Paralyzed',     cannotAct: true, autoFailStrDex: true, grantsAdvantageToAttackers: true, critWithin5ft: true },
  petrified:     { label: 'Petrified',     cannotAct: true, autoFailStrDex: true, grantsAdvantageToAttackers: true, resistAllDamage: true },
  poisoned:      { label: 'Poisoned',      attackDisadvantage: true, skillDisadvantage: true },
  prone:         { label: 'Prone',         attackDisadvantage: true, grantsAdvantageToMeleeAttackers: true },
  restrained:    { label: 'Restrained',    speedZero: true, attackDisadvantage: true, grantsAdvantageToAttackers: true },
  stunned:       { label: 'Stunned',       cannotAct: true, autoFailStrDex: true, grantsAdvantageToAttackers: true },
  unconscious:   { label: 'Unconscious',   cannotAct: true, autoFailStrDex: true, grantsAdvantageToAttackers: true, critWithin5ft: true, prone: true },
};
