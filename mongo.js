import mongoose from "mongoose";

if (process.argv.length < 3) {
    console.log("Invalid Parameters");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://admin:${password}@cluster0.53j7n.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
    Person.find({}).then((persons) => {
        console.log(persons);
        mongoose.connection.close();
        process.exit(1);
    });
}

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    });
    console.log(person);
    person.save().then((result) => {
        console.log("person saved!");
        mongoose.connection.close();
        process.exit(1);
    });
}
