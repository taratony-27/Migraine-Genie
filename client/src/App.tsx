import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DailyLog from './components/DailyLog';
import Account from './pages/Account';
import WellnessProgram from './components/WelnessProgram';
import AIAssistant from './components/AIAssistant';
import Visualization from './components/Visualization';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily-log" element={<DailyLog />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wellness-program" element={<WellnessProgram />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/visualization" element={<Visualization />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
