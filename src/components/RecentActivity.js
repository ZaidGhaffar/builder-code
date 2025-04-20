import React from "react";
import "./RecentActivity.css";

const RecentActivity = () => {
  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <ul>
        <li>Project A was updated</li>
        <li>File B was uploaded</li>
        <li>User C logged in</li>
      </ul>
    </div>
  );
};

export default RecentActivity;