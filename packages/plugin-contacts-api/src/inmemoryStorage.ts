import * as dotenv from 'dotenv';
import * as Redis from 'ioredis';
import * as ServiceRegistry from 'clerq';
import memoryStorage from 'erxes-inmemory-storage';

import { debug } from './configs';

// load environment variables
dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let client;

export const initMemoryStorage = () => {
  client = memoryStorage({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
  });
};

export const removeKey = async (key: string) => {
  try {
    return await client.removeKey(key);
  } catch (e) {
    debug.error(
      `For removeKey of inmemoryStorage, key: ${key}. Error: ${e.message}`
    );
  }
};

export const removeFromArray = async (setKey: string, setMember: any) => {
  try {
    if (setKey && setMember) {
      await client.removeFromArray(setKey, setMember);
    }
  } catch (e) {
    debug.error(
      `For removeFromArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const addToArray = async (setKey: string, setMember: any) => {
  try {
    if (setKey && setMember) {
      await client.addToArray(setKey, setMember);
    }
  } catch (e) {
    debug.error(
      `For addToArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const inArray = async (setKey: string, setMember: any) => {
  try {
    return await client.inArray(setKey, setMember);
  } catch (e) {
    debug.error(
      `For inArray of inmemoryStorage, ${setKey}: ${setMember}. Error: ${e.message}`
    );
  }
};

export const set = async (key: string, value: any) => {
  try {
    client.set(key, value);
  } catch (e) {
    debug.error(
      `For set of inmemoryStorage, key: ${key}, value: ${value}. Error: ${e.message}`
    );
  }
};

export const get = async (key: string, defaultValue?: any) => {
  try {
    return await client.get(key, defaultValue);
  } catch (e) {
    debug.error(
      `For get of inmemoryStorage, key: ${key}, default value: ${defaultValue}. Error: ${e.message}`
    );
  }
};

export default function() {
  return client;
}


const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT || '6379', 10),
  password: REDIS_PASSWORD
});

const registry = new ServiceRegistry(redis, {});

export const getServices = () => {
  return registry.services();
};

export const getService = async (name: string, meta?: boolean) => {
  const result: { address: string; meta: any } = {
    address: await registry.get(name),
    meta: {}
  };

  if (meta) {
    const value = await redis.get(`service:config:${name}`);
    const parsedConfig = JSON.parse(value || '{}');

    result.meta = parsedConfig && parsedConfig.meta;
  }

  return result;
};