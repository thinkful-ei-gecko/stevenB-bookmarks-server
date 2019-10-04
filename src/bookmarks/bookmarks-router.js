const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');

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
      res.json({
        id: bookmark.id,
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        description: xss(bookmark.description),
        rating: bookmark.rating
      });
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

  const sanitizedNewBookmark = {
    title: xss(newBookmark.title),
    url: xss(newBookmark.url),
    description: xss(newBookmark.description),
    rating: newBookmark.rating
  };
  

  BookmarksService.insertBookmark( req.app.get('db'), sanitizedNewBookmark)
    .then( bookmark => res.status(201)
      .location( path.posix.join(req.originalUrl) + `/${bookmark.id}` )
      .json({
        id: bookmark.id,
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        description: xss(bookmark.description),
        rating: bookmark.rating
      }))
    .catch(next);
});

bookmarksRouter.route('/:id')
  .all(( req, res, next ) => {
    const knexInstance = req.app.get('db');
    const { id } = req.params;
    BookmarksService.getById( knexInstance, id)
      .then( bookmark => {
        if( !bookmark ) {
          logger.error(`Bookmark with id ${id} not found`);
          return res.status(404).json({ error: { message: 'Not Found' }});
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .delete(( req, res, next ) => {
    const knexInstance = req.app.get('db');
    const { id } = req.params;
    BookmarksService.deleteBookmark( knexInstance, id)
      .then( () => res.status(204).end() )
      .catch(next);

    logger.info(`Bookmark with id ${id} deleted.`);
  });


module.exports = bookmarksRouter;