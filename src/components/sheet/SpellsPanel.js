import { useState, useEffect } from 'react';
import { fetchSpell, fetchSpellsByClass } from '../../api/dndApi';
import useCharacterStore from '../../store/characterStore';
import { formatModifier } from '../../utils/format';

const SCHOOL_COLOR = {
  abjuration:   'var(--info)',
  conjuration:  'var(--success)',
  divination:   '#a78bfa',
  enchantment:  '#f472b6',
  evocation:    'var(--danger)',
  illusion:     '#34d399',
  necromancy:   'var(--text-muted)',
  transmutation:'var(--warning)',
};

export default function SpellsPanel() {
  const spells              = useCharacterStore(s => s.character.spells);
  const classId             = useCharacterStore(s => s.character.class.id);
  const className           = useCharacterStore(s => s.character.class.name);
  const spellcastingAbility = useCharacterStore(s => s.derived.spellcastingAbility);
  const spellSaveDC         = useCharacterStore(s => s.derived.spellSaveDC);
  const spellAttackBonus    = useCharacterStore(s => s.derived.spellAttackBonus);
  const spendSlot           = useCharacterStore(s => s.useSpellSlot);
  const recoverSlot         = useCharacterStore(s => s.recoverSpellSlot);
  const recoverAllSlots     = useCharacterStore(s => s.recoverAllSpellSlots);
  const addSpell            = useCharacterStore(s => s.addSpell);
  const removeSpell         = useCharacterStore(s => s.removeSpell);

  const [classSpells, setClassSpells]     = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [search, setSearch]               = useState('');
  const [expandedId, setExpandedId]       = useState(null);
  const [details, setDetails]             = useState({});   // { index: fullDetail }
  const [loadingId, setLoadingId]         = useState(null);

  const isSpellcaster = !!spellcastingAbility;
  const hasSlots      = Object.keys(spells.slots).length > 0;
  const slotLevels    = Object.keys(spells.slots).map(Number).sort();

  // Load spell list for the selected class
  useEffect(() => {
    if (!classId || !className) return;
    setBrowseLoading(true);
    fetchSpellsByClass(className)
      .then(setClassSpells)
      .catch(console.error)
      .finally(() => setBrowseLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function toggleExpand(spell) {
    if (expandedId === spell.index) { setExpandedId(null); return; }
    setExpandedId(spell.index);
    if (!details[spell.index]) {
      setLoadingId(spell.index);
      fetchSpell(spell.index)
        .then(d => setDetails(prev => ({ ...prev, [spell.index]: d })))
        .catch(console.error)
        .finally(() => setLoadingId(null));
    }
  }

  const knownIds = new Set(spells.known.map(s => s.id));

  const filteredBrowse = search.trim()
    ? classSpells.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : classSpells;

  // Group known spells by spell level
  const knownByLevel = {};
  for (const spell of spells.known) {
    const lvl = spell.level ?? 0;
    if (!knownByLevel[lvl]) knownByLevel[lvl] = [];
    knownByLevel[lvl].push(spell);
  }

  if (!classId) {
    return (
      <div className="sheet-section">
        <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Select a class to see spellcasting options.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Spellcasting Stats */}
      {isSpellcaster && (
        <div className="sheet-section">
          <div className="sheet-section-title">Spellcasting</div>
          <div className="combat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="combat-box">
              <div className="val">{spellcastingAbility.toUpperCase()}</div>
              <div className="lbl">Ability</div>
            </div>
            <div className="combat-box">
              <div className="val">{spellSaveDC}</div>
              <div className="lbl">Save DC</div>
            </div>
            <div className="combat-box">
              <div className="val">{formatModifier(spellAttackBonus)}</div>
              <div className="lbl">Atk Bonus</div>
            </div>
          </div>
        </div>
      )}

      {/* Spell Slots */}
      {hasSlots && (
        <div className="sheet-section">
          <div className="flex-between" style={{ marginBottom: '.6rem' }}>
            <div className="sheet-section-title" style={{ marginBottom: 0 }}>Spell Slots</div>
            <button className="btn btn-ghost btn-sm" onClick={recoverAllSlots}>Long Rest</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
            {slotLevels.map(lvl => {
              const slot      = spells.slots[String(lvl)];
              const available = slot.max - slot.used;
              return (
                <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', minWidth: '4rem' }}>
                    Level {lvl}
                  </span>
                  <div style={{ display: 'flex', gap: '.3rem', flex: 1 }}>
                    {Array.from({ length: slot.max }).map((_, i) => {
                      const spent = i >= available;
                      return (
                        <button
                          key={i}
                          title={spent ? 'Click to recover' : 'Click to use'}
                          onClick={() => spent ? recoverSlot(lvl) : spendSlot(lvl)}
                          style={{
                            width: 20, height: 20, borderRadius: '50%', padding: 0,
                            border: `2px solid ${spent ? 'var(--border)' : 'var(--accent)'}`,
                            background: spent ? 'transparent' : 'var(--accent)',
                            cursor: 'pointer', transition: 'all .15s',
                          }}
                        />
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{available}/{slot.max}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Known Spells / Spellbook */}
      {spells.known.length > 0 && (
        <div className="sheet-section">
          <div className="sheet-section-title">Spellbook ({spells.known.length})</div>
          {Object.keys(knownByLevel).map(Number).sort().map(lvl => (
            <div key={lvl} style={{ marginBottom: '.5rem' }}>
              <div style={{
                fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.3rem',
              }}>
                {lvl === 0 ? 'Cantrips' : `Level ${lvl}`}
              </div>
              {knownByLevel[lvl].map(spell => (
                <div
                  key={spell.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '.35rem .75rem', marginBottom: '.2rem',
                  }}
                >
                  <span style={{ flex: 1, fontSize: '.83rem', color: 'var(--text-light)' }}>{spell.label}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ padding: '.1rem .4rem', fontSize: '.7rem', lineHeight: 1 }}
                    onClick={() => removeSpell(spell.id)}
                  >×</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Browse Class Spells */}
      <div className="sheet-section">
        <div className="sheet-section-title">
          Browse {className} Spells
          {browseLoading && (
            <span style={{ color: 'var(--accent)', fontSize: '.7rem', marginLeft: '.5rem', fontWeight: 400 }}>
              Loading…
            </span>
          )}
          {!browseLoading && classSpells.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '.7rem', marginLeft: '.5rem', fontWeight: 400 }}>
              {classSpells.length} spells
            </span>
          )}
        </div>

        <input
          className="input"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: '.6rem' }}
        />

        <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          {filteredBrowse.slice(0, 80).map(spell => {
            const known    = knownIds.has(spell.index);
            const detail   = details[spell.index];
            const expanded = expandedId === spell.index;

            return (
              <div
                key={spell.index}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${expanded ? 'var(--accent-dim)' : 'var(--border)'}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .75rem', cursor: 'pointer' }}
                  onClick={() => toggleExpand(spell)}
                >
                  {detail && (
                    <span style={{
                      fontSize: '.68rem', minWidth: '1.8rem',
                      color: SCHOOL_COLOR[detail.school?.index] ?? 'var(--text-muted)',
                      fontWeight: 700,
                    }}>
                      {detail.level === 0 ? 'C' : `L${detail.level}`}
                    </span>
                  )}
                  <span style={{ flex: 1, fontSize: '.83rem', color: 'var(--text-light)' }}>{spell.name}</span>
                  {known
                    ? <span style={{ fontSize: '.7rem', color: 'var(--success)' }}>✓</span>
                    : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '.1rem .4rem', fontSize: '.7rem', lineHeight: 1 }}
                        onClick={e => {
                          e.stopPropagation();
                          addSpell({ id: spell.index, label: spell.name, level: detail?.level ?? 0 });
                        }}
                      >+ Add</button>
                    )
                  }
                  <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginLeft: '.25rem' }}>
                    {expanded ? '▲' : '▼'}
                  </span>
                </div>

                {expanded && (
                  <div style={{ padding: '.5rem .75rem', borderTop: '1px solid var(--border)' }}>
                    {loadingId === spell.index
                      ? <div className="spinner" style={{ width: 22, height: 22, margin: '.5rem auto', borderWidth: 2 }} />
                      : detail
                        ? <SpellDetail detail={detail} />
                        : null
                    }
                  </div>
                )}
              </div>
            );
          })}

          {!browseLoading && filteredBrowse.length === 0 && (
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No spells match.</p>
          )}
          {filteredBrowse.length > 80 && (
            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '.5rem' }}>
              Showing first 80 — narrow your search to find more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SpellDetail({ detail }) {
  return (
    <div style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem 1.25rem', marginBottom: '.5rem' }}>
        <span>
          <span style={{ color: 'var(--text-muted)' }}>Level </span>
          {detail.level === 0 ? 'Cantrip' : detail.level}
        </span>
        {detail.school?.name && (
          <span style={{ color: SCHOOL_COLOR[detail.school.index] ?? 'var(--text-muted)' }}>
            {detail.school.name}
          </span>
        )}
        {detail.casting_time && (
          <span><span style={{ color: 'var(--text-muted)' }}>Cast </span>{detail.casting_time}</span>
        )}
        {detail.range && (
          <span><span style={{ color: 'var(--text-muted)' }}>Range </span>{detail.range}</span>
        )}
        {detail.duration && (
          <span><span style={{ color: 'var(--text-muted)' }}>Duration </span>{detail.duration}</span>
        )}
        {detail.concentration && (
          <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Concentration</span>
        )}
        {detail.ritual && (
          <span style={{ color: 'var(--info)', fontWeight: 600 }}>Ritual</span>
        )}
      </div>
      {detail.desc?.length > 0 && (
        <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          {detail.desc[0]}
        </p>
      )}
      {detail.higher_level?.length > 0 && (
        <p style={{ fontSize: '.75rem', color: 'var(--accent-dim)', marginTop: '.35rem', lineHeight: 1.5 }}>
          <strong>At Higher Levels: </strong>{detail.higher_level[0]}
        </p>
      )}
    </div>
  );
}
