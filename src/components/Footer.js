import React from 'react';
import './Footer.css';
import { ReactComponent as Icon } from '../assets/Filled.svg';

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-content">
        <a href="/instant-support" className="footer-link">
          Instant support <Icon className="footer-icon" />
        </a>
        <a href="/my-plan" className="footer-link">
          My plan <Icon className="footer-icon" />
        </a>
        <a href="/my-account" className="footer-link">
          My account <Icon className="footer-icon" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
