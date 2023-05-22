const express = require('express');
const app = express();
const { models: { User,Note }} = require('./db');
const path = require('path');
require('dotenv').config()
const jwt = require('jsonwebtoken');


// middleware
app.use(express.json());

const requireToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = await User.byToken(token);
    req.user = user;
    next();
  } catch(error) {
    next(error);
  }
};

// routes
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async(req, res, next)=> {
  try {
    res.send({ token: await User.authenticate(req.body)});
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/notes', async(req, res, next) => {
  try {
    const authHeader = await User.byToken(req.headers.authorization);
    console.log(authHeader.id, req.params.id)
    if (Number(authHeader.id) === Number(req.params.id)){
      const userAndNotes = await User.findByPk(req.params.id, {
        include:[Note]
      })
      res.send(userAndNotes.notes);
    } else {
      console.log("ids do not match")
    }
    
  }
  catch(ex){
    next(ex);
  }
})

app.get('/api/auth', async(req, res, next)=> {
  try {
    res.send(await User.byToken(req.headers.authorization));
  }
  catch(ex){
    next(ex);
  }
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;