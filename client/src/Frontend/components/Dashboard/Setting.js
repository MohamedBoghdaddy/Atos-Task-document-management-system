import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import Notification from "../Dashboard/Notification";
import { DashboardContext } from "../../../context/DashboardContext";
import { useAuthContext } from "../../../context/AuthContext";
import axios from "axios";

const Setting = () => {
  const { user } = useAuthContext();
  const {
    fetchWorkspaces,
    fetchWorkspacesByUserId,
    fetchWorkspaceById,
    fetchDocuments,
    workspaces,
    documents,
    deleteWorkspace,
    handlePreviewDocument,
  } = useContext(DashboardContext);

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorSearch, setCollaboratorSearch] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [notification, setNotification] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
    if (user && user._id) {
      fetchWorkspacesByUserId(user._id);
    }
  }, [user, fetchWorkspacesByUserId, fetchWorkspaces]);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const filtered = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchTerm, documents]);

  const handleWorkspaceSelection = (workspace) => {
    setSelectedWorkspace(workspace);
    fetchDocuments(workspace._id);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCollaboratorSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/users/search?username=${collaboratorSearch}`
      );
      setCollaborators(response.data);
      console.log(response.data);
      console.log(collaborators);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      setNotification({
        type: "error",
        message: "Error fetching collaborators.",
      });
    }
  };

  const addCollaboratorToWorkspace = async (collaborator) => {
    if (!selectedWorkspace || !selectedWorkspace._id) {
      setNotification({ type: "error", message: "No workspace selected!" });
      return;
    }

    if (!collaborator || !collaborator._id) {
      setNotification({ type: "error", message: "No collaborator selected!" });
      return;
    }

    try {
      console.log("Adding collaborator to workspace:", selectedWorkspace._id);
      console.log("Collaborator ID:", collaborator._id);

      await axios.post(
        `http://localhost:4000/api/workspaces/${selectedWorkspace._id}/add-collaborator`,
        { collaboratorId: collaborator._id },
        { withCredentials: true }
      );
      setNotification({
        type: "success",
        message: `${collaborator.name} added as a collaborator.`,
      });

      // Refetch the workspace after adding the collaborator
      console.log(user);
      console.log("Refetching workspaces for user", collaborator._id);
      await fetchWorkspacesByUserId(collaborator._id);
      console.log("Refetching specific workspace", selectedWorkspace._id);
      await fetchWorkspaceById(selectedWorkspace._id);
    } catch (error) {
      console.error("Error adding collaborator:", error);
      setNotification({
        type: "error",
        message: error.response
          ? error.response.data.message
          : "Error adding collaborator.",
      });
    }
  };

  return (
    <div className="workspace-container">
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      {/* Workspace selection */}
      <h3>Select a Workspace</h3>
      {workspaces.length > 0 ? (
        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <div
              key={workspace._id}
              onClick={() => handleWorkspaceSelection(workspace)}
              className={`workspace-item ${
                selectedWorkspace?._id === workspace._id ? "selected" : ""
              }`}
            >
              {workspace.name}
              <Button
                variant="danger"
                className="ms-4"
                onClick={() => deleteWorkspace(workspace._id)}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p>No workspaces available.</p>
      )}

      {/* Documents list */}
      {selectedWorkspace && (
        <>
          <h4>Documents in Workspace: {selectedWorkspace.name}</h4>

          <Form className="mb-3">
            <Form.Group controlId="search" className="mb-3">
              <Form.Label>Search Documents</Form.Label>
              <div className="search-bar">
                <Form.Control
                  type="text"
                  placeholder="Search by document name"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
              </div>
            </Form.Group>
          </Form>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document._id}>
                  <td>{document.name}</td>
                  <td>
                    <Button
                      variant="info"
                      onClick={() => handlePreviewDocument(document._id)}
                      className="me-3"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Collaborator search and add */}
          <Form className="mt-3">
            <Form.Group controlId="collaboratorSearch">
              <Form.Label>Search for Collaborators</Form.Label>
              <div className="search-bar">
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={collaboratorSearch}
                  onChange={(e) => setCollaboratorSearch(e.target.value)}
                />
                <Button onClick={handleCollaboratorSearch} className="ms-2">
                  <FontAwesomeIcon icon={faSearch} /> Search
                </Button>
              </div>
            </Form.Group>
          </Form>

          <ul className="collaborators-list mt-3">
            {collaborators.length > 0 ? (
              collaborators.map((collaborator) => (
                <li key={collaborator._id}>
                  {" "}
                  {/* Added a unique key here */}
                  {collaborator.name}{" "}
                  <Button
                    variant="success"
                    onClick={() => addCollaboratorToWorkspace(collaborator)}
                  >
                    Add as Collaborator
                  </Button>
                </li>
              ))
            ) : (
              <p>No collaborators found</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default Setting;
