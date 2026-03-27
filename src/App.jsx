import { Route, Routes } from "react-router-dom";
import { PremiumCursor } from "./components/cursor/PremiumCursor";
import { AppShell } from "./components/layout/AppShell";
import { ThemeCustomizer } from "./components/theme/ThemeCustomizer";
import { AllReportsPage } from "./pages/AllReportsPage";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { IssueDetailPage } from "./pages/IssueDetailPage";
import { MyReportsPage } from "./pages/MyReportsPage";
import { ReportPage } from "./pages/ReportPage";
import { AdminDashboard } from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <PremiumCursor />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/all-reports" element={<AllReportsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <ThemeCustomizer />
    </>
  );
}

export default App;
