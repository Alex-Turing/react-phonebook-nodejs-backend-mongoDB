const logger = require('./logger');

/**
 * Morgan is like a security camera for my server, it records 
 * every request that comes in and gives you quick insights 
 * about what's happening
 */
const morgan = require('morgan');
morgan.token('body', (request) => JSON.stringify(request.body));

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
};

const customMorgan = morgan(':method :url :status :res[content-length] :response-time ms - Body: :body');
const tinyMorgan = morgan('tiny');

const unknownEndpoint = (request, response) => {
    response.status(404).send({
        error: 'Unknown Endpoint'
    })
};

const errorHandler = (error, request, response, next) => {
    logger.error(error.message);
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    }
    else if(error.name === 'ValidationError') 
    {
        return response.status(404).json({ error: error.message });
    }

    next(error);
};

module.exports = {
    customMorgan,
    tinyMorgan,
    requestLogger,
    unknownEndpoint,
    errorHandler,   
}