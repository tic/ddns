import axios from 'axios';
import * as dns from 'dns';
import { config } from './config';
import { getErrorLogger, getLogger, LogCategoriesEnum } from './logger';

let ttl = 0;
const logger = getLogger('ddns');
const errorLogger = getErrorLogger('ddns');

const baseUrl = 'https://dynamicdns.park-your-domain.com/update?'
  + `host=${config.namecheap.host}&domain=${config.namecheap.domain}`;
const getUrl = (password: string, ip: string) => `${baseUrl}&password=${password}&ip=${ip}`;

const getCurrentWanIp = async () : Promise<string> => {
  try {
    const resp = await axios.get('https://myexternalip.com/raw');
    if (resp.status !== 200) {
      throw new Error(`${resp.status} -- ${resp.statusText}`);
    }

    return resp.data;
  } catch (error) {
    errorLogger.log(LogCategoriesEnum.IP_FETCH_FAILURE, String(error));
    return '0.0.0.0';
  }
};

const getCurrentDomainDdnsIp = () : Promise<string[]> => new Promise((resolve) => {
  try {
    const prefix = config.namecheap.host === '@' ? '' : `${config.namecheap.host}.`;
    dns.resolve(`${prefix}${config.namecheap.domain}`, (error, addresses) => {
      if (error !== null) {
        errorLogger.log(LogCategoriesEnum.IP_FETCH_FAILURE, String(error));
      } else {
        resolve(addresses);
      }
    });
  } catch (error) {
    errorLogger.log(LogCategoriesEnum.IP_FETCH_FAILURE, String(error));
    resolve([]);
  }
});

const eventLoop = async () : Promise<void> => {
  ttl -= config.ddns.pollingFreqMs;
  if (ttl > 0) {
    logger.log('ttl active -- skipping iteration');
  }

  const wanIp = await getCurrentWanIp();
  const remoteDdnsIp = await getCurrentDomainDdnsIp();

  if (wanIp === '0.0.0.0') {
    errorLogger.log(LogCategoriesEnum.IP_FETCH_FAILURE, 'failed to fetch wan ip');
    return;
  }

  if (remoteDdnsIp.length === 0) {
    errorLogger.log(LogCategoriesEnum.IP_FETCH_FAILURE, 'failed to fetch wan ip');
    return;
  }

  logger.log(`wan ip: ${wanIp}`);
  logger.log(`ddns ips: ${remoteDdnsIp}`);

  if (!remoteDdnsIp.includes(wanIp)) {
    logger.log('updating ddns entry');
    const response = await axios.get(getUrl(config.namecheap.password, wanIp));
    if (response.status !== 200) {
      errorLogger.log(LogCategoriesEnum.AXIOS_FAILURE, response.statusText);
    } else {
      logger.log('updated ddns ip -- setting ttl');
      ttl = config.ddns.ttlMs;
    }
  } else {
    logger.log('ddns in sync with wan');
  }
};

if (config.meta.inDevelopment) {
  eventLoop();
} else {
  logger.log(`spawning event loop. first event in ~${Math.floor(config.ddns.pollingFreqMs / 60000)} minutes`);
  setInterval(eventLoop, config.ddns.pollingFreqMs);
}
