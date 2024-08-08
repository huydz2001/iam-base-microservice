import * as Prometheus from 'prom-client';
export declare const requestDurationHistogram: Prometheus.Histogram<"path" | "method">;
export declare const requestCounter: Prometheus.Counter<"path" | "method" | "status">;
export declare const errorCounter: Prometheus.Counter<"path" | "method" | "status">;
