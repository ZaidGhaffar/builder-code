import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateProjectDemo.css';

function CreateProjectDemo() {
  const navigate = useNavigate();

  const handleCreateProjectClick = () => {
    navigate('/file-upload');
  };

  const handleDemoProjectClick = () => {
    navigate('/file-upload');
  };

  return (
    <div className="create-project-demo">
      <div className="create-project-demo-content">
        <button className="create-project-button" onClick={handleCreateProjectClick}>Create Project</button>
        <button className="demo-project-button" onClick={handleDemoProjectClick}>Demo Project</button>
      </div>
    </div>
  );
}

export default CreateProjectDemo;
