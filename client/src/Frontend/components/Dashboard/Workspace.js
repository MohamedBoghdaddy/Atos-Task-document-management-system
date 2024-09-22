import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Table, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSearch,
  faTrash,
  faEye,
  faDownload,
  faTimesCircle,
  faRecycle,
} from "@fortawesome/free-solid-svg-icons";
import Notification from "../Dashboard/Notification";
import "../styles/Workspace.css";
import { DashboardContext } from "../../../context/DashboardContext";
import { useAuthContext } from "../../../context/AuthContext";

const Workspace = () => {
  const { user } = useAuthContext();

  const {
    fetchWorkspaces,
    fetchWorkspacesByUserId,
    createWorkspace,
    deleteWorkspace,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    previewDocument,
    downloadDocument,
    workspaces,
    documents,
    showPreviewModal,
    setShowPreviewModal,
  } = useContext(DashboardContext);

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // Handle selected file
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceVisibility, setWorkspaceVisibility] = useState("private");
  const [notification, setNotification] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  // Recycle bin state
  const [recycleBin, setRecycleBin] = useState([]);

  // State for preview file and type
  const [previewFileType, setPreviewFileType] = useState(""); // Track file type
  const [previewFile, setPreviewFile] = useState(""); // Track the file content
  const [mimeType, setMimeType] = useState(""); // Track MIME type for document preview
  const [downloadFileName, setDownloadFileName] = useState("");
  // Fetch workspaces for the logged-in user
  useEffect(() => {
    fetchWorkspaces();
    if (user && user._id) {
      fetchWorkspacesByUserId(user._id);
    }
  }, [fetchWorkspaces, user, fetchWorkspacesByUserId]);

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
      setShowWorkspaceModal(false);
      fetchWorkspaces();
    } catch (error) {
      console.error("Error creating workspace:", error);
      setNotification({ type: "error", message: "Workspace creation failed!" });
    }
  };

  const handleWorkspaceSelection = (workspace) => {
    setSelectedWorkspace(workspace);
    fetchDocuments(workspace._id);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !selectedWorkspace) {
      setNotification({ type: "error", message: "No file selected!" });
      return;
    }

    try {
      // Pass the selected file to the uploadDocument function
      await uploadDocument(selectedWorkspace._id, { file: selectedFile });
      setNotification({
        type: "success",
        message: "File uploaded successfully!",
      });
      fetchDocuments(selectedWorkspace._id); // Refresh documents list after upload
    } catch (error) {
      console.error("Error uploading file:", error);
      setNotification({ type: "error", message: "File upload failed!" });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePreviewDocument = async (documentId) => {
    try {
      const response = await previewDocument(documentId);

      // Ensure the response contains previewFile and mimeType
      if (!response || !response.base64 || !response.fileType) {
        throw new Error("Invalid document preview data");
      }

      // Set the preview file and type in state
      if (response.fileType.includes("pdf")) {
        setPreviewFileType("pdf");
      } else if (["image/jpg", "image/jpeg", "image/png"].includes(mimeType)) {
        setPreviewFileType(response.fileType);
      } else if (
        response.fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setPreviewFileType("docx");
        setPreviewFile(response.html); // Store the HTML for rendering
      } else if (response.fileType.includes("text")) {
        setPreviewFileType(response.fileType);
        setPreviewFile(response.base64);
        setDownloadFileName(response.fileName); // Set the file name dynamically
      } else {
        setPreviewFileType("unsupported");
      }
      console.log(previewFile);
      setPreviewFile(response.base64); // Store the base64-encoded file for rendering
      setMimeType(response.fileType); // Store the MIME type
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      setNotification({ type: "error", message: "Document preview failed!" });
    }
  };

  // Move document to recycle bin instead of deleting
  const handleRecycleDocument = async (documentId) => {
    try {
      const documentToRecycle = documents.find((doc) => doc._id === documentId);
      setRecycleBin([...recycleBin, documentToRecycle]); // Move to recycle bin
      setFilteredDocuments(
        filteredDocuments.filter((doc) => doc._id !== documentId)
      ); // Remove from main list
      setNotification({
        type: "success",
        message: "Document moved to recycle bin!",
      });
    } catch (error) {
      console.error("Error recycling document:", error);
      setNotification({
        type: "error",
        message: "Failed to move document to recycle bin.",
      });
    }
  };

  // Restore a document from the recycle bin
  const handleRestoreDocument = (documentId) => {
    const documentToRestore = recycleBin.find((doc) => doc._id === documentId);
    setFilteredDocuments([...filteredDocuments, documentToRestore]); // Move back to main list
    setRecycleBin(recycleBin.filter((doc) => doc._id !== documentId)); // Remove from recycle bin
    setNotification({
      type: "success",
      message: "Document restored successfully!",
    });
  };

  // Permanently delete a document from the recycle bin
  const handlePermanentDelete = async (documentId) => {
    try {
      await deleteDocument(documentId);
      setRecycleBin(recycleBin.filter((doc) => doc._id !== documentId)); // Remove from recycle bin
      setNotification({
        type: "success",
        message: "Document deleted!",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      setNotification({
        type: "error",
        message: "Failed to delete document.",
      });
    }
  };
  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      await deleteWorkspace(workspaceId);
      setNotification({
        type: "success",
        message: "Workspace deleted successfully!",
      });
      fetchWorkspaces();
    } catch (error) {
      console.error("Error deleting workspace:", error);
      setNotification({
        type: "error",
        message: "Failed to delete workspace.",
      });
    }
  };

  return (
    <div className="workspace-container">
      <h2>Workspace</h2>

      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      <Button
        variant="primary"
        onClick={() => setShowWorkspaceModal(true)}
        className="mb-3"
      >
        Create Workspace
      </Button>

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

      <h3>Select a Workspace</h3>
      {workspaces && workspaces.length > 0 ? (
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
                onClick={() => handleDeleteWorkspace(workspace._id)}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p>No workspaces available.</p>
      )}

      {selectedWorkspace && (
        <>
          <h4>Documents in Workspace: {selectedWorkspace.name}</h4>

          <Form onSubmit={handleFileUpload} className="mb-3">
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload Document</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])} // Capture selected file
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
                      onClick={() => handlePreviewDocument(document._id)}
                      className="me-3"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </Button>
                    <Button
                      variant="success"
                      onClick={() =>
                        downloadDocument(document._id, document.name)
                      }
                      className="me-3"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleRecycleDocument(document._id)

                      }
                      className="me-3"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Recycle Bin Section */}
          <h4>Recycle Bin</h4>
          {recycleBin.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recycleBin.map((document) => (
                  <tr key={document._id}>
                    <td>{document.name}</td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleRestoreDocument(document._id)}
                        className="me-3"
                      >
                        <FontAwesomeIcon icon={faRecycle} /> Restore
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handlePermanentDelete(document._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Permanently Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No documents in recycle bin.</p>
          )}

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
                previewFileType === "pdf" ? (
                  <iframe
                    src={`data:application/pdf;base64,${previewFile}`}
                    title="PDF Preview"
                    width="100%"
                    height="500px"
                  />
                ) : mimeType.includes("image") ? (
                  <img
                    src={`data:${mimeType};base64,${previewFile}`}
                    alt="Document Preview"
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : previewFileType === "docx" ? (
                  <div>
                    <img
                      src="/path/to/word-placeholder-image.png" // Placeholder image for Word document
                      alt="Word Document Preview"
                      style={{ width: "100px", height: "100px" }}
                    />
                    <p>
                      This document cannot be previewed. Click the button below
                      to download the document.
                    </p>
                    <a
                      href={`data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${previewFile}`}
                      download={downloadFileName || "document.docx"} // Use dynamic file name
                      className="btn btn-primary"
                    >
                      Download Document
                    </a>
                  </div>
                ) : previewFileType === "text" ? (
                  <pre>{atob(previewFile)}</pre>
                ) : (
                  <p>Preview is not available for this document type.</p>
                )
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
