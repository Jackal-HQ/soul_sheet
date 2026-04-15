import { useState } from 'react';
import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';

// Official ASI levels per class (Open5e provides no per-level data, so hardcoded)
const ASI_LEVELS = {
  fighter: [4, 6, 8, 12, 14, 16, 19],
  rogue:   [4, 8, 10, 12, 16, 18],
};
const DEFAULT_ASI_LEVELS = [4, 8, 12, 16, 19];

function isASILevel(classId, level) {
  const table = ASI_LEVELS[classId] ?? DEFAULT_ASI_LEVELS;
  return table.includes(level);
}

const ABILITY_LABELS = {
  str: 'Strength', dex: 'Dexterity', con: 'Constitution',
  int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma',
};

export default function LevelUpWizard({ onClose }) {
  const character      = useCharacterStore(s => s.character);
  const derived        = useCharacterStore(s => s.derived);
  const setLevel       = useCharacterStore(s => s.setLevel);
  const setHP          = useCharacterStore(s => s.setHP);
  const setAbilityScore = useCharacterStore(s => s.setAbilityScore);

  const { class: cls, hp, abilityScores } = character;
  const targetLevel = cls.level + 1;
  const hasASI      = isASILevel(cls.id, targetLevel);
  const steps       = hasASI ? ['hp', 'asi', 'confirm'] : ['hp', 'confirm'];

  const [step, setStep]     = useState(0);
  const [hpGain, setHpGain] = useState(null);
  const [asiMode, setAsiMode]   = useState('split');   // 'split' = +1/+1, 'double' = +2/one
  const [asiPick1, setAsiPick1] = useState('str');
  const [asiPick2, setAsiPick2] = useState('str');
  const [asiSingle, setAsiSingle] = useState('str');

  const hitDieMax = cls.hitDieMax ?? 8;
  const conMod    = derived.modifiers.con ?? 0;
  const suggestHP = Math.max(1, hitDieMax + conMod);

  function rollHitDie() {
    const rolled = Math.max(1, Math.ceil(Math.random() * hitDieMax) + conMod);
    setHpGain(rolled);
  }

  function commit() {
    // Apply HP increase
    if (hpGain !== null) {
      setHP('max',     hp.max     + hpGain);
      setHP('current', hp.current + hpGain);
    }
    // Apply ASI
    if (hasASI) {
      if (asiMode === 'split') {
        setAbilityScore(asiPick1, Math.min(20, abilityScores[asiPick1] + 1));
        setAbilityScore(asiPick2, Math.min(20, abilityScores[asiPick2] + 1));
      } else {
        setAbilityScore(asiSingle, Math.min(20, abilityScores[asiSingle] + 2));
      }
    }
    // Level up
    setLevel(targetLevel);
    onClose();
  }

  if (cls.level >= 20) {
    return (
      <ModalShell onClose={onClose}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '.75rem' }}>Already Level 20</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Your character has reached the maximum level.
        </p>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </ModalShell>
    );
  }

  const currentStep = steps[step];

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: 'var(--accent)', marginBottom: '.2rem' }}>
              Level Up — {cls.name || 'Character'} {targetLevel}
            </h2>
            <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
              Step {step + 1} of {steps.length}
            </p>
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center', paddingTop: '.2rem' }}>
            {steps.map((s, i) => (
              <div
                key={s}
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i <= step ? 'var(--accent)' : 'var(--border)',
                  transition: 'background .2s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Step: HP ── */}
      {currentStep === 'hp' && (
        <div>
          <h3 style={{ marginBottom: '.5rem' }}>Starting Hit Points</h3>
          <p style={{ fontSize: '.83rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Roll your hit die ({cls.hitDice}) or take the maximum.
            CON modifier: <strong style={{ color: 'var(--text-light)' }}>{formatModifier(conMod)}</strong>
          </p>

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={rollHitDie}>
              Roll {cls.hitDice}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setHpGain(suggestHP)}>
              Take Max ({suggestHP > 0 ? '+' : ''}{suggestHP})
            </button>
          </div>

          {hpGain !== null && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--accent-dim)',
              borderRadius: 'var(--radius)', padding: '.75rem 1rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                +{hpGain}
              </span>
              <div style={{ fontSize: '.83rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                HP increase<br />
                <span style={{ color: 'var(--text-light)' }}>
                  {hp.max} → {hp.max + hpGain}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', marginTop: '1.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              disabled={hpGain === null}
              onClick={() => setStep(s => s + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step: ASI ── */}
      {currentStep === 'asi' && (
        <div>
          <h3 style={{ marginBottom: '.5rem' }}>Ability Score Improvement</h3>
          <p style={{ fontSize: '.83rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Level {targetLevel} grants an ASI. Increase one score by 2, or two scores by 1 each (max 20).
          </p>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
            {[
              { value: 'split',  label: '+1 to two abilities' },
              { value: 'double', label: '+2 to one ability'   },
            ].map(opt => (
              <button
                key={opt.value}
                className={`btn btn-sm ${asiMode === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setAsiMode(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {asiMode === 'split' ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {[
                { key: 'pick1', val: asiPick1, set: setAsiPick1 },
                { key: 'pick2', val: asiPick2, set: setAsiPick2 },
              ].map(({ key, val, set }) => (
                <div key={key} className="field" style={{ flex: 1, minWidth: 140 }}>
                  <label>Ability</label>
                  <select className="input" value={val} onChange={e => set(e.target.value)}>
                    {Object.entries(ABILITY_LABELS).map(([id, lbl]) => (
                      <option key={id} value={id} disabled={abilityScores[id] >= 20}>
                        {lbl} ({abilityScores[id]}{abilityScores[id] >= 20 ? ' — max' : ` → ${abilityScores[id] + 1}`})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <div className="field" style={{ maxWidth: 260, marginBottom: '1rem' }}>
              <label>Ability</label>
              <select className="input" value={asiSingle} onChange={e => setAsiSingle(e.target.value)}>
                {Object.entries(ABILITY_LABELS).map(([id, lbl]) => (
                  <option key={id} value={id} disabled={abilityScores[id] >= 20}>
                    {lbl} ({abilityScores[id]}{abilityScores[id] >= 20 ? ' — max' : ` → ${abilityScores[id] + 2}`})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>
            <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Next →</button>
          </div>
        </div>
      )}

      {/* ── Step: Confirm ── */}
      {currentStep === 'confirm' && (
        <div>
          <h3 style={{ marginBottom: '.75rem' }}>Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginBottom: '1.5rem' }}>
            <SummaryRow label="New Level" value={`${cls.name || 'Level'} ${targetLevel}`} />
            {hpGain !== null && (
              <SummaryRow label="Hit Points" value={`${hp.max} → ${hp.max + hpGain} (+${hpGain})`} />
            )}
            {hasASI && asiMode === 'split' && (
              <SummaryRow
                label="ASI"
                value={`${ABILITY_LABELS[asiPick1]} +1  ·  ${ABILITY_LABELS[asiPick2]} +1`}
              />
            )}
            {hasASI && asiMode === 'double' && (
              <SummaryRow label="ASI" value={`${ABILITY_LABELS[asiSingle]} +2`} />
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>
            <button className="btn btn-primary" onClick={commit}>Confirm Level Up</button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '.5rem .85rem', fontSize: '.85rem',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem',
        width: '100%', maxWidth: 460,
        boxShadow: '0 20px 60px rgba(0,0,0,.5)',
      }}>
        {children}
      </div>
    </div>
  );
}
