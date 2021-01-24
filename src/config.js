export default {
  PORT: process.env.PORT || 5000,
  URL: process.env.NODE_ENV === 'production' ? 'PRODUCTION_URI' : 'mongodb://localhost:27017',
  DBNAME: 'mappyApi',
};
