import { jsPDF } from 'jspdf';

const COLORS = {
  primary:    [79,  70,  229],   // indigo-600
  secondary:  [99,  102, 241],   // indigo-500
  dark:       [15,  23,  42],    // slate-900
  darkMid:    [30,  41,  59],    // slate-800
  accent:     [168, 85,  247],   // purple-500
  text:       [241, 245, 249],   // slate-100
  textMuted:  [148, 163, 184],   // slate-400
  white:      [255, 255, 255],
  instagram:  [236, 72,  153],   // pink-500
  linkedin:   [37,  99,  235],   // blue-600
};

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  linkedin:  'LinkedIn',
};

const TEMPLATE_LABELS = {
  reels:            '🎬 Reels',
  carrossel:        '📱 Carrossel',
  twitter_capa:     '🖼️ Post com Capa',
  twitter_sem_capa: '📝 Post Texto',
  one_page:         '📊 One Page',
  video_roteiro:    '🎥 Roteiro Vídeo',
};

const PILLAR_LABELS = {
  autoridade: 'Autoridade',
  conexao:    'Conexão',
  ensino:     'Ensino',
  desejo:     'Desejo',
  conversao:  'Conversão',
};

function rgb(arr) {
  return { r: arr[0], g: arr[1], b: arr[2] };
}

function setFill(doc, color) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setTextColor(doc, color) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setDrawColor(doc, color) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

export function generatePostPDF({ content, platform, template, contentType, topic, profile, date }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const margin = 18;
  const contentW = W - margin * 2;

  // ── Background ──────────────────────────────────────────────────────────────
  setFill(doc, COLORS.dark);
  doc.rect(0, 0, W, H, 'F');

  // ── Header gradient block ────────────────────────────────────────────────────
  const headerH = 52;
  setFill(doc, COLORS.primary);
  doc.rect(0, 0, W, headerH, 'F');

  // Header accent stripe
  setFill(doc, COLORS.accent);
  doc.rect(0, headerH - 3, W, 3, 'F');

  // Logo / App name
  setTextColor(doc, COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PostGen AI', margin, 12);

  // Date top-right
  const dateStr = date
    ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setTextColor(doc, [199, 210, 254]); // indigo-200
  doc.text(dateStr, W - margin, 12, { align: 'right' });

  // Profile name (large)
  if (profile?.name) {
    setTextColor(doc, COLORS.white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.name, margin, 30);
    if (profile.handle) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setTextColor(doc, [199, 210, 254]);
      doc.text(profile.handle, margin, 38);
    }
  } else {
    setTextColor(doc, COLORS.white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Post Gerado', margin, 32);
  }

  // ── Metadata badges ──────────────────────────────────────────────────────────
  let badgeX = margin;
  const badgeY = headerH + 10;
  const badgeH = 7;
  const badgePad = 3;

  function drawBadge(label, bgColor, textColor) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    const tw = doc.getTextWidth(label);
    const bw = tw + badgePad * 2;
    setFill(doc, bgColor);
    doc.roundedRect(badgeX, badgeY - badgeH + 1, bw, badgeH, 1.5, 1.5, 'F');
    setTextColor(doc, textColor);
    doc.text(label, badgeX + badgePad, badgeY - 0.5);
    badgeX += bw + 3;
  }

  drawBadge(
    PLATFORM_LABELS[platform] || platform,
    platform === 'instagram' ? COLORS.instagram : COLORS.linkedin,
    COLORS.white
  );
  drawBadge(
    PILLAR_LABELS[contentType] || contentType,
    COLORS.accent,
    COLORS.white
  );
  drawBadge(
    TEMPLATE_LABELS[template] || template,
    COLORS.darkMid,
    COLORS.text
  );

  // ── Topic ────────────────────────────────────────────────────────────────────
  const topicY = badgeY + 10;
  if (topic) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setTextColor(doc, COLORS.textMuted);
    doc.text('TÓPICO', margin, topicY);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    setTextColor(doc, COLORS.text);
    const topicLines = doc.splitTextToSize(topic.split('\n')[0], contentW);
    doc.text(topicLines.slice(0, 2), margin, topicY + 5.5);
  }

  // ── Divider ──────────────────────────────────────────────────────────────────
  const divY = topicY + 18;
  setDrawColor(doc, COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, divY, W - margin, divY);

  // ── Content section ──────────────────────────────────────────────────────────
  const contentStartY = divY + 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setTextColor(doc, COLORS.textMuted);
  doc.text('CONTEÚDO DO POST', margin, contentStartY);

  // Content body
  const bodyY = contentStartY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setTextColor(doc, COLORS.text);

  const lines = doc.splitTextToSize(content, contentW);
  const lineH = 5.2;
  const maxLines = Math.floor((H - bodyY - 30) / lineH);

  let y = bodyY;
  let page = 1;

  for (let i = 0; i < lines.length; i++) {
    if (y + lineH > H - 20) {
      // Footer on current page
      drawFooter(doc, W, H, margin, page, profile);
      doc.addPage();
      page++;

      // Background for new page
      setFill(doc, COLORS.dark);
      doc.rect(0, 0, W, H, 'F');

      // Thin top stripe
      setFill(doc, COLORS.primary);
      doc.rect(0, 0, W, 4, 'F');

      y = 16;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      setTextColor(doc, COLORS.text);
    }

    // Highlight slide markers like [SLIDE 1]
    if (/^\[SLIDE\s*\d+\]|^\[CAPA\]|^---/.test(lines[i].trim())) {
      setFill(doc, COLORS.primary);
      doc.rect(margin - 2, y - 3.5, contentW + 4, lineH + 1, 'F');
      setTextColor(doc, COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.text(lines[i], margin, y);
      doc.setFont('helvetica', 'normal');
      setTextColor(doc, COLORS.text);
    } else if (/^(#{1,3}|\*\*|##)/.test(lines[i].trim()) || /^[A-Z\s]{8,}$/.test(lines[i].trim())) {
      // Bold/heading lines
      doc.setFont('helvetica', 'bold');
      setTextColor(doc, [199, 210, 254]);
      doc.text(lines[i], margin, y);
      doc.setFont('helvetica', 'normal');
      setTextColor(doc, COLORS.text);
    } else if (/^[•\-\*]\s/.test(lines[i])) {
      // Bullet points with accent dot
      setFill(doc, COLORS.secondary);
      doc.circle(margin + 1, y - 1, 0.8, 'F');
      doc.text(lines[i].replace(/^[•\-\*]\s/, '  '), margin + 3, y);
    } else {
      doc.text(lines[i], margin, y);
    }

    y += lineH;
  }

  // ── Footer last page ─────────────────────────────────────────────────────────
  drawFooter(doc, W, H, margin, page, profile);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const filename = `post-${platform}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function drawFooter(doc, W, H, margin, page, profile) {
  // Footer bar
  doc.setFillColor(30, 41, 59);
  doc.rect(0, H - 14, W, 14, 'F');

  doc.setFillColor(79, 70, 229);
  doc.rect(0, H - 14, W, 1.5, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const leftText = profile?.name
    ? `${profile.name}${profile.handle ? ' · ' + profile.handle : ''}`
    : 'PostGen AI';
  doc.text(leftText, margin, H - 5.5);
  doc.text(`Página ${page}`, W - margin, H - 5.5, { align: 'right' });
}
