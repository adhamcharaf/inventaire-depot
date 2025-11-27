// Configuration centralisée des dimensions
export const PALETTE_CONFIG = {
  length: { min: 1, max: 20, default: 5 },
  width: { min: 1, max: 20, default: 5 },
  height: { min: 1, max: 10, default: 4 }
}

// Couleurs des cubes
export const CUBE_COLORS = {
  fill: 0x3B82F6,      // Bleu Tailwind 500
  edge: 0x1E3A8A,      // Bleu Tailwind 900
  hover: 0x60A5FA,     // Bleu Tailwind 400
  absent: 0xE2E8F0     // Slate 200 (emplacement vide)
}

// Auto-save interval (ms)
export const AUTO_SAVE_INTERVAL = 5000
