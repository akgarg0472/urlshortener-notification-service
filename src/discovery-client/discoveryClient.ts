import Consul from "consul";
import { RegisterOptions } from "consul/lib/agent/service";
import { randomUUID } from "crypto";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";
import { shutdown } from "../notificationService";
import { ServerInfo } from "../serverInfo";
import { getEnvNumber } from "../utils/envUtils";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const MAX_RETRIES: number = getEnvNumber("DISCOVERY_SERVER_MAX_RETRIES", 5);
let backoffTime = 1000;
let retryCount = 0;

const serviceName: string = "urlshortener-notification-service";
const serviceId = `${serviceName}-${randomUUID().toString().replace(/-/g, "")}`;

let heartbeatInterval: NodeJS.Timeout | null = null;
let discoveryClient: Consul;

export const initDiscoveryClient = async (isRetry: boolean = false) => {
  if (isRetry) {
    logger.info(`Retrying discovery client regitration: ${retryCount}`);
  }

  const enableDiscoveryClient: string =
    process.env.ENABLE_DISCOVERY_CLIENT || "true";

  if (enableDiscoveryClient === "false") {
    return;
  }

  discoveryClient = createDiscoveryClient();

  const consulRegisterOptions: RegisterOptions = {
    id: serviceId,
    name: serviceName,
    address: ServerInfo.ip,
    port: ServerInfo.port,
    check: {
      name: `health-check`,
      timeout: "5s",
      ttl: "30s",
      deregistercriticalserviceafter: "1m",
    },
  };

  try {
    await discoveryClient.agent.service.register(consulRegisterOptions);
    logger.info("Discovery client initialized successfully");
    initHeartbeat();
  } catch (err: any) {
    logger.error(`Error initializing discovery client`, { error: err });

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(async () => {
        await initDiscoveryClient(true);
      }, backoffTime);
      backoffTime *= 2;
    } else {
      logger.error(
        `Discovery client retries exceeded the configured retry attempts: ${MAX_RETRIES}. Terminating application`
      );
      await shutdown(-1);
    }
  }
};

export const destroyDiscoveryClient = async () => {
  if (!discoveryClient) {
    logger.warn(
      "Not destroying discovery client because it is not initialized!!"
    );
    return;
  }

  try {
    await discoveryClient.agent.service.deregister(serviceId);
  } catch (err: any) {
    logger.error(`Failed to stop Discovery client`, { error: err });
  } finally {
    clearRunningIntervals();
  }
};

const createDiscoveryClient = (): Consul => {
  const consulOptions = {
    host: getDiscoveryServerHost(),
    port: getDiscoveryServerPort(),
  };
  logger.info(
    `Initializing discovery server with option: ${JSON.stringify(
      consulOptions
    )}`
  );
  return new Consul(consulOptions);
};

const getDiscoveryServerPort = (): number => {
  return parseInt(process.env["DISCOVERY_SERVER_PORT"] || "8500");
};

const getDiscoveryServerHost = (): string => {
  return process.env["DISCOVERY_SERVER_HOST"] || "127.0.0.1";
};

const initHeartbeat = () => {
  sendHeartbeat();
  heartbeatInterval = setInterval(() => {
    sendHeartbeat();
  }, 15000);
};

const clearRunningIntervals = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
};

const sendHeartbeat = async () => {
  const checkId = "service:" + serviceId;

  if (logger.isDebugEnabled()) {
    logger.debug(`Sending hearbeat for ${checkId}`);
  }

  try {
    await discoveryClient.agent.check.pass({
      id: checkId,
      note: `Heartbeat from agent`,
    });
  } catch (err: any) {
    logger.error(`Error sending heartbeat`, { error: err });

    if (err instanceof Error) {
      if (err.message.includes("not found")) {
        logger.info("Service registration not found. Re-registering service");
        clearRunningIntervals();
        initDiscoveryClient();
      }
    }
  }
};
