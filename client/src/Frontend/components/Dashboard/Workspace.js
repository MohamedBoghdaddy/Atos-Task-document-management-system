import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Button, Form, Table, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSearch,
  faTrash,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Notification from "../Dashboard/Notification";
import "../styles/Workspace.css";
import { DashboardContext } from "../../../context/DashboardContext";

const Workspace = () => {
  const {
    userData,
    fetchUserData, // Ensure this is correctly imported or defined in DashboardContext
    uploadDocument,
    deleteDocument,
    previewDocument,
    downloadDocument,
    createWorkspace,
    fetchWorkspaces, // Function to fetch workspaces
  } = useContext(DashboardContext);

  const [documents, setDocuments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceVisibility, setWorkspaceVisibility] = useState("private");

  useEffect(() => {
    const fetchData = async () => {
      if (userData && !userData.userProfile) {
        await fetchUserData();
      }

      // Fetch the workspaces for the logged-in user
      const fetchedWorkspaces = await fetchWorkspaces();
      setWorkspaces(fetchedWorkspaces || []);
    };

    fetchData();
  }, [fetchUserData, fetchWorkspaces, userData]);

  const handleWorkspaceCreation = async (event) => {
    event.preventDefault();
    const workspaceData = {
      name: workspaceName,
      description: workspaceDescription,
      visibility: workspaceVisibility,
    };

    try {
      await createWorkspace(workspaceData);
      setNotification({
        type: "success",
        message: "Workspace created successfully!",
      });
      setShowWorkspaceModal(false); // Close modal after creation
      // Refresh the workspace list
      const refreshedWorkspaces = await fetchWorkspaces();
      setWorkspaces(refreshedWorkspaces || []);
    } catch (error) {
      console.error("Error creating workspace:", error);
      setNotification({ type: "error", message: "Workspace creation failed!" });
    }
  };

  const handleWorkspaceSelection = (workspace) => {
    setSelectedWorkspace(workspace);
    // Fetch documents related to the selected workspace
    fetchDocuments(workspace._id);
  };

  const fetchDocuments = async (workspaceId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/${workspaceId}/documents`
      );
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]); // Handle error by setting documents to an empty array
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !selectedWorkspace) return;

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("workspaceId", selectedWorkspace._id);

    try {
      await uploadDocument(formData);
      setNotification({
        type: "success",
        message: "File uploaded successfully!",
      });
      fetchDocuments(selectedWorkspace._id); // Refresh document list
    } catch (error) {
      console.error("Error uploading file:", error);
      setNotification({ type: "error", message: "File upload failed!" });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredDocuments = Array.isArray(documents)
    ? documents.filter((document) =>
        document.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="workspace-container">
      <h2>Workspace</h2>

      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      {/* Button to show workspace creation form */}
      <Button
        variant="primary"
        onClick={() => setShowWorkspaceModal(true)}
        className="mb-3"
      >
        Create Workspace
      </Button>

      {/* Modal for creating a workspace */}
      <Modal
        show={showWorkspaceModal}
        onHide={() => setShowWorkspaceModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Workspace</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleWorkspaceCreation}>
            <Form.Group controlId="workspaceName" className="mb-3">
              <Form.Label>Workspace Name</Form.Label>
              <Form.Control
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="workspaceDescription" className="mb-3">
              <Form.Label>Workspace Description</Form.Label>
              <Form.Control
                type="text"
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="workspaceVisibility" className="mb-3">
              <Form.Label>Visibility</Form.Label>
              <Form.Control
                as="select"
                value={workspaceVisibility}
                onChange={(e) => setWorkspaceVisibility(e.target.value)}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Create Workspace
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* List of Workspaces */}
      <h3>Select a Workspace</h3>
      <ul className="workspace-list">
        {workspaces.map((workspace) => (
          <li
            key={workspace._id}
            onClick={() => handleWorkspaceSelection(workspace)}
            className={`workspace-item ${
              selectedWorkspace?._id === workspace._id ? "selected" : ""
            }`}
          >
            {workspace.name}
          </li>
        ))}
      </ul>

      {/* Upload and document list only visible if a workspace is selected */}
      {selectedWorkspace && (
        <>
          <h4>Documents in Workspace: {selectedWorkspace.name}</h4>

          <Form onSubmit={handleFileUpload} className="mb-3">
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload Document</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              <FontAwesomeIcon icon={faUpload} /> Upload
            </Button>
          </Form>

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
                      onClick={() => previewDocument(document._id)}
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faEye} /> Preview
                    </Button>
                    <Button
                      variant="success"
                      onClick={() =>
                        downloadDocument(document._id, document.name)
                      }
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faDownload} /> Download
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => deleteDocument(document._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal
            show={showPreviewModal}
            onHide={() => setShowPreviewModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Document Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {previewFile ? (
                <iframe
                  src={`data:application/pdf;base64,${previewFile}`}
                  title="Document Preview"
                  width="100%"
                  height="500px"
                />
              ) : (
                <p>No preview available</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Workspace;
