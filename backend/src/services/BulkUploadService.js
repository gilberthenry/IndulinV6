const fs = require('fs');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Validate required fields
          if (!row.employeeId || !row.fullName || !row.email || !row.password) {
            errors.push(`Row skipped: Missing required fields (employeeId: ${row.employeeId}, fullName: ${row.fullName}, email: ${row.email})`);
            return;
          }

          // Store row for processing (password will be hashed later)
          results.push({
            employeeId: row.employeeId.trim(),
            fullName: row.fullName.trim(),
            email: row.email.trim(),
            password: row.password.trim(), // Will be hashed later
            contactNumber: row.contactNumber?.trim() || null,
            role: row.role?.trim() || 'employee',
            status: row.status?.trim() || 'active',
            dateOfBirth: row.dateOfBirth?.trim() || null,
            placeOfBirth: row.placeOfBirth?.trim() || null,
            sex: row.sex?.trim() || null,
            civilStatus: row.civilStatus?.trim() || null,
            citizenship: row.citizenship?.trim() || 'Filipino',
            gsisIdNo: row.gsisIdNo?.trim() || null,
            pagibigIdNo: row.pagibigIdNo?.trim() || null,
            philhealthNo: row.philhealthNo?.trim() || null,
            sssNo: row.sssNo?.trim() || null,
            tinNo: row.tinNo?.trim() || null,
            residentialAddress: row.residentialAddress?.trim() || null,
            permanentAddress: row.permanentAddress?.trim() || null,
            emergencyContactName: row.emergencyContactName?.trim() || null,
            emergencyContactNumber: row.emergencyContactNumber?.trim() || null,
            emergencyContactRelationship: row.emergencyContactRelationship?.trim() || null
          });
        } catch (error) {
          errors.push(`Row skipped: ${error.message} (employeeId: ${row.employeeId})`);
        }
      })
      .on('end', async () => {
        try {
          if (errors.length > 0) {
            console.log('Parsing errors:', errors);
          }
          
          // Hash passwords for all employees
          const employeesWithHashedPasswords = await Promise.all(
            results.map(async (employee) => ({
              ...employee,
              password: await bcrypt.hash(employee.password, 10)
            }))
          );
          
          resolve(employeesWithHashedPasswords);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => reject(err));
  });
}

module.exports = { parseCSV };