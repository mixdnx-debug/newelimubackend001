// Seed bootstrap: catalog lives in-code (catalog.js); here we seed a welcome
// announcement so the announcements feed is never empty on a fresh deploy.
// Idempotent — runs on every postinstall but only inserts when empty.
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const db = require('../models/db');
    const existing = await db.announcements.count({});
    if (existing === 0) {
      await db.announcements.insert({
        title: 'Welcome to ELIMUmaterial 🎓',
        body: 'Find study notes and past papers for every unit across 30+ Kenyan universities. Set your course in Profile to personalise your dashboard, join a study group, and star your favourite units for quick access.',
        createdBy: 'system',
        createdAt: new Date().toISOString()
      });
      console.log('✅ Seeded welcome announcement.');
    }
    console.log('✅ Catalog seed loaded (in-code catalog.js).');
  } catch (e) {
    // Never fail the build because of seeding
    console.log('⚠️ Seed notice:', e.message);
  }
})();
