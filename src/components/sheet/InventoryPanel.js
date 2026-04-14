import { useState, useEffect } from 'react';
import { fetchEquipmentList, fetchEquipment } from '../../api/dndApi';
import useCharacterStore from '../../store/characterStore';

export default function InventoryPanel() {
  const inventory           = useCharacterStore(s => s.character.inventory);
  const carryCapacity       = useCharacterStore(s => s.derived.carryCapacity);
  const currentWeight       = useCharacterStore(s => s.derived.currentWeight);
  const addInventoryItem    = useCharacterStore(s => s.addInventoryItem);
  const removeInventoryItem = useCharacterStore(s => s.removeInventoryItem);
  const updateInventoryItem = useCharacterStore(s => s.updateInventoryItem);

  const [equipList, setEquipList]     = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch]           = useState('');
  const [adding, setAdding]           = useState(null);
  const [showCustom, setShowCustom]   = useState(false);
  const [customName, setCustomName]   = useState('');
  const [customWeight, setCustomWeight] = useState('');

  useEffect(() => {
    fetchEquipmentList()
      .then(setEquipList)
      .catch(console.error)
      .finally(() => setListLoading(false));
  }, []);

  const filtered = search.trim().length >= 2
    ? equipList.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20)
    : [];

  function handleAdd(equip) {
    setAdding(equip.index);
    fetchEquipment(equip.index)
      .then(d => {
        addInventoryItem({ item_id: d.index, label: d.name, weight: d.weight ?? 0, qty: 1 });
        setSearch('');
      })
      .catch(console.error)
      .finally(() => setAdding(null));
  }

  function addCustom() {
    if (!customName.trim()) return;
    addInventoryItem({
      item_id: `custom-${Date.now()}`,
      label: customName.trim(),
      weight: parseFloat(customWeight) || 0,
      qty: 1,
      custom: true,
    });
    setCustomName('');
    setCustomWeight('');
    setShowCustom(false);
  }

  const weightPct   = carryCapacity > 0 ? Math.min(100, (currentWeight / carryCapacity) * 100) : 0;
  const weightColor = weightPct > 90 ? 'var(--danger)' : weightPct > 67 ? 'var(--warning)' : 'var(--success)';

  return (
    <div>
      {/* Carry Capacity */}
      <div className="sheet-section">
        <div className="sheet-section-title">Carry Capacity</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: '.4rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{currentWeight.toFixed(1)} lb carried</span>
          <span style={{ color: 'var(--text-muted)' }}>{carryCapacity} lb capacity</span>
        </div>
        <div className="hp-bar">
          <div className="hp-bar-fill" style={{ width: `${weightPct}%`, background: weightColor }} />
        </div>
      </div>

      {/* Add Equipment */}
      <div className="sheet-section">
        <div className="flex-between" style={{ marginBottom: '.6rem' }}>
          <div className="sheet-section-title" style={{ marginBottom: 0 }}>Add Equipment</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCustom(v => !v)}>
            {showCustom ? 'Cancel' : '+ Custom'}
          </button>
        </div>

        {showCustom ? (
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 2 }}>
              <label>Item Name</label>
              <input
                className="input"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="e.g. Potion of Healing"
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Weight (lb)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.5"
                value={customWeight}
                onChange={e => setCustomWeight(e.target.value)}
                placeholder="0"
              />
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginBottom: 1 }} onClick={addCustom}>
              Add
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              placeholder={listLoading ? 'Loading equipment…' : 'Search SRD equipment…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={listLoading}
            />
            {filtered.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 30,
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', marginTop: 2,
                maxHeight: 220, overflowY: 'auto',
                boxShadow: '0 4px 16px rgba(0,0,0,.4)',
              }}>
                {filtered.map(e => (
                  <div
                    key={e.index}
                    onClick={() => adding == null && handleAdd(e)}
                    style={{
                      padding: '.45rem .75rem',
                      fontSize: '.85rem',
                      color: 'var(--text-light)',
                      borderBottom: '1px solid var(--border)',
                      cursor: adding === e.index ? 'wait' : 'pointer',
                      background: 'transparent',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={ev => { ev.currentTarget.style.background = 'var(--card-hover)'; }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; }}
                  >
                    {adding === e.index ? '…' : e.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inventory List */}
      <div className="sheet-section">
        <div className="sheet-section-title">Carried Items ({inventory.length})</div>
        {inventory.length === 0 ? (
          <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No items carried.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
            {inventory.map((item, i) => (
              <div
                key={`${item.item_id}-${i}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '.4rem .75rem', fontSize: '.85rem',
                }}
              >
                <span style={{ flex: 1, color: 'var(--text-light)' }}>{item.label}</span>
                <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', minWidth: '3.5rem', textAlign: 'right' }}>
                  {((item.weight ?? 0) * (item.qty ?? 1)).toFixed(1)} lb
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '.1rem .45rem', lineHeight: 1 }}
                    onClick={() => updateInventoryItem(i, { qty: Math.max(1, (item.qty ?? 1) - 1) })}
                  >−</button>
                  <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>
                    {item.qty ?? 1}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '.1rem .45rem', lineHeight: 1 }}
                    onClick={() => updateInventoryItem(i, { qty: (item.qty ?? 1) + 1 })}
                  >+</button>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ padding: '.1rem .5rem', lineHeight: 1 }}
                  onClick={() => removeInventoryItem(i)}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
