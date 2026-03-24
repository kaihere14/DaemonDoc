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

  const changeListHtml = changes
    .map((change) => {
      const tagClass = allowedTagClasses.has(change.tagClass)
        ? change.tagClass
        : "tag-improved";

      return `
        <div class="change-block">
          <div class="change-header">
            <span class="change-tag ${tagClass}">${escapeHtml(change.tag || "IMPROVED")}</span>
            <span class="change-title">${escapeHtml(change.title || "Update")}</span>
          </div>
          <div class="change-body">${escapeHtml(change.description || "General improvements.")}</div>
        </div>`;
    })
    .join("\n");

  html = html.split("{{CHANGE_LIST}}").join(changeListHtml);

  html = applyToken(html, "CTA_PRIMARY_URL", "https://daemondoc.online");
  html = applyToken(html, "CTA_PRIMARY_TEXT", data?.primaryCTA || "Try Now");
  html = applyToken(
    html,
    "YEAR",
    data?.year || String(new Date().getFullYear()),
  );

  return html;
};
