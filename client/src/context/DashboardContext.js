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
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
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
        `http://localhost:4000/api/workspaces/getAllWorkspaces/`,
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
      setRecycleBin(deletedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch documents in recycle bin
  const fetchDocumentsinRecycleBin = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      console.error("No workspaceId provided");
      toast.error("Workspace ID is missing.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:4000/api/documents/${workspaceId}/recycleBin`,
        { withCredentials: true }
      );
      setRecycleBin(response.data || []);
    } catch (error) {
      console.error("Error fetching documents from recycle bin:", error);
      toast.error("Failed to fetch documents from recycle bin.");
    }
  }, []);

  // Upload a document
  const uploadDocument = useCallback(async (workspaceId, documentData) => {
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
      setDocuments((prevDocuments) => [
        ...prevDocuments,
        response.data.document,
      ]);
      toast.success("Document uploaded successfully.");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document.");
    }
  }, []);

  const deleteDocument = useCallback(
    async (documentId) => {
      try {
        const response = await axios.put(
          `http://localhost:4000/api/documents/${documentId}/soft-delete`,
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
  const restoreDocument = useCallback(async (documentId) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/documents/${documentId}/restore`,
        { deleted: false },
        { withCredentials: true }
      );
      const restoredDocument = response.data;
      setRecycleBin((prevRecycleBin) =>
        prevRecycleBin.filter((doc) => doc._id !== documentId)
      );
      setDocuments((prevDocuments) => [...prevDocuments, restoredDocument]);
      toast.success("Document restored successfully.");
    } catch (error) {
      console.error("Error restoring document:", error);
      toast.error("Failed to restore document.");
    }
  }, []);

  // Delete a workspace
  const deleteWorkspace = useCallback(async (workspaceId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/workspaces/deleteWorkspace/${workspaceId}`,
        { withCredentials: true }
      );
      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.filter((workspace) => workspace._id !== workspaceId)
      );
      toast.success("Workspace deleted successfully.");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("Failed to delete workspace.");
    }
  }, []);

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

  // Update document metadata
  const updateDocumentMetadata = useCallback(
    async (documentId, metadata) => {
      try {
        const response = await axios.put(
          `http://localhost:4000/api/documents/${documentId}/metadata`,
          metadata,
          { withCredentials: true }
        );

        const updatedDocument = response.data;

        // Update the state with the modified document
        setDocuments((prevDocuments) =>
          prevDocuments.map((doc) =>
            doc._id === documentId ? updatedDocument : doc
          )
        );

        toast.success("Document metadata updated successfully.");
      } catch (error) {
        console.error(
          "Error updating document metadata:",
          error.response?.data || error.message
        );
        toast.error("Failed to update document metadata.");
      }
    },
    [setDocuments]
  );

  const updateDocumentTags = useCallback(
    async (documentId, tags) => {
      try {
        const response = await axios.put(
          `http://localhost:4000/api/documents/${documentId}/tags`,
          { tags },
          { withCredentials: true }
        );
        const updatedDocument = response.data;

        setDocuments((prevDocuments) =>
          prevDocuments.map((doc) =>
            doc._id === documentId ? updatedDocument : doc
          )
        );

        toast.success("Document tags updated successfully.");
      } catch (error) {
        console.error("Error updating document tags:", error);
        toast.error("Failed to update document tags.");
      }
    },
    [setDocuments]
  );

  // Move getDocumentVersions into useCallback
  const getDocumentVersions = useCallback(async (documentId) => {
    const document = await Document.findById(documentId).select("versions");
    return document.versions;
  }, []);

  // Move restoreDocumentVersion into useCallback
  const restoreDocumentVersion = useCallback(
    async (documentId, versionNumber) => {
      const document = await Document.findById(documentId);
      const versionToRestore = document.versions.find(
        (version) => version.versionNumber === versionNumber
      );
      if (versionToRestore) {
        document.content = versionToRestore.content;
        await document.save();
      }
    },
    []
  );

  const searchDocuments = useCallback(
    async (term, metadata, tags) => {
      try {
        const queryParams = new URLSearchParams();

        if (term) setSearchTerm(term); // Set the search term for local state filtering

        if (metadata) queryParams.append("metadata", metadata);
        if (tags) queryParams.append("tags", tags);

        const response = await axios.get(
          `http://localhost:4000/api/documents/search?${queryParams.toString()}`,
          { withCredentials: true }
        );

        const documents = response.data;

        // Optionally filter the documents by the search term if provided
        const filteredDocuments = term
          ? documents.filter((doc) =>
              doc.name.toLowerCase().includes(term.toLowerCase())
            )
          : documents;

        setDocuments(filteredDocuments); // Set the documents state with the search results
        toast.success("Documents found.");
      } catch (error) {
        console.error(
          "Error searching documents:",
          error.response?.data || error.message
        );
        toast.error("Failed to search documents.");
      }
    },
    [setDocuments, setSearchTerm]
  );

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;
    return documents.filter(
      (document) =>
        document.name &&
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
      uploadDocument,
      deleteDocument,
      restoreDocument,
      previewDocument,
      setSelectedWorkspace,
      downloadDocument,
      searchDocuments,
      updateDocumentMetadata,
      updateDocumentTags,
      getDocumentVersions,
      restoreDocumentVersion,
      showPreviewModal,
      setShowPreviewModal,
      setPreviewFile,
      fetchDocumentsinRecycleBin,
      fetchWorkspaceById,
      fetchWorkspacesByUserId,
    }),
    [
      loading,
      workspaces,
      filteredDocuments,
      recycleBin,
      previewFile,
      showPreviewModal,
      createWorkspace,
      deleteWorkspace,
      uploadDocument,
      deleteDocument,
      restoreDocument,
      fetchWorkspaces,
      setSelectedWorkspace, // Add this function to context
      fetchWorkspacesByUserId,
      fetchDocuments,
      previewDocument,
      downloadDocument,
      searchDocuments,
      updateDocumentMetadata,
      updateDocumentTags,
      getDocumentVersions, // Now dependency is valid
      restoreDocumentVersion, // Now dependency is valid
      fetchDocumentsinRecycleBin, // Include in memoized dependencies
      fetchWorkspaceById,
    ]
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;
