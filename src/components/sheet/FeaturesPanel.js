import { useState } from 'react';
import useCharacterStore from '../../store/characterStore';
import { fetchFeature, fetchTrait, fetchFeat } from '../../api/dndApi';

export default function FeaturesPanel() {
  const features  = useCharacterStore(s => s.character.features);
  const feats     = useCharacterStore(s => s.character.feats);
  const homebrew  = useCharacterStore(s => s.character.homebrew);
  const level     = useCharacterStore(s => s.character.class.level);
  const className  = useCharacterStore(s => s.character.class.name);
  const raceName   = useCharacterStore(s => s.character.race.name);

  const hasRacial   = features.racial.length > 0;
  const hasClass    = features.class.length > 0;
  const hasFeats    = feats.length > 0;
  const hasHomebrew = (homebrew?.features ?? []).length > 0;

  if (!hasRacial && !hasClass && !hasFeats && !hasHomebrew) return null;

  const homebrewItems = (homebrew?.features ?? []).map(f => ({ id: f.id, label: f.name, desc: f.desc }));

  return (
    <div className="sheet-section">
      <div className="sheet-section-title">Features &amp; Traits</div>

      {hasRacial && (
        <FeatureGroup
          title={`${raceName || 'Racial'} Traits`}
          items={features.racial}
          accentColor="var(--info)"
          fetchDesc={fetchTrait}
        />
      )}

      {hasClass && (
        <FeatureGroup
          title={`${className || 'Class'} Features — Level ${level}`}
          items={features.class}
          accentColor="var(--accent)"
          fetchDesc={fetchFeature}
          style={{ marginTop: hasRacial ? '.75rem' : 0 }}
        />
      )}

      {hasFeats && (
        <FeatureGroup
          title="Feats"
          items={feats}
          accentColor="var(--success)"
          fetchDesc={fetchFeat}
          style={{ marginTop: (hasRacial || hasClass) ? '.75rem' : 0 }}
        />
      )}

      {hasHomebrew && (
        <FeatureGroup
          title="Custom Features"
          items={homebrewItems}
          accentColor="var(--warning)"
          fetchDesc={null}
          style={{ marginTop: (hasRacial || hasClass || hasFeats) ? '.75rem' : 0 }}
        />
      )}
    </div>
  );
}

function FeatureGroup({ title, items, accentColor, fetchDesc, style = {} }) {
  return (
    <div style={style}>
      <div style={{
        fontSize: '.72rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        marginBottom: '.5rem',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        {items.map(f => (
          <FeatureRow key={f.id} feature={f} accentColor={accentColor} fetchDesc={fetchDesc} />
        ))}
      </div>
    </div>
  );
}

function FeatureRow({ feature, accentColor, fetchDesc }) {
  const [expanded, setExpanded] = useState(false);
  // Initialise with inline desc if provided (homebrew features), else null = not yet fetched
  const [desc, setDesc]         = useState(feature.desc ?? null);
  const [loading, setLoading]   = useState(false);

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && desc === null && fetchDesc) {
      setLoading(true);
      fetchDesc(feature.id)
        .then(d => {
          const raw = d.desc ?? d.description ?? [];
          setDesc(Array.isArray(raw) ? raw.join('\n\n') : String(raw));
        })
        .catch(() => setDesc(''))
        .finally(() => setLoading(false));
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleToggle}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.4rem .75rem' }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: accentColor, flexShrink: 0,
        }} />
        <span style={{ fontSize: '.85rem', color: 'var(--text-light)', flex: 1 }}>
          {feature.label}
        </span>
        {feature.level && (
          <span style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>Lv {feature.level}</span>
        )}
        <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: '.5rem .75rem .6rem', borderTop: '1px solid var(--border)', paddingLeft: '1.1rem' }}>
          {loading
            ? <div className="spinner" style={{ width: 20, height: 20, margin: '.3rem auto', borderWidth: 2 }} />
            : desc
              ? desc.split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontSize: '.82rem', lineHeight: 1.6, marginBottom: i < desc.split('\n\n').length - 1 ? '.4rem' : 0 }}>
                    {para}
                  </p>
                ))
              : <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No description available in SRD.
                </p>
          }
        </div>
      )}
    </div>
  );
}
