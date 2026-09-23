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

/** Both spellings, because the normalised shape and the raw payload differ. */
function readSyllabusUrl(course) {
  const url = course?.syllabusFileUrl || course?.syllabusUrl;
  return typeof url === 'string' && url.trim() ? url.trim() : null;
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
 * Triggers the download. A no-op when the course has no syllabus, so a stale
 * render cannot download the wrong file.
 */
export const downloadSyllabus = (course) => {
  const info = getSyllabusInfo(course);
  if (!info) return;

  const anchor = document.createElement('a');
  anchor.href = info.url;
  anchor.download = info.filename;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

export default downloadSyllabus;
