import nodemailer, { Transporter } from "nodemailer";

let emailTransporter: Transporter;

const getTransporterOptions = () => {
  const host: string | undefined = process.env.EMAIL_HOST;
  const port: string | undefined = process.env.EMAIL_PORT;
  const secure: string | undefined = process.env.EMAIL_SECURE;
  const username: string | undefined = process.env.EMAIL_AUTH_USERNAME;
  const password: string | undefined = process.env.EMAIL_AUTH_PASSWORD;

  if (!host || !port || !secure || !username || !password) {
    console.error("Invalid email sender configs found");
    process.exit(1);
  }

  const transporterOptions = {
    host: host?.toString()!,
    port: parseInt(port?.toString()!),
    secure: "true" === secure?.toString()!.toLowerCase(),
    auth: {
      user: username?.toString()!,
      pass: password?.toString()!,
    },
  };

  return transporterOptions;
};

const initEmailTransporter = () => {
  const transporterOptions = getTransporterOptions();
  emailTransporter = nodemailer.createTransport(transporterOptions);
};

const getEmailTransporter = (): Transporter => {
  return emailTransporter;
};

export { getEmailTransporter, initEmailTransporter };
