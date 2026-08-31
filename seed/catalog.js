/**
 * ELIMUmaterial - Master catalog of Kenyan universities, faculties, courses, and units.
 * Curated from public information about Kenyan public and private universities
 * (Commission for University Education, KUCCPS, and university websites).
 * Unit counts intentionally match real semester loads (nursing ≈ 9 units/semester,
 * arts & sociology ≈ 7 units, engineering ≈ 8 units, etc.).
 *
 * Expanded roster covers every chartered Kenyan public + private university and
 * a comprehensive spread of degree programmes across all KUCCPS clusters —
 * arts, humanities, languages (English Literature, Kiswahili, French, German,
 * Music, Theology, Philosophy, Linguistics), sciences, engineering, computing,
 * business, education, agriculture, medicine, architecture, environment, etc.
 */

const universities = [
  // ---------- Chartered PUBLIC universities ----------
  { id: 'uon',      shortName: 'UoN',    name: 'University of Nairobi',                                       location: 'Nairobi' },
  { id: 'ku',       shortName: 'KU',     name: 'Kenyatta University',                                         location: 'Nairobi' },
  { id: 'jkuat',    shortName: 'JKUAT',  name: 'Jomo Kenyatta University of Agriculture and Technology',      location: 'Kiambu' },
  { id: 'moi',      shortName: 'MU',     name: 'Moi University',                                              location: 'Eldoret' },
  { id: 'egerton',  shortName: 'EU',     name: 'Egerton University',                                          location: 'Nakuru' },
  { id: 'maseno',   shortName: 'MSU',    name: 'Maseno University',                                           location: 'Kisumu' },
  { id: 'mmust',    shortName: 'MMUST',  name: 'Masinde Muliro University of Science and Technology',         location: 'Kakamega' },
  { id: 'tuk',      shortName: 'TUK',    name: 'Technical University of Kenya',                               location: 'Nairobi' },
  { id: 'tum',      shortName: 'TUM',    name: 'Technical University of Mombasa',                             location: 'Mombasa' },
  { id: 'dkut',     shortName: 'DeKUT',  name: 'Dedan Kimathi University of Technology',                      location: 'Nyeri' },
  { id: 'chuka',    shortName: 'CU',     name: 'Chuka University',                                            location: 'Chuka' },
  { id: 'laikipia', shortName: 'LU',     name: 'Laikipia University',                                         location: 'Nyahururu' },
  { id: 'seku',     shortName: 'SEKU',   name: 'South Eastern Kenya University',                              location: 'Kitui' },
  { id: 'kisii',    shortName: 'KSU',    name: 'Kisii University',                                            location: 'Kisii' },
  { id: 'mmu',      shortName: 'MMU',    name: 'Multimedia University of Kenya',                              location: 'Nairobi' },
  { id: 'kabianga', shortName: 'UoK',    name: 'University of Kabianga',                                      location: 'Kericho' },
  { id: 'karatina', shortName: 'KarU',   name: 'Karatina University',                                         location: 'Karatina' },
  { id: 'meru',     shortName: 'MUST',   name: 'Meru University of Science and Technology',                   location: 'Meru' },
  { id: 'kyu',      shortName: 'KyU',    name: 'Kirinyaga University',                                        location: 'Kerugoya' },
  { id: 'pu',       shortName: 'PU',     name: 'Pwani University',                                            location: 'Kilifi' },
  { id: 'muranga',  shortName: 'MUT',    name: 'Murang\u2019a University of Technology',                      location: 'Murang\u2019a' },
  { id: 'machakos', shortName: 'MksU',   name: 'Machakos University',                                         location: 'Machakos' },
  { id: 'uoeld',    shortName: 'UoE',    name: 'University of Eldoret',                                       location: 'Eldoret' },
  { id: 'kibabii',  shortName: 'KIBU',   name: 'Kibabii University',                                          location: 'Bungoma' },
  { id: 'mmarau',   shortName: 'MMARAU', name: 'Maasai Mara University',                                      location: 'Narok' },
  { id: 'cuk',      shortName: 'CUK',    name: 'The Co-operative University of Kenya',                        location: 'Nairobi' },
  { id: 'rongo',    shortName: 'RU',     name: 'Rongo University',                                            location: 'Rongo' },
  { id: 'garissa',  shortName: 'GAU',    name: 'Garissa University',                                          location: 'Garissa' },
  { id: 'jooust',   shortName: 'JOOUST', name: 'Jaramogi Oginga Odinga University of Science and Technology', location: 'Bondo' },
  { id: 'ttu',      shortName: 'TTU',    name: 'Taita Taveta University',                                     location: 'Voi' },
  { id: 'tharaka',  shortName: 'THU',    name: 'Tharaka University',                                          location: 'Tharaka' },
  { id: 'embu',     shortName: 'UoEm',   name: 'University of Embu',                                          location: 'Embu' },
  { id: 'tmuc',     shortName: 'TMUC',   name: 'Tom Mboya University',                                        location: 'Homa Bay' },
  { id: 'kafu',     shortName: 'KAFU',   name: 'Kaimosi Friends University',                                  location: 'Vihiga' },
  { id: 'alupe',    shortName: 'AU',     name: 'Alupe University',                                            location: 'Busia' },
  { id: 'bomet',    shortName: 'BomU',   name: 'Bomet University',                                            location: 'Bomet' },

  // ---------- Chartered PRIVATE universities ----------
  { id: 'mku',           shortName: 'MKU',     name: 'Mount Kenya University',                          location: 'Thika' },
  { id: 'daystar',       shortName: 'DU',      name: 'Daystar University',                              location: 'Nairobi' },
  { id: 'strathmore',    shortName: 'SU',      name: 'Strathmore University',                           location: 'Nairobi' },
  { id: 'usiu',          shortName: 'USIU',    name: 'United States International University Africa',  location: 'Nairobi' },
  { id: 'cuea',          shortName: 'CUEA',    name: 'Catholic University of Eastern Africa',           location: 'Nairobi' },
  { id: 'kabarak',       shortName: 'KABU',    name: 'Kabarak University',                              location: 'Nakuru' },
  { id: 'kemu',          shortName: 'KeMU',    name: 'Kenya Methodist University',                      location: 'Meru' },
  { id: 'anu',           shortName: 'ANU',     name: 'Africa Nazarene University',                      location: 'Nairobi' },
  { id: 'riara',         shortName: 'RiU',     name: 'Riara University',                                location: 'Nairobi' },
  { id: 'zetech',        shortName: 'ZU',      name: 'Zetech University',                               location: 'Nairobi' },
  { id: 'ueab',          shortName: 'UEAB',    name: 'University of Eastern Africa, Baraton',           location: 'Nandi' },
  { id: 'scott',         shortName: 'SCU',     name: 'Scott Christian University',                      location: 'Machakos' },
  { id: 'pacu',          shortName: 'PACU',    name: 'Pan Africa Christian University',                 location: 'Nairobi' },
  { id: 'spu',           shortName: 'SPU',     name: 'St. Paul\u2019s University',                      location: 'Limuru' },
  { id: 'aiu',           shortName: 'AIU',     name: 'Africa International University',                 location: 'Nairobi' },
  { id: 'kheu',          shortName: 'KHEU',    name: 'Kenya Highlands Evangelical University',          location: 'Kericho' },
  { id: 'gluk',          shortName: 'GLUK',    name: 'Great Lakes University of Kisumu',                location: 'Kisumu' },
  { id: 'kca',           shortName: 'KCAU',    name: 'KCA University',                                  location: 'Nairobi' },
  { id: 'kageast',       shortName: 'KAGE',    name: 'KAG East University',                             location: 'Nairobi' },
  { id: 'umma',          shortName: 'UU',      name: 'Umma University',                                 location: 'Kajiado' },
  { id: 'pueaa',         shortName: 'PUEA',    name: 'Presbyterian University of East Africa',          location: 'Kiambu' },
  { id: 'aku',           shortName: 'AKU',     name: 'Aga Khan University',                             location: 'Nairobi' },
  { id: 'kwust',         shortName: 'KWUST',   name: 'Kiriri Women\u2019s University of Science and Technology', location: 'Nairobi' },
  { id: 'teau',          shortName: 'TEAU',    name: 'The East African University',                     location: 'Kajiado' },
  { id: 'lukenya',       shortName: 'LkU',     name: 'Lukenya University',                              location: 'Machakos' },
  { id: 'mua',           shortName: 'MUA',     name: 'Management University of Africa',                 location: 'Nairobi' },
  { id: 'tangaza',       shortName: 'TU',      name: 'Tangaza University',                              location: 'Nairobi' },
  { id: 'iuk',           shortName: 'IUK',     name: 'Islamic University of Kenya',                     location: 'Nairobi' },
  { id: 'uzima',         shortName: 'UzU',     name: 'Uzima University',                                location: 'Kisumu' },
  { id: 'gretsa',        shortName: 'GrU',     name: 'Gretsa University',                               location: 'Thika' },
  { id: 'amref',         shortName: 'AmIU',    name: 'Amref International University',                  location: 'Nairobi' }
];

const faculties = [
  { id: 'fac-med',   name: 'Faculty of Health Sciences & Medicine' },
  { id: 'fac-eng',   name: 'Faculty of Engineering' },
  { id: 'fac-sci',   name: 'Faculty of Science' },
  { id: 'fac-ict',   name: 'Faculty of Computing & Information Technology' },
  { id: 'fac-biz',   name: 'Faculty of Business & Economics' },
  { id: 'fac-edu',   name: 'Faculty of Education' },
  { id: 'fac-ssh',   name: 'Faculty of Social Sciences & Humanities' },
  { id: 'fac-law',   name: 'Faculty of Law' },
  { id: 'fac-agri',  name: 'Faculty of Agriculture & Veterinary Sciences' },
  { id: 'fac-arch',  name: 'Faculty of Architecture & Built Environment' },
  { id: 'fac-arts',  name: 'Faculty of Arts, Design & Communication' },
  { id: 'fac-env',   name: 'Faculty of Environmental Studies' },
  { id: 'fac-lang',  name: 'Faculty of Languages, Literature & Linguistics' },
  { id: 'fac-theo',  name: 'Faculty of Theology & Religious Studies' },
  { id: 'fac-hosp',  name: 'Faculty of Hospitality, Tourism & Leisure' },
  { id: 'fac-music', name: 'Faculty of Music & Performing Arts' }
];

// Helper to build units quickly
const U = (code, name, pages = 22) => ({ code, name, pages });

const courses = [
  // ============= HEALTH SCIENCES =============
  {
    id: 'bsn', code: 'BSN', name: 'Bachelor of Science in Nursing', facultyId: 'fac-med', duration: '4 years',
    units: [
      U('NUR101','Human Anatomy & Physiology I'),
      U('NUR102','Fundamentals of Nursing Practice'),
      U('NUR103','Medical Microbiology & Parasitology'),
      U('NUR104','Biochemistry for Nurses'),
      U('NUR105','Community Health Nursing I'),
      U('NUR106','Pharmacology & Drug Administration'),
      U('NUR107','Medical\u2013Surgical Nursing'),
      U('NUR108','Maternal & Child Health Nursing'),
      U('NUR109','Mental Health & Psychiatric Nursing')
    ]
  },
  {
    id: 'mbchb', code: 'MBChB', name: 'Bachelor of Medicine & Bachelor of Surgery', facultyId: 'fac-med', duration: '6 years',
    units: [
      U('MED101','Gross Human Anatomy'), U('MED102','Medical Physiology'),
      U('MED103','Medical Biochemistry'), U('MED104','Histology & Embryology'),
      U('MED105','Pathology'), U('MED106','Microbiology & Immunology'),
      U('MED107','Pharmacology'), U('MED108','Community Medicine'),
      U('MED109','Behavioural Sciences'), U('MED110','Medical Ethics')
    ]
  },
  {
    id: 'pharm', code: 'BPharm', name: 'Bachelor of Pharmacy', facultyId: 'fac-med', duration: '5 years',
    units: [
      U('PHA101','Pharmaceutical Chemistry I'), U('PHA102','Pharmaceutics I'),
      U('PHA103','Pharmacognosy'), U('PHA104','Human Anatomy & Physiology'),
      U('PHA105','Pharmacology I'), U('PHA106','Biopharmaceutics'),
      U('PHA107','Clinical Pharmacy'), U('PHA108','Pharmaceutical Microbiology')
    ]
  },
  {
    id: 'clinmed', code: 'BClinMed', name: 'Bachelor of Clinical Medicine', facultyId: 'fac-med', duration: '4 years',
    units: [
      U('CLM101','Applied Human Anatomy'), U('CLM102','Physiology'),
      U('CLM103','Clinical Pathology'), U('CLM104','Internal Medicine'),
      U('CLM105','Paediatrics'), U('CLM106','Obstetrics & Gynaecology'),
      U('CLM107','General Surgery'), U('CLM108','Public Health')
    ]
  },
  {
    id: 'phealth', code: 'BPH', name: 'Bachelor of Public Health', facultyId: 'fac-med', duration: '4 years',
    units: [
      U('PBH101','Epidemiology'), U('PBH102','Biostatistics for Health'),
      U('PBH103','Environmental Health'), U('PBH104','Health Promotion & Education'),
      U('PBH105','Occupational Health & Safety'), U('PBH106','Health Systems Management'),
      U('PBH107','Global Health'), U('PBH108','Nutrition & Public Health')
    ]
  },
  {
    id: 'bds-dent', code: 'BDenS', name: 'Bachelor of Dental Surgery', facultyId: 'fac-med', duration: '5 years',
    units: [
      U('DEN101','Dental Anatomy & Histology'), U('DEN102','Oral Biology'),
      U('DEN103','Oral Pathology'), U('DEN104','Preventive & Community Dentistry'),
      U('DEN105','Operative Dentistry'), U('DEN106','Periodontology'),
      U('DEN107','Oral & Maxillofacial Surgery'), U('DEN108','Orthodontics')
    ]
  },
  {
    id: 'bmls', code: 'BMLS', name: 'Bachelor of Medical Laboratory Sciences', facultyId: 'fac-med', duration: '4 years',
    units: [
      U('MLS101','General Human Anatomy'), U('MLS102','Cell Biology & Genetics'),
      U('MLS103','Clinical Chemistry'), U('MLS104','Haematology & Blood Transfusion'),
      U('MLS105','Medical Microbiology'), U('MLS106','Medical Parasitology'),
      U('MLS107','Histopathology & Cytology'), U('MLS108','Laboratory Management')
    ]
  },
  {
    id: 'bnut', code: 'BSc-Nut', name: 'Bachelor of Science in Nutrition & Dietetics', facultyId: 'fac-med', duration: '4 years',
    units: [
      U('NUT101','Principles of Human Nutrition'), U('NUT102','Food Science'),
      U('NUT103','Community Nutrition'), U('NUT104','Clinical Dietetics'),
      U('NUT105','Nutritional Biochemistry'), U('NUT106','Food Service Management'),
      U('NUT107','Maternal & Child Nutrition'), U('NUT108','Nutrition Research Methods')
    ]
  },
  {
    id: 'brad', code: 'BSc-Rad', name: 'Bachelor of Science in Medical Imaging & Radiography', facultyId: 'fac-med', duration: '4 years',
    units: [
      U('RAD101','Radiographic Anatomy'), U('RAD102','Radiation Physics'),
      U('RAD103','Radiographic Techniques'), U('RAD104','Radiation Protection'),
      U('RAD105','Ultrasound Imaging'), U('RAD106','CT & MRI Physics'),
      U('RAD107','Nuclear Medicine'), U('RAD108','Radiographic Pathology')
    ]
  },
  {
    id: 'bphysio', code: 'BSc-Physio', name: 'Bachelor of Science in Physiotherapy', facultyId: 'fac-med', duration: '4 years',
    units: [
      U('PHY201','Functional Anatomy'), U('PHY202','Kinesiology'),
      U('PHY203','Electrotherapy'), U('PHY204','Musculoskeletal Physiotherapy'),
      U('PHY205','Neurological Physiotherapy'), U('PHY206','Cardiopulmonary Physiotherapy'),
      U('PHY207','Paediatric Physiotherapy'), U('PHY208','Community-Based Rehabilitation')
    ]
  },
  {
    id: 'boptom', code: 'BSc-Opt', name: 'Bachelor of Science in Optometry & Vision Science', facultyId: 'fac-med', duration: '5 years',
    units: [
      U('OPT101','Ocular Anatomy & Physiology'), U('OPT102','Geometric Optics'),
      U('OPT103','Visual Optics'), U('OPT104','Contact Lens Practice'),
      U('OPT105','Ocular Pharmacology'), U('OPT106','Paediatric Optometry'),
      U('OPT107','Low Vision Rehabilitation'), U('OPT108','Community Eye Care')
    ]
  },

  // ============= ENGINEERING =============
  {
    id: 'bce', code: 'BCE', name: 'Bachelor of Science in Civil Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('CIV101','Engineering Mathematics I'), U('CIV102','Engineering Drawing'),
      U('CIV103','Mechanics of Materials'), U('CIV104','Fluid Mechanics'),
      U('CIV105','Structural Analysis'), U('CIV106','Geotechnical Engineering'),
      U('CIV107','Highway Engineering'), U('CIV108','Reinforced Concrete Design')
    ]
  },
  {
    id: 'bee', code: 'BEE', name: 'Bachelor of Science in Electrical & Electronic Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('EEE101','Circuit Analysis'), U('EEE102','Electromagnetic Fields'),
      U('EEE103','Digital Electronics'), U('EEE104','Power Systems'),
      U('EEE105','Control Systems'), U('EEE106','Signals & Systems'),
      U('EEE107','Microprocessors'), U('EEE108','Communication Systems')
    ]
  },
  {
    id: 'bme', code: 'BME', name: 'Bachelor of Science in Mechanical Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('MEC101','Thermodynamics'), U('MEC102','Fluid Mechanics'),
      U('MEC103','Machine Design'), U('MEC104','Manufacturing Processes'),
      U('MEC105','Materials Science'), U('MEC106','Dynamics of Machines'),
      U('MEC107','Heat Transfer'), U('MEC108','Mechatronics')
    ]
  },
  {
    id: 'bche', code: 'BChE', name: 'Bachelor of Science in Chemical Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('CHE101','Chemical Engineering Thermodynamics'), U('CHE102','Transport Phenomena'),
      U('CHE103','Unit Operations'), U('CHE104','Chemical Reaction Engineering'),
      U('CHE105','Process Control'), U('CHE106','Plant Design'),
      U('CHE107','Industrial Safety'), U('CHE108','Biochemical Engineering')
    ]
  },
  {
    id: 'baero', code: 'BAero', name: 'Bachelor of Science in Aeronautical Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('AER101','Introduction to Aeronautics'), U('AER102','Aerodynamics I'),
      U('AER103','Aircraft Structures'), U('AER104','Aircraft Propulsion'),
      U('AER105','Flight Mechanics'), U('AER106','Avionics'),
      U('AER107','Aerospace Materials'), U('AER108','Aircraft Maintenance Engineering')
    ]
  },
  {
    id: 'bagric-eng', code: 'BAgE', name: 'Bachelor of Science in Agricultural & Biosystems Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('ABE101','Farm Power & Machinery'), U('ABE102','Soil & Water Engineering'),
      U('ABE103','Post-Harvest Engineering'), U('ABE104','Irrigation & Drainage'),
      U('ABE105','Farm Structures'), U('ABE106','Bioprocess Engineering'),
      U('ABE107','Rural Electrification'), U('ABE108','Land Surveying for Agriculture')
    ]
  },
  {
    id: 'bmine', code: 'BMinE', name: 'Bachelor of Science in Mining & Mineral Processing Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('MIN101','Introduction to Mining'), U('MIN102','Rock Mechanics'),
      U('MIN103','Mineral Processing'), U('MIN104','Surface Mining Methods'),
      U('MIN105','Underground Mining Methods'), U('MIN106','Mine Ventilation'),
      U('MIN107','Mine Economics'), U('MIN108','Environmental Aspects of Mining')
    ]
  },
  {
    id: 'bpetro', code: 'BPetE', name: 'Bachelor of Science in Petroleum Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('PET101','Petroleum Geology'), U('PET102','Reservoir Engineering'),
      U('PET103','Drilling Engineering'), U('PET104','Production Engineering'),
      U('PET105','Well Logging'), U('PET106','Petroleum Economics'),
      U('PET107','Natural Gas Engineering'), U('PET108','HSE in Oil & Gas')
    ]
  },
  {
    id: 'btele', code: 'BTelE', name: 'Bachelor of Science in Telecommunications & Information Engineering', facultyId: 'fac-eng', duration: '5 years',
    units: [
      U('TEL101','Signals & Systems'), U('TEL102','Analogue & Digital Communication'),
      U('TEL103','Antennas & Wave Propagation'), U('TEL104','Optical Fibre Communication'),
      U('TEL105','Wireless & Mobile Networks'), U('TEL106','Satellite Communication'),
      U('TEL107','Network Planning'), U('TEL108','Broadcast Engineering')
    ]
  },

  // ============= COMPUTING & IT =============
  {
    id: 'bcs', code: 'BSC-CS', name: 'Bachelor of Science in Computer Science', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('CSC101','Introduction to Programming (Python)'),
      U('CSC102','Discrete Mathematics'),
      U('CSC103','Data Structures & Algorithms'),
      U('CSC104','Computer Organization & Architecture'),
      U('CSC105','Object-Oriented Programming (Java)'),
      U('CSC106','Database Systems'),
      U('CSC107','Operating Systems'),
      U('CSC108','Software Engineering'),
      U('CSC109','Computer Networks'),
      U('CSC110','Artificial Intelligence')
    ]
  },
  {
    id: 'bit', code: 'BSC-IT', name: 'Bachelor of Science in Information Technology', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('BIT101','IT Fundamentals'), U('BIT102','Web Development'),
      U('BIT103','Systems Analysis & Design'), U('BIT104','Database Management'),
      U('BIT105','Networking Essentials'), U('BIT106','Cyber Security'),
      U('BIT107','Cloud Computing'), U('BIT108','Mobile App Development'),
      U('BIT109','IT Project Management')
    ]
  },
  {
    id: 'bse', code: 'BSE', name: 'Bachelor of Science in Software Engineering', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('SEN101','Software Requirements Engineering'),
      U('SEN102','Software Design & Architecture'),
      U('SEN103','Human\u2013Computer Interaction'),
      U('SEN104','Software Testing & QA'),
      U('SEN105','Agile & DevOps'),
      U('SEN106','Enterprise Application Development'),
      U('SEN107','Web Systems & Technologies'),
      U('SEN108','Software Project Management')
    ]
  },
  {
    id: 'bds', code: 'BDS', name: 'Bachelor of Science in Data Science & Analytics', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('DSC101','Foundations of Data Science'),
      U('DSC102','Statistical Computing with R'),
      U('DSC103','Machine Learning'),
      U('DSC104','Data Visualization'),
      U('DSC105','Big Data Technologies'),
      U('DSC106','Deep Learning'),
      U('DSC107','Data Ethics & Governance'),
      U('DSC108','Business Analytics')
    ]
  },
  {
    id: 'bcyber', code: 'BCyber', name: 'Bachelor of Science in Cyber Security', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('CYB101','Introduction to Cyber Security'),
      U('CYB102','Cryptography'),
      U('CYB103','Network Security'),
      U('CYB104','Ethical Hacking & Penetration Testing'),
      U('CYB105','Digital Forensics'),
      U('CYB106','Security Governance & Risk'),
      U('CYB107','Cloud & IoT Security'),
      U('CYB108','Incident Response')
    ]
  },
  {
    id: 'binfo', code: 'BIS', name: 'Bachelor of Science in Information Systems', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('BIS101','Fundamentals of Information Systems'),
      U('BIS102','Business Process Modelling'),
      U('BIS103','Enterprise Resource Planning'),
      U('BIS104','Systems Integration'),
      U('BIS105','IT Governance & Compliance'),
      U('BIS106','Decision Support Systems'),
      U('BIS107','Knowledge Management'),
      U('BIS108','E-Business Systems')
    ]
  },
  {
    id: 'bbis', code: 'BBIT', name: 'Bachelor of Business Information Technology', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('BBI101','IT for Business'), U('BBI102','Object-Oriented Programming'),
      U('BBI103','Business Systems Analysis'), U('BBI104','Database Applications'),
      U('BBI105','E-Commerce'), U('BBI106','Business Intelligence'),
      U('BBI107','IT Entrepreneurship'), U('BBI108','Enterprise Systems')
    ]
  },
  {
    id: 'bailm', code: 'BAIML', name: 'Bachelor of Science in Artificial Intelligence & Machine Learning', facultyId: 'fac-ict', duration: '4 years',
    units: [
      U('AIM101','Foundations of AI'), U('AIM102','Machine Learning'),
      U('AIM103','Deep Learning'), U('AIM104','Natural Language Processing'),
      U('AIM105','Computer Vision'), U('AIM106','Reinforcement Learning'),
      U('AIM107','AI Ethics & Society'), U('AIM108','AI Systems Deployment')
    ]
  },

  // ============= BUSINESS =============
  {
    id: 'bcom', code: 'BCom', name: 'Bachelor of Commerce', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('BCM101','Principles of Accounting'), U('BCM102','Business Law'),
      U('BCM103','Microeconomics'), U('BCM104','Business Communication'),
      U('BCM105','Principles of Management'), U('BCM106','Business Statistics'),
      U('BCM107','Marketing Principles'), U('BCM108','Financial Management')
    ]
  },
  {
    id: 'bba', code: 'BBA', name: 'Bachelor of Business Administration', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('BBA101','Introduction to Business'), U('BBA102','Organizational Behaviour'),
      U('BBA103','Human Resource Management'), U('BBA104','Operations Management'),
      U('BBA105','Strategic Management'), U('BBA106','Entrepreneurship'),
      U('BBA107','Corporate Finance'), U('BBA108','International Business')
    ]
  },
  {
    id: 'becon', code: 'BEcon', name: 'Bachelor of Arts in Economics', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('ECO101','Microeconomic Theory'), U('ECO102','Macroeconomic Theory'),
      U('ECO103','Mathematics for Economists'), U('ECO104','Econometrics'),
      U('ECO105','Development Economics'), U('ECO106','Public Finance'),
      U('ECO107','International Trade')
    ]
  },
  {
    id: 'bacc', code: 'BAcc', name: 'Bachelor of Science in Accounting & Finance', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('ACC101','Financial Accounting I'), U('ACC102','Cost Accounting'),
      U('ACC103','Auditing & Assurance'), U('ACC104','Taxation'),
      U('ACC105','Corporate Reporting'), U('ACC106','Management Accounting'),
      U('ACC107','Public Sector Accounting'), U('ACC108','Forensic Accounting')
    ]
  },
  {
    id: 'bpsm', code: 'BPSM', name: 'Bachelor of Purchasing & Supplies Management', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('PSM101','Introduction to Procurement'), U('PSM102','Supply Chain Management'),
      U('PSM103','Public Procurement Law'), U('PSM104','Inventory & Warehouse Management'),
      U('PSM105','Contract Management'), U('PSM106','Logistics Management'),
      U('PSM107','E-Procurement'), U('PSM108','Ethics in Procurement')
    ]
  },
  {
    id: 'bhr', code: 'BAHRM', name: 'Bachelor of Human Resource Management', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('HRM101','Introduction to HRM'), U('HRM102','Recruitment & Selection'),
      U('HRM103','Training & Development'), U('HRM104','Compensation Management'),
      U('HRM105','Performance Management'), U('HRM106','Labour & Industrial Relations'),
      U('HRM107','Strategic HRM'), U('HRM108','International HRM')
    ]
  },
  {
    id: 'bmkt', code: 'BMkt', name: 'Bachelor of Marketing', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('MKT101','Principles of Marketing'), U('MKT102','Consumer Behaviour'),
      U('MKT103','Integrated Marketing Communications'), U('MKT104','Digital & Social Media Marketing'),
      U('MKT105','Sales Management'), U('MKT106','Marketing Research'),
      U('MKT107','Brand Management'), U('MKT108','Services Marketing')
    ]
  },
  {
    id: 'bact', code: 'BSc-Act', name: 'Bachelor of Science in Actuarial Science', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('ACT101','Financial Mathematics'), U('ACT102','Probability & Statistics'),
      U('ACT103','Life Contingencies'), U('ACT104','Loss Models'),
      U('ACT105','Financial Economics'), U('ACT106','Risk Theory'),
      U('ACT107','Pension Mathematics'), U('ACT108','Actuarial Software (R/SAS)')
    ]
  },
  {
    id: 'bcoop', code: 'BCoop', name: 'Bachelor of Cooperative Business Management', facultyId: 'fac-biz', duration: '4 years',
    units: [
      U('COO101','Cooperative Philosophy & Movement'), U('COO102','Cooperative Law'),
      U('COO103','Cooperative Accounting'), U('COO104','SACCO Management'),
      U('COO105','Cooperative Marketing'), U('COO106','Cooperative Governance'),
      U('COO107','Rural Finance'), U('COO108','Cooperative Development')
    ]
  },

  // ============= EDUCATION =============
  {
    id: 'bed-arts', code: 'BEd-Arts', name: 'Bachelor of Education (Arts)', facultyId: 'fac-edu', duration: '4 years',
    units: [
      U('EDA101','Foundations of Education'), U('EDA102','Educational Psychology'),
      U('EDA103','Curriculum Studies'), U('EDA104','Sociology of Education'),
      U('EDA105','Teaching Methods'), U('EDA106','Educational Technology'),
      U('EDA107','Guidance & Counselling'), U('EDA108','Teaching Practice')
    ]
  },
  {
    id: 'bed-sci', code: 'BEd-Sci', name: 'Bachelor of Education (Science)', facultyId: 'fac-edu', duration: '4 years',
    units: [
      U('EDS101','General Chemistry for Educators'),
      U('EDS102','General Physics for Educators'),
      U('EDS103','General Biology for Educators'),
      U('EDS104','Mathematics Methods'),
      U('EDS105','Science Pedagogy'),
      U('EDS106','Laboratory Techniques'),
      U('EDS107','Assessment & Evaluation'),
      U('EDS108','Educational Research Methods')
    ]
  },
  {
    id: 'bece', code: 'BECE', name: 'Bachelor of Early Childhood Development & Education', facultyId: 'fac-edu', duration: '4 years',
    units: [
      U('ECD101','Child Growth & Development'),
      U('ECD102','ECD Curriculum'),
      U('ECD103','Play & Learning'),
      U('ECD104','Language & Literacy'),
      U('ECD105','ECD Health & Nutrition'),
      U('ECD106','Parenting & Community'),
      U('ECD107','Special Needs Education')
    ]
  },
  {
    id: 'bed-sne', code: 'BEd-SNE', name: 'Bachelor of Education in Special Needs Education', facultyId: 'fac-edu', duration: '4 years',
    units: [
      U('SNE101','Introduction to Special Needs Education'),
      U('SNE102','Learners with Hearing Impairments'),
      U('SNE103','Learners with Visual Impairments'),
      U('SNE104','Learners with Physical & Health Impairments'),
      U('SNE105','Learning Disabilities'),
      U('SNE106','Gifted & Talented Learners'),
      U('SNE107','Inclusive Education'),
      U('SNE108','Braille & Sign Language')
    ]
  },
  {
    id: 'bed-pri', code: 'BEd-Pri', name: 'Bachelor of Education (Primary)', facultyId: 'fac-edu', duration: '4 years',
    units: [
      U('EDP101','Foundations of Primary Education'),
      U('EDP102','Child Psychology'),
      U('EDP103','Primary Curriculum & Instruction'),
      U('EDP104','English Language Pedagogy'),
      U('EDP105','Kiswahili Language Pedagogy'),
      U('EDP106','Mathematics Pedagogy'),
      U('EDP107','Science & Social Studies Pedagogy'),
      U('EDP108','Teaching Practice in Primary Schools')
    ]
  },
  {
    id: 'bed-phys', code: 'BEd-PE', name: 'Bachelor of Education in Physical Education & Sports', facultyId: 'fac-edu', duration: '4 years',
    units: [
      U('EDE101','Anatomy & Physiology for PE'),
      U('EDE102','Motor Learning'), U('EDE103','Sports Psychology'),
      U('EDE104','Team Games (Football/Netball/Basketball)'),
      U('EDE105','Athletics & Gymnastics'),
      U('EDE106','Sports Administration'),
      U('EDE107','First Aid & Sports Injuries'),
      U('EDE108','Curriculum & Methods in PE')
    ]
  },

  // ============= SOCIAL SCIENCES & HUMANITIES =============
  {
    id: 'bsoc', code: 'BA-Soc', name: 'Bachelor of Arts in Sociology', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('SOC101','Introduction to Sociology'),
      U('SOC102','Social Theory'),
      U('SOC103','Research Methods in Sociology'),
      U('SOC104','Rural & Urban Sociology'),
      U('SOC105','Social Problems in Africa'),
      U('SOC106','Sociology of Development'),
      U('SOC107','Sociology of the Family')
    ]
  },
  {
    id: 'bpsy', code: 'BA-Psy', name: 'Bachelor of Arts in Psychology', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('PSY101','Introduction to Psychology'),
      U('PSY102','Developmental Psychology'),
      U('PSY103','Cognitive Psychology'),
      U('PSY104','Social Psychology'),
      U('PSY105','Abnormal Psychology'),
      U('PSY106','Counselling Psychology'),
      U('PSY107','Research Methods in Psychology')
    ]
  },
  {
    id: 'bhist', code: 'BA-Hist', name: 'Bachelor of Arts in History', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('HIS101','Introduction to History'),
      U('HIS102','History of Kenya'),
      U('HIS103','History of Africa'),
      U('HIS104','World History'),
      U('HIS105','Historiography'),
      U('HIS106','Political History of East Africa'),
      U('HIS107','Economic History')
    ]
  },
  {
    id: 'bpol', code: 'BA-PolSci', name: 'Bachelor of Arts in Political Science', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('POL101','Introduction to Political Science'),
      U('POL102','Kenyan Government & Politics'),
      U('POL103','International Relations'),
      U('POL104','Political Theory'),
      U('POL105','Public Policy Analysis'),
      U('POL106','Comparative Politics'),
      U('POL107','Peace & Conflict Studies')
    ]
  },
  {
    id: 'bgeo', code: 'BA-Geo', name: 'Bachelor of Arts in Geography', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('GEO101','Introduction to Geography'), U('GEO102','Physical Geography'),
      U('GEO103','Human Geography'), U('GEO104','Population Geography'),
      U('GEO105','Cartography & Map Reading'), U('GEO106','GIS & Remote Sensing'),
      U('GEO107','Climatology'), U('GEO108','Geography of Kenya')
    ]
  },
  {
    id: 'banthro', code: 'BA-Anthro', name: 'Bachelor of Arts in Anthropology', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('ANT101','Introduction to Anthropology'), U('ANT102','Cultural Anthropology'),
      U('ANT103','Physical Anthropology'), U('ANT104','Ethnography of African Societies'),
      U('ANT105','Archaeology'), U('ANT106','Medical Anthropology'),
      U('ANT107','Anthropological Theory')
    ]
  },
  {
    id: 'bsw', code: 'BSW', name: 'Bachelor of Social Work', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('BSW101','Introduction to Social Work'), U('BSW102','Human Behaviour & Social Environment'),
      U('BSW103','Social Casework'), U('BSW104','Social Group Work'),
      U('BSW105','Community Development'), U('BSW106','Social Welfare Policy'),
      U('BSW107','Field Practicum'), U('BSW108','Child Protection & Welfare')
    ]
  },
  {
    id: 'bcrim', code: 'BA-Crim', name: 'Bachelor of Arts in Criminology & Criminal Justice', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('CRJ101','Introduction to Criminology'), U('CRJ102','Criminal Law & Procedure'),
      U('CRJ103','Theories of Crime'), U('CRJ104','Policing & Society'),
      U('CRJ105','Penology & Corrections'), U('CRJ106','Juvenile Justice'),
      U('CRJ107','Forensic Investigations'), U('CRJ108','Cybercrime')
    ]
  },
  {
    id: 'bir', code: 'BA-IR', name: 'Bachelor of Arts in International Relations & Diplomacy', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('IRD101','Introduction to International Relations'),
      U('IRD102','Diplomatic Theory & Practice'),
      U('IRD103','International Law'),
      U('IRD104','Foreign Policy Analysis'),
      U('IRD105','Peace, Security & Conflict Resolution'),
      U('IRD106','African Regional Integration'),
      U('IRD107','International Political Economy')
    ]
  },
  {
    id: 'bgender', code: 'BA-Gender', name: 'Bachelor of Arts in Gender & Development Studies', facultyId: 'fac-ssh', duration: '4 years',
    units: [
      U('GDS101','Introduction to Gender Studies'), U('GDS102','Gender & Development Theory'),
      U('GDS103','Gender & Human Rights'), U('GDS104','Gender-Based Violence'),
      U('GDS105','Feminist Theory'), U('GDS106','Gender & Health'),
      U('GDS107','Gender, Media & Culture')
    ]
  },
  {
    id: 'bcomm', code: 'BA-Comm', name: 'Bachelor of Arts in Communication & Journalism', facultyId: 'fac-arts', duration: '4 years',
    units: [
      U('COM101','Introduction to Mass Communication'),
      U('COM102','News Writing & Reporting'),
      U('COM103','Media Law & Ethics'),
      U('COM104','Broadcast Journalism'),
      U('COM105','Digital Media Production'),
      U('COM106','Public Relations'),
      U('COM107','Media Research')
    ]
  },
  {
    id: 'bfilm', code: 'BA-Film', name: 'Bachelor of Arts in Film & Theatre Studies', facultyId: 'fac-arts', duration: '4 years',
    units: [
      U('FTS101','Introduction to Film Studies'), U('FTS102','Screenwriting'),
      U('FTS103','Directing for Film & Television'), U('FTS104','Cinematography'),
      U('FTS105','Film Editing & Post-Production'), U('FTS106','Theatre & Performance'),
      U('FTS107','African Cinema'), U('FTS108','Documentary Production')
    ]
  },
  {
    id: 'banim', code: 'BA-Anim', name: 'Bachelor of Arts in Animation & Digital Media', facultyId: 'fac-arts', duration: '4 years',
    units: [
      U('ANM101','Fundamentals of Animation'), U('ANM102','Drawing for Animation'),
      U('ANM103','2D Animation'), U('ANM104','3D Modelling & Animation'),
      U('ANM105','Digital Storytelling'), U('ANM106','Motion Graphics'),
      U('ANM107','Game Design Basics'), U('ANM108','VFX & Compositing')
    ]
  },

  // ============= LAW =============
  {
    id: 'llb', code: 'LLB', name: 'Bachelor of Laws (LLB)', facultyId: 'fac-law', duration: '4 years',
    units: [
      U('LAW101','Legal Systems & Methods'),
      U('LAW102','Constitutional Law'),
      U('LAW103','Criminal Law'),
      U('LAW104','Law of Contract'),
      U('LAW105','Law of Tort'),
      U('LAW106','Family Law'),
      U('LAW107','Property Law'),
      U('LAW108','Administrative Law'),
      U('LAW109','Public International Law')
    ]
  },

  // ============= SCIENCE =============
  {
    id: 'bmath', code: 'BSc-Math', name: 'Bachelor of Science in Mathematics', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('MAT101','Calculus I'), U('MAT102','Linear Algebra'),
      U('MAT103','Discrete Mathematics'), U('MAT104','Real Analysis'),
      U('MAT105','Abstract Algebra'), U('MAT106','Probability & Statistics'),
      U('MAT107','Numerical Methods'), U('MAT108','Differential Equations')
    ]
  },
  {
    id: 'bphy', code: 'BSc-Phy', name: 'Bachelor of Science in Physics', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('PHY101','Classical Mechanics'), U('PHY102','Electricity & Magnetism'),
      U('PHY103','Thermodynamics'), U('PHY104','Modern Physics'),
      U('PHY105','Quantum Mechanics'), U('PHY106','Optics'),
      U('PHY107','Solid State Physics'), U('PHY108','Nuclear Physics')
    ]
  },
  {
    id: 'bchm', code: 'BSc-Chem', name: 'Bachelor of Science in Chemistry', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('CHM101','General Chemistry'), U('CHM102','Organic Chemistry I'),
      U('CHM103','Inorganic Chemistry'), U('CHM104','Physical Chemistry'),
      U('CHM105','Analytical Chemistry'), U('CHM106','Environmental Chemistry'),
      U('CHM107','Biochemistry'), U('CHM108','Industrial Chemistry')
    ]
  },
  {
    id: 'bbio', code: 'BSc-Bio', name: 'Bachelor of Science in Biology', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('BIO101','Cell Biology'), U('BIO102','Genetics'),
      U('BIO103','Ecology'), U('BIO104','Microbiology'),
      U('BIO105','Botany'), U('BIO106','Zoology'),
      U('BIO107','Evolution'), U('BIO108','Molecular Biology')
    ]
  },
  {
    id: 'bstat', code: 'BSc-Stat', name: 'Bachelor of Science in Statistics', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('STA101','Descriptive Statistics'), U('STA102','Probability Theory'),
      U('STA103','Statistical Inference'), U('STA104','Regression Analysis'),
      U('STA105','Time Series Analysis'), U('STA106','Sampling Methods'),
      U('STA107','Design of Experiments'), U('STA108','Statistical Computing (R)')
    ]
  },
  {
    id: 'bgeol', code: 'BSc-Geol', name: 'Bachelor of Science in Geology', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('GEL101','Physical Geology'), U('GEL102','Mineralogy'),
      U('GEL103','Petrology'), U('GEL104','Structural Geology'),
      U('GEL105','Sedimentology & Stratigraphy'), U('GEL106','Palaeontology'),
      U('GEL107','Economic Geology'), U('GEL108','Hydrogeology')
    ]
  },
  {
    id: 'bbiotech', code: 'BSc-BioTech', name: 'Bachelor of Science in Biotechnology', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('BTC101','Introduction to Biotechnology'), U('BTC102','Molecular Biology'),
      U('BTC103','Genetic Engineering'), U('BTC104','Industrial Microbiology'),
      U('BTC105','Plant Biotechnology'), U('BTC106','Animal Biotechnology'),
      U('BTC107','Bioinformatics'), U('BTC108','Biotechnology Ethics & Policy')
    ]
  },
  {
    id: 'bmicro', code: 'BSc-Micro', name: 'Bachelor of Science in Microbiology', facultyId: 'fac-sci', duration: '4 years',
    units: [
      U('MIC101','General Microbiology'), U('MIC102','Medical Microbiology'),
      U('MIC103','Food Microbiology'), U('MIC104','Environmental Microbiology'),
      U('MIC105','Virology'), U('MIC106','Immunology'),
      U('MIC107','Mycology & Parasitology'), U('MIC108','Applied Microbiology')
    ]
  },

  // ============= AGRICULTURE =============
  {
    id: 'bagric', code: 'BSc-Agri', name: 'Bachelor of Science in Agriculture', facultyId: 'fac-agri', duration: '4 years',
    units: [
      U('AGR101','Introduction to Agriculture'),
      U('AGR102','Soil Science'), U('AGR103','Crop Production'),
      U('AGR104','Animal Production'), U('AGR105','Agricultural Economics'),
      U('AGR106','Farm Management'), U('AGR107','Agricultural Extension'),
      U('AGR108','Plant Pathology')
    ]
  },
  {
    id: 'bvet', code: 'BVM', name: 'Bachelor of Veterinary Medicine', facultyId: 'fac-agri', duration: '5 years',
    units: [
      U('VET101','Veterinary Anatomy'), U('VET102','Veterinary Physiology'),
      U('VET103','Animal Nutrition'), U('VET104','Veterinary Microbiology'),
      U('VET105','Veterinary Pharmacology'), U('VET106','Veterinary Pathology'),
      U('VET107','Animal Surgery'), U('VET108','Veterinary Public Health')
    ]
  },
  {
    id: 'bhort', code: 'BSc-Hort', name: 'Bachelor of Science in Horticulture', facultyId: 'fac-agri', duration: '4 years',
    units: [
      U('HRT101','Principles of Horticulture'), U('HRT102','Pomology (Fruit Crops)'),
      U('HRT103','Olericulture (Vegetables)'), U('HRT104','Floriculture'),
      U('HRT105','Post-Harvest Handling'), U('HRT106','Greenhouse Technology'),
      U('HRT107','Landscape Horticulture'), U('HRT108','Horticulture Marketing')
    ]
  },
  {
    id: 'bfor', code: 'BSc-For', name: 'Bachelor of Science in Forestry', facultyId: 'fac-agri', duration: '4 years',
    units: [
      U('FOR101','Forest Ecology'), U('FOR102','Silviculture'),
      U('FOR103','Forest Mensuration'), U('FOR104','Forest Management'),
      U('FOR105','Agroforestry'), U('FOR106','Wood Science & Technology'),
      U('FOR107','Forest Policy & Law'), U('FOR108','Wildlife & Forest Conservation')
    ]
  },
  {
    id: 'bfish', code: 'BSc-Fish', name: 'Bachelor of Science in Fisheries & Aquaculture', facultyId: 'fac-agri', duration: '4 years',
    units: [
      U('FIS101','Introduction to Fisheries'), U('FIS102','Aquaculture Systems'),
      U('FIS103','Fish Biology & Ecology'), U('FIS104','Fish Nutrition & Feeds'),
      U('FIS105','Fish Health Management'), U('FIS106','Fisheries Management'),
      U('FIS107','Aquatic Environments'), U('FIS108','Fisheries Economics')
    ]
  },
  {
    id: 'bfst', code: 'BSc-FST', name: 'Bachelor of Science in Food Science & Technology', facultyId: 'fac-agri', duration: '4 years',
    units: [
      U('FST101','Introduction to Food Science'), U('FST102','Food Chemistry'),
      U('FST103','Food Microbiology'), U('FST104','Food Processing & Preservation'),
      U('FST105','Food Quality Assurance'), U('FST106','Dairy Technology'),
      U('FST107','Cereal & Legume Technology'), U('FST108','Food Product Development')
    ]
  },

  // ============= ARCHITECTURE & BUILT ENVIRONMENT =============
  {
    id: 'barch', code: 'BArch', name: 'Bachelor of Architecture', facultyId: 'fac-arch', duration: '5 years',
    units: [
      U('ARC101','Architectural Design Studio I'),
      U('ARC102','History & Theory of Architecture'),
      U('ARC103','Building Construction & Materials'),
      U('ARC104','Structures for Architects'),
      U('ARC105','Environmental Design'),
      U('ARC106','Urban Design'),
      U('ARC107','Building Services'),
      U('ARC108','Professional Practice')
    ]
  },
  {
    id: 'bqs', code: 'BQS', name: 'Bachelor of Science in Quantity Surveying', facultyId: 'fac-arch', duration: '5 years',
    units: [
      U('QSV101','Introduction to Quantity Surveying'),
      U('QSV102','Measurement of Building Works'),
      U('QSV103','Construction Technology'),
      U('QSV104','Construction Economics'),
      U('QSV105','Contract Administration'),
      U('QSV106','Estimation & Tendering'),
      U('QSV107','Project Management')
    ]
  },
  {
    id: 'blsurv', code: 'BSc-Land', name: 'Bachelor of Science in Land Surveying & Geospatial Engineering', facultyId: 'fac-arch', duration: '5 years',
    units: [
      U('LSV101','Plane Surveying'), U('LSV102','Geodesy'),
      U('LSV103','Photogrammetry'), U('LSV104','GIS & Cartography'),
      U('LSV105','Cadastral Surveying'), U('LSV106','Engineering Surveying'),
      U('LSV107','Hydrographic Surveying'), U('LSV108','Remote Sensing')
    ]
  },
  {
    id: 'bre', code: 'BRE', name: 'Bachelor of Real Estate & Property Management', facultyId: 'fac-arch', duration: '4 years',
    units: [
      U('REM101','Introduction to Real Estate'), U('REM102','Property Valuation'),
      U('REM103','Property Law'), U('REM104','Urban Land Economics'),
      U('REM105','Real Estate Finance & Investment'), U('REM106','Facilities Management'),
      U('REM107','Property Development'), U('REM108','Estate Agency Practice')
    ]
  },
  {
    id: 'burp', code: 'BURP', name: 'Bachelor of Urban & Regional Planning', facultyId: 'fac-arch', duration: '5 years',
    units: [
      U('URP101','Introduction to Planning'), U('URP102','Urban Design & Morphology'),
      U('URP103','Land Use Planning'), U('URP104','Transportation Planning'),
      U('URP105','Environmental Planning'), U('URP106','Housing Policy & Practice'),
      U('URP107','Planning Law'), U('URP108','GIS for Planners')
    ]
  },
  {
    id: 'bcm', code: 'BCM', name: 'Bachelor of Science in Construction Management', facultyId: 'fac-arch', duration: '4 years',
    units: [
      U('BCN101','Construction Technology'), U('BCN102','Construction Economics'),
      U('BCN103','Site Management'), U('BCN104','Construction Law & Contracts'),
      U('BCN105','Construction Health & Safety'), U('BCN106','Construction Project Management'),
      U('BCN107','Building Services Coordination'), U('BCN108','Sustainable Construction')
    ]
  },

  // ============= ARTS & DESIGN =============
  {
    id: 'bfa', code: 'BFA', name: 'Bachelor of Fine Arts & Design', facultyId: 'fac-arts', duration: '4 years',
    units: [
      U('FAD101','Drawing Fundamentals'),
      U('FAD102','Colour Theory'),
      U('FAD103','Graphic Design'),
      U('FAD104','Digital Illustration'),
      U('FAD105','Typography'),
      U('FAD106','History of Art'),
      U('FAD107','Photography')
    ]
  },
  {
    id: 'bfashion', code: 'BAFD', name: 'Bachelor of Arts in Fashion Design & Marketing', facultyId: 'fac-arts', duration: '4 years',
    units: [
      U('FSD101','Fashion Illustration'), U('FSD102','Garment Construction'),
      U('FSD103','Textile Science'), U('FSD104','Pattern Making'),
      U('FSD105','Fashion Marketing'), U('FSD106','African & Global Fashion History'),
      U('FSD107','Fashion Merchandising'), U('FSD108','Digital Fashion Media')
    ]
  },

  // ============= ENVIRONMENTAL =============
  {
    id: 'benv', code: 'BEnv', name: 'Bachelor of Environmental Studies', facultyId: 'fac-env', duration: '4 years',
    units: [
      U('ENV101','Environmental Science Fundamentals'),
      U('ENV102','Ecology & Biodiversity'),
      U('ENV103','Climate Change'),
      U('ENV104','Environmental Impact Assessment'),
      U('ENV105','Waste Management'),
      U('ENV106','Environmental Policy & Law'),
      U('ENV107','GIS & Remote Sensing')
    ]
  },
  {
    id: 'bwlm', code: 'BWLM', name: 'Bachelor of Science in Wildlife Management', facultyId: 'fac-env', duration: '4 years',
    units: [
      U('WLM101','Principles of Wildlife Management'),
      U('WLM102','Wildlife Ecology'), U('WLM103','Wildlife Population Dynamics'),
      U('WLM104','Protected Area Management'), U('WLM105','Human\u2013Wildlife Conflict'),
      U('WLM106','Ecotourism'), U('WLM107','Wildlife Law & Policy'),
      U('WLM108','Conservation Biology')
    ]
  },
  {
    id: 'benvhealth', code: 'BEnvH', name: 'Bachelor of Science in Environmental Health', facultyId: 'fac-env', duration: '4 years',
    units: [
      U('EVH101','Environmental Health Principles'), U('EVH102','Water & Sanitation'),
      U('EVH103','Food Safety & Hygiene'), U('EVH104','Vector Control'),
      U('EVH105','Occupational Health'), U('EVH106','Air Quality & Pollution'),
      U('EVH107','Solid & Hazardous Waste'), U('EVH108','Public Health Law')
    ]
  },

  // ============= LANGUAGES, LITERATURE & LINGUISTICS =============
  {
    id: 'ba-eng-lit', code: 'BA-EngLit', name: 'Bachelor of Arts in English & Literature', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('ELT101','Introduction to Literature'),
      U('ELT102','African Literature'),
      U('ELT103','English Poetry'),
      U('ELT104','Prose Fiction & the Novel'),
      U('ELT105','Drama & Theatre'),
      U('ELT106','Literary Criticism & Theory'),
      U('ELT107','Shakespearean Studies'),
      U('ELT108','Postcolonial Literature'),
      U('ELT109','Oral Literature of Kenya'),
      U('ELT110','Caribbean & Diaspora Literature'),
      U('ELT111','Children\u2019s Literature'),
      U('ELT112','Contemporary East African Writing')
    ]
  },
  {
    id: 'ba-ling', code: 'BA-Ling', name: 'Bachelor of Arts in Linguistics', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('LNG101','Introduction to Linguistics'),
      U('LNG102','Phonetics & Phonology'),
      U('LNG103','Morphology'),
      U('LNG104','Syntax'),
      U('LNG105','Semantics & Pragmatics'),
      U('LNG106','Sociolinguistics'),
      U('LNG107','Psycholinguistics'),
      U('LNG108','Applied Linguistics')
    ]
  },
  {
    id: 'ba-kis', code: 'BA-Kis', name: 'Bachelor of Arts in Kiswahili', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('KIS101','Fasihi ya Kiswahili (Kiswahili Literature)'),
      U('KIS102','Sarufi ya Kiswahili (Kiswahili Grammar)'),
      U('KIS103','Isimu ya Kiswahili (Kiswahili Linguistics)'),
      U('KIS104','Fasihi Simulizi (Oral Literature)'),
      U('KIS105','Tafsiri na Ukalimani (Translation & Interpretation)'),
      U('KIS106','Ushairi (Poetry)'),
      U('KIS107','Riwaya na Tamthilia (Novel & Drama)'),
      U('KIS108','Kiswahili katika Vyombo vya Habari')
    ]
  },
  {
    id: 'ba-fr', code: 'BA-Fr', name: 'Bachelor of Arts in French', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('FRN101','French Language I'), U('FRN102','French Language II'),
      U('FRN103','French Grammar & Composition'), U('FRN104','French Literature'),
      U('FRN105','Francophone African Studies'), U('FRN106','French for Business'),
      U('FRN107','French Translation'), U('FRN108','Cultures francophones')
    ]
  },
  {
    id: 'ba-ger', code: 'BA-Ger', name: 'Bachelor of Arts in German (Intercultural German Studies)', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('GER101','German Language I'), U('GER102','German Language II'),
      U('GER103','German Grammar & Composition'), U('GER104','German Literature'),
      U('GER105','Intercultural Communication'), U('GER106','German for Tourism'),
      U('GER107','German Translation'), U('GER108','Contemporary German Culture')
    ]
  },
  {
    id: 'ba-chi', code: 'BA-Chi', name: 'Bachelor of Arts in Chinese Language & Culture', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('CHI101','Mandarin Chinese I'), U('CHI102','Mandarin Chinese II'),
      U('CHI103','Chinese Characters & Writing'), U('CHI104','Chinese Culture & Society'),
      U('CHI105','Chinese for Business'), U('CHI106','Chinese Literature'),
      U('CHI107','China\u2013Africa Relations'), U('CHI108','Chinese Translation')
    ]
  },
  {
    id: 'ba-ara', code: 'BA-Ara', name: 'Bachelor of Arts in Arabic Studies', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('ARB101','Arabic Language I'), U('ARB102','Arabic Language II'),
      U('ARB103','Arabic Grammar (Nahw)'), U('ARB104','Classical Arabic Literature'),
      U('ARB105','Modern Arabic Prose'), U('ARB106','Arabic Media'),
      U('ARB107','Arabic Translation'), U('ARB108','Arab Culture & History')
    ]
  },
  {
    id: 'ba-jrn', code: 'BA-Jrn', name: 'Bachelor of Arts in Journalism & Media Studies', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('JRN101','Foundations of Journalism'), U('JRN102','News Gathering & Writing'),
      U('JRN103','Feature & Investigative Journalism'), U('JRN104','Photojournalism'),
      U('JRN105','Radio & TV Production'), U('JRN106','Online & Data Journalism'),
      U('JRN107','Media Ethics & Law'), U('JRN108','Media Management')
    ]
  },
  {
    id: 'ba-libr', code: 'BA-Libr', name: 'Bachelor of Library & Information Science', facultyId: 'fac-lang', duration: '4 years',
    units: [
      U('LIS101','Foundations of Library Science'), U('LIS102','Cataloguing & Classification'),
      U('LIS103','Information Retrieval'), U('LIS104','Records & Archives Management'),
      U('LIS105','Digital Libraries'), U('LIS106','Reference & User Services'),
      U('LIS107','Knowledge Management'), U('LIS108','Research Methods in LIS')
    ]
  },

  // ============= THEOLOGY & RELIGIOUS STUDIES =============
  {
    id: 'ba-rel', code: 'BA-Rel', name: 'Bachelor of Arts in Religious Studies', facultyId: 'fac-theo', duration: '4 years',
    units: [
      U('REL101','Introduction to Religious Studies'),
      U('REL102','World Religions'),
      U('REL103','African Traditional Religion'),
      U('REL104','Christianity in Africa'),
      U('REL105','Islamic Studies'),
      U('REL106','Philosophy of Religion'),
      U('REL107','Religion & Society'),
      U('REL108','Comparative Religion')
    ]
  },
  {
    id: 'ba-theo', code: 'BA-Theo', name: 'Bachelor of Arts in Theology', facultyId: 'fac-theo', duration: '4 years',
    units: [
      U('THL101','Introduction to Theology'), U('THL102','Old Testament Studies'),
      U('THL103','New Testament Studies'), U('THL104','Systematic Theology'),
      U('THL105','Church History'), U('THL106','Christian Ethics'),
      U('THL107','Pastoral Care & Counselling'), U('THL108','Missiology')
    ]
  },
  {
    id: 'ba-phil', code: 'BA-Phil', name: 'Bachelor of Arts in Philosophy', facultyId: 'fac-theo', duration: '4 years',
    units: [
      U('PHL101','Introduction to Philosophy'), U('PHL102','Logic & Critical Thinking'),
      U('PHL103','Ethics'), U('PHL104','Metaphysics'),
      U('PHL105','Epistemology'), U('PHL106','African Philosophy'),
      U('PHL107','Political Philosophy'), U('PHL108','Philosophy of Science')
    ]
  },
  {
    id: 'ba-isl', code: 'BA-Isl', name: 'Bachelor of Arts in Islamic Studies', facultyId: 'fac-theo', duration: '4 years',
    units: [
      U('ISL101','Introduction to Islamic Studies'), U('ISL102','Qur\u2019anic Studies'),
      U('ISL103','Hadith Studies'), U('ISL104','Islamic Jurisprudence (Fiqh)'),
      U('ISL105','Islamic History & Civilisation'), U('ISL106','Islamic Ethics'),
      U('ISL107','Da\u2019wah & Islamic Communication'), U('ISL108','Contemporary Muslim Societies')
    ]
  },

  // ============= HOSPITALITY, TOURISM & LEISURE =============
  {
    id: 'bht', code: 'BHT', name: 'Bachelor of Science in Hospitality & Tourism Management', facultyId: 'fac-hosp', duration: '4 years',
    units: [
      U('HTM101','Introduction to Hospitality & Tourism'),
      U('HTM102','Food & Beverage Management'),
      U('HTM103','Front Office Operations'),
      U('HTM104','Accommodation Management'),
      U('HTM105','Tourism Marketing'),
      U('HTM106','Sustainable Tourism'),
      U('HTM107','Events & Conference Management'),
      U('HTM108','Tourism Policy & Planning')
    ]
  },
  {
    id: 'btrav', code: 'BATT', name: 'Bachelor of Arts in Travel & Tour Operations Management', facultyId: 'fac-hosp', duration: '4 years',
    units: [
      U('TTO101','Foundations of Travel & Tourism'),
      U('TTO102','Tour Operations'), U('TTO103','Airline & Airport Operations'),
      U('TTO104','Destination Management'), U('TTO105','Travel Agency Management'),
      U('TTO106','Global Distribution Systems'), U('TTO107','Adventure & Eco-Tourism'),
      U('TTO108','Tourism Law & Regulation')
    ]
  },
  {
    id: 'bculin', code: 'BCul', name: 'Bachelor of Science in Culinary Arts & Food Service', facultyId: 'fac-hosp', duration: '4 years',
    units: [
      U('CUL101','Foundations of Culinary Arts'), U('CUL102','Kitchen Operations & Safety'),
      U('CUL103','Bakery & Pastry Arts'), U('CUL104','International Cuisines'),
      U('CUL105','African & Kenyan Cuisines'), U('CUL106','Menu Planning & Costing'),
      U('CUL107','Restaurant Management'), U('CUL108','Wine & Beverage Studies')
    ]
  },

  // ============= MUSIC & PERFORMING ARTS =============
  {
    id: 'ba-mus', code: 'BA-Mus', name: 'Bachelor of Arts in Music', facultyId: 'fac-music', duration: '4 years',
    units: [
      U('MUS101','Music Theory & Harmony'),
      U('MUS102','Ear Training & Sight Singing'),
      U('MUS103','History of Western Music'),
      U('MUS104','African Music Traditions'),
      U('MUS105','Instrumental / Voice Performance'),
      U('MUS106','Music Composition & Arranging'),
      U('MUS107','Music Technology & Production'),
      U('MUS108','Church & Choral Music')
    ]
  },
  {
    id: 'bperf', code: 'BA-Perf', name: 'Bachelor of Arts in Performing Arts (Dance, Drama, Music)', facultyId: 'fac-music', duration: '4 years',
    units: [
      U('PFA101','Foundations of Performing Arts'),
      U('PFA102','Acting & Stagecraft'),
      U('PFA103','African Dance Forms'),
      U('PFA104','Voice & Movement'),
      U('PFA105','Directing for the Stage'),
      U('PFA106','Theatre for Development'),
      U('PFA107','Music for Performance'),
      U('PFA108','Performing Arts Management')
    ]
  }
];

module.exports = { universities, faculties, courses };
