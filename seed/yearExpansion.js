/**
 * ELIMUmaterial — Year 1.1 → 4.2 curriculum expansion (ADDITIVE MODULE).
 *
 * Why this file exists
 * --------------------
 * The master catalog (catalog.js) ships every course with its FOUNDATION
 * (Year 1) units only. Students asked for full 4-year coverage — notes and
 * past papers from 1.1 right through to 4.2. Rather than rewriting the
 * 100 hand-curated course definitions (which would touch existing data and
 * risk breaking favourites / payments that reference current unit codes),
 * this module APPENDS realistic Year 2–4 units to each course at load time.
 *
 * What it does
 * ------------
 *   • Adds 24 upper-year units per course (Year 2: 8, Year 3: 8, Year 4: 8)
 *     → every course ends up covering 1.1–4.2 (≈4 units per semester).
 *   • Derives the Year-2/3/4 titles from each course's REAL Year-1 foundation
 *     units plus a researched core/discipline/spine sequence, so the
 *     progression reads like a genuine Kenyan degree programme.
 *   • Marks every unit with `year` and `sem` (1.1 = year 1 sem 1, …) so the
 *     frontend can offer a year/semester selector.
 *   • Uses UNIQUE unit codes derived from the course id (≥4-letter prefix),
 *     so no code can ever collide with the master catalog (≤3-letter codes)
 *     or the Chuka overlay (≤3-letter codes).
 *   • Idempotent: a course whose units already carry year/sem metadata is
 *     returned unchanged, so multiple consumers can safely expand.
 *
 * What it does NOT do
 * -------------------
 *   • It does not modify, rename or remove ANY existing unit, course,
 *     faculty or university.
 *   • It is a pure data transform: no payment, auth, or route logic here.
 *   • Chuka University's own overlay (chukaCatalog.js) is untouched — it
 *     already carries full 1.1–4.2 unit lists.
 */

// ---------------------------------------------------------------------------
// Discipline-specific Year 2–4 core sequences (researched against typical
// KUCCPS cluster curricula: UoN / KU / JKUAT / Moi / Egerton programme
// structures). 8 units per year: index 0-3 → semester 1, 4-7 → semester 2.
// ---------------------------------------------------------------------------
const DISCIPLINE_YEARS = {
  'med-clinical': {
    y2: ['Human Anatomy II', 'Medical Physiology II', 'Medical Biochemistry', 'Pharmacology Principles', 'Pathology I', 'Microbiology & Immunology', 'Community Health I', 'Clinical Skills I'],
    y3: ['Pathology II', 'Systemic Pharmacology', 'Internal Medicine I', 'General Surgery I', 'Obstetrics & Gynaecology I', 'Paediatrics & Child Health I', 'Epidemiology & Biostatistics', 'Clinical Skills II'],
    y4: ['Internal Medicine II', 'General Surgery II', 'Obstetrics & Gynaecology II', 'Paediatrics & Child Health II', 'Psychiatry & Mental Health', 'Community Health II', 'Forensic Medicine & Medical Ethics', 'Research Project & Clinical Clerkship']
  },
  'nursing': {
    y2: ['Pathophysiology for Nurses', 'Pharmacology in Nursing', 'Adult Health Nursing I', 'Community Health Nursing I', 'Nursing Ethics & Law', 'Health Assessment', 'Maternal Health Nursing', 'Clinical Practicum I'],
    y3: ['Adult Health Nursing II', 'Child Health Nursing', 'Mental Health & Psychiatric Nursing', 'Community Health Nursing II', 'Nursing Research Methods', 'Critical Care Nursing', 'Nursing Leadership & Management', 'Clinical Practicum II'],
    y4: ['Advanced Medical-Surgical Nursing', 'Gerontological Nursing', 'Emergency & Disaster Nursing', 'Community Midwifery', 'Nursing Informatics', 'Health Systems & Policy', 'Nursing Research Project', 'Clinical Practicum III (Internship)']
  },
  'engineering': {
    y2: ['Engineering Mathematics II', 'Engineering Materials Science', 'Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Engineering Drawing & CAD', 'Electrical Engineering Principles', 'Workshop Technology & Practice'],
    y3: ['Engineering Mathematics III', 'Design of Machine & Structural Elements', 'Control Systems Engineering', 'Engineering Economics & Management', 'Numerical Methods & Simulation', 'Professional Ethics & Law for Engineers', 'Industrial Attachment', 'Specialised Engineering Applications I'],
    y4: ['Advanced Design Project I', 'Final Year Project II (Thesis)', 'Project Planning & Management', 'Entrepreneurship for Engineers', 'Sustainable Engineering Practice', 'Specialised Engineering Applications II', 'Specialised Engineering Applications III', 'Professional Practice Seminar']
  },
  'computing': {
    y2: ['Object-Oriented Programming', 'Data Structures & Algorithms', 'Database Management Systems', 'Computer Networks', 'Operating Systems', 'Web Application Development', 'Discrete Mathematics', 'Systems Analysis & Design'],
    y3: ['Software Engineering & Design Patterns', 'Mobile Application Development', 'Computer & Information Security', 'Artificial Intelligence', 'Human-Computer Interaction', 'Distributed & Parallel Systems', 'IT Project Management', 'Industrial Attachment'],
    y4: ['Machine Learning Applications', 'Cloud Computing & Emerging Technologies', 'Final Year Project I', 'Final Year Project II', 'Professional Ethics in Computing', 'Research Methodology in Computing', 'Advanced Specialisation Project', 'Entrepreneurship & Innovation in IT']
  },
  'business': {
    y2: ['Intermediate Microeconomics', 'Financial Accounting II', 'Business Law', 'Operations & Supply Chain Management', 'Organisational Behaviour', 'Quantitative Methods for Business', 'Human Resource Development', 'Business Communication & Report Writing'],
    y3: ['Strategic Management', 'Financial Management', 'Marketing Research', 'Entrepreneurship & Small Business Management', 'International Business', 'Management Information Systems', 'Business Ethics & Corporate Governance', 'Industrial Attachment'],
    y4: ['Corporate Strategy & Policy', 'Project Planning & Management', 'Investment & Portfolio Analysis', 'Leadership & Change Management', 'Business Research Project', 'Taxation & Public Finance', 'Specialisation: Functional Practice I', 'Specialisation: Functional Practice II']
  },
  'education': {
    y2: ['Educational Psychology', 'Curriculum Development & Design', 'Teaching Methodology I (Subject 1)', 'Teaching Methodology I (Subject 2)', 'Educational Measurement & Evaluation', 'Sociology of Education', 'Instructional Media & Technology', 'Subject Content Studies II'],
    y3: ['Educational Administration & Management', 'Comparative Education', 'Teaching Methodology II (Subject 1)', 'Teaching Methodology II (Subject 2)', 'Guidance & Counselling in Schools', 'Educational Research Methods', 'Inclusive & Special Needs Practice', 'Teaching Practice'],
    y4: ['Philosophy of Education', 'Educational Policy & Planning', 'Contemporary Issues in Education', 'Subject Content Studies III', 'Educational Research Project', 'Health & Life Skills Education', 'Curriculum Specialisation Studies', 'Micro-teaching & Professional Portfolio']
  },
  'arts-soc': {
    y2: ['Intermediate Theory & Methods', 'Statistics for the Social Sciences', 'African Societies & Institutions', 'Political Economy of Kenya', 'Research Methods I', 'Gender & Society', 'Regional Studies: Africa & Beyond', 'Academic Communication & Writing'],
    y3: ['Advanced Theory', 'Research Methods II (Fieldwork)', 'Development Studies', 'Public Policy & Administration', 'Contemporary Social Issues', 'Project Planning & Management', 'Field Attachment / Practicum', 'Special Topics in the Discipline'],
    y4: ['Research Project / Dissertation I', 'Research Project / Dissertation II', 'Professional Ethics & Practice', 'Globalisation & the Contemporary World', 'Advanced Seminar I', 'Advanced Seminar II', 'Community Engagement & Outreach', 'Career & Professional Development']
  },
  'law': {
    y2: ['Constitutional Law', 'Law of Contract II', 'Law of Torts II', 'Criminal Law', 'Land Law', 'Law of Evidence', 'Jurisprudence & Legal Theory', 'Legal Research & Writing II'],
    y3: ['Commercial & Company Law', 'Administrative Law', 'Family Law', 'Labour & Industrial Relations Law', 'Public International Law', 'Civil & Criminal Procedure', 'Conveyancing & Law of Succession', 'Clinical Legal Education / Attachment'],
    y4: ['Equity & the Law of Trusts', 'Intellectual Property Law', 'Environmental & Natural Resources Law', 'Taxation Law', 'Alternative Dispute Resolution', 'Human Rights & Gender Law', 'Moot Court & Trial Advocacy', 'Legal Research Project / Dissertation']
  },
  'pure-sci': {
    y2: ['Intermediate Core Theory II', 'Analytical & Laboratory Methods II', 'Mathematical & Statistical Methods', 'Instrumentation & Measurement', 'Research Methods in Science', 'Computational Methods for Scientists', 'Field & Laboratory Practicum I', 'Specialised Topics I'],
    y3: ['Advanced Core Theory', 'Applied Laboratory Techniques', 'Data Analysis & Modelling', 'Environmental & Industrial Applications', 'Science Communication & Research Ethics', 'Industrial / Research Attachment', 'Specialised Topics II', 'Specialised Topics III'],
    y4: ['Research Project I (Proposal)', 'Research Project II (Thesis)', 'Advanced Instrumental Analysis', 'Quality Assurance & Standards', 'Science, Technology & Society', 'Entrepreneurship in Science', 'Frontiers of the Discipline', 'Seminar & Viva Voce']
  },
  'agriculture': {
    y2: ['Soil Science & Fertility Management', 'Crop Physiology & Production II', 'Animal Nutrition & Breeding', 'Agricultural Economics II', 'Farm Power & Machinery', 'Agricultural Extension & Rural Development', 'Agro-meteorology & Climate', 'Field Attachment I'],
    y3: ['Plant Protection (Pathology & Entomology)', 'Livestock Production Systems', 'Agribusiness Management', 'Irrigation & Water Management', 'Agricultural Research Methods', 'Post-Harvest Technology', 'Agroforestry & Environmental Conservation', 'Field Attachment II'],
    y4: ['Sustainable Agriculture & Food Security', 'Agricultural Policy & Law', 'Farm Business Planning & Management', 'Research Project I', 'Research Project II', 'Agricultural Value Chains & Trade', 'Agricultural Enterprise Specialisation', 'Seminar & Industry Linkages']
  },
  'built-env': {
    y2: ['Construction Technology II', 'Building Materials & Science', 'Structural Analysis', 'Surveying & Geomatics II', 'Design Studio II', 'Building Services Engineering', 'Measurement & Estimating', 'Site Practice & Safety'],
    y3: ['Design Studio III / Advanced Structures', 'Construction Management', 'Property & Land Economics', 'Building & Construction Law', 'Environmental Design & Sustainability', 'Project Cost & Financial Management', 'Professional Practice', 'Industrial Attachment'],
    y4: ['Design Studio IV / Capstone Project', 'Urban Development & Planning', 'Facilities & Asset Management', 'Real Estate Valuation & Appraisal', 'Construction Economics', 'Research Project / Thesis', 'Professional Ethics & Registration', 'Specialised Design & Technology']
  },
  'humanities-lang': {
    y2: ['Intermediate Language & Literary Studies II', 'Phonetics & Stylistics', 'African & Comparative Literature', 'Translation & Interpretation', 'Research Methods in the Humanities', 'Communication & Media Skills', 'Cultural Studies', 'Practical Language & Studio II'],
    y3: ['Advanced Language & Literary Theory', 'Discourse & Critical Analysis', 'Regional & World Literatures', 'Editing & Publishing', 'Fieldwork / Professional Attachment', 'Creative & Professional Writing', 'Genre & Specialisation Studies', 'Applied Language Studies'],
    y4: ['Research Project / Dissertation I', 'Research Project / Dissertation II', 'Advanced Translation & Criticism', 'Language Policy & Society', 'Media & Digital Humanities', 'Professional Practice & Portfolio', 'Advanced Seminar', 'Career & Enterprise Skills']
  },
  'creative-arts': {
    y2: ['Studio Practice II', 'History & Theory of the Arts II', 'Design & Performance Methods', 'Digital Media & Creative Tools', 'Research & Concept Development', 'Professional Communication for Creatives', 'Medium Specialisation Studio', 'Collaborative Project I'],
    y3: ['Studio Practice III', 'Contemporary & African Art & Performance', 'Curating & Production Management', 'Entrepreneurship in the Creative Economy', 'Critical Theory & Criticism', 'Industrial Attachment / Residency', 'Advanced Medium Studio', 'Collaborative Project II'],
    y4: ['Major Studio / Performance Project I', 'Major Studio / Performance Project II', 'Portfolio & Exhibition Practice', 'Arts Administration & Marketing', 'Intellectual Property for Creatives', 'Research Essay / Dissertation', 'Professional Practice & Networking', 'Community Arts Engagement']
  },
  'health-env': {
    y2: ['Environmental & Public Health Science II', 'Epidemiology & Biostatistics', 'Environmental Chemistry & Microbiology', 'Health Systems & Policy', 'Research Methods', 'Occupational Health & Safety', 'Community Diagnosis', 'Field Attachment I'],
    y3: ['Disease Prevention & Control', 'Environmental Impact Assessment', 'Health Promotion & Education', 'Waste & Water Management', 'Health Economics', 'Monitoring & Evaluation', 'Field Attachment II', 'Special Topics in Environment & Health'],
    y4: ['Research Project I', 'Research Project II', 'Environmental & Health Law & Ethics', 'Disaster Risk Management', 'Programme Planning & Management', 'Climate Change & Sustainability', 'Advanced Topics in Practice', 'Professional Practice Seminar']
  },
  'math-stats': {
    y2: ['Real & Mathematical Analysis', 'Linear Algebra II', 'Probability & Distribution Theory', 'Statistical Inference', 'Numerical Analysis', 'Programming for Data & Mathematics', 'Operations Research I', 'Mathematical Modelling'],
    y3: ['Regression & Multivariate Analysis', 'Time Series & Forecasting', 'Sampling & Survey Design', 'Stochastic Processes', 'Design & Analysis of Experiments', 'Data Mining & Machine Learning', 'Research Methods', 'Industrial Attachment'],
    y4: ['Research Project I', 'Research Project II', 'Advanced Statistical & Mathematical Theory', 'Actuarial & Financial Modelling', 'Big Data Analytics & Computing', 'Quality & Reliability Analysis', 'Applied Statistical Practice', 'Professional Practice & Ethics']
  }
};

// Map each master course id to its discipline track.
const COURSE_TRACK = {
  // Medicine & health
  bsn: 'nursing', mbchb: 'med-clinical', pharm: 'med-clinical', clinmed: 'med-clinical',
  phealth: 'health-env', 'bds-dent': 'med-clinical', bmls: 'med-clinical', bnut: 'med-clinical',
  brad: 'med-clinical', bphysio: 'med-clinical', boptom: 'med-clinical',
  // Engineering
  bce: 'engineering', bee: 'engineering', bme: 'engineering', bche: 'engineering',
  baero: 'engineering', 'bagric-eng': 'engineering', bmine: 'engineering',
  bpetro: 'engineering', btele: 'engineering',
  // Computing & ICT
  bcs: 'computing', bit: 'computing', bse: 'computing', bds: 'computing',
  bcyber: 'computing', binfo: 'computing', bbis: 'computing', bailm: 'computing',
  // Business & economics
  bcom: 'business', bba: 'business', becon: 'business', bacc: 'business',
  bpsm: 'business', bhr: 'business', bmkt: 'business', bact: 'business', bcoop: 'business',
  // Education
  'bed-arts': 'education', 'bed-sci': 'education', bece: 'education',
  'bed-sne': 'education', 'bed-pri': 'education', 'bed-phys': 'education',
  // Social sciences & humanities
  bsoc: 'arts-soc', bpsy: 'arts-soc', bhist: 'arts-soc', bpol: 'arts-soc', bgeo: 'arts-soc',
  banthro: 'arts-soc', bsw: 'arts-soc', bcrim: 'arts-soc', bir: 'arts-soc', bgender: 'arts-soc',
  // Law
  llb: 'law',
  // Pure & applied sciences
  bmath: 'math-stats', bstat: 'math-stats',
  bphy: 'pure-sci', bchm: 'pure-sci', bbio: 'pure-sci', bgeol: 'pure-sci',
  bbiotech: 'pure-sci', bmicro: 'pure-sci',
  // Agriculture & environment
  bagric: 'agriculture', bvet: 'agriculture', bhort: 'agriculture', bfor: 'agriculture',
  bfish: 'agriculture', bfst: 'agriculture',
  benv: 'health-env', bwlm: 'health-env', benvhealth: 'health-env',
  // Built environment
  barch: 'built-env', bqs: 'built-env', blsurv: 'built-env', bre: 'built-env',
  burp: 'built-env', bcm: 'built-env',
  // Communication, language & the arts
  bcomm: 'humanities-lang', bfilm: 'creative-arts', banim: 'creative-arts',
  bfa: 'creative-arts', bfashion: 'creative-arts',
  'ba-eng-lit': 'humanities-lang', 'ba-ling': 'humanities-lang', 'ba-kis': 'humanities-lang',
  'ba-fr': 'humanities-lang', 'ba-ger': 'humanities-lang', 'ba-chi': 'humanities-lang',
  'ba-ara': 'humanities-lang', 'ba-jrn': 'humanities-lang', 'ba-libr': 'humanities-lang',
  // Theology & philosophy
  'ba-rel': 'arts-soc', 'ba-theo': 'arts-soc', 'ba-phil': 'arts-soc', 'ba-isl': 'arts-soc',
  // Hospitality & tourism
  bht: 'business', btrav: 'business', bculin: 'business',
  // Music & performing arts
  'ba-mus': 'creative-arts', bperf: 'creative-arts'
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// Unique unit-code prefix per course, derived from the course id (ids are
// unique). Padded to ≥4 letters so generated codes (e.g. BSOC201) can never
// equal an existing master or Chuka code (all of those use ≤3 letters).
function codePrefix(course) {
  let p = String(course.id || 'GEN').toUpperCase().replace(/[^A-Z]/g, '');
  if (!p) p = 'GENX';
  while (p.length < 4) p += 'Q';
  return p;
}

// Rotate an array by `offset` so upper-year sequences feel distinct per course.
function rotate(arr, offset) {
  const n = arr.length;
  return arr.map((_, i) => arr[(i + offset) % n]);
}

// Build the 24 upper-year units for one course (Year 2, 3 and 4; 8 each).
function buildUpperYears(course) {
  const track = COURSE_TRACK[course.id] || 'arts-soc';
  const plan = DISCIPLINE_YEARS[track];
  const prefix = codePrefix(course);
  const y1 = (course.units || []).map(u => u.name);

  const units = [];
  [2, 3, 4].forEach(year => {
    const key = 'y' + year;
    // Blend the discipline spine with the course's own first-year foundations
    // so titles stay relevant to THIS course, not just the generic track.
    const spine = rotate(plan[key], course.id.length % plan[key].length);
    spine.forEach((title, idx) => {
      const sem = idx < 4 ? 1 : 2;                    // 0-3 → sem 1, 4-7 → sem 2
      const num = year * 100 + (idx + 1);             // 201-208, 301-308, 401-408
      const base = y1.length ? y1[(idx + year) % y1.length] : title;
      // Every third slot anchors to one of the course's own foundation units.
      const label = (idx % 3 === 0 && base && !/introduction/i.test(base))
        ? `Advanced ${base}`
        : title;
      units.push({
        code: `${prefix}${num}`,
        name: label,
        pages: 47,
        year,
        sem
      });
    });
  });
  return units;
}

// Tag the existing Year-1 units (split evenly across semesters 1.1 & 1.2).
function tagYearOne(course) {
  const list = course.units || [];
  const half = Math.ceil(list.length / 2);
  return list.map((u, i) => ({
    ...u,
    year: 1,
    sem: i < half ? 1 : 2
  }));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * expandCourses(courses)
 * Returns a NEW array of course objects with full 1.1–4.2 coverage and
 * year/sem metadata on every unit. The input array is never mutated, and a
 * course that is already expanded is passed through untouched (idempotent).
 */
function expandCourses(courses) {
  return courses.map(course => {
    if (course.units && course.units.some(u => u && u.year)) return course; // already expanded
    const tagged = tagYearOne(course);
    const upper = buildUpperYears(course);
    return {
      ...course,
      units: tagged.concat(upper)
    };
  });
}

module.exports = { expandCourses };
