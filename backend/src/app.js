const path = require('path');
const express = require('express');
const cors = require('cors');
const { createRoutes } = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

function createApp(container) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.resolve(container.config.uploadDir)));
  app.use('/api', createRoutes(container));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
