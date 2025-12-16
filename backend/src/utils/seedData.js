const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');

async function seedEmployees() {
  try {
    console.log('Seeding employees...');

    // Hash passwords
    const hrPassword = await bcrypt.hash('hr123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);
    const misPassword = await bcrypt.hash('mis123', 10);

    // Create employees with correct credentials
    const employees = [
      {
        employeeId: 'HR001',
        fullName: 'HR Administrator',
        email: 'hr@kcp.edu.ph',
        password: hrPassword,
        role: 'hr',
        position: 'HR Manager',
        department: 'Human Resources',
        dateHired: new Date('2020-01-01'),
        status: 'active',
        isSuspended: false
      },
      {
        employeeId: 'EMP001',
        fullName: 'Employee User',
        email: 'employee@kcp.edu.ph',
        password: employeePassword,
        role: 'employee',
        position: 'Staff',
        department: 'CIT',
        dateHired: new Date('2021-06-15'),
        status: 'active',
        isSuspended: false
      },
      {
        employeeId: 'MIS001',
        fullName: 'MIS Administrator',
        email: 'mis@kcp.edu.ph',
        password: misPassword,
        role: 'mis',
        position: 'System Administrator',
        department: 'Management Information Systems',
        dateHired: new Date('2019-08-01'),
        status: 'active',
        isSuspended: false
      },
      
      // TTED Department (10 employees)
      { employeeId: 'TTED001', fullName: 'Maria Santos', email: 'maria.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'TTED', dateHired: new Date('2018-08-15'), status: 'active', isSuspended: false },
      { employeeId: 'TTED002', fullName: 'Juan Dela Cruz', email: 'juan.delacruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'TTED', dateHired: new Date('2019-01-10'), status: 'active', isSuspended: false },
      { employeeId: 'TTED003', fullName: 'Rosa Garcia', email: 'rosa.garcia@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'TTED', dateHired: new Date('2020-03-20'), status: 'active', isSuspended: false },
      { employeeId: 'TTED004', fullName: 'Carlos Reyes', email: 'carlos.reyes@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'TTED', dateHired: new Date('2021-06-01'), status: 'active', isSuspended: false },
      { employeeId: 'TTED005', fullName: 'Elena Ramos', email: 'elena.ramos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'TTED', dateHired: new Date('2019-09-15'), status: 'active', isSuspended: false },
      { employeeId: 'TTED006', fullName: 'Roberto Cruz', email: 'roberto.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'TTED', dateHired: new Date('2017-02-10'), status: 'active', isSuspended: false },
      { employeeId: 'TTED007', fullName: 'Ana Lopez', email: 'ana.lopez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'TTED', dateHired: new Date('2020-08-05'), status: 'active', isSuspended: false },
      { employeeId: 'TTED008', fullName: 'Miguel Torres', email: 'miguel.torres@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'TTED', dateHired: new Date('2022-01-12'), status: 'active', isSuspended: false },
      { employeeId: 'TTED009', fullName: 'Carmen Flores', email: 'carmen.flores@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'TTED', dateHired: new Date('2018-11-20'), status: 'active', isSuspended: false },
      { employeeId: 'TTED010', fullName: 'Pedro Morales', email: 'pedro.morales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'TTED', dateHired: new Date('2021-04-18'), status: 'active', isSuspended: false },

      // CIT Department (12 employees)
      { employeeId: 'CIT001', fullName: 'Jennifer Mendoza', email: 'jennifer.mendoza@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CIT', dateHired: new Date('2016-05-10'), status: 'active', isSuspended: false },
      { employeeId: 'CIT002', fullName: 'Mark Villanueva', email: 'mark.villanueva@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CIT', dateHired: new Date('2018-07-22'), status: 'active', isSuspended: false },
      { employeeId: 'CIT003', fullName: 'Linda Castro', email: 'linda.castro@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CIT', dateHired: new Date('2019-02-14'), status: 'active', isSuspended: false },
      { employeeId: 'CIT004', fullName: 'Daniel Aguilar', email: 'daniel.aguilar@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CIT', dateHired: new Date('2020-09-01'), status: 'active', isSuspended: false },
      { employeeId: 'CIT005', fullName: 'Patricia Santos', email: 'patricia.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CIT', dateHired: new Date('2021-03-15'), status: 'active', isSuspended: false },
      { employeeId: 'CIT006', fullName: 'Richard Hernandez', email: 'richard.hernandez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CIT', dateHired: new Date('2015-11-08'), status: 'active', isSuspended: false },
      { employeeId: 'CIT007', fullName: 'Susan Diaz', email: 'susan.diaz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CIT', dateHired: new Date('2017-04-20'), status: 'active', isSuspended: false },
      { employeeId: 'CIT008', fullName: 'Joseph Rivera', email: 'joseph.rivera@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CIT', dateHired: new Date('2019-10-11'), status: 'active', isSuspended: false },
      { employeeId: 'CIT009', fullName: 'Mary Gonzales', email: 'mary.gonzales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CIT', dateHired: new Date('2020-12-03'), status: 'active', isSuspended: false },
      { employeeId: 'CIT010', fullName: 'Thomas Perez', email: 'thomas.perez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CIT', dateHired: new Date('2021-08-25'), status: 'active', isSuspended: false },
      { employeeId: 'CIT011', fullName: 'Barbara Sanchez', email: 'barbara.sanchez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CIT', dateHired: new Date('2018-06-17'), status: 'active', isSuspended: false },
      { employeeId: 'CIT012', fullName: 'Christopher Cruz', email: 'christopher.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CIT', dateHired: new Date('2022-02-09'), status: 'active', isSuspended: false },

      // BASIC ED Department (13 employees)
      { employeeId: 'BAED001', fullName: 'Laura Martinez', email: 'laura.martinez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Senior Teacher', department: 'BASIC ED', dateHired: new Date('2016-06-12'), status: 'active', isSuspended: false },
      { employeeId: 'BAED002', fullName: 'George Ramirez', email: 'george.ramirez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'BASIC ED', dateHired: new Date('2018-08-20'), status: 'active', isSuspended: false },
      { employeeId: 'BAED003', fullName: 'Nancy Torres', email: 'nancy.torres@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'BASIC ED', dateHired: new Date('2019-05-15'), status: 'active', isSuspended: false },
      { employeeId: 'BAED004', fullName: 'Kenneth Lopez', email: 'kenneth.lopez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher I', department: 'BASIC ED', dateHired: new Date('2020-07-08'), status: 'active', isSuspended: false },
      { employeeId: 'BAED005', fullName: 'Betty Flores', email: 'betty.flores@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'BASIC ED', dateHired: new Date('2017-09-22'), status: 'active', isSuspended: false },
      { employeeId: 'BAED006', fullName: 'Steven Garcia', email: 'steven.garcia@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Senior Teacher', department: 'BASIC ED', dateHired: new Date('2015-03-10'), status: 'active', isSuspended: false },
      { employeeId: 'BAED007', fullName: 'Helen Rodriguez', email: 'helen.rodriguez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'BASIC ED', dateHired: new Date('2019-11-05'), status: 'active', isSuspended: false },
      { employeeId: 'BAED008', fullName: 'Edward Santos', email: 'edward.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher I', department: 'BASIC ED', dateHired: new Date('2021-01-14'), status: 'active', isSuspended: false },
      { employeeId: 'BAED009', fullName: 'Dorothy Reyes', email: 'dorothy.reyes@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'BASIC ED', dateHired: new Date('2018-04-18'), status: 'active', isSuspended: false },
      { employeeId: 'BAED010', fullName: 'Brian Cruz', email: 'brian.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'BASIC ED', dateHired: new Date('2020-10-22'), status: 'active', isSuspended: false },
      { employeeId: 'BAED011', fullName: 'Sandra Morales', email: 'sandra.morales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher I', department: 'BASIC ED', dateHired: new Date('2021-05-30'), status: 'active', isSuspended: false },
      { employeeId: 'BAED012', fullName: 'Ronald Ramos', email: 'ronald.ramos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'BASIC ED', dateHired: new Date('2017-12-11'), status: 'active', isSuspended: false },
      { employeeId: 'BAED013', fullName: 'Ashley Mendoza', email: 'ashley.mendoza@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'BASIC ED', dateHired: new Date('2019-08-28'), status: 'active', isSuspended: false },

      // ADMIN Department (11 employees)
      { employeeId: 'ADM001', fullName: 'Kevin Villanueva', email: 'kevin.villanueva@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Officer', department: 'ADMIN', dateHired: new Date('2016-02-15'), status: 'active', isSuspended: false },
      { employeeId: 'ADM002', fullName: 'Kimberly Castro', email: 'kimberly.castro@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Assistant', department: 'ADMIN', dateHired: new Date('2018-05-20'), status: 'active', isSuspended: false },
      { employeeId: 'ADM003', fullName: 'Jason Aguilar', email: 'jason.aguilar@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Records Officer', department: 'ADMIN', dateHired: new Date('2019-07-12'), status: 'active', isSuspended: false },
      { employeeId: 'ADM004', fullName: 'Michelle Hernandez', email: 'michelle.hernandez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Aide', department: 'ADMIN', dateHired: new Date('2020-03-08'), status: 'active', isSuspended: false },
      { employeeId: 'ADM005', fullName: 'Matthew Diaz', email: 'matthew.diaz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Officer', department: 'ADMIN', dateHired: new Date('2017-09-14'), status: 'active', isSuspended: false },
      { employeeId: 'ADM006', fullName: 'Amanda Rivera', email: 'amanda.rivera@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Assistant', department: 'ADMIN', dateHired: new Date('2019-01-25'), status: 'active', isSuspended: false },
      { employeeId: 'ADM007', fullName: 'Anthony Gonzales', email: 'anthony.gonzales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Aide', department: 'ADMIN', dateHired: new Date('2020-11-18'), status: 'active', isSuspended: false },
      { employeeId: 'ADM008', fullName: 'Stephanie Perez', email: 'stephanie.perez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Records Officer', department: 'ADMIN', dateHired: new Date('2018-06-30'), status: 'active', isSuspended: false },
      { employeeId: 'ADM009', fullName: 'Ryan Sanchez', email: 'ryan.sanchez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Officer', department: 'ADMIN', dateHired: new Date('2021-02-22'), status: 'active', isSuspended: false },
      { employeeId: 'ADM010', fullName: 'Melissa Cruz', email: 'melissa.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Assistant', department: 'ADMIN', dateHired: new Date('2017-10-05'), status: 'active', isSuspended: false },
      { employeeId: 'ADM011', fullName: 'Gary Martinez', email: 'gary.martinez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Administrative Aide', department: 'ADMIN', dateHired: new Date('2019-12-16'), status: 'active', isSuspended: false },

      // ELEMENTARY Department (14 employees)
      { employeeId: 'ELEM001', fullName: 'Nicole Ramirez', email: 'nicole.ramirez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Master Teacher', department: 'ELEMENTARY', dateHired: new Date('2014-06-10'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM002', fullName: 'Jeffrey Torres', email: 'jeffrey.torres@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'ELEMENTARY', dateHired: new Date('2016-08-15'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM003', fullName: 'Rebecca Lopez', email: 'rebecca.lopez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'ELEMENTARY', dateHired: new Date('2018-03-20'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM004', fullName: 'Jacob Flores', email: 'jacob.flores@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher I', department: 'ELEMENTARY', dateHired: new Date('2020-01-12'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM005', fullName: 'Katherine Garcia', email: 'katherine.garcia@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'ELEMENTARY', dateHired: new Date('2017-05-18'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM006', fullName: 'Raymond Rodriguez', email: 'raymond.rodriguez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Master Teacher', department: 'ELEMENTARY', dateHired: new Date('2015-09-22'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM007', fullName: 'Christine Santos', email: 'christine.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'ELEMENTARY', dateHired: new Date('2019-02-14'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM008', fullName: 'Jack Reyes', email: 'jack.reyes@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher I', department: 'ELEMENTARY', dateHired: new Date('2021-07-08'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM009', fullName: 'Samantha Cruz', email: 'samantha.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'ELEMENTARY', dateHired: new Date('2016-11-30'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM010', fullName: 'Scott Morales', email: 'scott.morales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'ELEMENTARY', dateHired: new Date('2018-10-25'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM011', fullName: 'Catherine Ramos', email: 'catherine.ramos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher I', department: 'ELEMENTARY', dateHired: new Date('2020-04-16'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM012', fullName: 'Jerry Mendoza', email: 'jerry.mendoza@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher III', department: 'ELEMENTARY', dateHired: new Date('2017-01-20'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM013', fullName: 'Sarah Villanueva', email: 'sarah.villanueva@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher II', department: 'ELEMENTARY', dateHired: new Date('2019-06-05'), status: 'active', isSuspended: false },
      { employeeId: 'ELEM014', fullName: 'Walter Castro', email: 'walter.castro@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Teacher I', department: 'ELEMENTARY', dateHired: new Date('2021-09-12'), status: 'active', isSuspended: false },

      // CTE Department (15 employees)
      { employeeId: 'CTE001', fullName: 'Victoria Aguilar', email: 'victoria.aguilar@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CTE', dateHired: new Date('2015-04-08'), status: 'active', isSuspended: false },
      { employeeId: 'CTE002', fullName: 'Jeremy Hernandez', email: 'jeremy.hernandez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CTE', dateHired: new Date('2017-07-15'), status: 'active', isSuspended: false },
      { employeeId: 'CTE003', fullName: 'Teresa Diaz', email: 'teresa.diaz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CTE', dateHired: new Date('2018-09-20'), status: 'active', isSuspended: false },
      { employeeId: 'CTE004', fullName: 'Carl Rivera', email: 'carl.rivera@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CTE', dateHired: new Date('2019-11-12'), status: 'active', isSuspended: false },
      { employeeId: 'CTE005', fullName: 'Evelyn Gonzales', email: 'evelyn.gonzales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CTE', dateHired: new Date('2020-02-18'), status: 'active', isSuspended: false },
      { employeeId: 'CTE006', fullName: 'Arthur Perez', email: 'arthur.perez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CTE', dateHired: new Date('2016-05-22'), status: 'active', isSuspended: false },
      { employeeId: 'CTE007', fullName: 'Jean Sanchez', email: 'jean.sanchez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CTE', dateHired: new Date('2017-08-30'), status: 'active', isSuspended: false },
      { employeeId: 'CTE008', fullName: 'Ralph Cruz', email: 'ralph.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CTE', dateHired: new Date('2018-12-05'), status: 'active', isSuspended: false },
      { employeeId: 'CTE009', fullName: 'Alice Martinez', email: 'alice.martinez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CTE', dateHired: new Date('2019-03-14'), status: 'active', isSuspended: false },
      { employeeId: 'CTE010', fullName: 'Wayne Ramirez', email: 'wayne.ramirez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CTE', dateHired: new Date('2020-06-20'), status: 'active', isSuspended: false },
      { employeeId: 'CTE011', fullName: 'Gloria Torres', email: 'gloria.torres@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CTE', dateHired: new Date('2016-10-11'), status: 'active', isSuspended: false },
      { employeeId: 'CTE012', fullName: 'Eugene Lopez', email: 'eugene.lopez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CTE', dateHired: new Date('2018-01-25'), status: 'active', isSuspended: false },
      { employeeId: 'CTE013', fullName: 'Denise Flores', email: 'denise.flores@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CTE', dateHired: new Date('2019-07-18'), status: 'active', isSuspended: false },
      { employeeId: 'CTE014', fullName: 'Philip Garcia', email: 'philip.garcia@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CTE', dateHired: new Date('2020-09-22'), status: 'active', isSuspended: false },
      { employeeId: 'CTE015', fullName: 'Judith Rodriguez', email: 'judith.rodriguez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CTE', dateHired: new Date('2015-11-08'), status: 'active', isSuspended: false },

      // CCJE Department (13 employees)
      { employeeId: 'CCJE001', fullName: 'Aaron Santos', email: 'aaron.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CCJE', dateHired: new Date('2016-03-12'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE002', fullName: 'Diana Reyes', email: 'diana.reyes@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CCJE', dateHired: new Date('2017-06-18'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE003', fullName: 'Harold Cruz', email: 'harold.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CCJE', dateHired: new Date('2018-08-22'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE004', fullName: 'Frances Morales', email: 'frances.morales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CCJE', dateHired: new Date('2019-10-15'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE005', fullName: 'Henry Ramos', email: 'henry.ramos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CCJE', dateHired: new Date('2020-01-20'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE006', fullName: 'Joyce Mendoza', email: 'joyce.mendoza@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CCJE', dateHired: new Date('2015-05-14'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE007', fullName: 'Russell Villanueva', email: 'russell.villanueva@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CCJE', dateHired: new Date('2017-09-08'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE008', fullName: 'Carolyn Castro', email: 'carolyn.castro@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CCJE', dateHired: new Date('2018-11-25'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE009', fullName: 'Douglas Aguilar', email: 'douglas.aguilar@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CCJE', dateHired: new Date('2019-02-12'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE010', fullName: 'Janet Hernandez', email: 'janet.hernandez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CCJE', dateHired: new Date('2020-05-18'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE011', fullName: 'Gerald Diaz', email: 'gerald.diaz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CCJE', dateHired: new Date('2016-07-22'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE012', fullName: 'Paula Rivera', email: 'paula.rivera@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CCJE', dateHired: new Date('2018-04-10'), status: 'active', isSuspended: false },
      { employeeId: 'CCJE013', fullName: 'Lawrence Gonzales', email: 'lawrence.gonzales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CCJE', dateHired: new Date('2019-12-05'), status: 'active', isSuspended: false },

      // GSO Department (12 employees)
      { employeeId: 'GSO001', fullName: 'Albert Perez', email: 'albert.perez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'General Services Officer', department: 'GSO', dateHired: new Date('2016-01-15'), status: 'active', isSuspended: false },
      { employeeId: 'GSO002', fullName: 'Ruby Sanchez', email: 'ruby.sanchez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Utility Worker', department: 'GSO', dateHired: new Date('2017-04-20'), status: 'active', isSuspended: false },
      { employeeId: 'GSO003', fullName: 'Willie Cruz', email: 'willie.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Maintenance Staff', department: 'GSO', dateHired: new Date('2018-06-12'), status: 'active', isSuspended: false },
      { employeeId: 'GSO004', fullName: 'Brenda Martinez', email: 'brenda.martinez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Utility Worker', department: 'GSO', dateHired: new Date('2019-08-18'), status: 'active', isSuspended: false },
      { employeeId: 'GSO005', fullName: 'Vincent Ramirez', email: 'vincent.ramirez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Maintenance Staff', department: 'GSO', dateHired: new Date('2020-10-22'), status: 'active', isSuspended: false },
      { employeeId: 'GSO006', fullName: 'Irene Torres', email: 'irene.torres@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'General Services Officer', department: 'GSO', dateHired: new Date('2015-12-08'), status: 'active', isSuspended: false },
      { employeeId: 'GSO007', fullName: 'Louis Lopez', email: 'louis.lopez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Utility Worker', department: 'GSO', dateHired: new Date('2017-02-14'), status: 'active', isSuspended: false },
      { employeeId: 'GSO008', fullName: 'Lillian Flores', email: 'lillian.flores@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Maintenance Staff', department: 'GSO', dateHired: new Date('2018-05-20'), status: 'active', isSuspended: false },
      { employeeId: 'GSO009', fullName: 'Roy Garcia', email: 'roy.garcia@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Utility Worker', department: 'GSO', dateHired: new Date('2019-07-25'), status: 'active', isSuspended: false },
      { employeeId: 'GSO010', fullName: 'Mildred Rodriguez', email: 'mildred.rodriguez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Maintenance Staff', department: 'GSO', dateHired: new Date('2020-09-30'), status: 'active', isSuspended: false },
      { employeeId: 'GSO011', fullName: 'Jesse Santos', email: 'jesse.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'General Services Officer', department: 'GSO', dateHired: new Date('2016-11-16'), status: 'active', isSuspended: false },
      { employeeId: 'GSO012', fullName: 'Marilyn Reyes', email: 'marilyn.reyes@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Utility Worker', department: 'GSO', dateHired: new Date('2018-03-22'), status: 'active', isSuspended: false },

      // SSO Department (11 employees)
      { employeeId: 'SSO001', fullName: 'Nathan Cruz', email: 'nathan.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Student Services Officer', department: 'SSO', dateHired: new Date('2016-02-10'), status: 'active', isSuspended: false },
      { employeeId: 'SSO002', fullName: 'Beverly Morales', email: 'beverly.morales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Guidance Counselor', department: 'SSO', dateHired: new Date('2017-05-15'), status: 'active', isSuspended: false },
      { employeeId: 'SSO003', fullName: 'Eugene Ramos', email: 'eugene.ramos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Student Affairs Staff', department: 'SSO', dateHired: new Date('2018-07-20'), status: 'active', isSuspended: false },
      { employeeId: 'SSO004', fullName: 'Martha Mendoza', email: 'martha.mendoza@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Guidance Counselor', department: 'SSO', dateHired: new Date('2019-09-12'), status: 'active', isSuspended: false },
      { employeeId: 'SSO005', fullName: 'Harry Villanueva', email: 'harry.villanueva@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Student Affairs Staff', department: 'SSO', dateHired: new Date('2020-11-18'), status: 'active', isSuspended: false },
      { employeeId: 'SSO006', fullName: 'Debra Castro', email: 'debra.castro@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Student Services Officer', department: 'SSO', dateHired: new Date('2015-03-25'), status: 'active', isSuspended: false },
      { employeeId: 'SSO007', fullName: 'Bruce Aguilar', email: 'bruce.aguilar@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Guidance Counselor', department: 'SSO', dateHired: new Date('2017-06-30'), status: 'active', isSuspended: false },
      { employeeId: 'SSO008', fullName: 'Gloria Hernandez', email: 'gloria.hernandez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Student Affairs Staff', department: 'SSO', dateHired: new Date('2018-08-14'), status: 'active', isSuspended: false },
      { employeeId: 'SSO009', fullName: 'Billy Diaz', email: 'billy.diaz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Guidance Counselor', department: 'SSO', dateHired: new Date('2019-10-20'), status: 'active', isSuspended: false },
      { employeeId: 'SSO010', fullName: 'Cheryl Rivera', email: 'cheryl.rivera@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Student Affairs Staff', department: 'SSO', dateHired: new Date('2020-12-08'), status: 'active', isSuspended: false },
      { employeeId: 'SSO011', fullName: 'Jimmy Gonzales', email: 'jimmy.gonzales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Student Services Officer', department: 'SSO', dateHired: new Date('2016-04-16'), status: 'active', isSuspended: false },

      // CABM Department (14 employees)
      { employeeId: 'CABM001', fullName: 'Virginia Perez', email: 'virginia.perez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CABM', dateHired: new Date('2015-01-20'), status: 'active', isSuspended: false },
      { employeeId: 'CABM002', fullName: 'Randy Sanchez', email: 'randy.sanchez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CABM', dateHired: new Date('2017-03-25'), status: 'active', isSuspended: false },
      { employeeId: 'CABM003', fullName: 'Norma Cruz', email: 'norma.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CABM', dateHired: new Date('2018-05-30'), status: 'active', isSuspended: false },
      { employeeId: 'CABM004', fullName: 'Albert Martinez', email: 'albert.martinez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CABM', dateHired: new Date('2019-07-14'), status: 'active', isSuspended: false },
      { employeeId: 'CABM005', fullName: 'Doris Ramirez', email: 'doris.ramirez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CABM', dateHired: new Date('2020-09-18'), status: 'active', isSuspended: false },
      { employeeId: 'CABM006', fullName: 'Roger Torres', email: 'roger.torres@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Professor', department: 'CABM', dateHired: new Date('2014-11-22'), status: 'active', isSuspended: false },
      { employeeId: 'CABM007', fullName: 'Phyllis Lopez', email: 'phyllis.lopez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CABM', dateHired: new Date('2016-01-28'), status: 'active', isSuspended: false },
      { employeeId: 'CABM008', fullName: 'Earl Flores', email: 'earl.flores@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CABM', dateHired: new Date('2017-04-05'), status: 'active', isSuspended: false },
      { employeeId: 'CABM009', fullName: 'Janice Garcia', email: 'janice.garcia@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CABM', dateHired: new Date('2018-06-10'), status: 'active', isSuspended: false },
      { employeeId: 'CABM010', fullName: 'Howard Rodriguez', email: 'howard.rodriguez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CABM', dateHired: new Date('2019-08-15'), status: 'active', isSuspended: false },
      { employeeId: 'CABM011', fullName: 'Kathryn Santos', email: 'kathryn.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Associate Professor', department: 'CABM', dateHired: new Date('2016-10-20'), status: 'active', isSuspended: false },
      { employeeId: 'CABM012', fullName: 'Frank Reyes', email: 'frank.reyes@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Assistant Professor', department: 'CABM', dateHired: new Date('2017-12-25'), status: 'active', isSuspended: false },
      { employeeId: 'CABM013', fullName: 'Ann Cruz', email: 'ann.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CABM', dateHired: new Date('2018-02-28'), status: 'active', isSuspended: false },
      { employeeId: 'CABM014', fullName: 'Raymond Morales', email: 'raymond.morales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Instructor', department: 'CABM', dateHired: new Date('2019-05-05'), status: 'active', isSuspended: false },

      // CLINIC Department (6 employees)
      { employeeId: 'CLN001', fullName: 'Marie Ramos', email: 'marie.ramos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'School Physician', department: 'CLINIC', dateHired: new Date('2015-02-10'), status: 'active', isSuspended: false },
      { employeeId: 'CLN002', fullName: 'Gregory Mendoza', email: 'gregory.mendoza@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'School Nurse', department: 'CLINIC', dateHired: new Date('2017-05-15'), status: 'active', isSuspended: false },
      { employeeId: 'CLN003', fullName: 'Emma Villanueva', email: 'emma.villanueva@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'School Nurse', department: 'CLINIC', dateHired: new Date('2018-07-20'), status: 'active', isSuspended: false },
      { employeeId: 'CLN004', fullName: 'Joe Castro', email: 'joe.castro@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'School Dentist', department: 'CLINIC', dateHired: new Date('2019-09-25'), status: 'active', isSuspended: false },
      { employeeId: 'CLN005', fullName: 'Tina Aguilar', email: 'tina.aguilar@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Medical Aide', department: 'CLINIC', dateHired: new Date('2020-11-30'), status: 'active', isSuspended: false },
      { employeeId: 'CLN006', fullName: 'Craig Hernandez', email: 'craig.hernandez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Medical Aide', department: 'CLINIC', dateHired: new Date('2021-01-14'), status: 'active', isSuspended: false },

      // LIBRARY-COLLEGE Department (6 employees)
      { employeeId: 'LIBC001', fullName: 'Paula Diaz', email: 'paula.diaz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'College Librarian', department: 'LIBRARY-COLLEGE', dateHired: new Date('2015-03-12'), status: 'active', isSuspended: false },
      { employeeId: 'LIBC002', fullName: 'Ernest Rivera', email: 'ernest.rivera@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Assistant', department: 'LIBRARY-COLLEGE', dateHired: new Date('2017-06-18'), status: 'active', isSuspended: false },
      { employeeId: 'LIBC003', fullName: 'Julia Gonzales', email: 'julia.gonzales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Assistant', department: 'LIBRARY-COLLEGE', dateHired: new Date('2018-08-22'), status: 'active', isSuspended: false },
      { employeeId: 'LIBC004', fullName: 'Leonard Perez', email: 'leonard.perez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Aide', department: 'LIBRARY-COLLEGE', dateHired: new Date('2019-10-28'), status: 'active', isSuspended: false },
      { employeeId: 'LIBC005', fullName: 'Theresa Sanchez', email: 'theresa.sanchez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Aide', department: 'LIBRARY-COLLEGE', dateHired: new Date('2020-12-15'), status: 'active', isSuspended: false },
      { employeeId: 'LIBC006', fullName: 'Curtis Cruz', email: 'curtis.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Assistant', department: 'LIBRARY-COLLEGE', dateHired: new Date('2021-02-20'), status: 'active', isSuspended: false },

      // LIBRARY BASIC ADMIN Department (4 employees)
      { employeeId: 'LIBA001', fullName: 'Jacqueline Martinez', email: 'jacqueline.martinez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Basic Ed Librarian', department: 'LIBRARY BASIC ADMIN', dateHired: new Date('2016-04-10'), status: 'active', isSuspended: false },
      { employeeId: 'LIBA002', fullName: 'Francis Ramirez', email: 'francis.ramirez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Assistant', department: 'LIBRARY BASIC ADMIN', dateHired: new Date('2018-07-15'), status: 'active', isSuspended: false },
      { employeeId: 'LIBA003', fullName: 'Bonnie Torres', email: 'bonnie.torres@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Aide', department: 'LIBRARY BASIC ADMIN', dateHired: new Date('2019-09-20'), status: 'active', isSuspended: false },
      { employeeId: 'LIBA004', fullName: 'Pedro Lopez', email: 'pedro.lopez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Library Aide', department: 'LIBRARY BASIC ADMIN', dateHired: new Date('2020-11-25'), status: 'active', isSuspended: false },

      // REGISTRAR-COLLEGE Department (6 employees)
      { employeeId: 'REGC001', fullName: 'Bradley Flores', email: 'bradley.flores@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'College Registrar', department: 'REGISTRAR-COLLEGE', dateHired: new Date('2015-05-08'), status: 'active', isSuspended: false },
      { employeeId: 'REGC002', fullName: 'Wanda Garcia', email: 'wanda.garcia@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Registrar Assistant', department: 'REGISTRAR-COLLEGE', dateHired: new Date('2017-08-12'), status: 'active', isSuspended: false },
      { employeeId: 'REGC003', fullName: 'Dennis Rodriguez', email: 'dennis.rodriguez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Registrar Assistant', department: 'REGISTRAR-COLLEGE', dateHired: new Date('2018-10-18'), status: 'active', isSuspended: false },
      { employeeId: 'REGC004', fullName: 'Ruby Santos', email: 'ruby.santos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Records Clerk', department: 'REGISTRAR-COLLEGE', dateHired: new Date('2019-12-22'), status: 'active', isSuspended: false },
      { employeeId: 'REGC005', fullName: 'Victor Reyes', email: 'victor.reyes@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Records Clerk', department: 'REGISTRAR-COLLEGE', dateHired: new Date('2020-02-28'), status: 'active', isSuspended: false },
      { employeeId: 'REGC006', fullName: 'Annie Cruz', email: 'annie.cruz@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Registrar Aide', department: 'REGISTRAR-COLLEGE', dateHired: new Date('2021-04-15'), status: 'active', isSuspended: false },

      // ACCOUNTING Department (7 employees)
      { employeeId: 'ACC001', fullName: 'Clarence Morales', email: 'clarence.morales@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Chief Accountant', department: 'ACCOUNTING', dateHired: new Date('2014-01-10'), status: 'active', isSuspended: false },
      { employeeId: 'ACC002', fullName: 'Jane Ramos', email: 'jane.ramos@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Senior Accountant', department: 'ACCOUNTING', dateHired: new Date('2016-03-15'), status: 'active', isSuspended: false },
      { employeeId: 'ACC003', fullName: 'Ralph Mendoza', email: 'ralph.mendoza@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Accountant II', department: 'ACCOUNTING', dateHired: new Date('2017-06-20'), status: 'active', isSuspended: false },
      { employeeId: 'ACC004', fullName: 'Irene Villanueva', email: 'irene.villanueva@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Accountant I', department: 'ACCOUNTING', dateHired: new Date('2018-08-25'), status: 'active', isSuspended: false },
      { employeeId: 'ACC005', fullName: 'Philip Castro', email: 'philip.castro@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Accounting Clerk', department: 'ACCOUNTING', dateHired: new Date('2019-10-30'), status: 'active', isSuspended: false },
      { employeeId: 'ACC006', fullName: 'Rose Aguilar', email: 'rose.aguilar@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Accounting Clerk', department: 'ACCOUNTING', dateHired: new Date('2020-12-12'), status: 'active', isSuspended: false },
      { employeeId: 'ACC007', fullName: 'Eddie Hernandez', email: 'eddie.hernandez@kcp.edu.ph', password: employeePassword, role: 'employee', position: 'Bookkeeper', department: 'ACCOUNTING', dateHired: new Date('2021-02-18'), status: 'active', isSuspended: false }
    ];

    await Employee.bulkCreate(employees);
    
    console.log('✓ Successfully seeded', employees.length, 'employees');
    console.log('\nLogin Credentials:');
    console.log('─────────────────────────────────────');
    console.log('HR:       hr@kcp.edu.ph       / hr123');
    console.log('Employee: employee@kcp.edu.ph / employee123');
    console.log('MIS:      mis@kcp.edu.ph      / mis123');
    console.log('─────────────────────────────────────\n');
    
  } catch (error) {
    console.error('Error seeding employees:', error);
    throw error;
  }
}

module.exports = { seedEmployees };
