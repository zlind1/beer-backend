const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: 'localhost',
  user: 'zlind'
});

const execute = async (sql, params=[]) => {
  const client = await pool.connect();
  await client.query('SET SEARCH_PATH TO zlind_beers');
  const response = await client.query(sql, params);
  client.release();
  return response;
}
const runFile = async (filename) => {
  const filePath = path.join(__dirname, '../queries/'+filename);
  const content = await fs.promises.readFile(filePath, {encoding: 'utf-8'});
  const response = await execute(content);
  return response;
}

const getBreweries = async (name=null) => {
  const sql = `
    SELECT * FROM Breweries
    ${name !== null ? 'WHERE name = $1' : ''}
  `;
  const params = name !== null ? [name] : [];
  const response = await execute(sql, params);
  return response.rows;
}
const newBrewery = async (name, location) => {
  const sql = 'INSERT INTO Breweries VALUES ($1, $2, $3) RETURNING *';
  const response =  await execute(sql, [uuidv4(), name, location]);
  return response.rows[0];
}

const getBeers = async (breweryID=null) => {
  const sql = `
    SELECT * FROM Beers
    ${breweryID !== null ? 'WHERE breweryID = $1' : ''}
  `;
  const params = breweryID !== null ? [breweryID] : [];
  const response = await execute(sql, params);
  return response.rows;
}
const newBeer = async (breweryID, name, type) => {
  const sql = 'INSERT INTO Beers VALUES ($1, $2, $3, $4) RETURNING *';
  const response = await execute(sql, [uuidv4(), breweryID, name, type]);
  return response.rows[0];
}

const getUsers = async (username=null) => {
  const sql = `
    SELECT userID, name, username FROM Users
    ${username !== null ? 'WHERE username = $1' : ''}
  `;
  const params = username !== null ? [username] : [];
  const response = await execute(sql, params);
  return response.rows;
}
const newUser = async (name, username, password) => {
  const sql = 'INSERT INTO Users VALUES ($1, $2, $3, $4) RETURNING userID, name, username';
  const response = await execute(sql, [uuidv4(), name, username, password]);
  return response.rows[0];
}
const loginUser = async (username, password) => {
  let sql = 'SELECT userID, name, username FROM Users WHERE username = $1';
  let response = await execute(sql, [username]);
  if (response.rows.length === 0) {
    throw new Error('Username not found');
  }
  const user = response.rows[0];
  if (user.password !== password) {
    throw new Error('Passwords not matching')
  }
  return user;
}

exports.login = loginUser;
exports.runFile = runFile;
exports.getBreweries = getBreweries;
exports.getBeers = getBeers;
exports.getUsers = getUsers;
exports.newBrewery = newBrewery;
exports.newBeer = newBeer;
exports.newUser = newUser;
