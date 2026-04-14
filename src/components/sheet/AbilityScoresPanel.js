import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';

const ABILITIES = [
  { id: 'str', label: 'Strength' },
  { id: 'dex', label: 'Dexterity' },
  { id: 'con', label: 'Constitution' },
  { id: 'int', label: 'Intelligence' },
  { id: 'wis', label: 'Wisdom' },
  { id: 'cha', label: 'Charisma' },
];

export default function AbilityScoresPanel() {
  const abilityScores          = useCharacterStore(s => s.character.abilityScores);
  const abilityBonuses         = useCharacterStore(s => s.character.race.abilityBonuses);
  const effectiveAbilityScores = useCharacterStore(s => s.derived.effectiveAbilityScores);
  const modifiers              = useCharacterStore(s => s.derived.modifiers);

  return (
    <div className="sheet-section">
      <div className="sheet-section-title">Ability Scores</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem' }}>
        {ABILITIES.map(({ id, label }) => {
          const bonus = abilityBonuses?.[id] ?? 0;
          return (
            <div key={id} className={`stat-box${bonus !== 0 ? ' has-bonus' : ''}`}>
              <div className="stat-label">{label.slice(0, 3)}</div>
              <div className="stat-modifier">{formatModifier(modifiers[id])}</div>
              <div className="stat-score">{effectiveAbilityScores[id]}</div>
              {bonus !== 0 && (
                <div style={{
                  fontSize: '.6rem',
                  color: bonus > 0 ? 'var(--success)' : 'var(--danger)',
                  lineHeight: 1,
                }}>
                  {abilityScores[id]}{bonus > 0 ? '+' : ''}{bonus}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
