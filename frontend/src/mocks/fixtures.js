/**
 * Dev fixtures.
 *
 * The twenty-course catalog lives in catalog.js and is re-exported here, so
 * every consumer keeps importing COURSES, TESTIMONIALS and SETTINGS from one
 * place. That file carries the notes on which course data is taken from
 * Course_Page.pdf and which was written for this seed.
 *
 * Field names mirror the API contract exactly. If the real payload differs, fix
 * the normalizer in the service, not these files.
 */

export { COURSES } from './catalog.js'

/*
 * SAMPLE REVIEWS — WRITTEN FOR DEVELOPMENT, NOT COLLECTED FROM STUDENTS.
 *
 * Every name and quote below is invented so the carousel has three cards per
 * course to lay out. None of it is a real review, and publishing it as one
 * would be a false claim about the academy's results, so these rows must be
 * replaced with genuine approved testimonials before the site goes live —
 * not merely edited. The Google rating in SETTINGS is placeholder too.
 *
 * photoUrl points at /public/avatars/*.svg. The reference shows real student
 * photographs; these are neutral placeholders standing in until the real
 * uploads exist, so the card layout matches rather than degrading to initials.
 *
 * courseId matches the ids in catalog.js. Ids here are `courseId * 10 + n` for
 * the seeded rows, which keeps them unique without a counter.
 */
export const TESTIMONIALS = [
  // Course 1 — Full Stack Python (Course_Page.pdf reference course).
  { id: 1, studentName: 'Divya R', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'I joined with zero coding background after B.Com. The batch was small enough that my doubts actually got answered. I was placed as a junior Python developer three weeks after the capstone review.', source: 'GOOGLE', courseId: 1, displayOrder: 1 },
  { id: 2, studentName: 'Arun Kumar S', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'The mock interviews were the difference. By the time I sat a real one I had already been asked most of the questions and knew where I was weak.', source: 'GOOGLE', courseId: 1, displayOrder: 2 },
  { id: 3, studentName: 'Priyanka M', photoUrl: '/avatars/a3.svg', ratingValue: 4, quoteText: 'Good depth on Django and databases. I would have liked more time on deployment, but the trainer stayed back on Saturdays to cover it with us.', source: 'WEBSITE', courseId: 1, displayOrder: 3 },
  { id: 4, studentName: 'Vignesh P', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'I was working full time and took the evening batch. Recordings were shared the same night, so missing a class never set me back.', source: 'GOOGLE', courseId: 1, displayOrder: 4 },

  // Course 2 — Data Analytics.
  { id: 5, studentName: 'Sneha Lakshmi', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'The SQL module alone was worth the fee. I use window functions every single day in my reporting job now.', source: 'GOOGLE', courseId: 2, displayOrder: 1 },
  { id: 6, studentName: 'Karthik N', photoUrl: '/avatars/a1.svg', ratingValue: 4, quoteText: 'Practical and to the point. Working with messy retail data instead of clean sample files prepared me for what the job is actually like.', source: 'WEBSITE', courseId: 2, displayOrder: 2 },
  { id: 23, studentName: 'Aishwarya Devi', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'Building the same dashboard in both Power BI and Tableau sounded like extra work at the time. It got me shortlisted by a company that had standardised on Tableau.', source: 'GOOGLE', courseId: 2, displayOrder: 3 },

  // Course 3 — Full Stack Java.
  { id: 31, studentName: 'Mohammed Rizwan', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'I came in knowing only college-level Java. The Spring Boot and Hibernate modules are what carried my first interview — I was asked about collections and entity mapping almost exactly as we had practised.', source: 'GOOGLE', courseId: 3, displayOrder: 1 },
  { id: 32, studentName: 'Deepika S', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'Twelve modules sounds long until you realise it is one project the whole way through. I finished with a working application — login, REST APIs, MySQL — that I could open and walk through.', source: 'WEBSITE', courseId: 3, displayOrder: 2 },
  { id: 33, studentName: 'Hari Prasad M', photoUrl: '/avatars/a4.svg', ratingValue: 4, quoteText: 'The trainers clearly come from the enterprise side and it shows. I wanted more Angular, but React was covered properly and picking up the other later was not hard.', source: 'GOOGLE', courseId: 3, displayOrder: 3 },

  // Course 4 — Frontend Developer - UI/UX Design.
  { id: 41, studentName: 'Ashwini R', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'Designing a screen in Figma and then being made to build that exact screen in React changed how I design. I stopped drawing things that are painful to code.', source: 'GOOGLE', courseId: 4, displayOrder: 1 },
  { id: 42, studentName: 'Naveen Raj', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'Accessibility was taught while building rather than as a lecture at the end. Contrast and keyboard focus came up in my interview and I had real answers.', source: 'WEBSITE', courseId: 4, displayOrder: 2 },
  { id: 43, studentName: 'Fathima Beevi', photoUrl: '/avatars/a3.svg', ratingValue: 4, quoteText: 'The usability testing sessions were the most useful part — watching someone struggle with my own prototype taught me more than any checklist. More animation work would have been welcome.', source: 'GOOGLE', courseId: 4, displayOrder: 3 },

  // Course 5 — MERN Full Stack.
  { id: 51, studentName: 'Surya Prakash', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'One language across the whole stack meant I was productive much faster than friends learning two. By month three I was deploying my own APIs.', source: 'GOOGLE', courseId: 5, displayOrder: 1 },
  { id: 52, studentName: 'Meenakshi V', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'MongoDB was taught as something you model deliberately, not a bucket to dump objects into. That distinction came up directly in my technical round.', source: 'WEBSITE', courseId: 5, displayOrder: 2 },
  { id: 53, studentName: 'Ajay Kumar', photoUrl: '/avatars/a2.svg', ratingValue: 4, quoteText: 'The async JavaScript module fixed bugs I had been living with for a year. Pace is quick in the first few weeks, so do not skip the daily tasks.', source: 'GOOGLE', courseId: 5, displayOrder: 3 },

  // Course 6 — MEAN Full Stack.
  { id: 61, studentName: 'Ramya Devi', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'Teaching TypeScript properly before touching Angular was the right call. Everything that had felt heavy about Angular in college suddenly made sense.', source: 'GOOGLE', courseId: 6, displayOrder: 1 },
  { id: 62, studentName: 'Vishnu Vardhan', photoUrl: '/avatars/a4.svg', ratingValue: 4, quoteText: 'RxJS took me longer than the rest of the course put together. The trainer ran two extra weekend sessions on it until the batch was comfortable.', source: 'WEBSITE', courseId: 6, displayOrder: 2 },
  { id: 63, studentName: 'Sandhya P', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'I was aiming at service companies and this is the stack most of them interview on. The structured project work was what my panel asked about.', source: 'GOOGLE', courseId: 6, displayOrder: 3 },

  // Course 7 — C and C++.
  { id: 71, studentName: 'Gokul Anand', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'The pointers and memory module is unhurried in a way I have not seen elsewhere. I am now in an embedded role where that is the whole job.', source: 'GOOGLE', courseId: 7, displayOrder: 1 },
  { id: 72, studentName: 'Kavya Shree', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'Being handed deliberately broken programs and told to find the fault with GDB taught me debugging properly. I stopped rewriting code and started reading it.', source: 'WEBSITE', courseId: 7, displayOrder: 2 },
  { id: 73, studentName: 'Ranjith Kumar', photoUrl: '/avatars/a4.svg', ratingValue: 4, quoteText: 'Solid foundation course and quite intense. Java felt easy afterwards because I already knew what the language was doing underneath.', source: 'GOOGLE', courseId: 7, displayOrder: 3 },

  // Course 8 — DSA with Python / Java.
  { id: 81, studentName: 'Praveen Kumar S', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'I had failed two coding rounds before joining. The difference afterwards was recognising the pattern in the first two minutes instead of panicking.', source: 'GOOGLE', courseId: 8, displayOrder: 1 },
  { id: 82, studentName: 'Nithya Balan', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'Dynamic programming was built up from recursion step by step rather than handed over as formulas to memorise. That is the only reason it stuck.', source: 'WEBSITE', courseId: 8, displayOrder: 2 },
  { id: 83, studentName: 'Ashok Raj', photoUrl: '/avatars/a3.svg', ratingValue: 4, quoteText: 'The timed contest practice is uncomfortable and completely worth it. Speaking my approach out loud while coding is what my interviewer actually graded.', source: 'GOOGLE', courseId: 8, displayOrder: 3 },

  // Course 9 — Data Science.
  { id: 91, studentName: 'Swetha Ramesh', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'Most of the course is spent on preparing data rather than fitting models, which is exactly how the job turned out to be.', source: 'GOOGLE', courseId: 9, displayOrder: 1 },
  { id: 92, studentName: 'Barath Kumar', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'The statistics module is what separates this from a video series. I can say why a result is meaningful instead of quoting an accuracy number.', source: 'WEBSITE', courseId: 9, displayOrder: 2 },
  { id: 93, studentName: 'Divya Bharathi', photoUrl: '/avatars/a2.svg', ratingValue: 4, quoteText: 'Strong on modelling and evaluation. I would happily have spent another two weeks on deployment, though the basics were enough to get started.', source: 'GOOGLE', courseId: 9, displayOrder: 3 },

  // Course 10 — Artificial Intelligence and Machine Learning.
  { id: 101, studentName: 'Aravind Krishnan', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'Building a neural network from scratch once, before any framework, is what made TensorFlow readable afterwards instead of magical.', source: 'GOOGLE', courseId: 10, displayOrder: 1 },
  { id: 102, studentName: 'Pooja Nandini', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'My image classification project from the computer vision module is still the first thing interviewers ask me about.', source: 'WEBSITE', courseId: 10, displayOrder: 2 },
  { id: 103, studentName: 'Sathish Kumar', photoUrl: '/avatars/a1.svg', ratingValue: 4, quoteText: 'Good balance between classical machine learning and deep learning. Come with your Python already solid and you will get much more out of it.', source: 'GOOGLE', courseId: 10, displayOrder: 3 },

  // Course 11 — AWS - The Ultimate.
  { id: 111, studentName: 'Yuvaraj S', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'Cleared Cloud Practitioner two weeks after finishing, and the Solutions Architect practice questions were close to the real paper.', source: 'GOOGLE', courseId: 11, displayOrder: 1 },
  { id: 112, studentName: 'Anitha Selvam', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'VPC finally made sense because we broke our own networking and had to work out why a server could not reach the internet.', source: 'WEBSITE', courseId: 11, displayOrder: 2 },
  { id: 113, studentName: 'Mohan Raj', photoUrl: '/avatars/a4.svg', ratingValue: 4, quoteText: 'The billing and cost module is the part nobody else teaches. It is the reason my manager now sends the monthly AWS bill to me.', source: 'GOOGLE', courseId: 11, displayOrder: 3 },

  // Course 12 — AWS & DevOps.
  { id: 121, studentName: 'Karthikeyan V', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'I moved from an application support role into DevOps six months after finishing. The Jenkins and Terraform modules were what the interviews focused on.', source: 'GOOGLE', courseId: 12, displayOrder: 1 },
  { id: 122, studentName: 'Shalini Priya', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'Being made to debug a pod that would not start, repeatedly, is the most useful Kubernetes teaching I have had.', source: 'WEBSITE', courseId: 12, displayOrder: 2 },
  { id: 123, studentName: 'Naveen Kumar R', photoUrl: '/avatars/a3.svg', ratingValue: 4, quoteText: 'A lot of tools in a short time. The capstone pipeline pulls it together, and going back to my own notes afterwards was straightforward.', source: 'GOOGLE', courseId: 12, displayOrder: 3 },

  // Course 13 — Data Engineering.
  { id: 131, studentName: 'Bhuvaneswari K', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'Writing Airflow DAGs that survive a rerun and a late file is a different skill from writing a script, and this is where I learned it.', source: 'GOOGLE', courseId: 13, displayOrder: 1 },
  { id: 132, studentName: 'Manoj Pandian', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'Spark was taught on data big enough that partitions and shuffles actually mattered, so the tuning discussion was not theoretical.', source: 'WEBSITE', courseId: 13, displayOrder: 2 },
  { id: 133, studentName: 'Revathi S', photoUrl: '/avatars/a2.svg', ratingValue: 4, quoteText: 'The warehouse modelling module saved me in my interview — I was asked about slowly changing dimensions and had actually built them.', source: 'GOOGLE', courseId: 13, displayOrder: 3 },

  // Course 14 — Digital Marketing.
  { id: 141, studentName: 'Sridhar Balaji', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'I run a small shop and joined to stop wasting money on ads. Learning to read cost per acquisition properly paid for the course in the first quarter.', source: 'GOOGLE', courseId: 14, displayOrder: 1 },
  { id: 142, studentName: 'Keerthana M', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'Running a real technical SEO audit, not a checklist, is what got me hired at an agency. I walked into the interview with the audit I had done.', source: 'WEBSITE', courseId: 14, displayOrder: 2 },
  { id: 143, studentName: 'Imran Khan', photoUrl: '/avatars/a1.svg', ratingValue: 4, quoteText: 'Spending a live budget rather than practising on a dummy account makes the analytics module land. I would like more on video and YouTube ads.', source: 'GOOGLE', courseId: 14, displayOrder: 3 },

  // Course 15 — Gen AI.
  { id: 151, studentName: 'Vignesh Anand', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'I built a retrieval system over our own company documents during the course and we are still using it. Sixty hours very well spent.', source: 'GOOGLE', courseId: 15, displayOrder: 1 },
  { id: 152, studentName: 'Nandhini R', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'Prompting was treated as something you test and measure rather than a list of tricks. The evaluation session changed how my team ships features.', source: 'WEBSITE', courseId: 15, displayOrder: 2 },
  { id: 153, studentName: 'Prakash Raj', photoUrl: '/avatars/a4.svg', ratingValue: 4, quoteText: 'Dense for a short course, and it assumes you can already code. Exactly what I wanted — no time spent on what a variable is.', source: 'GOOGLE', courseId: 15, displayOrder: 3 },

  // Course 16 — Agentic AI.
  { id: 161, studentName: 'Rahul Menon', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'Writing an agent loop in plain Python before touching LangGraph is what made the framework obvious rather than intimidating.', source: 'GOOGLE', courseId: 16, displayOrder: 1 },
  { id: 162, studentName: 'Sowmya Iyer', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'The session on tracing and guardrails is the reason my agent is in production instead of stuck in a demo.', source: 'WEBSITE', courseId: 16, displayOrder: 2 },
  { id: 163, studentName: 'Dinesh Kumar', photoUrl: '/avatars/a3.svg', ratingValue: 4, quoteText: 'Take the Gen AI course first. I did, and the jump into tool design and multi-agent workflows was comfortable.', source: 'GOOGLE', courseId: 16, displayOrder: 3 },

  // Course 17 — ServiceNow.
  { id: 171, studentName: 'Jeyanthi R', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'My interview task was to build a catalogue item with an approval workflow. That is precisely the capstone we had already done twice.', source: 'GOOGLE', courseId: 17, displayOrder: 1 },
  { id: 172, studentName: 'Arjun Balaji', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'I came from a non-development background and was worried about the scripting. The JavaScript needed is taught here from scratch.', source: 'WEBSITE', courseId: 17, displayOrder: 2 },
  { id: 173, studentName: 'Sangeetha M', photoUrl: '/avatars/a2.svg', ratingValue: 4, quoteText: 'A genuinely underrated field with far less competition than developer roles. The ITSM process teaching is as valuable as the platform work.', source: 'GOOGLE', courseId: 17, displayOrder: 3 },

  // Course 18 — Cybersecurity.
  { id: 181, studentName: 'Abdul Basith', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'Networking and Linux before any tool was the right order. People who start at Kali cannot read a packet capture, and I can.', source: 'GOOGLE', courseId: 18, displayOrder: 1 },
  { id: 182, studentName: 'Harini Sundar', photoUrl: '/avatars/a4.svg', ratingValue: 5, quoteText: 'Working the OWASP Top 10 hands-on with Burp Suite in an isolated lab, with the legal boundaries spelled out, made this feel professional rather than reckless.', source: 'WEBSITE', courseId: 18, displayOrder: 2 },
  { id: 183, studentName: 'Vimal Raj', photoUrl: '/avatars/a1.svg', ratingValue: 4, quoteText: 'I am now in a SOC analyst role. The log analysis and incident response module is the part I use daily.', source: 'GOOGLE', courseId: 18, displayOrder: 3 },

  // Course 19 — Tally.
  { id: 191, studentName: 'Lakshmi Priya', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'I finished B.Com without ever filing a GST return. Two months here and I handle the filings for a firm with forty clients.', source: 'GOOGLE', courseId: 19, displayOrder: 1 },
  { id: 192, studentName: 'Senthil Kumar', photoUrl: '/avatars/a3.svg', ratingValue: 5, quoteText: 'I run a business and joined to stop depending entirely on my auditor. I can now read my own balance sheet and ask better questions.', source: 'WEBSITE', courseId: 19, displayOrder: 2 },
  { id: 193, studentName: 'Gayathri N', photoUrl: '/avatars/a4.svg', ratingValue: 4, quoteText: 'The accounting logic is taught alongside the software, so entries make sense instead of being memorised keystrokes. Payroll could be a little longer.', source: 'GOOGLE', courseId: 19, displayOrder: 3 },

  // Course 20 — Placement Readiness Program.
  { id: 201, studentName: 'Sanjay Kumar', photoUrl: '/avatars/a1.svg', ratingValue: 5, quoteText: 'The panel mock interviews with written feedback and a second attempt are the whole value. My first real interview was my fifth interview.', source: 'GOOGLE', courseId: 20, displayOrder: 1 },
  { id: 202, studentName: 'Priyadharshini S', photoUrl: '/avatars/a2.svg', ratingValue: 5, quoteText: 'My resume was rewritten against actual job descriptions rather than a template. Calls started coming within two weeks of that change.', source: 'WEBSITE', courseId: 20, displayOrder: 2 },
  { id: 203, studentName: 'Mathan Raj', photoUrl: '/avatars/a3.svg', ratingValue: 4, quoteText: 'I could always solve the aptitude questions — never in the time given. The timed drills fixed that, and that is what was filtering me out.', source: 'GOOGLE', courseId: 20, displayOrder: 3 },
]

export const SETTINGS = {
  google_rating: '4.6',
  google_review_count: '250',
}
