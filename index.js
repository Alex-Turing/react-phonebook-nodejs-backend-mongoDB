const express = require('express');
const cors = require('cors');
const app = express();

/**
 * Morgan is like a security camera for my server, it records 
 * every request that comes in and gives you quick insights 
 * about what's happening
 */
const morgan = require('morgan');

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "phoneNumber": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "phoneNumber": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "phoneNumber": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "phoneNumber": "39-23-6423122"
    }
]

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
        error: 'unknow endpoint'
    })
};

app.get('/', (request, response) => {
    response.send('<h1>Hello, World!</h1>');
});

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/info', (request, response) => {
    const generalInfo = `Phonebook has info for ${persons.length} people.`;
    const timeStamp = new Date().toString();
    response.send(`<p>${generalInfo}</p><p>${timeStamp}</p>`);
});

app.get('/api/persons/:id', (request, response) => {
    const personId = Number(request.params.id);
    const person = persons.find(person => person.id === personId);
    if (person) {
        response.json(person);
    }
    else {
        response.status(404).json({
            error: `Person with id:${personId} not found`,
            status: 404,
            timeStamped: new Date().toISOString(),
        });
    }
});

app.post('/api/persons', (request, response) => {
    const body = request.body;
    if (!body.name || !body.phoneNumber) {
        return response.status(400).json({
            error: 'Name and number are required',
            status: 400,
            timeStamped: new Date().toISOString(),
        });
    }

    const newName = persons.find(person => body.name.toLowerCase() === person.name.toLowerCase());
    if(newName) {
        return response.status(400).json({
            error: 'Name must be unique',
            status: 400,
            timeStamped: new Date().toISOString(),
        });
    }

    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.phoneNumber,
    };

    persons = persons.concat(newPerson);
    response.json(newPerson);
});

app.delete('/api/persons/:id',(request, response) =>{
    const personId = Number(request.params.id);
    console.log('person ID:',personId);
    const actualPerson = persons.find(person => person.id === personId);
    console.log('actualPerson:',actualPerson);
    if(!actualPerson) {
        return response.status(404).json({
            error: `Person with id ${personId} not found`,
            status: 404,
            timeStamped: new Date().toISOString()
        });
    }

    persons = persons.filter(person => person.id !== personId);
    response.status(204).json({
        message: `Person with id ${personId} was successfully deleted`,
        status: 204,
        timeStamped: new Date().toISOString()
    });
});

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(p => p.id))
        : 0;
    return maxId + 1;
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});