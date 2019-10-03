const app = require('../src/app');
const knex = require('knex');

describe('Bookmarks endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy() );

  before('clean the table', () => db('bookmark_items').truncate() );

  afterEach('cleanup', () => db('bookmark_items').truncate() );

  it('GET / responds with 200 containing Hello world!', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello world!');
  });
});