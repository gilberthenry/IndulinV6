const Contract = require('../models/Contract');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

/**
 * Service for contract management and automated tasks
 */
class ContractService {
  /**
   * Check and expire contracts that have passed their end date
   */
  static async checkExpiredContracts() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiredContracts = await Contract.findAll({
        where: {
          status: 'Active',
          endDate: {
            [Op.lt]: today,
            [Op.ne]: null
          }
        },
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName']
        }]
      });

      for (const contract of expiredContracts) {
        await contract.update({ status: 'Expired' });
        
        // Check if employee has another active contract
        const activeContract = await Contract.findOne({
          where: {
            employeeId: contract.employeeId,
            status: 'Active'
          }
        });

        // If no active contract, update employee status
        if (!activeContract) {
          const employee = await Employee.findByPk(contract.employeeId);
          if (employee && employee.status !== 'resigned' && employee.status !== 'terminated') {
            await employee.update({ status: 'active' });
          }
        }

        console.log(`Contract ${contract.id} for ${contract.Employee?.fullName} has been expired`);
      }

      return {
        success: true,
        expiredCount: expiredContracts.length,
        message: `${expiredContracts.length} contract(s) expired`
      };
    } catch (error) {
      console.error('Error checking expired contracts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contracts expiring within specified days
   */
  static async getExpiringContracts(days = 30) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const expiringContracts = await Contract.findAll({
        where: {
          status: 'Active',
          endDate: {
            [Op.between]: [today, futureDate]
          }
        },
        include: [{
          model: Employee,
          attributes: ['id', 'employeeId', 'fullName', 'email']
        }],
        order: [['endDate', 'ASC']]
      });

      return expiringContracts;
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics by type
   */
  static async getContractStatistics() {
    try {
      const stats = await Contract.findAll({
        attributes: [
          'contractType',
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['contractType', 'status']
      });

      return stats;
    } catch (error) {
      console.error('Error fetching contract statistics:', error);
      throw error;
    }
  }

  /**
   * Validate contract data based on contract type
   */
  static validateContractData(contractData) {
    const { contractType, startDate, endDate, workSchedule, projectDetails } = contractData;

    // Permanent contracts should not have end dates
    if (contractType === 'permanent' && endDate) {
      return {
        valid: false,
        error: 'Permanent contracts should not have an end date'
      };
    }

    // Other contract types must have end dates
    if (['contractual', 'part-time', 'job-order'].includes(contractType) && !endDate) {
      return {
        valid: false,
        error: `${contractType} contracts must have an end date`
      };
    }

    // Part-time contracts should have work schedule
    if (contractType === 'part-time' && !workSchedule) {
      return {
        valid: false,
        error: 'Part-time contracts must specify a work schedule'
      };
    }

    // Job-order contracts should have project details
    if (contractType === 'job-order' && !projectDetails) {
      return {
        valid: false,
        error: 'Job-order contracts must specify project details'
      };
    }

    // End date must be after start date
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      return {
        valid: false,
        error: 'End date must be after start date'
      };
    }

    return { valid: true };
  }
}

module.exports = ContractService;
