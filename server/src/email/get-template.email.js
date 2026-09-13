import { resend } from "./email.js";

export async function getTemplate(id) {
  try {
    const template = await resend.templates.get(id);
    return template;
  } catch (error) {
    throw new Error(`Failed to get template: ${error.message}`);
  }
}
