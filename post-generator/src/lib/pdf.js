import { jsPDF } from 'jspdf';

// ── Sanitize text for jsPDF (fixes broken special chars) ─────────────────────
function sanitize(text) {
  if (!text) return '';
  return text
    .replace(/’/g, "'").replace(/‘/g, "'")
    .replace(/“/g, '"').replace(/”/g, '"')
    .replace(/–/g, '-').replace(/—/g, '--')
    .replace(/•/g, '*').replace(/…/g, '...')
    .replace(/ã/g, 'a').replace(/á/g, 'a').replace(/â/g, 'a')
    .replace(/à/g, 'a').replace(/ä/g, 'a')
    .replace(/é/g, 'e').replace(/ê/g, 'e').replace(/è/g, 'e')
    .replace(/í/g, 'i').replace(/ì/g, 'i')
    .replace(/ó/g, 'o').replace(/ô/g, 'o').replace(/õ/g, 'o')
    .replace(/ú/g, 'u').replace(/ü/g, 'u')
    .replace(/ç/g, 'c').replace(/ñ/g, 'n')
    .replace(/Ã/g, 'A').replace(/Á/g, 'A').replace(/Â/g, 'A')
    .replace(/É/g, 'E').replace(/Ê/g, 'E')
    .replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ô/g, 'O')
    .replace(/Õ/g, 'O').replace(/Ú/g, 'U').replace(/Ü/g, 'U')
    .replace(/Ç/g, 'C')
    .replace(/[^\x00-\x7F]/g, '')   // strip any remaining non-ASCII
    .trim();
}

function s(text) { return sanitize(String(text || '')); }

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  black:      [0,   0,   0  ],
  darkBg:     [10,  10,  10 ],
  sectionBg:  [22,  22,  22 ],
  cardBg:     [32,  32,  32 ],
  divider:    [55,  55,  55 ],
  white:      [255, 255, 255],
  lightGray:  [220, 220, 220],
  midGray:    [160, 160, 160],
  dimGray:    [100, 100, 100],
  accent:     [180, 180, 180],   // gray accent (no yellow)
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fill(doc, c)  { doc.setFillColor(c[0], c[1], c[2]); }
function ink(doc, c)   { doc.setTextColor(c[0], c[1], c[2]); }
function draw(doc, c)  { doc.setDrawColor(c[0], c[1], c[2]); }

const W = 210, H = 297, ML = 18, MR = 18, CONTENT_W = W - ML - MR;
const LINE_H = 5.8;

// ── PDF GENERATION ─────────────────────────────────────────────────────────────
export async function generatePostPDF({ apiKey, postContent, platform, template, contentType, topic, profile }) {
  // 1. Generate complementary content via Claude
  const complementary = await generateComplementaryContent({ apiKey, postContent, platform, contentType, topic, profile });

  // 2. Build PDF
  buildPDF({ complementary, platform, template, contentType, profile });
}

// ── Claude call ───────────────────────────────────────────────────────────────
async function generateComplementaryContent({ apiKey, postContent, platform, contentType, topic, profile }) {
  const profileCtx = profile?.name
    ? `Criador: ${profile.name} | Nicho: ${profile.niche || ''} | Publico: ${profile.audience || ''}`
    : '';

  const prompt = `Voce e um especialista em ${profile?.niche || 'gestao e inovacao'} criando um material complementar a um post de redes sociais.

POST ORIGINAL (${platform} - ${contentType}):
---
${postContent}
---

${profileCtx}

Crie um material complementar e educativo em formato de mini-guia/ebook que APROFUNDA o tema do post acima. Este material sera enviado para os seguidores como um bonus exclusivo.

O material deve:
- Complementar o post, indo mais fundo no assunto
- Ter 800 a 1.200 palavras de conteudo real e util
- Ser didatico, com exemplos praticos e frameworks
- Usar linguagem direta, sem enrolacao
- Incluir dados, numeros ou referencias quando possivel

RETORNE APENAS UM JSON valido neste formato (sem markdown, sem codigo, so o JSON):
{
  "titulo": "titulo do guia (max 8 palavras, impactante)",
  "subtitulo": "subtitulo complementar (max 15 palavras)",
  "intro": "2-3 paragrafos de introducao que contextualizam o tema",
  "secoes": [
    {
      "titulo": "titulo da secao",
      "conteudo": "conteudo completo da secao (2-4 paragrafos com insights, exemplos, dados)"
    }
  ],
  "conclusao": "paragrafo de conclusao com proximo passo ou reflexao final",
  "cta": "chamada para acao curta (max 2 linhas)"
}

Use 3 a 5 secoes. Retorne SOMENTE o JSON, sem nada antes ou depois.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 3000,
      system: 'Voce cria materiais educativos complementares a posts de redes sociais. Retorne apenas JSON valido.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}`);
  }

  const data = await res.json();
  const text = data.content[0].text;

  // Extract JSON robustly
  let parsed;
  try { parsed = JSON.parse(text.trim()); }
  catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error('Erro ao processar conteudo do PDF. Tente novamente.');
  }
  return parsed;
}

// ── PDF Builder ───────────────────────────────────────────────────────────────
function buildPDF({ complementary, platform, template, contentType, profile }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const name   = s(profile?.name   || 'Andre Rufino');
  const handle = s(profile?.handle || '@ia.rufino');

  let page = 1;

  // ── PAGE 1: Compact header + intro content ───────────────────────────────────
  initPage(doc);

  // "Material exclusivo" label
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  ink(doc, C.dimGray);
  doc.text('MATERIAL EXCLUSIVO', ML, 18);

  // Title
  const title = s(complementary.titulo || 'Guia Complementar');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  ink(doc, C.white);
  const titleLines = doc.splitTextToSize(title, CONTENT_W);
  doc.text(titleLines, ML, 26);

  // Subtitle
  const titleH = titleLines.length * 9;
  let headerY = 26 + titleH + 3;
  if (complementary.subtitulo) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    ink(doc, C.midGray);
    const subLines = doc.splitTextToSize(s(complementary.subtitulo), CONTENT_W);
    doc.text(subLines, ML, headerY);
    headerY += subLines.length * 5 + 2;
  }

  // Author + platform tags inline
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  ink(doc, C.accent);
  doc.text(`${name}  ·  ${handle}`, ML, headerY + 4);

  const plat = platform === 'instagram' ? 'Instagram' : 'LinkedIn';
  const ctLabel = contentType ? contentType.charAt(0).toUpperCase() + contentType.slice(1) : '';
  const tagText = ctLabel ? `${plat}  ·  ${ctLabel}` : plat;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  ink(doc, C.dimGray);
  doc.text(tagText, W - MR, headerY + 4, { align: 'right' });

  // Divider
  headerY += 9;
  draw(doc, C.divider);
  doc.setLineWidth(0.3);
  doc.line(ML, headerY, W - MR, headerY);

  let y = headerY + 8;

  // Intro directly on page 1
  if (complementary.intro) {
    y = renderSectionTitle(doc, 'Introducao', y);
    y = renderBody(doc, complementary.intro, y, page, { name, handle });
    y += 4;
  }

  // Sections
  if (Array.isArray(complementary.secoes)) {
    for (const sec of complementary.secoes) {
      if (y > H - 40) {
        drawFooter(doc, W, H, name, handle, page);
        doc.addPage();
        page++;
        initPage(doc);
        y = 22;
      }
      y = renderSectionTitle(doc, sec.titulo, y);
      y = renderBody(doc, sec.conteudo, y, page, { name, handle });
      y += 6;
    }
  }

  // Conclusion
  if (complementary.conclusao) {
    if (y > H - 50) {
      drawFooter(doc, W, H, name, handle, page);
      doc.addPage();
      page++;
      initPage(doc);
      y = 22;
    }
    y = renderSectionTitle(doc, 'Conclusao', y);
    y = renderBody(doc, complementary.conclusao, y, page, { name, handle });
    y += 6;
  }

  // CTA block
  if (complementary.cta) {
    if (y > H - 45) {
      drawFooter(doc, W, H, name, handle, page);
      doc.addPage();
      page++;
      initPage(doc);
      y = 22;
    }
    y = renderCTA(doc, complementary.cta, handle, y);
  }

  // Footer last page
  drawFooter(doc, W, H, name, handle, page);

  const titleSlug = s(complementary.titulo || 'guia').toLowerCase().replace(/\s+/g, '-').slice(0, 30);
  doc.save(`${titleSlug}.pdf`);
}

// ── Page initializer (black bg + top bar) ─────────────────────────────────────
function initPage(doc) {
  fill(doc, C.black);
  doc.rect(0, 0, W, H, 'F');
  fill(doc, C.sectionBg);
  doc.rect(0, 0, W, 10, 'F');
}

// ── Section title ─────────────────────────────────────────────────────────────
function renderSectionTitle(doc, title, y) {
  // Gray left border accent
  fill(doc, C.accent);
  doc.rect(ML, y - 1, 2.5, 8, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  ink(doc, C.white);
  doc.text(s(title), ML + 6, y + 5.5);
  return y + 14;
}

// ── Body text renderer with pagination ────────────────────────────────────────
function renderBody(doc, text, startY, pageRef, meta) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  ink(doc, C.lightGray);

  const paragraphs = s(text).split(/\n{2,}|\n(?=[A-Z*•-])/).filter(p => p.trim());
  let y = startY;

  for (const para of paragraphs) {
    const isBullet = /^[*•\-]\s/.test(para.trim());
    const cleanPara = para.replace(/^[*•\-]\s/, '').trim();
    const lines = doc.splitTextToSize(cleanPara, isBullet ? CONTENT_W - 5 : CONTENT_W);

    for (let i = 0; i < lines.length; i++) {
      if (y + LINE_H > H - 18) {
        drawFooter(doc, W, H, meta.name, meta.handle, pageRef);
        doc.addPage();
        pageRef++;
        initPage(doc);
        y = 22;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        ink(doc, C.lightGray);
      }

      if (isBullet && i === 0) {
        fill(doc, C.accent);
        doc.circle(ML + 1.5, y - 1, 1, 'F');
        doc.text(lines[i], ML + 5, y);
      } else {
        doc.text(lines[i], isBullet ? ML + 5 : ML, y);
      }
      y += LINE_H;
    }
    y += 3;
  }

  return y;
}

// ── CTA block ─────────────────────────────────────────────────────────────────
function renderCTA(doc, cta, handle, y) {
  const boxH = 28;
  fill(doc, C.sectionBg);
  doc.roundedRect(ML, y, CONTENT_W, boxH, 3, 3, 'F');

  draw(doc, C.accent);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, y, CONTENT_W, boxH, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  ink(doc, C.accent);
  doc.text('PROXIMO PASSO', ML + 6, y + 8);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  ink(doc, C.lightGray);
  const ctaLines = doc.splitTextToSize(s(cta), CONTENT_W - 12);
  doc.text(ctaLines.slice(0, 2), ML + 6, y + 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  ink(doc, C.midGray);
  doc.text(s(handle), W - MR, y + 24, { align: 'right' });

  return y + boxH + 8;
}

// ── Footer ────────────────────────────────────────────────────────────────────
function drawFooter(doc, W, H, name, handle, page) {
  fill(doc, C.sectionBg);
  doc.rect(0, H - 12, W, 12, 'F');

  draw(doc, C.divider);
  doc.setLineWidth(0.3);
  doc.line(0, H - 12, W, H - 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  ink(doc, C.dimGray);
  doc.text(`${s(name)}  |  ${s(handle)}`, ML, H - 5);
  doc.text(String(page), W - MR, H - 5, { align: 'right' });
}
