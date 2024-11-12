import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Frontend/components/LOGIN&REGISTRATION/Login/Login";
import Signup from "./Frontend/components/LOGIN&REGISTRATION/Signup/Signup";
import Home from "./Frontend/components/Home/home";
import NavBar from "./Frontend/components/Home/Navbar";
import Sidebar from "./Frontend/components/Dashboard/Sidebar";
import Footer from "./Frontend/components/Home/Footer";
import MiniNavBar from "./Frontend/components/Home/Mininavbar";
import Workspace from "./Frontend/components/Dashboard/Workspace";
import Dashboard from "./Frontend/components/Dashboard/Dashboard";
import RecycleBin from "./Frontend/components/Dashboard/RecycleBin";
import Setting from "./Frontend/components/Dashboard/Setting";
import Analytics from "./Frontend/components/Dashboard/Analytics";
import {  ToastContainer } from "react-toastify";
import SearchResults from "./Frontend/components/Home/SearchResults";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ToastContainer />
              <NavBar />

              <Home />
              <Footer />
            </>
          }
        />{" "}
        <Route
          path="/login"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <Login />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <Signup />
            </>
          }
        />
        <Route
          path="/Workspace"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <Workspace />
              <Sidebar />
              <Footer />
            </>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <Dashboard />
              <Sidebar />
              <Footer />
            </>
          }
        />
        <Route
          path="/RecycleBin"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <RecycleBin />
              <Sidebar />
              <Footer />
            </>
          }
        />
        <Route
          path="/Setting"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <Setting />
              <Sidebar />
              <Footer />
            </>
          }
        />
        <Route
          path="/Analytics"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <Analytics />
              <Sidebar />
              <Footer />
            </>
          }
        />
        <Route
          path="/SearchResults"
          element={
            <>
              <ToastContainer />
              <MiniNavBar />
              <SearchResults />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
