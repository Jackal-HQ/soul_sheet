import { useEffect, useRef, useState } from 'react';
import useUIStore from '../store/uiStore';
import { formatModifier } from '../utils/format';

export default function DiceToast() {
  const roll      = useUIStore(s => s.diceRoll);
  const clearRoll = useUIStore(s => s.clearRoll);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!roll) { setVisible(false); return; }
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(clearRoll, 300);
    }, 4000);
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll]);

  if (!roll && !visible) return null;

  const borderColor = roll?.isCrit ? '#fbbf24' : roll?.isFumble ? '#f87171' : 'var(--accent)';
  const glowColor   = roll?.isCrit
    ? 'rgba(251,191,36,.3)'
    : roll?.isFumble
      ? 'rgba(248,113,113,.25)'
      : 'rgba(200,151,62,.15)';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1000,
        background: 'var(--surface)',
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        minWidth: 200,
        boxShadow: `0 4px 24px ${glowColor}, 0 2px 12px rgba(0,0,0,.45)`,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(120%) scale(.95)',
        opacity: visible ? 1 : 0,
        transition: 'transform .25s cubic-bezier(.22,1,.36,1), opacity .25s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
        <span style={{
          fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '.08em',
        }}>
          {roll?.label}
        </span>
        <button
          onClick={() => { setVisible(false); setTimeout(clearRoll, 300); }}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '1.1rem', lineHeight: 1, padding: 0,
          }}
        >×</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem' }}>
        <span style={{ fontSize: '3rem', fontWeight: 700, color: borderColor, lineHeight: 1 }}>
          {roll?.total}
        </span>
        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <div>
            d20: <strong style={{ color: 'var(--text-light)' }}>{roll?.die}</strong>
            {roll?.r2 !== null && (
              <span style={{ fontSize: '.7rem' }}> ({roll?.r1}, {roll?.r2})</span>
            )}
          </div>
          {roll?.bonus !== 0 && (
            <div>mod: <strong style={{ color: 'var(--text-light)' }}>{formatModifier(roll?.bonus)}</strong></div>
          )}
        </div>
      </div>

      {roll?.isCrit && (
        <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#fbbf24', marginTop: '.35rem' }}>
          Critical Hit!
        </div>
      )}
      {roll?.isFumble && (
        <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#f87171', marginTop: '.35rem' }}>
          Critical Miss!
        </div>
      )}
      {(roll?.advantage || roll?.disadvantage) && (
        <div style={{
          fontSize: '.68rem', fontWeight: 600, marginTop: '.2rem',
          color: roll?.advantage ? 'var(--success)' : 'var(--danger)',
        }}>
          {roll?.advantage ? '↑ Advantage' : '↓ Disadvantage'}
        </div>
      )}
    </div>
  );
}
