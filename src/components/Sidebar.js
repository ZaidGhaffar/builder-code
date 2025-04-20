import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { ReactComponent as HomeIcon } from '../assets/Home.svg';
import { ReactComponent as AssignedIcon } from '../assets/Assigned.svg';
import { ReactComponent as NewProjectIcon } from '../assets/New Project.svg';
import { ReactComponent as SchedulesIcon } from '../assets/Schedules.svg';
import { ReactComponent as ProjectsIcon } from '../assets/Projects.svg';

const Sidebar = ({ setOpenedFile }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleMouseEnter = () => {
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    setExpanded(false);
  };

  const handleNavigation = (path) => {
    if (path === '/') {
      navigate('/dashboard');
    } else {
      navigate(path);
    }
  };

  return (
    <>
      {/* Invisible hover detection area */}
      <div className="sidebar-hover-area" onMouseEnter={handleMouseEnter}></div>

      {/* Actual sidebar */}
      <div
        className={`sidebar ${expanded ? 'expanded' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="nav-pane">
          <button
            onClick={() => {
              handleNavigation('/');
              setOpenedFile(null);
            }}
            className="nav-button"
          >
            <HomeIcon className="icon" />
            <span className="label">Home</span>
          </button>
          <button
            onClick={() => handleNavigation('/assigned')}
            className="nav-button"
          >
            <AssignedIcon className="icon" />
            <span className="label">Assigned</span>
          </button>
          <button
            onClick={() => handleNavigation('/file-upload')}
            className="nav-button"
          >
            <NewProjectIcon className="icon" />
            <span className="label">New Project</span>
          </button>
          <button
            onClick={() => handleNavigation('/schedules')}
            className="nav-button"
          >
            <SchedulesIcon className="icon" />
            <span className="label">Schedules</span>
          </button>
          <button
            onClick={() => handleNavigation('/projects')}
            className="nav-button"
          >
            <ProjectsIcon className="icon" />
            <span className="label">Projects</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;