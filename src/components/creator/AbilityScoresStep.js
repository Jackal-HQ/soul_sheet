import { useState } from 'react';
import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';
import { getModifier } from '../../store/derivationEngine';
import { SKILLS } from '../../store/constants';
import { fetchFeats, fetchFeat } from '../../api/dndApi';

const ABILITIES = [
  { id: 'str', label: 'Strength' },
  { id: 'dex', label: 'Dexterity' },
  { id: 'con', label: 'Constitution' },
  { id: 'int', label: 'Intelligence' },
  { id: 'wis', label: 'Wisdom' },
  { id: 'cha', label: 'Charisma' },
];

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export default function AbilityScoresStep() {
  const abilityScores          = useCharacterStore(s => s.character.abilityScores);
  const abilityBonuses         = useCharacterStore(s => s.character.race.abilityBonuses);
  const effectiveAbilityScores = useCharacterStore(s => s.derived.effectiveAbilityScores);
  const character              = useCharacterStore(s => s.character);
  const derived                = useCharacterStore(s => s.derived);
  const classFeatures          = useCharacterStore(s => s.character.features.class);
  const feats                  = useCharacterStore(s => s.character.feats);
  const setAbilityScore        = useCharacterStore(s => s.setAbilityScore);
  const setHP                  = useCharacterStore(s => s.setHP);
  const addFeat                = useCharacterStore(s => s.addFeat);
  const removeFeat             = useCharacterStore(s => s.removeFeat);
  const hp                     = useCharacterStore(s => s.character.hp);

  const suggestedHP = character.class.hitDieMax + derived.modifiers.con;
  const hasRaceBonuses = Object.values(abilityBonuses ?? {}).some(v => v !== 0);

  // Count ASI opportunities from class features
  const asiCount = classFeatures.filter(f => f.label === 'Ability Score Improvement').length;

  function applyStandardArray() {
    STANDARD_ARRAY.forEach((val, i) => setAbilityScore(ABILITIES[i].id, val));
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '.35rem' }}>
        <h2>Ability Scores</h2>
        <button className="btn btn-ghost btn-sm" onClick={applyStandardArray}>
          Standard Array
        </button>
      </div>
      <p style={{ marginBottom: '1.5rem' }}>
        Enter your base scores — racial bonuses are applied automatically.
        {hasRaceBonuses && (
          <span style={{ color: 'var(--success)' }}> Racial bonuses shown in green below.</span>
        )}
      </p>

      <div className="grid-6" style={{ marginBottom: '1.5rem' }}>
        {ABILITIES.map(({ id, label }) => {
          const base      = abilityScores[id];
          const bonus     = abilityBonuses?.[id] ?? 0;
          const effective = effectiveAbilityScores[id];
          const mod       = getModifier(effective);

          return (
            <div key={id} className="ability-input-box">
              <label>{label.slice(0, 3).toUpperCase()}</label>
              <input
                type="number"
                min="1"
                max="20"
                value={base}
                onChange={e => setAbilityScore(id, e.target.value)}
              />
              {bonus !== 0 && (
                <span className="bonus-hint" style={{ color: bonus > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {bonus > 0 ? '+' : ''}{bonus} → {effective}
                </span>
              )}
              <span className="modifier-hint">{formatModifier(mod)}</span>
            </div>
          );
        })}
      </div>

      <div className="divider" />

      {/* HP */}
      <div style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '.75rem' }}>Starting Hit Points</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Maximum HP</label>
            <input
              className="input"
              type="number"
              min="1"
              placeholder={suggestedHP > 0 ? String(suggestedHP) : 'Enter HP'}
              value={hp.max > 0 ? hp.max : ''}
              onChange={e => {
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n) && n > 0) { setHP('max', n); setHP('current', n); }
              }}
            />
          </div>
          {suggestedHP > 0 && character.class.id && (
            <div style={{ paddingTop: '1.1rem' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setHP('max', suggestedHP); setHP('current', suggestedHP); }}
              >
                Use suggested: {suggestedHP}
              </button>
              <p style={{ fontSize: '.75rem', marginTop: '.3rem' }}>
                {character.class.hitDice} max + CON mod ({formatModifier(derived.modifiers.con)})
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      {/* Skill proficiency picker */}
      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <SkillProficiencyPicker />
      </div>

      {/* Feat / ASI picker — only shown when class has ASI opportunities */}
      {asiCount > 0 && (
        <>
          <div className="divider" />
          <div style={{ marginTop: '1.5rem' }}>
            <FeatPicker
              asiCount={asiCount}
              feats={feats}
              addFeat={addFeat}
              removeFeat={removeFeat}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Skill Proficiency Picker ──────────────────────────────────────────────────

function SkillProficiencyPicker() {
  const skillProficiencies     = useCharacterStore(s => s.character.skillProficiencies);
  const expertiseSkills        = useCharacterStore(s => s.character.expertiseSkills);
  const derived                = useCharacterStore(s => s.derived);
  const skillChoiceCount       = useCharacterStore(s => s.character.class.skillChoiceCount);
  const allowedSkillIds        = useCharacterStore(s => s.character.class.allowedSkillIds);
  const toggleSkillProficiency = useCharacterStore(s => s.toggleSkillProficiency);
  const toggleExpertise        = useCharacterStore(s => s.toggleExpertise);
  const className              = useCharacterStore(s => s.character.class.name);

  const pickedCount = skillProficiencies.filter(s =>
    allowedSkillIds.length === 0 || allowedSkillIds.includes(s)
  ).length;
  const atLimit = pickedCount >= skillChoiceCount;

  const skillEntries = Object.entries(SKILLS);

  return (
    <>
      <div className="flex-between" style={{ marginBottom: '.75rem' }}>
        <h3>Skill Proficiencies</h3>
        {className && (
          <span style={{ fontSize: '.8rem', color: atLimit ? 'var(--warning)' : 'var(--text-muted)' }}>
            {pickedCount} / {skillChoiceCount} selected
            {allowedSkillIds.length > 0 && ' (class skills only)'}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.3rem .75rem' }}>
        {skillEntries.map(([skillId, def]) => {
          const prof      = skillProficiencies.includes(skillId);
          const expert    = expertiseSkills.includes(skillId);
          const inAllowed = allowedSkillIds.length === 0 || allowedSkillIds.includes(skillId);
          const disabled  = !prof && (!inAllowed || atLimit);

          return (
            <div
              key={skillId}
              className="stat-row"
              style={{
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? .4 : 1,
                userSelect: 'none',
              }}
              onClick={() => { if (!disabled || prof) toggleSkillProficiency(skillId); }}
            >
              <div className={`prof-dot${expert ? ' expertise' : prof ? ' proficient' : ''}`} />
              <span className="ability-tag" style={{ fontSize: '.72rem' }}>
                {def.ability.toUpperCase()}
              </span>
              <span className="row-label" style={{ fontSize: '.82rem' }}>
                {def.label}
              </span>
              <span className="bonus" style={{ fontSize: '.82rem' }}>
                {formatModifier(derived.skills[skillId])}
              </span>
              {prof && !expert && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '.1rem .4rem', fontSize: '.7rem', marginLeft: '.25rem' }}
                  onClick={e => { e.stopPropagation(); toggleExpertise(skillId); }}
                  title="Add expertise (double proficiency)"
                >2×</button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Feat Picker ───────────────────────────────────────────────────────────────

function FeatPicker({ asiCount, feats, addFeat, removeFeat }) {
  const [featList, setFeatList]     = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch]         = useState('');
  const [open, setOpen]             = useState(false);
  const [details, setDetails]       = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [loadingId, setLoadingId]   = useState(null);

  const chosenIds = new Set(feats.map(f => f.id));

  function openPicker() {
    setOpen(true);
    if (featList.length === 0) {
      setListLoading(true);
      fetchFeats()
        .then(setFeatList)
        .catch(console.error)
        .finally(() => setListLoading(false));
    }
  }

  function toggleExpand(feat) {
    if (expandedId === feat.index) { setExpandedId(null); return; }
    setExpandedId(feat.index);
    if (!details[feat.index]) {
      setLoadingId(feat.index);
      fetchFeat(feat.index)
        .then(d => setDetails(prev => ({ ...prev, [feat.index]: d })))
        .catch(console.error)
        .finally(() => setLoadingId(null));
    }
  }

  const filtered = search.trim()
    ? featList.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : featList;

  return (
    <>
      <div className="flex-between" style={{ marginBottom: '.75rem' }}>
        <h3>Feats &amp; Ability Score Improvements</h3>
        <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
          {asiCount} ASI{asiCount !== 1 ? 's' : ''} earned · {feats.length} feat{feats.length !== 1 ? 's' : ''} chosen
        </span>
      </div>

      <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '.75rem' }}>
        Use your ASIs to increase ability scores directly above, or spend one on a feat below.
      </p>

      {/* Chosen feats */}
      {feats.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem', marginBottom: '.75rem' }}>
          {feats.map(f => (
            <div
              key={f.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '.4rem .75rem', fontSize: '.85rem',
              }}
            >
              <span style={{ flex: 1, color: 'var(--accent)', fontWeight: 600 }}>{f.label}</span>
              <button
                className="btn btn-danger btn-sm"
                style={{ padding: '.1rem .4rem', fontSize: '.7rem', lineHeight: 1 }}
                onClick={() => removeFeat(f.id)}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {!open ? (
        <button className="btn btn-ghost btn-sm" onClick={openPicker}>Browse Feats</button>
      ) : (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1rem',
        }}>
          <div className="flex-between" style={{ marginBottom: '.6rem' }}>
            <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              SRD Feats {listLoading && <span style={{ color: 'var(--accent)' }}>Loading…</span>}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Close</button>
          </div>

          <input
            className="input"
            placeholder="Search feats…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '.6rem' }}
          />

          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
            {filtered.map(feat => {
              const chosen   = chosenIds.has(feat.index);
              const detail   = details[feat.index];
              const expanded = expandedId === feat.index;

              return (
                <div
                  key={feat.index}
                  style={{
                    background: 'var(--card)',
                    border: `1px solid ${expanded ? 'var(--accent-dim)' : 'var(--border)'}`,
                    borderRadius: 6, overflow: 'hidden',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .75rem', cursor: 'pointer' }}
                    onClick={() => toggleExpand(feat)}
                  >
                    <span style={{ flex: 1, fontSize: '.83rem', color: 'var(--text-light)' }}>{feat.name}</span>
                    {chosen
                      ? <span style={{ fontSize: '.7rem', color: 'var(--success)' }}>✓ Chosen</span>
                      : (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '.1rem .4rem', fontSize: '.7rem', lineHeight: 1 }}
                          onClick={e => {
                            e.stopPropagation();
                            addFeat({ id: feat.index, label: feat.name });
                          }}
                        >+ Take</button>
                      )
                    }
                    <span style={{ fontSize: '.65rem', color: 'var(--text-muted)' }}>{expanded ? '▲' : '▼'}</span>
                  </div>

                  {expanded && (
                    <div style={{ padding: '.5rem .75rem', borderTop: '1px solid var(--border)', fontSize: '.8rem' }}>
                      {loadingId === feat.index
                        ? <div className="spinner" style={{ width: 20, height: 20, margin: '.4rem auto', borderWidth: 2 }} />
                        : detail
                          ? (
                            <>
                              {detail.prerequisites?.length > 0 && (
                                <p style={{ fontSize: '.76rem', color: 'var(--warning)', marginBottom: '.3rem' }}>
                                  Prerequisites: {detail.prerequisites.map(p => p.minimum_score
                                    ? `${p.ability_score?.name} ${p.minimum_score}+`
                                    : p.proficiency?.name ?? p.spell?.name ?? ''
                                  ).join(', ')}
                                </p>
                              )}
                              {detail.desc?.map((para, i) => (
                                <p key={i} style={{ fontSize: '.78rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: i < detail.desc.length - 1 ? '.35rem' : 0 }}>
                                  {para}
                                </p>
                              ))}
                            </>
                          )
                          : null
                      }
                    </div>
                  )}
                </div>
              );
            })}
            {!listLoading && filtered.length === 0 && (
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No feats match.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
