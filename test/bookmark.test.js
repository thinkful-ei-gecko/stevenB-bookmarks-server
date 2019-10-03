const app = require('../src/app');
const knex = require('knex');
const testBookmarks = require('./bookmark.fixtures');

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

  context('/GET request', () => {
    it('should return an empty array when no data is present', () => {
      const expected = [];
      return supertest(app)
        .get('/bookmarks')
        .expect(200)
        .then( empty => expect(empty.body).to.eql(expected));
    });
    context('/GET requests with data', () => {
      beforeEach('add data to bookmarks test db', () => db.into('bookmark_items').insert(testBookmarks) );

      it('should resolve with all bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, testBookmarks);
      });

      it('should resolve with bookmark with certain id', () => {
        return supertest(app)
          .get('/bookmarks/2')
          .expect(200)
          .then( bookmark => {
            expect(bookmark.body.id).to.equal(2);
          });
      });

      it('should reject with a 404 if bookmark id is not in db', () => {
        return supertest(app)
          .get('/bookmarks/20')
          .expect(404, { error: { message: 'Bookmark with id 20 not found.' } });
      });
    });
  });

  context('/POST request', () => {
    it('creates an article, responds with 201 and the new bookmark', () => {
      const newBookmark = {
        title: 'Test Post',
        url: 'https://www.imatest.com',
        description: 'Hello I am a test',
        rating: '3'
      };

      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect( res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property('id');
        });
    });
  });

  context('/DELETE request', () => {

  });
});