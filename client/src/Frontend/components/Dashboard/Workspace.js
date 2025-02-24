import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Table, Modal, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSearch,
  faTrash,
  faEye,
  faDownload,
  faEdit,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import Notification from "../Dashboard/Notification";
import "../styles/Workspace.css";
import { DashboardContext } from "../../../context/DashboardContext";
import { useAuthContext } from "../../../context/AuthContext";

const Workspace = () => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;
  const [searchTerm, setSearchTerm] = useState("");

  const {
    fetchWorkspacesByUser,
    createWorkspace,
    deleteWorkspace,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    previewDocument,
    downloadDocument,
    updateDocumentMetadata,
    updateDocumentTags,
    workspaces,
    documents = [],
    showPreviewModal,
    setShowPreviewModal,
  } = useContext(DashboardContext);

  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceVisibility, setWorkspaceVisibility] = useState("private");
  const [notification, setNotification] = useState(null);
  const [ setFilteredDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage] = useState(3);

  // New states for document metadata and tags modal
  const [ setShowMetadataModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [metadata, setMetadata] = useState("");
  const [tags, setTags] = useState("");

  const [previewFileType, setPreviewFileType] = useState("");
  const [previewFile, setPreviewFile] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("");

  // Fetch user-specific workspaces when the user is available
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchWorkspacesByUser();
    }
  }, [user, isAuthenticated, fetchWorkspacesByUser]);

  // Filter user's documents by search term
useEffect(() => {
  if (searchTerm.length >= 3) {
    const filtered = documents.filter((document) =>
      document.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  } else {
    setFilteredDocuments(documents);
  }
}, [searchTerm, documents, setFilteredDocuments]);

const handleSearchInputChange = (e) => {
  setSearchTerm(e.target.value);
};

  const handleWorkspaceSelection = (workspace) => {
    // Only fetch documents if a new workspace is selected
    if (!selectedWorkspace || selectedWorkspace._id !== workspace._id) {
      setSelectedWorkspace(workspace);
      fetchDocuments(workspace._id);
    }
  };

  const handleWorkspaceCreation = async (event) => {
    event.preventDefault();
    try {
      await createWorkspace({
        name: workspaceName,
        description: workspaceDescription,
        visibility: workspaceVisibility,
      });
      fetchWorkspacesByUser();
      setShowWorkspaceModal(false);
      setNotification({
        type: "success",
        message: "Workspace created successfully!",
      });
    } catch (error) {
      console.error("Error creating workspace:", error);
      setNotification({
        type: "error",
        message: "Failed to create workspace.",
      });
    }
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
      fetchDocuments(selectedWorkspace._id); // Refresh documents list
    } catch (error) {
      console.error("Error uploading file:", error);
      setNotification({ type: "error", message: "File upload failed!" });
    }
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



  const pageCount = Math.ceil(documents.length / documentsPerPage);
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = Array.isArray(documents)
    ? documents.slice(indexOfFirstDocument, indexOfLastDocument)
    : [];

  const paginationItems = [];
  for (let number = 1; number <= pageCount; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }
// Use them or remove them if not needed
console.log(updateDocumentMetadata, updateDocumentTags, selectedDocument, metadata, tags);

  return (
    <div className="workspace-container">
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}
      <div className="workspace-creation">
        {/* Workspace Creation Modal */}
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
        {Array.isArray(workspaces) && workspaces.length > 0 ? (
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
      </div>

      {/* User Workspaces and Document Management */}
      {selectedWorkspace && (
        <>
          <h4>Documents in Workspace: {selectedWorkspace.name}</h4>
          {currentDocuments.length > 0 ? (
            <>
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
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={handleSearchInputChange}
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
                  {currentDocuments.map((document) => (
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
              <Pagination>{paginationItems}</Pagination>
            </>
          ) : (
            <p>No documents found.</p> // Added this message
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
                      This document cannot be previewed. Click the button below
                      to download.
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
        </>
      )}
    </div>
  );
};

export default Workspace;
