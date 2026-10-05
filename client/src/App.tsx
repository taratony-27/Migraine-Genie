import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DailyLog from './components/DailyLog';
import Account from './pages/Account';
import WellnessProgram from './components/WellnessProgram';
import AIAssistant from './components/AIAssistant';
import Visualization from './components/Visualization';
import Layout from './components/Layout';
import VerifyEmail from "./pages/VerifyEmail";
import Seo from './components/Seo';
import RequireAuth from './components/RequireAuth';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <Seo />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/daily-log" element={<RequireAuth><DailyLog /></RequireAuth>} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="/wellness-program" element={<RequireAuth><WellnessProgram /></RequireAuth>} />
          <Route path="/ai-assistant" element={<RequireAuth><AIAssistant /></RequireAuth>} />
          <Route path="/visualization" element={<RequireAuth><Visualization /></RequireAuth>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
