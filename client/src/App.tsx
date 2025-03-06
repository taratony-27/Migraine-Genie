import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Diary from './pages/Diary';
import Profile from './pages/Profile';
import Baseline from './pages/Baseline';
import Program from './pages/Program';



const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/baseline" element={<Baseline />} />
        <Route path="/program" element={<Program />} />
      </Routes>
    </Router>
  );
};

export default App;
