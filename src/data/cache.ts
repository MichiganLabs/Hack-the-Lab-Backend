import { createClient } from "redis";

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASS,
});

try {
  client.connect();
} catch (e) {
  console.log(`Error occurred while trying to connect to Redis: ${e}`);
  process.exit(1);
}

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const acquireLock = async (lock: string) => {
  while (!(await client.setNX(lock, "1"))) {
    // Sleep for 50ms before trying again.
    await sleep(50);
  }

  // Expire the lock after 8 seconds (arbitrary value, may be changed later).
  // Prevents a deadlock if an exception occurs while the lock is in use.
  await client.expire(lock, 8);
};

const releaseLock = async (lock: string) => {
  await client.del(lock);
};

const getCache = async (key: string): Promise<any> => {
  const result = await client.get(key);
  return JSON.parse(result);
};

const setCache = async (key: string, data: any) => {
  // Set to expire after 60 seconds
  await client.setEx(key, 60, JSON.stringify(data));
};

const delCache = async (key: string) => {
  await client.del(key);
};

const setValue = async (key: string, data: any) => {
  await client.set(key, JSON.stringify(data));
};

const getValue = async (key: string): Promise<any> => {
  const result = await client.get(key);
  return JSON.parse(result);
};

const delValue = async (key: string): Promise<void> => {
  await client.del(key);
};

export default { acquireLock, releaseLock, getCache, setCache, delCache, getValue, setValue, delValue };
