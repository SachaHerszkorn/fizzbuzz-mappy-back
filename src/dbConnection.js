import { MongoClient } from 'mongodb';

import config from './config';

const { URL, DBNAME } = config;

let db;

const dbConnect = async () => {
  const client = await MongoClient.connect(URL, { useUnifiedTopology: true });
  db = client.db(DBNAME);
  return db;
};

export default dbConnect;
