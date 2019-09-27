const express = require('express');

const [ ...bookmarks ] = require('./dataStore');
const logger = require('./logger');

const bookmarksRouter = express.Router();

bookmarksRouter.get('/', ( req, res ) => {
  logger.info('Bookmarks data accessed');
  res.send(bookmarks);
});

bookmarksRouter.get('/:id', ( req, res ) => {
  const { id } = req.params;
  const searchBookmark = bookmarks.find( b => b.id === id );

  if ( !searchBookmark ) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res.status(404).send('Bookmark Not Found');
  }

  res.send(searchBookmark);
});

module.exports = bookmarksRouter;