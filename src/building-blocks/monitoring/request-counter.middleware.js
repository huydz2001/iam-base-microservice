"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCounterMiddleware = void 0;
const histograms_metric_1 = require("./metric/histograms.metric");
const requestCounterMiddleware = (err, req, res, next) => {
    const labels = { method: req.method, path: req.path };
    histograms_metric_1.requestCounter.inc(labels);
    res.on('finish', () => {
        const status = res.statusCode.toString();
        histograms_metric_1.requestCounter.inc(Object.assign(Object.assign({}, labels), { status }));
        if (status.startsWith('4') || status.startsWith('5')) {
            histograms_metric_1.errorCounter.inc(Object.assign(Object.assign({}, labels), { status }));
        }
    });
    next();
};
exports.requestCounterMiddleware = requestCounterMiddleware;
//# sourceMappingURL=request-counter.middleware.js.map