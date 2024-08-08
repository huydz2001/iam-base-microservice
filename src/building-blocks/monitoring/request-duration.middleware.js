"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDurationMiddleware = void 0;
const histograms_metric_1 = require("./metric/histograms.metric");
const requestDurationMiddleware = (err, req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const duration = getDurationInMilliseconds(start);
        const labels = { method: req.method, path: req.path };
        histograms_metric_1.requestDurationHistogram.observe(labels, duration / 1000);
    });
    next();
};
exports.requestDurationMiddleware = requestDurationMiddleware;
function getDurationInMilliseconds(start) {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}
//# sourceMappingURL=request-duration.middleware.js.map