import React from "react";
import { Link } from "react-router-dom";
import { FaFolder, FaChartLine, FaTools, FaTrash } from "react-icons/fa";
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
          <Link to="/analytics">
            <FaChartLine /> Analytics
          </Link>
        </li>

        <li>
          <Link to="/workspace">
            <FaFolder /> Workspace
          </Link>
        </li>

        <li>
          <Link to="/recyclebin">
            <FaTrash /> Recycle Bin
          </Link>
        </li>

        <li>
          <Link to="/setting">
            <FaTools /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default React.memo(Sidebar);
