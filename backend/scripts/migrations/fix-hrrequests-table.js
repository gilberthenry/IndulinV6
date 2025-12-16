const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Fixing HRRequests table...');

db.serialize(() => {
  // Temporarily disable foreign key constraints
  db.run('PRAGMA foreign_keys = OFF', (err) => {
    if (err) {
      console.error('Error disabling foreign keys:', err);
      db.close();
      return;
    }

    // Drop existing table
    db.run('DROP TABLE IF EXISTS HRRequests_backup', (err) => {
      if (err) console.error('Error dropping backup:', err);
      
      // Rename current table to backup
      db.run('ALTER TABLE HRRequests RENAME TO HRRequests_backup', (err) => {
        if (err) {
          console.error('Error renaming table:', err);
          db.close();
          return;
        }

        // Create new table without foreign key constraints
        const createTableSQL = `
          CREATE TABLE HRRequests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requestedBy INTEGER NOT NULL,
            targetEmployeeId INTEGER,
            assignedTo INTEGER,
            reviewedBy INTEGER,
            type VARCHAR(255),
            requestType VARCHAR(100),
            title VARCHAR(255),
            description TEXT,
            priority VARCHAR(50) DEFAULT 'medium',
            details TEXT,
            status VARCHAR(50) DEFAULT 'open',
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `;

        db.run(createTableSQL, (err) => {
          if (err) {
            console.error('Error creating new table:', err);
            db.close();
            return;
          }

          // Copy data from backup
          db.run(`
            INSERT INTO HRRequests (id, requestedBy, targetEmployeeId, assignedTo, reviewedBy, type, requestType, title, description, priority, details, status, createdAt, updatedAt)
            SELECT id, requestedBy, targetEmployeeId, assignedTo, reviewedBy, type, requestType, title, description, priority, details, status, createdAt, updatedAt
            FROM HRRequests_backup
          `, (err) => {
            if (err) {
              console.error('Error copying data:', err);
            } else {
              console.log('Data copied successfully');
            }

            // Drop backup table
            db.run('DROP TABLE HRRequests_backup', (err) => {
              if (err) console.error('Error dropping backup:', err);

              // Re-enable foreign keys
              db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) console.error('Error enabling foreign keys:', err);
                console.log('HRRequests table fixed successfully!');
                db.close();
              });
            });
          });
        });
      });
    });
  });
});
