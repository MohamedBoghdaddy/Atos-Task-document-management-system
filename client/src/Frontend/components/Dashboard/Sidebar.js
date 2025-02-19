import React, { useState, useEffect, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import { Link } from "react-router-dom";
import {
  FaFolder,
  FaChartLine,
  FaTools,
  FaTrash,
  FaEye,
  FaEdit,
} from "react-icons/fa";
import { Modal } from "react-bootstrap";
import "../styles/Sidebar.css";
import { useAuthContext } from "../../../context/AuthContext";
import axios from "axios";

const Sidebar = () => {
  const { state } = useAuthContext();
  const { user, isAuthenticated } = state;
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [image, setImage] = useState(null); // Holds the uploaded image file
  const [scale, setScale] = useState(1.2); // Scale for zooming in/out
  const [rotate, setRotate] = useState(0); // Rotate angle
  const [isEditing, setIsEditing] = useState(false); // Toggle for edit mode
  const [showPreview, setShowPreview] = useState(false); // Toggle for preview modal
  const editorRef = useRef(null); // Reference to AvatarEditor for cropping

  // Load profile photo from localStorage on component mount
  useEffect(() => {
    const savedProfilePhoto = localStorage.getItem("profilePhoto");
    if (savedProfilePhoto) {
      setProfilePhoto(savedProfilePhoto);
    } else if (user && user.profilePhoto) {
      setProfilePhoto(user.profilePhoto);
    }
  }, [user]);

  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setImage(null); // Clear selected image if toggling off
  };

  // Function to handle file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      localStorage.removeItem("profilePhoto"); // Clear previous photo from localStorage
    }
  };

  // Function to save the cropped image
  const handleSave = async () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const dataUrl = canvas.toDataURL();

      const blob = await fetch(dataUrl).then((res) => res.blob());
      const formData = new FormData();
      formData.append("photoFile", blob, "profile-photo.png");

      try {
        const response = await axios.put(
          `http://localhost:4000/api/users/update/${user._id}`, // Update with your server URL if different
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const newProfilePhoto = response.data.user.profilePhoto;
        setProfilePhoto(newProfilePhoto);
        localStorage.setItem("profilePhoto", newProfilePhoto);
        setImage(null); // Clear the image selection after saving
        setIsEditing(false); // Exit edit mode after saving
      } catch (error) {
        console.error("Error uploading profile photo:", error);
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>
          {isAuthenticated && user ? `Welcome, ${user.username}` : "Guest"}
        </h2>
        {isAuthenticated && (
          <div className="profile-photo-section">
            {profilePhoto ? (
              <>
                <img
                  src={`http://localhost:4000${profilePhoto}`}
                  alt="Profile"
                  className="profile-photo"
                />
                <div className="icon-buttons">
                  <button onClick={toggleEdit}>
                    <FaEdit /> {/* Toggle Edit Icon */}
                  </button>
                  <button onClick={() => setShowPreview(true)}>
                    <FaEye /> {/* Preview Icon */}
                  </button>
                </div>
              </>
            ) : (
              <p>No Profile Photo</p>
            )}
            {isEditing && (
              <>
                <input type="file" onChange={handleImageChange} />
                {image && (
                  <div className="avatar-editor">
                    <AvatarEditor
                      ref={editorRef}
                      image={image}
                      width={150}
                      height={150}
                      border={30}
                      borderRadius={100}
                      color={[255, 255, 255, 0.6]} // Light white tint
                      scale={scale}
                      rotate={rotate}
                      style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)" }}
                    />
                    <div className="controls">
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="slider"
                      />
                      <button onClick={() => setRotate((prev) => prev + 90)}>
                        Rotate
                      </button>
                      <button onClick={handleSave}>Save Profile Photo</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={`http://localhost:4000${profilePhoto}`}
            alt="Profile Preview"
            className="img-fluid"
            style={{ maxWidth: "100%", borderRadius: "50%" }}
          />
        </Modal.Body>
      </Modal>

      <ul className="sidebar-menu">
        <li>
          <Link to="/analytics">
            <FaChartLine /> Analytics
          </Link>
        </li>
        <li>
          <Link to="/workspace">
            <FaFolder /> Workspace
          </Link>
        </li>
        <li>
          <Link to="/recyclebin">
            <FaTrash /> Recycle Bin
          </Link>
        </li>
        <li>
          <Link to="/setting">
            <FaTools /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default React.memo(Sidebar);
