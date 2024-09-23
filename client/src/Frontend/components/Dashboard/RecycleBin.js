import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecycle, faTrash } from "@fortawesome/free-solid-svg-icons";
import Notification from "../Dashboard/Notification";
import { DashboardContext } from "../../../context/DashboardContext";
import "bootstrap/dist/css/bootstrap.min.css";

const RecycleBin = () => {
  const {
    fetchDocumentsinRecycleBin,
    restoreDocument,
    deleteDocument,
    recycleBin,
  } = useContext(DashboardContext);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchDocumentsinRecycleBin();
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

    loadData();
  }, [fetchDocumentsinRecycleBin]);

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

          {Array.isArray(recycleBin) && recycleBin.length > 0 ? ( // Check if recycleBin is an array and has items
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
                    <td>{document.name}</td>
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
