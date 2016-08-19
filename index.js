// Main starting point of the application
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
  // create instance of express
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

// DB setup
mongoose.connect('mongodb://localhost:auth/auth');

// App setup
  // mw: any incoming request passed to mw
app.use(morgan('combined')); // logging framework
app.use(bodyParser.json({ type: '*/*' })); // parses incoming requests (into json, no matter what type)
router(app);

// Server setup
const port = process.env.PORT || 3090;
  // create server and forward anything to our express application
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on:', port);
