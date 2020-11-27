const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');
const data = require('./data');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');

const apidoc = yaml.safeLoad(fs.readFileSync(apiSpec, 'utf8'));
app.use('/v0/api-docs', swaggerUi.serve, swaggerUi.setup(apidoc));

app.use(OpenApiValidator.middleware({
  apiSpec: apiSpec,
  validateRequests: true,
  validateResponses: true,
}));

app.post('/v0/functions', async(req, res) => {
  if (req.body.name === 'reset') {
    try {
      await data.runFile('../queries/create.sql');
    } catch (e) {
      res.sendStatus(500);
      throw e;
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get('/v0/brewery', async(req, res) => {
  if (req.query.hasOwnProperty('name')) {
    const breweries = await data.getBreweries(req.query.name);
    if (breweries.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(breweries);
    }
    return;
  }
  const breweries = await data.getBreweries();
  res.send(breweries);
});
app.post('/v0/brewery', async(req, res) => {
  try {
    const brewery = await data.newBrewery(req.body.name, req.body.location);
    console.log(brewery);
    res.send(brewery);
  } catch (e) {
    res.sendStatus(404);
    throw e;
  }
  res.sendStatus(200);
});

app.get('/v0/beer', async(req, res) => {
  if (req.query.hasOwnProperty('breweryID')) {
    const beers = await data.getBeers(req.query.breweryID);
    if (beers.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(beers);
    }
    return;
  }
  const beers = await data.getBeers();
  res.send(beers);
});
app.post('/v0/beer', async(req, res) => {
  try {
    const beer = await data.newBeer(req.body.breweryID, req.body.name, req.body.type);
    console.log(beer);
    res.send(beer);
  } catch (e) {
    res.sendStatus(404);
    throw e;
  }
  res.sendStatus(200);
});

app.get('/v0/user', async(req, res) => {
  if (req.query.hasOwnProperty('username')) {
    const users = await data.getUsers(req.query.username);
    if (users.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(users);
    }
    return;
  }
  const users = await data.getUsers();
  res.send(users);
});
app.post('/v0/user', async(req, res) => {
  try {
    const user = await data.newUser(req.body.name, req.body.username, req.body.password);
    console.log(user);
    res.send(user);
  } catch (e) {
    res.sendStatus(500);
    throw e;
  }
  res.sendStatus(200);
});
app.post('/v0/login', async(req, res) => {
  try {
    const user = await data.login(req.body.username, req.body.password);
    console.log(user);
    res.send(user);
  } catch (e) {
    if (e.message === 'Username not found') {
      res.sendStatus(404);
    } else {
      res.sendStatus(500);
    }
    throw e;
  }
});

app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.message,
    errors: err.errors,
    status: err.status,
  });
});

module.exports = app;
