import React from 'react';
import Sidebar from './Sidebar';
import Header2 from './Header2';
import Footer from './Footer'; // Import the Footer component
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-with-sidebar">
      <Header2 />
      <div className="content-area">
        <Sidebar />
        <div className="main-content">
          <h2>Dashboard Content Goes Here</h2>
        </div>
      </div>
      <Footer /> {/* Add the Footer component here */}
    </div>
  );
}

export default Dashboard;
