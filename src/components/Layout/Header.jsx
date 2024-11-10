import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ title, tagline }) => {
  return (
    <header>
      <div style={{ width: '40%' }}>
        <Link to="/">
          <img src="/logo.png" alt="KinderGuardians Logo" width="150" height="150" />
        </Link>
      </div>
      <div style={{ width: '60%' }}>
        <h1>{title}</h1>
        {tagline && <p className="tagline">{tagline}</p>}
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  tagline: PropTypes.string
};

export default Header; 