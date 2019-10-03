module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresq1://dunder_mifflin:dunder_mifflin@localhost/bookmarks'
};