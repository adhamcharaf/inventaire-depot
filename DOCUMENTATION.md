# Doc Conception - App Inventaire Palettes 3D

**Type:** PWA mobile only, offline  
**But:** Compter rapidement les articles sur palettes incomplètes

---

## Concept

App mobile pour inventorier des palettes 3D (L×l×H) en cliquant pour retirer/ajouter des articles.  
**Règle physique:** Pas d'articles flottants - si tu retires un article, tous ceux au-dessus disparaissent automatiquement.

---

## Fonctionnalités

### 1. Créer une palette
- Saisir dimensions : Longueur (1-20), Largeur (1-20), Hauteur (1-10)
- Nom optionnel
- Génère une palette **pleine** par défaut

### 2. Visualiser en 3D
- Affichage Three.js avec cubes colorés
- Rotation : drag ou boutons
- Zoom : pinch ou +/-
- Vues rapides : Face, Côté, Dessus, Iso

### 3. Interaction
- **Clic sur cube présent** → Retrait + retrait auto de tous au-dessus (gravité)
- **Clic sur cube absent** → Ajout seulement si support en-dessous (ou niveau 0)

### 4. Comptage temps réel
Badge fixe visible : "287/400 (72%)"

### 5. Sauvegarde auto
- IndexedDB local
- Auto-save toutes les 5 sec
- Liste des inventaires récents (dimensions, %, date)
- Reprendre/Supprimer

### 6. Actions rapides
- "Tout remplir"
- "Tout vider"  
- "Reset vue"

---

## Règle de gravité (critique)

**Retrait:** Article à (x,y,z) retiré → Tous (x,y,z+1), (x,y,z+2)... automatiquement retirés  
**Ajout:** Article à (x,y,z>0) ajouté → Uniquement si (x,y,z-1) existe

---

## Tech Stack

- React 18 + Vite
- Three.js ou React Three Fiber
- Tailwind CSS
- IndexedDB
- PWA (Service Worker + Manifest)

---

## Écrans

**Accueil**
- Bouton "Nouvelle Palette"
- Liste inventaires récents
- Actions : Reprendre / Supprimer

**Formulaire**
- 3 sliders (L, l, H)
- Nom optionnel
- Capacité totale affichée
- Bouton "Créer"

**Vue 3D**
- Plein écran
- Badge stats (coin supérieur)
- Contrôles en bottom sheet (rotation, zoom, vues)
- Boutons : Reset, Remplir, Vider, Accueil

---

## PWA

- Manifest (icons 192/512)
- Service Worker cache-first
- Installable
- 100% offline

---

## Notes

- Mobile only (iOS Safari + Chrome Android)
- État initial : palette pleine
- Animations retrait/ajout
- Structure de données : à la discrétion de Claude Code

---

**C'est tout. Claude Code gère le reste.**
