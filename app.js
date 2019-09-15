require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(
  process.env.MONGO_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log('Connected to DB!'),
);

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  token: String,
});
const User = mongoose.model('User', userSchema);

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

app.post('/api/login', (req, res) => {
  const mockUserData = {
    username: 'John',
    password: 'john@gmail.com',
  };

  jwt.sign({ mockUserData }, process.env.USER_SECRET, (err, token) => {
    const user = new User({
      ...mockUserData,
      token,
    });

    user
      .save()
      .then(data => {
        console.log('Data stored!');
        res.json({
          data,
        });
      })
      .catch(e => console.log('Error while storing data!'));
  });
});

// verifyToken
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  
  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.listen(5000, () => {
  console.log('Server listening on 5000');
});