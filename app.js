const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const phonebookRouter = require('./controller/phonebooks');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = config.MONGODB_URI;

logger.info('connecting to', url);

mongoose.connect(url)
    .then(() => {
        logger.info('Phonebook app connected to MongoDB');
    })
    .catch(err => {
        logger.error('Error connecting to MongoDB', err);
    });

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tinyMorgan);
app.use(middleware.customMorgan);

app.use('/api/persons', phonebookRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;