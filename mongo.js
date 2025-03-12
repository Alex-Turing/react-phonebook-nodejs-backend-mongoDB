const mongoose = require('mongoose');

if (process.argv.length < 5 && process.argv.length > 3) {
    console.log('Please provide the database password, name and phone number to add to the phonebook as arguments.');
    process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://alexander:${password}@cluster0.9dxup.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

const name = process.argv[3];
const number = process.argv[4];

mongoose.set('strictQuery', false);

mongoose.connect(url);

const nameSchema = new mongoose.Schema({
    name: String,
    number: String,
    date: Date,
});

const Person = mongoose.model('Person', nameSchema);

const person = new Person({
    name,
    number,
    date: new Date(),
});

if (name && number) {
    person.save().then(() => {
        console.log(`Added ${name} with number ${number} to the phonebook.`);
        mongoose.connection.close();
    });
}


if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('Phonebook:');
        result.forEach(person => {
            console.log(person.name, person.number)
            //console.log(person);
            mongoose.connection.close();
        })
    })
}