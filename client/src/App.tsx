import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DailyLog from './components/DailyLog';
import Profile from './pages/Profile';
import Baseline from './pages/Baseline';
import WellnessProgram from './components/WelnessProgram';
import Layout from './components/Layout'; // ✅ Corrected import

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily-log" element={<DailyLog />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/baseline" element={<Baseline />} />
          <Route path="/wellness-program" element={<WellnessProgram />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
