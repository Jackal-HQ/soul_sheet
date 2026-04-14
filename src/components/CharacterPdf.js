import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// ── Color tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#ffffff',
  surface:  '#f7f3ec',
  card:     '#f0ead8',
  border:   '#c8b98a',
  accent:   '#8b5e1a',
  accentLt: '#c8973e',
  text:     '#1a1207',
  muted:    '#5c4e32',
  light:    '#3d3120',
  success:  '#166534',
  danger:   '#991b1b',
  info:     '#1e3a5f',
  hdr:      '#2d1e0a',
  hdrText:  '#f5e6c8',
};

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: C.bg,
    padding: 28,
    fontSize: 8,
    color: C.text,
  },

  // Header
  header: {
    backgroundColor: C.hdr,
    borderRadius: 4,
    padding: '10 14',
    marginBottom: 8,
  },
  charName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.hdrText,
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    color: '#d4b88a',
    fontSize: 8,
  },
  metaValue: {
    color: C.hdrText,
    fontFamily: 'Helvetica-Bold',
  },

  // Two-column layout
  columns: {
    flexDirection: 'row',
    gap: 8,
  },
  leftCol: {
    width: 180,
    flexShrink: 0,
  },
  rightCol: {
    flex: 1,
  },

  // Section box
  section: {
    backgroundColor: C.surface,
    border: `1 solid ${C.border}`,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  sectionTitle: {
    backgroundColor: C.card,
    borderBottom: `1 solid ${C.border}`,
    padding: '4 8',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionBody: {
    padding: '5 8',
  },

  // Ability scores grid
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  abilityBox: {
    width: 52,
    backgroundColor: C.card,
    border: `1 solid ${C.border}`,
    borderRadius: 3,
    alignItems: 'center',
    padding: '4 2',
  },
  abilityLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  abilityMod: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.accent,
    lineHeight: 1,
    marginBottom: 2,
  },
  abilityScore: {
    fontSize: 7,
    color: C.light,
    backgroundColor: C.surface,
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  abilityBonus: {
    fontSize: 6,
    color: C.success,
    marginTop: 2,
  },

  // Stat rows (saves, skills)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    borderBottom: `0.5 solid #e8dfc8`,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    border: `1 solid ${C.border}`,
  },
  dotFilled: {
    backgroundColor: C.accentLt,
    border: `1 solid ${C.accentLt}`,
  },
  dotExpert: {
    backgroundColor: C.success,
    border: `1 solid ${C.success}`,
  },
  rowLabel: {
    flex: 1,
    color: C.light,
    fontSize: 7.5,
  },
  rowAbility: {
    fontSize: 6,
    color: C.muted,
    width: 18,
  },
  rowBonus: {
    fontFamily: 'Helvetica-Bold',
    color: C.accent,
    width: 20,
    textAlign: 'right',
    fontSize: 7.5,
  },

  // Combat grid
  combatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  combatBox: {
    flex: 1,
    minWidth: 48,
    backgroundColor: C.card,
    border: `1 solid ${C.border}`,
    borderRadius: 3,
    alignItems: 'center',
    padding: '4 3',
  },
  combatVal: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    lineHeight: 1,
    marginBottom: 2,
  },
  combatLbl: {
    fontSize: 5.5,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // HP display
  hpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  hpCurrent: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    lineHeight: 1,
  },
  hpSep: {
    fontSize: 12,
    color: C.muted,
  },
  hpMax: {
    fontSize: 12,
    color: C.muted,
  },

  // Feature rows
  featureRow: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderBottom: `0.5 solid #e8dfc8`,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-start',
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
    flexShrink: 0,
  },
  featureLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.light,
    flex: 1,
  },
  featureLvl: {
    fontSize: 6,
    color: C.muted,
  },

  // Inventory table
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    borderBottom: `0.5 solid #e8dfc8`,
    gap: 6,
  },
  invLabel: { flex: 1, fontSize: 7.5, color: C.light },
  invQty:   { width: 20, textAlign: 'center', fontSize: 7.5, color: C.muted },
  invWt:    { width: 36, textAlign: 'right', fontSize: 7.5, color: C.muted },

  // Spell slots
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 6,
    borderBottom: `0.5 solid #e8dfc8`,
  },
  slotLvl: { width: 36, fontSize: 7, color: C.muted },
  slotPips: { flexDirection: 'row', gap: 3, flex: 1 },
  pip: { width: 8, height: 8, borderRadius: 4, border: `1 solid ${C.accentLt}`, backgroundColor: C.accentLt },
  pipUsed: { backgroundColor: C.surface, border: `1 solid ${C.border}` },
  slotCount: { width: 24, textAlign: 'right', fontSize: 7, color: C.muted },

  // Spell list
  spellRow: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderBottom: `0.5 solid #e8dfc8`,
    flexDirection: 'row',
    gap: 4,
  },
  spellLvl:   { width: 12, fontSize: 7, color: C.muted, textAlign: 'center' },
  spellLabel: { flex: 1, fontSize: 7.5, color: C.light },

  // Full width divider
  divider: {
    height: 0.5,
    backgroundColor: C.border,
    marginVertical: 6,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return n >= 0 ? `+${n}` : String(n);
}

function SectionBox({ title, children }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

// ── Main PDF Component ────────────────────────────────────────────────────────

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
const ABILITY_NAMES  = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };

export default function CharacterPdf({ character, derived }) {
  const { meta, race, class: cls, abilityScores, hp, inventory, spells, feats } = character;
  const { effectiveAbilityScores, modifiers, savingThrows, skills, proficiencyBonus,
          ac, initiative, speed, passivePerception,
          spellSaveDC, spellAttackBonus, spellcastingAbility, carryCapacity, currentWeight } = derived;

  const SKILLS_LIST = [
    ['acrobatics','dex'],['animalHandling','wis'],['arcana','int'],['athletics','str'],
    ['deception','cha'],['history','int'],['insight','wis'],['intimidation','cha'],
    ['investigation','int'],['medicine','wis'],['nature','int'],['perception','wis'],
    ['performance','cha'],['persuasion','cha'],['religion','int'],['sleightOfHand','dex'],
    ['stealth','dex'],['survival','wis'],
  ];
  const SKILL_LABELS = {
    acrobatics:'Acrobatics', animalHandling:'Animal Handling', arcana:'Arcana',
    athletics:'Athletics', deception:'Deception', history:'History', insight:'Insight',
    intimidation:'Intimidation', investigation:'Investigation', medicine:'Medicine',
    nature:'Nature', perception:'Perception', performance:'Performance',
    persuasion:'Persuasion', religion:'Religion', sleightOfHand:'Sleight of Hand',
    stealth:'Stealth', survival:'Survival',
  };

  const isSpellcaster = !!spellcastingAbility;
  const slotLevels = Object.keys(spells.slots).map(Number).sort();

  return (
    <Document title={meta.name || 'Character Sheet'} author="Soul Sheet">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.charName}>{meta.name || 'Unnamed Character'}</Text>
          <View style={s.headerMeta}>
            {race.name && (
              <Text style={s.metaItem}>Race  <Text style={s.metaValue}>{race.name}</Text></Text>
            )}
            {cls.name && (
              <Text style={s.metaItem}>Class  <Text style={s.metaValue}>{cls.name} {cls.level}</Text></Text>
            )}
            {meta.background && (
              <Text style={s.metaItem}>Background  <Text style={s.metaValue}>{meta.background}</Text></Text>
            )}
            {meta.alignment && (
              <Text style={s.metaItem}>Alignment  <Text style={s.metaValue}>{meta.alignment}</Text></Text>
            )}
            {meta.campaign && (
              <Text style={s.metaItem}>Campaign  <Text style={s.metaValue}>{meta.campaign}</Text></Text>
            )}
            <Text style={s.metaItem}>Prof Bonus  <Text style={s.metaValue}>+{proficiencyBonus}</Text></Text>
          </View>
        </View>

        {/* ── Two-column body ── */}
        <View style={s.columns}>

          {/* ── Left column ── */}
          <View style={s.leftCol}>

            {/* Ability Scores */}
            <SectionBox title="Ability Scores">
              <View style={s.abilityGrid}>
                {ABILITIES.map(a => {
                  const base  = abilityScores[a] ?? 10;
                  const eff   = effectiveAbilityScores[a] ?? 10;
                  const bonus = eff - base;
                  return (
                    <View key={a} style={s.abilityBox}>
                      <Text style={s.abilityLabel}>{ABILITY_LABELS[a]}</Text>
                      <Text style={s.abilityMod}>{fmt(modifiers[a])}</Text>
                      <Text style={s.abilityScore}>{eff}</Text>
                      {bonus !== 0 && (
                        <Text style={s.abilityBonus}>{base}{bonus > 0 ? '+' : ''}{bonus}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </SectionBox>

            {/* Saving Throws */}
            <SectionBox title="Saving Throws">
              {ABILITIES.map(a => {
                const prof = character.savingThrowProficiencies.includes(a);
                return (
                  <View key={a} style={s.row}>
                    <View style={[s.dot, prof && s.dotFilled]} />
                    <Text style={s.rowLabel}>{ABILITY_NAMES[a]}</Text>
                    <Text style={s.rowBonus}>{fmt(savingThrows[a])}</Text>
                  </View>
                );
              })}
            </SectionBox>

            {/* Skills */}
            <SectionBox title="Skills">
              {SKILLS_LIST.map(([id, _ab]) => {
                const prof   = character.skillProficiencies.includes(id);
                const expert = character.expertiseSkills.includes(id);
                const ab     = _ab.toUpperCase();
                return (
                  <View key={id} style={s.row}>
                    <View style={[s.dot, expert ? s.dotExpert : prof ? s.dotFilled : {}]} />
                    <Text style={s.rowAbility}>{ab}</Text>
                    <Text style={s.rowLabel}>{SKILL_LABELS[id]}</Text>
                    <Text style={s.rowBonus}>{fmt(skills[id])}</Text>
                  </View>
                );
              })}
            </SectionBox>

          </View>

          {/* ── Right column ── */}
          <View style={s.rightCol}>

            {/* Combat Stats */}
            <SectionBox title="Combat">
              <View style={s.combatGrid}>
                <View style={s.combatBox}>
                  <Text style={s.combatVal}>{ac}</Text>
                  <Text style={s.combatLbl}>AC</Text>
                </View>
                <View style={s.combatBox}>
                  <Text style={s.combatVal}>{fmt(initiative)}</Text>
                  <Text style={s.combatLbl}>Initiative</Text>
                </View>
                <View style={s.combatBox}>
                  <Text style={s.combatVal}>{speed}</Text>
                  <Text style={s.combatLbl}>Speed</Text>
                </View>
                <View style={s.combatBox}>
                  <Text style={s.combatVal}>{passivePerception}</Text>
                  <Text style={s.combatLbl}>Passive Perc.</Text>
                </View>
                {isSpellcaster && spellSaveDC != null && (
                  <View style={s.combatBox}>
                    <Text style={s.combatVal}>{spellSaveDC}</Text>
                    <Text style={s.combatLbl}>Spell DC</Text>
                  </View>
                )}
                {isSpellcaster && spellAttackBonus != null && (
                  <View style={s.combatBox}>
                    <Text style={s.combatVal}>{fmt(spellAttackBonus)}</Text>
                    <Text style={s.combatLbl}>Spell Atk</Text>
                  </View>
                )}
              </View>
            </SectionBox>

            {/* HP */}
            <SectionBox title="Hit Points">
              <View style={s.hpRow}>
                <Text style={s.hpCurrent}>{hp.current}</Text>
                <Text style={s.hpSep}>/</Text>
                <Text style={s.hpMax}>{hp.max}</Text>
                {hp.temp > 0 && (
                  <Text style={{ fontSize: 8, color: C.info, marginLeft: 6 }}>+{hp.temp} temp</Text>
                )}
              </View>
              <Text style={{ fontSize: 7, color: C.muted }}>
                Hit Dice: {cls.hitDice}  ·  Max: {hp.max}
              </Text>
            </SectionBox>

            {/* Features — Racial */}
            {character.features.racial.length > 0 && (
              <SectionBox title={`${race.name || 'Racial'} Traits`}>
                {character.features.racial.map(f => (
                  <View key={f.id} style={s.featureRow}>
                    <View style={[s.featureDot, { backgroundColor: C.info }]} />
                    <Text style={s.featureLabel}>{f.label}</Text>
                  </View>
                ))}
              </SectionBox>
            )}

            {/* Features — Class */}
            {character.features.class.length > 0 && (
              <SectionBox title={`${cls.name || 'Class'} Features (Level ${cls.level})`}>
                {character.features.class.map(f => (
                  <View key={`${f.id}-${f.level}`} style={s.featureRow}>
                    <View style={[s.featureDot, { backgroundColor: C.accentLt }]} />
                    <Text style={s.featureLabel}>{f.label}</Text>
                    <Text style={s.featureLvl}>Lv {f.level}</Text>
                  </View>
                ))}
              </SectionBox>
            )}

            {/* Feats */}
            {feats.length > 0 && (
              <SectionBox title="Feats">
                {feats.map(f => (
                  <View key={f.id} style={s.featureRow}>
                    <View style={[s.featureDot, { backgroundColor: C.success }]} />
                    <Text style={s.featureLabel}>{f.label}</Text>
                  </View>
                ))}
              </SectionBox>
            )}

          </View>
        </View>

        {/* ── Inventory ── */}
        {inventory.length > 0 && (
          <>
            <View style={s.divider} />
            <SectionBox title={`Inventory — ${currentWeight.toFixed(1)} / ${carryCapacity} lb`}>
              <View style={{ flexDirection: 'row', paddingBottom: 3, borderBottom: `1 solid ${C.border}`, marginBottom: 2 }}>
                <Text style={[s.invLabel, { fontFamily: 'Helvetica-Bold', color: C.muted, fontSize: 6.5 }]}>Item</Text>
                <Text style={[s.invQty,  { fontFamily: 'Helvetica-Bold', color: C.muted, fontSize: 6.5 }]}>Qty</Text>
                <Text style={[s.invWt,   { fontFamily: 'Helvetica-Bold', color: C.muted, fontSize: 6.5 }]}>Weight</Text>
              </View>
              {inventory.map((item, i) => (
                <View key={`${item.item_id}-${i}`} style={s.invRow}>
                  <Text style={s.invLabel}>{item.label}</Text>
                  <Text style={s.invQty}>{item.qty ?? 1}</Text>
                  <Text style={s.invWt}>{((item.weight ?? 0) * (item.qty ?? 1)).toFixed(1)} lb</Text>
                </View>
              ))}
            </SectionBox>
          </>
        )}

        {/* ── Spells ── */}
        {isSpellcaster && (spells.known.length > 0 || slotLevels.length > 0) && (
          <>
            <View style={s.divider} />
            <SectionBox title={`Spells — ${spellcastingAbility?.toUpperCase()} · DC ${spellSaveDC} · Atk ${fmt(spellAttackBonus)}`}>
              {/* Spell Slots */}
              {slotLevels.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                    Spell Slots
                  </Text>
                  {slotLevels.map(lvl => {
                    const slot      = spells.slots[String(lvl)];
                    const available = slot.max - slot.used;
                    return (
                      <View key={lvl} style={s.slotRow}>
                        <Text style={s.slotLvl}>Level {lvl}</Text>
                        <View style={s.slotPips}>
                          {Array.from({ length: slot.max }).map((_, i) => (
                            <View key={i} style={[s.pip, i >= available && s.pipUsed]} />
                          ))}
                        </View>
                        <Text style={s.slotCount}>{available}/{slot.max}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Known Spells */}
              {spells.known.length > 0 && (
                <View>
                  <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                    Known Spells ({spells.known.length})
                  </Text>
                  {[...spells.known]
                    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
                    .map(spell => (
                      <View key={spell.id} style={s.spellRow}>
                        <Text style={s.spellLvl}>{spell.level === 0 ? 'C' : `L${spell.level}`}</Text>
                        <Text style={s.spellLabel}>{spell.label}</Text>
                      </View>
                    ))
                  }
                </View>
              )}
            </SectionBox>
          </>
        )}

      </Page>
    </Document>
  );
}
