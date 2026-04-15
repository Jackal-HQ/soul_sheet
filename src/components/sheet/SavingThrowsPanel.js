import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';
import useUIStore from '../../store/uiStore';

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const LABELS    = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };

export default function SavingThrowsPanel() {
  const savingThrows             = useCharacterStore(s => s.derived.savingThrows);
  const savingThrowProficiencies = useCharacterStore(s => s.character.savingThrowProficiencies);
  const conditionEffects         = useCharacterStore(s => s.derived.conditionEffects);
  const roll                     = useUIStore(s => s.roll);

  const hasDisadv = conditionEffects?.hasSaveDisadvantage ?? false;

  return (
    <div className="sheet-section">
      <div className="flex-between" style={{ marginBottom: '.6rem' }}>
        <div className="sheet-section-title" style={{ marginBottom: 0 }}>Saving Throws</div>
        {hasDisadv && (
          <span style={{
            fontSize: '.65rem', fontWeight: 700, color: 'var(--danger)',
            textTransform: 'uppercase', letterSpacing: '.06em',
            background: 'rgba(248,113,113,.12)', border: '1px solid var(--danger)',
            borderRadius: 4, padding: '.1rem .4rem',
          }}>
            Disadv.
          </span>
        )}
      </div>
      <div className="card-sm">
        {ABILITIES.map(id => {
          const bonus = savingThrows[id];
          return (
            <div
              key={id}
              className="stat-row"
              style={{ cursor: 'pointer' }}
              title={`Roll ${LABELS[id]} save (${formatModifier(bonus)})${hasDisadv ? ' — Disadvantage' : ''}`}
              onClick={() => roll({ label: `${LABELS[id]} Save`, bonus, disadvantage: hasDisadv })}
            >
              <div className={`prof-dot${savingThrowProficiencies.includes(id) ? ' proficient' : ''}`} />
              <span className="row-label">{LABELS[id]}</span>
              <span className="bonus">{formatModifier(bonus)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
