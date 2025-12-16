const EmployeeController = require('../controllers/EmployeeController');

describe('EmployeeController', () => {
  test('should get profile', async () => {
    // Mock req, res
    const req = { user: { id: 1 } };
    const res = { json: jest.fn() };
    await EmployeeController.getProfile(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});