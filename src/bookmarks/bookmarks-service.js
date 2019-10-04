const BookmarksService = {
  getAllBookmarks(db) {
    return db.select('*').from('bookmark_items');
  },

  insertBookmark(db, newBookmark) {
    return db
      .insert(newBookmark)
      .into('bookmark_items')
      .returning('*')
      .then( rows => rows[0] );
  },

  getById(db, id) {
    return db.from('bookmark_items').select('*').where({ id }).first();
  },

  updateBookmark(db, id, newBookmarkFields) {
    return db.from('bookmark_items').where({ id }).update(newBookmarkFields);
  },

  deleteBookmark(db, id) {
    return db.from('bookmark_items').where({ id }).delete();
  }
};

module.exports = BookmarksService;