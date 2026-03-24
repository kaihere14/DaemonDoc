import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.resolve(
  __dirname,
  "./templates/feature-announcement.html",
);

const readTemplate = () => fs.readFileSync(templatePath, "utf-8");

const allowedTagClasses = new Set([
  "tag-new",
  "tag-improved",
  "tag-fixed",
  "tag-security",
]);

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const applyToken = (html, token, value) =>
  html.split(`{{${token}}}`).join(escapeHtml(value ?? ""));

const removeChangeBlock = (html, index) => {
  const pattern = new RegExp(
    `<div class="change-block">[\\s\\S]*?\\{\\{CHANGE_${index}_TAG\\}\\}[\\s\\S]*?<\\/div>\\s*`,
    "i",
  );
  return html.replace(pattern, "");
};

export const renderFeatureAnnouncementTemplate = (data) => {
  let html = readTemplate();

  const changes = Array.isArray(data?.changes) ? data.changes : [];

  html = applyToken(html, "DATE", data?.date || new Date().toDateString());
  html = applyToken(html, "USER_NAME", data?.userName || "there");
  html = applyToken(
    html,
    "FEATURE_NAME",
    data?.featureName || "Feature Update",
  );
  html = applyToken(
    html,
    "INTRO_TEXT",
    data?.intro || "We have released an update for your workflow.",
  );
  html = applyToken(
    html,
    "FEATURE_HERO_DESCRIPTION",
    data?.heroDescription || "This update improves stability and performance.",
  );

  for (let i = 1; i <= 2; i += 1) {
    const change = changes[i - 1];

    if (!change) {
      html = removeChangeBlock(html, i);
      continue;
    }

    const tagClass = allowedTagClasses.has(change.tagClass)
      ? change.tagClass
      : "tag-improved";

    html = applyToken(html, `CHANGE_${i}_TAG_CLASS`, tagClass);
    html = applyToken(html, `CHANGE_${i}_TAG`, change.tag || "IMPROVED");
    html = applyToken(html, `CHANGE_${i}_TITLE`, change.title || "Update");
    html = applyToken(
      html,
      `CHANGE_${i}_DESCRIPTION`,
      change.description || "General improvements and bug fixes.",
    );
  }

  html = applyToken(
    html,
    "CTA_PRIMARY_URL",
    data?.primaryURL || "https://daemondoc.online",
  );
  html = applyToken(html, "CTA_PRIMARY_TEXT", data?.primaryCTA || "Try Now");
  html = applyToken(
    html,
    "UNSUBSCRIBE_TOKEN",
    data?.unsubscribeToken || "temp-unsubscribe-token",
  );
  html = applyToken(
    html,
    "YEAR",
    data?.year || String(new Date().getFullYear()),
  );

  return html;
};
