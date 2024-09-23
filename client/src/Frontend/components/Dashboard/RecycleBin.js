import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecycle, faTrash } from "@fortawesome/free-solid-svg-icons";
import Notification from "../Dashboard/Notification";
import "../styles/Dashboard.css";
import { DashboardContext } from "../../../context/DashboardContext";
import "bootstrap/dist/css/bootstrap.min.css";

const RecycleBin = () => {
  const {
    fetchRecycledDocuments,
    restoreDocument,
    deleteDocumentPermanently,
    recycledDocuments,
  } = useContext(DashboardContext);

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true); // Start loading
      try {
        await restoreDocument();
      } catch (error) {
        console.error("Error fetching recycled documents:", error);
      } finally {
        setLoading(false); // Stop loading after data fetch
      }
    };

    loadData();
  }, [restoreDocument]);

  const handleRestoreDocument = async (documentId) => {
    try {
      await restoreDocument(documentId);
      setNotification({
        type: "success",
        message: "Document restored successfully!",
      });
    } catch (error) {
      console.error("Error restoring document:", error);
      setNotification({
        type: "error",
        message: "Failed to restore document.",
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

          {recycledDocuments && recycledDocuments.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recycledDocuments.map((document) => (
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
