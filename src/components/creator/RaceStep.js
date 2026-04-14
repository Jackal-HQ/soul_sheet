import { useState, useEffect } from 'react';
import { fetchRaces, fetchRace } from '../../api/dndApi';
import useCharacterStore from '../../store/characterStore';
import { titleCase } from '../../utils/format';

const ABILITY_LABELS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

export default function RaceStep() {
  const [races, setRaces]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [detail, setDetail]             = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const selectedRaceId    = useCharacterStore(s => s.character.race.id);
  const setRace           = useCharacterStore(s => s.setRace);
  const setRacialFeatures = useCharacterStore(s => s.setRacialFeatures);

  useEffect(() => {
    fetchRaces()
      .then(setRaces)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Re-hydrate detail panel if a race was already selected (back navigation)
  useEffect(() => {
    if (!selectedRaceId) return;
    setDetailLoading(true);
    fetchRace(selectedRaceId)
      .then(r => { setDetail(r); })
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  }, [selectedRaceId]);

  function handleSelect(raceIndex) {
    if (raceIndex === selectedRaceId) return;
    setDetail(null);
    setDetailLoading(true);

    fetchRace(raceIndex).then(r => {
      // Build ability bonus map { dex: 2, int: 1, ... }
      const abilityBonuses = {};
      for (const ab of (r.ability_bonuses ?? [])) {
        abilityBonuses[ab.ability_score.index] = ab.bonus;
      }

      setRace({
        id:     r.index,
        name:   r.name,
        speed:  r.speed ?? 30,
        traits: (r.traits ?? []).map(t => ({ id: t.index, label: t.name })),
        languages: (r.languages ?? []).map(l => ({ id: l.index, label: l.name })),
        abilityBonuses,
      });

      // Store racial features so the sheet can display them
      setRacialFeatures(
        (r.traits ?? []).map(t => ({ id: t.index, label: t.name, category: 'racial' }))
      );

      setDetail(r);
      setDetailLoading(false);
    }).catch(console.error);
  }

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 style={{ marginBottom: '.35rem' }}>Choose a Race</h2>
      <p style={{ marginBottom: '1rem' }}>Your race grants traits, languages, and ability bonuses — applied automatically.</p>

      <div className="select-grid">
        {races.map(r => (
          <div
            key={r.index}
            className={`select-card${selectedRaceId === r.index ? ' selected' : ''}`}
            onClick={() => handleSelect(r.index)}
          >
            <div className="name">{r.name}</div>
          </div>
        ))}
      </div>

      {detailLoading && <div className="spinner" style={{ margin: '1.5rem auto' }} />}

      {detail && !detailLoading && (
        <div className="detail-panel">
          <div className="flex-between" style={{ marginBottom: '.75rem' }}>
            <h2>{detail.name}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>Speed {detail.speed} ft.</span>
          </div>

          {detail.ability_bonuses?.length > 0 && (
            <div style={{ marginBottom: '.75rem' }}>
              <h3 style={{ marginBottom: '.4rem' }}>Ability Bonuses (auto-applied)</h3>
              <div className="bonus-list">
                {detail.ability_bonuses.map(ab => (
                  <span key={ab.ability_score.index} className="bonus-pill">
                    +{ab.bonus} {ABILITY_LABELS[ab.ability_score.index] ?? ab.ability_score.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {detail.traits?.length > 0 && (
            <div style={{ marginBottom: '.75rem' }}>
              <h3 style={{ marginBottom: '.4rem' }}>Racial Traits</h3>
              <div className="tag-list">
                {detail.traits.map(t => <span key={t.index} className="tag">{t.name}</span>)}
              </div>
            </div>
          )}

          {detail.languages?.length > 0 && (
            <div style={{ marginBottom: detail.subraces?.length > 0 ? '.75rem' : 0 }}>
              <h3 style={{ marginBottom: '.4rem' }}>Languages</h3>
              <div className="tag-list">
                {detail.languages.map(l => <span key={l.index} className="tag">{l.name}</span>)}
              </div>
            </div>
          )}

          {detail.subraces?.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '.4rem' }}>Subraces</h3>
              <div className="tag-list">
                {detail.subraces.map(s => (
                  <span key={s.index} className="tag" style={{ color: 'var(--accent)' }}>
                    {titleCase(s.name)}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '.78rem', marginTop: '.4rem' }}>Subrace selection coming in a future update.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
