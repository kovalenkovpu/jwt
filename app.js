require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

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
  
const UserSchema = new mongoose.Schema({
  userName: { type: String, },
  email: { type: String, },
  token: { type: String, },
});
const User = mongoose.model("Users", UserSchema);

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

app.post('/api/login', async (req, res) => {
  const { userName, email } = req.body;
  const userData = { userName, email };

  jwt.sign({ userData }, process.env.USER_SECRET, async (err, token) => {
    const user = new User({
      ...userData,
      token,
    });
    
    try {
      const createdUser = await user.save();

      res.json({
        createdUser,
      });
    } catch(e) {
      console.log('Error while storing data!', e);
      res.sendStatus(500);
    }
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