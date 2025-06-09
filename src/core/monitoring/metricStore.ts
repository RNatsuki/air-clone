type Metric = {
  timestamp: number;
  data: any;
};

const metricStore: Record<string, Metric> = {};

export function updateMetric(mac: string, data: any) {
  metricStore[mac] = { timestamp: Date.now(), data };
}

export function getAllMetrics(): { mac: string; data: any }[] {
  return Object.entries(metricStore).map(([mac, { data }]) => ({
    mac,
    data,
  }));
}
