import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Spinner, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecycle, faTrash } from "@fortawesome/free-solid-svg-icons";
import Notification from "../Dashboard/Notification";
import { DashboardContext } from "../../../context/DashboardContext";
import "bootstrap/dist/css/bootstrap.min.css";

const RecycleBin = () => {
  const {
    restoreDocument,
    deleteDocument,
    recycleBin,
    fetchDocuments, // Fetch documents from context
    fetchWorkspacesByUser,
    workspaces = [],
  } = useContext(DashboardContext);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [workspaceId, setWorkspaceId] = useState("");

  // Load workspaces when the component mounts
  useEffect(() => {
    const loadWorkspaces = async () => {
      setLoading(true);
      try {
        await fetchWorkspacesByUser(); // Fetch workspaces on component mount
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        setNotification({
          type: "error",
          message: "Failed to load workspaces.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, [fetchWorkspacesByUser]);

  // Fetch deleted documents when a workspace is selected
  useEffect(() => {
    const loadRecycleBinData = async () => {
      if (!workspaceId) return;
      setLoading(true);
      try {
        await fetchDocuments(workspaceId, true); // Fetch only deleted documents
      } catch (error) {
        console.error("Error fetching recycled documents:", error);
        setNotification({
          type: "error",
          message: "Failed to load documents from recycle bin.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadRecycleBinData();
    }
  }, [workspaceId, fetchDocuments]);

  // Handle workspace change
  const handleWorkspaceChange = (e) => {
    const selectedWorkspaceId = e.target.value;
    setWorkspaceId(selectedWorkspaceId); // Update the selected workspace ID
  };

  const handleRestore = async (documentId) => {
    try {
      await restoreDocument(documentId);
      setNotification({
        type: "success",
        message: "Document restored successfully.",
      });
    } catch (error) {
      console.error("Error restoring document:", error);
      setNotification({
        type: "error",
        message: "Failed to restore document.",
      });
    }
  };

  const handlePermanentDelete = async (documentId) => {
    try {
      await deleteDocument(documentId);
      setNotification({
        type: "success",
        message: "Document permanently deleted!",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      setNotification({
        type: "error",
        message: "Failed to permanently delete document.",
      });
    }
  };

  return (
    <div className="recycle-bin-container">
      {loading ? (
        <div className="centered-spinner">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <h2>Recycle Bin</h2>
          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
            />
          )}

          <Form.Group controlId="workspaceSelect" className="mb-3">
            <Form.Label>Select Workspace</Form.Label>
            <Form.Control
              as="select"
              value={workspaceId}
              onChange={handleWorkspaceChange}
            >
              <option value="" disabled>
                Select a workspace
              </option>
              {workspaces.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {Array.isArray(recycleBin) && recycleBin.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recycleBin.map((document) => (
                  <tr key={document._id}>
                    <td>{document.name || "Unnamed Document"}</td>{" "}
                    {/* Ensure name is valid */}
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleRestore(document._id)}
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
        </>
      )}
    </div>
  );
};

export default RecycleBin;
