import React, { useEffect, useState } from "react";
import { fetchAllPosts, pushPost } from "./graphql";
import "./style.css"; // Import the CSS file

const App = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await fetchAllPosts();
    setPosts(data || []);
    setLoading(false);
  };

  const handlePushPost = async () => {
    if (!newPost.title || !newPost.content) return;
    await pushPost(newPost.title, newPost.content);
    setNewPost({ title: "", content: "" });
    fetchPosts(); // Refresh posts after adding
  };

  return (
    <div className="container">
      <h2>GraphQL Blog</h2>

      <div className="form-group">
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
      </div>

      <div className="form-group">
        <textarea
          placeholder="Content"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          rows="4"
        />
      </div>

      <button onClick={handlePushPost}>Add Post</button>

      <h3>All Posts</h3>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default App;
