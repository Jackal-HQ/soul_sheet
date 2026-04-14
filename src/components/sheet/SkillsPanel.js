import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';
import { SKILLS } from '../../store/constants';

const ABILITY_SHORT = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

export default function SkillsPanel() {
  const skills             = useCharacterStore(s => s.derived.skills);
  const skillProficiencies = useCharacterStore(s => s.character.skillProficiencies);
  const expertiseSkills    = useCharacterStore(s => s.character.expertiseSkills);

  return (
    <div className="sheet-section">
      <div className="sheet-section-title">Skills</div>
      <div className="card-sm">
        {Object.entries(SKILLS).map(([id, def]) => {
          const expert = expertiseSkills.includes(id);
          const prof   = skillProficiencies.includes(id);
          return (
            <div key={id} className="stat-row">
              <div className={`prof-dot${expert ? ' expertise' : prof ? ' proficient' : ''}`} />
              <span className="ability-tag">{ABILITY_SHORT[def.ability]}</span>
              <span className="row-label">{def.label}</span>
              <span className="bonus">{formatModifier(skills[id])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
