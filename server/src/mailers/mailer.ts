import { logger } from "../common/utils/logger";
import { config } from "../config/app.config";
import { resend } from "./resendClient";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mail_sender =
  config.NODE_ENV === "development"
    ? `no-reply <onboarding@resend.dev>`
    : `no-reply <${config.MAILER_SENDER}>`;

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  from = mail_sender,
}: Params) =>
  await resend.emails
    .send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })