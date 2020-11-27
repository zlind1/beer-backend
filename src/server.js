const app = require('./app.js');

app.listen(process.env.PORT || 3010, () => {
  console.log('CSE183 Assignment 7 Server Running');
  const url = process.env.PORT ? 'https://zlind-beers.herokuapp.com/v0/api-docs'
    : 'http://localhost:3010/v0/api-docs/';
  console.log(`API Testing UI is at: ${url}`);
});
