import { useState, useEffect, useCallback } from 'react';
import { fetchClasses, fetchClass, fetchAllClassLevels } from '../../api/dndApi';
import useCharacterStore from '../../store/characterStore';

// Strip "skill-" prefix from API indices to match our SKILLS keys
function apiSkillToId(index) {
  return index.replace(/^skill-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Convert API spellcasting table to our slot format { '1': { max, used }, ... }
function buildSpellSlots(spellcasting) {
  if (!spellcasting) return {};
  const slots = {};
  for (let lvl = 1; lvl <= 9; lvl++) {
    const max = spellcasting[`spell_slots_level_${lvl}`] ?? 0;
    if (max > 0) slots[String(lvl)] = { max, used: 0 };
  }
  return slots;
}

export default function ClassStep() {
  const [classes, setClasses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [detail, setDetail]           = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [allLevels, setAllLevels]     = useState([]);   // all 20 level objects for current class
  const [levelLoading, setLevelLoading]   = useState(false);

  const selectedClassId            = useCharacterStore(s => s.character.class.id);
  const level                      = useCharacterStore(s => s.character.class.level);
  const derived                    = useCharacterStore(s => s.derived);
  const setClass                   = useCharacterStore(s => s.setClass);
  const setLevel                   = useCharacterStore(s => s.setLevel);
  const setClassProficiencyChoices  = useCharacterStore(s => s.setClassProficiencyChoices);
  const setClassFeatures           = useCharacterStore(s => s.setClassFeatures);
  const setSpellSlots              = useCharacterStore(s => s.setSpellSlots);

  useEffect(() => {
    fetchClasses()
      .then(setClasses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Re-hydrate class detail on back navigation
  useEffect(() => {
    if (!selectedClassId) return;
    setDetailLoading(true);
    fetchClass(selectedClassId)
      .then(d => { setDetail(d); applyProficiencyChoices(d); })
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  // Fetch all level data for the class once (cached by browser)
  useEffect(() => {
    if (!selectedClassId) return;
    setLevelLoading(true);
    fetchAllClassLevels(selectedClassId)
      .then(setAllLevels)
      .catch(console.error)
      .finally(() => setLevelLoading(false));
  }, [selectedClassId]);

  // Recompute features + spell slots whenever level or allLevels changes
  const applyLevelData = useCallback((lvl, levels) => {
    if (levels.length === 0) return;

    // Aggregate features for levels 1 through lvl
    const features = [];
    for (const ld of levels) {
      if (ld.level > lvl) continue;
      for (const f of ld.features ?? []) {
        features.push({ id: f.index, label: f.name, level: ld.level, category: 'class' });
      }
    }
    setClassFeatures(features);

    // Spell slots at the current level
    const currentLd = levels.find(l => l.level === lvl);
    if (currentLd?.spellcasting) {
      const slots = buildSpellSlots(currentLd.spellcasting);
      if (Object.keys(slots).length > 0) setSpellSlots(slots);
    }
  }, [setClassFeatures, setSpellSlots]);

  useEffect(() => {
    applyLevelData(level, allLevels);
  }, [level, allLevels, applyLevelData]);

  function applyProficiencyChoices(classDetail) {
    const skillGroup = classDetail.proficiency_choices?.find(pc =>
      pc.from?.options?.some(o => o.item?.index?.startsWith('skill-'))
    );
    if (!skillGroup) return;

    const count      = skillGroup.choose ?? 2;
    const allowedIds = (skillGroup.from?.options ?? [])
      .filter(o => o.item?.index?.startsWith('skill-'))
      .map(o => apiSkillToId(o.item.index));

    setClassProficiencyChoices({ skillChoiceCount: count, allowedSkillIds: allowedIds });
  }

  function handleSelect(cls) {
    if (cls.index === selectedClassId) return;
    setDetail(null);
    setAllLevels([]);
    setDetailLoading(true);

    fetchClass(cls.index).then(d => {
      setClass({ id: d.index, name: d.name });
      applyProficiencyChoices(d);
      setDetail(d);
      setDetailLoading(false);
    }).catch(console.error);
  }

  // Count ASI opportunities earned at current level (for AbilityScoresStep to use)
  const asiCount = allLevels
    .filter(l => l.level <= level)
    .reduce((sum, l) => sum + (l.features ?? []).filter(f => f.name === 'Ability Score Improvement').length, 0);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 style={{ marginBottom: '.35rem' }}>Choose a Class</h2>
      <p style={{ marginBottom: '1rem' }}>Your class determines your hit dice, saving throws, skill picks, and features per level.</p>

      <div className="select-grid">
        {classes.map(cls => (
          <div
            key={cls.index}
            className={`select-card${selectedClassId === cls.index ? ' selected' : ''}`}
            onClick={() => handleSelect(cls)}
          >
            <div className="name">{cls.name}</div>
          </div>
        ))}
      </div>

      {detailLoading && <div className="spinner" style={{ margin: '1.5rem auto' }} />}

      {detail && !detailLoading && (
        <div className="detail-panel">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div>
              <h2>{detail.name}</h2>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '.4rem' }}>
                <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>
                  Hit Die: <strong style={{ color: 'var(--accent)' }}>{detail.hit_die ? `d${detail.hit_die}` : '—'}</strong>
                </span>
                <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>
                  Prof Bonus: <strong style={{ color: 'var(--accent)' }}>+{derived.proficiencyBonus}</strong>
                </span>
                {asiCount > 0 && (
                  <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>
                    ASIs: <strong style={{ color: 'var(--accent)' }}>{asiCount}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Level selector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem' }}>
              <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Level {levelLoading && <span style={{ color: 'var(--accent)' }}>…</span>}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setLevel(Math.max(1, level - 1))}
                  disabled={level <= 1}
                  style={{ padding: '.25rem .6rem', fontSize: '1rem' }}
                >−</button>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', minWidth: '2rem', textAlign: 'center' }}>{level}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setLevel(Math.min(20, level + 1))}
                  disabled={level >= 20}
                  style={{ padding: '.25rem .6rem', fontSize: '1rem' }}
                >+</button>
              </div>
            </div>
          </div>

          {detail.saving_throws?.length > 0 && (
            <div style={{ marginBottom: '.75rem' }}>
              <h3 style={{ marginBottom: '.4rem' }}>Saving Throw Proficiencies</h3>
              <div className="tag-list">
                {detail.saving_throws.map(st => (
                  <span key={st.index} className="tag" style={{ color: 'var(--accent)' }}>{st.name}</span>
                ))}
              </div>
            </div>
          )}

          {detail.proficiency_choices?.map((pc, i) => {
            const isSkill = pc.from?.options?.some(o => o.item?.index?.startsWith('skill-'));
            if (!isSkill) return null;
            return (
              <div key={i}>
                <h3 style={{ marginBottom: '.4rem' }}>
                  Skill Proficiencies — Choose {pc.choose}
                </h3>
                <div className="tag-list">
                  {pc.from.options.map(o => (
                    <span key={o.item.index} className="tag">{o.item.name.replace('Skill: ', '')}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
