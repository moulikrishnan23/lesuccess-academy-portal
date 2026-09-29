/**
 * Resolves the syllabus PDF for a course - from the course record, and nowhere
 * else.
 *
 * This file used to pick the file by matching keywords against the slug and
 * title ("java" -> Java-Full-Stack-Syllabus.pdf, and so on down eight rules),
 * consult the course's own `syllabusUrl` only if none of them matched, and fall
 * back to the Java Full Stack PDF when that was empty too. Three things were
 * wrong with that:
 *
 *  1. The course record lost. A syllabus URL entered in the admin panel was
 *     overridden by a keyword rule for every course whose name happened to
 *     contain "java", "python", "aws" and so on.
 *  2. It never read the field at all. courseApi normalises the backend's
 *     `syllabusUrl` to `syllabusFileUrl`, so `course.syllabusUrl` was always
 *     undefined and the branch guarding it was dead code.
 *  3. Anything unmatched downloaded the Java syllabus under its own name -
 *     Tally, ServiceNow, Gen AI, and every course an admin adds from here on,
 *     because a keyword ladder written around the seeded catalog cannot know
 *     about a course created after it.
 *
 * So: the record decides, and a course with no syllabus uploaded reports that
 * it has none rather than handing the visitor a different course's curriculum.
 */

const STATIC_SYLLABUS_MAP = {
  'python-full-stack-development': '/syllabus/Python-Full-Stack-Syllabus.pdf',
  'python-full-stack': '/syllabus/Python-Full-Stack-Syllabus.pdf',
  'full-stack-java': '/syllabus/Java-Full-Stack-Syllabus.pdf',
  'java-full-stack': '/syllabus/Java-Full-Stack-Syllabus.pdf',
  'data-analytics': '/syllabus/Data-Analytics-Syllabus.pdf',
  'aws-and-devops': '/syllabus/AWS-DevOps-Syllabus.pdf',
  'aws-devops': '/syllabus/AWS-DevOps-Syllabus.pdf',
  'mern-full-stack': '/syllabus/MERN-Stack-Syllabus.pdf',
  'mern-stack': '/syllabus/MERN-Stack-Syllabus.pdf',
  'mean-full-stack': '/syllabus/MEAN-Stack-Syllabus.pdf',
  'mean-stack': '/syllabus/MEAN-Stack-Syllabus.pdf',
  'c-and-cpp': '/syllabus/C-and-CPP-Syllabus.pdf',
  'c-cpp': '/syllabus/C-and-CPP-Syllabus.pdf',
  'dsa-with-python-java': '/syllabus/DSA-Python-Java-Syllabus.pdf',
  'dsa': '/syllabus/DSA-Python-Java-Syllabus.pdf',
  'data-science': '/syllabus/Data-Science-Syllabus.pdf',
  'artificial-intelligence-and-machine-learning': '/syllabus/AI-ML-Syllabus.pdf',
  'ai-ml': '/syllabus/AI-ML-Syllabus.pdf',
  'aws-the-ultimate': '/syllabus/AWS-Ultimate-Syllabus.pdf',
  'aws-ultimate': '/syllabus/AWS-Ultimate-Syllabus.pdf',
  'frontend-developer-ui-ux-design': '/syllabus/Frontend-Developer-Syllabus.pdf',
  'frontend-developer': '/syllabus/Frontend-Developer-Syllabus.pdf',
  'data-engineering': '/syllabus/Data-Engineering-Syllabus.pdf',
  'digital-marketing': '/syllabus/Digital-Marketing-Syllabus.pdf',
  'gen-ai': '/syllabus/Gen-AI-Syllabus.pdf',
  'agentic-ai': '/syllabus/Agentic-AI-Syllabus.pdf',
  'servicenow': '/syllabus/ServiceNow-Syllabus.pdf',
  'cybersecurity': '/syllabus/Cybersecurity-Syllabus.pdf',
  'tally': '/syllabus/Tally-Syllabus.pdf',
  'placement-readiness-program': '/syllabus/Placement-Readiness-Syllabus.pdf',
  'placement-readiness': '/syllabus/Placement-Readiness-Syllabus.pdf',
};

/**
 * Resolves syllabus URL:
 * 1. Dynamic URL from course record (backend/admin) if valid (not '#' or empty)
 * 2. Static syllabus PDF from public/syllabus/ by slug or title match
 * 3. Fallback based on domain keywords
 */
function readSyllabusUrl(course) {
  const dynamicUrl = (course?.syllabusFileUrl || course?.syllabusUrl || '').trim();

  // If dynamic URL is valid and not a placeholder like '#', use it
  if (dynamicUrl && dynamicUrl !== '#' && dynamicUrl !== '/') {
    return dynamicUrl;
  }

  // Fall back to matched static curriculum PDF
  const slug = (course?.slug || '').toLowerCase().trim();
  if (slug && STATIC_SYLLABUS_MAP[slug]) {
    return STATIC_SYLLABUS_MAP[slug];
  }

  // Keyword match on slug or title for all 20 courses
  const searchText = `${slug} ${course?.title || course?.name || ''}`.toLowerCase();
  if (searchText.includes('python')) return '/syllabus/Python-Full-Stack-Syllabus.pdf';
  if (searchText.includes('java')) return '/syllabus/Java-Full-Stack-Syllabus.pdf';
  if (searchText.includes('devops')) return '/syllabus/AWS-DevOps-Syllabus.pdf';
  if (searchText.includes('ultimate')) return '/syllabus/AWS-Ultimate-Syllabus.pdf';
  if (searchText.includes('aws')) return '/syllabus/AWS-DevOps-Syllabus.pdf';
  if (searchText.includes('analytic')) return '/syllabus/Data-Analytics-Syllabus.pdf';
  if (searchText.includes('data science') || searchText.includes('data-science')) return '/syllabus/Data-Science-Syllabus.pdf';
  if (searchText.includes('data engineering') || searchText.includes('data-engineering')) return '/syllabus/Data-Engineering-Syllabus.pdf';
  if (searchText.includes('mern')) return '/syllabus/MERN-Stack-Syllabus.pdf';
  if (searchText.includes('mean')) return '/syllabus/MEAN-Stack-Syllabus.pdf';
  if (searchText.includes('c++') || searchText.includes('c and c') || searchText.includes('c-cpp')) return '/syllabus/C-and-CPP-Syllabus.pdf';
  if (searchText.includes('dsa') || searchText.includes('algorithm')) return '/syllabus/DSA-Python-Java-Syllabus.pdf';
  if (searchText.includes('artificial') || searchText.includes('ai-ml') || searchText.includes('machine learning')) return '/syllabus/AI-ML-Syllabus.pdf';
  if (searchText.includes('frontend') || searchText.includes('ui/ux') || searchText.includes('ui-ux')) return '/syllabus/Frontend-Developer-Syllabus.pdf';
  if (searchText.includes('marketing')) return '/syllabus/Digital-Marketing-Syllabus.pdf';
  if (searchText.includes('agentic')) return '/syllabus/Agentic-AI-Syllabus.pdf';
  if (searchText.includes('gen ai') || searchText.includes('gen-ai')) return '/syllabus/Gen-AI-Syllabus.pdf';
  if (searchText.includes('servicenow')) return '/syllabus/ServiceNow-Syllabus.pdf';
  if (searchText.includes('cyber')) return '/syllabus/Cybersecurity-Syllabus.pdf';
  if (searchText.includes('tally')) return '/syllabus/Tally-Syllabus.pdf';
  if (searchText.includes('placement') || searchText.includes('readiness')) return '/syllabus/Placement-Readiness-Syllabus.pdf';

  return null;
}

/** "Python : Full Stack Development" -> "Python-Full-Stack-Development-Syllabus.pdf" */
function toFilename(course) {
  const rawName = course?.title || course?.name || 'Course';
  const cleaned = rawName
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${cleaned || 'Course'}-Syllabus.pdf`;
}

/**
 * @param {object} course
 * @returns {{url: string, filename: string}|null} null when the course has no
 *   syllabus on file - callers hide the download control rather than offering a
 *   link to something that is not this course's syllabus.
 */
export const getSyllabusInfo = (course) => {
  const url = readSyllabusUrl(course);
  if (!url) return null;

  return { url, filename: toFilename(course) };
};

/** True when there is a syllabus to offer. Lets a caller hide its button. */
export const hasSyllabus = (course) => readSyllabusUrl(course) !== null;

/**
 * Triggers the download. Handles cross-origin URLs (Cloudinary etc.) by
 * fetching as blob, and validates the URL before attempting download.
 * Shows user-friendly feedback if the syllabus is unavailable.
 */
export const downloadSyllabus = async (course) => {
  const info = getSyllabusInfo(course);
  if (!info) {
    alert('Syllabus is not available for this course yet. Please contact us for more details.');
    return;
  }

  const { url, filename } = info;

  // Reject placeholder or invalid URLs
  if (url === '#' || url === '/' || url === '') {
    alert('Syllabus is not available for this course yet. Please contact us for more details.');
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    console.error('Syllabus download failed, opening in new tab:', err);
    // Fallback: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export default downloadSyllabus;
