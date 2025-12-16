const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Adding completion fields to HRRequests table...');

db.serialize(() => {
  db.all("PRAGMA table_info(HRRequests)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      db.close();
      return;
    }

    const existingColumns = columns.map(col => col.name);
    const columnsToAdd = [];

    if (!existingColumns.includes('completionNote')) {
      columnsToAdd.push({ name: 'completionNote', sql: 'ALTER TABLE HRRequests ADD COLUMN completionNote TEXT' });
    }
    if (!existingColumns.includes('completedAt')) {
      columnsToAdd.push({ name: 'completedAt', sql: 'ALTER TABLE HRRequests ADD COLUMN completedAt DATETIME' });
    }

    if (columnsToAdd.length === 0) {
      console.log('All completion columns already exist');
      db.close();
      return;
    }

    let completed = 0;
    columnsToAdd.forEach(col => {
      db.run(col.sql, (err) => {
        if (err) {
          console.error(`Error adding ${col.name} column:`, err);
        } else {
          console.log(`Successfully added ${col.name} column`);
        }
        completed++;
        if (completed === columnsToAdd.length) {
          db.close();
        }
      });
    });
  });
});
