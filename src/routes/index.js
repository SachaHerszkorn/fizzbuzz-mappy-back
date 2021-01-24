import { Router } from 'express';

import initFizzBuzzRouter from './fizzBuzzRouter';

const routes = Router();

const initIndexRouter = () => {
  routes.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!' });
  });

  return routes;
};

export default { initIndexRouter, initFizzBuzzRouter };
