/**
 * ELIMUmaterial — PDF content knowledge base (ADDITIVE MODULE).
 *
 * Feeds seed/generatePdfs.js with unit-aware study content so every notes
 * PDF reads like a real revision companion for THAT unit:
 *   • topicsFor() picks 14 topics per unit: unit-name-matched topics first
 *     (per-discipline matchers + cross-cutting common units), then
 *     discipline-general topics, then cross-disciplinary meta-topics.
 *   • TRACKS carries, per discipline: topic matchers, general topic banks,
 *     authentic Kenyan case-study settings, and glossary terms.
 *   • Templates assemble professional, exam-oriented prose around each topic.
 */

const SECTIONS = [
  { name: 'Part 1 — Foundations & Learning Outcomes', n: 3,
    intro: 'The opening topics establish the conceptual foundations of the unit: what the subject is, where it came from, and what a competent graduate is expected to do with it. Everything that follows builds on these pages.' },
  { name: 'Part 2 — Core Concepts & Terminology', n: 3,
    intro: 'Every discipline is built on shared vocabulary. These topics define the working concepts of the unit precisely, so that later arguments can be made — and examined — without ambiguity.' },
  { name: 'Part 3 — Theoretical & Analytical Frameworks', n: 2,
    intro: 'Here the notes move from description to explanation: the theories and analytical frameworks that practitioners and scholars use to make sense of the subject.' },
  { name: 'Part 4 — Methods, Techniques & Professional Practice', n: 2,
    intro: 'Methodology bridges theory and practice. These topics cover the standard procedures, tools and professional routines you are expected to perform and defend.' },
  { name: 'Part 5 — Applications in the Kenyan Context', n: 2,
    intro: 'Applying the unit to Kenya\u2019s institutions, industries and communities is where examination marks are won. These topics connect the syllabus to named national settings.' },
  { name: 'Part 6 — Contemporary Issues, Ethics & Policy', n: 2,
    intro: 'The field is not static. These closing content topics survey current debates, ethical obligations and policy shifts shaping professional practice today.' }
];

const INTRO_TEMPLATES = [
  'This topic introduces {T} as it is examined in {U}. Mastery here means more than memorising definitions: examiners expect you to explain the underlying ideas, apply them to Kenyan situations, and evaluate evidence.',
  'Few areas of {U} reward careful study like {T}. Read this topic twice: once for the overall argument, and again with a notebook to capture definitions, examples and your own questions.',
  'In this topic we examine {T}. The notes move from definition to principles, then to methods and finally to application, mirroring how the subject is taught and assessed in Kenyan universities.',
  'Among the most examined areas of {U} is {T}. A confident learner can define it precisely, illustrate it with a Kenyan example, and connect it to at least two other topics on the syllabus.',
  'This topic unpacks {T}. Pay attention to the guided practice and the Kenyan case analysis: end-of-semester questions are almost always applied rather than purely descriptive.',
  'Here we build a working command of {T}. Study actively — pause after each bullet, restate it in your own words, and note one example from your own county or community.'
];

const ASPECT_TEMPLATES = [
  'Definition and scope: what examiners mean by {T}, its boundaries, and the vocabulary used to discuss it in {U}.',
  'Principles and frameworks: the models and guiding ideas that organise thinking about {T}.',
  'Methods and procedures: the standard steps, tools or instruments a practitioner uses when working with {T}.',
  'Kenyan application: how {T} appears in local institutions, industries and communities, with at least one named example.',
  'Common pitfalls: frequent student errors and misconceptions about {T}, and how markers expect you to avoid them.',
  'Integration: how {T} links to the other topics of this unit and to companion units in the {C} programme.'
];

const STUDY_TIPS = [
  'Study tip: rephrase this page in your own words before moving on. Active recall consistently outperforms passive re-reading.',
  'Study tip: convert the six coverage bullets into six questions, then answer them tomorrow without notes.',
  'Study tip: highlight exactly five terms on this page and add them to your personal glossary with one example each.',
  'Study tip: explain this topic aloud to a study partner in three minutes — teaching is the strongest test of understanding.',
  'Study tip: link this topic to a Kenyan news story you have seen recently; applied examples earn the highest marks.',
  'Study tip: write a five-line model answer on this topic and keep it for the final revision week.'
];

const CASE_TEMPLATES = [
  'Consider {X}, a typical Kenyan setting for this discipline. A team there is confronted with a problem that turns on {T}: they must define the issue precisely, gather the right evidence, apply the standard method, and justify their recommendation to non-specialist stakeholders. Walking through their reasoning — definition, evidence, method, recommendation — is exactly the structure examiners reward.',
  'At {X}, practitioners deal with {T} not as theory but as a daily operational question. Notice three things: the constraints (budget, time, regulation), the stakeholders (community, county government, professional bodies), and the evidence used to justify each decision. Reproducing this chain of reasoning in an examination earns application marks that pure description cannot.',
  'A Kenyan case from {X} shows why {T} matters. When theory met local reality — limited resources, diverse stakeholders, evolving regulation — the practitioners who succeeded were those who adapted standard methods thoughtfully rather than applying them mechanically. Note the difference, and be ready to discuss it.',
  'Imagine you are attached to {X}. Your supervisor asks you to prepare a one-page brief on {T} for a county-level decision meeting. What definitions, data and recommendations would you include? Drafting that brief is an excellent self-test before the examination.'
];

const OUTLINE_STEPS = [
  'Re-read the core coverage page for {T} and highlight the five terms you find hardest to define.',
  'Write a ten-line summary of {T} from memory, then check it against the notes and correct any gaps.',
  'Find one Kenyan example of {T} in a newspaper, government report or your own community and file it in your revision notebook.',
  'Attempt the self-check questions below without notes; mark yourself honestly and revisit weak areas.',
  'Teach {T} to a study-group partner in five minutes — explaining aloud is the strongest test of understanding.'
];

const SELFCHECK_TEMPLATES = [
  'Define {T} in two sentences and give one Kenyan example.',
  'Explain the standard method or procedure associated with {T} as a numbered sequence.',
  'Discuss one current debate or ethical question raised by {T} in Kenya today.',
  'Compare {T} with the topic immediately before it in these notes: what does each add?',
  'State two common errors students make about {T} and how you will avoid them.',
  'Draft a 25-mark essay plan on {T}: introduction, three signposted points, counter-point, conclusion.'
];

const REVISION_POINTERS = [
  'Revision pointer: link this topic to the one before and after it — examiners love integrative questions.',
  'Revision pointer: prepare a five-line model answer on this topic; you will almost certainly use it.',
  'Revision pointer: convert this topic into a single flashcard — question on the front, your best answer on the back.',
  'Revision pointer: check past papers for this topic\u2019s favourite command words — define, discuss, evaluate — and practise each.'
];

const GENERIC_TOPICS = [
  'Historical Development of the Discipline', 'Key Scholars and Schools of Thought',
  'Research Evidence and Information Literacy', 'Professional Ethics and Conduct',
  'Legal and Regulatory Frameworks in Kenya', 'Technology and Digital Transformation in Practice',
  'Gender, Equity and Social Inclusion', 'Sustainability and Climate Resilience',
  'Communication and Report Writing for Professionals', 'Teamwork and Leadership in Practice',
  'Data Literacy and Evidence-Informed Decisions', 'Quality Assurance and Standards',
  'Project Planning and Management Basics', 'Kenyan Policy Context: Vision 2030 and Beyond',
  'Career Pathways and Professional Bodies', 'Innovation and Entrepreneurship Opportunities',
  'Health, Safety and Wellbeing in Practice', 'Community Engagement and Outreach',
  'Monitoring, Evaluation and Learning', 'Global Perspectives and Comparative Practice'
];

// Cross-cutting units mounted across many programmes.
const COMMON_MATCHERS = [
  { re: /communication skills/i, topics: ['The Communication Process and Models', 'Academic Writing and Referencing', 'Presentation and Public Speaking', 'Report and Proposal Writing'] },
  { re: /hiv|aids/i, topics: ['Epidemiology of HIV in Kenya', 'Prevention, Testing and Counselling', 'Treatment, Care and Adherence', 'Stigma, Policy and the Law'] },
  { re: /development studies/i, topics: ['Theories of Development', 'Poverty, Inequality and Livelihoods', 'Kenya\u2019s Development Planning: Vision 2030 and Beyond', 'Aid, Trade and Global Institutions'] },
  { re: /research (methods|methodology)|research project/i, topics: ['The Research Process and Design', 'Sampling and Data Collection Instruments', 'Data Analysis and Interpretation', 'Research Ethics and Academic Integrity'] },
  { re: /entrepreneur/i, topics: ['Opportunity Recognition and Creativity', 'Business Model and Plan Development', 'Financing a New Venture', 'Growth, Risk and Enterprise Support in Kenya'] },
  { re: /(computer|computing|it|information technology) (fundamentals|applications|literacy)|digital literacy/i, topics: ['Hardware, Software and File Management', 'Word Processing, Spreadsheets and Presentations', 'Internet, Email and Digital Safety', 'Introduction to Data and Information Systems'] },
  { re: /attachment|internship|practicum|fieldwork|teaching practice|clerkship/i, topics: ['Preparing for Placement: Objectives and Logbooks', 'Professional Conduct and Workplace Ethics', 'Supervision, Assessment and Reporting', 'Reflective Practice and Portfolio Building'] },
  { re: /ethic/i, topics: ['Foundations of Ethical Theory', 'Professional Codes and Conduct', 'Integrity, Corruption and Accountability', 'Applied Ethics Case Analysis'] },
  { re: /(business )?statistics|biostatistics/i, topics: ['Data Types, Collection and Presentation', 'Measures of Central Tendency and Dispersion', 'Probability and Probability Distributions', 'Estimation, Hypothesis Testing and Correlation'] },
  { re: /environmental (studies|science|health)/i, topics: ['Ecosystems and Natural Resources', 'Pollution and Waste Management', 'Environmental Law and Policy in Kenya', 'Climate Change and Sustainable Development'] },
  { re: /law of contract/i, topics: ['Formation of a Valid Contract', 'Terms, Capacity and Legality', 'Vitiating Factors', 'Discharge and Remedies'] },
  { re: /accounting/i, topics: ['The Accounting Cycle and Double Entry', 'Financial Statements Preparation', 'Interpretation and Ratio Analysis', 'Accounting Standards and Regulation'] }
];

// ---------------------------------------------------------------------------
// Per-discipline knowledge banks
// ---------------------------------------------------------------------------
const TRACKS = {
  'med-clinical': {
    general: ['Patient Safety and Quality of Care', 'Clinical Reasoning and Decision-Making', 'Evidence-Based Medicine', 'Health Systems and Referral Pathways in Kenya', 'Medical Documentation and Record-Keeping', 'Infection Prevention and Control', 'Professionalism and the Kenya Medical Practitioners and Dentists Council', 'Health Financing: from NHIF to the Social Health Authority', 'Medical Research and Publication', 'Communication with Patients and Families', 'Public Health and Preventive Medicine', 'Medical Law and Ethics in Kenya'],
    matchers: [
      { re: /anatomy/i, topics: ['Anatomical Terminology and Body Planes', 'Osteology and Joint Structure', 'Neuroanatomy Essentials', 'Surface and Radiological Anatomy'] },
      { re: /physiology/i, topics: ['Cell and Membrane Physiology', 'Cardiovascular and Respiratory Regulation', 'Renal and Fluid Balance', 'Endocrine and Reproductive Physiology'] },
      { re: /biochem/i, topics: ['Enzymes and Metabolic Pathways', 'Carbohydrate, Lipid and Protein Metabolism', 'Clinical Biochemistry and Result Interpretation', 'Molecular Biology of the Cell'] },
      { re: /pharmacolog/i, topics: ['Pharmacokinetics: Absorption, Distribution, Metabolism, Excretion', 'Pharmacodynamics and Receptors', 'Rational Prescribing and the Kenya Essential Medicines List', 'Adverse Drug Reactions and Interactions'] },
      { re: /patholog/i, topics: ['Cell Injury, Inflammation and Repair', 'Neoplasia and Tumour Biology', 'Haematopathology', 'Systemic Pathology of Major Organs'] },
      { re: /microbiolog|immunolog/i, topics: ['Bacteriology and Sterilisation', 'Virology and Emerging Infections', 'The Immune System and Hypersensitivity', 'Parasitology and Tropical Infections'] },
      { re: /surgery|medicine|clinical skills/i, topics: ['History Taking and Physical Examination', 'Asepsis and Surgical Principles', 'Fluid, Electrolyte and Blood Management', 'Pre-operative and Post-operative Care'] }
    ],
    contexts: ['Kenyatta National Hospital, Nairobi', 'Moi Teaching and Referral Hospital, Eldoret', 'Coast General Teaching and Referral Hospital, Mombasa', 'a level-four county hospital in Kitui', 'Kijabe Mission Hospital', 'a sub-county health centre in Turkana'],
    glossary: [
      ['Diagnosis', 'The identification of a disease or condition from its signs, symptoms and investigations.'],
      ['Prognosis', 'The likely course and outcome of a disease in an individual patient.'],
      ['Aetiology', 'The cause or set of causes of a disease or condition.'],
      ['Triage', 'The sorting of patients by urgency so that the most critical are treated first.']
    ]
  },
  'nursing': {
    general: ['Infection Prevention and Aseptic Technique', 'Patient Safety and Quality of Care', 'The Nursing Process and Care Planning', 'Therapeutic Communication', 'Medication Safety and the Rights of Administration', 'Health Education and Promotion', 'Documentation and Legal Aspects of Care', 'Cultural Safety in Kenyan Health Settings', 'Interprofessional Teamwork', 'Evidence-Based Nursing Practice', 'Community and Home-Based Care', 'Professional Development and the Nursing Council of Kenya'],
    matchers: [
      { re: /anatomy|physiology/i, topics: ['Body Organisation and Homeostasis', 'Systems Overview for Nursing Care', 'Common Structural and Functional Disorders', 'Applying Physiology to Vital Signs'] },
      { re: /fundamentals|nursing practice/i, topics: ['The Nursing Process: Assessment to Evaluation', 'Basic Nursing Procedures and Standard Precautions', 'Patient Hygiene, Comfort and Positioning', 'Vital Signs and Monitoring'] },
      { re: /pharmacology|drug/i, topics: ['Drug Classifications and Actions', 'Dosage Calculation and Safe Administration', 'The Rights of Medication Administration', 'Monitoring and Reporting Adverse Effects'] },
      { re: /medical.?surgical|adult health/i, topics: ['Pre- and Post-operative Nursing Care', 'Fluid and Electrolyte Management', 'Care of Patients with Respiratory and Cardiac Conditions', 'Pain Assessment and Management'] },
      { re: /maternal|midwif|obstetric/i, topics: ['Antenatal Care and Focused ANC in Kenya', 'Normal Labour and the Partograph', 'Postnatal and Newborn Care', 'Obstetric Emergencies and Referral'] },
      { re: /community health/i, topics: ['Primary Health Care and the Community Health Strategy', 'Community Diagnosis and Health Surveys', 'Immunisation and the KEPI Schedule', 'Health Education in Communities'] },
      { re: /mental health|psychiatric/i, topics: ['Therapeutic Relationships and Communication', 'Common Mental Disorders and Their Care', 'Mental Health Legislation in Kenya', 'Community Mental Health and Rehabilitation'] }
    ],
    contexts: ['the teaching wards of Kenyatta National Hospital', 'a busy county referral hospital in Nakuru', 'a rural dispensary in Makueni', 'a community health unit in Kibra, Nairobi', 'Mathari National Teaching and Referral Hospital', 'a faith-based health centre in Western Kenya'],
    glossary: [
      ['Nursing Process', 'The systematic five-step method — assessment, diagnosis, planning, implementation, evaluation — guiding patient care.'],
      ['Asepsis', 'Practices that prevent contamination and the spread of infection during care.'],
      ['Palliative Care', 'Care focused on relief of suffering and quality of life for patients with serious illness.'],
      ['Scope of Practice', 'The procedures and decisions a nurse is legally licensed to perform in Kenya.']
    ]
  },
  'engineering': {
    general: ['The Engineering Design Process and Standards', 'Engineering Drawing and Technical Communication', 'Materials Selection and Testing', 'Statics, Dynamics and Structural Reasoning', 'Measurement, Instrumentation and Calibration', 'Health, Safety and Environment in Engineering', 'Engineering Economics and Costing', 'Project Management for Engineers', 'Quality Assurance and Standards (KEBS)', 'Sustainable and Climate-Resilient Engineering', 'Professional Registration with the Engineers Board of Kenya', 'Innovation and Manufacturing in Kenya'],
    matchers: [
      { re: /mathematics/i, topics: ['Differential and Integral Calculus for Engineers', 'Linear Algebra and Matrices', 'Differential Equations and Modelling', 'Probability, Statistics and Numerical Methods'] },
      { re: /thermodynamic/i, topics: ['The Laws of Thermodynamics', 'Properties of Pure Substances', 'Power and Refrigeration Cycles', 'Heat Transfer Mechanisms'] },
      { re: /fluid/i, topics: ['Fluid Properties and Statics', 'Bernoulli and the Energy Equation', 'Flow Measurement and Pipe Networks', 'Pumps, Turbines and Open-Channel Flow'] },
      { re: /structural|strength|mechanics/i, topics: ['Stress, Strain and Elasticity', 'Shear Force and Bending Moment Diagrams', 'Deflection and Column Buckling', 'Design Loads and Safety Factors'] },
      { re: /circuit|electrical|electronic|power/i, topics: ['Circuit Laws and Network Theorems', 'AC Circuits and Three-Phase Systems', 'Semiconductor Devices and Amplifiers', 'Power Generation, Transmission and Distribution'] },
      { re: /surveying|geotechnical|soil|highway|concrete|construction/i, topics: ['Levelling and Traversing', 'Soil Classification and Compaction', 'Foundation Design Basics', 'Concrete Mix Design and Site Practice'] }
    ],
    contexts: ['the Standard Gauge Railway corridor', 'the Thiba Dam project in Kirinyaga County', 'the Olkaria geothermal fields near Naivasha', 'the Mombasa Port expansion works', 'a county roads upgrade in Machakos', 'the Konza Technopolis development'],
    glossary: [
      ['Factor of Safety', 'The ratio of a structure\u2019s capacity to the expected load, providing margin against failure.'],
      ['Tolerance', 'The permissible variation in a dimension or measurement.'],
      ['Load', 'Any force or demand applied to a structure, machine or system.'],
      ['Commissioning', 'The process of testing and handing over a completed engineering system for operation.']
    ]
  },
  'computing': {
    general: ['Problem-Solving and Algorithmic Thinking', 'Version Control and Collaborative Development', 'The Software Development Life Cycle', 'Databases and Information Management', 'Networks, the Internet and the Web', 'Cybersecurity Principles and Hygiene', 'Data Protection: Kenya\u2019s Data Protection Act 2019', 'Professional Ethics for Technologists', 'Cloud, Mobile and Emerging Platforms', 'User-Centred Design and Accessibility', 'Tech Entrepreneurship and the Silicon Savannah', 'Research and Innovation in Kenyan ICT'],
    matchers: [
      { re: /programming|python|java|object/i, topics: ['Variables, Control Structures and Functions', 'Data Types and Collections', 'Object-Oriented Design: Classes and Inheritance', 'Testing, Debugging and Documentation'] },
      { re: /data structures|algorithms/i, topics: ['Arrays, Linked Lists, Stacks and Queues', 'Trees, Graphs and Hashing', 'Sorting and Searching Algorithms', 'Complexity Analysis and Big-O Notation'] },
      { re: /database/i, topics: ['The Relational Model and Normalisation', 'SQL: Queries, Joins and Transactions', 'Database Design and ER Modelling', 'NoSQL and Modern Data Stores'] },
      { re: /network/i, topics: ['The OSI and TCP/IP Models', 'Addressing, Routing and Switching', 'Wireless and Mobile Networking', 'Network Security and Firewalls'] },
      { re: /operating systems/i, topics: ['Processes, Threads and Scheduling', 'Memory Management', 'File Systems and Storage', 'Virtualisation and Containers'] },
      { re: /software engineering|requirements|testing/i, topics: ['Requirements Engineering and Modelling', 'Software Architecture and Design Patterns', 'Testing Strategies and Quality Assurance', 'Agile Methods and DevOps'] },
      { re: /security|cryptograph|forensic/i, topics: ['Threats, Vulnerabilities and Risk', 'Cryptography: Symmetric and Public-Key', 'Authentication and Access Control', 'Incident Response and Digital Evidence'] },
      { re: /artificial intelligence|machine learning|data science|deep learning/i, topics: ['Supervised and Unsupervised Learning', 'Model Evaluation and Validation', 'Neural Networks and Representation Learning', 'Ethical and Responsible AI'] }
    ],
    contexts: ['Nairobi\u2019s iHub and the Silicon Savannah ecosystem', 'Konza Technopolis', 'a county government e-services rollout', 'the Central Bank of Kenya\u2019s payments infrastructure', 'a Kenyan fintech scaling M-PESA integrations', 'a university innovation hub in Eldoret'],
    glossary: [
      ['Algorithm', 'A finite, unambiguous step-by-step procedure for solving a problem.'],
      ['Abstraction', 'Hiding complexity behind a simpler interface so systems remain manageable.'],
      ['Latency', 'The delay between a request and its response in a system or network.'],
      ['Scalability', 'The ability of a system to handle growth in users, data or load.']
    ]
  },
  'business': {
    general: ['The Kenyan Business Environment', 'Forms of Business Ownership', 'Management Functions: Planning to Controlling', 'Financial Literacy for Managers', 'Marketing and Customer Value', 'Human Capital and Labour Relations', 'Business Law and Regulation', 'Ethics, Governance and Corporate Social Responsibility', 'Operations and Quality Management', 'Strategy and Competitive Advantage', 'Entrepreneurship and SME Development', 'E-Commerce and Digital Business in Kenya'],
    matchers: [
      { re: /accounting/i, topics: ['The Accounting Cycle and Double Entry', 'Preparation of Financial Statements', 'Cost Behaviour and Budgeting', 'Interpretation and Ratio Analysis'] },
      { re: /economic/i, topics: ['Demand, Supply and Market Equilibrium', 'Elasticity and Consumer Choice', 'National Income and Macroeconomic Policy', 'Money, Banking and Inflation in Kenya'] },
      { re: /marketing/i, topics: ['Segmentation, Targeting and Positioning', 'The Marketing Mix: from 4Ps to 7Ps', 'Consumer and Organisational Buying Behaviour', 'Digital and Social Media Marketing'] },
      { re: /human resource/i, topics: ['Human Resource Planning and Job Analysis', 'Recruitment, Selection and Induction', 'Training, Development and Performance Management', 'Kenyan Labour Law and Industrial Relations'] },
      { re: /procure|supply|logistic/i, topics: ['The Procurement Cycle and Tendering', 'The Public Procurement and Asset Disposal Act', 'Inventory Control and Warehousing', 'Supplier Relationships and Contract Management'] },
      { re: /finance|investment/i, topics: ['The Time Value of Money', 'Capital Budgeting Techniques', 'Sources of Business Finance in Kenya', 'Risk, Return and Portfolio Basics'] },
      { re: /strategic|management|organisation/i, topics: ['Strategic Analysis: SWOT and PESTEL', 'Corporate and Business-Level Strategy', 'Organisational Structure and Culture', 'Leadership, Change and Motivation'] }
    ],
    contexts: ['Nairobi\u2019s Central Business District traders', 'the Nairobi Securities Exchange', 'a manufacturing firm in the Athi River Export Processing Zone', 'a SACCO in Murang\u2019a County', 'the Mombasa port logistics corridor', 'a tech start-up in Westlands, Nairobi'],
    glossary: [
      ['Liquidity', 'The ease with which assets can be converted to cash without loss of value.'],
      ['Equity', 'The owners\u2019 residual claim on assets after liabilities are settled.'],
      ['Market Share', 'A firm\u2019s sales expressed as a percentage of total industry sales.'],
      ['Working Capital', 'Current assets minus current liabilities; the funds available for day-to-day operations.']
    ]
  },
  'education': {
    general: ['The Kenyan Education System and Its Reforms', 'The Competency-Based Curriculum (CBC)', 'Lesson Planning and Schemes of Work', 'Classroom Management and Positive Discipline', 'Assessment of and for Learning', 'Educational Psychology and Learner Development', 'Inclusive Education and Learner Diversity', 'Instructional Media and Educational Technology', 'Teacher Professionalism and the TSC', 'Guidance and Counselling in Schools', 'Educational Research and Evidence', 'School-Community Partnerships'],
    matchers: [
      { re: /psychology/i, topics: ['Learning Theories: Behaviourism to Constructivism', 'Motivation in the Classroom', 'Individual Differences and Intelligence', 'Adolescent Development and Behaviour'] },
      { re: /curriculum/i, topics: ['Curriculum Design Models', 'Syllabus Interpretation and Implementation', 'Curriculum Evaluation', 'CBC Strands, Sub-strands and Learning Outcomes'] },
      { re: /teaching method|pedagog|methodology/i, topics: ['Teacher-Centred and Learner-Centred Methods', 'Questioning and Discussion Techniques', 'Practical and Demonstration Methods', 'Micro-teaching and Lesson Critique'] },
      { re: /measurement|evaluation|assessment/i, topics: ['Validity, Reliability and Fairness', 'Test Construction and Marking Schemes', 'Continuous Assessment and Records', 'KNEC Examinations and Standards'] },
      { re: /child|early childhood|growth/i, topics: ['Domains of Child Development', 'Play-Based Learning', 'Early Literacy and Numeracy', 'Child Health, Nutrition and Protection'] },
      { re: /special needs|inclusive/i, topics: ['Categories of Special Needs', 'Assessment and Individualised Education Plans', 'Assistive Technology and Adaptations', 'Inclusive Classroom Practice in Kenya'] }
    ],
    contexts: ['a public primary school in Vihiga implementing CBC', 'a national secondary school in Nairobi', 'a teachers training college in Machakos', 'a rural day secondary school in Baringo', 'an inclusive education unit in a Kisumu school', 'the Kenya Institute of Curriculum Development'],
    glossary: [
      ['Pedagogy', 'The art and science of teaching — methods, strategies and relationships that support learning.'],
      ['Scaffolding', 'Temporary support that is gradually withdrawn as a learner gains independence.'],
      ['Formative Assessment', 'Assessment used during learning to give feedback and adjust teaching.'],
      ['Scheme of Work', 'A termly plan breaking the syllabus into teachable weekly units.']
    ]
  },
  'arts-soc': {
    general: ['The Social Sciences and Their Methods', 'Kenyan Society: Structure and Change', 'Colonialism, Independence and Nationhood', 'Devolution and County Governance', 'Poverty, Inequality and Social Policy', 'Gender and Social Inclusion', 'Urbanisation and Informal Settlements', 'Culture, Identity and Diversity', 'Research Ethics in the Social Sciences', 'Public Participation and Civic Engagement', 'Globalisation and Africa', 'Writing and Argumentation in the Social Sciences'],
    matchers: [
      { re: /sociolog/i, topics: ['Classical Theorists: Marx, Durkheim, Weber', 'Social Institutions and Socialisation', 'Stratification and Social Mobility', 'Deviance and Social Control'] },
      { re: /psycholog/i, topics: ['Schools of Psychological Thought', 'Sensation, Perception and Cognition', 'Theories of Personality', 'Psychological Assessment Basics'] },
      { re: /politic|government|policy/i, topics: ['The Constitution of Kenya 2010', 'Legislature, Executive and Judiciary', 'Elections, Parties and the IEBC', 'The Public Policy Process and Analysis'] },
      { re: /history/i, topics: ['Sources and Methods of History', 'Pre-Colonial Kenyan Societies', 'Colonial Rule and Resistance', 'Independent Kenya: 1963 to the Present'] },
      { re: /geograph/i, topics: ['Maps, Scale and Spatial Thinking', 'The Physical Landscapes of Kenya', 'Population and Settlement', 'Weather, Climate and Climate Change'] },
      { re: /criminolog|crime|policing/i, topics: ['Theories of Crime Causation', 'The Criminal Justice System in Kenya', 'Policing and the National Police Service', 'Corrections and Rehabilitation'] },
      { re: /social work|welfare|community/i, topics: ['Values and Ethics of Social Work', 'Casework, Group Work and Community Organisation', 'Child Protection Systems', 'Social Policy and the Safety Net'] }
    ],
    contexts: ['Nairobi County\u2019s informal settlements programme', 'a county public participation forum in Kisii', 'the Kenya National Bureau of Statistics census', 'a community baraza in Kilifi', 'the National Archives of Kenya', 'an NGO livelihood programme in Kibera'],
    glossary: [
      ['Socialisation', 'The lifelong process through which individuals learn the norms and values of their society.'],
      ['Devolution', 'The transfer of power and resources from national to county governments under the 2010 Constitution.'],
      ['Hypothesis', 'A testable statement predicting a relationship between variables.'],
      ['Culture', 'The shared beliefs, values, practices and artefacts of a group.']
    ]
  },
  'law': {
    general: ['Sources of Kenyan Law', 'The Court System and Legal Profession', 'Legal Research, Citation and Writing', 'Statutory Interpretation', 'Alternative Dispute Resolution', 'Constitutionalism and the Rule of Law', 'Devolution and County Legislation', 'Legal Ethics and Professional Responsibility', 'Access to Justice and Legal Aid', 'Law Reform and the Kenya Law Reform Commission', 'Regional Law: the EAC and International Obligations', 'Emerging Areas: ICT, Data and Environmental Law'],
    matchers: [
      { re: /constitution/i, topics: ['Supremacy and Structure of the 2010 Constitution', 'The Bill of Rights and Its Enforcement', 'Separation of Powers and Checks', 'Devolved Government and Revenue Sharing'] },
      { re: /contract/i, topics: ['Offer, Acceptance and Consideration', 'Capacity, Legality and Intention', 'Misrepresentation, Mistake and Duress', 'Breach, Discharge and Remedies'] },
      { re: /tort/i, topics: ['Negligence: Duty, Breach, Causation, Damage', 'Defences and Vicarious Liability', 'Nuisance, Trespass and Defamation', 'Remedies and Assessment of Damages'] },
      { re: /criminal/i, topics: ['Elements of a Crime: Actus Reus and Mens Rea', 'Offences Against the Person', 'Property Offences and the Penal Code', 'Criminal Procedure and Fair Trial Rights'] },
      { re: /land|property|conveyanc/i, topics: ['Tenure Systems and the Land Registration Act', 'Leases, Charges and Easements', 'The Conveyancing Process and Completion', 'Community Land and Historical Injustices'] },
      { re: /evidence|procedure/i, topics: ['Relevance, Admissibility and Burden of Proof', 'Witnesses and Examination-in-Chief', 'Hearsay and Its Exceptions', 'Civil and Criminal Procedure Rules'] },
      { re: /jurisprudence|legal theory/i, topics: ['Natural Law and Legal Positivism', 'Rights, Justice and Legal Reasoning', 'African Jurisprudence and Customary Law', 'Law, Morality and Social Change'] }
    ],
    contexts: ['the Milimani Law Courts, Nairobi', 'a county land registry in Nakuru', 'the Kenya Law Reports editorial process', 'a community land dispute in Laikipia', 'the Supreme Court of Kenya', 'a small claims court in Mombasa'],
    glossary: [
      ['Precedent', 'A prior judicial decision that guides or binds later courts under stare decisis.'],
      ['Plaintiff', 'The party who initiates a civil claim.'],
      ['Injunction', 'A court order compelling or restraining conduct.'],
      ['Ultra Vires', 'Acting beyond one\u2019s legal powers; such acts are invalid.']
    ]
  },
  'pure-sci': {
    general: ['The Scientific Method and Experimental Design', 'Laboratory Safety and Good Practice', 'Measurement, Units and Error Analysis', 'Data Handling and Scientific Graphing', 'Scientific Writing and Referencing', 'Ethics and Integrity in Research', 'Instrumentation and Calibration', 'Field Methods and Sampling', 'Science Communication to the Public', 'Commercialisation and Innovation', 'Kenyan Research Institutions: KEMRI, KALRO and the Universities', 'Sustainability and Green Science'],
    matchers: [
      { re: /chemistry/i, topics: ['Atomic Structure and Bonding', 'Stoichiometry and the Mole Concept', 'Acids, Bases and Equilibria', 'Organic Functional Groups and Reactions'] },
      { re: /physics|mechanics|optic|quantum|nuclear/i, topics: ['Vectors, Motion and Newton\u2019s Laws', 'Energy, Work and Power', 'Waves, Sound and Light', 'Electricity and Magnetism'] },
      { re: /biology|botany|zoology|ecolog/i, topics: ['Cell Structure and Function', 'Genetics and Inheritance', 'Evolution and Classification', 'Ecosystems and Energy Flow'] },
      { re: /microbiolog/i, topics: ['Microbial Structure and Growth', 'Sterilisation and Aseptic Technique', 'Microbial Genetics', 'Applied and Environmental Microbiology'] },
      { re: /geolog|mineral/i, topics: ['Minerals and the Rock Cycle', 'Plate Tectonics and the Rift Valley', 'Geological Maps and Structures', 'Kenya\u2019s Mineral Resources'] },
      { re: /biotechnolog|genetic|molecular/i, topics: ['DNA Structure, Replication and Repair', 'Recombinant DNA Technology', 'PCR and Gel Electrophoresis', 'Biosafety and Regulation in Kenya'] }
    ],
    contexts: ['a KEMRI laboratory in Nairobi', 'Lake Naivasha\u2019s research stations', 'a KALRO field trial site at Katumani', 'the National Museums of Kenya', 'a water quality laboratory in Kisumu', 'a university analytical laboratory in Eldoret'],
    glossary: [
      ['Hypothesis', 'A testable, falsifiable statement about a relationship between variables.'],
      ['Control', 'The baseline condition against which experimental results are compared.'],
      ['Precision', 'The closeness of repeated measurements to one another, distinct from accuracy.'],
      ['Peer Review', 'Independent expert evaluation of research before publication.']
    ]
  },
  'agriculture': {
    general: ['Kenyan Agriculture: Systems and Agro-Ecological Zones', 'Soil as a Production Resource', 'Crop and Livestock Enterprises', 'Farm Records and Budgeting', 'Agricultural Markets and Value Chains', 'Extension and Farmer Education', 'Climate Change and Climate-Smart Agriculture', 'Agricultural Policy and Institutions', 'Sustainable Land and Water Management', 'Agribusiness and Youth Employment', 'Research and Innovation: KALRO and the Universities', 'Food Security and Nutrition in Kenya'],
    matchers: [
      { re: /soil/i, topics: ['Soil Formation and the Profile', 'Soil Physical and Chemical Properties', 'Soil Fertility and Fertiliser Use', 'Erosion and Conservation'] },
      { re: /crop|agronom|horticult|plant/i, topics: ['Crop Growth Stages and Management', 'Tillage and Planting Systems', 'Pests, Diseases and Integrated Pest Management', 'Harvesting and Post-Harvest Handling'] },
      { re: /animal|livestock|dairy|poultry|pasture/i, topics: ['Breeds and Breeding Systems', 'Feeds, Feeding and Ration Formulation', 'Animal Health and Disease Control', 'Housing, Welfare and Handling'] },
      { re: /economics|agribusiness|marketing|finance/i, topics: ['Farm Business Analysis', 'Gross Margin Budgeting', 'Agricultural Marketing Channels', 'Agricultural Credit and Insurance'] },
      { re: /extension|rural/i, topics: ['Extension Approaches and Methods', 'Farmer Groups and Cooperatives', 'Communication and the Diffusion of Innovations', 'Participatory Rural Appraisal'] },
      { re: /irrigation|water|machinery|mechanis|engineering/i, topics: ['Irrigation Methods and Scheduling', 'Water Harvesting and Storage', 'Farm Power Sources', 'Machinery Selection and Maintenance'] }
    ],
    contexts: ['the Mwea Irrigation Scheme', 'the tea estates of Kericho', 'a dairy cooperative in Nyandarua', 'Lake Naivasha\u2019s floriculture greenhouses', 'ASAL livestock systems in Kajiado', 'the Galana-Kulalu food security project'],
    glossary: [
      ['Agronomy', 'The science of crop production and soil management.'],
      ['Hectarage', 'Land area measured in hectares under a given crop or use.'],
      ['Value Chain', 'The full set of activities from input supply to the final consumer.'],
      ['Hybrid', 'Offspring of two genetically distinct parents, often showing hybrid vigour.']
    ]
  },
  'built-env': {
    general: ['The Construction Industry in Kenya', 'Building Regulations and the Building Code', 'Drawings, Specifications and Bills of Quantities', 'Materials and Workmanship Standards', 'Site Organisation and Safety (DOSHS)', 'Procurement Methods and Contracts (NCA)', 'Measurement, Costing and Estimating', 'Project Planning and Scheduling', 'Professional Bodies: BORAQS, IQSK and AAK', 'Sustainable and Green Building', 'Infrastructure and County Development', 'Maintenance and Facilities Management'],
    matchers: [
      { re: /design|studio|architecture/i, topics: ['Design Principles: Form, Function, Context', 'Site Analysis and Brief Development', 'Design Communication and Presentation', 'Kenyan Vernacular and Contemporary Practice'] },
      { re: /construction|building/i, topics: ['Substructure and Foundations', 'Superstructure: Walls, Floors and Roofs', 'Finishes and Services Installation', 'Temporary Works and Scaffolding'] },
      { re: /structur/i, topics: ['Load Paths and Structural Systems', 'Reinforced Concrete Design Basics', 'Steel and Timber Design Basics', 'Structural Drawings and Detailing'] },
      { re: /survey|geodes|gis|photogramm/i, topics: ['Survey Instruments and Levelling', 'Traversing and Coordinate Systems', 'GNSS and Total Stations', 'Digital Mapping and GIS'] },
      { re: /quantity|measurement|estimat|cost/i, topics: ['The Standard Method of Measurement', 'Taking Off and Abstracting', 'Pricing and Rate Build-Up', 'Valuations and Final Accounts'] },
      { re: /planning|urban|housing/i, topics: ['The Planning System and Physical Planning Act', 'Land Use and Zoning', 'Urbanisation Trends in Kenya', 'Housing Policy and Affordable Housing'] }
    ],
    contexts: ['Nairobi\u2019s affordable housing programme', 'a high-rise site in Upper Hill, Nairobi', 'the Dongo Kundu bypass project', 'a county spatial plan process in Nyeri', 'the Lamu Port corridor works', 'a slum-upgrading project in Mukuru'],
    glossary: [
      ['Bill of Quantities', 'An itemised document quantifying works for tendering and payment.'],
      ['Tender', 'A contractor\u2019s formal offer to execute works for a stated price.'],
      ['Defects Liability Period', 'The period after completion during which the contractor must remedy defects.'],
      ['Variation', 'An authorised change to the contracted works, priced and instructed formally.']
    ]
  },
  'humanities-lang': {
    general: ['Language, Society and Identity in Kenya', 'The Study of Literature: Genres and Devices', 'Critical Reading and Textual Analysis', 'Academic and Creative Writing', 'The Oral Traditions of Kenyan Communities', 'Translation Across Kenyan Languages', 'Media, Communication and Society', 'Research Methods in the Humanities', 'Publishing and the Book Industry in Kenya', 'Language Policy: English, Kiswahili and Mother Tongues', 'Intercultural Competence', 'Digital Humanities and New Media'],
    matchers: [
      { re: /literature|poetry|novel|drama|literary/i, topics: ['Plot, Character and Setting', 'Poetic Devices and Prosody', 'Narrative Voice and Point of View', 'Themes, Context and Criticism'] },
      { re: /linguistic|phonetic|syntax|morphology|semantics/i, topics: ['Speech Sounds and Transcription', 'Word Formation and Morphological Processes', 'Sentence Structure and Constituency', 'Meaning: Sense, Reference and Pragmatics'] },
      { re: /kiswahili/i, topics: ['Historia na Ukuaji wa Kiswahili', 'Sarufi: Ngeli na Miundo ya Sentensi', 'Fasihi Simulizi na Andishi', 'Kiswahili katika Sanaa na Vyombo vya Habari'] },
      { re: /french|german|arabic|chinese|spanish/i, topics: ['Core Grammar and Sentence Patterns', 'Vocabulary Building Strategies', 'Listening and Speaking Practice', 'Reading and Translation Skills'] },
      { re: /journal|media|reporting|broadcast/i, topics: ['News Values and News Gathering', 'Interviewing and Source Verification', 'Writing for Print, Radio and Digital', 'Media Law, Ethics and the Media Council of Kenya'] },
      { re: /translation|interpretation/i, topics: ['Equivalence and Translation Theory', 'Techniques: from Literal to Free Translation', 'Interpreting Modes and Ethics', 'Terminology Management'] }
    ],
    contexts: ['a national newspaper newsroom in Nairobi', 'the Nairobi literary festival circuit', 'a county radio station in Kakamega', 'the Kenya National Theatre', 'a translation project for county assembly proceedings', 'a publishing house on Kijabe Street'],
    glossary: [
      ['Genre', 'A category of literary or artistic composition sharing style or subject matter.'],
      ['Phoneme', 'The smallest distinctive sound unit of a language.'],
      ['Register', 'A variety of language used for a particular purpose or social setting.'],
      ['Canon', 'The body of works regarded as central to a literary tradition.']
    ]
  },
  'creative-arts': {
    general: ['The Creative Economy in Kenya', 'Elements and Principles of Design', 'Visual Culture and Art History', 'Sketching, Observation and Visual Research', 'Digital Tools and Workflows', 'Portfolio Development', 'Client Briefs and Professional Practice', 'Copyright and Intellectual Property for Creatives', 'Marketing and Selling Creative Work', 'Collaboration and Creative Teams', 'Community and Socially-Engaged Arts', 'Exhibitions, Festivals and Audiences'],
    matchers: [
      { re: /drawing|illustration|painting/i, topics: ['Line, Shape and Value', 'Perspective and Composition', 'Colour Theory and Mixing', 'Figure and Life Drawing'] },
      { re: /design|graphic|typograph/i, topics: ['Layout, Grids and Visual Hierarchy', 'Typography: Classification and Use', 'Branding and Identity Systems', 'Print and Digital Production'] },
      { re: /music/i, topics: ['Rhythm, Melody and Harmony', 'Notation and Score Reading', 'Kenyan and African Musical Traditions', 'Performance Practice and Ensemble Skills'] },
      { re: /film|cinema|video/i, topics: ['Shot Types and Visual Grammar', 'Screenplay Structure and Storyboarding', 'Production Roles and Set Etiquette', 'Editing and the Post-Production Workflow'] },
      { re: /theatre|drama|perform|acting|dance/i, topics: ['Actor Training: Voice and Movement', 'Improvisation and Devising', 'Stagecraft and Production Design', 'Kenyan Theatre: from Travelling Theatre to Contemporary Stages'] },
      { re: /fashion|textile|garment/i, topics: ['Fashion Illustration and the Design Process', 'Pattern Drafting and Cutting', 'Textiles: from Fibres to Fabrics', 'The Kenyan Fashion Industry'] }
    ],
    contexts: ['the Kenya National Theatre, Nairobi', 'a film production on location in Naivasha', 'Nairobi Design Week', 'a fashion atelier in Kileleshwa', 'a music festival stage in Nairobi', 'an animation studio in Nairobi\u2019s creative district'],
    glossary: [
      ['Portfolio', 'A curated collection of an artist\u2019s best work presented to clients or institutions.'],
      ['Composition', 'The arrangement of elements within a creative work.'],
      ['Curate', 'To select, organise and present works for exhibition or performance.'],
      ['Commission', 'A paid request to produce a specific creative work.']
    ]
  },
  'health-env': {
    general: ['Environment and Health Interactions', 'Kenya\u2019s Public Health System and Devolution', 'Disease Patterns and Surveillance', 'Water, Sanitation and Hygiene (WASH)', 'Food Safety Along the Value Chain', 'Occupational Health and Workplace Safety', 'Waste Management and Pollution Control', 'Climate Change and Health', 'Health Promotion and Behaviour Change', 'Emergency Preparedness and Response', 'Environmental Law: EMCA and NEMA', 'Data for Health Decision-Making'],
    matchers: [
      { re: /epidemiolog/i, topics: ['Measures of Disease Frequency', 'Study Designs: from Cohort to Case-Control', 'Screening and Surveillance Systems', 'The Steps of an Outbreak Investigation'] },
      { re: /biostatistic|statistics/i, topics: ['Health Data Types and Sources', 'Summary Statistics and Presentation', 'Probability Distributions in Health Data', 'Hypothesis Testing and Confidence Intervals'] },
      { re: /environmental health|sanitation|water/i, topics: ['The Safe Water Chain: from Source to Storage', 'Excreta Disposal Technologies', 'Hygiene Promotion Approaches', 'WASH in Emergencies'] },
      { re: /occupational/i, topics: ['Workplace Hazard Identification', 'Risk Assessment and the Control Hierarchy', 'Kenya\u2019s OSHA 2007 Requirements', 'Health Surveillance of Workers'] },
      { re: /climate|sustainab/i, topics: ['Climate Science Basics', 'The Health Co-benefits of Mitigation', 'Adaptation Planning in the Counties', 'Kenya\u2019s Climate Commitments'] },
      { re: /disaster|emergency/i, topics: ['The Disaster Risk Management Cycle', 'Incident Command and Coordination', 'Humanitarian Standards (Sphere)', 'Community Resilience Building'] }
    ],
    contexts: ['a county public health department in Machakos', 'the Nairobi River pollution control efforts', 'a cholera outbreak response in a lakeside county', 'a flower farm occupational health programme in Naivasha', 'drought response coordination in Garissa', 'a market sanitation programme in Mombasa'],
    glossary: [
      ['Incidence', 'The number of new cases of a disease in a population over a defined period.'],
      ['Prevalence', 'The total number of existing cases of a disease at a point in time.'],
      ['Vector', 'An organism, such as a mosquito, that transmits disease between hosts.'],
      ['Risk Assessment', 'The systematic identification and evaluation of hazards and their likely harm.']
    ]
  },
  'math-stats': {
    general: ['Mathematical Reasoning and Proof', 'Notation, Sets and Logic', 'Functions and Their Properties', 'Mathematical Software and Computing', 'Data Collection and Quality', 'Statistical Presentation and Reporting', 'Professional Practice for Statisticians', 'Applications in Finance, Health and Agriculture', 'Kenyan Official Statistics: the KNBS', 'Operations Research and Optimisation', 'Mathematical Writing and LaTeX', 'Careers: Actuarial Science, Data Science and Academia'],
    matchers: [
      { re: /calculus|analysis|differential/i, topics: ['Limits and Continuity', 'Differentiation and Applications', 'Integration Techniques', 'Sequences and Series'] },
      { re: /algebra|linear/i, topics: ['Matrices and Determinants', 'Vector Spaces and Transformations', 'Systems of Linear Equations', 'Eigenvalues and Eigenvectors'] },
      { re: /probability/i, topics: ['Sample Spaces and Events', 'Conditional Probability and Bayes\u2019 Theorem', 'Random Variables and Expectation', 'Common Probability Distributions'] },
      { re: /inference|regression|statistic/i, topics: ['Estimation and Confidence Intervals', 'Hypothesis Testing', 'Correlation and Simple Regression', 'Analysis of Variance'] },
      { re: /numerical/i, topics: ['Errors and Approximations', 'Root-Finding Methods', 'Interpolation and Curve Fitting', 'Numerical Integration'] },
      { re: /time series|forecast|sampling|survey/i, topics: ['Components of a Time Series', 'Smoothing and Decomposition', 'Survey Design and Sampling Frames', 'Sampling Schemes: from SRS to Stratified'] }
    ],
    contexts: ['the Kenya National Bureau of Statistics', 'a bank\u2019s analytics team in Nairobi', 'an insurance company\u2019s actuarial department', 'a county health data unit', 'an agricultural survey in the Rift Valley', 'a polling organisation ahead of a general election'],
    glossary: [
      ['Variable', 'A characteristic that can take different values across observations.'],
      ['Parameter', 'A numerical characteristic of a population, usually estimated from samples.'],
      ['Proof', 'A logically rigorous argument establishing a mathematical statement.'],
      ['Model', 'A simplified mathematical representation of a real-world process.']
    ]
  }
};

module.exports = {
  SECTIONS,
  INTRO_TEMPLATES,
  ASPECT_TEMPLATES,
  STUDY_TIPS,
  CASE_TEMPLATES,
  OUTLINE_STEPS,
  SELFCHECK_TEMPLATES,
  REVISION_POINTERS,
  GENERIC_TOPICS,
  COMMON_MATCHERS,
  TRACKS
};
