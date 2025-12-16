const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Adding type column to HRRequests table...');

db.serialize(() => {
  // Check if column exists first
  db.all("PRAGMA table_info(HRRequests)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      db.close();
      return;
    }

    const hasTypeColumn = columns.some(col => col.name === 'type');
    
    if (hasTypeColumn) {
      console.log('Column "type" already exists in HRRequests table');
      db.close();
      return;
    }

    // Add the type column
    db.run(`ALTER TABLE HRRequests ADD COLUMN type VARCHAR(255)`, (err) => {
      if (err) {
        console.error('Error adding type column:', err);
      } else {
        console.log('Successfully added type column to HRRequests table');
      }
      db.close();
    });
  });
});
