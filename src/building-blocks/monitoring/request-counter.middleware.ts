import { errorCounter, requestCounter } from './metric/histograms.metric';

export const requestCounterMiddleware = (err, req, res, next) => {
  const labels = { method: req.method, path: req.path };

  requestCounter.inc(labels);

  res.on('finish', () => {
    const status = res.statusCode.toString();

    requestCounter.inc({
      ...labels,
      status
    });

    // Check if the status code represents an error (4xx or 5xx)
    if (status.startsWith('4') || status.startsWith('5')) {
      errorCounter.inc({
        ...labels,
        status
      });
    }
  });

  next();
};
