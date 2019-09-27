const express = require('express');

const [ ...bookmark ] = require('./dataStore');
const logger = require('./logger');

const bookmarksRouter = express.Router();

bookmarksRouter.get('/', ( req, res ) => {
  logger.info('Bookmarks data accessed');
  res.send(bookmark);
});

module.exports = bookmarksRouter;