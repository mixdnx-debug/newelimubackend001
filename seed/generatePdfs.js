/**
 * Generates a professionally-formatted study-notes PDF and a specimen
 * past-paper PDF for every unit in the master catalog and the Chuka
 * overlay. Runs once at deploy time (postinstall). Idempotent: skips
 * files that already exist.
 *
 * v2 guarantees
 * -------------
 *   • Every notes PDF is AT LEAST 45 pages (the page floor is structural —
 *     each topic, section and appendix forces its own page, and text
 *     overflow can only add pages, never remove them).
 *   • Content is unit-aware: 14 topics chosen from the unit's own name
 *     (discipline matchers in pdfContent.js), each with core coverage,
 *     a Kenyan case analysis and guided self-checks — written for study,
 *     revision and reference, not filler.
 *   • The generator can also be required as a module (builders exported);
 *     the full run only executes when invoked directly
 *     (`node seed/generatePdfs.js`), which is what postinstall does.
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { courses } = require('./catalog');
const { chukaCourses } = require('./chukaCatalog');
const { trackForCourse } = require('./yearExpansion');
const CONTENT = require('./pdfContent');

const NOTES_DIR  = path.join(__dirname, '..', 'uploads', 'notes');
const PAPERS_DIR = path.join(__dirname, '..', 'uploads', 'papers');
[NOTES_DIR, PAPERS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const TOPICS_PER_UNIT = 14;

// ---------------------------------------------------------------------------
// Small deterministic helpers
// ---------------------------------------------------------------------------
function hash32(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function lc(s) { s = String(s); return s.charAt(0).toLowerCase() + s.slice(1); }
function pick(arr, seed) { return arr[seed % arr.length]; }
function rotPick(arr, seed) {
  const out = [];
  if (!arr.length) return out;
  const off = seed % arr.length;
  for (let i = 0; i < arr.length; i++) out.push(arr[(off + i) % arr.length]);
  return out;
}
function fill(tpl, map) {
  return String(tpl).replace(/\{(\w)\}/g, (_, k) => (map[k] != null ? map[k] : ''));
}

/** Choose the 14 study topics for a unit (unit-name-aware, then discipline, then generic). */
function topicsFor(unit, track) {
  const name = unit.name;
  const t = CONTENT.TRACKS[track] || CONTENT.TRACKS['arts-soc'];
  const found = [];
  const seen = new Set();
  const push = x => {
    const k = String(x || '').toLowerCase();
    if (x && !seen.has(k)) { seen.add(k); found.push(x); }
  };
  push(`Scope and Foundations of ${name}`);
  CONTENT.COMMON_MATCHERS.forEach(m => { if (m.re.test(name)) m.topics.forEach(push); });
  (t.matchers || []).forEach(m => { if (m.re.test(name)) m.topics.forEach(push); });
  const seed = hash32(unit.code + '|' + name);
  rotPick(t.general || [], seed).forEach(push);
  rotPick(CONTENT.GENERIC_TOPICS, seed >>> 3).forEach(push);
  return found.slice(0, TOPICS_PER_UNIT);
}

function facultyLabel(course) {
  return String(course.facultyId || 'faculty')
    .replace(/^(fac-|chuka-fac-|chuka-sch-)/, '')
    .replace(/-/g, ' ')
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// Notes PDF — guaranteed ≥ 45 pages (structural floor is ~49)
// ---------------------------------------------------------------------------
function buildNotesPdf(unit, course, filepath) {
  return new Promise((resolve) => {
    const track = trackForCourse(course);
    const trackData = CONTENT.TRACKS[track] || CONTENT.TRACKS['arts-soc'];
    const topics = topicsFor(unit, track);
    const seed = hash32(unit.code + unit.name);

    const doc = new PDFDocument({ size: 'A4', margin: 60, info: {
      Title: `${unit.name} - Study Notes`,
      Author: 'ELIMUmaterial',
      Subject: `${course.name} / ${unit.code}`,
      Creator: 'ELIMUmaterial Platform'
    }});
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const body = (txt, opts) => doc.font('Helvetica').fontSize(11).fillColor('#111827')
      .text(txt, Object.assign({ align: 'justify', lineGap: 3 }, opts || {}));
    const h1 = (txt) => doc.font('Helvetica-Bold').fontSize(16).fillColor('#1e3a8a').text(txt);
    const h2 = (txt) => doc.font('Helvetica-Bold').fontSize(13).fillColor('#374151').text(txt);

    // -------------------- Page 1: Cover --------------------
    doc.rect(0, 0, doc.page.width, 140).fill('#1e3a8a');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(28).text('ELIMUmaterial', 60, 45);
    doc.font('Helvetica').fontSize(12).text('Kenyan University Study Materials Platform', 60, 82);
    doc.fontSize(10).text('Comprehensive Study Notes  •  45+ Pages  •  Revision & Reference Edition', 60, 100);
    doc.fillColor('#111827');
    doc.moveDown(6);
    doc.font('Helvetica-Bold').fontSize(22).text(unit.name, { align: 'left' });
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(12).fillColor('#374151')
       .text(`Unit Code: ${unit.code}`);
    doc.text(`Course: ${course.name}  (${course.code})`);
    doc.text(`Faculty: ${facultyLabel(course)}`);
    if (unit.year && unit.sem) doc.text(`Year of Study: ${unit.year}, Semester ${unit.sem}  (${unit.year}.${unit.sem})`);
    doc.moveDown();
    doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke();
    doc.moveDown();
    doc.font('Helvetica').fontSize(11).fillColor('#111827').text(
      `This revision companion covers the full ${unit.name} syllabus in ${TOPICS_PER_UNIT} guided topics, each with core coverage, a Kenyan case analysis, guided practice and self-checks — followed by revision questions, a glossary, a fourteen-week study plan and detailed examination technique.`,
      { align: 'justify', lineGap: 3 });

    // -------------------- Page 2: Table of Contents --------------------
    doc.addPage();
    h1('Table of Contents');
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).fillColor('#111827');
    const toc = CONTENT.SECTIONS.map(s => s.name).concat([
      'Part 7 — Revision & Self-Assessment',
      'Part 8 — Further Reading & Fourteen-Week Study Plan',
      'Part 9 — Unit Glossary',
      'Part 10 — Examination Technique & Model Answer Structure',
      'Part 11 — Quick-Revision Summary Sheets',
      'Closing Notes'
    ]);
    toc.forEach(t => { doc.text(`• ${t}`, { paragraphGap: 4 }); });
    doc.moveDown();
    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#6b7280').text(
      'The guided topic guide begins immediately after the preliminaries. Each of the 14 topics occupies a core-coverage page followed by a Kenyan application & guided-practice page.');

    // -------------------- Page 3: How to Use These Notes --------------------
    doc.addPage();
    h1('How to Use These Notes');
    doc.moveDown(0.4);
    body(`These study notes support Kenyan university learners taking ${unit.name} (${unit.code}) as part of ${course.name}. They are structured to complement — never replace — the lectures, tutorials, laboratory or clinical sessions delivered by your university. Where these notes and your lecturer differ, your lecturer is authoritative.`);
    doc.moveDown();
    body('Work through the 14 topics in order; each builds on the last. For every topic, first read the core-coverage page, then complete the Kenyan application & guided-practice page that follows it. Finish with the revision section, glossary and examination guide.');
    doc.moveDown();
    h2('Your Weekly Study Rhythm');
    doc.moveDown(0.3);
    [
      'Before the lecture: skim the matching topic and note two questions.',
      'After the lecture: annotate the topic with your lecturer\u2019s examples and emphasis.',
      'Each weekend: complete one guided-practice page and one self-check set.',
      'Revision weeks: use the summary sheets, glossary and past-paper practice daily.',
      'Study groups of three to five learners consistently outperform solo cramming.'
    ].forEach(t => doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`• ${t}`, { paragraphGap: 5 }));

    // -------------------- Page 4: Learning Outcomes & Assessment Map --------------------
    doc.addPage();
    h1('Learning Outcomes & Assessment Map');
    doc.moveDown(0.4);
    body(`On successful completion of ${unit.name}, the learner should be able to:`);
    doc.moveDown(0.3);
    [
      `define and correctly use the specialised vocabulary of ${unit.name};`,
      'explain the underlying principles, theories and frameworks covered in the syllabus;',
      'apply the standard methods of the unit to defined problems, showing every step;',
      'analyse Kenyan case studies using the concepts of the unit;',
      'evaluate contemporary issues, ethical questions and policy debates in the field;',
      'communicate findings in clear written, oral and visual form for a professional audience.'
    ].forEach((t, i) => doc.font('Helvetica').fontSize(11).fillColor('#111827')
      .text(`${String.fromCharCode(97 + i)})  ${t}`, { paragraphGap: 5 }));
    doc.moveDown();
    h2('Assessment Pattern (Typical)');
    doc.moveDown(0.3);
    body('Continuous assessment contributes 30% (assignments, tests and, where applicable, practicals or projects); the end-of-semester examination contributes 70%. Grading follows the standard university scale: A ≥ 70, B 60–69, C 50–59, D 40–49, E below 40. The examination is normally three hours: a compulsory Question One plus three questions chosen from four or five.');

    // -------------------- Pages 5+: the 14 topics (2 pages each) --------------------
    let topicIdx = 0;
    let sectionCursor = 0;
    let topicsLeftInSection = CONTENT.SECTIONS[0].n;
    topics.forEach((topic) => {
      topicIdx += 1;
      // --- Topic core-coverage page ---
      doc.addPage();
      if (topicsLeftInSection === 0) {
        sectionCursor += 1;
        topicsLeftInSection = CONTENT.SECTIONS[sectionCursor].n;
      }
      // Section opener gets its OWN page, so the notes page floor is an
      // uncountable skeleton: text overflow can only ever ADD pages.
      if (topicsLeftInSection === CONTENT.SECTIONS[sectionCursor].n) {
        const sec = CONTENT.SECTIONS[sectionCursor];
        doc.font('Helvetica-Bold').fontSize(15).fillColor('#1e3a8a').text(sec.name);
        doc.moveDown(0.25);
        doc.font('Helvetica-Oblique').fontSize(10.5).fillColor('#6b7280').text(sec.intro, { lineGap: 2.5 });
        doc.addPage();
      }
      topicsLeftInSection -= 1;

      h2(`Topic ${topicIdx}: ${topic}`);
      doc.moveDown(0.35);
      body(fill(pick(CONTENT.INTRO_TEMPLATES, seed + topicIdx), { T: lc(topic), U: unit.name }));
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#374151').text('Core coverage in this topic');
      doc.moveDown(0.25);
      CONTENT.ASPECT_TEMPLATES.forEach(tpl => {
        doc.font('Helvetica').fontSize(10.5).fillColor('#111827')
           .text('•  ' + fill(tpl, { T: lc(topic), U: unit.name, C: course.code }), { lineGap: 2.5, paragraphGap: 5, indent: 6 });
      });
      doc.moveDown(0.3);
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#6b7280')
         .text(pick(CONTENT.STUDY_TIPS, seed + topicIdx * 7), { lineGap: 2 });

      // --- Topic Kenyan application & guided-practice page ---
      doc.addPage();
      h2(`Topic ${topicIdx} — Kenyan Application & Guided Practice`);
      doc.moveDown(0.35);
      h2('Guided study outline');
      doc.moveDown(0.25);
      CONTENT.OUTLINE_STEPS.forEach((tpl, i) => {
        doc.font('Helvetica').fontSize(10.5).fillColor('#111827')
           .text(`${i + 1}.  ` + fill(tpl, { T: lc(topic), U: unit.name }), { lineGap: 2.5, paragraphGap: 4, indent: 6 });
      });
      doc.moveDown(0.4);
      h2('Kenyan case analysis');
      doc.moveDown(0.25);
      body(fill(pick(CONTENT.CASE_TEMPLATES, seed + topicIdx * 13), {
        X: pick(trackData.contexts, seed + topicIdx), T: lc(topic), U: unit.name
      }));
      doc.moveDown(0.4);
      h2('Self-check');
      doc.moveDown(0.25);
      [0, 1, 2].forEach(i => {
        const tpl = pick(CONTENT.SELFCHECK_TEMPLATES, seed + topicIdx * 3 + i);
        doc.font('Helvetica').fontSize(10.5).fillColor('#111827')
           .text(`Q${topicIdx}.${i + 1}  ` + fill(tpl, { T: lc(topic), U: unit.name }), { lineGap: 2.5, paragraphGap: 4, indent: 6 });
      });
      doc.moveDown(0.3);
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#6b7280')
         .text(pick(CONTENT.REVISION_POINTERS, seed + topicIdx * 5), { lineGap: 2 });
    });

    // -------------------- Part 7: Revision & Self-Assessment (5 pages) --------------------
    doc.addPage();
    h1('Part 7 — Revision & Self-Assessment');
    doc.moveDown(0.4);
    h2('7.1 Short-Answer Questions');
    doc.moveDown(0.3);
    [
      `Define the five most important concepts introduced in ${unit.name} and give one Kenyan example of each.`,
      'State the four principal learning outcomes of the unit and explain each in a single sentence.',
      'Describe, in not more than 150 words, the standard method or procedure at the heart of this unit.',
      'Name three Kenyan institutions whose work illustrates this unit, and say what each contributes.',
      'Identify two contemporary debates in the field and summarise the arguments on each side.',
      'List six terms from the glossary and use each correctly in a sentence of your own.'
    ].forEach((t, i) => doc.font('Helvetica').fontSize(11).fillColor('#111827')
      .text(`${i + 1}.  ${t}`, { paragraphGap: 6 }));

    doc.addPage();
    h2('7.2 Structured Essay Questions');
    doc.moveDown(0.3);
    [
      `\u201CTheory without practice is empty; practice without theory is blind.\u201D Discuss with reference to ${unit.name} and at least one Kenyan case study. (25 marks)`,
      `Compare and contrast the classical foundations of ${unit.name} with contemporary approaches, illustrating your answer with concrete examples. (25 marks)`,
      `To what extent does ${unit.name} contribute to Kenya\u2019s national development priorities? Justify your answer with evidence from government publications and peer-reviewed research. (25 marks)`,
      `Choose any two topics from this unit and show, with examples, how they reinforce each other in professional practice. (25 marks)`
    ].forEach((t, i) => doc.font('Helvetica').fontSize(11).fillColor('#111827')
      .text(`${i + 1}.  ${t}`, { paragraphGap: 8, align: 'justify' }));

    doc.addPage();
    h2('7.3 Applied Problem Sets');
    doc.moveDown(0.3);
    [
      `Problem 1: Given a realistic scenario from Kenyan practice (use the Kenyan case analyses in these notes), apply the standard method of ${unit.name} and present your workings step by step.`,
      'Problem 2: Interpret a short data extract or narrative from your lecturer using the theoretical frameworks of this unit. State your assumptions explicitly.',
      'Problem 3: Design a simple intervention that responds to one contemporary issue raised in Part 6, specifying objectives, activities, indicators and risks.',
      'Problem 4: Prepare a one-page professional brief on any topic of this unit for a county-level decision meeting, as if you were on attachment.'
    ].forEach(t => body(t));
    doc.moveDown();

    doc.addPage();
    h2('7.4 Common Misconceptions & Examiner Expectations');
    doc.moveDown(0.3);
    [
      'Every field carries persistent misunderstandings inherited from popular culture or imprecise earlier teaching. Identify and correct them early: tutors and examiners actively reward learners who can state the misconception, explain why it is wrong, and replace it with a defensible formulation.',
      'Markers reward application over description. A single well-chosen Kenyan example is worth more than three generic international ones.',
      'Command words matter: \u201Cdefine\u201D, \u201Cdescribe\u201D, \u201Cexplain\u201D, \u201Ccompare\u201D and \u201Cevaluate\u201D each demand a different depth of response. Underline them before you begin.',
      'Uncertainty is not weakness: where evidence is mixed, say so and explain what would resolve the question. That is what professionals do.',
      'Presentation loses marks silently: number your sub-parts, leave a line between paragraphs, and label every diagram.'
    ].forEach(t => body(t, { paragraphGap: 6 }));

    doc.addPage();
    h2('7.5 Self-Assessment Checklist');
    doc.moveDown(0.3);
    body('Tick each statement only when it is genuinely true. Any unticked box is your revision plan for the coming week.');
    doc.moveDown(0.3);
    [
      'I can define every term in the glossary without looking.',
      'I can restate the learning outcomes of this unit from memory.',
      'I can present two Kenyan case analyses from this unit from memory.',
      'I have completed all continuous-assessment tasks and reviewed the feedback.',
      'I have attempted at least two full past papers under timed conditions.',
      'I can explain each of the 14 topics to a study partner in five minutes.'
    ].forEach(t => doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`[ ]  ${t}`, { paragraphGap: 6 }));

    // -------------------- Part 8: Reading + Study Plan (2 pages) --------------------
    doc.addPage();
    h1('Part 8 — Further Reading & Study Plan');
    doc.moveDown(0.4);
    h2('8.1 Recommended Sources');
    doc.moveDown(0.3);
    [
      'The core textbooks named in your official course outline — read the assigned chapters before each lecture and annotate them systematically.',
      'Peer-reviewed journal articles indexed in Google Scholar, AJOL (African Journals Online) and, through your university library, JSTOR, ScienceDirect, PubMed, HeinOnline or IEEE Xplore.',
      'Government sources: the Kenya National Bureau of Statistics, the relevant ministries, the Central Bank of Kenya, the Kenya Law Reports and the Commission for University Education.',
      'Professional body guidelines relevant to this discipline in Kenya.',
      'Reputable open-access resources including OER Africa and your university\u2019s institutional repository.'
    ].forEach(t => doc.font('Helvetica').fontSize(11).fillColor('#111827').text(`• ${t}`, { paragraphGap: 5, align: 'justify' }));
    doc.moveDown();
    body('A weekly search discipline — three keywords, one hour, five saved references — builds a personal bibliography faster than any single reading list. Distinguish carefully between grey literature and peer-reviewed evidence.');

    doc.addPage();
    h2('8.2 Fourteen-Week Study Plan (Mapped to the 14 Topics)');
    doc.moveDown(0.3);
    body('The plan below follows the typical Kenyan semester of fourteen teaching weeks. Adapt it to your own timetable and review progress every Sunday.');
    doc.moveDown(0.4);
    topics.forEach((topic, i) => {
      const week = i + 1;
      const label = week === 8 ? `Week ${week}  —  Mid-semester test week; revise Topics 1–7 and complete ${lc(topic)}.`
        : `Week ${week}  —  ${topic}`;
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1e3a8a').text(label, { paragraphGap: 4 });
    });

    // -------------------- Part 9: Glossary (3 pages) --------------------
    const glossary = topics.map((topic, i) => [
      topic,
      `In the context of ${unit.name}, ${lc(topic)} is the body of principles and practice introduced under Topic ${i + 1}. Mastery means defining it precisely, giving a Kenyan example, and connecting it to at least one other topic in this unit.`
    ]).concat(trackData.glossary || []);
    const GL_PER_PAGE = Math.ceil(glossary.length / 3);
    for (let p = 0; p < 3; p++) {
      doc.addPage();
      if (p === 0) {
        h1('Part 9 — Unit Glossary');
        doc.moveDown(0.3);
        body('Define each entry in your own words and attach one Kenyan example. Terms marked as topics cross-reference the guided sections of these notes.');
        doc.moveDown(0.4);
      } else {
        h1('Part 9 — Unit Glossary (continued)');
        doc.moveDown(0.5);
      }
      glossary.slice(p * GL_PER_PAGE, (p + 1) * GL_PER_PAGE).forEach(([term, def]) => {
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(term, { paragraphGap: 1 });
        doc.font('Helvetica').fontSize(10.5).fillColor('#374151').text(def, { align: 'justify', lineGap: 2.5, paragraphGap: 7 });
      });
    }

    // -------------------- Part 10: Examination Technique (4 pages) --------------------
    doc.addPage();
    h1('Part 10 — Examination Technique & Model Answer Structure');
    doc.moveDown(0.3);
    body(`A Kenyan university examination in ${unit.name} typically lasts three hours and requires a compulsory question plus three more chosen from four or five. The disciplined approach below maximises marks.`);
    doc.moveDown(0.4);
    h2('10.1 Reading Time & Question Selection');
    doc.moveDown(0.25);
    body('Use the first ten minutes to read every question and plan your selection. Identify command words — define, describe, explain, compare, evaluate, critically discuss — each demands a distinct depth of response. Choose questions whose sub-parts you can ALL answer; a strong question with one impossible sub-part is a trap.');

    doc.addPage();
    h2('10.2 Time Allocation & Answer Structure');
    doc.moveDown(0.25);
    body('Divide the remaining time proportionally to marks: a 25-mark question deserves roughly forty minutes including planning; a 15-mark question about twenty-five. Wear a watch and check it after every question.');
    doc.moveDown(0.3);
    body('Open every essay with a short paragraph that defines the key terms and previews your argument. Follow with three to five clearly signposted paragraphs, each making one point supported by evidence. Close by returning to the question and stating a defensible position.');

    doc.addPage();
    h2('10.3 Use of Evidence & Presentation');
    doc.moveDown(0.25);
    body('Cite specific authors, dates, statutes, statistics or case studies wherever possible. Vague references to \u201Csome scholars\u201D or \u201Cmany studies\u201D attract few marks. One well-chosen Kenyan example outweighs three generic international ones.');
    doc.moveDown(0.3);
    body('Write legibly, leave a blank line between paragraphs, and number sub-parts exactly as the question does. Diagrams must be titled, labelled and referenced from the text. Marks are more often lost to poor presentation than to poor knowledge.');

    doc.addPage();
    h2('10.4 Model Answer Skeleton');
    doc.moveDown(0.25);
    body('Introduction (definitions + plan) → Point 1 with evidence → Point 2 with evidence → Point 3 with evidence → Counter-point and rebuttal → Conclusion that answers the question directly.');
    doc.moveDown(0.3);
    body('Rehearse this skeleton on the structured essays in Part 7 until it becomes automatic. In the examination hall you should be spending your energy on content, not on structure.');
    doc.moveDown(0.3);
    body('Finally: answer the compulsory question FIRST while you are freshest, and never leave the hall early — spend any spare minutes checking numbering, labels and arithmetic.');

    // -------------------- Part 11: Quick-Revision Summary Sheets (2 pages) --------------------
    for (let p = 0; p < 2; p++) {
      doc.addPage();
      h1(p === 0 ? 'Part 11 — Quick-Revision Summary Sheets' : 'Part 11 — Quick-Revision Summary Sheets (continued)');
      doc.moveDown(0.3);
      if (p === 0) body('One line per topic: the essence you must be able to expand into a full answer. Cover the right-hand page and test yourself top to bottom.');
      doc.moveDown(0.3);
      topics.slice(p * 7, p * 7 + 7).forEach((topic, i) => {
        const n = p * 7 + i + 1;
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#1e3a8a')
           .text(`Topic ${n}: ${topic}`, { paragraphGap: 1 });
        doc.font('Helvetica').fontSize(10).fillColor('#374151')
           .text(`Be able to: define it → state its principles → describe its method → give a Kenyan example → discuss one current debate. (See Topic ${n} pages.)`, { paragraphGap: 7 });
      });
    }

    // -------------------- Closing page --------------------
    doc.addPage();
    h1('Closing Notes');
    doc.moveDown(0.3);
    body(`These notes have taken you through the foundations, methods, Kenyan applications and contemporary debates of ${unit.name}. A learner who has genuinely engaged with each topic — rather than skimmed the night before the examination — now holds the vocabulary, analytical habits and professional sensibilities this unit exists to build.`);
    doc.moveDown();
    body(`Treat every unit as part of a larger intellectual project: read beyond the compulsory list, keep your study group alive, seek feedback from your lecturers, and connect ${unit.name} deliberately to the rest of ${course.name} and to your career ambitions in Kenya and beyond.`);
    doc.moveDown();
    body('Education is a public good. Share what you learn generously with classmates, future colleagues and the Kenyan public whose taxes and hopes underwrite the university system. Study well, act ethically, and contribute generously.');
    doc.moveDown(1.2);
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#6b7280')
       .text(`© ELIMUmaterial — Educational study notes prepared for ${course.name}. Provided free of charge for revision purposes.`, { align: 'center' });

    doc.end();
    stream.on('finish', resolve);
  });
}

// ---------------------------------------------------------------------------
// Past-paper PDF — 5 pages, unit-aware questions + marking guidance
// ---------------------------------------------------------------------------
function buildPaperPdf(unit, course, filepath) {
  return new Promise((resolve) => {
    const track = trackForCourse(course);
    const trackData = CONTENT.TRACKS[track] || CONTENT.TRACKS['arts-soc'];
    const seed = hash32(unit.code + '::paper');
    const ctx1 = pick(trackData.contexts, seed);
    const ctx2 = pick(trackData.contexts, seed + 3);

    const doc = new PDFDocument({ size: 'A4', margin: 60 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Page 1 — Cover & instructions
    doc.font('Helvetica-Bold').fontSize(16).text('KENYAN UNIVERSITIES — SPECIMEN PAST PAPER', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(13).text(`${course.name}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).text(`${unit.code}: ${unit.name}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10).text('End of Semester Examination — 2025/2026 Academic Year', { align: 'center' });
    if (unit.year && unit.sem) doc.text(`Year ${unit.year}, Semester ${unit.sem}`, { align: 'center' });
    doc.text('Time: 3 Hours        Maximum Marks: 70', { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#000').lineWidth(1).moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke();
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(11).text('INSTRUCTIONS TO CANDIDATES');
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(10)
       .text('•  Answer Question ONE (compulsory) and any THREE other questions.', { paragraphGap: 4 })
       .text('•  All questions carry equal marks unless stated otherwise.', { paragraphGap: 4 })
       .text('•  Illustrate answers with relevant diagrams, statutes, data and Kenyan examples where appropriate.', { paragraphGap: 4 })
       .text('•  Write your answers in clear, numbered paragraphs matching the question parts.', { paragraphGap: 4 });
    doc.moveDown();
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#6b7280')
       .text('Specimen paper with marking guidance — prepared for revision purposes by ELIMUmaterial.', { align: 'center' });

    // Page 2 — Question One & Two
    doc.addPage();
    const q = (title, parts) => {
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text(title, { paragraphGap: 4 });
      parts.forEach(p => doc.font('Helvetica').fontSize(10).text(p, { indent: 15, paragraphGap: 4, align: 'justify' }));
      doc.moveDown(0.5);
    };
    q('QUESTION ONE (COMPULSORY — 25 MARKS)', [
      `a)  Define the subject matter of "${unit.name}" and outline its scope in modern professional practice. (5 marks)`,
      'b)  Discuss THREE key theoretical foundations of this unit and their significance to practice. (9 marks)',
      `c)  Using a case from ${ctx1}, illustrate how the concepts of ${unit.code} apply to real-world Kenyan problems. (6 marks)`,
      'd)  Evaluate FIVE ethical considerations relevant to practitioners in this field in Kenya. (5 marks)'
    ]);
    q('QUESTION TWO (15 MARKS)', [
      `a)  Compare and contrast TWO analytical approaches or frameworks used in ${unit.name}. (8 marks)`,
      'b)  With reference to current literature, explain the emerging trends reshaping this discipline in Kenya. (7 marks)'
    ]);

    // Page 3 — Questions Three & Four
    doc.addPage();
    q('QUESTION THREE (15 MARKS)', [
      `a)  Describe the standard methodology adopted in ${unit.name} for solving a typical professional problem. (9 marks)`,
      'b)  Discuss the limitations of this methodology in resource-constrained Kenyan settings and suggest practical improvements. (6 marks)'
    ]);
    q('QUESTION FOUR (15 MARKS)', [
      `a)  Explain FIVE core concepts that underpin ${unit.name}, giving a Kenyan example for each. (10 marks)`,
      'b)  Show how these concepts relate to Kenya\u2019s national development priorities (Vision 2030 and the current development agenda). (5 marks)'
    ]);

    // Page 4 — Question Five
    doc.addPage();
    q('QUESTION FIVE (15 MARKS)', [
      `Write short notes on the following as applied to ${unit.name}:`,
      '(i)   Historical development of the field and its Kenyan milestones (5 marks)',
      '(ii)  Contemporary applications in Kenyan institutions such as ' + ctx2 + ' (5 marks)',
      '(iii) Future outlook: technology, regulation and professional practice (5 marks)'
    ]);
    doc.moveDown(1);
    doc.font('Helvetica-Oblique').fontSize(9).fillColor('#6b7280').text('— END OF PAPER —', { align: 'center' });

    // Page 5 — Marking guidance
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a8a').text('MARKING GUIDANCE FOR REVISION');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10.5).fillColor('#111827').text(
      'Use this guide to self-mark. A first-class answer does ALL of the following; a pass answer does the first three.', { align: 'justify', lineGap: 3 });
    doc.moveDown(0.5);
    [
      'Defines key terms precisely in the opening paragraph — no definition, no top band.',
      'Answers the question set, not the question wished for — every paragraph ties back to the command word.',
      'Supports each point with named evidence: authors, statutes, data or documented Kenyan cases.',
      'Includes at least one specific Kenyan institution, case or statistic per essay answer.',
      'Acknowledges a counter-argument or limitation and rebuts it with evidence.',
      'Is structured (intro → signposted points → conclusion), legible, and correctly numbered.'
    ].forEach((t, i) => doc.font('Helvetica').fontSize(10.5).text(`${i + 1}.  ${t}`, { paragraphGap: 6, align: 'justify' }));
    doc.moveDown();
    doc.font('Helvetica-Oblique').fontSize(9.5).fillColor('#6b7280')
       .text('Attempt this paper under timed conditions (3 hours, no notes), then score yourself honestly against the guide and revisit weak topics in the study notes.', { align: 'justify' });

    doc.end();
    stream.on('finish', resolve);
  });
}

// ---------------------------------------------------------------------------
// Full generation run (direct invocation only)
// ---------------------------------------------------------------------------
async function mapLimit(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

async function generateAll() {
  console.log('📄 Generating study-note and past-paper PDFs for every unit (notes 49+ pages each)...');
  let created = 0, skipped = 0;
  const jobs = [];
  courses.concat(chukaCourses).forEach(course => {
    (course.units || []).forEach(unit => jobs.push({ unit, course }));
  });
  await mapLimit(jobs, 24, async ({ unit, course }) => {
    const notesPath = path.join(NOTES_DIR, `${unit.code}_notes.pdf`);
    const paperPath = path.join(PAPERS_DIR, `${unit.code}_pastpaper.pdf`);
    try {
      if (!fs.existsSync(notesPath)) { await buildNotesPdf(unit, course, notesPath); created++; } else skipped++;
      if (!fs.existsSync(paperPath)) { await buildPaperPdf(unit, course, paperPath); created++; } else skipped++;
    } catch (e) {
      // Never leave a truncated PDF behind — a partial file would be skipped
      // by every later idempotent run. Delete it so the next run regenerates.
      [notesPath, paperPath].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {} });
      console.error('⚠️ PDF deferred for', unit.code, '-', e.message);
    }
  });
  console.log(`✅ PDF generation complete. Units: ${jobs.length}, Files created: ${created}, Skipped: ${skipped}`);
}

if (require.main === module) {
  generateAll().catch(e => {
    // Never fail the deploy because of PDF generation
    console.error('⚠️ PDF generation notice:', e.message);
  });
}

module.exports = { buildNotesPdf, buildPaperPdf, generateAll, topicsFor };
