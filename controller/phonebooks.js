const phonebookRouter = require('express').Router();
const Person = require('../models/phonebook');
const logger = require('../utils/logger');

phonebookRouter.get('/', async (request, response) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        });
});

phonebookRouter.get('/:id', (request, response) => {
    const id = request.params.id;
    Person.findById(id)
        .then(person => {
            if (person) {
                response.json(person);
            }
            else {
                response.status(404).json({
                    error: `Person with ID ${id} not found`,
                    status: 404,
                    timeStamped: new Date().toISOString()
                });
            }
        });
});

phonebookRouter.post('/', (request, response) => {
    const body = request.body;
    const person = new Person({
        name: body.name,
        number: body.number
    });
    person.save().
        then(savedPerson => {
            response.json(savedPerson);
        })
        .catch(error => next(error));
});

phonebookRouter.delete('/:id', (request, response) => {
    const id = request.params.id;
    logger.info('id', id);
    Person.findByIdAndDelete(id)
        .then(() => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

phonebookRouter.put('/:id', (request, response) => {
    const id = request.params.id;
    const { name, number } = request.body;
    if (!name || typeof name !== 'string') {
        return response.status(400).json({
            error: 'Invalid name',
            status: 400,
            timeStamped: new Date().toISOString()
        });
    }
    if (!number || typeof number !== 'string') {
        return response.status(400).json({
            error: 'Invalid number',
            status: 400,
            timeStamped: new Date().toISOString()
        });
    }
    Person.findByIdAndUpdate(id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            if (!updatedPerson) {
                return response.status(404).json({
                    error: `Person with ID ${id} not found`,
                    status: 404,
                    timeStamped: new Date().toISOString()
                });
            }
            response.json(updatedPerson);
        })
        .catch(error => next(error));
});

module.exports = phonebookRouter;