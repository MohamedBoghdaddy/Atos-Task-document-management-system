import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/chart-data", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = response.data;

        const labels = data.labels || [];
        const values = data.values || [];

        setLabels(labels);
        setValues(values);

        setChartData({
          labels,
          datasets: [
            {
              label: "User Data",
              data: values,
              backgroundColor: "rgba(75,192,192,1)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch notifications (Example usage)
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="dashboard">
      <div className="main">
        <div className="main-top">
          <h1>Dashboard</h1>
          <span className="material-symbols-rounded">account_circle</span>
        </div>

        <h2>User Data</h2>
        <Bar data={chartData} />
      </div>

      <div className="notifications">
        <h2>Notifications</h2>
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>{notification.message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
