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

bookmarksRouter.post('/', ( req, res ) => {
  const { title, url, description, rating } = req.body;

  if ( !title ) {
    logger.error('Title is required');
    return res.status(400).json({ error: { message: 'Title is required.' } });
  }

  if ( !url ) {
    logger.error('url is required');
    return res.status(400).json({ error: { message: 'URL is required.' } });
  }

  if ( rating < 1 || rating > 5 ) {
    logger.error('Rating should be an integer of 1-5');
    return res.status(400).json({ error: { message: 'Rating should be an integer between 1 and 5' } });
  }

  const newId = uuid();

  const newBookmark = {
    newId,
    title,
    url,
    description,
    rating
  };

  bookmarks.push(newBookmark);

  logger.info(`Bookmark with id ${newId} created`);

  res.status(201).location(`http://localhost:${PORT}/card/${newId}`).json(newBookmark);
});

bookmarksRouter.delete('/:id', ( req, res ) => {
  const { id } = req.params;
  const bookmarkFinder = bookmarks.findIndex( b => b.id === id );

  if ( bookmarkFinder === -1 ) {
    logger.error(`Bookmark with id ${id} not found`);
    return res.status(404).send('Not Found');
  }

  bookmarks.splice( bookmarkFinder, 1 );

  logger.info(`Bookmark with id ${id} deleted.`);
  res.status(204).end();
});


module.exports = bookmarksRouter;