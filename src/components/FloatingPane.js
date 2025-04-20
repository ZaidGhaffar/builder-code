// src/components/FloatingPane.js
import React, { useState } from 'react';
import './FloatingPane.css';

const FloatingPane = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const togglePane = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`floating-pane ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {isExpanded && <div className="pane-content">{children}</div>}
    </div>
  );
};

export default FloatingPane;
