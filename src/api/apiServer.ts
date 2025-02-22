import http from "http";

import { AddressInfo } from "net";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger.js";
import {
  getMetrics,
  increaseHttpRequestCounter,
  observeHttpRequestDuration,
} from "../metrics.js";
import { ServerInfo } from "../serverInfo.js";
import { getLocalIPAddress } from "../utils/networkUtils.js";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

/**
 * Creates and configures an HTTP server that handles various API requests.
 *
 * The server responds to the following routes:
 * - `/metrics`: Provides application metrics.
 * - All other routes return a 404 Not Found response.
 */
const httpServer = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (logger.isDebugEnabled()) {
      logger.debug(
        `HTTP request received: url=${req.url}, remote IP=${req.socket.remoteAddress}`
      );
    }

    const startTime: number = performance.now();
    const clientIp = getClientIp(req);
    let statusCode: number = 200;

    try {
      if (req.url === "/metrics") {
        const metrics: string = await getMetrics();
        res.setHeader("Content-Type", "text/plain");
        res.end(metrics);
        statusCode = 200;
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        statusCode = 404;
        res.end(
          JSON.stringify({
            message: `Endpoint '${req.url}' not found`,
            error_code: "endpoint_not_found",
          })
        );
      }
    } catch (err: any) {
      logger.error(`Error processing HTTP request`, { error: err });
      statusCode = 500;
    } finally {
      const durationInMillis: number = parseFloat(
        (performance.now() - startTime).toFixed(3)
      );

      increaseHttpRequestCounter(req.method, req.url, statusCode);
      observeHttpRequestDuration(
        req.method,
        req.url,
        statusCode,
        durationInMillis
      );

      logger.info("HTTP request", {
        method: req.method,
        url: req.url?.split("?")[0],
        status: statusCode,
        responseTime: durationInMillis,
        ip: clientIp,
        requestId: req.headers["X-Request-Id"],
      });
    }
  }
);

/**
 * Starts the HTTP server on the specified port.
 *
 * @returns {http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>} The created HTTP server instance.
 *
 * @example
 * const server = startHttpServer(3000);
 */
export const startHttpServer = (): http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
> => {
  const port: any = process.env["SERVER_PORT"] || 6789;

  httpServer.listen(port, () => {
    const address: AddressInfo | string | null = httpServer.address();

    if (!address || typeof address === "string") {
      httpServer.close(() => {
        process.exit(1);
      });
      return;
    }

    ServerInfo.ip =
      address.address === "::" || address.address === "0.0.0.0"
        ? getLocalIPAddress()
        : address.address;
    ServerInfo.port = address.port;

    logger.info(`HTTP server started listening on ${JSON.stringify(address)}`);

    httpServer.on("close", () => {
      logger.info("HTTP server closed successfully");
    });
  });

  return httpServer;
};

export const stopHttpServer = () => {
  httpServer?.close();
};

const getClientIp = (req: http.IncomingMessage): string | undefined => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket.remoteAddress;
};
