import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import Diary from './pages/Diary';
import Profile from './pages/Profile';
import Baseline from './pages/Baseline';
import Program from './pages/Program';



const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/baseline" element={<Baseline />} />
        <Route path="/program" element={<Program />} />
      </Routes>
    </Router>
  );
};

export default App;
