const express = require('express');
const path = require('path');
require('dotenv').config();
const {
  models: { User, Note },
} = require('./db');

const app = express();

// middleware
app.use(express.json());
const requireToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = await User.byToken(token);
    req.user = user;
    next();
  } catch (ex) {
    next(ex);
  }
};

// routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/auth', requireToken, async (req, res, next) => {
  res.send(req.user);
});

app.get('/api/users/:userId/notes', requireToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.id === +userId) {
      const notes = await Note.findAll({
        where: { userId },
        attributes: ['text'],
      });
      res.send(notes);
    } else {
      next({ message: 'unauthorized' });
    }
  } catch (ex) {
    next(ex);
  }
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;