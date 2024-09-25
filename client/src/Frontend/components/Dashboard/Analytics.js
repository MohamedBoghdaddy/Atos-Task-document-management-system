import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { Spinner, Table } from "react-bootstrap";
import "../styles/Dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:4000/api/analytic/analytics"
        );
        setAnalyticsData(response.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);




  if (loading) {
    return (
      <div className="centered-spinner">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!analyticsData) {
    return <p>No analytics data available</p>;
  }

  // Prepare data for the analytics chart
  const analyticsChartData = {
    labels: ["Workspaces", "Documents", "Collaborators"],
    datasets: [
      {
        label: "Count",
        data: [
          analyticsData.workspaces || 0,
          analyticsData.documents || 0,
          analyticsData.collaborators || 0,
        ],
        backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"],
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true, // This ensures that the y-axis starts at 0
        ticks: {
          stepSize: 1, // Adjust step size to 1 if counts are integers
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="main">
        <div className="main-top">
          <h1>Analytics: </h1>
        </div>

        <h2>Workspace Analytics</h2>
        <div
          className="chart-container"
          style={{ width: "60%", margin: "auto" }}
        >
          <Bar data={analyticsChartData} options={options} />
        </div>

        {/* Collaborators Table */}
        <h3>Collaborators List</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name:</th>
              <th>Email:</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(analyticsData.collaboratorDetails) &&
            analyticsData.collaboratorDetails.length > 0 ? (
              analyticsData.collaboratorDetails.map((collaborator) => (
                <tr key={collaborator._id}>
                  <td>{collaborator.name}</td>
                  <td>{collaborator.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No collaborators found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

    </div>
  );
};

export default Analytics;
