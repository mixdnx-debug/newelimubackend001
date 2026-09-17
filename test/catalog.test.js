/**
 * ELIMUmaterial — automated catalog integrity tests (no dependencies).
 * Run: npm test
 *
 * Guards the guarantees the platform makes:
 *   1. Every course covers semesters 1.1 → 4.2 with 11–15 units per semester.
 *   2. No duplicate unit codes WITHIN the master catalog or WITHIN the Chuka
 *      overlay (codes are the PDF filename key — a duplicate would overwrite
 *      another unit's PDF).
 *   3. New Chuka programmes exist under the correct official faculties.
 *   4. Expansion is idempotent (re-running changes nothing).
 *   5. Every generated unit has code/name/year/sem in range.
 *   6. Chuka faculties match the official list (no typos/renames).
 */
const assert = require('assert');
const catalog = require('../seed/catalog');
const chuka = require('../seed/chukaCatalog');
const { expandChukaCourses } = require('../seed/yearExpansion');

let passed = 0;
function ok(name) { passed++; console.log('  ✓', name); }

// ---- 1. Semester coverage: 1.1 → 4.2, 11–15 units each ---------------------
function checkCoverage(courses, label) {
  for (const c of courses) {
    const perSem = {};
    for (const u of c.units) {
      assert(u.code && u.name, `${label}: unit missing code/name in ${c.id}`);
      assert(u.year >= 1 && u.year <= 4 && (u.sem === 1 || u.sem === 2),
        `${label}: ${u.code} has invalid year/sem (${u.year}.${u.sem})`);
      const k = `${u.year}.${u.sem}`;
      perSem[k] = (perSem[k] || 0) + 1;
    }
    for (let y = 1; y <= 4; y++) for (let s = 1; s <= 2; s++) {
      const k = `${y}.${s}`;
      assert(perSem[k], `${label}: ${c.id} has no units for semester ${k}`);
      assert(perSem[k] >= 11, `${label}: ${c.id} semester ${k} has only ${perSem[k]} units (<11)`);
      assert(perSem[k] <= 15, `${label}: ${c.id} semester ${k} has ${perSem[k]} units (>15)`);
    }
  }
}
checkCoverage(chuka.chukaCourses, 'chuka');
ok(`Chuka: all ${chuka.chukaCourses.length} courses cover 1.1–4.2 with 11–15 units/semester`);
checkCoverage(catalog.courses, 'master');
ok(`Master: all ${catalog.courses.length} courses cover 1.1–4.2 with 11–15 units/semester`);

// ---- 2. No duplicate codes within each catalog ------------------------------
function checkUnique(courses, label) {
  const seen = new Set();
  for (const c of courses) for (const u of c.units) {
    const k = String(u.code).toUpperCase();
    assert(!seen.has(k), `${label}: duplicate unit code ${u.code} (in ${c.id})`);
    seen.add(k);
  }
}
checkUnique(chuka.chukaCourses, 'chuka');
ok('Chuka: no duplicate unit codes');
checkUnique(catalog.courses, 'master');
ok('Master: no duplicate unit codes');

// ---- 3. New 2026 Chuka programmes exist with correct placement --------------
const expected = [
  { id: 'chuka-bsc-econstat', name: /economics & statistics/i, fac: 'chuka-fac-biz' },
  { id: 'chuka-bsc-actsci',   name: /actuarial/i,              fac: 'chuka-fac-biz' },
  { id: 'chuka-bba',          name: /business administration/i, fac: 'chuka-fac-biz' },
  { id: 'chuka-ba-ecosoc',    name: /economics & sociology/i,  fac: 'chuka-fac-hum' }
];
for (const e of expected) {
  const c = chuka.chukaCourses.find(x => x.id === e.id);
  assert(c, `missing programme ${e.id}`);
  assert(e.name.test(c.name), `${e.id}: unexpected name "${c.name}"`);
  assert.strictEqual(c.facultyId, e.fac, `${e.id}: wrong faculty ${c.facultyId}`);
  assert(c.units.length >= 88, `${e.id}: only ${c.units.length} units`);
}
ok('New Chuka programmes present and correctly placed');

// ---- 4. Idempotent expansion ------------------------------------------------
const again = expandChukaCourses(chuka.chukaCourses);
assert.strictEqual(again.length, chuka.chukaCourses.length);
again.forEach((c, i) => assert.strictEqual(c.units.length, chuka.chukaCourses[i].units.length,
  `idempotency: ${c.id} changed on re-expansion`));
ok('Expansion is idempotent');

// ---- 5. Unit field sanity ----------------------------------------------------
for (const c of chuka.chukaCourses.concat(catalog.courses)) {
  for (const u of c.units) {
    assert(typeof u.name === 'string' && u.name.length > 2, `${c.id}: bad unit name`);
    assert(/^[A-Z0-9]+$/i.test(u.code), `${c.id}: suspicious code ${u.code}`);
    assert(Number.isInteger(u.pages) && u.pages > 0, `${c.id}: bad page count for ${u.code}`);
  }
}
ok('All units have valid code/name/pages/year/sem');

// ---- 6. Official Chuka faculty list intact -----------------------------------
const officialFaculties = [
  'Faculty of Agriculture', 'Faculty of Business Studies',
  'Faculty of Education and Resources Development', 'Faculty of Engineering',
  'Faculty of Environmental Studies & Resource Development',
  'Faculty of Humanities & Social Sciences', 'Faculty of Science & Technology',
  'School of Nursing and Public Health', 'School of Law'
];
assert.strictEqual(chuka.chukaFaculties.length, officialFaculties.length);
officialFaculties.forEach(name =>
  assert(chuka.chukaFaculties.some(f => f.name === name), `missing Chuka faculty: ${name}`));
// Every Chuka course points at an existing Chuka faculty.
chuka.chukaCourses.forEach(c =>
  assert(chuka.chukaFaculties.some(f => f.id === c.facultyId),
    `${c.id} references unknown faculty ${c.facultyId}`));
ok('Official Chuka faculty list intact; every course resolves to a real faculty');

// ---- Summary ------------------------------------------------------------------
const totalUnits = chuka.chukaCourses.reduce((a, c) => a + c.units.length, 0)
  + catalog.courses.reduce((a, c) => a + c.units.length, 0);
console.log(`\n✅ ALL TESTS PASSED (${passed} suites) — ${totalUnits.toLocaleString()} units verified across ${catalog.courses.length + chuka.chukaCourses.length} courses.`);
