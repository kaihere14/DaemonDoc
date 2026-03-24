export const isValidEmailHtml = (html) => {
  if (!html || typeof html !== "string") return false;

  const normalized = html.toLowerCase();
  const hasRequiredTags =
    normalized.includes("<html") &&
    normalized.includes("<body") &&
    normalized.includes("</body>") &&
    normalized.includes("</html>");

  const opens = (normalized.match(/<style\b/g) || []).length;
  const closes = (normalized.match(/<\/style>/g) || []).length;
  const styleBalanced = opens === closes;

  return hasRequiredTags && styleBalanced && html.length > 200;
};
