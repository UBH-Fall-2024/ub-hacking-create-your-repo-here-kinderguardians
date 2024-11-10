import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import CreateAccount from './components/Auth/CreateAccount';
import ParentDashboard from './components/Parent/ParentDashboard';
import WelcomePage from './components/Parent/WelcomePage';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route
          path="/parent/dashboard"
          element={
            <PrivateRoute>
              <ParentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/parent/welcome"
          element={
            <PrivateRoute>
              <WelcomePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 