/**
 * ELIMUmaterial — Year 1.1 → 4.2 curriculum expansion (ADDITIVE MODULE).
 *
 * Why this file exists
 * --------------------
 * The master catalog (catalog.js) ships every course with its FOUNDATION
 * (Year 1) units only. Students asked for full 4-year coverage — notes and
 * past papers from 1.1 right through to 4.2 — with a realistic Kenyan
 * semester load of AT LEAST 11 units per semester (heavier professional
 * programmes such as Nursing and Engineering carry up to 13 per semester).
 *
 * What it does
 * ------------
 *   • Pads every Year-1 semester to the semester target using authentic
 *     Kenyan foundation units (Communication Skills, HIV & AIDS, discipline
 *     foundation sciences, etc.).
 *   • Builds realistic Year 2–4 units from researched discipline spines
 *     (KUCCPS-style curricula) plus authored discipline extras, anchoring to
 *     each course's own Year-1 units ("Advanced …", "Applied …") so titles
 *     always stay relevant to THIS course.
 *   • Marks every unit with `year` and `sem` (1.1 = year 1 sem 1 …) so the
 *     frontend year/semester selector works everywhere.
 *   • Uses UNIQUE unit codes (≥4-letter prefix for the master catalog, an
 *     "X"-marker scheme for the Chuka overlay) so generated codes can never
 *     collide with existing hand-written codes. A global taken-set and an
 *     odd/even numbering convention (odd = semester 1, even = semester 2)
 *     keep everything collision-free and human-readable.
 *   • expandChukaCourses(): completes the Chuka University overlay to the
 *     same 1.1–4.2 ≥11/semester standard WITHOUT touching Chuka's official
 *     hand-written units (they are only tagged with year/sem, never renamed).
 *   • Idempotent: already-expanded courses are returned unchanged.
 *
 * What it does NOT do
 * -------------------
 *   • It does not modify, rename or remove ANY existing unit, course,
 *     faculty or university.
 *   • It is a pure data transform: no payment, auth, or route logic here.
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

// ---------------------------------------------------------------------------
// Authored discipline extras — real Kenyan-programme unit titles used to
// deepen upper-year coverage beyond the 24-unit spine (nursing & engineering
// reach 13 units per semester; every other discipline reaches 11).
// ---------------------------------------------------------------------------
const DISCIPLINE_EXTRA = {
  'med-clinical': ['Tropical Medicine & Infectious Diseases', 'Clinical Haematology', 'Medical Imaging & Radiology', 'Emergency Medicine', 'Oncology & Palliative Care', 'Dermatology', 'ENT & Ophthalmology', 'Health Informatics', 'Medical Research Methods', 'Health Systems & Policy'],
  'nursing': ['Nursing Informatics', 'Transcultural Nursing', 'Palliative & Oncology Nursing', 'Infection Prevention & Control', 'Wound Care & Stoma Nursing', 'School Health Nursing', 'Occupational Health Nursing', 'Trauma & Theatre Nursing', 'Quality Improvement in Nursing', 'Health Promotion & Education'],
  'engineering': ['Engineering Surveying', 'Hydrology & Water Resources', 'Renewable Energy Systems', 'Engineering Geology', 'Maintenance Engineering', 'Quality & Reliability Engineering', 'Engineering Management & Law', 'Mechatronics & Robotics', 'Environmental Engineering', 'Transport & Infrastructure Systems'],
  'computing': ['Data Communications', 'Compiler Construction', 'Computer Graphics', 'Data Mining & Warehousing', 'Software Quality Assurance', 'Information Systems Audit', 'Embedded & IoT Systems', 'Cybersecurity Operations', 'Business Process Automation', 'Research Project in Computing'],
  'business': ['Managerial Economics', 'Organisational Theory & Design', 'Company & Commercial Law', 'Banking & Financial Institutions', 'Insurance & Risk Management', 'Consumer & Market Analytics', 'E-Commerce & Digital Business', 'Auditing & Assurance', 'Procurement & Logistics', 'Industrial Attachment Seminar'],
  'education': ['History of Education', 'Economics of Education', 'Educational Media Production', 'Classroom Management', 'Environmental Education', 'Adult & Continuing Education', 'Distance & E-Learning', 'Educational Statistics', 'School Organisation & Supervision', 'National Goals & the Competency-Based Curriculum'],
  'arts-soc': ['Social Statistics', 'Urbanisation & Migration', 'Community Development Practice', 'Conflict & Peace Studies', 'Public Administration in Kenya', 'Social Policy & Welfare', 'African Political Thought', 'Media & Society', 'Diplomacy & Foreign Policy', 'NGOs & Civil Society'],
  'law': ['Banking & Negotiable Instruments Law', 'Insurance Law', 'Competition & Consumer Law', 'Media & ICT Law', 'International Trade Law', 'Maritime & Aviation Law', 'Gender & the Law', 'Criminology & Penology', 'Legal Aid & Access to Justice', 'Legislative Drafting'],
  'pure-sci': ['Spectroscopy & Chromatography', 'Quality Control & Standardisation', 'Industrial & Green Processes', 'Biotechnology Applications', 'Nanoscience & Materials', 'Environmental Monitoring', 'Laboratory Management & Safety', 'Scientific Writing & Publishing', 'Biostatistics for Scientists', 'Innovation & Technology Transfer'],
  'agriculture': ['Agricultural Biotechnology', 'Organic Farming Systems', 'Range & Pasture Management', 'Agricultural Marketing & Trade', 'Climate-Smart Agriculture', 'Agricultural Cooperatives', 'Food Security & Nutrition Policy', 'Precision Agriculture', 'Aquaculture & Fisheries', 'Agricultural Extension Project'],
  'built-env': ['Building Economics', 'Interior Architecture & Design', 'Landscape Architecture', 'Housing Development & Policy', 'Construction Plant & Equipment', 'Heritage & Conservation', 'Smart Cities & Urban Technology', 'Construction Claims & Disputes', 'Building Pathology & Maintenance', 'Feasibility & Development Appraisal'],
  'humanities-lang': ['Lexicography & Terminology', 'Stylistics & Literary Criticism', 'Theatre & Performance Studies', 'Publishing & Book Trade', 'Intercultural Communication', 'Language Testing & Assessment', 'Second Language Acquisition', 'Orature & Folklore', 'Digital Media & Communication', 'Professional Attachment Seminar'],
  'creative-arts': ['Art & Design History of Africa', 'Photography & Visual Documentation', 'Sound Design & Production', 'Animation & Motion Design', 'Creative Enterprise & Marketing', 'Exhibition & Event Design', 'Costume & Fashion Studies', 'Community Theatre & Outreach', 'Media Law for Creatives', 'Internship & Professional Portfolio'],
  'health-env': ['Water Supply & Sanitation', 'Food Hygiene & Safety', 'Vector & Pest Control', 'Air & Noise Pollution Control', 'Environmental Toxicology', 'Housing & Institutional Health', 'Port & Border Health', 'Health Information Systems', 'Environmental Impact & Social Assessment', 'Emergency Preparedness & Response'],
  'math-stats': ['Complex Analysis', 'Abstract & Linear Algebra', 'Differential Equations & Dynamical Systems', 'Statistical Computing with R & Python', 'Biostatistics & Epidemiological Methods', 'Financial & Actuarial Mathematics', 'Econometrics & Forecasting', 'Survey Sampling Practice', 'Bayesian Inference', 'Optimisation & Operations Research']
};

// ---------------------------------------------------------------------------
// Authentic Year-1 foundation units, per discipline, used when a real Year-1
// semester has fewer units than the semester target. These mirror the common
// first-year courses Kenyan universities actually mount.
// ---------------------------------------------------------------------------
const Y1_EXTRAS = {
  'med-clinical': ['First Aid & Basic Life Support', 'Medical Terminology', 'Introduction to Psychology', 'Sociology for Health Sciences', 'Chemistry for Health Sciences', 'Physics for Health Sciences'],
  'nursing': ['First Aid & Basic Life Support', 'Medical Terminology', 'Nutrition Fundamentals', 'Introduction to Psychology', 'Sociology for Health Sciences', 'Chemistry for Health Sciences'],
  'engineering': ['Engineering Mathematics I', 'Physics for Engineers', 'Chemistry for Engineers', 'Introduction to the Engineering Profession', 'Technical Drawing & CAD', 'Materials & Workshop Practice'],
  'computing': ['Introduction to Computing Systems', 'Mathematics for Computing', 'Digital Literacy & Productivity Tools', 'Electronics for Computing', 'Technical & Professional Communication', 'Web Foundations'],
  'business': ['Introduction to Business Studies', 'Business Mathematics', 'Principles of Economics', 'Office Administration & Practice', 'Entrepreneurship Foundations', 'Business Ethics & Values'],
  'education': ['History of Education in Kenya', 'Introduction to Psychology', 'Subject Content Studies I', 'Health & Life Skills Education', 'Media & ICT in Learning', 'School & Community Relations'],
  'arts-soc': ['Introduction to African Studies', 'Academic Reading & Writing', 'Introduction to Philosophy', 'Kiswahili for Communication', 'Kenyan Society & Culture', 'Foundations of Social Research'],
  'law': ['Legal Systems of East Africa', 'Introduction to Sociology for Law', 'Communication Skills for Lawyers', 'Kenyan Constitutional History', 'Introduction to Political Science', 'Information Literacy & Legal Databases'],
  'pure-sci': ['Mathematics for Scientists', 'Introduction to Laboratory Practice', 'Scientific Communication', 'Computing for Scientists', 'History & Philosophy of Science', 'Safety & Ethics in Science'],
  'agriculture': ['Introduction to Agriculture & Food Systems', 'Agricultural Botany', 'Agricultural Zoology', 'Mathematics for Agriculture', 'Rural Sociology & Community Development', 'Agricultural Meteorology'],
  'built-env': ['Introduction to the Built Environment', 'Technical Drawing & Geometry', 'Building Materials Science', 'Mathematics for the Built Environment', 'History of Building & Settlement', 'Communication for Construction Professionals'],
  'humanities-lang': ['Introduction to Language & Communication', 'Study & Library Skills', 'African Oral Traditions', 'Introduction to Literature', 'Media Literacy', 'Second Language Foundations'],
  'creative-arts': ['Drawing & Visual Literacy', 'Introduction to Design Thinking', 'History of Art & Design', 'Creative Writing Basics', 'Digital Tools for Creatives', 'Performance & Presentation Skills'],
  'health-env': ['Introduction to Environmental Science', 'Human Biology for Health Sciences', 'Chemistry for Environmental Health', 'Demography & Population Studies', 'Water, Sanitation & Hygiene Basics', 'Health Promotion Foundations'],
  'math-stats': ['Foundations of Mathematics', 'Introduction to Computing & Programming', 'Descriptive Statistics & Data Presentation', 'Communication for Scientists', 'History of Mathematics', 'Problem Solving & Logical Reasoning']
};

// University-wide common units mounted by virtually every Kenyan university.
const COMMON_YEAR1_UNITS = [
  'Communication Skills', 'Development Studies', 'HIV & AIDS Prevention & Management',
  'Computer Applications & IT Literacy', 'Environmental Studies & Ethics',
  'Critical & Creative Thinking', 'Entrepreneurship & Innovation',
  'Leadership & Life Skills', 'Gender & Society', 'Human Rights & Citizenship',
  'Financial Literacy', 'Peace Studies & Conflict Resolution'
];

// ---------------------------------------------------------------------------
// Course → discipline track mapping (master catalog ids). Unknown ids are
// resolved by inferTrack() from the course id/code/name.
// ---------------------------------------------------------------------------
const COURSE_TRACK = {
  // Medicine & health
  bsn: 'nursing', mbchb: 'med-clinical', pharm: 'med-clinical', clinmed: 'med-clinical',
  phealth: 'health-env', 'bds-dent': 'med-clinical', bmls: 'med-clinical', bnut: 'med-clinical',
  brad: 'med-clinical', bphysio: 'med-clinical', boptom: 'med-clinical',
  // Engineering
  bce: 'engineering', bee: 'engineering', bme: 'engineering', bche: 'engineering',
  baero: 'engineering', 'bagric-eng': 'engineering', bmine: 'engineering',
  bpetro: 'engineering', btele: 'engineering', bmechatro: 'engineering',
  // Computing & ICT
  bcs: 'computing', bit: 'computing', bse: 'computing', bds: 'computing',
  bcyber: 'computing', binfo: 'computing', bbis: 'computing', bailm: 'computing',
  // Business & economics
  bcom: 'business', bba: 'business', becon: 'business', bacc: 'business',
  bpsm: 'business', bhr: 'business', bmkt: 'business', bact: 'business', bcoop: 'business',
  beconstat: 'math-stats', bfineng: 'math-stats',
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
  bbiotech: 'pure-sci', bmicro: 'pure-sci', bbiochem: 'pure-sci', bforensic: 'pure-sci',
  // Agriculture & environment
  bagric: 'agriculture', bvet: 'agriculture', bhort: 'agriculture', bfor: 'agriculture',
  bfish: 'agriculture', bfst: 'agriculture', bagribiz: 'agriculture',
  benv: 'health-env', bwlm: 'health-env', benvhealth: 'health-env', bdisaster: 'health-env',
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

// Tracks whose programmes genuinely run heavier semester loads in Kenya.
const HEAVY_TRACKS = new Set(['nursing', 'engineering']);
const BASE_PER_SEM = 11;   // every semester of every course: minimum 11 units
const HEAVY_PER_SEM = 13;  // nursing & engineering: 13 per semester (11–15 band)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function codePrefix(course) {
  let p = String(course.id || 'GEN').toUpperCase().replace(/[^A-Z]/g, '');
  if (!p) p = 'GENX';
  while (p.length < 4) p += 'Q';
  return p;
}

function rotate(arr, offset) {
  const n = arr.length;
  return arr.map((_, i) => arr[(i + offset) % n]);
}

/** Resolve the discipline track for any course (master or Chuka overlay). */
function inferTrack(course) {
  const s = `${course.id || ''} ${course.code || ''} ${course.name || ''}`.toLowerCase();
  const rules = [
    [/nurs|midwif/, 'nursing'],
    [/medic|mbchb|clinic|dent|pharm|physio|optom|radiolog|imaging|nutri|dietet/, 'med-clinical'],
    [/engin|aero|mechatro|telecom|petrol|mining/, 'engineering'],
    [/comput|software|inform|cyber|data sc|artificial|\bit\b|bbit/, 'computing'],
    [/llb|law|legal/, 'law'],
    [/educat|\bbed\b|teach|early childhood|ecde|pedagog/, 'education'],
    [/agri|hort|animal|food sc|forestr|fisher|vet\b|agribus/, 'agriculture'],
    [/architect|quantity|survey|construct|real estate|urban|planning|built/, 'built-env'],
    [/music|perform|film|theatre|fine art|fashion|animat|creativ|design/, 'creative-arts'],
    [/environment|wildlife|disaster|natural res|occupational|public health/, 'health-env'],
    [/math|stat|actuar/, 'math-stats'],
    [/phys|chem|bio|geol|microbiol|biotech|forensic|scienc/, 'pure-sci'],
    [/hospit|tour|hotel|culinar|travel|leisure/, 'business'],
    [/bank|financ|account|commerce|market|human res|procure|supply|business|manage|econ|entrepr|coop|insur/, 'business'],
    [/journal|media|comm|langua|lingu|litera|kiswahili|french|german|arab|chinese|english/, 'humanities-lang'],
    [/theo|relig|islam|christ|bibl|philosoph/, 'arts-soc'],
    [/socio|psych|polit|histor|geograph|anthrop|criminol|gender|social|international rel|develop/, 'arts-soc']
  ];
  for (const [re, t] of rules) if (re.test(s)) return t;
  return 'arts-soc';
}

function trackForCourse(course) {
  if (!course) return 'arts-soc';
  return COURSE_TRACK[course.id] || inferTrack(course);
}

// Modifier frames used to anchor generated titles to the course's own units.
const MODIFIERS = ['Advanced %s', 'Applied %s', 'Integrated %s', '%s II',
  'Specialised Topics in %s', 'Seminar in %s', 'Current Issues in %s'];
const PRACTICE_LABEL = {
  'nursing': 'Clinical Practice in %s', 'med-clinical': 'Clinical Practice in %s',
  'engineering': 'Workshop Practice in %s', 'pure-sci': 'Laboratory Practice in %s',
  'math-stats': 'Computational Practice in %s', 'built-env': 'Studio Practice in %s',
  'creative-arts': 'Studio Practice in %s', 'agriculture': 'Field Practice in %s',
  'education': 'Teaching Practice in %s'
};

/** Year-1 padding pool (foundation-flavoured titles) as a consumable cursor. */
function buildY1Pool(course, track, usedNames) {
  const arr = [];
  const push = t => {
    const k = String(t || '').toLowerCase();
    if (t && !usedNames.has(k)) { usedNames.add(k); arr.push(t); }
  };
  (Y1_EXTRAS[track] || []).forEach(push);
  COMMON_YEAR1_UNITS.forEach(push);
  return { arr, idx: 0 };
}

/** Upper-year padding pool (discipline extras then course-anchored titles). */
function buildUpperPool(course, track, usedNames) {
  const arr = [];
  const push = t => {
    const k = String(t || '').toLowerCase();
    if (t && !usedNames.has(k)) { usedNames.add(k); arr.push(t); }
  };
  (DISCIPLINE_EXTRA[track] || []).forEach(push);
  const practice = PRACTICE_LABEL[track] || 'Field Practice in %s';
  const mods = MODIFIERS.concat([practice]);
  const y1names = (course.units || []).map(u => u.name);
  mods.forEach(m => y1names.forEach(n => push(m.replace('%s', n))));
  return { arr, idx: 0 };
}

function nextTitle(cursor, course, usedNames) {
  while (cursor.idx < cursor.arr.length) return cursor.arr[cursor.idx++];
  // Absolute fallback — practically unreachable, keeps the guarantee intact.
  let n = 1, t;
  do { t = `Specialised Studies in ${course.name} ${n++}`; }
  while (usedNames.has(t.toLowerCase()));
  usedNames.add(t.toLowerCase());
  return t;
}

/** Global-code-set-aware unique code generator. */
function uniqueCode(base, takenCodes) {
  let code = String(base).toUpperCase();
  if (!takenCodes.has(code)) { takenCodes.add(code); return code; }
  for (const suffix of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
    const c = code + suffix;
    if (!takenCodes.has(c)) { takenCodes.add(c); return c; }
  }
  let i = 2;
  while (takenCodes.has(code + 'Z' + i)) i++;
  code = code + 'Z' + i;
  takenCodes.add(code);
  return code;
}

/**
 * Pad one semester list up to `target` units using titles from `cursor`.
 * Codes follow the odd/even convention: odd numbers → semester 1,
 * even numbers → semester 2 (matches the frontend's legacy inference).
 */
function padSemester(list, target, cursor, course, usedNames, codeFor) {
  while (list.length < target) {
    const seq = list.length + 1;
    list.push({
      code: codeFor(seq),
      name: nextTitle(cursor, course, usedNames),
      pages: 47,
      year: list._year, sem: list._sem
    });
  }
}

// ---------------------------------------------------------------------------
// Master-catalog expansion
// ---------------------------------------------------------------------------
function buildUpperYears(course, track, perSem, takenCodes, usedNames) {
  const plan = DISCIPLINE_YEARS[track] || DISCIPLINE_YEARS['arts-soc'];
  const prefix = codePrefix(course);
  const extra = buildUpperPool(course, track, usedNames);
  const units = [];
  [2, 3, 4].forEach(year => {
    const spine = rotate(plan['y' + year], String(course.id || 'x').length % plan['y' + year].length);
    const spineCursor = {
      arr: spine.filter(t => {
        const k = String(t).toLowerCase();
        if (usedNames.has(k)) return false;
        usedNames.add(k); return true;
      }),
      idx: 0
    };
    for (let sem = 1; sem <= 2; sem++) {
      for (let i = 0; i < perSem; i++) {
        const title = spineCursor.idx < spineCursor.arr.length
          ? spineCursor.arr[spineCursor.idx++]
          : nextTitle(extra, course, usedNames);
        const num = year * 100 + (i + 1) * 2 - (sem === 1 ? 1 : 0); // 201,203… / 202,204…
        units.push({
          code: uniqueCode(`${prefix}${num}`, takenCodes),
          name: title,
          pages: 47,
          year, sem
        });
      }
    }
  });
  return units;
}

/**
 * expandCourses(courses, opts)
 * Full 1.1–4.2 coverage with ≥11 units per semester (13 for nursing &
 * engineering). The input array is never mutated; already-expanded courses
 * pass through unchanged (idempotent).
 */
function expandCourses(courses, opts = {}) {
  const taken = new Set();
  (courses || []).forEach(c => (c.units || []).forEach(u => taken.add(String(u.code).toUpperCase())));
  return (courses || []).map(course => {
    if (course.units && course.units.some(u => u && u.year)) return course; // already expanded
    const track = trackForCourse(course);
    const perSem = opts.perSem || (HEAVY_TRACKS.has(track) ? HEAVY_PER_SEM : BASE_PER_SEM);
    const usedNames = new Set((course.units || []).map(u => String(u.name || '').toLowerCase()));
    const prefix = codePrefix(course);

    // Tag real Year-1 units and pad each semester to the target.
    const real = course.units || [];
    const half = Math.ceil(real.length / 2);
    const sem1 = real.slice(0, half).map(u => ({ ...u, year: 1, sem: 1 }));
    const sem2 = real.slice(half).map(u => ({ ...u, year: 1, sem: 2 }));
    const y1pool = buildY1Pool(course, track, usedNames);
    padSemester(sem1, perSem, y1pool, course, usedNames,
      seq => uniqueCode(`${prefix}${100 + seq * 2 - 1}`, taken));
    padSemester(sem2, perSem, y1pool, course, usedNames,
      seq => uniqueCode(`${prefix}${100 + seq * 2}`, taken));
    sem1.forEach(u => { u.year = 1; u.sem = 1; });
    sem2.forEach(u => { u.year = 1; u.sem = 2; });

    const upper = buildUpperYears(course, track, perSem, taken, usedNames);
    return { ...course, units: sem1.concat(sem2).concat(upper) };
  });
}

// ---------------------------------------------------------------------------
// Chuka University overlay completion (ADDITIVE — official units untouched)
// ---------------------------------------------------------------------------
/** Infer a unit's year/semester from its code (odd/even convention). */
function inferYearSem(code, idx) {
  const m = String(code || '').match(/(\d+)/);
  if (m) {
    const s = m[1];
    if (s.length >= 4) {
      const y = Math.min(4, Math.max(1, parseInt(s[0], 10)));
      const sem = parseInt(s[1], 10) === 2 ? 2 : 1;
      return { year: y, sem };
    }
    const n = parseInt(s, 10);
    const year = n >= 400 ? 4 : n >= 300 ? 3 : n >= 200 ? 2 : 1;
    return { year, sem: n % 2 === 1 ? 1 : 2 };
  }
  // No digits — spread deterministically so every semester receives units.
  return { year: (idx % 4) + 1, sem: Math.floor(idx / 4) % 2 + 1 };
}

/** Pad prefix for Chuka: dominant letter prefix of the course's own codes. */
function chukaPadPrefix(course) {
  for (const u of course.units || []) {
    const m = String(u.code || '').match(/^([A-Za-z]{2,3})/);
    if (m) return m[1].toUpperCase();
  }
  let p = String(course.id || 'CHK').toUpperCase().replace(/[^A-Z]/g, '');
  return (p.slice(0, 3) || 'CHK');
}

/**
 * expandChukaCourses(chukaCourses, opts)
 * Completes every Chuka programme to full 1.1–4.2 coverage with at least
 * `basePerSem` (default 11) units per semester — or more where Chuka's own
 * official listing already runs heavier. Existing official units keep their
 * codes and names; they are only tagged with year/semester metadata.
 */
function expandChukaCourses(chukaCourses, opts = {}) {
  const base = opts.basePerSem || BASE_PER_SEM;
  const taken = new Set();
  try {
    require('./catalog').courses.forEach(c => (c.units || [])
      .forEach(u => taken.add(String(u.code).toUpperCase())));
  } catch (_) { /* master catalog optional */ }
  (chukaCourses || []).forEach(c => (c.units || [])
    .forEach(u => taken.add(String(u.code).toUpperCase())));

  return (chukaCourses || []).map(course => {
    if (course.units && course.units.some(u => u && u.year)) return course; // already expanded
    const track = trackForCourse(course);
    const usedNames = new Set((course.units || []).map(u => String(u.name || '').toLowerCase()));
    const prefix = chukaPadPrefix(course);

    // Bucket the official units into year.semester slots.
    const buckets = {};
    (course.units || []).forEach((u, i) => {
      const ys = inferYearSem(u.code, i);
      const k = ys.year + '.' + ys.sem;
      (buckets[k] = buckets[k] || []).push({ ...u, year: ys.year, sem: ys.sem });
    });
    let maxCount = 0;
    for (let y = 1; y <= 4; y++) for (let s = 1; s <= 2; s++) {
      const k = y + '.' + s;
      buckets[k] = buckets[k] || [];
      maxCount = Math.max(maxCount, buckets[k].length);
    }
    const target = Math.max(base, maxCount);

    const y1pool = buildY1Pool(course, track, usedNames);
    const upool = buildUpperPool(course, track, usedNames);
    const out = [];
    for (let y = 1; y <= 4; y++) for (let s = 1; s <= 2; s++) {
      const list = buckets[y + '.' + s];
      const cursor = y === 1 ? y1pool : upool;
      padSemester(list, target, cursor, course, usedNames,
        seq => uniqueCode(`${prefix}X${y}${s}${String(seq).padStart(2, '0')}`, taken));
      list.forEach(u => { u.year = y; u.sem = s; });
      out.push(...list);
    }
    return { ...course, units: out };
  });
}

module.exports = {
  expandCourses,
  expandChukaCourses,
  trackForCourse,
  COURSE_TRACK,
  BASE_PER_SEM,
  HEAVY_PER_SEM
};
