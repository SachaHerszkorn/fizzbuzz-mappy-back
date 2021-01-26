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
    const expectedMostFrequentRequestId = '{3}{5}{fizz}{buzz}';

    expect(response.body.stringResult).toBe(
      '1,2,fizz,4,buzz,fizz,7,8,fizz,buzz,11,fizz,13,14,fizzbuzz'
    );
    // eslint-disable-next-line no-underscore-dangle
    expect(response.body.mostFrequentRequests[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.status).toBe(201);
  });

  it('should be able to retrieve fizzbuzz with inverted parameters', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 15, int2: 3, int1: 5, str2: 'fizz', str1: 'buzz' });
    const expectedMostFrequentRequestId = '{3}{5}{fizz}{buzz}';

    expect(response.body.stringResult).toBe(
      '1,2,fizz,4,buzz,fizz,7,8,fizz,buzz,11,fizz,13,14,fizzbuzz'
    );
    // eslint-disable-next-line no-underscore-dangle
    expect(response.body.mostFrequentRequests[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.status).toBe(200);
  });

  it('should be able to retrieve fizzbuzz with lower limit', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 10, int1: 3, int2: 5, str1: 'fizz', str2: 'buzz' });
    const expectedMostFrequentRequestId = '{3}{5}{fizz}{buzz}';

    expect(response.body.stringResult).toBe('1,2,fizz,4,buzz,fizz,7,8,fizz,buzz');
    // eslint-disable-next-line no-underscore-dangle
    expect(response.body.mostFrequentRequests[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.status).toBe(200);
  });

  it('should be able to retrieve fizzbuzz with higher limit', async () => {
    const response = await request(app)
      .post('/fizzbuzz')
      .send({ limit: 20, int1: 3, int2: 5, str1: 'fizz', str2: 'buzz' });
    const expectedMostFrequentRequestId = '{3}{5}{fizz}{buzz}';

    expect(response.body.stringResult).toBe(
      '1,2,fizz,4,buzz,fizz,7,8,fizz,buzz,11,fizz,13,14,fizzbuzz,16,17,fizz,19,buzz'
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

    const expectedMostFrequentRequestId = '{3}{5}{fizz}{buzz}';
    const expectedSecondMostFrequentRequestId = '{4}{5}{fizz}{buzz}';
    expect(response.body[0]._id).toBe(expectedMostFrequentRequestId);
    expect(response.body[1]._id).toBe(expectedSecondMostFrequentRequestId);
    expect(response.status).toBe(200);
  });
});
