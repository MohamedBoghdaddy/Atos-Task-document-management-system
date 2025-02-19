import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import connectMongoDBSession from "connect-mongodb-session";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userroutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import analyticRoutes from "./routes/analyticRoutes.js";

// Resolving __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const MongoDBStore = connectMongoDBSession(session);
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:4000";

// Ensure MongoDB connection URL is defined
if (!MONGO_URL) {
  console.error("MongoDB connection string (MONGO_URL) is not set in .env");
  process.exit(1);
}

// MongoDB Session Store
const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});

store.on("error", (error) =>
  console.error("MongoDB session store error:", error)
);

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((error) => {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  });

// CORS Configuration
const corsOptions = {
  origin: [CORS_ORIGIN, "http://localhost:4000"], // Allow frontend and local development
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// JWT Token Creation
const createToken = (_id, res) => {
  const token = jwt.sign({ _id }, JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure only in production
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return token;
};

// Middleware to Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analytic", analyticRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).send("Something went wrong!");
});

// Static File Serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve React Frontend
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/build/index.html"))
);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
