import useCharacterStore from '../../store/characterStore';

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

const BACKGROUNDS = [
  'Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero',
  'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage',
  'Sailor', 'Soldier', 'Urchin',
];

export default function BasicInfoStep() {
  const meta    = useCharacterStore(s => s.character.meta);
  const setMeta = useCharacterStore(s => s.setMeta);

  return (
    <div>
      <h2 style={{ marginBottom: '.35rem' }}>Character Identity</h2>
      <p style={{ marginBottom: '1.5rem' }}>The basics — name and background details.</p>

      <div className="grid-2" style={{ gap: '1.25rem' }}>

        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Character Name</label>
          <input
            className="input"
            placeholder="e.g. Aldric Thornwood"
            value={meta.name}
            onChange={e => setMeta('name', e.target.value)}
          />
        </div>

        <div className="field">
          <label>Background</label>
          <select
            className="input"
            value={meta.background}
            onChange={e => setMeta('background', e.target.value)}
          >
            <option value="">Select background</option>
            {BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Alignment</label>
          <select
            className="input"
            value={meta.alignment}
            onChange={e => setMeta('alignment', e.target.value)}
          >
            <option value="">Select alignment</option>
            {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Campaign / Setting</label>
          <input
            className="input"
            placeholder="Optional"
            value={meta.campaign}
            onChange={e => setMeta('campaign', e.target.value)}
          />
        </div>

        <div className="field">
          <label>Experience Points</label>
          <input
            className="input"
            type="number"
            min="0"
            placeholder="0"
            value={meta.xp || ''}
            onChange={e => setMeta('xp', Number(e.target.value))}
          />
        </div>

      </div>
    </div>
  );
}
