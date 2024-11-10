import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/parent/dashboard');
      } else {
        alert('Invalid passcode');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleCreateAccount = () => {
    navigate('/create-account');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" aria-hidden={!isOpen} aria-label="Login Modal">
      <div className="modal-content">
        <button 
          className="close"
          onClick={onClose}
          onKeyDown={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2>Parent Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            aria-label="Passcode input"
          />
          <button type="submit" aria-label="Submit login">Login</button>
        </form>
        <button 
          onClick={handleCreateAccount}
          className="create-account-btn"
          aria-label="Create account"
        >
          Create a New Account
        </button>
      </div>
    </div>
  );
};

LoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default LoginModal; 