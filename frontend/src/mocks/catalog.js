/**
 * The course catalog, as the API will serve it.
 *
 * Split out of fixtures.js because twenty courses alongside the testimonial and
 * settings fixtures made that file impossible to scan. `fixtures.js` re-exports
 * `COURSES` from here, so nothing outside this folder changes.
 *
 * Course 1 (Python Full Stack) mirrors Course_Page.pdf: its title, description
 * copy, module list and tech stack are taken from that document, not invented,
 * and the page was visually validated against it. Treat that record as fixed.
 * The other nineteen follow the same shape with copy written for their own
 * domain.
 *
 * Field names mirror the API contract exactly. If the real payload differs, fix
 * the normalizer in the service, not this file.
 */

/**
 * Logos that exist in /public/tech. Everything else resolves to null, and
 * TechStackSection renders those items as small bulleted words — the same
 * treatment Soft Skill items already get — instead of a broken image.
 *
 * TODO(content): most of the catalog's tools have no logo yet. In production
 * these are uploaded per item from the admin dashboard; until then, adding an
 * SVG to /public/tech and a line here is all a course needs.
 */
const ICON_BY_NAME = {
  HTML5: '/tech/html5.svg',
  CSS3: '/tech/css3.svg',
  JavaScript: '/tech/javascript.svg',
  React: '/tech/react.svg',
  Bootstrap: '/tech/bootstrap.svg',
  Python: '/tech/python.svg',
  Django: '/tech/django.svg',
  Flask: '/tech/flask.svg',
  'REST API': '/tech/api.svg',
  MySQL: '/tech/mysql.svg',
  PostgreSQL: '/tech/postgresql.svg',
  SQLite: '/tech/sqlite.svg',
  'SQL Server': '/tech/sqlserver.svg',
  Git: '/tech/git.svg',
  GitHub: '/tech/github.svg',
  Docker: '/tech/docker.svg',
  AWS: '/tech/aws.svg',
  Excel: '/tech/excel.svg',
  'Power BI': '/tech/powerbi.svg',
}

/**
 * Expand `{ 'Front End': ['HTML5', …], … }` into the flat CourseTechStack rows
 * the API returns.
 *
 * Group order is the key order of the object, which is the order the section
 * renders them in — it groups by first appearance rather than by a fixed list
 * of names, so a course with three groups and a course with five both render
 * without a code change.
 *
 * `displayOrder` restarts at 1 within each group, matching the contract.
 */
function buildTechStack(courseId, groups) {
  const rows = []
  let sequence = 0

  Object.entries(groups).forEach(([groupName, itemNames]) => {
    itemNames.forEach((itemName, index) => {
      rows.push({
        id: courseId * 1000 + 500 + sequence++,
        groupName,
        itemName,
        iconUrl: ICON_BY_NAME[itemName] ?? null,
        displayOrder: index + 1,
      })
    })
  })

  return rows
}

/**
 * The reference page labels every row "Module 1:" … "Module 10:", so the prefix
 * is part of the stored title and is applied here rather than typed twenty
 * times over.
 */
function buildModules(courseId, modules) {
  return modules.map((module, index) => ({
    id: courseId * 1000 + index + 1,
    title: `Module ${index + 1}: ${module.title}`,
    description: module.description,
    displayOrder: index + 1,
  }))
}

/**
 * One course record, with the fields that are the same across the catalog
 * defaulted.
 *
 * `price`/`discountPrice` default to null: fee structure was not supplied for
 * these courses and inventing one would put a wrong number in front of a
 * customer. MobileEnrollBar already falls back to "Talk to a counsellor".
 */
function makeCourse({
  id,
  title,
  slug,
  category,
  categoryGroup,
  shortDescription,
  description,
  durationValue,
  durationUnit = 'Hours',
  mode = 'HYBRID',
  price = null,
  discountPrice = null,
  discountLabel = null,
  badgeLabel = null,
  syllabusFileUrl = null,
  roleHeading,
  roleIntro,
  roleColumns = [],
  roleBullets = [],
  modules,
  techStack,
}) {
  return {
    id,
    title,
    slug,
    category,
    categoryGroup,
    shortDescription,
    description,
    durationValue,
    durationUnit,
    mode,
    price,
    discountPrice,
    discountLabel,
    badgeLabel,
    iconUrl: null,
    heroImageUrl: null,
    syllabusFileUrl,
    status: 'PUBLISHED',
    roleHeading,
    roleIntro,
    roleColumns,
    roleBullets,
    modules: buildModules(id, modules),
    techStack: buildTechStack(id, techStack),
  }
}

export const COURSES = [
  makeCourse({
    id: 3,
    title: 'Full Stack Java',
    slug: 'full-stack-java',
    // `category` is the short course name the "Why Learn …?" and "What is …?"
    // headings are built from, so it reads as a subject, not as a shelf label.
    category: 'Java Full Stack',
    categoryGroup: 'Full Stack',
    shortDescription:
      'Java Full Stack development course in Coimbatore — Spring Boot, React and MySQL, with live projects and 100% placement support.',
    description: `
      <p>Learning a Java Full Stack course in Coimbatore with LeSuccess offers strong career advantages. Java is still the language most enterprise product teams and service companies in the region hire for, and Spring Boot sits behind the majority of those openings. This course covers core Java properly before moving to frameworks, because the questions that decide an offer are usually about collections, memory and OOP rather than annotations. You build one application across the whole syllabus — front end, REST API, database and deployment — instead of a folder of disconnected exercises. With live projects, daily tasks and 100% placement support, you finish with something you can open in an interview and talk through line by line.</p>
    `,
    durationValue: 300,
    badgeLabel: 'Most Enrolled',
    // Matches the promo wording already used site-wide, rather than inventing a
    // second phrasing for the same offer.
    discountLabel: '30% OFF',
    roleHeading: 'What does a Java Full Stack Developer do?',
    roleIntro:
      'A Java full stack developer owns a feature from the screen a user clicks to the row that lands in the database. That means moving between two quite different skill sets in the same day, and knowing enough about both to make the trade-off between them yourself.',
    roleColumns: [
      {
        label: 'Front End',
        description:
          'Build the screens in HTML, CSS, JavaScript and React — layout, state, forms, and the calls that fetch data from your own API.',
      },
      {
        label: 'Back End',
        description:
          'Model the data, write the Spring Boot services and REST endpoints behind those screens, and keep queries, security and error handling sane under load.',
      },
    ],
    roleBullets: [
      'Design the application structure, user interface, APIs, and database schema.',
      'Build the front end, the Spring Boot services behind it, and the queries that feed both.',
      'Ship new features, then keep them fast and stable across browsers and devices.',
    ],
    modules: [
      { title: 'Core Java Foundations', description: 'Syntax, data types, control flow, arrays and methods, written from an empty file rather than filled into a template.' },
      { title: 'Object Oriented Programming in Java', description: 'Classes, inheritance, interfaces, polymorphism and abstraction — the concepts every Java interview opens with.' },
      { title: 'Collections, Generics and Exceptions', description: 'List, Map and Set and when each is the wrong choice, plus generics and exception handling that does not swallow failures.' },
      { title: 'HTML5, CSS3 and Responsive Layout', description: 'Semantic markup, the box model, flexbox, grid and Bootstrap, rebuilding real pages to spec.' },
      { title: 'JavaScript and the DOM', description: 'ES6+, events, fetch and async/await — enough vanilla JavaScript that React stops feeling like magic.' },
      { title: 'React Fundamentals', description: 'Components, props, state, hooks and routing, built around the application you extend for the rest of the course.' },
      { title: 'Databases and SQL with MySQL', description: 'Schema design, joins, indexing and transactions, including making a slow query fast.' },
      { title: 'JDBC and Hibernate', description: 'Connecting Java to a database, mapping entities and relationships, and the N+1 problem you will otherwise meet in production.' },
      { title: 'Spring Boot and REST APIs', description: 'Controllers, services, dependency injection, validation and the endpoints your own React front end consumes.' },
      { title: 'Spring Security and Authentication', description: 'Login, roles, JWT, and the difference between authentication and authorisation, applied to your own project.' },
      { title: 'Maven, JUnit and Postman', description: 'Builds and dependencies, tests worth running, and exercising an API before any UI exists.' },
      { title: 'Git, Docker, Deployment and Capstone Project', description: 'Branching, pull requests, containers and a cloud deployment, finishing with your capstone project review.' },
    ],
    techStack: {
      'Front End': ['HTML5', 'CSS3', 'JavaScript', 'React', 'Bootstrap'],
      'Back End': ['Java', 'Spring Boot', 'Hibernate', 'REST API'],
      Database: ['MySQL'],
      'Tools & Deploy': ['Git', 'Maven', 'Postman', 'Docker'],
      'Soft Skill': ['Communication', 'Resume Building'],
    },
  }),

  /*
   * COURSE 1 — the Course_Page.pdf reference course, validated visually.
   * Title, copy, duration, pricing, modules and tech stack are unchanged from
   * the original fixture. `roleHeading`/`roleIntro`/`roleBullets` reproduce the
   * copy that used to be hardcoded in the role section, word for word, and
   * `roleColumns` is empty because that intro already carries the Front End /
   * Back End split — adding columns here would change a validated page.
   */
  makeCourse({
    id: 1,
    title: 'Python : Full Stack Development course in Coimbatore',
    slug: 'python-full-stack-development',
    category: 'Python Full Stack',
    categoryGroup: 'Full Stack',
    shortDescription:
      'Python Full Stack Development course in Coimbatore with live projects, daily tasks and 100% placement support.',
    description: `
      <p>Learning a Python Full Stack course in Coimbatore with LeSuccess offers strong career advantages. Python is a versatile and in-demand language used in software development, data science, and automation. LeSuccess provides quality training covering both basic and advanced concepts. Their focus on live projects and daily tasks helps students gain practical, real-world experience. With 100% placement support, it becomes easier to secure good job opportunities. This course is ideal for both beginners and professionals looking to upgrade their skills.</p>
    `,
    durationValue: 6,
    durationUnit: 'MONTHS',
    mode: 'Classroom &amp; Online',
    price: 45000,
    discountPrice: 31500,
    discountLabel: '30% OFF',
    badgeLabel: 'Most Enrolled',
    syllabusFileUrl: '#',
    roleHeading: 'What does a Full Stack Developer do?',
    roleIntro:
      'The front end—what users see and interact with—and the back end, which handles data and server-side logic, require different skill sets. Full-stack developers work across both areas, so they need a strong understanding of the entire development process.',
    roleColumns: [],
    roleBullets: [
      'Design the application structure, user interface, APIs, and database.',
      'Develop the front end, server-side logic, APIs, and core components.',
      'Build and implement new features while ensuring smooth performance across different devices and platforms.',
    ],
    modules: [
      { title: 'Python Programming Basics', description: 'Syntax, data types, operators, control flow and functions. Ends with a small command-line tool written from an empty file.' },
      { title: 'Object Oriented Programming', description: 'Classes, objects, inheritance, polymorphism and exception handling, with the design habits that keep a codebase changeable.' },
      { title: 'HTML5 and CSS3', description: 'Semantic markup, the box model, flexbox and grid. You rebuild real landing pages to spec.' },
      { title: 'Bootstrap and Responsive Design', description: 'Grid system, components and utilities, and making a layout behave on a mid-range phone as well as a laptop.' },
      { title: 'JavaScript and the DOM', description: 'ES6+, events, fetch and async/await — enough vanilla JavaScript that React stops feeling like magic.' },
      { title: 'React Fundamentals', description: 'Components, props, state, hooks and routing, built around one application you extend for the rest of the course.' },
      { title: 'Databases and SQL', description: 'Schema design, joins, indexing and migrations on MySQL and PostgreSQL, including making a slow query fast.' },
      { title: 'Django Framework', description: 'Models, views, templates, the ORM and authentication, with an admin-backed application you build end to end.' },
      { title: 'REST APIs with Django and Flask', description: 'Designing endpoints, serializers, status codes and auth — the APIs your own React front end consumes.' },
      { title: 'Git, Deployment and Capstone Project', description: 'Branching, pull requests, Docker basics and deploying to AWS, finishing with your capstone project review.' },
    ],
    techStack: {
      'Front End': ['HTML5', 'CSS3', 'JavaScript', 'React', 'Bootstrap'],
      'Back End': ['Python', 'Django', 'Flask', 'REST API'],
      Database: ['MySQL', 'PostgreSQL', 'SQLite'],
      'Tools & Deploy': ['Git', 'GitHub', 'Docker', 'AWS'],
      'Soft Skill': ['Communication', 'Resume Building'],
    },
  }),

  makeCourse({
    id: 4,
    title: 'Frontend Developer - UI/UX Design',
    slug: 'frontend-developer-ui-ux-design',
    category: 'Frontend and UI/UX Design',
    categoryGroup: 'Frontend & Design',
    shortDescription:
      'Design interfaces in Figma and then build them in React — one course covering both halves of front-end work.',
    description: `
      <p>Learning a Frontend and UI/UX course in Coimbatore with LeSuccess offers a rare combination: the design judgement to decide what a screen should look like, and the code to build it. Most openings here ask for both, because small product teams cannot afford a separate designer and developer for every screen. You start in Figma with wireframes, user flows and prototypes, then rebuild those same designs in HTML, CSS, JavaScript and React so the handoff is something you have done yourself. Accessibility and responsive behaviour are taught as part of the build rather than as an afterthought. You finish with a portfolio of real interfaces — the only thing a front-end interview actually looks at.</p>
    `,
    durationValue: 180,
    roleHeading: 'What does a Frontend and UI/UX Designer do?',
    roleIntro:
      'Deciding how a screen should work and making it work in a browser are different jobs, and in a small team they are often the same person. That person carries an idea from a rough sketch through to a live, responsive interface.',
    roleColumns: [
      {
        label: 'Design',
        description:
          'Research users, sketch flows, build wireframes and high-fidelity Figma prototypes, and test them with real people before a line of code is written.',
      },
      {
        label: 'Build',
        description:
          'Turn those designs into responsive, accessible React components that behave the same on a mid-range phone as on a laptop.',
      },
    ],
    roleBullets: [
      'Turn a vague requirement into wireframes, flows and a clickable prototype.',
      'Build the interface in HTML, CSS, JavaScript and React, to the design, not near it.',
      'Test on real devices and fix what breaks — layout, contrast, keyboard access and speed.',
    ],
    modules: [
      { title: 'Design Fundamentals', description: 'Layout, hierarchy, spacing, colour and type — why one screen reads instantly and another does not.' },
      { title: 'User Research and Wireframing', description: 'Personas, user flows and low-fidelity wireframes, so decisions are argued from evidence rather than taste.' },
      { title: 'Figma in Depth', description: 'Frames, auto layout, components, variants and shared styles — building a design system, not a set of drawings.' },
      { title: 'Prototyping and Usability Testing', description: 'Clickable prototypes in Figma and Adobe XD, put in front of users, then changed on what you observe.' },
      { title: 'HTML5 and Semantic Markup', description: 'Document structure, forms and the semantics that decide whether a screen reader can use your page.' },
      { title: 'CSS3, Flexbox and Grid', description: 'The box model, positioning, and modern layout, rebuilding your own Figma screens pixel for pixel.' },
      { title: 'Responsive and Accessible Design', description: 'Breakpoints, fluid type, contrast, focus states and keyboard navigation as part of the build.' },
      { title: 'JavaScript for Interfaces', description: 'ES6+, events, the DOM and fetch — the behaviour behind menus, modals, forms and data loading.' },
      { title: 'React Fundamentals', description: 'Components, props, state, hooks and routing, structured so a design system maps onto a component tree.' },
      { title: 'Design Handoff and Version Control', description: 'Specs, tokens, assets and Git — working the way a real product team hands work back and forth.' },
      { title: 'Portfolio and Capstone Project', description: 'A complete product designed and built by you, written up as a case study an interviewer can follow.' },
    ],
    techStack: {
      'Design Tools': ['Figma', 'Adobe XD'],
      'Front End': ['HTML5', 'CSS3', 'JavaScript', 'React'],
      'UX Process': ['Wireframing', 'User Research', 'Prototyping', 'Usability Testing'],
      'Soft Skill': ['Communication', 'Portfolio Building'],
    },
  }),

  makeCourse({
    id: 5,
    title: 'MERN Full Stack',
    slug: 'mern-full-stack',
    category: 'MERN Full Stack',
    categoryGroup: 'Full Stack',
    shortDescription:
      'MongoDB, Express, React and Node — one language across the whole stack, with live projects and placement support.',
    description: `
      <p>Learning a MERN Full Stack course in Coimbatore with LeSuccess offers the fastest route from beginner to shipping web applications, because the whole stack runs on one language. JavaScript on the browser, on the server and in the database query layer means the concepts you learn in week two are still paying off in month five. The course goes deep on React and on Node and Express, and treats MongoDB as a database to be modelled deliberately rather than a place to dump objects. Startups and product teams hiring in Coimbatore ask for this stack more than any other, and they ask to see working applications. You leave with a deployed full-stack project, daily practice behind you, and 100% placement support.</p>
    `,
    durationValue: 300,
    roleHeading: 'What does a MERN Stack Developer do?',
    roleIntro:
      'A MERN developer builds the interface a user sees and the service that answers it, in the same language, often in the same working day. The value is in understanding how a change on one side lands on the other.',
    roleColumns: [
      {
        label: 'Front End',
        description:
          'Build React interfaces — components, state, routing and forms — that consume your own API and stay fast as they grow.',
      },
      {
        label: 'Back End',
        description:
          'Design MongoDB schemas and write the Node and Express services, REST endpoints and authentication behind those interfaces.',
      },
    ],
    roleBullets: [
      'Design the data model, the API surface and the component structure together.',
      'Build the React front end and the Node and Express services that feed it.',
      'Deploy, monitor and fix real applications rather than local demos.',
    ],
    modules: [
      { title: 'JavaScript Foundations', description: 'Types, scope, closures, arrays and objects, and the ES6+ syntax the rest of the stack assumes you know.' },
      { title: 'HTML5, CSS3 and Responsive Layout', description: 'Semantic markup, flexbox and grid, rebuilding real pages to spec before any framework appears.' },
      { title: 'Asynchronous JavaScript', description: 'Promises, async/await, fetch and error handling — where most beginner bugs in this stack actually live.' },
      { title: 'React Fundamentals', description: 'Components, props, state, hooks and lists, built around one application you extend all course.' },
      { title: 'React Router and State Management', description: 'Routing, context, and lifting state, plus when reaching for a state library is the wrong answer.' },
      { title: 'Node.js Fundamentals', description: 'The runtime, modules, the event loop, npm and reading a stack trace without guessing.' },
      { title: 'Express and REST APIs', description: 'Routing, middleware, validation, status codes and an API your own React app consumes.' },
      { title: 'MongoDB and Mongoose', description: 'Documents, schema design, relationships, indexes and aggregation — modelling data on purpose.' },
      { title: 'Authentication and Authorisation', description: 'Sessions, JWT, password hashing, roles, and the mistakes that leak user data.' },
      { title: 'Testing and Debugging', description: 'Postman, browser devtools and automated tests, used while you build rather than after.' },
      { title: 'Git, Docker and Deployment', description: 'Branching, pull requests, containers, environment variables and getting the app onto a real host.' },
      { title: 'Capstone Project', description: 'A full MERN application, built to a brief, reviewed and defended the way an interview will ask you to.' },
    ],
    techStack: {
      'Front End': ['HTML5', 'CSS3', 'JavaScript', 'React'],
      'Back End': ['Node.js', 'Express.js', 'REST API'],
      Database: ['MongoDB', 'Mongoose'],
      'Tools & Deploy': ['Git', 'GitHub', 'Postman', 'Docker'],
      'Soft Skill': ['Communication', 'Resume Building'],
    },
  }),

  makeCourse({
    id: 6,
    title: 'MEAN Full Stack',
    slug: 'mean-full-stack',
    category: 'MEAN Full Stack',
    categoryGroup: 'Full Stack',
    shortDescription:
      'Angular and TypeScript on the front, Node, Express and MongoDB behind it — the stack enterprise teams standardise on.',
    description: `
      <p>Learning a MEAN Full Stack course in Coimbatore with LeSuccess suits anyone aiming at larger product and services teams, where Angular and TypeScript are the standard rather than the exception. Angular is opinionated by design — modules, dependency injection, typed services and RxJS — and that structure is exactly why bigger codebases and bigger teams choose it. The course teaches TypeScript properly first, since untyped habits are what make Angular feel heavy. Behind the front end you build the same Node, Express and MongoDB services, so you finish able to work on either side of the stack. Live projects, daily tasks and 100% placement support run throughout.</p>
    `,
    durationValue: 300,
    roleHeading: 'What does a MEAN Stack Developer do?',
    roleIntro:
      'A MEAN developer works inside a typed, structured front end and the Node services behind it. The discipline the stack imposes is the point: it is what lets several developers work on one application without standing on each other.',
    roleColumns: [
      {
        label: 'Front End',
        description:
          'Build Angular applications in TypeScript — components, modules, typed services, forms and RxJS streams that stay readable as the app grows.',
      },
      {
        label: 'Back End',
        description:
          'Write the Node and Express APIs, model the MongoDB collections behind them, and handle auth, validation and errors consistently.',
      },
    ],
    roleBullets: [
      'Structure an Angular application so a second developer can find their way around it.',
      'Build the typed services, REST APIs and MongoDB schemas behind the screens.',
      'Ship features with tests, code review and a deployment pipeline, not by hand.',
    ],
    modules: [
      { title: 'JavaScript Foundations', description: 'Types, scope, closures and ES6+ syntax — the base TypeScript and Angular are built on.' },
      { title: 'HTML5, CSS3 and Responsive Layout', description: 'Semantic markup, flexbox and grid, and templates that stay maintainable inside a component framework.' },
      { title: 'TypeScript Essentials', description: 'Types, interfaces, generics and decorators, and why an Angular codebase is unmanageable without them.' },
      { title: 'Angular Fundamentals', description: 'Components, templates, data binding, directives and pipes, built around one application you keep extending.' },
      { title: 'Services, Dependency Injection and RxJS', description: 'Shared state, HTTP calls and observables — the part of Angular that decides whether the app scales.' },
      { title: 'Angular Routing and Forms', description: 'Route guards, lazy loading, reactive forms and validation that gives users a usable error message.' },
      { title: 'Node.js Fundamentals', description: 'The runtime, modules, the event loop, npm and debugging server-side JavaScript.' },
      { title: 'Express and REST APIs', description: 'Routing, middleware, validation and status codes, exercised from Postman before the UI exists.' },
      { title: 'MongoDB and Mongoose', description: 'Schema design, relationships, indexes and aggregation against a realistic dataset.' },
      { title: 'Authentication and Security', description: 'JWT, guards, roles, password hashing and the common ways a web app leaks data.' },
      { title: 'Testing, Git and Deployment', description: 'Unit tests, branching, pull requests, Docker and getting the application onto a real host.' },
      { title: 'Capstone Project', description: 'A complete MEAN application built to a brief, reviewed and defended in a mock technical interview.' },
    ],
    techStack: {
      'Front End': ['HTML5', 'CSS3', 'TypeScript', 'Angular', 'RxJS'],
      'Back End': ['Node.js', 'Express.js', 'REST API'],
      Database: ['MongoDB', 'Mongoose'],
      'Tools & Deploy': ['Git', 'GitHub', 'Postman', 'Docker'],
      'Soft Skill': ['Communication', 'Resume Building'],
    },
  }),

  makeCourse({
    id: 7,
    title: 'C and C++',
    slug: 'c-and-cpp',
    category: 'C and C++ Programming',
    categoryGroup: 'Programming',
    shortDescription:
      'Learn how a program actually runs — memory, pointers and OOP in C and C++, from first principles.',
    description: `
      <p>Learning C and C++ in Coimbatore with LeSuccess gives you the foundation every other language quietly assumes you have. When you have allocated memory by hand and watched a pointer go wrong, garbage collection, references and object lifetimes in Java or Python stop being mysterious. This course is deliberately unhurried on pointers, memory and the compilation model, because those are what separate people who can debug from people who can only rewrite. C++ then adds classes, inheritance, templates and the STL, so you can build real programs rather than exercises. It suits engineering students, embedded and systems aspirants, and anyone whose interviews include written code on paper.</p>
    `,
    durationValue: 120,
    roleHeading: 'What does a C/C++ Developer do?',
    roleIntro:
      'C and C++ developers work where performance and control matter — embedded devices, systems software, game engines and anything with a hard resource budget. The job is knowing exactly what the machine is doing with your code.',
    roleColumns: [
      {
        label: 'Build and Optimise',
        description:
          'Write programs that manage their own memory, run fast under tight constraints, and keep working when the easy abstractions are not available.',
      },
    ],
    roleBullets: [
      'Write and structure programs in C and C++ from an empty file.',
      'Manage memory, pointers and object lifetimes without leaking or crashing.',
      'Debug with a debugger and reason about performance rather than guessing.',
    ],
    modules: [
      { title: 'C Programming Basics', description: 'Compilation, data types, operators, control flow and functions, run and inspected rather than just read.' },
      { title: 'Arrays, Strings and Functions', description: 'How arrays sit in memory, string handling in C, scope, recursion and parameter passing.' },
      { title: 'Pointers and Memory Management', description: 'Address arithmetic, malloc and free, dangling pointers and leaks — the module the rest of the course rests on.' },
      { title: 'Structures, Unions and File Handling', description: 'Composite types, reading and writing files, and modelling records without a database.' },
      { title: 'C++ and Object Oriented Basics', description: 'Classes, objects, constructors, destructors and the differences from C that actually matter.' },
      { title: 'Inheritance and Polymorphism', description: 'Base and derived classes, virtual functions, abstract classes and when inheritance is the wrong tool.' },
      { title: 'Operator Overloading and Templates', description: 'Writing generic, reusable code, and the cost of getting an interface subtly wrong.' },
      { title: 'The Standard Template Library', description: 'Vectors, maps, sets, iterators and algorithms — and choosing the right container for the job.' },
      { title: 'Exception Handling and File Streams', description: 'Errors that surface instead of silently corrupting state, plus stream-based input and output.' },
      { title: 'Debugging and Problem Solving', description: 'GDB, breakpoints, watchpoints and reading a crash, applied to real broken programs.' },
      { title: 'Mini Projects', description: 'Two console applications built end to end, reviewed for structure and memory behaviour as well as output.' },
    ],
    techStack: {
      Languages: ['C', 'C++'],
      Concepts: ['OOP', 'Memory Management', 'Pointers', 'STL'],
      Tools: ['GDB', 'Git', 'VS Code', 'Code::Blocks'],
    },
  }),

  makeCourse({
    id: 8,
    title: 'DSA with Python / Java',
    slug: 'dsa-with-python-java',
    category: 'Data Structures and Algorithms',
    categoryGroup: 'Programming',
    shortDescription:
      'The interview round that filters everyone out — arrays to dynamic programming, in Python or Java, with daily problem practice.',
    description: `
      <p>Learning Data Structures and Algorithms in Coimbatore with LeSuccess targets the one round that decides most product-company offers. Candidates rarely fail these interviews for lack of language knowledge; they fail because they have never practised recognising which structure a problem is really asking for. This course works through each structure in order, in Python or Java as you prefer, always with the time and space cost stated out loud. Every topic ends in timed problem sets on LeetCode and HackerRank, so pattern recognition is built by repetition rather than by reading. It suits final-year students, working developers preparing to switch, and anyone who has been rejected at the coding round before.</p>
    `,
    durationValue: 120,
    roleHeading: 'What does a strong problem solver do?',
    roleIntro:
      'Interviewers are not testing whether you have memorised a hundred solutions. They are watching whether you can take an unfamiliar problem, recognise the structure underneath it, and reason about the cost of your approach before you write it.',
    roleColumns: [
      {
        label: 'Structures',
        description:
          'Know arrays, linked lists, stacks, queues, trees, graphs and hash maps well enough to pick the right one under time pressure.',
      },
      {
        label: 'Problem Solving',
        description:
          'Apply recursion, sorting, searching, greedy and dynamic programming patterns, and state the time and space complexity of what you wrote.',
      },
    ],
    roleBullets: [
      'Recognise which data structure a problem is really about.',
      'Write a correct solution, then improve its time and space complexity.',
      'Explain your approach out loud while writing it — what the interview is grading.',
    ],
    modules: [
      { title: 'Complexity Analysis and Recursion', description: 'Big-O in practice, recursion, call stacks and base cases — the vocabulary the whole course uses.' },
      { title: 'Arrays and Strings', description: 'Two pointers, sliding window, prefix sums and the in-place tricks these problems keep asking for.' },
      { title: 'Linked Lists', description: 'Singly, doubly and circular lists, reversal, cycle detection and merging, written without leaking nodes.' },
      { title: 'Stacks and Queues', description: 'Monotonic stacks, deques and the parsing and next-greater-element problems built on them.' },
      { title: 'Hashing and Hash Maps', description: 'Hash tables, collisions, and the counting and lookup problems where a map turns O(n²) into O(n).' },
      { title: 'Trees and Binary Search Trees', description: 'Traversals, height, balanced trees and the recursive patterns most tree questions reduce to.' },
      { title: 'Heaps and Priority Queues', description: 'Top-K, running median and scheduling problems, and when a heap beats a sort.' },
      { title: 'Graphs', description: 'Representations, BFS, DFS, topological sort and shortest paths, applied to grid and network problems.' },
      { title: 'Sorting and Searching', description: 'Merge sort, quick sort, binary search and the "search the answer" pattern that hides inside many hard problems.' },
      { title: 'Greedy Algorithms', description: 'Interval scheduling and selection problems, and how to tell when greedy is provably wrong.' },
      { title: 'Dynamic Programming', description: 'Memoisation, tabulation, knapsack, subsequences and grid paths, built up from recursion rather than memorised.' },
      { title: 'Mock Interviews and Contest Practice', description: 'Timed rounds on LeetCode and HackerRank with live review of how you approached, not just what you scored.' },
    ],
    techStack: {
      Languages: ['Python', 'Java'],
      'Data Structures': ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Hash Maps'],
      Algorithms: ['Sorting & Searching', 'Recursion', 'Greedy', 'Dynamic Programming'],
      'Practice Platforms': ['LeetCode', 'HackerRank'],
    },
  }),

  makeCourse({
    id: 2,
    title: 'Data Analytics',
    slug: 'data-analytics',
    category: 'Data Analytics',
    categoryGroup: 'Data',
    shortDescription:
      'Turn spreadsheets into decisions — Excel, SQL, Python and Power BI, taught on messy real datasets.',
    description: `
      <p>Learning a Data Analytics course in Coimbatore with LeSuccess prepares you for what analytics openings here actually ask for: SQL you can write without a reference, one BI tool you know deeply, and the judgement to tell someone what the numbers mean. The course moves in that order, starting in Excel, then SQL, then Python for the work spreadsheets cannot do, and finally Power BI and Tableau for reporting. You work with real retail and manufacturing datasets — missing rows, inconsistent formats and all — because tidy teaching data teaches the wrong habits. Every module ends with a question a business would actually ask, answered and presented. You finish with a dashboard portfolio and 100% placement support.</p>
    `,
    durationValue: 160,
    roleHeading: 'What does a Data Analyst do?',
    roleIntro:
      'Preparing data — cleaning, reconciling and modelling it — and explaining it to the people running the business require different skill sets. Analysts work across both, so the job is as much about being understood as about being right.',
    roleColumns: [
      {
        label: 'Analysis',
        description:
          'Pull data with SQL, clean and reshape it in Excel and Python, and check it holds together before anyone builds a decision on it.',
      },
      {
        label: 'Reporting and Storytelling',
        description:
          'Build dashboards in Power BI or Tableau and explain what changed and what to do about it, in language a non-technical team can act on.',
      },
    ],
    roleBullets: [
      'Design the data model, the queries and the reporting structure.',
      'Build dashboards and the refresh pipelines that keep them current.',
      'Explain what changed and what to do about it, to people who do not read SQL.',
    ],
    modules: [
      { title: 'Analytics Foundations', description: 'What analytics is for, the types of business questions it answers, and how a real request arrives and gets scoped.' },
      { title: 'Excel for Analysts', description: 'Lookups, pivot tables, Power Query and the modelling habits that stop a workbook becoming unmaintainable.' },
      { title: 'Statistics for Decision Making', description: 'Distributions, averages that mislead, correlation, and enough hypothesis testing to avoid confident nonsense.' },
      { title: 'SQL Fundamentals', description: 'Select, filter, group and join against a real retail schema, not a three-table sample database.' },
      { title: 'Advanced SQL', description: 'Window functions, CTEs, subqueries and query plans — where the difference between analysts shows up.' },
      { title: 'Python for Data Analysis', description: 'Pandas and NumPy for the cleaning, joining and reshaping that Excel cannot do repeatably.' },
      { title: 'Data Cleaning and Preparation', description: 'Missing values, duplicates, inconsistent formats and the documentation that makes a clean-up reproducible.' },
      { title: 'Power BI', description: 'Data modelling, relationships, DAX measures and a dashboard someone in operations would open twice.' },
      { title: 'Tableau', description: 'Building the same story in a second tool, so you are hireable by teams that standardised on either.' },
      { title: 'Data Storytelling and Visualisation', description: 'Choosing the right chart, cutting what does not earn its place, and presenting to a non-technical room.' },
      { title: 'Capstone Analytics Project', description: 'A full analysis from raw extract to dashboard and recommendation, presented and defended.' },
    ],
    techStack: {
      'Languages & Tools': ['Python', 'SQL', 'Excel'],
      Visualization: ['Power BI', 'Tableau'],
      Libraries: ['Pandas', 'NumPy'],
      'Soft Skill': ['Data Storytelling', 'Client Reporting'],
    },
  }),

  makeCourse({
    id: 9,
    title: 'Data Science',
    slug: 'data-science',
    category: 'Data Science',
    categoryGroup: 'Data',
    shortDescription:
      'Statistics, Python and machine learning — build models that hold up outside the notebook they were trained in.',
    description: `
      <p>Learning a Data Science course in Coimbatore with LeSuccess covers the full path from raw data to a model someone can rely on. Python, Pandas and SQL come first, because most of the job is preparing data rather than fitting models. Statistics is taught alongside, so you can say why a result is meaningful instead of reporting an accuracy number and hoping. Machine learning then moves from regression through classification and clustering to model evaluation, always with the question of how the model behaves on data it has never seen. The course finishes with deployment basics, so your work leaves the notebook. It suits graduates and working professionals moving into analytics-heavy roles.</p>
    `,
    durationValue: 180,
    roleHeading: 'What does a Data Scientist do?',
    roleIntro:
      'A data scientist turns a business question into something measurable, builds a model that answers it, and is honest about how much that answer can be trusted. Most of the work happens before and after the model.',
    roleColumns: [
      {
        label: 'Data and Analysis',
        description:
          'Source, clean and explore data with SQL, Pandas and visualisation until you understand what is actually in it.',
      },
      {
        label: 'Modelling and Evaluation',
        description:
          'Build and tune models with Scikit-learn, then test them properly on unseen data and explain their limits to a stakeholder.',
      },
    ],
    roleBullets: [
      'Turn a vague business question into a measurable modelling problem.',
      'Clean, explore and model the data, then validate on data the model has never seen.',
      'Explain results, and their uncertainty, to people who will act on them.',
    ],
    modules: [
      { title: 'Python for Data Science', description: 'Python fundamentals aimed squarely at data work — collections, functions, files and Jupyter.' },
      { title: 'NumPy and Pandas', description: 'Arrays, dataframes, joins, group-bys and reshaping, on datasets too large to eyeball.' },
      { title: 'SQL for Data Science', description: 'Extracting and aggregating from relational databases, including window functions and query performance.' },
      { title: 'Statistics and Probability', description: 'Distributions, sampling, confidence intervals and hypothesis testing, applied to real questions.' },
      { title: 'Exploratory Data Analysis', description: 'Matplotlib and Seaborn, outliers, correlations and the plots that change what you build next.' },
      { title: 'Data Cleaning and Feature Engineering', description: 'Missing values, encoding, scaling and features that add signal rather than noise.' },
      { title: 'Supervised Learning: Regression', description: 'Linear and regularised regression, residuals, and reading what a model is telling you.' },
      { title: 'Supervised Learning: Classification', description: 'Logistic regression, decision trees, random forests and gradient boosting on imbalanced data.' },
      { title: 'Unsupervised Learning', description: 'K-means, hierarchical clustering and dimensionality reduction, with the hard problem of validating them.' },
      { title: 'Model Evaluation and Tuning', description: 'Train/test splits, cross-validation, precision and recall, overfitting and hyperparameter search.' },
      { title: 'Model Deployment Basics', description: 'Wrapping a model in an API, versioning it, and what breaks once it meets live data.' },
      { title: 'Capstone Data Science Project', description: 'An end-to-end project from question to deployed model, reviewed and presented.' },
    ],
    techStack: {
      Languages: ['Python', 'SQL'],
      Libraries: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn'],
      Concepts: ['Statistics', 'ML Fundamentals', 'Feature Engineering'],
      Tools: ['Jupyter', 'Git'],
    },
  }),

  makeCourse({
    id: 10,
    title: 'Artificial Intelligence and Machine Learning',
    slug: 'artificial-intelligence-and-machine-learning',
    category: 'AI and Machine Learning',
    categoryGroup: 'AI & ML',
    shortDescription:
      'From classical machine learning to neural networks — build, train and evaluate models in TensorFlow and PyTorch.',
    description: `
      <p>Learning an AI and Machine Learning course in Coimbatore with LeSuccess takes you from classical models to neural networks without skipping the part in between. You start with the mathematics that matters — linear algebra, probability and gradient descent — in just enough depth to know what a model is doing when it trains. Classical machine learning comes next, because a well-tuned tree ensemble still beats a badly built neural network on most real datasets. Deep learning then covers CNNs for images, sequence models for text, and transfer learning, in both TensorFlow and PyTorch. Every module ends in a working model you evaluated honestly, and the course closes on deployment so the work is usable.</p>
    `,
    durationValue: 160,
    roleHeading: 'What does a Machine Learning Engineer do?',
    roleIntro:
      'A machine learning engineer builds systems that learn from data and keeps them working once they meet the real world. The interesting part is rarely the algorithm — it is the data, the evaluation, and everything that happens after deployment.',
    roleColumns: [
      {
        label: 'Model Building',
        description:
          'Prepare data, choose and train models from regression to neural networks, and tune them against a metric that reflects the actual goal.',
      },
      {
        label: 'Evaluation and Deployment',
        description:
          'Validate on unseen data, catch overfitting and bias, then ship the model behind an API and watch how it behaves on live traffic.',
      },
    ],
    roleBullets: [
      'Frame a problem as a learning task with a metric that means something.',
      'Train, tune and compare models instead of settling for the first that runs.',
      'Deploy models and monitor them as the data underneath them shifts.',
    ],
    modules: [
      { title: 'Python and Maths for AI', description: 'Python, NumPy, and the linear algebra, probability and calculus that training actually uses.' },
      { title: 'Data Preparation and Feature Engineering', description: 'Cleaning, encoding, scaling and splitting data without leaking the answer into training.' },
      { title: 'Supervised Learning', description: 'Regression, classification, decision trees and ensembles with Scikit-learn, on real datasets.' },
      { title: 'Unsupervised Learning', description: 'Clustering, dimensionality reduction and anomaly detection, and how to judge them without labels.' },
      { title: 'Model Evaluation and Optimisation', description: 'Cross-validation, confusion matrices, ROC curves, regularisation and hyperparameter tuning.' },
      { title: 'Neural Network Fundamentals', description: 'Perceptrons, activation functions, backpropagation and gradient descent, built from scratch once before using a framework.' },
      { title: 'Deep Learning with TensorFlow and Keras', description: 'Building, training and checkpointing networks, and reading a training curve that has gone wrong.' },
      { title: 'PyTorch Essentials', description: 'Tensors, autograd and custom training loops — the framework most research code you will read uses.' },
      { title: 'Computer Vision with CNNs', description: 'Convolutions, pooling, augmentation and transfer learning on an image classification project.' },
      { title: 'Natural Language Processing', description: 'Text preprocessing, embeddings, sequence models and an introduction to transformer architectures.' },
      { title: 'Model Deployment and MLOps Basics', description: 'Serving a model behind an API, versioning, monitoring and retraining as data drifts.' },
      { title: 'Capstone AI Project', description: 'A complete project from dataset to deployed model, defended in a technical review.' },
    ],
    techStack: {
      Languages: ['Python'],
      Libraries: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'Pandas'],
      Concepts: ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'Computer Vision', 'NLP'],
      Tools: ['Jupyter', 'Google Colab', 'Git'],
    },
  }),

  makeCourse({
    id: 11,
    title: 'AWS - The Ultimate',
    slug: 'aws-the-ultimate',
    category: 'AWS Cloud',
    categoryGroup: 'Cloud',
    // Everything is done in the console and CLI against a real account, which
    // works as well remotely as in a classroom.
    mode: 'ONLINE',
    shortDescription:
      'Core AWS services, architecture and cost control — built around the Cloud Practitioner and Solutions Architect exams.',
    description: `
      <p>Learning AWS in Coimbatore with LeSuccess gives you the cloud foundation nearly every technical role now assumes. The course is hands-on from the first session: you work in a real AWS account, launch EC2 instances, break things and fix them, rather than watching architecture diagrams. Compute, storage, networking, identity and databases are covered in the order they depend on each other, so VPC and IAM are understood before anything is deployed into them. Billing and cost management get proper attention, because an engineer who can size and price an environment is worth considerably more than one who cannot. The syllabus maps to the Cloud Practitioner and Solutions Architect Associate certifications.</p>
    `,
    durationValue: 90,
    roleHeading: 'What does a Cloud Engineer do?',
    roleIntro:
      'A cloud engineer decides what infrastructure an application needs, builds it so it survives a failure, and keeps the bill defensible. On AWS that means knowing the services well enough to choose between them for a specific job.',
    roleColumns: [
      {
        label: 'Design and Operate',
        description:
          'Architect and run environments on AWS — compute, storage, networking, identity and backups — with an eye on availability, security and monthly cost.',
      },
    ],
    roleBullets: [
      'Design an environment on AWS and justify each service you picked.',
      'Secure it with IAM, VPC and least-privilege access rather than open ports.',
      'Track and control what it costs before finance does it for you.',
    ],
    modules: [
      { title: 'Cloud Computing Foundations', description: 'Service and deployment models, the AWS global infrastructure, and the shared responsibility model.' },
      { title: 'IAM and Account Security', description: 'Users, groups, roles, policies and MFA — least privilege applied to your own account from day one.' },
      { title: 'EC2 and Compute', description: 'Instance types, AMIs, key pairs, security groups and pricing models, launched and configured by hand.' },
      { title: 'S3 and Storage', description: 'Buckets, storage classes, lifecycle rules, versioning and static site hosting.' },
      { title: 'VPC and Networking', description: 'Subnets, route tables, internet and NAT gateways, and why a resource cannot reach the internet.' },
      { title: 'RDS and Databases', description: 'Managed relational databases, backups, multi-AZ, read replicas and when DynamoDB fits better.' },
      { title: 'Elastic Load Balancing and Auto Scaling', description: 'Distributing traffic and scaling on demand, tested by generating load against your own stack.' },
      { title: 'Monitoring with CloudWatch', description: 'Metrics, logs, alarms and dashboards, and catching a problem before a user reports it.' },
      { title: 'Billing and Cost Management', description: 'Budgets, cost explorer, right-sizing and the handful of services that quietly generate large bills.' },
      { title: 'Well-Architected Design Practice', description: 'Reliability, security, performance and cost trade-offs, worked through on real architecture scenarios.' },
      { title: 'Certification Preparation', description: 'Cloud Practitioner and Solutions Architect Associate exam patterns, timed practice and review.' },
    ],
    techStack: {
      'Core Services': ['EC2', 'S3', 'IAM', 'VPC', 'RDS', 'CloudWatch'],
      Concepts: ['Cloud Architecture', 'High Availability', 'Billing & Cost Management'],
      Tools: ['AWS Console', 'AWS CLI'],
      'Certification Prep': ['Cloud Practitioner', 'Solutions Architect'],
    },
  }),

  makeCourse({
    id: 12,
    title: 'AWS & DevOps',
    slug: 'aws-and-devops',
    category: 'AWS and DevOps',
    categoryGroup: 'Cloud',
    shortDescription:
      'Docker, Kubernetes, Jenkins and Terraform on AWS — build the pipeline that takes code to production.',
    description: `
      <p>Learning AWS and DevOps in Coimbatore with LeSuccess is for people who want to own what happens after the code is written. You start with Linux and scripting, because every tool in this space is a layer on top of a shell, then move through Git branching strategies into containers with Docker and orchestration with Kubernetes. Jenkins and GitHub Actions turn that into a pipeline where a merge builds, tests and deploys itself, and Terraform makes the infrastructure underneath it reproducible instead of hand-built. Monitoring and logging close the loop so failures are visible rather than reported by customers. It suits developers, support engineers and system administrators moving into DevOps roles.</p>
    `,
    durationValue: 160,
    roleHeading: 'What does a DevOps Engineer do?',
    roleIntro:
      'A DevOps engineer builds the road from a laptop to production, and keeps it safe to drive on. The work is automation, reproducibility and visibility — so that shipping is routine rather than an event.',
    roleColumns: [
      {
        label: 'Build and Automate',
        description:
          'Containerise applications, define infrastructure as code with Terraform, and wire CI/CD pipelines that build, test and deploy without manual steps.',
      },
      {
        label: 'Run and Observe',
        description:
          'Operate workloads on AWS and Kubernetes, monitor them, respond to incidents, and make the next failure less expensive than the last.',
      },
    ],
    roleBullets: [
      'Automate the path from commit to production so releases stop being events.',
      'Define infrastructure as code that can be rebuilt from an empty account.',
      'Monitor what is running and respond to failures with evidence, not guesses.',
    ],
    modules: [
      { title: 'Linux and Shell Scripting', description: 'The filesystem, permissions, processes, networking commands and scripts that automate the boring parts.' },
      { title: 'Git and Branching Strategies', description: 'Branching, merging, pull requests, conflicts and a workflow a team can actually follow.' },
      { title: 'AWS Core Services for DevOps', description: 'EC2, S3, IAM, VPC and Lambda — the services your pipelines and workloads sit on.' },
      { title: 'Docker and Containers', description: 'Images, layers, volumes, networks and Compose, containerising a real application from its source.' },
      { title: 'Kubernetes Fundamentals', description: 'Pods, deployments, services, config maps and secrets, deployed to a working cluster.' },
      { title: 'Kubernetes in Production', description: 'Scaling, rolling updates, health probes, resource limits and debugging a pod that will not start.' },
      { title: 'CI/CD with Jenkins', description: 'Pipelines as code, build agents, artefacts and a pipeline that fails loudly and early.' },
      { title: 'CI/CD with GitHub Actions', description: 'Workflows, secrets, environments and deployment gates for teams already living in GitHub.' },
      { title: 'Infrastructure as Code with Terraform', description: 'Providers, state, modules and plan/apply discipline, building an environment from nothing.' },
      { title: 'Configuration Management with Ansible', description: 'Playbooks, inventories and idempotent changes across a fleet of servers.' },
      { title: 'Monitoring, Logging and Alerting', description: 'CloudWatch, Prometheus and Grafana, plus alerts that mean something at two in the morning.' },
      { title: 'Capstone: End-to-End Pipeline', description: 'One application taken from repository to a monitored, auto-deployed production environment.' },
    ],
    techStack: {
      'AWS Services': ['EC2', 'S3', 'IAM', 'Lambda', 'CloudWatch'],
      'DevOps Tools': ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible'],
      Practices: ['CI/CD', 'Infrastructure as Code', 'Monitoring'],
      'OS & Scripting': ['Linux', 'Bash', 'Git'],
    },
  }),

  makeCourse({
    id: 13,
    title: 'Data Engineering',
    slug: 'data-engineering',
    category: 'Data Engineering',
    categoryGroup: 'Data',
    shortDescription:
      'Build the pipelines analysts depend on — Python, SQL, Spark and Airflow into a cloud warehouse.',
    description: `
      <p>Learning Data Engineering in Coimbatore with LeSuccess puts you on the side of the data team that everything else depends on. Analysts and data scientists can only work with what arrives, and getting it to arrive reliably, on schedule and in a usable shape is its own discipline. The course covers advanced SQL and Python first, then batch processing with Spark, orchestration with Airflow, and warehousing on Redshift or Snowflake. Data modelling is treated seriously — star schemas, slowly changing dimensions, and why a badly modelled warehouse costs more every month it survives. You finish having built a pipeline that runs on a schedule, handles bad input and tells you when it fails.</p>
    `,
    durationValue: 160,
    roleHeading: 'What does a Data Engineer do?',
    roleIntro:
      'A data engineer moves data from where it is produced to where it can be used, reliably and repeatedly. When the job is done well nobody notices; when it is not, every dashboard downstream is quietly wrong.',
    roleColumns: [
      {
        label: 'Pipelines',
        description:
          'Build ingestion and transformation jobs in Python, SQL and Spark, scheduled with Airflow and able to survive bad input and reruns.',
      },
      {
        label: 'Storage and Modelling',
        description:
          'Design warehouse schemas on Redshift or Snowflake so queries are fast, costs are predictable and history is not silently overwritten.',
      },
    ],
    roleBullets: [
      'Build ETL and ELT pipelines that can be rerun without corrupting anything.',
      'Model a warehouse so analysts can answer questions without asking you first.',
      'Monitor data quality and freshness, and alert when either slips.',
    ],
    modules: [
      { title: 'Data Engineering Foundations', description: 'Where data engineering sits between sources and analysts, and the shape of a modern data platform.' },
      { title: 'Advanced SQL', description: 'Window functions, CTEs, query plans and the optimisation habits a warehouse bill depends on.' },
      { title: 'Python for Data Engineering', description: 'File and API ingestion, Pandas, error handling and scripts written to be rerun safely.' },
      { title: 'Databases and Data Modelling', description: 'Normalisation, star and snowflake schemas, fact and dimension tables, slowly changing dimensions.' },
      { title: 'ETL and ELT Pipeline Design', description: 'Extract, transform and load patterns, idempotency, incremental loads and handling late data.' },
      { title: 'Apache Spark', description: 'RDDs, DataFrames, partitions, joins and shuffles, processing datasets too large for one machine.' },
      { title: 'Hadoop and Distributed Storage', description: 'HDFS, MapReduce concepts and where the older ecosystem still turns up in enterprise stacks.' },
      { title: 'Workflow Orchestration with Airflow', description: 'DAGs, dependencies, retries, backfills and scheduling work that must not silently skip.' },
      { title: 'Cloud Data Platforms', description: 'S3 as a data lake, Redshift and Snowflake as warehouses, and moving data between them.' },
      { title: 'Streaming Data Basics', description: 'Kafka concepts, topics and consumers, and when a stream beats a nightly batch.' },
      { title: 'Data Quality and Governance', description: 'Validation, tests, lineage, access control and being able to prove a number is right.' },
      { title: 'Capstone Pipeline Project', description: 'A scheduled, monitored pipeline from raw source to warehouse tables an analyst can query.' },
    ],
    techStack: {
      Languages: ['Python', 'SQL'],
      'Big Data Tools': ['Spark', 'Hadoop', 'Airflow', 'Kafka'],
      'Cloud & Storage': ['AWS S3', 'Redshift', 'Snowflake'],
      Concepts: ['ETL Pipelines', 'Data Warehousing', 'Data Modelling', 'Data Quality'],
    },
  }),

  makeCourse({
    id: 14,
    title: 'Digital Marketing',
    slug: 'digital-marketing',
    category: 'Digital Marketing',
    categoryGroup: 'Marketing',
    shortDescription:
      'SEO, paid ads, content and analytics — run campaigns on real budgets and report on what they returned.',
    description: `
      <p>Learning a Digital Marketing course in Coimbatore with LeSuccess is practical from the first week: you run campaigns, spend a real budget and report on what came back. SEO is taught as a discipline rather than a checklist, starting from how search engines read a page and ending with technical audits you can run yourself. Paid search and social advertising follow, with the arithmetic of cost per click, conversion rate and return on ad spend done properly rather than waved at. Analytics ties it together — if a campaign cannot be measured, it cannot be defended in a client meeting. The course suits graduates, business owners and anyone moving from offline sales into marketing roles.</p>
    `,
    durationValue: 160,
    roleHeading: 'What does a Digital Marketer do?',
    roleIntro:
      'A digital marketer decides where attention is worth buying and where it has to be earned, then proves which of the two worked. The craft is in the measurement as much as in the creative.',
    roleColumns: [
      {
        label: 'Earned and Organic',
        description:
          'Grow traffic that does not cost per click — keyword research, on-page and technical SEO, content strategy and social presence.',
      },
      {
        label: 'Paid and Performance',
        description:
          'Plan, launch and optimise Google and Meta campaigns against a budget, and report the return in numbers a client will act on.',
      },
    ],
    roleBullets: [
      'Plan campaigns around a measurable goal instead of a posting schedule.',
      'Run paid and organic channels together and know which one earned the lead.',
      'Report performance honestly, including what did not work and why.',
    ],
    modules: [
      { title: 'Digital Marketing Foundations', description: 'The channel landscape, the customer journey, and how a campaign brief becomes a plan.' },
      { title: 'Website and Landing Page Basics', description: 'WordPress, page structure, speed, mobile behaviour and the elements that decide whether a visitor converts.' },
      { title: 'SEO Fundamentals and Keyword Research', description: 'How search works, search intent, keyword research and mapping keywords to pages worth ranking.' },
      { title: 'On-Page and Technical SEO', description: 'Titles, structure, internal links, schema, site speed and crawl issues found in a real audit.' },
      { title: 'Off-Page SEO and Local Search', description: 'Link building that is not spam, plus Google Business Profile and local ranking factors.' },
      { title: 'Content Strategy and Copywriting', description: 'Planning a content calendar and writing pages that rank and still read like a person wrote them.' },
      { title: 'Google Ads and Paid Search', description: 'Campaign structure, match types, quality score, bidding and cost per acquisition, on a live account.' },
      { title: 'Meta and Social Media Advertising', description: 'Audiences, creative testing, the pixel and retargeting across Facebook and Instagram.' },
      { title: 'Social Media Marketing', description: 'Organic strategy per platform, community management and what content actually earns reach.' },
      { title: 'Email Marketing and Automation', description: 'List building, segmentation, sequences and the deliverability rules that decide if any of it arrives.' },
      { title: 'Analytics and Reporting', description: 'Google Analytics, Search Console, attribution, and a client report that survives being questioned.' },
      { title: 'Campaign Optimisation and Capstone', description: 'A live campaign planned, run, optimised and presented with its numbers.' },
    ],
    techStack: {
      'SEO & Content': ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Content Strategy'],
      'Paid Ads': ['Google Ads', 'Meta Ads', 'Retargeting'],
      Analytics: ['Google Analytics', 'Search Console', 'Google Tag Manager'],
      'Soft Skill': ['Communication', 'Client Reporting'],
    },
  }),

  makeCourse({
    id: 15,
    title: 'Gen AI',
    slug: 'gen-ai',
    category: 'Generative AI',
    categoryGroup: 'AI & ML',
    mode: 'ONLINE',
    shortDescription:
      'Work with large language models properly — prompting, APIs, RAG and the limits worth knowing before you ship.',
    description: `
      <p>Learning a Generative AI course in Coimbatore with LeSuccess is a short, focused course for people who already work with software and want to use language models seriously rather than casually. It starts with how these models actually work — tokens, context windows, temperature — because most prompting advice makes no sense until that is clear. You then build against the OpenAI API and open models from Hugging Face, add retrieval so the model answers from your own documents, and learn where fine-tuning is worth the effort and where it is not. Evaluation, cost and hallucination handling are treated as engineering problems, since those are what decide whether a prototype survives contact with users.</p>
    `,
    durationValue: 60,
    roleHeading: 'What does a Generative AI Developer do?',
    roleIntro:
      'A generative AI developer builds features on top of models they did not train, and is responsible for making the output reliable enough to put in front of a user. That is a design and evaluation job as much as a coding one.',
    roleColumns: [
      {
        label: 'Build with Models',
        description:
          'Design prompts, call model APIs from application code, ground answers in your own data with retrieval, and keep an eye on latency, cost and failure modes.',
      },
    ],
    roleBullets: [
      'Turn a vague "use AI for this" request into a specific, testable feature.',
      'Ground model output in real data instead of hoping the model knows.',
      'Measure quality and cost before shipping, not after a complaint.',
    ],
    modules: [
      { title: 'How Language Models Work', description: 'Tokens, embeddings, context windows, temperature and why the same prompt gives different answers.' },
      { title: 'Prompt Engineering', description: 'Instructions, examples, structure and iteration — building prompts that hold up on inputs you did not anticipate.' },
      { title: 'Working with the OpenAI API', description: 'Requests, streaming, structured output, function and tool calling from application code.' },
      { title: 'Open Models and Hugging Face', description: 'Finding, running and comparing open models, and the trade-offs against hosted APIs.' },
      { title: 'Embeddings and Vector Search', description: 'Chunking documents, generating embeddings, and retrieving the right context for a question.' },
      { title: 'Retrieval Augmented Generation', description: 'Building a RAG application over your own documents, with citations and honest "I do not know" behaviour.' },
      { title: 'Fine-Tuning Basics', description: 'When fine-tuning beats prompting and retrieval, dataset preparation, and what it costs to maintain.' },
      { title: 'Evaluation, Safety and Cost', description: 'Testing output quality, catching hallucinations, guarding against prompt injection and controlling spend.' },
      { title: 'Capstone Gen AI Project', description: 'A working application built on a model, evaluated against real examples and demonstrated.' },
    ],
    techStack: {
      Concepts: ['LLM Fundamentals', 'Prompt Engineering', 'Embeddings', 'Evaluation'],
      Tools: ['OpenAI API', 'Hugging Face', 'Python'],
      Applications: ['RAG', 'Vector Databases', 'Fine-tuning Basics'],
    },
  }),

  makeCourse({
    id: 16,
    title: 'Agentic AI',
    slug: 'agentic-ai',
    category: 'Agentic AI',
    categoryGroup: 'AI & ML',
    mode: 'ONLINE',
    shortDescription:
      'Build AI agents that plan, call tools and finish multi-step work — with the guardrails that keep them usable.',
    description: `
      <p>Learning Agentic AI in Coimbatore with LeSuccess picks up where prompting stops: building systems that decide what to do next, call tools, and carry a task across many steps. You start from the architectures — a model in a loop with tools, memory and a stopping condition — and build one from scratch before touching a framework, so the frameworks stop being magic. LangChain and LangGraph then handle the plumbing while you concentrate on tool design, state and error recovery, which is where agents actually fail. Multi-agent workflows, human-in-the-loop checkpoints, cost control and evaluation round it out. It suits developers who have already built something with an LLM and hit the limits of a single call.</p>
    `,
    durationValue: 60,
    roleHeading: 'What does an AI Agent Developer do?',
    roleIntro:
      'An agent developer builds software that decides its own next step, which makes reliability the whole problem. The work is designing the tools, the state and the boundaries within which that decision is safe to make.',
    roleColumns: [
      {
        label: 'Design the Agent',
        description:
          'Choose an architecture, define the tools it can call, decide what it remembers, and set the conditions under which it stops or asks a human.',
      },
      {
        label: 'Make It Reliable',
        description:
          'Handle failed tool calls and loops, trace every step, evaluate against real tasks, and keep both cost and blast radius under control.',
      },
    ],
    roleBullets: [
      'Break a multi-step task into tools an agent can actually call.',
      'Design memory, state and stopping conditions so the agent does not wander.',
      'Trace, evaluate and cost every run before letting it near real work.',
    ],
    modules: [
      { title: 'From Prompts to Agents', description: 'What makes a system agentic, where a single model call stops being enough, and when not to use an agent.' },
      { title: 'Agent Architectures', description: 'The reason-act loop, planning, reflection, and building one from scratch in plain Python.' },
      { title: 'Tool Use and Function Calling', description: 'Designing tools an agent can use correctly, schemas, validation and handling a tool that fails.' },
      { title: 'Memory and State', description: 'Short and long-term memory, context management, and keeping state across a long-running task.' },
      { title: 'LangChain Essentials', description: 'Chains, tools, agents and the abstractions worth using once you know what they replace.' },
      { title: 'Orchestration with LangGraph', description: 'Graph-based control flow, checkpoints, branching and human-in-the-loop approval steps.' },
      { title: 'Multi-Agent Workflows', description: 'Specialised agents, delegation and message passing, and the coordination costs that come with them.' },
      { title: 'Observability, Evaluation and Guardrails', description: 'Tracing runs, evaluating on real tasks, limiting scope, and controlling cost and runaway loops.' },
      { title: 'Capstone Agent Project', description: 'An agent that completes a genuine multi-step task, traced, evaluated and demonstrated end to end.' },
    ],
    techStack: {
      Concepts: ['Agent Architectures', 'Tool Use', 'Planning', 'Memory & State'],
      Frameworks: ['LangChain', 'LangGraph', 'Python'],
      Applications: ['Multi-agent Workflows', 'Autonomous Task Execution', 'Human-in-the-loop'],
    },
  }),

  makeCourse({
    id: 17,
    title: 'ServiceNow',
    slug: 'servicenow',
    category: 'ServiceNow',
    categoryGroup: 'Cloud',
    mode: 'ONLINE',
    shortDescription:
      'Configure and script the ITSM platform large enterprises run their service desks on.',
    description: `
      <p>Learning ServiceNow in Coimbatore with LeSuccess opens a niche that pays well precisely because few people train for it. Large enterprises run their incident, problem and change processes on this platform, and they hire administrators and developers who can configure it rather than merely use it. The course works through the ITSM modules in the order a real implementation follows, then moves into the platform itself — tables, forms, workflows, business rules and client scripts. The JavaScript needed is taught here, so a non-developer can follow. You finish able to build a working service catalogue item with an approval workflow behind it, which is the task most interviews for these roles are built around.</p>
    `,
    durationValue: 80,
    roleHeading: 'What does a ServiceNow Administrator do?',
    roleIntro:
      'A ServiceNow administrator turns how a company says it handles requests into how the platform actually handles them. It is part process design, part configuration, and part scripting when configuration runs out.',
    roleColumns: [
      {
        label: 'Configure and Automate',
        description:
          'Set up ITSM modules, users and roles, build catalogue items and workflows, and script business rules where the out-of-the-box behaviour is not enough.',
      },
    ],
    roleBullets: [
      'Map a real service process onto incident, problem and change records.',
      'Build catalogue items, workflows and approvals people will use daily.',
      'Script and debug on the platform when configuration alone runs out.',
    ],
    modules: [
      { title: 'ServiceNow Platform Overview', description: 'Instances, the interface, applications and how the platform is structured underneath.' },
      { title: 'Users, Groups and Roles', description: 'Access control, assignment groups and the permission model everything else depends on.' },
      { title: 'Incident and Problem Management', description: 'Record lifecycles, priority and escalation, configured against a realistic service desk process.' },
      { title: 'Change and Release Management', description: 'Change types, CAB approval flows and risk assessment as the platform models them.' },
      { title: 'Tables, Forms and Lists', description: 'Data model, field types, form layouts, UI policies and making a form guide the person filling it in.' },
      { title: 'Service Catalogue and Request Fulfilment', description: 'Catalogue items, variables, order guides and the fulfilment tasks behind a request.' },
      { title: 'Workflow and Flow Designer', description: 'Approvals, conditions, notifications and automating a multi-step process end to end.' },
      { title: 'Scripting: Business Rules and Client Scripts', description: 'Server and client scripting in JavaScript, GlideRecord basics, and debugging on the platform.' },
      { title: 'Reporting, Dashboards and Service Level Agreements', description: 'Reports, performance analytics basics and SLAs that reflect what was actually promised.' },
      { title: 'Integrations and Import Sets', description: 'REST integrations, import sets and transform maps for getting data in and out.' },
      { title: 'Capstone Configuration Project', description: 'A complete catalogue item with workflow, approvals, notifications and reporting, built and demonstrated.' },
    ],
    techStack: {
      Platform: ['ITSM Modules', 'Service Catalogue', 'Workflow Configuration', 'Flow Designer'],
      Scripting: ['Business Rules', 'Client Scripts', 'JavaScript', 'GlideRecord'],
      Concepts: ['Incident Management', 'Problem Management', 'Change Management', 'SLAs'],
    },
  }),

  makeCourse({
    id: 18,
    title: 'Cybersecurity',
    slug: 'cybersecurity',
    category: 'Cybersecurity',
    categoryGroup: 'Security',
    shortDescription:
      'Networking, Linux and the security tools behind both defence and ethical hacking — taught in a lab, legally.',
    description: `
      <p>Learning Cybersecurity in Coimbatore with LeSuccess starts where security actually starts: networking and Linux. Tools are useless if you cannot read a packet capture or navigate a server, so TCP/IP and the command line come before Wireshark or Nmap. From there the course covers both sides — hardening, monitoring and incident response on the defensive side, and reconnaissance, scanning and web application testing on the offensive side — because each side is much better understood by someone who has done the other. All practical work runs inside an isolated lab against systems set up for the purpose, and the legal and ethical boundaries are made explicit rather than assumed. Compliance basics and certification pathways close the course.</p>
    `,
    durationValue: 80,
    roleHeading: 'What does a Cybersecurity Analyst do?',
    roleIntro:
      'Security work splits into keeping attackers out and thinking like one to find the gaps first. Analysts move between the two, which is why both belong in the same syllabus.',
    roleColumns: [
      {
        label: 'Defence',
        description:
          'Harden systems, monitor traffic and logs, investigate alerts, and respond to incidents in a way that survives an audit afterwards.',
      },
      {
        label: 'Offence',
        description:
          'Run authorised reconnaissance, scanning and web application testing to find weaknesses before someone else does, and write up what you found.',
      },
    ],
    roleBullets: [
      'Read network traffic and logs well enough to tell normal from suspicious.',
      'Test systems for weaknesses within an authorised, documented scope.',
      'Respond to an incident and report it clearly to technical and non-technical readers.',
    ],
    modules: [
      { title: 'Security Fundamentals', description: 'Confidentiality, integrity and availability, threat actors, risk, and the legal and ethical boundaries of this work.' },
      { title: 'Networking and TCP/IP', description: 'The OSI model, addressing, routing, ports and protocols, read from real packet captures.' },
      { title: 'Linux Fundamentals for Security', description: 'The filesystem, permissions, users, processes, logs and the shell skills every tool assumes.' },
      { title: 'Cryptography Basics', description: 'Hashing, symmetric and asymmetric encryption, TLS and certificates, and how they are misused in practice.' },
      { title: 'System and Network Hardening', description: 'Patching, configuration baselines, firewalls, access control and reducing what an attacker can reach.' },
      { title: 'Traffic Analysis with Wireshark', description: 'Capturing and filtering traffic, following streams, and spotting what does not belong.' },
      { title: 'Reconnaissance and Scanning', description: 'Nmap, service enumeration and vulnerability scanning inside an authorised lab scope.' },
      { title: 'Web Application Security', description: 'The OWASP Top 10, tested hands-on with Burp Suite against deliberately vulnerable applications.' },
      { title: 'Ethical Hacking in the Lab', description: 'Kali Linux, exploitation of known-vulnerable targets, and documenting every step you took.' },
      { title: 'Threat Analysis and Incident Response', description: 'Log analysis, SIEM concepts, triage, containment and the report that follows an incident.' },
      { title: 'Compliance and Career Pathways', description: 'ISO 27001 and data protection basics, plus how certification tracks map to security roles.' },
    ],
    techStack: {
      'Networking & OS': ['TCP/IP', 'Linux Fundamentals', 'Firewalls'],
      'Security Tools': ['Wireshark', 'Nmap', 'Kali Linux', 'Burp Suite', 'Metasploit'],
      Concepts: ['Threat Analysis', 'Ethical Hacking Basics', 'Incident Response', 'Compliance'],
    },
  }),

  makeCourse({
    id: 19,
    title: 'Tally',
    slug: 'tally',
    category: 'Tally and Accounting',
    categoryGroup: 'Finance',
    // Almost every hiring firm here trains and tests on a desk machine, and the
    // practice sets are worked through together.
    mode: 'OFFLINE',
    shortDescription:
      'Tally Prime end to end — ledgers, vouchers, GST, TDS, payroll and the reports an auditor asks for.',
    description: `
      <p>Learning Tally in Coimbatore with LeSuccess is the most direct route from a commerce degree to a job in accounts, because nearly every small and mid-sized business in the region runs its books on it. The course teaches accounting logic alongside the software, so you understand why an entry goes where it goes rather than memorising keystrokes. Tally Prime is covered end to end: company setup, ledgers, vouchers, inventory, GST, TDS and payroll. GST compliance gets particular attention, since return filing is where most day-to-day mistakes are made and where employers most want confidence. You practise on real business scenarios and finish able to produce and explain a balance sheet, a profit and loss statement and a bank reconciliation.</p>
    `,
    durationValue: 90,
    roleHeading: 'What does an Accounts Executive do?',
    roleIntro:
      'An accounts executive keeps the books of a business accurate and its filings on time. The software is only half of it — the other half is knowing which entry is correct and being able to show why when someone questions it.',
    roleColumns: [
      {
        label: 'Books and Compliance',
        description:
          'Record daily transactions in Tally, reconcile bank statements, manage GST and TDS filings, run payroll, and produce the statements management and auditors ask for.',
      },
    ],
    roleBullets: [
      'Record and classify daily transactions correctly, not just quickly.',
      'Keep GST, TDS and payroll filings accurate and on time.',
      'Produce and explain a balance sheet, P&L and bank reconciliation.',
    ],
    modules: [
      { title: 'Accounting Fundamentals', description: 'Double entry, debit and credit rules, journals and ledgers — the logic the software encodes.' },
      { title: 'Getting Started with Tally Prime', description: 'Company creation, configuration, masters, security and the navigation that makes daily work fast.' },
      { title: 'Ledgers and Voucher Entry', description: 'Groups, ledgers and every voucher type, entered against realistic day-to-day business transactions.' },
      { title: 'Inventory Management', description: 'Stock groups, units, godowns, batches and the reports that keep purchase and sales honest.' },
      { title: 'GST Concepts and Setup', description: 'Registration, tax structure, HSN codes and configuring GST correctly for a company.' },
      { title: 'GST Transactions and Returns', description: 'GST-compliant invoicing, input credit, reconciliation and preparing returns for filing.' },
      { title: 'TDS and Other Statutory Compliance', description: 'TDS deduction, payment and reporting, and where these entries surface in the accounts.' },
      { title: 'Payroll in Tally', description: 'Employee masters, salary structures, attendance, PF and ESI, and the payslip run.' },
      { title: 'Banking and Reconciliation', description: 'Payments, receipts, cheque management and reconciling a statement that does not agree.' },
      { title: 'Financial Reports and Analysis', description: 'Balance sheet, profit and loss, cash flow and ratio reports, read as well as generated.' },
      { title: 'Practice Sets and Audit Readiness', description: 'A full month of a fictional business booked, closed and checked the way an auditor would.' },
    ],
    techStack: {
      'Core Tally': ['Tally Prime', 'Ledger & Voucher Entry', 'Inventory Management'],
      Compliance: ['GST', 'TDS', 'Payroll Basics'],
      Reporting: ['Balance Sheet', 'Profit & Loss', 'Bank Reconciliation'],
      'Soft Skill': ['Accuracy & Documentation'],
    },
  }),

  makeCourse({
    id: 20,
    title: 'Placement Readiness Program',
    slug: 'placement-readiness-program',
    category: 'Placement Readiness',
    categoryGroup: 'Career',
    // Group discussions and panel mock interviews are the point, and they do
    // not work as well over a call.
    mode: 'OFFLINE',
    shortDescription:
      'Aptitude, communication, resume and mock interviews — the preparation that turns technical skill into an offer.',
    description: `
      <p>The Placement Readiness Program at LeSuccess exists because technically capable candidates lose offers for reasons that have nothing to do with their code. Aptitude and reasoning rounds filter people out before anyone reads their resume, so the course drills those to a timed standard. Communication, group discussion and interview practice follow, recorded and reviewed so you can see what a panel sees rather than being told about it. Your resume and LinkedIn profile are rebuilt against real job descriptions, not templates. Mock interviews run as panels, with written feedback and a second attempt, because the point is to be past your first bad interview before it counts.</p>
    `,
    durationValue: 120,
    roleHeading: 'What does a job-ready candidate do differently?',
    roleIntro:
      'Hiring is a process with stages, and each stage rejects for its own reasons. Candidates who get offers are usually not the most talented in the room — they are the ones who prepared for the stage in front of them.',
    roleColumns: [
      {
        label: 'Get Shortlisted',
        description:
          'Clear aptitude and reasoning rounds under time pressure, and put a resume and LinkedIn profile in front of a recruiter that survives a six-second scan.',
      },
      {
        label: 'Convert the Interview',
        description:
          'Speak clearly in group discussions and panels, answer HR and technical questions with structure, and negotiate an offer without guessing.',
      },
    ],
    roleBullets: [
      'Clear aptitude and reasoning rounds inside the time limit.',
      'Present your work and yourself clearly, in writing and in a room.',
      'Walk into a panel having already sat several, with feedback acted on.',
    ],
    modules: [
      { title: 'Quantitative Aptitude', description: 'Numbers, percentages, ratios, time and work, and the shortcuts that matter when the clock is the difficulty.' },
      { title: 'Logical Reasoning', description: 'Series, puzzles, seating arrangement, syllogisms and data sufficiency, practised to a timed standard.' },
      { title: 'Verbal Ability', description: 'Grammar, vocabulary, reading comprehension and the error-spotting sections companies still use.' },
      { title: 'Data Interpretation', description: 'Tables, graphs and caselets read quickly and accurately under exam conditions.' },
      { title: 'Resume Building', description: 'One page written against real job descriptions, with projects described in terms of what you did and what it achieved.' },
      { title: 'LinkedIn and Personal Branding', description: 'A profile recruiters actually find, plus a portfolio or GitHub that supports what the resume claims.' },
      { title: 'Communication Skills', description: 'Clarity, pace, structure and listening — practised aloud, in front of the room, every session.' },
      { title: 'Group Discussion Practice', description: 'Entering a discussion, holding a position, disagreeing well, and summarising, with recorded review.' },
      { title: 'HR Interview Preparation', description: 'Common questions, structured answers, salary conversations and how to handle a gap or a low percentage honestly.' },
      { title: 'Technical Interview Preparation', description: 'Explaining your own projects, whiteboard problems and thinking out loud under observation.' },
      { title: 'Mock Interview Panels', description: 'Full panel interviews with written feedback, then a second attempt to prove the feedback landed.' },
      { title: 'Placement Drive Simulation', description: 'A complete drive run end to end — aptitude, group discussion, technical and HR rounds in one day.' },
    ],
    techStack: {
      'Aptitude & Reasoning': ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation'],
      'Profile Building': ['Resume Building', 'LinkedIn Profile', 'Portfolio Review'],
      'Interview Practice': ['Mock Interviews', 'Group Discussions', 'HR Round Preparation'],
      'Soft Skill': ['Communication', 'Presentation Skills'],
    },
  }),
]
