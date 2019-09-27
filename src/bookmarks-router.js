const express = require('express');

const logger = require('./logger');

const bookmarksRouter = express.Router();

bookmarksRouter.get('/', ( req, res ) => {
  logger.info('Bookmarks data accessed');
  res.send('Bookmarks are working!');
});

module.exports = bookmarksRouter;