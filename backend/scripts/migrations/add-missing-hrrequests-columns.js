const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Adding missing columns to HRRequests table...');

db.serialize(() => {
  db.all("PRAGMA table_info(HRRequests)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      db.close();
      return;
    }

    const existingColumns = columns.map(col => col.name);
    const columnsToAdd = [];

    if (!existingColumns.includes('title')) {
      columnsToAdd.push({ name: 'title', sql: 'ALTER TABLE HRRequests ADD COLUMN title VARCHAR(255)' });
    }
    if (!existingColumns.includes('description')) {
      columnsToAdd.push({ name: 'description', sql: 'ALTER TABLE HRRequests ADD COLUMN description TEXT' });
    }
    if (!existingColumns.includes('priority')) {
      columnsToAdd.push({ name: 'priority', sql: 'ALTER TABLE HRRequests ADD COLUMN priority VARCHAR(50) DEFAULT "medium"' });
    }
    if (!existingColumns.includes('requestType')) {
      columnsToAdd.push({ name: 'requestType', sql: 'ALTER TABLE HRRequests ADD COLUMN requestType VARCHAR(100)' });
    }

    if (columnsToAdd.length === 0) {
      console.log('All columns already exist');
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
