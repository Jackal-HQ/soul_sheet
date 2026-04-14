import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import useCharacterStore   from '../store/characterStore';
import CharacterPdf        from '../components/CharacterPdf';
import AbilityScoresPanel  from '../components/sheet/AbilityScoresPanel';
import SavingThrowsPanel   from '../components/sheet/SavingThrowsPanel';
import SkillsPanel         from '../components/sheet/SkillsPanel';
import CombatStats         from '../components/sheet/CombatStats';
import FeaturesPanel       from '../components/sheet/FeaturesPanel';
import InventoryPanel      from '../components/sheet/InventoryPanel';
import SpellsPanel         from '../components/sheet/SpellsPanel';
import { CONDITIONS }      from '../store/constants';

export default function CharacterSheet() {
  const navigate  = useNavigate();
  const character = useCharacterStore(s => s.character);
  const derived   = useCharacterStore(s => s.derived);
  const { meta, race, class: cls } = character;
  const [tab, setTab] = useState('overview');

  if (!meta.name && !race.id && !cls.id) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h2>No Character Yet</h2>
            <p>Create a character first.</p>
            <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => navigate('/create')}>
              + New Character
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="sheet-header" style={{ marginBottom: '1rem' }}>
          <div className="flex-between">
            <h1>{meta.name || 'Unnamed Character'}</h1>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <PDFDownloadLink
                document={<CharacterPdf character={character} derived={derived} />}
                fileName={`${meta.name || 'character'}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                {({ loading: pdfLoading }) => (
                  <button className="btn btn-ghost btn-sm">
                    {pdfLoading ? 'Preparing…' : 'Export PDF'}
                  </button>
                )}
              </PDFDownloadLink>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/create')}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>Dashboard</button>
            </div>
          </div>
          <div className="sheet-meta">
            {race.name && <span><strong>{race.name}</strong></span>}
            {cls.name && (
              <span>
                <strong>{cls.name}</strong> · Level <strong>{cls.level}</strong>
              </span>
            )}
            {meta.background && <span>Background: <strong>{meta.background}</strong></span>}
            {meta.alignment  && <span>Alignment: <strong>{meta.alignment}</strong></span>}
            {meta.campaign   && <span>Campaign: <strong>{meta.campaign}</strong></span>}
          </div>
        </div>

        {/* Tab Nav */}
        <div className="sheet-tab-nav">
          {['overview', 'inventory', 'spells'].map(t => (
            <button
              key={t}
              className={`sheet-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="sheet-columns">
            <div>
              <AbilityScoresPanel />
              <SavingThrowsPanel />
              <SkillsPanel />
            </div>
            <div>
              <CombatStats />
              <ConditionTracker />
              <FeaturesPanel />
            </div>
          </div>
        )}

        {/* Inventory */}
        {tab === 'inventory' && (
          <div style={{ maxWidth: 680 }}>
            <InventoryPanel />
          </div>
        )}

        {/* Spells */}
        {tab === 'spells' && (
          <div style={{ maxWidth: 680 }}>
            <SpellsPanel />
          </div>
        )}

      </div>
    </div>
  );
}

// ── Inline condition tracker ──────────────────────────────────────────────────

function ConditionTracker() {
  const conditionFlags  = useCharacterStore(s => s.character.conditionFlags);
  const toggleCondition = useCharacterStore(s => s.toggleCondition);

  return (
    <div className="sheet-section">
      <div className="sheet-section-title">Conditions</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
        {Object.entries(CONDITIONS).map(([id, def]) => {
          const active = conditionFlags.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggleCondition(id)}
              style={{
                padding: '.3rem .7rem',
                borderRadius: 20,
                border: `1px solid ${active ? 'var(--danger)' : 'var(--border)'}`,
                background: active ? 'rgba(248,113,113,.15)' : 'var(--card)',
                color: active ? 'var(--danger)' : 'var(--text-muted)',
                fontSize: '.78rem',
                fontWeight: active ? 700 : 400,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {def.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
