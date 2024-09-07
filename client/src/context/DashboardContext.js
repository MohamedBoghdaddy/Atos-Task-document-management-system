import React, { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

export const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [documents, setDocuments] = useState([]); // Initialize as an empty array
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Create workspace
  const createWorkspace = async (workspaceData) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/workspaces/createWorkspace",
        workspaceData,
        { withCredentials: true }
      );
      setWorkspaces([...workspaces, response.data]);
      toast.success("Workspace created successfully.");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace.");
    }
  };

  // Fetch all workspaces
  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/workspaces/getAllWorkspaces",
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setWorkspaces(response.data);
      } else {
        setWorkspaces([]);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to fetch workspaces.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspacesByUserId = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/workspaces/getWorkspacesByUser/${userId}`,
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setWorkspaces(response.data);
      } else {
        setWorkspaces([]);
      }
    } catch (error) {
      console.error("Error fetching workspaces by user ID:", error);
      toast.error("Failed to fetch workspaces.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific workspace by ID
  const fetchWorkspaceById = async (workspaceId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/workspaces/getWorkspaceById/${workspaceId}`,
        { withCredentials: true }
      );
      setWorkspaces([response.data]);
    } catch (error) {
      console.error("Error fetching workspace by ID:", error);
      toast.error("Failed to fetch workspace by ID.");
    }
  };

  // Fetch documents related to a workspace
  const fetchDocuments = async (workspaceId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/workspaces/${workspaceId}/documents`,
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setDocuments(response.data); // Ensure it's an array
      } else {
        setDocuments([]); // Handle non-array response gracefully
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  // Upload a document
  const uploadDocument = async (workspaceId, documentData) => {
    try {
      const formData = new FormData();
      formData.append("document", documentData.file);
      formData.append("workspaceId", workspaceId);

      const response = await axios.post(
        "http://localhost:4000/api/document/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setDocuments([...documents, response.data.document]);
      toast.success("Document uploaded successfully.");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document.");
    }
  };

  // Delete a document
  const deleteDocument = async (documentId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/deleteDocument/${documentId}`,
        { withCredentials: true }
      );
      setDocuments(documents.filter((document) => document._id !== documentId));
      toast.success("Document deleted successfully.");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document.");
    }
  };

  // Preview a document
  const previewDocument = async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/document/preview/${documentId}`,
        { withCredentials: true }
      );
      setPreviewFile(response.data.base64);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Failed to preview document.");
    }
  };

  // Download a document
  const downloadDocument = async (documentId, filename) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/document/download/${documentId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document.");
    }
  };

  const searchDocuments = (term) => {
    setSearchTerm(term);
  };

  const filteredDocuments = Array.isArray(documents)
    ? documents.filter((document) =>
        document.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, user]);

  const contextValue = useMemo(
    () => ({
      loading,
      workspaces,
      fetchWorkspaces,
      createWorkspace,
      fetchWorkspaceById,
      documents: filteredDocuments,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
      previewDocument,
      downloadDocument,
      setSelectedFile,
      searchDocuments,
      previewFile,
      showPreviewModal,
      setShowPreviewModal,
    }),
    [loading, workspaces, filteredDocuments, previewFile, showPreviewModal]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
