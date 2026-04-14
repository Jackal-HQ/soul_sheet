import { useNavigate } from 'react-router-dom';
import useCharacterStore from '../store/characterStore';

export default function Dashboard() {
  const navigate      = useNavigate();
  const character     = useCharacterStore(s => s.character);
  const resetCharacter = useCharacterStore(s => s.resetCharacter);

  const hasCharacter = Boolean(character.meta.name || character.race.id || character.class.id);

  function handleCreate() {
    resetCharacter();
    navigate('/create');
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '.5rem' }}>Soul Sheet</h1>
          <p style={{ marginBottom: '2.5rem', fontSize: '1.05rem' }}>
            D&amp;D 5e character manager
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '.7rem 1.75rem' }} onClick={handleCreate}>
              + New Character
            </button>
            {hasCharacter && (
              <button className="btn btn-ghost" style={{ fontSize: '1rem' }} onClick={() => navigate('/sheet')}>
                View Current Sheet
              </button>
            )}
          </div>

          {hasCharacter && (
            <div className="card" style={{ maxWidth: 340, margin: '2.5rem auto 0', textAlign: 'left' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
                Current Character
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                {character.meta.name || 'Unnamed'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginTop: '.25rem' }}>
                {[
                  character.race.name,
                  character.class.name && `${character.class.name} ${character.class.level}`,
                ].filter(Boolean).join(' · ')}
              </div>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/sheet')}>Open Sheet</button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/create')}>Edit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
