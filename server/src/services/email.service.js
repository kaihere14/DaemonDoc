import { Resend } from "resend";
import { buildFallbackHtml } from "../email/template.fallback.js";
import { renderFeatureAnnouncementTemplate } from "../email/template.renderer.js";
import { isValidEmailHtml } from "../email/template.validation.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const getEmailTemplate = async (data) => {
  const rendered = renderFeatureAnnouncementTemplate(data);

  if (!isValidEmailHtml(rendered)) {
    return buildFallbackHtml(data);
  }

  return rendered;
};

export const sendEmail = async (
  subject,
  content,
  to = "armanthakur200814@gmail.com",
) => {
  if (!content || typeof content !== "object") {
    throw new Error("Email content is required and must be an object");
  }

  const html = await getEmailTemplate(content);

  const response = await resend.emails.send({
    from: "DaemonDoc<no-reply@armandev.space>",
    to,
    subject,
    html,
  });

  return response;
};
