import express from "express";
import morgan from "morgan";
import cors from "cors";
import { Person } from "./models/person.js";
const app = express();

app.use(express.static("build"));
app.use(cors());
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

app.get("/api/persons", (request, response, next) => {
    Person.find({}).then((people) => response.send(people));
});

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id).then((person) => response.send(person));
});

app.post("/api/persons", (request, response, next) => {
    const body = request.body;
    if (!body.name || !body.number) {
        return response.status(400).json({ error: "name or number Missing" });
    }
    Person.find({ name: body.name }).then((personAlreadyExists) => {
        console.log(personAlreadyExists);
        if (personAlreadyExists.length !== 0) {
            return response.status(400).json({ error: "name must be unique" });
        }
    });

    const person = new Person({
        name: body.name,
        number: body.number,
    });
    person
        .save()
        .then((savedPerson) => savedPerson.toJSON())
        .then((savedAndFormattedPerson) => {
            response.json(savedAndFormattedPerson);
        })
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

app.put("/api/persons/:id", (req, res, next) => {
    Person.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
    })
        .then((result) => {
            res.json(result);
        })
        .catch((error) => next(error));
});

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message });
    }

    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
