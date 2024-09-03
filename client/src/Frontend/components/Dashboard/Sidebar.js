import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaHistory, FaCog, FaBell } from "react-icons/fa";
import "../styles/Sidebar.css";
import { useAuthContext } from "../../../context/AuthContext";

const Sidebar = () => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          {isAuthenticated && user ? `Welcome, ${user.username}` : "Guest"}
        </h2>
   
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/Dashboard">
            <FaUser /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <FaUser /> Profile
          </Link>
        </li>
        <li>
          <Link to="/Workspace">
            <FaUser /> Workspace
          </Link>
        </li>
        <li>
          <Link to="/notifications">
            <FaBell /> Notifications
          </Link>
        </li>
        <li>
          <Link to="/history">
            <FaHistory /> History
          </Link>
        </li>
        <li>
          <Link to="/settings">
            <FaCog /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default React.memo(Sidebar);
