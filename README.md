# URL Shortener Notification Service

![Node Version](https://img.shields.io/badge/Node-20-green)
![version](https://img.shields.io/badge/version-1.3.3-blue)

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [Additional Notes](#additional-notes)

## Introduction

The **URL Shortener Notification Service** is a backend service that sends email notifications when URL shortening actions occur. It is built using **Node.js**, and utilizes **Kafka** for event-driven communication and **SMTP** (such as Gmail) for email sending.

The service listens to Kafka topics for notification events and sends corresponding emails. It is designed to be lightweight and can be run locally or in production using Docker.

## Prerequisites

Before running the service, ensure the following are installed and running:

- **Node.js v18+**
- **Kafka** (for consuming notification events)
- **Email Server** (SMTP like Gmail for sending emails)

## Installation

### Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/akgarg0472/urlshortener-notification-service.git
cd urlshortener-notification-service
```

### Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

## Configuration

The application is configured through environment variables. You can define them in the `.env` file or pass them directly when running the service.

### Environment Variables

Here are the environment variables used by the service:

```bash
ENABLE_DISCOVERY_CLIENT=true
DISCOVERY_SERVER_HOST=localhost
DISCOVERY_SERVER_PORT=8500
DISCOVERY_SERVER_MAX_RETRIES=5
DISCOVERY_SERVER_REQUEST_RETRY_DELAY_MS=500
DISCOVERY_SERVER_SERVER_QUERY_INTERVAL_MS=30000
KAFKA_BROKER_URLS=localhost:9092
KAFKA_TOPIC_NAME=urlshortener.notifications.email
KAFKA_MAX_RETRY_TIME_MS=60000
KAFKA_INITIAL_RETRY_TIME_MS=1000
KAFKA_MAX_RETRIES=10
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_AUTH_USERNAME=<email-server-username>
EMAIL_AUTH_PASSWORD=<email-server-password>
```

- **KAFKA_BROKER_URLS**: Kafka broker URLs, usually `localhost:9092`.
- **KAFKA_TOPIC_NAME**: Kafka topic name for the email notifications.
- **KAFKA_MAX_RETRY_TIME_MS**: The maximum total time (in milliseconds) the consumer will keep retrying a failed operation before giving up. In this case, it's set to 60,000 ms (or 1 minute).
- **KAFKA_INITIAL_RETRY_TIME_MS**: The initial time (in milliseconds) between retry attempts after a failure. In this case, it's set to 1,000 ms (or 1 second) for the first retry.
- **KAFKA_MAX_RETRIES**: The maximum number of retry attempts allowed before failing the operation. In this case, it’s set to 10 retries.
- **EMAIL_HOST**: SMTP server for sending emails (e.g., `smtp.gmail.com`).
- **EMAIL_PORT**: SMTP port (typically `587` for Gmail).
- **EMAIL_SECURE**: Whether to use SSL/TLS for the SMTP connection (set to `false` for Gmail).
- **EMAIL_AUTH_USERNAME**: Email server username (your email address).
- **EMAIL_AUTH_PASSWORD**: Email server password (application-specific password if using Gmail).
- **ENABLE_DISCOVERY_CLIENT**: Enable/disable discovery client (true/false).
- **DISCOVERY_SERVER_HOST**: Discovery server host (e.g., localhost).
- **DISCOVERY_SERVER_PORT**: Discovery server port (e.g., 8500).
- **DISCOVERY_SERVER_MAX_RETRIES**: Maximum number of retries for connecting to the discovery server (e.g., 5).
- **DISCOVERY_SERVER_REQUEST_RETRY_DELAY_MS**: Delay in milliseconds between retries for requests to the discovery server (e.g., 500 ms).
- **DISCOVERY_SERVER_SERVER_QUERY_INTERVAL_MS**: Interval in milliseconds between queries to the discovery server (e.g., 30000 ms).

### Logging Configuration

The URL Shortener Notification Service uses environment variables for logging configuration. Below are the available environment
variables that you can customize:

- **LOGGING_CONSOLE_ENABLED**: Enables or disables console-based logging.

  - Default value: `false`
  - Allowed values: `true`, `false`

- **LOGGING_FILE_ENABLED**: Enables or disables file-based logging.

  - Default value: `false`
  - Allowed values: `true`, `false`

- **LOGGING_FILE_BASE_PATH**: Specifies the base path for log files.

  - Default value: `/tmp`

- **LOG_LEVEL**: Specifies the log level for the application.

  - Default value: `INFO`
  - Allowed values: `DEBUG`, `INFO`, `WARN`, `ERROR`

- **LOGGING_STREAM_ENABLED**: Enables or disables streaming logs.

  - Default value: `false`
  - Allowed values: `true`, `false`

- **LOGGING_STREAM_HOST**: Specifies the host for streaming logs.

  - Default value: `localhost`

- **LOGGING_STREAM_PORT**: Specifies the port for streaming logs.

  - Default value: `5000`

- **LOGGING_STREAM_PROTOCOL**: Specifies the protocol used for log streaming.
  - Default value: `TCP`
  - Allowed values: `TCP`, `UDP`

## Running the Application

### Local Execution

You can run the application locally by executing the following command:

```bash
npm run compile
npm run start
```

This will start the service and it will connect to the Kafka server for consuming events.

## Docker Execution

The application is Dockerized for simplified deployment. The `Dockerfile` is already configured to build and run the application.

The `Dockerfile` defines the build and runtime configuration for the container. If you're making changes, you can use the following commands:

### Building the Docker Image

To build the Docker image, run the following command:

```bash
docker build -t akgarg0472/urlshortener-notification-service:1.0.0 .
```

### Running the Docker Container

You can run the service with the necessary environment variables using this command:

```bash
docker run --name=notification-service --network=host \
        -e NODE_ENV=dev \
        -e KAFKA_BROKER_URLS=localhost:9092 \
        -e KAFKA_TOPIC_NAME=urlshortener.notifications.email \
        -e EMAIL_HOST=smtp.gmail.com \
        -e EMAIL_PORT=587 \
        -e EMAIL_SECURE=false \
        -e EMAIL_AUTH_USERNAME=<email-server-username> \
        -e EMAIL_AUTH_PASSWORD=<email-server-password> \
        akgarg0472/urlshortener-notification-service:1.0.0
```

Alternatively, you can pass the `.env` file directly to the container for easy environment variable configuration:

```bash
docker run --name=notification-service --network=host \
        --env-file .env \
        akgarg0472/urlshortener-notification-service:1.0.0
```

This will start the notification service within a Docker container, using the provided environment variables.

## Additional Notes

- **Kafka Setup**: Ensure Kafka is running and the topic `urlshortener.notifications.email` is created. If Kafka is running locally, make sure it’s accessible on `localhost:9092`. You can modify the `KAFKA_BROKER_URLS` environment variable to use a different Kafka server if necessary.

- **Email Configuration**:

  - When using **Gmail** as the SMTP server, you may need to generate an **App Password** if you have 2-step verification enabled on your Google account. You can generate an App Password [here](https://myaccount.google.com/apppasswords).
  - Ensure that the **EMAIL_AUTH_USERNAME** is set to your Gmail address and **EMAIL_AUTH_PASSWORD** is set to the generated App Password.
  - If using a different email provider, make sure the **EMAIL_HOST**, **EMAIL_PORT**, **EMAIL_SECURE**, and authentication credentials are configured properly based on the email service provider’s documentation.

- **Logging**:

  - Logs are saved in the directory specified by the `LOGS_BASE_DIR` environment variable (e.g., `/tmp/urlshortener/notification/`).
  - By default, the service logs messages to a file `notifications.log` in the specified directory. If you want to change the log location or file name, modify the `LOGS_BASE_DIR` and `LOG_FILE_NAME` environment variables.
  - You can adjust the `LOG_LEVEL` environment variable to control the verbosity of the logs. Available log levels are `INFO`, `DEBUG`, and `ERROR`. The default is `INFO`.

- **Environment Variables**:

  - It’s important to ensure that the required environment variables are set before running the service. These include Kafka connection details, email configuration, and logging settings.
  - You can either set the environment variables in a `.env` file in the root directory or pass them directly when running the service (via Docker or directly in the terminal).

- **Kafka Topic**:

  - The service subscribes to Kafka topic `urlshortener.notifications.email` to listen for events that require email notifications.
  - If you have disabled automatic topic creation in Kafka, you may need to manually create the topic using the Kafka CLI or API.
  - If you’re running Kafka in a production environment, ensure that the topic partitions and replication factor are configured properly for reliability and performance.

- **SMTP Security**:
  Some email services (like Gmail) may block sign-ins from less secure apps. To avoid issues with authentication, ensure that "Allow less secure apps" is enabled in your email account settings, or use an App Password for services like Gmail.

- **Testing**:
  You can test the notification service by publishing test events to the Kafka topic `urlshortener.notifications.email`. For testing purposes, you can use tools like Kafka Console Producer or a custom script to produce test events that simulate real email notifications.
