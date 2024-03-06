import express from "express";
import axios from "axios";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const API_URL = "http://localhost:4000";

// Route to render the main page
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    console.log(response.data);
    
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Route to render a specific post with ID
app.get("/posts/:id", async (req, res) => {
  const requiredId = parseInt(req.params.id, 10);
  console.log(requiredId);

  try {
    const response = await axios.get(`${API_URL}/posts/${requiredId}`);
    console.log(response.data);

    const postData = Array.isArray(response.data) ? response.data : [response.data];

    res.render("index.ejs", { posts: postData });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: `No post found with ID ${requiredId}` });
    } else {
      res.status(500).json({ message: "Error fetching posts" });
    }
  }
});

// Route to render the new page
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

// Route to render the edit page
app.get("/edit/:id", async (req, res) => {
  const requiredId = parseInt(req.params.id, 10);

  try {
    const response = await axios.get(`${API_URL}/posts/${requiredId}`);
    console.log(response.data);

    // Ensure the response status code is 200 (OK) before proceeding
    if (response.status === 200) {
      res.render("modify.ejs", {
        heading: "Edit Post",
        submit: "Update Post",
        post: response.data,
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: `No post found with ID ${requiredId}` });
    } else {
      res.status(500).json({ message: "Error fetching posts" });
    }
  }
});

// Create a new post
app.post("/api/posts", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, req.body);
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// Partially update a post
app.post("/api/posts/:id", async (req, res) => {
  const requiredId = parseInt(req.params.id, 10);
  console.log(requiredId);

  try {
    const response = await axios.patch(`${API_URL}/posts/${requiredId}`, req.body);
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post
app.get("/api/posts/delete/:id", async (req, res) => {
  const requiredId = parseInt(req.params.id, 10);
  console.log(requiredId);

  try {
    await axios.delete(`${API_URL}/posts/${requiredId}`);
    res.redirect("/");
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: `No post found with ID ${requiredId}` });
    } else {
      res.status(500).json({ message: "Error fetching posts" });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});