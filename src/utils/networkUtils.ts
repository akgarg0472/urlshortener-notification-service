import os from "os";

export const getLocalIPAddress = (): string => {
  const interfaces = os.networkInterfaces();

  for (const iface in interfaces) {
    for (const details of interfaces[iface]!) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }

  return "0.0.0.0";
};
