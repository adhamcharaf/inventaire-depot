// Configuration centralisée des dimensions
export const PALETTE_CONFIG = {
  length: { min: 1, max: 50, default: 5 },
  width: { min: 1, max: 50, default: 5 },
  height: { min: 1, max: 50, default: 4 }
}

// Couleurs des cubes (palette carton)
export const CUBE_COLORS = {
  fill: 0xC9A66B,      // Carton naturel
  edge: 0x8B6914,      // Contour marron foncé
  hover: 0xE8D4B0,     // Carton clair au survol
  absent: 0xF5F0E8     // Emplacement vide beige
}

// Auto-save interval (ms)
export const AUTO_SAVE_INTERVAL = 5000
