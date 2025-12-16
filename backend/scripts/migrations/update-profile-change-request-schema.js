require('dotenv').config();
const sequelize = require('../../src/config/db');

async function migrateProfileChangeRequestTable() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Starting ProfileChangeRequest table migration...');
    
    // Drop the old 'changes' column if it exists
    try {
      await queryInterface.removeColumn('ProfileChangeRequests', 'changes');
      console.log('✅ Removed old "changes" column');
    } catch (error) {
      console.log('⚠️ Column "changes" does not exist or already removed');
    }
    
    // Add new columns
    const columnsToAdd = [
      {
        name: 'currentValues',
        definition: {
          type: sequelize.Sequelize.JSON,
          allowNull: true
        }
      },
      {
        name: 'requestedChanges',
        definition: {
          type: sequelize.Sequelize.JSON,
          allowNull: true
        }
      },
      {
        name: 'changedFields',
        definition: {
          type: sequelize.Sequelize.JSON,
          allowNull: true
        }
      },
      {
        name: 'reason',
        definition: {
          type: sequelize.Sequelize.TEXT,
          allowNull: true
        }
      },
      {
        name: 'remarks',
        definition: {
          type: sequelize.Sequelize.TEXT,
          allowNull: true
        }
      }
    ];
    
    for (const column of columnsToAdd) {
      try {
        await queryInterface.addColumn('ProfileChangeRequests', column.name, column.definition);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`⚠️ Column "${column.name}" already exists`);
        } else {
          console.error(`❌ Error adding column "${column.name}":`, error.message);
        }
      }
    }
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProfileChangeRequestTable();
