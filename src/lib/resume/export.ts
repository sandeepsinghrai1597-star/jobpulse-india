import type { ResumeBuilderData } from "@/lib/resume/schema";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLines(values: string[]) {
  return values
    .filter(Boolean)
    .map((value) => `<li>${escapeHtml(value)}</li>`)
    .join("");
}

function renderSection(title: string, body: string) {
  if (!body.trim()) {
    return "";
  }

  return `<section class="section"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function renderItems(
  items: Array<{
    title: string;
    subtitle?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    bullets?: string[];
  }>,
) {
  return items
    .filter((item) => item.title)
    .map((item) => {
      const meta = [item.subtitle, item.location].filter(Boolean).join(" | ");
      const duration = [item.startDate, item.endDate].filter(Boolean).join(" - ");
      const extras = [duration, item.score].filter(Boolean).join(" | ");
      return `
        <article class="item">
          <div class="item-head">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              ${meta ? `<p class="meta">${escapeHtml(meta)}</p>` : ""}
            </div>
            ${extras ? `<p class="meta meta-right">${escapeHtml(extras)}</p>` : ""}
          </div>
          ${item.bullets?.length ? `<ul>${renderLines(item.bullets)}</ul>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderSkillGroups(data: ResumeBuilderData) {
  return data.skills
    .filter((group) => group.title && group.items.length > 0)
    .map(
      (group) =>
        `<p><strong>${escapeHtml(group.title)}:</strong> ${escapeHtml(group.items.join(", "))}</p>`,
    )
    .join("");
}

function renderLanguages(data: ResumeBuilderData) {
  return data.languages
    .filter((language) => language.name)
    .map((language) => `${escapeHtml(language.name)} (${escapeHtml(language.proficiency)})`)
    .join(" | ");
}

export function renderResumeHtmlDocument(data: ResumeBuilderData) {
  const basicsLinks = [data.basics.website, data.basics.linkedin, data.basics.github, data.basics.portfolio]
    .filter(Boolean)
    .join(" | ");

  const contactLine = [data.basics.email, data.basics.phone, data.basics.location]
    .filter(Boolean)
    .join(" | ");

  const keywordLine = data.atsKeywords.length > 0 ? data.atsKeywords.join(", ") : "";

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(data.title)}</title>
      <style>
        @page { size: A4; margin: 16mm; }
        body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; font-size: 12px; line-height: 1.5; }
        .resume { max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
        h1 { font-size: 28px; margin: 0 0 4px; }
        .headline { font-size: 15px; margin: 0 0 8px; color: #334155; }
        .contact, .links { margin: 0; color: #475569; }
        .section { margin-top: 16px; }
        .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        .item { margin-bottom: 12px; }
        .item-head { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; }
        .item h3 { margin: 0; font-size: 14px; }
        .meta { margin: 2px 0 0; color: #475569; }
        .meta-right { text-align: right; white-space: nowrap; }
        ul { margin: 6px 0 0 18px; padding: 0; }
        p { margin: 0 0 8px; }
        .keywords { color: #1d4ed8; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <main class="resume">
        <header class="header">
          <h1>${escapeHtml(data.basics.fullName)}</h1>
          <p class="headline">${escapeHtml(data.basics.headline)}</p>
          <p class="contact">${escapeHtml(contactLine)}</p>
          ${basicsLinks ? `<p class="links">${escapeHtml(basicsLinks)}</p>` : ""}
        </header>
        ${renderSection("Professional Summary", `<p>${escapeHtml(data.summary)}</p>`)}
        ${
          keywordLine
            ? renderSection(
                "ATS Keywords",
                `<p class="keywords">${escapeHtml(keywordLine)}</p>`,
              )
            : ""
        }
        ${renderSection("Experience", renderItems(data.experience))}
        ${renderSection("Projects", renderItems(data.projects))}
        ${renderSection("Education", renderItems(data.education))}
        ${renderSection("Skills", renderSkillGroups(data))}
        ${renderSection("Certifications", renderItems(data.certifications))}
        ${renderSection(
          "Achievements",
          renderItems(data.achievements.map((item) => ({ ...item, subtitle: "", location: "" }))),
        )}
        ${renderSection("Languages", `<p>${renderLanguages(data)}</p>`)}
      </main>
    </body>
  </html>`;
}

function crc32(input: Buffer) {
  let crc = 0xffffffff;

  for (const byte of input) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function zipStored(files: Array<{ name: string; content: string }>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuffer = Buffer.from(file.name, "utf8");
    const contentBuffer = Buffer.from(file.content, "utf8");
    const checksum = crc32(contentBuffer);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(contentBuffer.length, 18);
    localHeader.writeUInt32LE(contentBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuffer, contentBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(contentBuffer.length, 20);
    centralHeader.writeUInt32LE(contentBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + contentBuffer.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localDirectory = Buffer.concat(localParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localDirectory.length, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([localDirectory, centralDirectory, end]);
}

export function createDocxBuffer(data: ResumeBuilderData) {
  const documentBody = `
    <w:body>
      <w:p><w:r><w:t>${escapeHtml(data.basics.fullName)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>${escapeHtml(data.basics.headline)}</w:t></w:r></w:p>
      <w:p><w:r><w:t>${escapeHtml(
        [data.basics.email, data.basics.phone, data.basics.location].filter(Boolean).join(" | "),
      )}</w:t></w:r></w:p>
      <w:p><w:r><w:t>Summary</w:t></w:r></w:p>
      <w:p><w:r><w:t>${escapeHtml(data.summary)}</w:t></w:r></w:p>
      ${data.experience
        .map(
          (item) => `
            <w:p><w:r><w:t>${escapeHtml(item.title)}</w:t></w:r></w:p>
            <w:p><w:r><w:t>${escapeHtml(
              [item.subtitle, item.location, item.startDate, item.endDate].filter(Boolean).join(" | "),
            )}</w:t></w:r></w:p>
            ${item.bullets
              .map((bullet) => `<w:p><w:r><w:t>- ${escapeHtml(bullet)}</w:t></w:r></w:p>`)
              .join("")}
          `,
        )
        .join("")}
      <w:sectPr />
    </w:body>
  `;

  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    {
      name: "word/document.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  ${documentBody}
</w:document>`,
    },
  ];

  return zipStored(files);
}
