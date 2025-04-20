import React from "react";
import "./ProjectList.css";

const ProjectList = ({ projects }) => {
  return (
    <div className="project-list">
      {projects.length > 0 ? (
        projects.map((project, index) => (
          <div key={index} className="project-card">
            <h4>{project.name}</h4>
            <p>Created on: {project.date}</p>
            <button>Open</button>
            <button>Delete</button>
          </div>
        ))
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
};

export default ProjectList;