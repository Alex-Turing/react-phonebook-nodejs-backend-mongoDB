require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Person = require('./models/phonebook');
const app = express();

/**
 * Morgan is like a security camera for my server, it records 
 * every request that comes in and gives you quick insights 
 * about what's happening
 */
const morgan = require('morgan');

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

morgan.token('body', (request) => JSON.stringify(request.body));

app.use(express.json());
app.use(express.static('dist'));
app.use(cors());
app.use(morgan('tiny'));
app.use(morgan(':method :url :status :res[content-length] :response-time ms - Body: :body'));
app.use(requestLogger);


const unknownEndpoint = (request, response) => {
    response.status(404).send({
        error: 'Unknown Endpoint'
    })
};

app.get('/', (request, response) => {
    response.send('<h1>Hello, World!</h1>');
});

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons);
    });
});

app.get('/info', (request, response) => {
    Person.find({})
        .then(persons => {
            const generalInfo = `Phonebook has info for ${persons.length} people.`
            const timeStamp = new Date().toString();
            response.send(`<p>${generalInfo}</p><p>${timeStamp}</p>`);
        })
        .catch(error => {
            console.error(error);
            response.status(500).json({
                error: 'Error fetching data from database',
                status: 500,
                timeStamped: new Date().toISOString(),
            });
        })
});

app.get('/api/persons/:id', (request, response) => {
    const personId = request.params.id;
    //const person = persons.find(person => person.id === personId);
    Person.findById(personId)
        .then(person => response.json(person))
        .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
    const {name, number} = request.body;

    Person.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
        .then(existingPerson => {
            if (existingPerson) {
                return response.status(400).json({
                    error: 'Name must be unique',
                    status: 400,
                    timeStamped: new Date().toISOString(),
                });
            }
            const person = new Person({
                name: name,
                number: number,
            });

            person.save()
                .then(savedPerson => response.json(savedPerson))
                .catch(error => next(error));
        })
        .catch(error => next(error));
    //const newName = persons.find(person => body.name.toLowerCase() === person.name.toLowerCase());
});

app.put('/api/persons/:id', (request, response) => {
    const personId = request.params.id;
    const updatedData = request.body;
    Person.findByIdAndUpdate(personId, updatedData, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            if (!updatedPerson) {
                return response.status(404).json({
                    error: `Person with id ${personId} not found`,
                    status: 404,
                    timeStamped: new Date().toISOString()
                });
            }
            response.json(updatedPerson);
        })
        .catch(error => {
            console.error(error);
            response.status(500).json({
                error: 'Error updating person in database',
                status: 500,
                timeStamped: new Date().toISOString()
            });
        });
})

app.delete('/api/persons/:id', (request, response, next) => {
    const personId = request.params.id;
    console.log('person ID:', personId);
    Person.findByIdAndDelete(personId)
        .then(deletedPerson => {
            if (!deletedPerson) {
                return response.status(404).json({
                    error: `Person with id ${personId} not found`,
                    status: 404,
                    timeStamped: new Date().toISOString()
                });
            }
            response.status(204).json({
                message: `Person with id ${personId} was successfully deleted`,
                status: 204,
                timeStamped: new Date().toISOString()
            });
        })
        .catch(error => next(error));
});

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);
    if (error.message === 'CastError') {
        return response.status(400).send({ error: 'malformated id' });
    }
    else if(error.message === 'ValidationError') 
    {
        return response.status(404).json({ error: error.message });
    }

    next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});