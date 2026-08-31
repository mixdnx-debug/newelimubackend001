const express = require('express');
const path = require('path');
const catalog = require(path.join(__dirname, '..', 'seed', 'catalog.js'));
const chukaCatalog = require(path.join(__dirname, '..', 'seed', 'chukaCatalog.js'));
const { decorateUnits } = require('../utils/pdfPages');

const router = express.Router();

// ------------------------------------------------------------------
// Chuka University overlay
// ------------------------------------------------------------------
// Chuka has its own official faculties/schools and its own programme list
// (Chuka Academic Programmes 2026). We keep the master catalog untouched and
// resolve Chuka-specific data from a dedicated overlay. Every other
// university continues to use the shared master catalog exactly as before.
const CHUKA_ID = 'chuka';
const chukaFacultyIds = new Set(chukaCatalog.chukaFaculties.map(f => f.id));
const chukaCourseIds  = new Set(chukaCatalog.chukaCourses.map(c => c.id));
const findChukaCourse   = id => chukaCatalog.chukaCourses.find(c => c.id === id);
const findChukaFaculty  = id => chukaCatalog.chukaFaculties.find(f => f.id === id);

// Get all universities
router.get('/universities', (req, res) => {
  res.json(catalog.universities.map(u => ({ id: u.id, name: u.name, shortName: u.shortName, location: u.location })));
});

// Get faculties for a university
router.get('/universities/:uniId/faculties', (req, res) => {
  const uni = catalog.universities.find(u => u.id === req.params.uniId);
  if (!uni) return res.status(404).json({ error: 'University not found' });
  // Chuka University uses its own official 2026 faculty/school list.
  if (uni.id === CHUKA_ID) return res.json(chukaCatalog.chukaFaculties);
  // Universities share the master faculty list – realistic for Kenyan public/private universities
  res.json(catalog.faculties);
});

// Get courses for a faculty
router.get('/faculties/:facId/courses', (req, res) => {
  // Chuka faculties resolve against the Chuka overlay only.
  if (chukaFacultyIds.has(req.params.facId)) {
    const fac = findChukaFaculty(req.params.facId);
    if (!fac) return res.status(404).json({ error: 'Faculty not found' });
    const courses = chukaCatalog.chukaCourses.filter(c => c.facultyId === fac.id);
    return res.json(courses);
  }
  const fac = catalog.faculties.find(f => f.id === req.params.facId);
  if (!fac) return res.status(404).json({ error: 'Faculty not found' });
  const courses = catalog.courses.filter(c => c.facultyId === fac.id);
  res.json(courses);
});

// Get units for a course — units are decorated with the REAL page count of
// each unit's generated notes PDF (falls back to the catalog value if unknown).
router.get('/courses/:courseId/units', (req, res) => {
  // Chuka-specific courses first (namespaced ids never collide with master).
  if (chukaCourseIds.has(req.params.courseId)) {
    const course = findChukaCourse(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.json({ course, units: decorateUnits(course.units) });
  }
  const course = catalog.courses.find(c => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ course, units: decorateUnits(course.units) });
});

// Get one course with everything embedded
router.get('/courses/:courseId', (req, res) => {
  if (chukaCourseIds.has(req.params.courseId)) {
    const course = findChukaCourse(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const faculty = findChukaFaculty(course.facultyId);
    return res.json({ course, faculty });
  }
  const course = catalog.courses.find(c => c.id === req.params.courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const faculty = catalog.faculties.find(f => f.id === course.facultyId);
  res.json({ course, faculty });
});

// Search across everything
router.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ courses: [], units: [], universities: [] });

  const masterCourses = catalog.courses
    .filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  const chukaMatchedCourses = chukaCatalog.chukaCourses
    .filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  const courses = masterCourses.concat(chukaMatchedCourses).slice(0, 20);

  const units = [];
  catalog.courses.forEach(c => {
    c.units.forEach(u => {
      if (u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q)) {
        units.push({ ...u, courseName: c.name, courseId: c.id });
      }
    });
  });
  chukaCatalog.chukaCourses.forEach(c => {
    c.units.forEach(u => {
      if (u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q)) {
        units.push({ ...u, courseName: c.name, courseId: c.id });
      }
    });
  });
  const universities = catalog.universities
    .filter(u => u.name.toLowerCase().includes(q) || u.shortName.toLowerCase().includes(q))
    .slice(0, 20);

  res.json({ courses, units: units.slice(0, 30), universities });
});

// Stats endpoint (used on home page)
router.get('/stats', (req, res) => {
  let unitCount = 0;
  catalog.courses.forEach(c => { unitCount += c.units.length; });
  chukaCatalog.chukaCourses.forEach(c => { unitCount += c.units.length; });
  res.json({
    universities: catalog.universities.length,
    faculties: catalog.faculties.length + chukaCatalog.chukaFaculties.length,
    courses: catalog.courses.length + chukaCatalog.chukaCourses.length,
    units: unitCount
  });
});

module.exports = router;
