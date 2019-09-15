const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET = 'key';

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API',
    });
});

app.post('/api/posts', verifyToken, (req, res) => {
    jwt.verify(req.token, SECRET, (err, authData) => {
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
    const mockUser = {
        username: 'John',
        password: 'john@gmail.com',
    };
    
    jwt.sign({ mockUser }, SECRET, (err, token) => {
        res.json({
            token
        });
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
    console.log('Listening on 5000');
});