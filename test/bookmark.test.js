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
        })
        .then( postRes => supertest(app)
          .get(`/bookmarks/${postRes.body.id}`)
          .expect(postRes.body)
        );
    });

    const requiredFields = ['title', 'url', 'rating'];

    requiredFields.forEach( field => {
      const newBookmarkError = {
        title: 'This will fail',
        url: 'https://www.test.com',
        rating: '2'
      };
      
      it(`should return a 404 status with ${field} missing`, () => {
        delete newBookmarkError[field];

        return supertest(app)
          .post('/bookmarks')
          .send(newBookmarkError)
          .expect(400, { error: { message: `Missing ${field} in request body.` } });
      });
    });

    context('should return 400 when rating is < 1 or > 5', () => {
      const lowRating = {
        title: 'This will fail',
        url: 'https://www.test.com',
        rating: '-1'
      };
      const highRating = {
        title: 'This will fail',
        url: 'https://www.test.com',
        rating: '6'
      };
      
      it('should return a 400 and appropriate error message with a rating < 1', () => {
        return supertest(app)
          .post('/bookmarks')
          .send(lowRating)
          .expect(400, { error: { message: 'Rating must be between 1 and 5' } });
      });

      it('should return a 400 and appropriate error message with a rating > 5', () => {
        return supertest(app)
          .post('/bookmarks')
          .send(highRating)
          .expect(400, { error: { message: 'Rating must be between 1 and 5' } });
      });
    });
  });

  describe('/DELETE request', () => {
    context('Given there are bookmarks in the database', () => {
      beforeEach('add data to bookmarks test db', () => db.into('bookmark_items').insert(testBookmarks) );

      it('responds with a 204 code and removes the bookmark', () => {
        const id = 3;
        const expectedBookmarks = testBookmarks.filter( bookmark => bookmark.id !== id );

        return supertest(app)
          .delete(`/bookmarks/${id}`)
          .expect(204)
          .then( () => supertest(app).get('/bookmarks').expect(expectedBookmarks));
      });

      it('Given a nonexistent id, will return 404 code and error', () => {
        return supertest(app)
          .delete('/bookmarks/10')
          .expect(404, { error: { message: 'Not Found' }});
      });
    });

    context('Given no bookmarks', () => {
      it('Given no bookmarks will return with 404 code and error', () => {
        return supertest(app)
          .delete('/bookmarks/2')
          .expect(404, { error: { message: 'Not Found' }});
      });
    });
  });
});