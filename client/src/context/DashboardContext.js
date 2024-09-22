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
  const [recycleBin, setRecycleBin] = useState([]); // Add recycle bin state
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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
      setWorkspaces(response.data || []);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to fetch workspaces.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch documents related to a workspace
  const fetchDocuments = useCallback(async (workspaceId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/${workspaceId}/documents`,
        { withCredentials: true }
      );
      const allDocuments = response.data || [];
      const activeDocuments = allDocuments.filter((doc) => !doc.deleted);
      const deletedDocuments = allDocuments.filter((doc) => doc.deleted);

      setDocuments(activeDocuments);
      setRecycleBin(deletedDocuments); // Update recycle bin with deleted documents
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload a document
  const uploadDocument = useCallback(
    async (workspaceId, documentData) => {
      try {
        const formData = new FormData();
        formData.append("document", documentData.file);
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
    [documents]
  );

  // Soft delete a document (move to recycle bin)
  const deleteDocument = useCallback(
    async (documentId) => {
      try {
        const response = await axios.put(
          `http://localhost:4000/api/documents/${documentId}/soft-delete`, // API to soft delete
          { deleted: true },
          { withCredentials: true }
        );
        const updatedDocument = response.data;

        // Move the document to the recycle bin
        setDocuments(documents.filter((doc) => doc._id !== documentId));
        setRecycleBin([...recycleBin, updatedDocument]);

        toast.success("Document moved to recycle bin.");
      } catch (error) {
        console.error("Error moving document to recycle bin:", error);
        toast.error("Failed to move document to recycle bin.");
      }
    },
    [documents, recycleBin]
  );

  // Restore a document from the recycle bin
  const restoreDocument = useCallback(
    async (documentId) => {
      try {
        const response = await axios.put(
          `http://localhost:4000/api/documents/${documentId}/restore`, 
          { deleted: false },
          { withCredentials: true }
        );
        const restoredDocument = response.data;

        // Move the document back to active documents
        setRecycleBin(recycleBin.filter((doc) => doc._id !== documentId));
        setDocuments([...documents, restoredDocument]);

        toast.success("Document restored successfully.");
      } catch (error) {
        console.error("Error restoring document:", error);
        toast.error("Failed to restore document.");
      }
    },
    [documents, recycleBin]
  );

  // Delete a workspace
  const deleteWorkspace = useCallback(
    async (workspaceId) => {
      try {
        await axios.delete(
          `http://localhost:4000/api/workspaces/deleteWorkspace/${workspaceId}`,
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

  // Preview a document
  const previewDocument = useCallback(async (documentId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/preview/${documentId}`,
        { withCredentials: true }
      );
      return response.data;
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
      fetchWorkspaces();
    }
  }, [isAuthenticated, user, fetchWorkspaces]);

  const contextValue = useMemo(
    () => ({
      loading,
      workspaces,
      fetchWorkspaces,
      createWorkspace,
      deleteWorkspace, 
      documents: filteredDocuments,
      recycleBin, 
      fetchDocuments,
      uploadDocument, // Expose uploadDocument
      deleteDocument,
      restoreDocument, // Expose restoreDocument in the context
      previewDocument,
      downloadDocument,
      searchDocuments,
      previewFile,
      showPreviewModal,
      setShowPreviewModal,
      setPreviewFile,
    }),
    [
      loading,
      workspaces,
      filteredDocuments,
      recycleBin, // Add recycleBin to memoized dependencies
      previewFile,
      showPreviewModal,
      createWorkspace,
      deleteWorkspace, // Add deleteWorkspace to memoized dependencies
      uploadDocument, // Add uploadDocument to memoized dependencies
      deleteDocument,
      restoreDocument, // Add restoreDocument to memoized dependencies
      fetchWorkspaces,
      fetchDocuments,
      previewDocument,
      downloadDocument,
      searchDocuments,
    ]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
