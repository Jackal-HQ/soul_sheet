import { useState } from 'react';
import useCharacterStore from '../../store/characterStore';

const SCHOOLS = [
  'abjuration', 'conjuration', 'divination', 'enchantment',
  'evocation', 'illusion', 'necromancy', 'transmutation',
];
const FEATURE_TYPES = [
  { value: 'class',  label: 'Class Feature / Subclass' },
  { value: 'racial', label: 'Racial Trait' },
  { value: 'feat',   label: 'Feat' },
];

function uid() {
  return `hb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function blankSpell() {
  return { name: '', level: 0, school: 'evocation', castTime: '1 action', range: 'Self', duration: 'Instantaneous', concentration: false, ritual: false, desc: '' };
}

function blankFeature() {
  return { name: '', type: 'class', desc: '' };
}

export default function HomebrewPanel() {
  const homebrew            = useCharacterStore(s => s.character.homebrew);
  const addHomebrewSpell    = useCharacterStore(s => s.addHomebrewSpell);
  const removeHomebrewSpell = useCharacterStore(s => s.removeHomebrewSpell);
  const addHomebrewFeature  = useCharacterStore(s => s.addHomebrewFeature);
  const removeHomebrewFeature = useCharacterStore(s => s.removeHomebrewFeature);
  const addSpell            = useCharacterStore(s => s.addSpell);

  const [tab,       setTab]       = useState('spells');
  const [spellForm, setSpellForm] = useState(blankSpell());
  const [featForm,  setFeatForm]  = useState(blankFeature());
  const [spellOpen, setSpellOpen] = useState(false);
  const [featOpen,  setFeatOpen]  = useState(false);

  function submitSpell() {
    if (!spellForm.name.trim()) return;
    addHomebrewSpell({ id: uid(), ...spellForm });
    setSpellForm(blankSpell());
    setSpellOpen(false);
  }

  function submitFeature() {
    if (!featForm.name.trim()) return;
    addHomebrewFeature({ id: uid(), ...featForm });
    setFeatForm(blankFeature());
    setFeatOpen(false);
  }

  const spells   = homebrew?.spells   ?? [];
  const features = homebrew?.features ?? [];

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: '1.25rem' }}>
        {[
          { value: 'spells',   label: 'Custom Spells' },
          { value: 'features', label: 'Custom Features' },
        ].map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${tab === t.value ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -2, padding: '.5rem 1.1rem',
              fontSize: '.85rem', fontWeight: 600,
              color: tab === t.value ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'color .15s, border-color .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Spells Tab ── */}
      {tab === 'spells' && (
        <div>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '.83rem', color: 'var(--text-muted)' }}>
              Create spells not in the SRD — Hexblade invocations, homebrew cantrips, etc.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => setSpellOpen(o => !o)}>
              {spellOpen ? 'Cancel' : '+ New Spell'}
            </button>
          </div>

          {spellOpen && (
            <SpellForm form={spellForm} setForm={setSpellForm} onSubmit={submitSpell} />
          )}

          {spells.length === 0 && !spellOpen ? (
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No custom spells yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {spells.map(spell => (
                <div
                  key={spell.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '.75rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)', flex: 1 }}>{spell.name}</span>
                    <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                      {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`} · {spell.school}
                    </span>
                    {spell.concentration && (
                      <span style={{ fontSize: '.68rem', color: 'var(--warning)', fontWeight: 600 }}>Conc.</span>
                    )}
                    {spell.ritual && (
                      <span style={{ fontSize: '.68rem', color: 'var(--info)', fontWeight: 600 }}>Ritual</span>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '.72rem', padding: '.15rem .55rem' }}
                      onClick={() => addSpell({ id: spell.id, label: spell.name, level: spell.level, custom: true })}
                    >
                      + Spellbook
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '.1rem .4rem', fontSize: '.7rem', lineHeight: 1 }}
                      onClick={() => removeHomebrewSpell(spell.id)}
                    >×</button>
                  </div>
                  {spell.desc && (
                    <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.4rem', lineHeight: 1.5 }}>
                      {spell.desc.length > 140 ? spell.desc.slice(0, 140) + '…' : spell.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Features Tab ── */}
      {tab === 'features' && (
        <div>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '.83rem', color: 'var(--text-muted)' }}>
              Add custom subclass features, racial traits, or feats not in the SRD.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => setFeatOpen(o => !o)}>
              {featOpen ? 'Cancel' : '+ New Feature'}
            </button>
          </div>

          {featOpen && (
            <FeatureForm form={featForm} setForm={setFeatForm} onSubmit={submitFeature} />
          )}

          {features.length === 0 && !featOpen ? (
            <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No custom features yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {features.map(feat => (
                <div
                  key={feat.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '.75rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)', flex: 1 }}>{feat.name}</span>
                    <span style={{
                      fontSize: '.68rem', color: 'var(--text-muted)',
                      background: 'var(--card)', border: '1px solid var(--border)',
                      borderRadius: 4, padding: '.1rem .4rem', textTransform: 'capitalize',
                    }}>{feat.type}</span>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '.1rem .4rem', fontSize: '.7rem', lineHeight: 1 }}
                      onClick={() => removeHomebrewFeature(feat.id)}
                    >×</button>
                  </div>
                  {feat.desc && (
                    <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '.4rem', lineHeight: 1.55 }}>
                      {feat.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Spell Creation Form ────────────────────────────────────────────────────────

function SpellForm({ form, setForm, onSubmit }) {
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem .75rem', marginBottom: '.75rem' }}>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Spell Name *</label>
          <input
            className="input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Eldritch Blast"
          />
        </div>
        <div className="field">
          <label>Level</label>
          <select className="input" value={form.level} onChange={e => set('level', Number(e.target.value))}>
            <option value={0}>Cantrip (0)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
              <option key={l} value={l}>Level {l}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>School</label>
          <select className="input" value={form.school} onChange={e => set('school', e.target.value)}>
            {SCHOOLS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Casting Time</label>
          <input className="input" value={form.castTime} onChange={e => set('castTime', e.target.value)} placeholder="1 action" />
        </div>
        <div className="field">
          <label>Range</label>
          <input className="input" value={form.range} onChange={e => set('range', e.target.value)} placeholder="60 feet" />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Duration</label>
          <input className="input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="Instantaneous" />
        </div>
        <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '.5rem' }}>
          <input
            type="checkbox" id="hb-conc"
            checked={form.concentration}
            onChange={e => set('concentration', e.target.checked)}
          />
          <label htmlFor="hb-conc" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '.85rem' }}>
            Concentration
          </label>
        </div>
        <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '.5rem' }}>
          <input
            type="checkbox" id="hb-ritual"
            checked={form.ritual}
            onChange={e => set('ritual', e.target.checked)}
          />
          <label htmlFor="hb-ritual" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '.85rem' }}>
            Ritual
          </label>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.desc}
            onChange={e => set('desc', e.target.value)}
            placeholder="What does this spell do?"
            style={{ resize: 'vertical', minHeight: 72 }}
          />
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onSubmit} disabled={!form.name.trim()}>
        Create Spell
      </button>
    </div>
  );
}

// ── Feature Creation Form ──────────────────────────────────────────────────────

function FeatureForm({ form, setForm, onSubmit }) {
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem .75rem', marginBottom: '.75rem' }}>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Feature Name *</label>
          <input
            className="input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Hexblade's Curse"
          />
        </div>
        <div className="field">
          <label>Type</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            {FEATURE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <textarea
            className="input"
            rows={4}
            value={form.desc}
            onChange={e => set('desc', e.target.value)}
            placeholder="Describe what this feature does…"
            style={{ resize: 'vertical', minHeight: 90 }}
          />
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onSubmit} disabled={!form.name.trim()}>
        Create Feature
      </button>
    </div>
  );
}
