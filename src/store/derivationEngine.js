import { SKILLS, ABILITIES, PROFICIENCY_BONUS_BY_LEVEL, SPELLCASTING_ABILITY, CONDITIONS } from './constants';

// ─── Primitives ──────────────────────────────────────────────────────────────

export function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level) {
  return PROFICIENCY_BONUS_BY_LEVEL[level] ?? 2;
}

/**
 * Returns ability scores with racial bonuses applied.
 * All downstream calculations use these, never the raw base scores directly.
 */
export function getEffectiveAbilityScores(character) {
  const result = {};
  for (const a of ABILITIES) {
    result[a] = (character.abilityScores[a] ?? 10) + (character.race?.abilityBonuses?.[a] ?? 0);
  }
  return result;
}

// ─── Skill & Saving Throw Bonuses ────────────────────────────────────────────
// eff parameter is pre-computed effective scores from deriveAll — avoids O(n²) recomputation.

export function getSkillBonus(skillId, character, eff) {
  const effective = eff ?? getEffectiveAbilityScores(character);
  const { skillProficiencies, expertiseSkills, class: cls, overrides } = character;
  const skill     = SKILLS[skillId];
  const abilityMod = getModifier(effective[skill.ability]);
  const profBonus  = getProficiencyBonus(cls.level);

  let bonus = abilityMod;
  if (expertiseSkills.includes(skillId))       bonus += profBonus * 2;
  else if (skillProficiencies.includes(skillId)) bonus += profBonus;

  const overrideKey = `skill_${skillId}`;
  if (overrides[overrideKey] !== undefined) bonus += overrides[overrideKey];
  return bonus;
}

export function getSavingThrowBonus(abilityId, character, eff) {
  const effective = eff ?? getEffectiveAbilityScores(character);
  const { savingThrowProficiencies, class: cls, overrides } = character;
  const abilityMod = getModifier(effective[abilityId]);
  const profBonus  = getProficiencyBonus(cls.level);

  let bonus = abilityMod;
  if (savingThrowProficiencies.includes(abilityId)) bonus += profBonus;

  const overrideKey = `save_${abilityId}`;
  if (overrides[overrideKey] !== undefined) bonus += overrides[overrideKey];
  return bonus;
}

// ─── Combat Stats ────────────────────────────────────────────────────────────

export function getAC(character, eff) {
  const effective = eff ?? getEffectiveAbilityScores(character);
  return 10 + getModifier(effective.dex) + (character.overrides.ac ?? 0);
}

export function getInitiative(character, eff) {
  const effective = eff ?? getEffectiveAbilityScores(character);
  return getModifier(effective.dex) + (character.overrides.initiative ?? 0);
}

export function getSpeed(character) {
  let speed = (character.race?.speed ?? 30) + (character.overrides.speed ?? 0);
  const conds = character.conditionFlags ?? [];
  if (conds.some(c => CONDITIONS[c]?.speedZero))   return 0;
  if (conds.some(c => CONDITIONS[c]?.speedHalved))  return Math.floor(speed / 2);
  return speed;
}

export function getPassivePerception(character, eff) {
  return 10 + getSkillBonus('perception', character, eff);
}

// ─── Spellcasting ────────────────────────────────────────────────────────────

export function getSpellcastingAbility(character) {
  return SPELLCASTING_ABILITY[character.class.id] ?? null;
}

export function getSpellSaveDC(character, eff) {
  const spellAbility = getSpellcastingAbility(character);
  if (!spellAbility) return null;
  const effective  = eff ?? getEffectiveAbilityScores(character);
  const abilityMod = getModifier(effective[spellAbility]);
  const profBonus  = getProficiencyBonus(character.class.level);
  return 8 + profBonus + abilityMod + (character.overrides.spellSaveDC ?? 0);
}

export function getSpellAttackBonus(character, eff) {
  const spellAbility = getSpellcastingAbility(character);
  if (!spellAbility) return null;
  const effective  = eff ?? getEffectiveAbilityScores(character);
  const abilityMod = getModifier(effective[spellAbility]);
  const profBonus  = getProficiencyBonus(character.class.level);
  return profBonus + abilityMod + (character.overrides.spellAttackBonus ?? 0);
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export function getCarryCapacity(character, eff) {
  const effective = eff ?? getEffectiveAbilityScores(character);
  return effective.str * 15;
}

export function getCurrentWeight(character) {
  return character.inventory.reduce(
    (total, item) => total + (item.weight ?? 0) * (item.qty ?? 1),
    0
  );
}

// ─── Top-Level Deriver ───────────────────────────────────────────────────────

/**
 * Computes every derived value from source character data in a single pass.
 * Racial ability bonuses are applied here — never stored in the DB.
 * Called once after every mutation via _update in characterStore.
 */
export function deriveAll(character) {
  const effectiveAbilityScores = getEffectiveAbilityScores(character);
  const proficiencyBonus       = getProficiencyBonus(character.class.level);
  const activeConditions       = character.conditionFlags ?? [];
  const conditionEffects = {
    hasAttackDisadvantage:       activeConditions.some(c => CONDITIONS[c]?.attackDisadvantage),
    hasSkillDisadvantage:        activeConditions.some(c => CONDITIONS[c]?.skillDisadvantage),
    hasSaveDisadvantage:         activeConditions.some(c => CONDITIONS[c]?.saveDisadvantage),
    grantsAdvantageToAttackers:  activeConditions.some(c => CONDITIONS[c]?.grantsAdvantageToAttackers),
  };

  const modifiers = {};
  for (const a of ABILITIES) {
    modifiers[a] = getModifier(effectiveAbilityScores[a]);
  }

  const skills = {};
  for (const skillId of Object.keys(SKILLS)) {
    skills[skillId] = getSkillBonus(skillId, character, effectiveAbilityScores);
  }

  const savingThrows = {};
  for (const a of ABILITIES) {
    savingThrows[a] = getSavingThrowBonus(a, character, effectiveAbilityScores);
  }

  return {
    effectiveAbilityScores,
    proficiencyBonus,
    modifiers,
    skills,
    savingThrows,
    conditionEffects,
    ac:                  getAC(character, effectiveAbilityScores),
    initiative:          getInitiative(character, effectiveAbilityScores),
    speed:               getSpeed(character),
    passivePerception:   getPassivePerception(character, effectiveAbilityScores),
    spellSaveDC:         getSpellSaveDC(character, effectiveAbilityScores),
    spellAttackBonus:    getSpellAttackBonus(character, effectiveAbilityScores),
    spellcastingAbility: getSpellcastingAbility(character),
    carryCapacity:       getCarryCapacity(character, effectiveAbilityScores),
    currentWeight:       getCurrentWeight(character),
  };
}
