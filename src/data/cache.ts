import { createClient } from "redis";

var client = createClient();

client.on("error", (err) => {
  console.error("[Redis] Error: " + err);
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
