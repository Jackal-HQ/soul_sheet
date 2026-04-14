import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const LABELS    = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };

export default function SavingThrowsPanel() {
  const savingThrows           = useCharacterStore(s => s.derived.savingThrows);
  const savingThrowProficiencies = useCharacterStore(s => s.character.savingThrowProficiencies);

  return (
    <div className="sheet-section">
      <div className="sheet-section-title">Saving Throws</div>
      <div className="card-sm">
        {ABILITIES.map(id => (
          <div key={id} className="stat-row">
            <div className={`prof-dot${savingThrowProficiencies.includes(id) ? ' proficient' : ''}`} />
            <span className="row-label">{LABELS[id]}</span>
            <span className="bonus">{formatModifier(savingThrows[id])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
