/**
 * Syllabus download utility for LeSuccess courses.
 * Maps course records (slug, title, backend syllabusUrl) to real PDFs.
 */

export const getSyllabusInfo = (course) => {
  if (!course) {
    return { url: '/syllabus/Java-Full-Stack-Syllabus.pdf', filename: 'Course-Syllabus.pdf' };
  }

  const slug = (course.slug || '').toLowerCase();
  const title = (course.title || course.name || '').toLowerCase();

  if (slug.includes('python') || title.includes('python')) {
    return { url: '/syllabus/Python-Full-Stack-Syllabus.pdf', filename: 'Python-Full-Stack-Syllabus.pdf' };
  }
  if (slug.includes('java') || title.includes('java')) {
    return { url: '/syllabus/Java-Full-Stack-Syllabus.pdf', filename: 'Java-Full-Stack-Syllabus.pdf' };
  }
  if (slug.includes('data-analytics') || title.includes('data analytics') || title.includes('power bi')) {
    return { url: '/syllabus/Data-Analytics-Syllabus.pdf', filename: 'Data-Analytics-Syllabus.pdf' };
  }
  if (slug.includes('aws') || slug.includes('devops') || title.includes('aws') || title.includes('devops')) {
    return { url: '/syllabus/AWS-DevOps-Syllabus.pdf', filename: 'AWS-DevOps-Syllabus.pdf' };
  }
  if (slug.includes('mern') || title.includes('mern')) {
    return { url: '/syllabus/MERN-Stack-Syllabus.pdf', filename: 'MERN-Stack-Syllabus.pdf' };
  }
  if (slug.includes('data-science') || title.includes('data science') || title.includes('machine learning')) {
    return { url: '/syllabus/Data-Science-Syllabus.pdf', filename: 'Data-Science-Syllabus.pdf' };
  }
  if (slug.includes('cyber') || title.includes('cyber')) {
    return { url: '/syllabus/Cybersecurity-Syllabus.pdf', filename: 'Cybersecurity-Syllabus.pdf' };
  }
  if (slug.includes('digital') || title.includes('marketing')) {
    return { url: '/syllabus/Digital-Marketing-Syllabus.pdf', filename: 'Digital-Marketing-Syllabus.pdf' };
  }

  if (course.syllabusUrl) {
    const rawName = course.title || course.name || 'Course';
    const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, '-') + '-Syllabus.pdf';
    return { url: course.syllabusUrl, filename: cleanName };
  }

  const rawTitle = course.title || course.name || 'Course';
  const fallbackFilename = rawTitle.replace(/[^a-zA-Z0-9]/g, '-') + '-Syllabus.pdf';
  return { url: '/syllabus/Java-Full-Stack-Syllabus.pdf', filename: fallbackFilename };
};

export const downloadSyllabus = (course) => {
  const { url, filename } = getSyllabusInfo(course);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

export default downloadSyllabus;
