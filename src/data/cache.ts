import { createClient } from "redis";

const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASS } = process.env;

var client = createClient({
  url: `redis://${REDIS_USER}:${REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}`,
});

client.connect();

export const getQueryCache = async (key: string): Promise<any> => {
  const result = await client.get("postgres:" + key);
  return JSON.parse(result);
};

export const setQueryCache = async (key: string, data: any) => {
  // Set to expire after 60 seconds
  await client.setEx("postgres:" + key, 60, JSON.stringify(data));
};
