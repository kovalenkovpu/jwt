require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const isEmpty = require('lodash/isEmpty');
const User = require('./models/User');
// utils
const verifyToken = require('./utils/verifyToken');

const app = express();

mongoose.connect(
  process.env.MONGO_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => console.log('Connected to DB!'),
);

app.use(bodyParser.json());
  
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
  });
});

app.post('/api/posts', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.USER_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created',
        authData,
      });
    }
  });
});

// TODO: create Router for user actions
// Register
app.post('/api/user/signup', async (req, res) => {
  const { email, password } = req.body;
  const userData = { email, password };
  const [currentUser] = await User.find({ email, password });

  if (currentUser) {
    return res.json({
      message: 'User already exists, please login'
    });
  }

  jwt.sign({ userData }, process.env.USER_SECRET, async (err, token) => {
    const user = new User(userData);
    
    try {
      await user.save();

      res.header('authorization', `Bearer ${token}`);
      res.json({
        message: 'User successfully created'
      });
    } catch(error) {
      res.sendStatus(500);
      res.json({ error });
    }
  });
});

// Login
app.post('/api/user/login', async (req, res) => {
  const { email, password } = req.body;
  const [currentUser] = await User.find({ email, password });
  const userData = { email, password };

  if (!isEmpty(currentUser)) {
    jwt.sign({ userData }, process.env.USER_SECRET, async (err, token) => {
      try {
        res.header('authorization', `Bearer ${token}`);
        res.json({
          message: 'You have logged in',
          email,
        });
      } catch(error) {
        res.sendStatus(500);
        res.json({ error });
      }
    });
  } else {
    res.json({
      message: 'User doesnt exist, please create account',
    });
    res.sendStatus(403);
  }
});

// run server
app.listen(5000, () => {
  console.log('Server listening on 5000');
});