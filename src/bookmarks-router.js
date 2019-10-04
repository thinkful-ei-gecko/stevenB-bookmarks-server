const express = require('express');
const uuid = require('uuid/v4');

const { PORT } = require('./config');
const [ ...bookmarks ] = require('./dataStore');
const logger = require('./logger');

const bookmarksRouter = express.Router();
const BookmarksService = require('./bookmarks-service');

bookmarksRouter.get('/', ( req, res, next ) => {
  logger.info('Bookmarks data accessed!');
  const knexInstance = req.app.get('db');
  BookmarksService.getAllBookmarks(knexInstance)
    .then( bookmarks => res.json(bookmarks) )
    .catch(next);
});

bookmarksRouter.get('/:id', ( req, res, next ) => {
  const knexInstance = req.app.get('db');
  const { id } = req.params;

  BookmarksService.getById(knexInstance, id)
    .then( bookmark => {
      if ( !bookmark ) {
        logger.error(`Bookmark with id ${id} not found.`);
        return res.status(404).json({ error: { message: 'Bookmark with id 20 not found.' } });
      }
      res.json( bookmark );
    })
    .catch(next);
});

bookmarksRouter.post('/', ( req, res, next ) => {
  const { title, url, description, rating } = req.body;
  const newBookmark = { title, url, description, rating };

  const requiredFields = { title, url, rating };
  for( const[key, value] of Object.entries(requiredFields) ) {
    // eslint-disable-next-line eqeqeq
    if( value == null ) {
      return res.status(400).json({
        error: { message: `Missing ${key} in request body.`}
      });
    }
  }

  if( rating < 1 || rating > 5 ) {
    return res.status(400).json({
      error: { message: 'Rating must be between 1 and 5' }
    });
  }

  logger.info(`Bookmark with title ${title} created`);

  BookmarksService.insertBookmark( req.app.get('db'), newBookmark)
    .then( bookmark => res.status(201).location(`/bookmarks/${bookmark.id}`).json(bookmark))
    .catch(next);
});

bookmarksRouter.delete('/:id', ( req, res, next ) => {
  const { id } = req.params;
  const bookmarkFinder = BookmarksService.getById( req.app.get('db'), id);

  if ( bookmarkFinder === -1 ) {
    logger.error(`Bookmark with id ${id} not found`);
    return res.status(404).send('Not Found');
  }

  bookmarks.splice( bookmarkFinder, 1 );

  logger.info(`Bookmark with id ${id} deleted.`);
  BookmarksService.deleteBookmark( req.app.get('db'), id)
    .then( () => res.status(204).end() )
    .catch(next);
});


module.exports = bookmarksRouter;