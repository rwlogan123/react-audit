const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors({ 
  origin: "https://musical-winner-jj9x456wxp79h5p9g-5173.app.github.dev",
  credentials: true 
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/content/test-generation", (req, res) => {
  console.log("✅ Test content endpoint hit");
  res.json({ 
    success: true, 
    content: { 
      blogPosts: [{ id: 1, title: "Test Blog", status: "pending" }] 
    } 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});