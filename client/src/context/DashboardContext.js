import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

export const DashboardContext = createContext();

const DashboardProvider = ({ children }) => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // Declare selectedFile
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Handle file selection for uploading a document
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Set selectedFile when a file is selected
  };

  // Create workspace
  const createWorkspace = useCallback(
    async (workspaceData) => {
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
    },
    [workspaces]
  );

  // Fetch all workspaces
  const fetchWorkspaces = useCallback(async () => {
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
  }, []);

  // Fetch workspaces by user ID
  const fetchWorkspacesByUserId = useCallback(async (userId) => {
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
  }, []);

  // Fetch specific workspace by ID
  const fetchWorkspaceById = useCallback(async (workspaceId) => {
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
  }, []);

  // Delete a workspace
  const deleteWorkspace = useCallback(
    async (workspaceId) => {
      try {
        await axios.delete(
          `http://localhost:4000/api/workspaces/${workspaceId}/deleteWorkspace`,
          {
            withCredentials: true,
          }
        );
        setWorkspaces(
          workspaces.filter((workspace) => workspace._id !== workspaceId)
        );
        toast.success("Workspace deleted successfully.");
      } catch (error) {
        console.error("Error deleting workspace:", error);
        toast.error("Failed to delete workspace.");
      }
    },
    [workspaces]
  );

  // Fetch documents related to a workspace
  const fetchDocuments = useCallback(async (workspaceId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/${workspaceId}/documents`,
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setDocuments(response.data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload a document
  const uploadDocument = useCallback(
    async (workspaceId) => {
      try {
        if (!selectedFile) {
          toast.error("Please select a file to upload.");
          return;
        }
        const formData = new FormData();
        formData.append("document", selectedFile);
        formData.append("workspaceId", workspaceId);

        const response = await axios.post(
          "http://localhost:4000/api/documents/upload",
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
    },
    [documents, selectedFile] // Include selectedFile as a dependency
  );

  // Delete a document
  const deleteDocument = useCallback(
    async (documentId) => {
      try {
        await axios.delete(
          `http://localhost:4000/api/documents/${documentId}`,
          {
            withCredentials: true,
          }
        );
        setDocuments(
          documents.filter((document) => document._id !== documentId)
        );
        toast.success("Document deleted successfully.");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document.");
      }
    },
    [documents]
  );

  // Preview a document
  const previewDocument = useCallback(async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/preview/${documentId}`,
        { withCredentials: true }
      );
      setPreviewFile(response.data.base64);
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Failed to preview document.");
    }
  }, []);

  // Download a document
  const downloadDocument = useCallback(async (documentId, filename) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/download/${documentId}`,
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
  }, []);

  const searchDocuments = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) =>
      document.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWorkspacesByUserId(user._id); // Use fetchWorkspacesByUserId here
    }
  }, [isAuthenticated, user, fetchWorkspacesByUserId]);

  const contextValue = useMemo(
    () => ({
      loading,
      workspaces,
      fetchWorkspaces,
      fetchWorkspacesByUserId, // Add fetchWorkspacesByUserId to context
      createWorkspace,
      fetchWorkspaceById,
      deleteWorkspace,
      documents: filteredDocuments,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
      previewDocument,
      downloadDocument,
      setSelectedFile,
      searchDocuments,
      handleFileChange, // Expose handleFileChange for file uploads
      previewFile,
      showPreviewModal,
      setShowPreviewModal,
    }),
    [
      loading,
      workspaces,
      filteredDocuments,
      previewFile,
      showPreviewModal,
      createWorkspace,
      deleteDocument,
      uploadDocument,
      deleteWorkspace,
      fetchWorkspaces,
      fetchWorkspaceById,
      fetchDocuments,
      previewDocument,
      downloadDocument,
      searchDocuments,
      fetchWorkspacesByUserId,
    ]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
