const LeaveCredit = require('../models/LeaveCredit');
const Employee = require('../models/Employee');
const Contract = require('../models/Contract');
const Leave = require('../models/Leave');
const { Op } = require('sequelize');

// Leave credit allocation based on employment type
const LEAVE_CREDITS_BY_TYPE = {
  permanent: 15,
  contractual: 10,
  'job-order': 5,
  'part-time': 7
};

// Maximum credits that can be carried over
const MAX_CARRYOVER = 5;

// Helper to get current school year
const getCurrentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  // School year starts in June (month 6)
  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

// Helper to calculate days between two dates
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
  return diffDays;
};

class LeaveCreditService {
  // Initialize leave credits for an employee
  async initializeLeaveCredits(employeeId, employmentType, schoolYear = null) {
    try {
      const sy = schoolYear || getCurrentSchoolYear();
      const credits = LEAVE_CREDITS_BY_TYPE[employmentType] || 10;

      const [leaveCredit, created] = await LeaveCredit.findOrCreate({
        where: {
          employeeId,
          schoolYear: sy
        },
        defaults: {
          employmentType,
          totalCredits: credits,
          usedCredits: 0,
          carriedOverCredits: 0,
          monetizableCredits: 0,
          forfeitedCredits: 0
        }
      });

      return leaveCredit;
    } catch (error) {
      console.error('Error initializing leave credits:', error);
      throw error;
    }
  }

  // Get employee's leave credits for a school year
  async getLeaveCredits(employeeId, schoolYear = null) {
    const sy = schoolYear || getCurrentSchoolYear();
    
    let leaveCredit = await LeaveCredit.findOne({
      where: {
        employeeId,
        schoolYear: sy
      },
      include: [{
        model: Employee,
        attributes: ['id', 'employeeId', 'fullName', 'status']
      }]
    });

    // If not found, try to get employment type from contract and initialize
    if (!leaveCredit) {
      const contract = await Contract.findOne({
        where: {
          employeeId,
          status: 'Active'
        }
      });

      const employmentType = contract?.contractType || 'permanent';
      leaveCredit = await this.initializeLeaveCredits(employeeId, employmentType, sy);
    }

    return leaveCredit;
  }

  // Update leave credits when a leave is approved
  async updateCreditsOnLeaveApproval(leaveId) {
    try {
      const leave = await Leave.findByPk(leaveId);
      if (!leave) throw new Error('Leave not found');

      const schoolYear = leave.schoolYear || getCurrentSchoolYear();
      const days = leave.daysCount || calculateLeaveDays(leave.startDate, leave.endDate);

      let leaveCredit = await LeaveCredit.findOne({
        where: {
          employeeId: leave.employeeId,
          schoolYear
        }
      });

      if (!leaveCredit) {
        // Initialize if not exists
        const contract = await Contract.findOne({
          where: { employeeId: leave.employeeId, status: 'Active' }
        });
        const employmentType = contract?.contractType || 'permanent';
        leaveCredit = await this.initializeLeaveCredits(leave.employeeId, employmentType, schoolYear);
      }

      // Update used credits
      await leaveCredit.update({
        usedCredits: parseFloat(leaveCredit.usedCredits) + parseFloat(days)
      });

      // Update leave with calculated days and school year
      await leave.update({
        daysCount: days,
        schoolYear: schoolYear
      });

      return leaveCredit;
    } catch (error) {
      console.error('Error updating leave credits:', error);
      throw error;
    }
  }

  // Reset leave credits for new school year
  async resetCreditsForNewSchoolYear(schoolYear) {
    try {
      const previousSchoolYear = this.getPreviousSchoolYear(schoolYear);
      
      // Get all active employees
      const employees = await Employee.findAll({
        where: {
          status: {
            [Op.in]: ['active', 'probationary']
          }
        },
        include: [{
          model: Contract,
          where: { status: 'Active' },
          required: false
        }]
      });

      const results = [];

      for (const employee of employees) {
        const activeContract = employee.Contracts?.find(c => c.status === 'Active');
        const employmentType = activeContract?.contractType || 'permanent';

        // Get previous year credits
        const previousCredit = await LeaveCredit.findOne({
          where: {
            employeeId: employee.id,
            schoolYear: previousSchoolYear
          }
        });

        // Calculate carryover and forfeited
        let carriedOver = 0;
        let forfeited = 0;
        let monetizable = 0;

        if (previousCredit) {
          const remaining = parseFloat(previousCredit.totalCredits) + 
                          parseFloat(previousCredit.carriedOverCredits) - 
                          parseFloat(previousCredit.usedCredits);

          if (remaining > 0) {
            carriedOver = Math.min(remaining, MAX_CARRYOVER);
            forfeited = Math.max(0, remaining - MAX_CARRYOVER);
            monetizable = Math.min(remaining, MAX_CARRYOVER);
          }

          // Update previous year record with forfeited amount
          await previousCredit.update({
            forfeitedCredits: forfeited,
            monetizableCredits: monetizable
          });
        }

        // Create new school year credits
        const newCredits = LEAVE_CREDITS_BY_TYPE[employmentType] || 10;
        const [leaveCredit] = await LeaveCredit.findOrCreate({
          where: {
            employeeId: employee.id,
            schoolYear
          },
          defaults: {
            employmentType,
            totalCredits: newCredits,
            usedCredits: 0,
            carriedOverCredits: carriedOver,
            monetizableCredits: 0,
            forfeitedCredits: 0
          }
        });

        results.push({
          employeeId: employee.id,
          employeeName: employee.fullName,
          employmentType,
          newCredits,
          carriedOver,
          forfeited
        });
      }

      return {
        success: true,
        schoolYear,
        employeesProcessed: results.length,
        details: results
      };
    } catch (error) {
      console.error('Error resetting leave credits:', error);
      throw error;
    }
  }

  // Get previous school year
  getPreviousSchoolYear(schoolYear) {
    const [startYear] = schoolYear.split('-').map(Number);
    return `${startYear - 1}-${startYear}`;
  }

  // Update employment type and recalculate credits
  async updateEmploymentType(employeeId, newEmploymentType, schoolYear = null) {
    try {
      const sy = schoolYear || getCurrentSchoolYear();
      
      let leaveCredit = await LeaveCredit.findOne({
        where: {
          employeeId,
          schoolYear: sy
        }
      });

      if (!leaveCredit) {
        return await this.initializeLeaveCredits(employeeId, newEmploymentType, sy);
      }

      const newCredits = LEAVE_CREDITS_BY_TYPE[newEmploymentType] || 10;
      
      // Update employment type and total credits (preserve used and carried over)
      await leaveCredit.update({
        employmentType: newEmploymentType,
        totalCredits: newCredits
      });

      return leaveCredit;
    } catch (error) {
      console.error('Error updating employment type:', error);
      throw error;
    }
  }

  // Get all leave credits for all employees (for HR dashboard)
  async getAllLeaveCredits(schoolYear = null) {
    const sy = schoolYear || getCurrentSchoolYear();
    
    const credits = await LeaveCredit.findAll({
      where: {
        schoolYear: sy
      },
      include: [{
        model: Employee,
        attributes: ['id', 'employeeId', 'fullName', 'email', 'status']
      }],
      order: [['employeeId', 'ASC']]
    });

    return credits;
  }

  // Get leave credit summary by employment type
  async getCreditSummaryByType(schoolYear = null) {
    const sy = schoolYear || getCurrentSchoolYear();
    
    const credits = await LeaveCredit.findAll({
      where: { schoolYear: sy }
    });

    const summary = {
      permanent: { count: 0, totalCredits: 0, usedCredits: 0 },
      contractual: { count: 0, totalCredits: 0, usedCredits: 0 },
      'job-order': { count: 0, totalCredits: 0, usedCredits: 0 },
      'part-time': { count: 0, totalCredits: 0, usedCredits: 0 }
    };

    credits.forEach(credit => {
      const type = credit.employmentType;
      if (summary[type]) {
        summary[type].count++;
        summary[type].totalCredits += parseFloat(credit.totalCredits);
        summary[type].usedCredits += parseFloat(credit.usedCredits);
      }
    });

    return summary;
  }
}

module.exports = new LeaveCreditService();
