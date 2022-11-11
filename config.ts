/* eslint-disable no-console */
import {
  config as dotenvConfig,
  DotenvConfigOutput,
} from 'dotenv';

export const getConfig = () => {
  console.log('[CNFIG] Loading project configuration...');
  const { parsed: parsedEnv }: DotenvConfigOutput = dotenvConfig();
  if (parsedEnv === undefined) {
    throw new Error('failed to load environment file. does it exist?');
  }

  const missingKeys: string[] = [];
  function env(key: string) {
    if (key === '') {
      return '';
    }
    const value = parsedEnv?.[key];
    if (value === undefined) {
      missingKeys.push(key);
      return '';
    }
    return value;
  }

  const createdConfig = {
    meta: {
      inDevelopment: parsedEnv?.NODE_ENV !== 'PRODUCTION',
    },
    ddns: {
      pollingFreqMs: Number(env('DDNS_POLLING_FREQUENCY_MS') || '0'),
      ttlMs: 1800000,
    },
    namecheap: {
      domain: env('NAMECHEAP_DOMAIN'),
      host: env('NAMECHEAP_DOMAIN_HOST'),
      password: env('NAMECHEAP_DDNS_PASSWORD'),
    },
  };

  if (missingKeys.length > 0) {
    console.warn(
      '[CNFIG] Global configuration referenced missing environment variables:\n\t- %s',
      missingKeys.join('\n\t- '),
    );
    console.error('[CNFIG] The project cannot continue with an incomplete configuration. Exiting...');
    process.exit(1);
  }

  console.log('[CNFIG] Configuration loaded.');
  return createdConfig;
};

export const config = getConfig();
