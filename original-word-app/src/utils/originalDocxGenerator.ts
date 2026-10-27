import JSZip from 'jszip';

const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const TEMPLATE_URL = `${import.meta.env.BASE_URL}templates/ASISTENCIA(1).docx`;
const MONTH_NAMES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

export interface OriginalDocxOptions {
  fullName: string;
  jobTitle: string;
  department?: string;
  year: number;
  month: number;
  fortnight: 1 | 2;
}

let templateBytes: Promise<ArrayBuffer> | null = null;

interface XmlTextToken {
  node: Element;
  start: number;
  end: number;
  value: string;
  isTab: boolean;
}

function isWordElement(node: Node, localName: string): boolean {
  return node.nodeType === Node.ELEMENT_NODE
    && (node as Element).namespaceURI === WORD_NAMESPACE
    && (node as Element).localName === localName;
}

function collectTextTokens(root: Node): { text: string; tokens: XmlTextToken[] } {
  const tokens: XmlTextToken[] = [];
  let text = '';
  const visit = (node: Node): void => {
    if (isWordElement(node, 't') || isWordElement(node, 'tab')) {
      const element = node as Element;
      const isTab = element.localName === 'tab';
      const value = isTab ? '\t' : element.textContent || '';
      tokens.push({ node: element, start: text.length, end: text.length + value.length, value, isTab });
      text += value;
      return;
    }
    for (const child of Array.from(node.childNodes)) visit(child);
  };
  visit(root);
  return { text, tokens };
}

function setText(node: Element, value: string): void {
  node.textContent = value;
  if (/^\s|\s$/.test(value)) {
    node.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
  } else {
    node.removeAttributeNS(XML_NAMESPACE, 'space');
  }
}

function replaceTextRange(tokens: XmlTextToken[], start: number, end: number, replacement: string): void {
  let inserted = false;
  for (const token of tokens) {
    if (token.isTab || token.end <= start || token.start >= end) continue;
    const localStart = Math.max(0, start - token.start);
    const localEnd = Math.min(token.value.length, end - token.start);
    const prefix = token.value.slice(0, localStart);
    const suffix = token.value.slice(localEnd);
    setText(token.node, `${prefix}${inserted ? '' : replacement}${suffix}`);
    inserted = true;
  }
  if (!inserted) throw new Error('No se pudo actualizar un campo de la plantilla original.');
}

function replaceField(paragraph: Element, label: string, value: string): void {
  const { text, tokens } = collectTextTokens(paragraph);
  const labelIndex = text.toLocaleUpperCase('es-MX').indexOf(label.toLocaleUpperCase('es-MX'));
  if (labelIndex < 0) throw new Error(`No se encontró el campo ${label} en la plantilla original.`);

  const valueStart = labelIndex + label.length;
  let contentStart = valueStart;
  while (contentStart < text.length && /\s/.test(text[contentStart])) contentStart += 1;
  const nextTab = text.indexOf('\t', contentStart);
  const nextLineBreak = text.indexOf('\n', contentStart);
  const boundary = [nextTab, nextLineBreak].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? text.length;
  let contentEnd = boundary;
  while (contentEnd > contentStart && /\s/.test(text[contentEnd - 1])) contentEnd -= 1;
  if (contentStart === contentEnd) throw new Error(`El campo ${label} está vacío en la plantilla original.`);

  replaceTextRange(tokens, contentStart, contentEnd, value.trim());
}

function replaceMonthAndYear(paragraph: Element, year: number, month: number): void {
  const textNodes = Array.from(paragraph.getElementsByTagNameNS(WORD_NAMESPACE, 't'));
  let monthUpdated = false;
  let yearUpdated = false;
  const yearPattern = /\b\d{4}\b/;

  for (const textNode of textNodes) {
    const text = textNode.textContent || '';
    if (!monthUpdated && MONTH_NAMES.some((name) => text.toLocaleUpperCase('es-MX').includes(name))) {
      const leadingWhitespace = text.match(/^\s*/)?.[0] || '';
      setText(textNode, `${leadingWhitespace}${MONTH_NAMES[month - 1]}`);
      monthUpdated = true;
      continue;
    }
    const yearMatch = yearPattern.exec(text);
    if (!yearUpdated && yearMatch?.index !== undefined) {
      setText(textNode, `${text.slice(0, yearMatch.index)}${year}${text.slice(yearMatch.index + yearMatch[0].length)}`);
      yearUpdated = true;
    }
  }

  if (!monthUpdated || !yearUpdated) throw new Error('No se pudo actualizar el período de la plantilla original.');
}

function directChildren(parent: Element, localName: string): Element[] {
  return Array.from(parent.children).filter((child) => isWordElement(child, localName));
}

function setCellText(cell: Element, value: string): void {
  const paragraph = cell.getElementsByTagNameNS(WORD_NAMESPACE, 'p').item(0);
  if (!paragraph) throw new Error('La plantilla original contiene una celda sin párrafo.');
  const textNodes = Array.from(paragraph.getElementsByTagNameNS(WORD_NAMESPACE, 't'));
  if (textNodes.length === 0) {
    const run = paragraph.ownerDocument!.createElementNS(WORD_NAMESPACE, 'w:r');
    const text = paragraph.ownerDocument!.createElementNS(WORD_NAMESPACE, 'w:t');
    run.appendChild(text);
    paragraph.appendChild(run);
    setText(text, value);
    return;
  }
  setText(textNodes[0], value);
  for (const textNode of textNodes.slice(1)) setText(textNode, '');
}

function shadeCell(cell: Element, color: string): void {
  const properties = cell.getElementsByTagNameNS(WORD_NAMESPACE, 'tcPr').item(0);
  if (!properties) throw new Error('La plantilla original contiene una celda sin propiedades.');
  for (const shade of directChildren(properties, 'shd')) properties.removeChild(shade);
  const shade = cell.ownerDocument!.createElementNS(WORD_NAMESPACE, 'w:shd');
  shade.setAttributeNS(WORD_NAMESPACE, 'w:val', 'clear');
  shade.setAttributeNS(WORD_NAMESPACE, 'w:color', 'auto');
  shade.setAttributeNS(WORD_NAMESPACE, 'w:fill', color);
  properties.appendChild(shade);
}

function fillFortnight(documentXml: XMLDocument, year: number, month: number, fortnight: 1 | 2): void {
  const table = documentXml.getElementsByTagNameNS(WORD_NAMESPACE, 'tbl').item(0);
  if (!table) throw new Error('No se encontró la tabla de asistencia en la plantilla original.');

  let rows = directChildren(table, 'tr');
  const firstDay = fortnight === 1 ? 1 : 16;
  const lastDay = fortnight === 1 ? 15 : new Date(year, month, 0).getDate();
  const dayCount = lastDay - firstDay + 1;
  if (dayCount < 1) throw new Error('La quincena no contiene días para el período indicado.');

  while (rows.length - 1 < dayCount) {
    const duplicate = rows[rows.length - 1].cloneNode(true) as Element;
    table.appendChild(duplicate);
    rows.push(duplicate);
  }
  while (rows.length - 1 > dayCount) {
    const lastRow = rows.pop();
    if (lastRow) table.removeChild(lastRow);
  }

  for (let index = 0; index < dayCount; index += 1) {
    const row = rows[index + 1];
    const cells = directChildren(row, 'tc');
    if (cells.length !== 6) throw new Error('La tabla original debe conservar sus seis columnas.');
    const day = firstDay + index;
    const weekend = new Date(year, month - 1, day).getDay() % 6 === 0;
    const fill = weekend ? '7F7F7F' : 'FFFFFF';
    setCellText(cells[0], String(day));
    for (const cell of cells) shadeCell(cell, fill);
    for (const cell of cells.slice(1)) setCellText(cell, '');
  }
}

async function loadTemplate(): Promise<JSZip> {
  if (!templateBytes) {
    templateBytes = fetch(TEMPLATE_URL)
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar la plantilla Word original.');
        return response.arrayBuffer();
      })
      .catch((error: unknown) => {
        templateBytes = null;
        throw error;
      });
  }
  return JSZip.loadAsync((await templateBytes).slice(0), { createFolders: false });
}

export async function generateOriginalDocx(options: OriginalDocxOptions): Promise<Blob> {
  const zip = await loadTemplate();
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('La plantilla Word original está incompleta.');

  const parser = new DOMParser();
  const documentXml = parser.parseFromString(await documentFile.async('string'), 'application/xml');
  if (documentXml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('No se pudo leer la plantilla Word original.');
  }

  const body = documentXml.getElementsByTagNameNS(WORD_NAMESPACE, 'body').item(0);
  const paragraphs = body ? directChildren(body, 'p') : [];
  if (paragraphs.length < 3) throw new Error('La plantilla original no contiene los campos esperados.');

  replaceField(paragraphs[0], 'NOMBRE:', options.fullName);
  replaceMonthAndYear(paragraphs[0], options.year, options.month);
  replaceField(paragraphs[1], 'PUESTO:', options.jobTitle);
  replaceField(paragraphs[2], 'ADSCRIPCIÓN:', options.department || '');
  fillFortnight(documentXml, options.year, options.month, options.fortnight);
  zip.file('word/document.xml', new XMLSerializer().serializeToString(documentXml), { createFolders: false });
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
