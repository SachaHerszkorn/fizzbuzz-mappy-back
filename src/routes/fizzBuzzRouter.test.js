/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import { MongoClient } from 'mongodb';

import config from '../config';

import app from '../index';

const { DBNAME, URL } = config;

describe('Cats router testing', () => {
  let db;
  let mongoClient;
  beforeAll(async () => {
    mongoClient = await MongoClient.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await mongoClient.db(DBNAME);
    await db.collection('fizzbuzz').deleteMany({});
  });

  afterAll(async (done) => {
    await db.collection('fizzbuzz').deleteMany({});
    await mongoClient.close();
    app.close(done);
  });

  afterEach(() => app.close());

  it('should be able to get 404 on stats when no fizzbuzz', async () => {
    const response = await request(app).get('/fizzbuzz/stats');

    expect(response.status).toBe(404);
  });

  it('should not be able to fizzbuzz with wrong parameters', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 'test', int1: 3, int2: 5, str1: 'fizz', str2: 'buzz' });

    expect(response.status).toBe(400);
  });

  it('should be able to create fizzbuzz', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 15, int1: 3, int2: 5, str1: 'fizz', str2: 'buzz' });
    const expectedMostFrequentRequestId = '35fizzbuzz';

    expect(response.body.stringResult).toBe('12fizz4buzzfizz78fizzbuzz11fizz1314fizzbuzz');
    // eslint-disable-next-line no-underscore-dangle
    expect(response.body.mostFrequentRequests[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.status).toBe(201);
  });

  it('should be able to retrieve fizzbuzz with inverted parameters', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 15, int2: 3, int1: 5, str2: 'fizz', str1: 'buzz' });
    const expectedMostFrequentRequestId = '35fizzbuzz';

    expect(response.body.stringResult).toBe('12fizz4buzzfizz78fizzbuzz11fizz1314fizzbuzz');
    // eslint-disable-next-line no-underscore-dangle
    expect(response.body.mostFrequentRequests[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.status).toBe(200);
  });

  it('should be able to retrieve fizzbuzz with lower limit', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 10, int1: 3, int2: 5, str1: 'fizz', str2: 'buzz' });
    const expectedMostFrequentRequestId = '35fizzbuzz';

    expect(response.body.stringResult).toBe('12fizz4buzzfizz78fizzbuzz');
    // eslint-disable-next-line no-underscore-dangle
    expect(response.body.mostFrequentRequests[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.status).toBe(200);
  });

  it('should be able to retrieve fizzbuzz with higher limit', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 20, int1: 3, int2: 5, str1: 'fizz', str2: 'buzz' });
    const expectedMostFrequentRequestId = '35fizzbuzz';

    expect(response.body.stringResult).toBe(
      '12fizz4buzzfizz78fizzbuzz11fizz1314fizzbuzz1617fizz19buzz'
    );
    // eslint-disable-next-line no-underscore-dangle
    expect(response.body.mostFrequentRequests[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.status).toBe(200);
  });

  it('should be able to get highest fizzbuzz', async () => {
    await request(app)
      .post('/fizzbuzz')
      .send({ limit: 15, int1: 4, int2: 5, str1: 'fizz', str2: 'buzz' });
    await request(app)
      .post('/fizzbuzz')
      .send({ limit: 15, int1: 4, int2: 5, str1: 'fizz', str2: 'buzz' });
    const response = await request(app).get('/fizzbuzz/stats');

    const expectedMostFrequentRequestId = '35fizzbuzz';
    const expectedSecondMostFrequentRequestId = '45fizzbuzz';
    expect(response.body[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.body[1]._id).toBe(expectedSecondMostFrequentRequestId);
    expect(response.status).toBe(200);
  });
});
