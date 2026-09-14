# Avatarly — Design System & Architecture Specification

## 1. Product Overview
**Avatarly** is a high-performance, deterministic avatar generation and auto-fill plugin for Figma. It solves workflow friction, repetitive placeholder content, and layout destruction through headless Quick Actions and non-destructive image/vector insertion.

---

## 2. Design System Tokens

### Typography
* **Primary Heading Font:** `Plus Jakarta Sans`, -apple-system, sans-serif (Weights: 600, 700, 800)
* **Body / UI Font:** `Inter`, -apple-system, sans-serif (Weights: 400, 500, 600)
* **Code / Shortcut Font:** `ui-monospace`, `SFMono-Regular`, Menlo, monospace

### Color Palette (Tailored HSL / Hex Tokens)
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-primary:    #FFFFFF;
  --bg-secondary:  #F8FAFC;
  --bg-tertiary:   #F1F5F9;
  --surface:       #FFFFFF;

  /* Typography & Hierarchy */
  --text-main:     #0F172A; /* Slate 900 */
  --text-sub:      #475569; /* Slate 600 */
  --text-muted:    #94A3B8; /* Slate 400 */

  /* Borders & Dividers */
  --border:        #E2E8F0; /* Slate 200 */
  --border-focus:  #C900FF; /* Neon Violet Accent */

  /* Brand Accents (5-Color Purple System) */
  --primary:       #8900AE; /* Deep Vivid Violet */
  --primary-hover: #5D0076; /* Rich Plum */
  --primary-light: #FBF0FD; /* Soft Lavender Tint */
  --accent:        #C900FF; /* Electric Neon Purple */
  --accent-dark:   #330040; /* Midnight Eggplant */
  --neutral-dark:  #000000; /* Obsidian Black */
  --success:       #10B981; /* Emerald */
  --success-bg:    #ECFDF5;

  /* Geometry & Elevation */
  --radius-sm:     6px;
  --radius-md:     10px;
  --radius-lg:     14px;
  --shadow-sm:     0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:     0 4px 12px -2px rgba(15, 23, 42, 0.08);
}
```

---

## 3. Iconography: Phosphor Duotone / Two-Tone

All icons use a 2-layer vector construction:
* **Layer 1 (Secondary Tone / Depth):** Fill with `opacity="0.2"` (or `0.25`)
* **Layer 2 (Primary Tone / Structure):** Outline with `stroke="currentColor"` (`stroke-width="16"` on 256×256 canvas or `stroke-width="2"` on 24×24 canvas)

| Category / Action | Icon Identifier | Base Palette | Accent Tone |
| :--- | :--- | :--- | :--- |
| **Brand Identity** | `UserCheck` | `#2563EB` | Gradient to `#7C3AED` |
| **Quick Add Mode** | `Lightning` | `#2563EB` | Soft translucent blue fill |
| **Gallery Mode** | `SquaresFour` | `#475569` | Slate 20% fill |
| **Selection Beacon** | `Target / Crosshair` | `#10B981` | Emerald pulse glow |
| **3D & Pixar** | `Cube 3D` | `#9333EA` | Soft violet `#F3E8FF` |
| **4K Realistic** | `Camera` | `#2563EB` | Soft blue `#EFF6FF` |
| **Memoji & Emojis** | `Smiley Winking` | `#D97706` | Amber `#FEF3C7` |
| **Minimal Notionist** | `Pen Nib` | `#475569` | Slate `#F1F5F9` |
| **Hand Doodles** | `Paint Brush` | `#DB2777` | Rose `#FCE7F3` |
| **Cyber & Bots** | `Robot` | `#0D9488` | Teal `#CCFBF1` |
| **Abstract Bento** | `Shapes` | `#4F46E5` | Indigo `#E0E7FF` |
| **Smart Mix** | `Dices` | `#E11D48` | Crimson `#FFE4E6` |

---

## 4. Architectural Workflows

```
                           ┌───────────────────────────┐
                           │   Figma Canvas / User     │
                           └─────────────┬─────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [ Quick Actions: Cmd + / ]                      [ Open Plugin Studio ]
     Headless Execution (`quick-*`)                  Visual Interactive UI (360×600)
                 │                                               │
                 ├───────────────────────────────┬───────────────┤
                 ▼                               ▼               ▼
      [ Selection Detection ]           [ Style Presets ]  [ Filter Pills ]
      • 1+ layers: Batch Fill           • 3D, Realistic,   • All Diverse
      • 0 layers: Center Insert           Memoji, Notionist • Female, Male, Pro
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                    [ Asset Generation Engine ]
                    • 1,000+ Deterministic Seeds
                    • Offline SVG Procedural Fallback (0ms)
                    • Non-Destructive PNG Fill Rasterizer
                                 │
                                 ▼
                     [ Figma Node Controller ]
                     • Fills: IMAGE scale mode (preserves strokes/radii)
                     • Frame insertion (Team Stack: 4-user pill group)
                                 │
                                 ▼
                  [ Interactive Toast Notification ]
                  "⚡ 4 layers auto-filled! [ Open Studio ]"
```

---

## 5. Security & QA Safeguards

1. **Memory Leak Prevention:** All `Blob` and `canvas` object URLs are revoked via `URL.revokeObjectURL()` immediately upon rasterization.
2. **Network Resilience & Fallback:** 2.2s timeout with automated transition to offline dual-tone gradient SVGs.
3. **Safe Binary Ingestion:** Chunked byte conversion preventing call-stack overflows during base64 decoding.
4. **Node Removal Protection:** Null and `.removed` guards on every Figma document layer mutation.

---

## 6. Manifest Commands Reference

| Menu Command | Identifier | Action Type |
| :--- | :--- | :--- |
| `Quick Fill: Selected Shapes (Smart Mix)` | `quick-fill-random` | Headless (Auto-closes with notification) |
| `Quick Fill: 3D & Pixar Style` | `quick-fill-3d` | Headless |
| `Quick Fill: 4K Realistic Photos` | `quick-fill-realistic` | Headless |
| `Quick Fill: Memoji & Emojis` | `quick-fill-memoji` | Headless |
| `Quick Fill: Minimal Notionist` | `quick-fill-minimal` | Headless |
| `Quick Fill: Hand-Drawn Doodles` | `quick-fill-doodles` | Headless |
| `Quick Fill: Abstract Bento` | `quick-fill-abstract` | Headless |
| `Quick Insert: New Avatar` | `quick-insert` | Headless |
| `🎲 Instant Re-Shuffle Selection` | `quick-shuffle` | Headless |
| `📦 Create Photo + Initials Component Set` | `quick-create-component` | Headless |
| `Open Avatarly Studio` | `open-ui` | Interactive Window (360×620) |

---

## 7. Advanced Intelligent Features (v3.0)

### 1. 🧠 Deep-Layer Smart Auto-Detector
* Automatically walks nested Auto-Layout hierarchies (`Table > Row > Cell > Circle`).
* Distinguishes between direct shape targets and nested parent frames.
* Provides dynamic UI feedback: *"Found 6 avatar containers inside Table"* with 1-click batch execution.

### 2. 🎭 Smart Persona Companion
* Synchronizes avatar image generation with realistic names (`Sarah Jenkins`), roles (`Product Designer`), and handles (`@sarah.ux`).
* Auto-loads target text fonts asynchronously without throwing font-missing exceptions.

### 3. 📋 Gallery Micro-Actions (Copy SVG & Single Re-Roll)
* **Copy SVG**: 1-click clipboard extraction of clean SVG code.
* **Single Re-Roll**: Regenerates and refreshes only the targeted tile without re-rendering the full grid.

---

## 8. Category-Defining Innovations (v4.0)

### 1. 🟢 Live Status & Story Ring Overlays
* **Active Online Dot (`🟢`)**: Emerald `#10B981` status badge with 2.5px white border.
* **Away / Moon (`🌙`)**: Amber `#F59E0B` status badge with 2.5px white border.
* **Verified Badge (`🔵`)**: Royal blue `#2563EB` verification checkmark overlay.
* **Instagram Story Ring (`🟣`)**: Concentric 3.5px dual-stop gradient ring (`#D946EF → #F59E0B`).

### 2. 📦 Smart "Avatar-to-Initials" Dual Component Generator
* 1-Click creation of production-ready Figma Component Sets (`Avatar / User Profile`).
* Pre-wires two variants: `State=Photo` and `State=Initials` with auto-calculated persona initials (`"SJ"`).

### 3. 🎲 In-Canvas Live Selection Shuffler
* Headless `quick-shuffle` command and UI shortcut to re-roll active canvas avatars in-place in 0.1s.

---

## 9. 4K UHD Master Photo Engine & Progressive Studio (v5.0)

### 1. 📸 4-Tier 4K UHD Master Photo Engine (Zero Rate Limits)
* **Tier 1: 4K Unsplash Studio Portraits** (`images.unsplash.com`) with `&crop=faces,top&q=85`.
* **Tier 2: 4K Pexels Lummi-Style Portraits** (`images.pexels.com`) with face-centered crop.
* **Tier 3: 200+ Verified HD UI Faces** (`randomuser.me/api/portraits/` Women 1-99 & Men 1-99).
* **Tier 4: 500+ Deterministic Pravatar HD Seeds** (`i.pravatar.cc/400?u=...`).
* **Zero Repeats**: Dynamic 4-way rotation with randomized seed salts ensures 1000+ unique portraits without rate limits or API key requirements.

### 2. 🎯 Clutter-Free Progressive Disclosure Studio
* Streamlined **1-Screen Quick Add view**: Selection Status Hero Card, Archetype Pills, Style Presets, and Primary Action Button.
* Collapsible **`⚙️ Overlays, Personas & Tools`** drawer for power tools (Status Overlays, Persona Sync, Team Stack, Component Set).

### 3. ✨ First-Time User Onboarding Tour
* Automatic first-time user tour modal with persistent state (`localStorage`).
* 4 interactive walkthrough slides explaining multi-layer auto-fill, 4K photo engines, status badges, and `Cmd + /` headless shortcuts.
* Accessible anytime via the top header `?` Help button.

