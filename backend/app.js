const path = require('path');
const fs = require('fs');
// .env variables
require('./util/node_env')();
require ('custom-env').env(process.env.NODE_ENV);

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('./util/file');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS'){
    res.sendStatus(200);
  }
  next();
});
app.use(auth);
app.put('/post-image', (req, res, next) => {
    if (!req.isAuth){
        throw new Error('Not Authenticated!');
    }
    if (!req.file) {
        return res.status(200).json({message: 'No file provided!'});
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    console.log('post-image: ', req.body, req.file);
    return res
        .status(201)
        .json({ message: 'File stored', filePath: req.file.path })
    ;
});
app.use(
    '/graphql',
    graphqlHTTP({
      schema: graphqlSchema,
      rootValue: graphqlResolvers,
      graphiql: true,
      customFormatErrorFn: error => {
        if (!error.originalError){
          return error;
        }
        const data = error.originalError.data;
        const message = error.message || 'An error occured.';
        const code = error.originalError.code || 500;
        return { message: message, status: code, data: data }
      }
    })
);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(
        process.env.DB_URL,
        {useUnifiedTopology: true, useNewUrlParser: true}
    )
    .then(result => {
        const server = app.listen(8080);
        // const socket = new Socket();
        // socket.init(server);
        // socket.getIo().on('connection', socket => {
        //   console.log('Client connected.');
        // });
    })
    .catch(err => console.log(err));
