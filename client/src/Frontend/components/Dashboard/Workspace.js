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
  faEdit,
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
    updateDocumentMetadata, // New functionality
    updateDocumentTags, // New functionality
    workspaces,
    documents,
    showPreviewModal,
    setShowPreviewModal,
    recycleBin, // For recycle bin
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

  // New states for document metadata and tags modal
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [metadata, setMetadata] = useState("");
  const [tags, setTags] = useState("");

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

      if (!response || !response.base64 || !response.fileType) {
        throw new Error("Invalid document preview data");
      }

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

      setPreviewFile(response.base64);
      setMimeType(response.fileType);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      setNotification({ type: "error", message: "Document preview failed!" });
    }
  };

  const handleMetadataModal = (document) => {
    setSelectedDocument(document);
    setMetadata(document.metadata || "");
    setTags(document.tags || "");
    setShowMetadataModal(true);
  };

  const handleMetadataUpdate = async (event) => {
    event.preventDefault();
    try {
      await updateDocumentMetadata(selectedDocument._id, { metadata });
      await updateDocumentTags(selectedDocument._id, tags.split(","));
      setNotification({
        type: "success",
        message: "Document metadata and tags updated successfully!",
      });
      fetchDocuments(selectedWorkspace._id);
      setShowMetadataModal(false);
    } catch (error) {
      console.error("Error updating metadata/tags:", error);
      setNotification({
        type: "error",
        message: "Failed to update metadata/tags.",
      });
    }
  };

  return (
    <div className="workspace-container">
      {/* Add Notification component */}
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      {/* Workspace creation and selection */}
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
                      onClick={() => deleteDocument(document._id)}
                      className="me-3"
                    >
                      <FontAwesomeIcon icon={faTrash} /> 
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleMetadataModal(document)}
                      className="me-3"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit Metadata/Tags
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Metadata and Tags Modal */}
          <Modal
            show={showMetadataModal}
            onHide={() => setShowMetadataModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Document Metadata/Tags</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleMetadataUpdate}>
                <Form.Group controlId="metadata" className="mb-3">
                  <Form.Label>Metadata</Form.Label>
                  <Form.Control
                    type="text"
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="tags" className="mb-3">
                  <Form.Label>Tags (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </>
      )}

      {/* Preview Modal */}
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
                  src="/path/to/word-placeholder-image.png"
                  alt="Word Document Preview"
                  style={{ width: "100px", height: "100px" }}
                />
                <p>
                  This document cannot be previewed. Click the button below to
                  download.
                </p>
                <a
                  href={`data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${previewFile}`}
                  download={downloadFileName || "document.docx"}
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
    </div>
  );
};

export default Workspace;
