import React, { useState, useEffect, useContext } from "react";
import { Bar } from "react-chartjs-2";
import { Spinner, Table, Form } from "react-bootstrap";
import { DashboardContext } from "../../../context/DashboardContext";
import { useAuthContext } from "../../../context/AuthContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/Analytics.css";
import { toast } from "react-toastify";

// Register required components explicitly
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    workspaces: 0,
    documents: 0,
  });
  const {
    fetchWorkspacesByUserId,
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    fetchCollaborators,
  } = useContext(DashboardContext);

  const [collaborators, setCollaborators] = useState([]);
  const { workspaceId } = useParams();

  // Handle change when selecting a workspace from the dropdown
  const handleWorkspaceChange = (e) => {
    const selectedWorkspaceId = e.target.value;
    const selectedWorkspace = workspaces.find(
      (workspace) => workspace._id === selectedWorkspaceId
    );
    if (selectedWorkspace) {
      handleWorkspaceSelection(selectedWorkspace);
    }
  };

  // Fetch workspaces and collaborators on component mount
  useEffect(() => {
    if (user?.id) {
      fetchWorkspacesByUserId(user._id);
    }
    if (workspaceId && fetchCollaborators) {
      fetchCollaborators(workspaceId)
        .then((collaborators) => {
          if (collaborators.length === 0) {
            toast.info("No collaborators found for this workspace.");
          } else {
            setCollaborators(collaborators);
          }
        })
        .catch((error) => {
          toast.error("Error fetching collaborators.");
          console.error("Error fetching collaborators:", error);
        });
    }
  }, [user, workspaceId, fetchWorkspacesByUserId, fetchCollaborators]);

  const handleWorkspaceSelection = async (workspace) => {
    setSelectedWorkspace(workspace);
    setLoading(true);

    try {
      // Fetch documents and workspaces analytics for the selected workspace
      const response = await axios.get(
        `http://localhost:4000/api/analytic/analytics/${workspace._id}`
      );
      setAnalyticsData({
        workspaces: response.data.workspaces || 0,
        documents: response.data.documents || 0,
      });

      // Fetch collaborators for the selected workspace
      const collaboratorResponse = await axios.get(
        `http://localhost:4000/api/workspaces/${workspace._id}/collaborators`
      );
      setCollaborators(collaboratorResponse.data);
    } catch (error) {
      console.error("Error fetching analytics or collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyticsChartData = {
    labels: ["Workspaces", "Documents", "Collaborators"],
    datasets: [
      {
        label: "Count",
        data: [
          analyticsData.workspaces || 0, // Ensure 0 if undefined
          analyticsData.documents || 0, // Ensure 0 if undefined
          collaborators.length || 0, // Collaborators count from context
        ],
        backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"],
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="main">
        <div className="main-top">
          <h1>Analytics</h1>
        </div>

        {/* Workspace selection via dropdown */}
        <Form.Group controlId="workspaceSelect" className="mb-3">
          <Form.Label>Select Workspace</Form.Label>
          <Form.Control
            as="select"
            value={selectedWorkspace?._id || ""}
            onChange={handleWorkspaceChange}
          >
            <option value="" disabled>
              Select a workspace
            </option>
            {Array.isArray(workspaces) && workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))
            ) : (
              <option disabled>No workspaces available</option>
            )}
          </Form.Control>
        </Form.Group>

        {/* Show analytics only when a workspace is selected */}
        {selectedWorkspace && (
          <>
            <h2>Workspace Analytics for: {selectedWorkspace.name}</h2>
            <div
              className="chart-container"
              style={{ width: "60%", margin: "auto" }}
            >
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              ) : (
                <Bar data={analyticsChartData} options={chartOptions} />
              )}
            </div>

            {/* Collaborators Table */}
            <h3>Collaborators List</h3>
            {loading ? (
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {collaborators.length > 0 ? (
                    collaborators.map((collaborator) => (
                      <tr key={collaborator._id}>
                        <td>{collaborator.username}</td>
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
