import { createClient } from "redis";

const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASS } = process.env;

const client = createClient({
  url: `redis://${REDIS_USER}:${REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}`,
});

client.connect();

const sleep = (seconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });

export const acquireLock = async (lock: string) => {
  while (!(await client.setNX(lock, "1"))) {
    await sleep(0.5);
  }
};

export const releaseLock = async (lock: string) => {
  await client.del(lock);
};

export const getCache = async (key: string): Promise<any> => {
  const result = await client.get(key);
  return JSON.parse(result);
};

// Set to expire after 60 seconds
export const setCache = async (key: string, data: any) => {
  await client.setEx(key, 60, JSON.stringify(data));
};

export const delCache = async (key: string) => {
  await client.del(key);
};

export const getQueryCache = async (key: string): Promise<any> =>
  getCache(`postgres:${key}`);

export const setQueryCache = async (key: string, data: any) =>
  setCache(`postgres:${key}`, data);
