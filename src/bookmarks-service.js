const bookmark_itemsService = {
  getAllArticles(db) {
    return db.select('*').from('bookmark_items');
  },

  insertArticle(db, newBookmark) {
    return db
      .insert(newBookmark)
      .into('bookmark_items')
      .returning('*')
      .then( rows => rows[0] );
  },

  getById(db, id) {
    return db.from('bookmark_items').select('*').where({ id }).first();
  },

  updateArticle(db, id, newBookmarkFields) {
    return db.from('bookmark_items').where({ id }).update(newBookmarkFields);
  },

  deleteArticle(db, id) {
    return db.from('bookmark_items').where({ id }).delete();
  }
};

module.exports = bookmark_itemsService;