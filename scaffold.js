const fs = require('fs');
const path = require('path');

const structure = [
  'src/api/index.js',
  
  'src/components/shared/Navbar.jsx',
  'src/components/shared/Footer.jsx',
  'src/components/shared/LoadingSpinner.jsx',
  'src/components/shared/ErrorMessage.jsx',
  'src/components/shared/Modal.jsx',
  'src/components/shared/ProtectedRoute.jsx',
  
  'src/components/student/CategorySelector.jsx',
  'src/components/student/StructuredFields.jsx',
  'src/components/student/EthicalAcknowledgement.jsx',
  'src/components/student/CoolingOffTimer.jsx',
  'src/components/student/VerificationSection.jsx',
  'src/components/student/TrackingCodeDisplay.jsx',
  'src/components/student/MessageThread.jsx',
  
  'src/components/admin/AdminNavbar.jsx',
  'src/components/admin/ReportTable.jsx',
  'src/components/admin/AIAssessmentPanel.jsx',
  'src/components/admin/CredibilityScoreBar.jsx',
  'src/components/admin/StatusControls.jsx',
  'src/components/admin/AdminMessageThread.jsx',
  'src/components/admin/AuditLog.jsx',
  'src/components/admin/AnalyticsCharts.jsx',
  
  'src/context/AuthContext.jsx',
  
  'src/hooks/useAuth.js',
  'src/hooks/useReports.js',
  'src/hooks/useDebounce.js',
  
  'src/pages/student/Home.jsx',
  'src/pages/student/SubmitReport.jsx',
  'src/pages/student/TrackReport.jsx',
  
  'src/pages/admin/Login.jsx',
  'src/pages/admin/Dashboard.jsx',
  'src/pages/admin/ReportDetail.jsx',
  'src/pages/admin/Analytics.jsx',
  'src/pages/admin/Users.jsx',
  
  'src/utils/constants.js',
  'src/utils/formatters.js',
  
  'src/App.jsx',
  'src/index.js'
];

structure.forEach(filePath => {
  const absolutePath = path.join(process.cwd(), filePath);
  const dir = path.dirname(absolutePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create file if it doesn't exist, if it does, don't overwrite App.jsx
  if (!fs.existsSync(absolutePath)) {
    fs.writeFileSync(absolutePath, '');
  }
});

console.log('Structure created successfully');
