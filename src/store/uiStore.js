import { create } from 'zustand';

const useUIStore = create((set) => ({
  diceRoll: null,

  roll({ label, bonus = 0, advantage = false, disadvantage = false }) {
    const r1 = Math.ceil(Math.random() * 20);
    const r2 = (advantage || disadvantage) ? Math.ceil(Math.random() * 20) : null;
    let die;
    if (advantage)         die = Math.max(r1, r2);
    else if (disadvantage) die = Math.min(r1, r2);
    else                   die = r1;
    set({
      diceRoll: {
        label, bonus, die, total: die + bonus,
        r1, r2,
        advantage, disadvantage,
        isCrit:   die === 20,
        isFumble: die === 1,
      },
    });
  },

  clearRoll: () => set({ diceRoll: null }),
}));

export default useUIStore;
