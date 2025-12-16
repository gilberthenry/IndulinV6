const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Adding details column to HRRequests table...');

db.serialize(() => {
  // Check if column exists first
  db.all("PRAGMA table_info(HRRequests)", (err, columns) => {
    if (err) {
      console.error('Error checking table:', err);
      db.close();
      return;
    }

    const hasDetailsColumn = columns.some(col => col.name === 'details');
    
    if (hasDetailsColumn) {
      console.log('Column "details" already exists in HRRequests table');
      db.close();
      return;
    }

    // Add the details column
    db.run(`ALTER TABLE HRRequests ADD COLUMN details TEXT`, (err) => {
      if (err) {
        console.error('Error adding details column:', err);
      } else {
        console.log('Successfully added details column to HRRequests table');
      }
      db.close();
    });
  });
});
