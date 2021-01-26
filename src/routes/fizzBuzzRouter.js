import { Router } from 'express';

const routes = Router();

const errors = {
  BAD_PARAMETERS: { code: 400, text: 'Parameters are not good.' },
};

const initFizzBuzzRouter = (db) => {
  routes.post('/fizzbuzz', async (req, res) => {
    try {
      const { limit, int1, int2, str1, str2 } = req.body;

      if (
        !limit ||
        !parseInt(limit, 10) ||
        !int1 ||
        !parseInt(int1, 10) ||
        !int2 ||
        !parseInt(int2, 10) ||
        !str1 ||
        !str2
      ) {
        // Scheme or type checking with mongoose would have been better
        throw new Error('BAD_PARAMETERS');
      }

      let response = {};
      const firstTryId = `{${int1}}{${int2}}{${str1}}{${str2}}`;
      const secondTryId = `{${int2}}{${int1}}{${str2}}{${str1}}`;
      let correspondingId = firstTryId;
      let updatedRequest;

      // Try to retrieve request
      updatedRequest = await db
        .collection('fizzbuzz')
        .findOneAndUpdate({ _id: firstTryId }, { $inc: { count: 1 } }, { returnOriginal: false });

      // Try to retrieve request by inverting params since results would be similar
      if (!updatedRequest.value) {
        correspondingId = secondTryId;
        updatedRequest = await db
          .collection('fizzbuzz')
          .findOneAndUpdate(
            { _id: secondTryId },
            { $inc: { count: 1 } },
            { returnOriginal: false }
          );
      }

      let { stringResult } = updatedRequest.value || { stringResult: '' };
      const { stringResultAsArray } = updatedRequest.value || { stringResultAsArray: [] };

      if (updatedRequest.value && updatedRequest.value.limit === limit) {
        // If no modification is necessary
        response = { code: 200, body: { stringResult } };
      } else if (updatedRequest.value && limit < updatedRequest.value.limit) {
        // If limit is lower
        stringResult = updatedRequest.value.stringResultAsArray.splice(0, limit).join(',');
        response = { code: 200, body: { stringResult } };
      } else {
        // If limit is higher or request does not exist
        const beginAt = !updatedRequest.value
          ? 1
          : updatedRequest.value.stringResultAsArray.length + 1;
        for (let i = beginAt; i <= limit; i += 1) {
          let addToString = i.toString();
          if (i % (int1 * int2) === 0) {
            addToString = `${str1}${str2}`;
          } else if (i % int1 === 0) {
            addToString = str1;
          } else if (i % int2 === 0) {
            addToString = str2;
          }
          stringResultAsArray.push(addToString);
        }

        stringResult = stringResultAsArray.join(',');

        if (updatedRequest.value) {
          await db
            .collection('fizzbuzz')
            .findOneAndUpdate(
              { _id: correspondingId },
              { $set: { stringResult, stringResultAsArray, limit } },
              { returnOriginal: false }
            );
          response = { code: 200, body: { stringResult } };
        } else {
          await db.collection('fizzbuzz').insertOne({
            _id: firstTryId,
            limit,
            int1,
            int2,
            str1,
            str2,
            count: 1,
            stringResult,
            stringResultAsArray,
          });
          response = { code: 201, body: { stringResult } };
        }
      }
      const mostFrequentRequests = await db
        .collection('fizzbuzz')
        .find({})
        .sort({ count: -1 })
        .limit(10)
        .toArray();

      response.body = { ...response.body, mostFrequentRequests };
      res.status(response.code).json(response.body);
    } catch (err) {
      const { message } = err;
      if (message in errors) {
        // TypeError would have been better
        res.status(errors[message].code).json({ error: errors[message].text });
      } else {
        res.status(404).json({ error: message });
      }
      // eslint-disable-next-line no-console
      console.log(err);
    }
  });

  routes.get('/fizzbuzz/stats', async (req, res) => {
    try {
      const mostFrequentRequests = await db
        .collection('fizzbuzz')
        .find({})
        .sort({ count: -1 })
        .limit(8)
        .toArray();
      if (mostFrequentRequests.length <= 0) {
        throw new Error('Not found');
      }
      res.status(200).json(mostFrequentRequests);
    } catch (err) {
      res.status(404).json({ error: err.message });
      // eslint-disable-next-line no-console
      console.log(err);
    }
  });

  return routes;
};

export default initFizzBuzzRouter;
