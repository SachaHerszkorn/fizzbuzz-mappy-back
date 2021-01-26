export default {
  PORT: process.env.PORT || 5000,
  URL:
    process.env.NODE_ENV === 'production'
      ? 'mongodb+srv://heroku:herokuku@cluster0.thns6.mongodb.net/mappy?retryWrites=true&w=majority'
      : 'mongodb://localhost:27017',
  DBNAME: 'mappyApi',
};
