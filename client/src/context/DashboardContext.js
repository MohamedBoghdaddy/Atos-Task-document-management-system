import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button, Form, Table, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSearch,
  faTrash,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthContext } from "../context/AuthContext";

export const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const createWorkspace = async (workspaceData) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/workspaces", // Use the correct route here
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

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/workspaces", // Use the correct route here
        {
          withCredentials: true,
        }
      );
      setWorkspaces(response.data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to fetch workspaces.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (workspaceId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/workspaces/${workspaceId}/documents`, // Correct route
        { withCredentials: true }
      );
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };


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

  const deleteDocument = async (documentId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/deleteDocument/${documentId}`,
        {
          withCredentials: true,
        }
      );
      setDocuments(documents.filter((document) => document._id !== documentId));
      toast.success("Document deleted successfully.");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document.");
    }
  };

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

  const filteredDocuments = documents.filter((document) =>
    document.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, user]);

  return (
    <DashboardContext.Provider
      value={{
        loading,
        workspaces,
        fetchWorkspaces,
        createWorkspace,
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
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
