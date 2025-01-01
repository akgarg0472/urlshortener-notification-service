export const getEnvNumber = (envKey: string, fallbackValue: number): number => {
  const envValue = process.env[envKey];

  if (envValue !== undefined && envValue !== null) {
    const trimmedValue = envValue.trim();
    const parsedValue = parseInt(trimmedValue, 10);

    if (!isNaN(parsedValue)) {
      return parsedValue;
    }
  }

  return fallbackValue;
};
