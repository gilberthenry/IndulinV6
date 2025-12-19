# Full-Stack HR Management System

A comprehensive full-stack application for HR management with separate backend and frontend.

## Backend (Node.js + Express + PostgreSQL/SQLite)

Located in `backend/` folder.

### Features
- JWT Authentication with role-based access (Employee, HR, MIS)
- Employee management: profile CRUD, document upload, leave requests, notifications
- HR functionalities: validation, bulk upload, contract management, reports, etc.
- MIS: backups, audit logs, role assignment, system notifications
- Shared: notifications, export tools, audit logs

## Detailed Features by Dashboard

### Employee Dashboard
**Overview & Statistics:**
- Contract status tracking (active/inactive, days remaining)
- Leave credits summary (vacation, sick, emergency)
- Document verification status (verified/pending/rejected)
- Unread notifications counter

**Core Features:**
1. **My Profile** - View and manage personal information
2. **My Contract** - View current and past employment contracts
3. **My Certificates** - Request and view certificates (employment, service records)
4. **My Leaves** - Apply for and track leave requests with balance tracking
5. **My Documents** - Upload and manage personal documents
6. **Notifications** - View system notifications and alerts
7. **Audit Logs** - View personal activity history

**Dashboard Widgets:**
- Document request alerts from HR
- Recent leave requests table
- Document status list
- Profile summary card
- Quick actions (file leave request, upload document)

---

### HR Dashboard
**Overview & Statistics:**
- Total employees (active/suspended) with new hires tracking
- Active contracts with expiring count
- Leave requests (pending/total/monthly breakdown)
- Pending actions (documents + certificates)

**Employee Management:**
1. **Employees** - View, search, filter, edit employee information
2. **Add Employee** - Create new employee profiles with role assignment
3. **Bulk Upload** - Mass import employee data via CSV/Excel

**Request Management:**
4. **HR Requests** - Review and approve employee configuration requests
5. **Profile Requests** - Review and approve profile change requests with detailed view

**Core HR Modules:**
6. **Contracts Management** - Create, renew, track contracts (permanent, temporary, probationary, contractual, part-time)
7. **Certificates** - Process requests, issue employment certificates and service records
8. **Documents Management** - Request documents, verify uploads, track compliance
9. **Leave Management** - Review applications, approve/reject, manage leave calendar and credits
10. **Departments & Designations** - Manage organizational structure

**Reports Module:**
11. **Contract Reports** - Status breakdown, expiring contracts, type analysis
12. **Leave Reports** - Utilization statistics, department analysis, trend reports
13. **Document Reports** - Compliance tracking, verification status
14. **Disciplinary Reports** - Track disciplinary actions and incidents
15. **Employee List** - Comprehensive exportable roster
16. **ID Directory** - Employee identification and contact directory

**Tools & Utilities:**
17. **Reset Passwords** - Individual and bulk password reset
18. **Export Tool** - Export data to Excel/CSV/PDF with custom options
19. **Manage Statuses** - Configure system status options

**Dashboard Analytics:**
- Contract distribution pie chart
- Leave status bar chart (pending/approved/rejected)
- Department distribution chart
- System overview panel (departments, documents, certificates)
- Expiring contracts alert widget
- Recent employees activity feed
- Recent leave requests feed
- Quick action buttons (add employee, new contract, generate report, leave calendar)

---

### MIS Dashboard
**Overview & Statistics:**
- Total employees and active users count
- User accounts management summary
- Audit log entries tracking
- Real-time system health status

**System Administration:**
1. **Config Requests** - Review and approve system configuration changes
2. **Accounts Management:**
   - **Manage Accounts** - Create, edit, disable user accounts with role assignment
   - **Password Management** - Advanced password controls and resets

**Core System Modules:**
3. **Contracts (System Level)** - System-wide contract oversight and data management
4. **Leave Management (System Level)** - System-wide administration and policy configuration
5. **Notifications** - Send system-wide notifications, broadcasts, templates, delivery tracking

**System Monitoring:**
6. **Audit Logs** - Complete system activity tracking, security events, exportable trails
7. **System Reports** - Comprehensive analytics, performance metrics, usage statistics

**Certificates Module:**
8. **Certificates Management:**
   - **View All Logs** - Complete certificate generation history
   - **Download Copies** - Access and download certificate copies

**Data Management:**
9. **Backups** - Create, schedule, restore database backups with history
10. **Documents (System Level)** - System-wide document repository management

**System Health Monitoring:**
- Real-time database status monitoring
- API server health check
- File storage system monitoring
- Live status indicators (online/offline)

**Dashboard Features:**
- One-click system backup
- Recent audit logs table (latest 10 entries)
- System health indicators panel
- Account action quick access
- Active/disabled accounts summary

### Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Configure `.env` file with database and email settings
4. Run: `npm start` (production) or `npm run dev` (development)
5. Server runs on port 5000

### API Endpoints
- `/api/auth` - Authentication
- `/api/emp¶¶;;;;;;;;;;¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶;;;;;,'l[loyee` - Employee operations
- `/api/hr` - HR operations
- `/api/mis` - MIS operations

## Frontend (React + TailwindCSS)

Located in `frontend/` folder.

### Features
- Responsive UI with TailwindCSS
- Role-based dashboards: Employee, HR, MIS
- Authentication and notifications
- Integration with backend APIs

### Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run: `npm run dev`
4. Open http://localhost:5174 (or assigned port)

---

## Common Features Across All Dashboards
- **Authentication & Security** - Secure login/logout, role-based access control, session management
- **Data Presentation** - Responsive tables with sorting, filtering, pagination, search
- **File Management** - Upload/download capabilities with validation
- **Audit Trail** - Complete action logging with timestamps and user attribution
- **Export Capabilities** - Data export to multiple formats, report generation
- **Modern UI** - Responsive design, animated transitions, hover effects, toast notifications

---

## Workflow Processes & Role Interactions

### 1. Leave Request Process
**Employee → HR**
```
1. Employee submits leave request (Employee Dashboard > My Leaves)
   - Select leave type (vacation/sick/emergency)
   - Choose date range
   - Provide reason
   - Status: Pending

2. HR receives notification
   - View in HR Dashboard > Leave Management
   - Review leave request details
   - Check leave balance/credits
   - View employee history

3. HR makes decision:
   ✓ Approve: Status → Approved, employee notified
   ✗ Reject: Status → Rejected, reason provided, employee notified

4. Employee views status (My Leaves)
   - Receives notification
   - Can view approval/rejection reason
```

---

### 2. Certificate Request Process
**Employee → HR**
```
1. Employee requests certificate (Employee Dashboard > My Certificates)
   - Select certificate type (Employment Certificate/Service Record)
   - Provide purpose/reason
   - Status: Pending

2. HR reviews request (HR Dashboard > Certificates)
   - Verify employee details
   - Check employment status
   - Validate request purpose

3. HR processes certificate:
   ✓ Generate certificate with official template
   ✓ Add signatures/stamps
   ✓ Status → Issued
   ✓ Employee receives notification

4. Employee downloads certificate (My Certificates)
   - Certificate available in PDF format
   - Can request additional copies
```

---

### 3. Document Request & Verification Process
**HR → Employee → HR**
```
1. HR requests documents from employee (HR Dashboard > Documents)
   - Select employee
   - Specify document type (e.g., Birth Certificate, TIN, Medical Certificate)
   - Set deadline
   - Add request reason

2. Employee receives alert (Employee Dashboard)
   - Dashboard shows urgent alert banner
   - Notification sent
   - Document marked as "Requested"

3. Employee uploads document (Employee Dashboard > My Documents)
   - Upload file (PDF/Image)
   - Add notes if needed
   - Status: Pending Verification

4. HR verifies document (HR Dashboard > Documents)
   - Review uploaded file
   - Check authenticity/validity
   - Decision:
     ✓ Approve: Status → Verified
     ✗ Reject: Status → Rejected, provide reason for resubmission

5. Employee receives verification status notification
```

---

### 4. Profile Change Request Process
**Employee → HR → MIS (if needed)**
```
1. Employee submits profile change request (Employee Dashboard > My Profile)
   - Request changes (name, contact, address, etc.)
   - Provide supporting documents
   - Status: Pending

2. HR reviews request (HR Dashboard > Profile Requests)
   - View requested changes
   - Compare old vs new information
   - Verify supporting documents

3. HR approval:
   ✓ Approve: Changes applied automatically, employee notified
   ✗ Reject: Provide reason, request additional documentation

4. For sensitive changes (email, role, department):
   - HR forwards to MIS for final approval
   - MIS reviews in MIS Dashboard > Config Requests
   - MIS approves/rejects with system-level authority
```

---

### 5. Contract Management Process
**HR → Employee**
```
1. HR creates/renews contract (HR Dashboard > Contracts)
   - Select employee
   - Choose contract type (Permanent/Temporary/Probationary/Contractual/Part-time)
   - Set start/end dates
   - Define position, salary, terms
   - Status: Active

2. System tracks contract:
   - Monitors expiration dates
   - Sends alerts 30 days before expiry (HR Dashboard)
   - Updates employee dashboard

3. Employee views contract (Employee Dashboard > My Contract)
   - Current active contract details
   - Past contract history
   - Days remaining until expiry

4. Contract renewal:
   - HR receives expiration alert
   - Creates new contract or extends existing
   - Employee notified of renewal
```

---

### 6. Employee Onboarding Process
**HR → Employee → MIS**
```
1. HR adds new employee (HR Dashboard > Add Employee)
   - Enter personal details
   - Assign department/designation
   - Set role (employee/hr/mis)
   - Generate temporary credentials

2. System creates accounts:
   - User account created
   - Email sent with login credentials
   - Employee profile initialized

3. Employee first login:
   - Change temporary password
   - Complete profile information
   - Review employment terms

4. MIS monitors (MIS Dashboard > Accounts)
   - New account appears in system
   - Tracks activation status
   - Can reset password if needed
   - Monitors audit logs for first login
```

---

### 7. HR Configuration Request Process
**HR → MIS**
```
1. HR needs system configuration change (HR Dashboard > HR Requests)
   - Request new department creation
   - Request status type changes
   - Request system-level modifications
   - Status: Pending

2. MIS reviews request (MIS Dashboard > Config Requests)
   - Evaluate impact on system
   - Check for conflicts
   - Verify necessity

3. MIS decision:
   ✓ Approve: Configuration applied system-wide
   ✗ Reject: Provide technical reason

4. HR receives notification
   - Can proceed with new configuration
   - Updates reflected across all modules
```

---

### 8. System Backup & Maintenance Process
**MIS Only**
```
1. MIS initiates backup (MIS Dashboard > Backups)
   - Click "Run Backup Now"
   - System creates full database snapshot
   - Timestamp recorded

2. Backup stored:
   - Saved in backend/data/backups/
   - Filename includes timestamp
   - Available for restoration

3. MIS monitors system health (MIS Dashboard)
   - Database: Online/Offline
   - API Server: Online/Offline
   - File Storage: Online/Offline

4. If issues detected:
   - MIS receives alerts
   - Can restore from backup
   - Can investigate via Audit Logs
```

---

### 9. Account Management Process
**MIS**
```
1. MIS manages user accounts (MIS Dashboard > Accounts > Manage Accounts)
   - Create new accounts with any role
   - Edit existing account details
   - Enable/Disable accounts
   - Reset passwords

2. Password reset (MIS Dashboard > Accounts > Password Management)
   - Override user passwords
   - Bulk password resets
   - Generate temporary passwords
   - Send credentials via email

3. Account monitoring:
   - Track login activity (Audit Logs)
   - Monitor failed login attempts
   - Identify inactive accounts
   - Enforce security policies
```

---

### 10. Notification Broadcasting Process
**MIS → All Users**
```
1. MIS creates notification (MIS Dashboard > Notifications)
   - Compose message
   - Select recipients:
     • All employees
     • Specific role (Employee/HR/MIS)
     • Individual users
   - Set priority level

2. System delivers notification:
   - Real-time push to user dashboards
   - Unread counter updates
   - Alert badge appears

3. Users receive notification:
   - Employee/HR/MIS Dashboard > Notifications
   - Can mark as read
   - Can archive old notifications
```

---

### 11. Reporting & Export Process
**HR → Data Export**
```
1. HR generates report (HR Dashboard > Reports)
   - Select report type:
     • Contract Reports
     • Leave Reports
     • Document Reports
     • Disciplinary Reports
     • Employee List
     • ID Directory

2. HR uses Export Tool (HR Dashboard > Tools > Export Tool)
   - Choose data range
   - Select format (Excel/CSV/PDF)
   - Apply filters
   - Generate export

3. System processes:
   - Compiles data
   - Formats according to selection
   - Prepares download

4. HR downloads:
   - File ready for download
   - Can share with management
   - Can use for analysis
```

---

### 12. Audit Trail Process
**All Roles → MIS Review**
```
1. All user actions logged automatically:
   - Login/logout events
   - Data modifications
   - Document uploads/downloads
   - Approvals/rejections

2. Employees view own audit logs:
   - Employee Dashboard > Audit Logs (if available)
   - Personal activity history

3. MIS monitors all audit logs (MIS Dashboard > Audit Logs)
   - Complete system activity
   - Filter by user/role/action/date
   - Export for compliance
   - Investigate security incidents
   - Generate compliance reports
```

## Technologies
- **Backend:** Node.js, Express, Sequelize, JWT, bcrypt, multer, nodemailer
- **Frontend:** React, Vite, TailwindCSS, Axios, Recharts (for analytics)
- **Database:** PostgreSQL or SQLite
- **UI Components:** Lucide React (icons), Custom components

## System Statistics
- **Total Routes:** 40+ distinct pages
- **User Roles:** 3 (Employee, HR, MIS)
- **Employee Features:** 7 main modules
- **HR Features:** 19 main features + advanced analytics
- **MIS Features:** 10 system administration modules

## Usage
1. Start backend server
2. Start frontend dev server
3. Access the application in browser
4. Register/login with appropriate roles


## If ever the API integration has an issue, then try to run this:
1. taskkill /F /IM node.exe 2>$null; Start-Sleep -Seconds 2; cd backend; node server.js
2. then split terminal then - cd frontend then "npm run dev".