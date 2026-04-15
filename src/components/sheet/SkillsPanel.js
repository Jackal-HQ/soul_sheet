import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';
import { SKILLS } from '../../store/constants';
import useUIStore from '../../store/uiStore';

const ABILITY_SHORT = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

export default function SkillsPanel() {
  const skills             = useCharacterStore(s => s.derived.skills);
  const skillProficiencies = useCharacterStore(s => s.character.skillProficiencies);
  const expertiseSkills    = useCharacterStore(s => s.character.expertiseSkills);
  const conditionEffects   = useCharacterStore(s => s.derived.conditionEffects);
  const roll               = useUIStore(s => s.roll);

  const hasDisadv = conditionEffects?.hasSkillDisadvantage ?? false;

  return (
    <div className="sheet-section">
      <div className="flex-between" style={{ marginBottom: '.6rem' }}>
        <div className="sheet-section-title" style={{ marginBottom: 0 }}>Skills</div>
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
        {Object.entries(SKILLS).map(([id, def]) => {
          const expert = expertiseSkills.includes(id);
          const prof   = skillProficiencies.includes(id);
          const bonus  = skills[id];
          return (
            <div
              key={id}
              className="stat-row"
              style={{ cursor: 'pointer' }}
              title={`Roll ${def.label} check (${formatModifier(bonus)})${hasDisadv ? ' — Disadvantage' : ''}`}
              onClick={() => roll({ label: def.label, bonus, disadvantage: hasDisadv })}
            >
              <div className={`prof-dot${expert ? ' expertise' : prof ? ' proficient' : ''}`} />
              <span className="ability-tag">{ABILITY_SHORT[def.ability]}</span>
              <span className="row-label">{def.label}</span>
              <span className="bonus">{formatModifier(bonus)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
