require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url)
    .then(result => {
        console.log('Phonebook app connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    date: {
        type: Date,
        default: Date.now
    }
});

personSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Person', personSchema);