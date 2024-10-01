import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/signup.css"; // Shared CSS
import { useSignup } from "../../../../hooks/useSignup";

const Signup = () => {
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    gender,
    setGender,
    nid,
    setNid,
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    errorMessage,
    successMessage,
    isLoading,
    handleSignup,
  } = useSignup();

  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    await handleSignup();
    if (!errorMessage) {
      navigate("/login"); // Redirect to login after successful signup
    }
  };

  return (
    <div className="main-Container">
      <div className="frame-Container">
        <div className="left-sign">
          <h2>Signup</h2>
          <form onSubmit={handleSignupSubmit}>
            <div className="field-group">
              <div className="field-inline">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  required
                />
              </div>
              <div className="field-inline">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={70}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-inline">
                <label htmlFor="nid">National ID (NID):</label>
                <input
                  type="text"
                  id="nid"
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  maxLength={14}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-inline">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="field-inline">
                <label htmlFor="middleName">Middle Name:</label>
                <input
                  type="text"
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="field-inline">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-inline">
                <label htmlFor="password">Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </button>
              </div>

              <div className="field-inline">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i
                    className={
                      showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            <div className="field-group">
              <label>Gender:</label>
              <div className="gender-container">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  Female
                </label>
              </div>
            </div>

            {errorMessage && <div className="error">{errorMessage}</div>}
            {successMessage && <div className="success">{successMessage}</div>}

            <button className="left_btn" type="submit" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Signup"}
            </button>
          </form>
        </div>

        <div className="right-sign">
          <h1>Already have an account?</h1>
          <Link to="/login">
            <button className="right_btn" type="button">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
