import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import catalog
const { COURSES } = await import('./src/mocks/catalog.js');

const COURSE_MAP = [
  { slug: 'python-full-stack-development', short: 'python.pdf', long: 'Python-Full-Stack-Syllabus.pdf' },
  { slug: 'full-stack-java', short: 'java.pdf', long: 'Java-Full-Stack-Syllabus.pdf' },
  { slug: 'data-analytics', short: 'data-analytics.pdf', long: 'Data-Analytics-Syllabus.pdf' },
  { slug: 'aws-and-devops', short: 'aws-devops.pdf', long: 'AWS-DevOps-Syllabus.pdf' },
  { slug: 'mern-full-stack', short: 'mern.pdf', long: 'MERN-Stack-Syllabus.pdf' },
  { slug: 'mean-full-stack', short: 'mean.pdf', long: 'MEAN-Stack-Syllabus.pdf' },
  { slug: 'c-and-cpp', short: 'c-cpp.pdf', long: 'C-and-CPP-Syllabus.pdf' },
  { slug: 'dsa-with-python-java', short: 'dsa.pdf', long: 'DSA-Python-Java-Syllabus.pdf' },
  { slug: 'data-science', short: 'data-science.pdf', long: 'Data-Science-Syllabus.pdf' },
  { slug: 'artificial-intelligence-and-machine-learning', short: 'ai-ml.pdf', long: 'AI-ML-Syllabus.pdf' },
  { slug: 'aws-the-ultimate', short: 'aws.pdf', long: 'AWS-Ultimate-Syllabus.pdf' },
  { slug: 'frontend-developer-ui-ux-design', short: 'frontend.pdf', long: 'Frontend-Developer-Syllabus.pdf' },
  { slug: 'data-engineering', short: 'data-engineering.pdf', long: 'Data-Engineering-Syllabus.pdf' },
  { slug: 'digital-marketing', short: 'digital-marketing.pdf', long: 'Digital-Marketing-Syllabus.pdf' },
  { slug: 'gen-ai', short: 'gen-ai.pdf', long: 'Gen-AI-Syllabus.pdf' },
  { slug: 'agentic-ai', short: 'agentic-ai.pdf', long: 'Agentic-AI-Syllabus.pdf' },
  { slug: 'servicenow', short: 'servicenow.pdf', long: 'ServiceNow-Syllabus.pdf' },
  { slug: 'cybersecurity', short: 'cybersecurity.pdf', long: 'Cybersecurity-Syllabus.pdf' },
  { slug: 'tally', short: 'tally.pdf', long: 'Tally-Syllabus.pdf' },
  { slug: 'placement-readiness-program', short: 'placement-readiness.pdf', long: 'Placement-Readiness-Syllabus.pdf' },
];

function sanitizePdfText(str) {
  if (!str) return '';
  // Normalize unicode dashes and quotes to standard ASCII for Helvetica font
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdfBinary(course) {
  const title = (course.title || course.name || 'Course').replace(/course in Coimbatore/i, '').trim();
  const duration = course.durationMonths ? `${course.durationMonths} Months` : '3-6 Months';
  const mode = course.mode === 'BOTH' ? 'Classroom & Online' : (course.mode || 'Classroom & Online');
  const modules = course.modules || [];

  // Content stream instructions
  const ops = [];

  // Top header bar (Red brand color: #DF1E26 -> 0.875 0.118 0.149)
  ops.push('q');
  ops.push('0.875 0.118 0.149 rg');
  ops.push('0 770 595 72 re f');
  ops.push('Q');

  // Header Title
  ops.push('BT');
  ops.push('/F1 20 Tf');
  ops.push('1 1 1 rg');
  ops.push('40 805 Td');
  ops.push('(LeSuccess Academy) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 10 Tf');
  ops.push('1 1 1 rg');
  ops.push('40 785 Td');
  ops.push('(Learn . Educate . Succeed  |  Official Course Syllabus) Tj');
  ops.push('ET');

  // Course Title Banner
  ops.push('BT');
  ops.push('/F1 16 Tf');
  ops.push('0.027 0.251 0.361 rg'); // Dark teal brand #07405C
  ops.push('40 735 Td');
  ops.push(`(${sanitizePdfText(title)}) Tj`);
  ops.push('ET');

  // Meta row: Duration, Mode, Placement support
  ops.push('BT');
  ops.push('/F2 10 Tf');
  ops.push('0.3 0.3 0.3 rg');
  ops.push('40 715 Td');
  ops.push(`(Duration: ${sanitizePdfText(duration)}  |  Mode: ${sanitizePdfText(mode)}  |  100% Placement Support) Tj`);
  ops.push('ET');

  // Thin separator line
  ops.push('q');
  ops.push('0.85 0.85 0.85 RG');
  ops.push('1.5 w');
  ops.push('40 700 m 555 700 l S');
  ops.push('Q');

  // Section Heading
  ops.push('BT');
  ops.push('/F1 12 Tf');
  ops.push('0.1 0.1 0.1 rg');
  ops.push('40 680 Td');
  ops.push('(Detailed Curriculum & Module Outline:) Tj');
  ops.push('ET');

  // Render modules
  let y = 655;
  const maxModules = Math.min(modules.length, 14);

  for (let i = 0; i < maxModules; i++) {
    const mod = modules[i];
    let modTitle = mod.title || `Module ${i + 1}`;
    modTitle = modTitle.replace(/^[Mm]odule\s*\d+:\s*/, '');
    const label = `Module ${i + 1}: ${modTitle}`;

    // Bullet icon background
    ops.push('q');
    ops.push('0.875 0.118 0.149 rg');
    ops.push(`40 ${y + 2} 4 10 re f`);
    ops.push('Q');

    ops.push('BT');
    ops.push('/F1 10 Tf');
    ops.push('0.15 0.15 0.15 rg');
    ops.push(`52 ${y + 2} Td`);
    ops.push(`(${sanitizePdfText(label)}) Tj`);
    ops.push('ET');

    y -= 18;

    const desc = mod.description || '';
    if (desc && y > 100) {
      const firstLine = desc.split(/[\n.]/)[0].trim().slice(0, 95);
      if (firstLine && firstLine.length > 5) {
        ops.push('BT');
        ops.push('/F2 8.5 Tf');
        ops.push('0.45 0.45 0.45 rg');
        ops.push(`52 ${y + 4} Td`);
        ops.push(`(${sanitizePdfText(firstLine)}) Tj`);
        ops.push('ET');
        y -= 15;
      }
    }

    y -= 5;
    if (y < 90) break;
  }

  // Footer bar
  ops.push('q');
  ops.push('0.96 0.96 0.96 rg');
  ops.push('0 0 595 50 re f');
  ops.push('0.85 0.85 0.85 RG');
  ops.push('0.5 w');
  ops.push('0 50 m 595 50 l S');
  ops.push('Q');

  ops.push('BT');
  ops.push('/F1 8.5 Tf');
  ops.push('0.3 0.3 0.3 rg');
  ops.push('40 28 Td');
  ops.push('(LeSuccess Academy - Accelerate Your Tech Career with Live Industry Projects) Tj');
  ops.push('ET');

  ops.push('BT');
  ops.push('/F2 8 Tf');
  ops.push('0.5 0.5 0.5 rg');
  ops.push('40 16 Td');
  ops.push('(Visit: www.lesuccess.in  |  Phone: +91 80120 60000  |  Email: info@lesuccess.in  |  Coimbatore, TN) Tj');
  ops.push('ET');

  const contentStream = ops.join('\n') + '\n';
  const bStream = Buffer.from(contentStream, 'binary');

  // Build standard PDF 1.4 objects
  const bHeader = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary');
  const bObj1 = Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'binary');
  const bObj2 = Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n', 'binary');
  const bObj3 = Buffer.from('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n', 'binary');
  const bObj4 = Buffer.concat([
    Buffer.from(`4 0 obj\n<< /Length ${bStream.length} >>\nstream\n`, 'binary'),
    bStream,
    Buffer.from('endstream\nendobj\n', 'binary')
  ]);
  const bObj5 = Buffer.from('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n', 'binary');
  const bObj6 = Buffer.from('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n', 'binary');

  // Calculate exact byte offsets
  const offset1 = bHeader.length;
  const offset2 = offset1 + bObj1.length;
  const offset3 = offset2 + bObj2.length;
  const offset4 = offset3 + bObj3.length;
  const offset5 = offset4 + bObj4.length;
  const offset6 = offset5 + bObj5.length;
  const startxref = offset6 + bObj6.length;

  function pad10(n) {
    return String(n).padStart(10, '0');
  }

  const xrefStr = `xref\n0 7\n0000000000 65535 f \n${pad10(offset1)} 00000 n \n${pad10(offset2)} 00000 n \n${pad10(offset3)} 00000 n \n${pad10(offset4)} 00000 n \n${pad10(offset5)} 00000 n \n${pad10(offset6)} 00000 n \n`;
  const trailerStr = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const bXref = Buffer.from(xrefStr, 'binary');
  const bTrailer = Buffer.from(trailerStr, 'binary');

  return Buffer.concat([bHeader, bObj1, bObj2, bObj3, bObj4, bObj5, bObj6, bXref, bTrailer]);
}

// Generate for all 20 courses
const publicDir = path.join(__dirname, 'public', 'syllabus');
const distDir = path.join(__dirname, 'dist', 'syllabus');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

let totalGenerated = 0;

for (const mapping of COURSE_MAP) {
  const course = COURSES.find((c) => c.slug === mapping.slug) || {
    title: mapping.slug.replace(/-/g, ' ').toUpperCase(),
    modules: [],
  };

  const pdfBuf = buildPdfBinary(course);

  // Write short name to public & dist
  fs.writeFileSync(path.join(publicDir, mapping.short), pdfBuf);
  fs.writeFileSync(path.join(distDir, mapping.short), pdfBuf);

  // Write long name to public & dist
  fs.writeFileSync(path.join(publicDir, mapping.long), pdfBuf);
  fs.writeFileSync(path.join(distDir, mapping.long), pdfBuf);

  console.log(`[OK] Generated (${pdfBuf.length} bytes): ${mapping.short} & ${mapping.long}`);
  totalGenerated += 2;
}

console.log(`Successfully generated ${totalGenerated} PDF files across public and dist.`);
