import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import NewSurvey from "./pages/NewSurvey";
import Analysis from "./pages/Analysis";
import Results from "./pages/Results";
import Surveys from "./pages/Surveys";
import SurveyDetail from "./pages/SurveyDetail";
import MapPage from "./pages/MapPage";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function AppShell() {
  return (
    <div className="flex min-h-screen bg-earth-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-survey" element={<NewSurvey />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/results" element={<Results />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/surveys/:id" element={<SurveyDetail />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
