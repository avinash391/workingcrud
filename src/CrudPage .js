import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const API_KEY = '648c396d1d8af4398d88e506';
const BASE_URL = 'https://dummyapi.io/data/v1';

const CrudPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    picture: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  // const [editPostId, setEditPostId] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [editPostMode, setEditPostMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user`, {
        headers: { 'app-id': API_KEY },
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/post`, {
        headers: { 'app-id': API_KEY },
      });
      setPosts(response.data.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleInputChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    try {
      const id = uuidv4(); // Generate random ID
      const response = await axios.post(
        `${BASE_URL}/user/create`,
        {
          ...formData,
          id: id, // Assign the generated ID
          title: 'miss',
          email: formData.email,
        },
        {
          headers: { 'app-id': API_KEY },
        }
      );
      setUsers((prevUsers) => [...prevUsers, response.data]);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        picture: '',
      });
      showNotification('User added successfully');
    } catch (error) {
      console.error('Error adding user:', error);
      showNotification('Error adding user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/user/${id}`, {
        headers: { 'app-id': API_KEY },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      showNotification('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user');
    }
  };

  const handleEditUser = async (id) => {
    const user = users.find((user) => user.id === id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      picture: user.picture,
    });
    setEditMode(true);
    setEditUserId(id);
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    try {
      await axios.put(
        `${BASE_URL}/user/${editUserId}`,
        {
          ...formData,
          title: 'miss',
          email: '',
        },
        {
          headers: { 'app-id': API_KEY },
        }
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === editUserId) {
            return { ...user, ...formData };
          }
          return user;
        })
      );
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        picture: '',
      });
      setEditMode(false);
      setEditUserId(null);
      showNotification('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Error updating user');
    }
  };

  const [postFormData, setPostFormData] = useState({
    text: '',
    image: '',
  });
  const handlePostInputChange = (event) => {
    setPostFormData((prevData) => ({
      ...prevData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAddPost = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${BASE_URL}/post/create`,
        {
          ...postFormData,

          id: uuidv4(), // Generate unique ID
          owner: users[0]?.id || '',
        },
        {
          headers: { 'app-id': API_KEY },
        }
      );
      setPosts((prevPosts) => [...prevPosts, response.data]);
      setPostFormData({
        text: '',
        image: '',
      });
    } catch (error) {
      console.error('Error adding post:', error);
    }
    showNotification('data updated successfully')
  };
  
  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/post/${id}`, {
        headers: { 'app-id': API_KEY },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    showNotification('DeletePost successfully')
  };
  

  const handleEditPost = (id) => {
    const postToEdit = posts.find((post) => post.id === id);
    setPostFormData({
      text: postToEdit.text,
      image: postToEdit.image,
    });
    setEditPostMode(true);
    setEditPostId(id);
  };

  const handleUpdatePost = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.put(
        `${BASE_URL}/post/${editPostId}`,
        {
          ...postFormData,
        },
        {
          headers: { 'app-id': API_KEY },
        }
      );
      const updatedPost = response.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
      setPostFormData({
        text: '',
        image: '',
      });
      setEditPostMode(false);
      setEditPostId(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
    showNotification(' successfully')
  };
  

  const handleCancelPostUpdate = () => {
    setPostFormData({
      text: '',
      image: '',
    });
    setEditPostMode(false);
    setEditPostId(null);
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9);
  };


  const showNotification = (message) => {
    setNotificationMessage(message);
    setPopupOpen(true);
  };

  const handleCloseNotification = () => {
    setPopupOpen(false);
    setNotificationMessage('');
  };

  return (
    <div>
      <h2>Users</h2>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <img src={user.picture}/>
            <ListItemText primary={`${user.firstName} ${user.lastName}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditUser(user.id)}>
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteUser(user.id)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <h2>Add/Edit User</h2>
      <form onSubmit={editMode ? handleUpdateUser : handleAddUser}>
        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
        <br />
        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
        />
        <br />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <br />
        <TextField
          label="Picture URL"
          name="picture"
          value={formData.picture}
          onChange={handleInputChange}
        />
        <br />
        <Button type="submit" variant="contained" color="primary">
          {editMode ? 'Update' : 'Add'}
        </Button>
      </form>

      <Typography variant="h1">CRUD Operations - Posts</Typography>

<Box>
  <form onSubmit={editPostMode ? handleUpdatePost : handleAddPost}>
    <TextField
      type="text"
      name="text"
      value={postFormData.text}
      label="Post Text"
      onChange={handlePostInputChange}
    />
    <TextField
      type="text"
      name="image"
      value={postFormData.image}
      label="Image URL"
      onChange={handlePostInputChange}
    />
    {editPostMode ? (
      <>
        <Button variant="contained" type="submit">Update Post</Button>
        <Button variant="contained" onClick={handleCancelPostUpdate}>Cancel</Button>
      </>
    ) : (
      <Button variant="contained" type="submit">Add Post</Button>
    )}
  </form>

  <Typography variant="h2">Posts</Typography>
  <List>
    {posts.map((post) => (
      <ListItem key={post.id}>
        {post.image && <img className="src-img" src={post.image} alt="Post" />}
        <ListItemText primary={post.text} />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="delete" onClick={() => handleDeletePost(post.id)}>
            <Delete />
          </IconButton>
          <IconButton edge="end" aria-label="edit" onClick={() => handleEditPost(post.id)}>
            <Edit />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ))}
  </List>
</Box>

      <Dialog open={popupOpen} onClose={handleCloseNotification}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>{notificationMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotification} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CrudPage;
