const knex = require('knex');
const app = require('./app');
const { PORT, DB_URL } = require('./config');

app.listen(PORT);