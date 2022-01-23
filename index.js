import express from "express";
import morgan from "morgan";
const app = express();

app.use(express.json());

morgan.token("post", function (req) {
    if (req.method === "POST") return JSON.stringify(req.body);
    else return "";
});

morgan.format(
    "postFormat",
    ":method :url :status :res[content-length] - :response-time ms :post"
);

app.use(morgan("postFormat"));

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];
const requestLogger = (request, response, next) => {
    console.log("Method:", request.method);
    console.log("Path:  ", request.path);
    console.log("Body:  ", request.body);
    console.log("---");
    next();
};
app.use(requestLogger);
app.get("/", (request, response) => {
    response.send("<h1>PhoneBook !</h1>");
});

app.get("/info", (request, response) => {
    let date = new Date();
    console.log(date);

    response.send(
        `Phonebook has info for ${persons.length} people <br><br> ${date}`
    );
});

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find((person) => person.id === id);
    if (person) {
        response.send(person);
    } else {
        response.status(`Person with id ${id} not found`);
        response.status(404).end();
    }
});

const generateId = () => {
    const maxId =
        persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
    return maxId + 1;
};

app.post("/api/persons", (request, response) => {
    const body = request.body;
    if (!body.name || !body.number) {
        return response.status(400).json({ error: "name or number Missing" });
    }
    const personAlreadyExists = persons.find(
        (person) => person.name === body.name
    );
    if (personAlreadyExists) {
        return response.status(400).json({ error: "name must be unique" });
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    };
    persons.concat(person);
    response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find((person) => person.id === id);
    if (person) {
        persons = persons.filter((person) => person.id !== id);
        response.status(204).end();
    } else {
        response.statusMessage = `person ${id} not found`;
        response.status(404).end();
    }
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
