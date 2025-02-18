import http from "http";

import { basename, dirname } from "path";
import { getLogger } from "../logger/logger.js";
import {
  getMetrics,
  increaseHttpRequestCounter,
  observeHttpRequestDuration,
} from "../metrics.js";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

/**
 * Creates and configures an HTTP server that handles various API requests.
 *
 * The server responds to the following routes:
 * - `/prometheus/metrics`: Provides application metrics.
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
    let statusCode: number = 200;

    try {
      if (req.url === "/prometheus/metrics") {
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
      logger.error(`Error processing HTTP request: ${err}`);
      statusCode = 500;
    } finally {
      increaseHttpRequestCounter(req.method, req.url, statusCode);
      observeHttpRequestDuration(
        req.method,
        req.url,
        statusCode,
        performance.now() - startTime
      );
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
    const address = httpServer.address();
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
