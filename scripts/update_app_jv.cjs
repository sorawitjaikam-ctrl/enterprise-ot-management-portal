const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Ensure import is present
  if (!content.includes('import JobValueSpreadsheetView')) {
    content = content.replace(
      'import ManpowerDashboard from "./components/ManpowerDashboard";',
      'import ManpowerDashboard from "./components/ManpowerDashboard";\nimport JobValueSpreadsheetView from "./components/JobValueSpreadsheetView";'
    );
  }

  const startMarker = '{/* VIEW: JOB VALUE & EXECUTIVE DASHBOARD */}';
  const endMarker = '{/* VIEW: MANPOWER & HEADCOUNT ANALYTICS */}';

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error(`Markers not found in ${filePath}`, { startIndex, endIndex });
    return false;
  }

  // Find the start line of the block
  const blockStart = content.lastIndexOf('{/* ======================================= */}', startIndex);
  // Find the separator right before endMarker
  const blockEnd = content.lastIndexOf('{/* ======================================= */}', endIndex);

  const replacement = `{/* ======================================= */}
          {/* VIEW: JOB VALUE SPREADSHEET & CORPORATE EVALUATION */}
          {/* ======================================= */}
          {(activeTab === "job_value" || activeTab === "jobValue") && (
            <ErrorBoundary>
              <JobValueSpreadsheetView
                currentUser={currentUser}
                isHrOrFullAccess={isHrOrFullAccess}
                onOpenEmployeeDetails={(emp) => {
                  const matched = (state?.employees || []).find(e => 
                    e.id === emp.empId || 
                    (e.name && emp.name && e.name.trim().toLowerCase() === emp.name.trim().toLowerCase())
                  );
                  if (matched) {
                    setViewingEmployeeDetails(matched);
                  }
                }}
              />
            </ErrorBoundary>
          )}

          `;

  const newContent = content.slice(0, blockStart) + replacement + content.slice(blockEnd);
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Successfully updated ${filePath}`);
  return true;
}

const targetPath = process.argv[2] || path.resolve(__dirname, '../src/App.tsx');
updateFile(targetPath);
