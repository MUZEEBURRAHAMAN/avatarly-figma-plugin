// Avatarly - Figma Plugin Controller (v5.0 Full Live Status Overlay Engine)
const command = figma.command || 'open-ui';

function createImageFromBytes(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') {
    throw new Error('Invalid image payload');
  }
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return figma.createImage(bytes);
}

// Curated Persona Dataset for Smart Persona Sync & Initials
const PERSONAS = [
  { name: 'Sarah Jenkins', role: 'Lead Product Designer', handle: '@sarah.ux' },
  { name: 'Alex Rivera', role: 'Staff Frontend Architect', handle: '@arivera' },
  { name: 'Elena Rostova', role: 'Head of Growth', handle: '@elena_growth' },
  { name: 'Marcus Chen', role: 'Principal Engineer', handle: '@mchen' },
  { name: 'Amara Okafor', role: 'Engineering Director', handle: '@amara.o' },
  { name: 'Liam Gallagher', role: 'Senior UX Researcher', handle: '@liam.ux' },
  { name: 'Chloe Dubois', role: 'Design Systems Lead', handle: '@chloed' },
  { name: 'Kai Takahashi', role: 'Brand & Creative Director', handle: '@kai.t' },
  { name: 'Zoe Martinez', role: 'VP of Product', handle: '@zoe.pm' },
  { name: 'David Kim', role: 'AI & Data Specialist', handle: '@dkim' },
  { name: 'Maya Patel', role: 'Operations Manager', handle: '@maya.p' },
  { name: 'Lucas Silva', role: 'Full Stack Developer', handle: '@lsilva' }
];

async function updateTextNodeSafely(textNode, newText) {
  try {
    if (!textNode || textNode.type !== 'TEXT') return;
    if (textNode.fontName === figma.mixed) {
      const len = textNode.characters.length;
      for (let i = 0; i < len; i++) {
        await figma.loadFontAsync(textNode.getRangeFontName(i, i + 1));
      }
    } else {
      await figma.loadFontAsync(textNode.fontName);
    }
    textNode.characters = newText;
  } catch (e) {
    // Graceful fallback
  }
}

// 🧠 Deep-Layer Smart Auto-Detector Engine
function scanSelectionTargets() {
  const sel = figma.currentPage.selection;
  if (!sel || sel.length === 0) {
    return { count: 0, avatarNodes: [], textNodes: [], isNested: false, frameName: '' };
  }

  const directShapes = [];
  const directTexts = [];

  for (const node of sel) {
    if (!node || node.removed) continue;
    if (node.type === 'ELLIPSE' || node.type === 'POLYGON' || node.type === 'STAR' || node.type === 'VECTOR' || node.type === 'RECTANGLE') {
      directShapes.push(node);
    } else if (node.type === 'TEXT') {
      directTexts.push(node);
    }
  }

  if (directShapes.length > 0) {
    return {
      count: directShapes.length,
      avatarNodes: directShapes,
      textNodes: directTexts,
      isNested: false,
      frameName: ''
    };
  }

  const nestedAvatarNodes = [];
  const nestedTextNodes = [];
  const parentFrameName = sel[0].name || '';

  function walk(node) {
    if (!node || node.removed) return;

    if (node.type === 'ELLIPSE') {
      nestedAvatarNodes.push(node);
    } else if (node.type === 'RECTANGLE' || node.type === 'FRAME' || node.type === 'INSTANCE') {
      const isSquare = Math.abs(node.width - node.height) < Math.max(node.width, node.height) * 0.25;
      const isAvatarNamed = /(avatar|profile|user|photo|image|face|thumb|icon|member|author)/i.test(node.name);
      if ((isSquare && node.width <= 260 && node.width >= 16) || isAvatarNamed) {
        if ('fills' in node) nestedAvatarNodes.push(node);
      }
    } else if (node.type === 'TEXT') {
      nestedTextNodes.push(node);
    }

    if ('children' in node && node.type !== 'INSTANCE') {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  for (const root of sel) {
    walk(root);
  }

  const foundAvatars = nestedAvatarNodes.length > 0;
  return {
    count: foundAvatars ? nestedAvatarNodes.length : sel.length,
    avatarNodes: foundAvatars ? nestedAvatarNodes : sel,
    textNodes: nestedTextNodes,
    isNested: foundAvatars,
    frameName: parentFrameName
  };
}

function sendSelectionUpdate() {
  const scan = scanSelectionTargets();
  figma.ui.postMessage({
    type: 'selection',
    count: scan.count,
    isNested: scan.isNested,
    frameName: scan.frameName,
    hasText: scan.textNodes.length > 0
  });
}

function openStudioUI() {
  figma.showUI(__html__, {
    width: 420,
    height: 700,
    title: 'Avatarly Studio',
    themeColors: true
  });
  sendSelectionUpdate();
}

// 🟢 Attach Status Badge directly to an existing Canvas Node
function attachStatusBadgeToNode(node, badgeType = 'none') {
  if (!node || node.removed || badgeType === 'none') return;
  const par = node.parent || figma.currentPage;

  const w = node.width || 64;
  const h = node.height || 64;

  if (badgeType === 'story') {
    if ('strokes' in node) {
      node.strokes = [{
        type: 'GRADIENT_LINEAR',
        gradientTransform: [[0.7, 0.7, 0], [-0.7, 0.7, 0.5]],
        gradientStops: [
          { position: 0, color: { r: 0.85, g: 0.15, b: 0.85, a: 1 } },
          { position: 0.5, color: { r: 0.95, g: 0.3, b: 0.2, a: 1 } },
          { position: 1, color: { r: 0.98, g: 0.75, b: 0.1, a: 1 } }
        ]
      }];
      node.strokeWeight = Math.max(Math.round(w * 0.05), 3);
      node.strokeAlign = 'OUTSIDE';
    }
    return;
  }

  if (badgeType === 'online') {
    const bSize = Math.max(Math.round(Math.min(w, h) * 0.26), 14);
    const badge = figma.createEllipse();
    badge.name = 'Status / Online';
    badge.resize(bSize, bSize);
    badge.x = node.x + w - bSize;
    badge.y = node.y + h - bSize;
    badge.fills = [{ type: 'SOLID', color: { r: 0.06, g: 0.72, b: 0.51 } }];
    badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    badge.strokeWeight = 2.5;
    par.appendChild(badge);
  } else if (badgeType === 'away') {
    const bSize = Math.max(Math.round(Math.min(w, h) * 0.26), 14);
    const badge = figma.createEllipse();
    badge.name = 'Status / Away';
    badge.resize(bSize, bSize);
    badge.x = node.x + w - bSize;
    badge.y = node.y + h - bSize;
    badge.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.62, b: 0.04 } }];
    badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    badge.strokeWeight = 2.5;
    par.appendChild(badge);
  } else if (badgeType === 'verified') {
    const bSize = Math.max(Math.round(Math.min(w, h) * 0.32), 16);
    const verifiedSvg = `<svg viewBox="0 0 24 24" width="${bSize}" height="${bSize}" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#2563EB"/><circle cx="12" cy="12" r="11" stroke="#FFFFFF" stroke-width="2"/><path d="M7.5 12.2L10.3 15L16.5 8.8" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const badge = figma.createNodeFromSvg(verifiedSvg);
    badge.name = 'Badge / Verified';
    badge.x = node.x + w - bSize;
    badge.y = node.y + h - bSize;
    par.appendChild(badge);
  }
}

// 🟢 1. Live Status & Story Ring Wrapper Generator (for new insertions)
function createBadgeAvatarFrame(item, badgeType = 'none', size = 80) {
  const frame = figma.createFrame();
  frame.name = `Avatar ${badgeType !== 'none' ? `(${badgeType})` : ''}`.trim();
  frame.fills = [];
  frame.clipsContent = false;

  if (badgeType === 'story') {
    const pad = 6;
    const totalSize = size + pad * 2;
    frame.resize(totalSize, totalSize);

    const ring = figma.createEllipse();
    ring.name = 'Story Ring';
    ring.resize(totalSize, totalSize);
    ring.x = 0;
    ring.y = 0;
    ring.fills = [];
    ring.strokes = [{
      type: 'GRADIENT_LINEAR',
      gradientTransform: [[0.7, 0.7, 0], [-0.7, 0.7, 0.5]],
      gradientStops: [
        { position: 0, color: { r: 0.85, g: 0.15, b: 0.85, a: 1 } },
        { position: 0.5, color: { r: 0.95, g: 0.3, b: 0.2, a: 1 } },
        { position: 1, color: { r: 0.98, g: 0.75, b: 0.1, a: 1 } }
      ]
    }];
    ring.strokeWeight = 3.5;
    frame.appendChild(ring);

    const avatar = figma.createEllipse();
    avatar.name = 'Avatar Image';
    avatar.resize(size, size);
    avatar.x = pad;
    avatar.y = pad;
    if (item.base64Png) {
      const img = createImageFromBytes(item.base64Png);
      avatar.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
    }
    frame.appendChild(avatar);
    return frame;
  }

  frame.resize(size, size);
  const avatar = figma.createEllipse();
  avatar.name = 'Avatar Image';
  avatar.resize(size, size);
  avatar.x = 0;
  avatar.y = 0;
  if (item.base64Png) {
    const img = createImageFromBytes(item.base64Png);
    avatar.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
  }
  frame.appendChild(avatar);

  if (badgeType === 'online') {
    const bSize = Math.round(size * 0.26);
    const badge = figma.createEllipse();
    badge.name = 'Status / Online';
    badge.resize(bSize, bSize);
    badge.x = size - bSize;
    badge.y = size - bSize;
    badge.fills = [{ type: 'SOLID', color: { r: 0.06, g: 0.72, b: 0.51 } }];
    badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    badge.strokeWeight = 2.5;
    frame.appendChild(badge);
  } else if (badgeType === 'away') {
    const bSize = Math.round(size * 0.26);
    const badge = figma.createEllipse();
    badge.name = 'Status / Away';
    badge.resize(bSize, bSize);
    badge.x = size - bSize;
    badge.y = size - bSize;
    badge.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.62, b: 0.04 } }];
    badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    badge.strokeWeight = 2.5;
    frame.appendChild(badge);
  } else if (badgeType === 'verified') {
    const bSize = Math.round(size * 0.32);
    const verifiedSvg = `<svg viewBox="0 0 24 24" width="${bSize}" height="${bSize}" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#2563EB"/><circle cx="12" cy="12" r="11" stroke="#FFFFFF" stroke-width="2"/><path d="M7.5 12.2L10.3 15L16.5 8.8" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const badge = figma.createNodeFromSvg(verifiedSvg);
    badge.name = 'Badge / Verified';
    badge.x = size - bSize;
    badge.y = size - bSize;
    frame.appendChild(badge);
  }

  return frame;
}

// 🔤 2. Smart "Avatar-to-Initials" Dual Component Set Generator
async function createPhotoInitialsComponentSet(item, persona = PERSONAS[0], size = 64) {
  // 1. Ensure default Inter Regular is always loaded first
  await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(() => {});

  let targetFont = { family: "Inter", style: "Regular" };

  try {
    await figma.loadFontAsync({ family: "Archivo", style: "Bold" });
    targetFont = { family: "Archivo", style: "Bold" };
  } catch {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      targetFont = { family: "Inter", style: "Bold" };
    } catch {
      try {
        await figma.loadFontAsync({ family: "Roboto", style: "Bold" });
        targetFont = { family: "Roboto", style: "Bold" };
      } catch (e) {
        targetFont = { family: "Inter", style: "Regular" };
      }
    }
  }

  const compPhoto = figma.createComponent();
  compPhoto.name = 'State=Photo';
  compPhoto.resize(size, size);
  compPhoto.fills = [];
  compPhoto.cornerSmoothing = 1.0;

  const ellipsePhoto = figma.createEllipse();
  ellipsePhoto.name = 'Image';
  ellipsePhoto.resize(size, size);
  if (item.base64Png) {
    const img = createImageFromBytes(item.base64Png);
    ellipsePhoto.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
  }
  compPhoto.appendChild(ellipsePhoto);

  const compInitials = figma.createComponent();
  compInitials.name = 'State=Initials';
  compInitials.resize(size, size);
  compInitials.fills = [];
  compInitials.cornerSmoothing = 1.0;

  const ellipseInitials = figma.createEllipse();
  ellipseInitials.name = 'Background';
  ellipseInitials.resize(size, size);
  ellipseInitials.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 1 } }];
  compInitials.appendChild(ellipseInitials);

  const initials = persona.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const textNode = figma.createText();
  textNode.name = 'Initials';
  try {
    textNode.fontName = targetFont;
  } catch (e) {}
  textNode.characters = initials;
  textNode.fontSize = Math.round(size * 0.36);
  textNode.fills = [{ type: 'SOLID', color: { r: 0.14, g: 0.39, b: 0.92 } }];
  textNode.textAlignHorizontal = 'CENTER';
  textNode.textAlignVertical = 'CENTER';
  textNode.resize(size, size);
  textNode.x = 0;
  textNode.y = 0;
  compInitials.appendChild(textNode);

  compPhoto.x = 0;
  compPhoto.y = 0;
  compInitials.x = size + 40;
  compInitials.y = 0;

  const componentSet = figma.combineAsVariants([compPhoto, compInitials], figma.currentPage);
  componentSet.name = 'Avatar / User Profile';
  componentSet.cornerSmoothing = 1.0;

  const c = figma.viewport.center;
  componentSet.x = Math.round(c.x - componentSet.width / 2);
  componentSet.y = Math.round(c.y - componentSet.height / 2);

  figma.currentPage.selection = [componentSet];
  figma.viewport.scrollAndZoomIntoView([componentSet]);
  return componentSet;
}

// 📦 3. Design-System Component Set Generator (Content x State variants + size scale)
async function generateComponentSet(item, scope, setName) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(() => {});

  let boldFont = { family: "Inter", style: "Regular" };
  try {
    await figma.loadFontAsync({ family: "Archivo", style: "Bold" });
    boldFont = { family: "Archivo", style: "Bold" };
  } catch {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      boldFont = { family: "Inter", style: "Bold" };
    } catch {}
  }

  const size = 96;
  const pad = 10;
  const total = size + pad * 2;
  const states = ['Default', 'Hover', 'Active', 'Selected', 'Disabled'];
  const contents = scope === 'photo' ? ['Photo'] : scope === 'initials' ? ['Initials'] : ['Photo', 'Initials'];
  const multiAxis = contents.length > 1;

  const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  const initials = persona.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const img = item.base64Png ? createImageFromBytes(item.base64Png) : null;

  const primaryColor = { r: 0.537, g: 0, b: 0.682 };
  const initialsBg = { r: 0.984, g: 0.941, b: 0.992 };

  const variants = [];
  contents.forEach((content, col) => {
    states.forEach((state, row) => {
      const comp = figma.createComponent();
      comp.name = multiAxis ? `Content=${content}, State=${state}` : `State=${state}`;
      comp.resize(total, total);
      comp.fills = [];
      comp.cornerSmoothing = 1.0;

      const circle = figma.createEllipse();
      circle.resize(size, size);
      circle.x = pad;
      circle.y = pad;

      if (content === 'Photo') {
        circle.name = 'Image';
        circle.fills = img
          ? [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }]
          : [{ type: 'SOLID', color: { r: 0.89, g: 0.91, b: 0.94 } }];
      } else {
        circle.name = 'Background';
        circle.fills = [{ type: 'SOLID', color: initialsBg }];
      }
      comp.appendChild(circle);

      if (content === 'Initials') {
        const text = figma.createText();
        text.name = 'Initials';
        try { text.fontName = boldFont; } catch {}
        text.characters = initials;
        text.fontSize = Math.round(size * 0.34);
        text.fills = [{ type: 'SOLID', color: primaryColor }];
        text.textAlignHorizontal = 'CENTER';
        text.textAlignVertical = 'CENTER';
        text.resize(size, size);
        text.x = pad;
        text.y = pad;
        comp.appendChild(text);
      }

      if (state === 'Hover') {
        const ring = figma.createEllipse();
        ring.name = 'Hover Ring';
        ring.resize(total, total);
        ring.fills = [];
        ring.strokes = [{ type: 'SOLID', color: primaryColor }];
        ring.strokeWeight = 2;
        ring.opacity = 0.45;
        comp.appendChild(ring);
      } else if (state === 'Active') {
        const overlay = figma.createEllipse();
        overlay.name = 'Active Overlay';
        overlay.resize(size, size);
        overlay.x = pad;
        overlay.y = pad;
        overlay.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.18 }];
        comp.appendChild(overlay);
      } else if (state === 'Selected') {
        const ring = figma.createEllipse();
        ring.name = 'Selected Ring';
        ring.resize(total, total);
        ring.fills = [];
        ring.strokes = [{ type: 'SOLID', color: primaryColor }];
        ring.strokeWeight = 3;
        comp.appendChild(ring);

        const bSize = Math.round(size * 0.3);
        const badgeSvg = `<svg width="${bSize}" height="${bSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#8900AE"/><circle cx="12" cy="12" r="11" stroke="#FFFFFF" stroke-width="2"/><path d="M7.5 12.2L10.3 15L16.5 8.8" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        const badge = figma.createNodeFromSvg(badgeSvg);
        badge.name = 'Selected Badge';
        badge.x = pad + size - bSize;
        badge.y = pad + size - bSize;
        comp.appendChild(badge);
      } else if (state === 'Disabled') {
        comp.opacity = 0.4;
      }

      comp.x = col * (total + 32);
      comp.y = row * (total + 32);
      variants.push(comp);
    });
  });

  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = setName;
  componentSet.cornerSmoothing = 1.0;

  // Size-scale preview row so the avatar's legibility can be checked at
  // every size it will actually ship at, before anyone hands it off.
  const sizes = [16, 24, 32, 40, 56, 80, 120];
  const scaleRow = figma.createFrame();
  scaleRow.name = `${setName} / Size Scale`;
  scaleRow.fills = [];
  scaleRow.layoutMode = 'HORIZONTAL';
  scaleRow.itemSpacing = 28;
  scaleRow.counterAxisAlignItems = 'MAX';
  scaleRow.primaryAxisSizingMode = 'AUTO';
  scaleRow.counterAxisSizingMode = 'AUTO';

  for (const s of sizes) {
    const cell = figma.createFrame();
    cell.name = `${s}px`;
    cell.fills = [];
    cell.layoutMode = 'VERTICAL';
    cell.itemSpacing = 6;
    cell.counterAxisAlignItems = 'CENTER';
    cell.primaryAxisSizingMode = 'AUTO';
    cell.counterAxisSizingMode = 'AUTO';

    const preview = figma.createEllipse();
    preview.name = 'Preview';
    preview.resize(s, s);
    preview.fills = img
      ? [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }]
      : [{ type: 'SOLID', color: initialsBg }];
    cell.appendChild(preview);

    const label = figma.createText();
    label.name = 'Label';
    try { label.fontName = { family: 'Inter', style: 'Regular' }; } catch {}
    label.characters = `${s}px`;
    label.fontSize = 10;
    label.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.51 } }];
    cell.appendChild(label);

    scaleRow.appendChild(cell);
  }

  scaleRow.x = componentSet.x;
  scaleRow.y = componentSet.y + componentSet.height + 40;
  figma.currentPage.appendChild(scaleRow);

  figma.currentPage.selection = [componentSet, scaleRow];
  figma.viewport.scrollAndZoomIntoView([componentSet, scaleRow]);
  return componentSet;
}

// Check if headless command
const isHeadless = typeof command === 'string' && command.startsWith('quick-');
const hasSelection = figma.currentPage.selection.length > 0;

if (isHeadless && hasSelection) {
  figma.showUI(__html__, { visible: false });
  const scan = scanSelectionTargets();
  figma.ui.postMessage({
    type: 'exec-headless-command',
    command: command,
    selectionCount: scan.count
  });
} else {
  openStudioUI();
}

// Message Dispatcher
figma.ui.onmessage = async function(msg) {
  if (!msg || typeof msg !== 'object') return;

  try {
    if (msg.type === 'apply-batch-avatars') {
      const items = Array.isArray(msg.items) ? msg.items : [];
      if (items.length === 0) throw new Error('No avatar payload received');

      const scan = scanSelectionTargets();
      const targetNodes = scan.avatarNodes;
      const targetTexts = scan.textNodes;
      const syncPersona = msg.syncPersona === true;
      const badgeType = msg.badgeType || 'none';

      if (targetNodes.length > 0) {
        let appliedCount = 0;

        for (let i = 0; i < targetNodes.length; i++) {
          const node = targetNodes[i];
          if (!node || node.removed) continue;

          const item = items[i % items.length];

          if (item.base64Png) {
            const img = createImageFromBytes(item.base64Png);
            if ('fills' in node) {
              node.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
              attachStatusBadgeToNode(node, badgeType);
              appliedCount++;
            }
          } else if (item.isSvg && !('fills' in node)) {
            const s = Math.min(node.width, node.height) || 80;
            const svgNode = figma.createNodeFromSvg(item.data);
            svgNode.resize(s, s);
            svgNode.x = node.x;
            svgNode.y = node.y;
            svgNode.name = item.label || 'Avatarly';
            const par = node.parent;
            if (par) {
              const idx = par.children.indexOf(node);
              node.remove();
              par.insertChild(idx, svgNode);
            }
            appliedCount++;
          }
        }

        // 🎭 Smart Persona Sync for Text Layers
        if (syncPersona && targetTexts.length > 0) {
          for (let t = 0; t < targetTexts.length; t++) {
            const textNode = targetTexts[t];
            const persona = PERSONAS[t % PERSONAS.length];
            const isRole = /(title|role|job|position|occupation|desc)/i.test(textNode.name);
            const isHandle = /(handle|email|username|tag)/i.test(textNode.name);

            if (isRole) {
              await updateTextNodeSafely(textNode, persona.role);
            } else if (isHandle) {
              await updateTextNodeSafely(textNode, persona.handle);
            } else {
              await updateTextNodeSafely(textNode, persona.name);
            }
          }
        }

        const badgeSuffix = badgeType !== 'none' ? ` + ${badgeType} badge` : '';
        const notifyMsg = scan.isNested
          ? `🎯 Auto-filled ${appliedCount} avatars inside "${scan.frameName}"${badgeSuffix}!`
          : appliedCount === 1 ? `⚡ 1 layer filled with avatar${badgeSuffix}!` : `⚡ ${appliedCount} layers auto-filled${badgeSuffix}!`;
        
        if (msg.isHeadless) {
          figma.notify(notifyMsg, {
            button: {
              text: 'Open Studio',
              action: () => {
                openStudioUI();
                return false;
              }
            }
          });
          figma.closePlugin();
        } else {
          figma.notify(notifyMsg);
          figma.ui.postMessage({ type: 'ok', text: notifyMsg });
        }
        return;
      }

      // No selection: Insert with status badge or clean shape
      const item = items[0];
      const s = 80;
      const c = figma.viewport.center;
      let newNode;

      if (badgeType !== 'none') {
        newNode = createBadgeAvatarFrame(item, badgeType, s);
      } else {
        if (item.base64Png) {
          const img = createImageFromBytes(item.base64Png);
          newNode = figma.createEllipse();
          newNode.resize(s, s);
          newNode.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
        } else if (item.isSvg) {
          newNode = figma.createNodeFromSvg(item.data);
          newNode.resize(s, s);
        }
      }

      if (newNode) {
        newNode.x = Math.round(c.x - newNode.width / 2);
        newNode.y = Math.round(c.y - newNode.height / 2);
        figma.currentPage.appendChild(newNode);
        figma.currentPage.selection = [newNode];
        figma.viewport.scrollAndZoomIntoView([newNode]);
      }

      const notifyMsg = badgeType !== 'none' ? `✨ Avatar with ${badgeType} badge added!` : '✨ New avatar added to canvas!';
      if (msg.isHeadless) {
        figma.notify(notifyMsg, {
          button: {
            text: 'Open Studio',
            action: () => {
              openStudioUI();
              return false;
            }
          }
        });
        figma.closePlugin();
      } else {
        figma.notify(notifyMsg);
        figma.ui.postMessage({ type: 'ok', text: notifyMsg });
      }
    }

    else if (msg.type === 'create-dual-component') {
      const items = Array.isArray(msg.items) ? msg.items : [];
      if (items.length === 0) throw new Error('No item provided');
      const item = items[0];
      const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
      await createPhotoInitialsComponentSet(item, persona, 64);
      figma.notify('📦 Created "Avatar / User Profile" Design System Component Set!');
      figma.ui.postMessage({ type: 'ok', text: 'Created Component Set with Photo & Initials!' });
    }

    else if (msg.type === 'generate-component-set') {
      const item = msg.item;
      if (!item) throw new Error('No item provided');
      const scope = ['both', 'photo', 'initials'].includes(msg.scope) ? msg.scope : 'both';
      const name = (typeof msg.name === 'string' && msg.name.trim()) || 'User Avatar';
      await generateComponentSet(item, scope, name);
      figma.notify(`📦 Generated "${name}" component set with size scale!`);
      figma.ui.postMessage({ type: 'ok', text: `Generated "${name}" component set!` });
    }

    else if (msg.type === 'apply-avatar') {
      const scan = scanSelectionTargets();
      const sel = scan.avatarNodes;
      const targetTexts = scan.textNodes;
      const syncPersona = msg.syncPersona === true;
      const badgeType = msg.badgeType || 'none';

      if (sel.length > 0) {
        if (msg.base64Png) {
          const img = createImageFromBytes(msg.base64Png);
          let count = 0;
          for (const node of sel) {
            if (node && !node.removed && 'fills' in node) {
              node.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
              attachStatusBadgeToNode(node, badgeType);
              count++;
            }
          }

          if (syncPersona && targetTexts.length > 0) {
            const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
            for (const textNode of targetTexts) {
              const isRole = /(title|role|job|position)/i.test(textNode.name);
              await updateTextNodeSafely(textNode, isRole ? persona.role : persona.name);
            }
          }

          const badgeSuffix = badgeType !== 'none' ? ` + ${badgeType} badge` : '';
          figma.notify(`⚡ Applied to ${count} layer${count > 1 ? 's' : ''}${badgeSuffix}!`);
          figma.ui.postMessage({ type: 'ok', text: `Applied to ${count} layer${count > 1 ? 's' : ''}${badgeSuffix}!` });
          return;
        } else if (msg.isSvg) {
          const tgt = sel[0];
          if (!tgt || tgt.removed) return;
          const s = Math.min(tgt.width, tgt.height) || 80;
          const svgNode = figma.createNodeFromSvg(msg.data);
          svgNode.resize(s, s);
          svgNode.x = tgt.x;
          svgNode.y = tgt.y;
          svgNode.name = msg.label || 'Avatarly';
          const par = tgt.parent;
          if (par) {
            const idx = par.children.indexOf(tgt);
            tgt.remove();
            par.insertChild(idx, svgNode);
          } else {
            tgt.remove();
            figma.currentPage.appendChild(svgNode);
          }
          figma.currentPage.selection = [svgNode];
          figma.notify('⚡ Vector avatar applied!');
          figma.ui.postMessage({ type: 'ok', text: 'Vector avatar applied!' });
          return;
        }
      }

      // No selection: create at center
      const s = 80;
      const c = figma.viewport.center;
      let node;

      if (badgeType !== 'none') {
        node = createBadgeAvatarFrame(msg, badgeType, s);
      } else {
        if (msg.base64Png) {
          const img = createImageFromBytes(msg.base64Png);
          node = figma.createEllipse();
          node.resize(s, s);
          node.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
        } else if (msg.isSvg) {
          node = figma.createNodeFromSvg(msg.data);
          node.resize(s, s);
        }
      }

      if (node) {
        node.name = msg.label || 'Avatarly';
        node.x = Math.round(c.x - node.width / 2);
        node.y = Math.round(c.y - node.height / 2);
        figma.currentPage.appendChild(node);
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
        figma.notify(`✨ Avatar${badgeType !== 'none' ? ` (${badgeType})` : ''} added to canvas!`);
        figma.ui.postMessage({ type: 'ok', text: 'Avatar added to canvas!' });
      }
    }

    else if (msg.type === 'insert-stack') {
      const items = Array.isArray(msg.items) ? msg.items : [];
      if (items.length === 0) throw new Error('No stack items provided');

      const s = 52;
      const overlap = 16;
      const c = figma.viewport.center;
      const count = Math.min(items.length, 5);

      const frame = figma.createFrame();
      frame.name = 'Avatar Stack';
      frame.fills = [];
      frame.cornerSmoothing = 1.0;
      frame.resize(s + (count - 1) * (s - overlap), s);
      frame.x = Math.round(c.x - frame.width / 2);
      frame.y = Math.round(c.y - frame.height / 2);

      for (let i = 0; i < count; i++) {
        const item = items[i];
        let avatarNode;
        if (item.base64Png) {
          const img = createImageFromBytes(item.base64Png);
          avatarNode = figma.createEllipse();
          avatarNode.resize(s, s);
          avatarNode.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: img.hash }];
        } else if (item.isSvg) {
          avatarNode = figma.createNodeFromSvg(item.data);
          avatarNode.resize(s, s);
        }

        if (avatarNode) {
          avatarNode.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
          avatarNode.strokeWeight = 2.5;
          avatarNode.x = i * (s - overlap);
          avatarNode.y = 0;
          frame.appendChild(avatarNode);
        }
      }

      figma.currentPage.appendChild(frame);
      figma.currentPage.selection = [frame];
      figma.viewport.scrollAndZoomIntoView([frame]);
      figma.notify('✨ Team Avatar Stack created!');
      figma.ui.postMessage({ type: 'ok', text: 'Team Avatar Stack created!' });
    }

    else if (msg.type === 'close') {
      figma.closePlugin();
    }
  } catch (err) {
    const errorMsg = err && err.message ? err.message : 'Execution error';
    figma.notify('❌ ' + errorMsg);
    if (msg && msg.isHeadless) {
      figma.closePlugin();
    } else {
      figma.ui.postMessage({ type: 'err', text: 'Failed: ' + errorMsg });
    }
  }
};

figma.on('selectionchange', function() {
  sendSelectionUpdate();
});
