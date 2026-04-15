import { useState } from 'react';
import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';
import useUIStore from '../../store/uiStore';

export default function CombatStats() {
  const derived          = useCharacterStore(s => s.derived);
  const hp               = useCharacterStore(s => s.character.hp);
  const deathSaves       = useCharacterStore(s => s.character.deathSaves);
  const conditionEffects = useCharacterStore(s => s.derived.conditionEffects);
  const roll             = useUIStore(s => s.roll);

  const applyDamage     = useCharacterStore(s => s.applyDamage);
  const heal            = useCharacterStore(s => s.heal);
  const setHP           = useCharacterStore(s => s.setHP);
  const addDeathSave    = useCharacterStore(s => s.addDeathSave);
  const resetDeathSaves = useCharacterStore(s => s.resetDeathSaves);

  const [dmgInput,  setDmgInput]  = useState('');
  const [healInput, setHealInput] = useState('');

  const pct      = hp.max > 0 ? (hp.current / hp.max) * 100 : 0;
  const barClass = pct <= 25 ? 'critical' : pct <= 50 ? 'low' : '';
  const hasAttackDisadv = conditionEffects?.hasAttackDisadvantage ?? false;

  function commit(action) {
    const n = parseInt(action === 'dmg' ? dmgInput : healInput, 10);
    if (isNaN(n) || n <= 0) return;
    if (action === 'dmg') { applyDamage(n); setDmgInput(''); }
    else                  { heal(n); setHealInput(''); }
  }

  return (
    <div>
      {/* Top stats */}
      <div className="sheet-section">
        <div className="flex-between" style={{ marginBottom: '.6rem' }}>
          <div className="sheet-section-title" style={{ marginBottom: 0 }}>Combat</div>
          {hasAttackDisadv && (
            <span style={{
              fontSize: '.65rem', fontWeight: 700, color: 'var(--danger)',
              textTransform: 'uppercase', letterSpacing: '.06em',
              background: 'rgba(248,113,113,.12)', border: '1px solid var(--danger)',
              borderRadius: 4, padding: '.1rem .4rem',
            }}>
              Atk Disadv.
            </span>
          )}
        </div>
        <div className="combat-grid">
          <div className="combat-box">
            <div className="val">{derived.proficiencyBonus >= 0 ? `+${derived.proficiencyBonus}` : derived.proficiencyBonus}</div>
            <div className="lbl">Proficiency</div>
          </div>
          <div className="combat-box">
            <div className="val">{derived.ac}</div>
            <div className="lbl">Armor Class</div>
          </div>
          <div
            className="combat-box"
            style={{ cursor: 'pointer' }}
            title={`Roll Initiative (${formatModifier(derived.initiative)})${hasAttackDisadv ? ' — Disadvantage' : ''}`}
            onClick={() => roll({ label: 'Initiative', bonus: derived.initiative, disadvantage: hasAttackDisadv })}
          >
            <div className="val">{formatModifier(derived.initiative)}</div>
            <div className="lbl">Initiative 🎲</div>
          </div>
          <div className="combat-box">
            <div className="val">{derived.speed}</div>
            <div className="lbl">Speed (ft)</div>
          </div>
          <div className="combat-box">
            <div className="val">{derived.passivePerception}</div>
            <div className="lbl">Passive Perc.</div>
          </div>
          {derived.spellSaveDC !== null && (
            <div className="combat-box">
              <div className="val">{derived.spellSaveDC}</div>
              <div className="lbl">Spell Save DC</div>
            </div>
          )}
          {derived.spellAttackBonus !== null && (
            <div
              className="combat-box"
              style={{ cursor: 'pointer' }}
              title={`Roll Spell Attack (${formatModifier(derived.spellAttackBonus)})${hasAttackDisadv ? ' — Disadvantage' : ''}`}
              onClick={() => roll({ label: 'Spell Attack', bonus: derived.spellAttackBonus, disadvantage: hasAttackDisadv })}
            >
              <div className="val">{formatModifier(derived.spellAttackBonus)}</div>
              <div className="lbl">Spell Atk 🎲</div>
            </div>
          )}
        </div>
      </div>

      {/* HP Tracker */}
      <div className="sheet-section">
        <div className="sheet-section-title">Hit Points</div>
        <div className="hp-tracker">
          <div className="hp-display">
            <span className="hp-current">{hp.current}</span>
            <span className="hp-sep">/</span>
            <span className="hp-max">{hp.max}</span>
            {hp.temp > 0 && (
              <span className="hp-temp">+{hp.temp} temp</span>
            )}
          </div>

          <div className="hp-bar">
            <div
              className={`hp-bar-fill ${barClass}`}
              style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
            />
          </div>

          <div className="hp-controls" style={{ marginBottom: '.5rem' }}>
            <input
              type="number"
              min="1"
              placeholder="Damage"
              value={dmgInput}
              onChange={e => setDmgInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commit('dmg')}
            />
            <button className="btn btn-danger btn-sm" onClick={() => commit('dmg')}>Apply</button>
          </div>

          <div className="hp-controls" style={{ marginBottom: '.5rem' }}>
            <input
              type="number"
              min="1"
              placeholder="Heal"
              value={healInput}
              onChange={e => setHealInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commit('heal')}
            />
            <button className="btn btn-primary btn-sm" onClick={() => commit('heal')}>Heal</button>
          </div>

          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setHP('current', hp.max); resetDeathSaves(); }}>
              Full Rest
            </button>
            <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '.4rem' }}>
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Temp HP:</span>
              <input
                type="number"
                min="0"
                value={hp.temp || ''}
                placeholder="0"
                onChange={e => setHP('temp', Math.max(0, Number(e.target.value)))}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '.25rem .4rem', width: 60, textAlign: 'center' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Death Saves */}
      {hp.current === 0 && (
        <div className="sheet-section">
          <div className="sheet-section-title">Death Saving Throws</div>
          <div className="death-saves">
            <div>
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '.35rem' }}>Successes</span>
              <div className="save-pips">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`save-pip success${i < deathSaves.successes ? ' filled' : ''}`}
                    onClick={() => addDeathSave('successes')}
                  />
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '.35rem' }}>Failures</span>
              <div className="save-pips">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`save-pip failure${i < deathSaves.failures ? ' filled' : ''}`}
                    onClick={() => addDeathSave('failures')}
                  />
                ))}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={resetDeathSaves}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
