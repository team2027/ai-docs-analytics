export interface AnalyticsEngineDataset {
  writeDataPoint(data: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
}

export interface Env {
  RAW_EVENTS: AnalyticsEngineDataset;
  VISITS: AnalyticsEngineDataset;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
}

// RAW_EVENTS schema (immutable):
// blob1: host, blob2: path, blob3: user_agent, blob4: accept_header, blob5: country
// index1: host

// VISITS schema (processed):
// blob1: host, blob2: path, blob3: category, blob4: agent, blob5: country
// double1: is_filtered, index1: host

export function writeRawEvent(
  dataset: AnalyticsEngineDataset,
  host: string,
  path: string,
  userAgent: string,
  acceptHeader: string,
  country: string
) {
  dataset.writeDataPoint({
    blobs: [host, path, userAgent.slice(0, 500), acceptHeader.slice(0, 500), country],
    indexes: [host],
  });
}

export function writeVisit(
  dataset: AnalyticsEngineDataset,
  host: string,
  path: string,
  category: string,
  agent: string,
  country: string,
  filtered: boolean
) {
  dataset.writeDataPoint({
    blobs: [host, path, category, agent, country],
    doubles: [filtered ? 1 : 0],
    indexes: [host],
  });
}
