const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const buildFallbackHtml = (data) => {
  const safeTitle = escapeHtml(data?.featureName || "Feature Update");
  const safeIntro = escapeHtml(data?.intro || "An update is available.");
  const safeDescription = escapeHtml(
    data?.heroDescription || "Check out what has changed.",
  );
  const safeUser = escapeHtml(data?.userName || "there");
  const safeDate = escapeHtml(data?.date || new Date().toDateString());
  const changes = Array.isArray(data?.changes) ? data.changes : [];

  const changeItems =
    changes.length > 0
      ? changes
          .map(
            (c) =>
              `<li><strong>${escapeHtml(c?.title || "Update")}</strong>: ${escapeHtml(
                c?.description || "",
              )}</li>`,
          )
          .join("")
      : "<li>General improvements and stability updates.</li>";
  const safePrimaryUrl = escapeHtml(
    data?.primaryURL || "https://daemondoc.online",
  );

  return `<!doctype html>
<html>
  <body style="background:#f5f7f9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1f2937;line-height:1.6;padding:28px;">
    <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #d5dde5;border-radius:12px;overflow:hidden;">
      <div style="height:2px;background:#0f766e;"></div>
      <div style="padding:24px 28px 0;text-align:right;">
        <span style="display:inline-block;font-size:10px;color:#334155;background:#f8fafc;border:1px solid #cfd8e3;padding:3px 8px;border-radius:4px;">${safeDate}</span>
      </div>
      <div style="padding:20px 28px 28px;">
        <p style="margin:0 0 6px;color:#64748b;font-size:13px;">Hey ${safeUser},</p>
        <h1 style="margin:0 0 8px;color:#0f172a;font-size:22px;line-height:1.3;">Your update is ready.</h1>
        <p style="margin:0 0 18px;color:#0f766e;font-size:14px;font-weight:600;">-> ${safeTitle}</p>
        <p style="margin:0 0 20px;color:#475569;font-size:13.5px;">${safeIntro}</p>
        <div style="background:#f8fcfb;border:1px solid #cfe7e2;border-radius:10px;padding:16px 18px;margin-bottom:18px;">
          <div style="font-size:10px;letter-spacing:1px;color:#0f766e;text-transform:uppercase;margin-bottom:8px;">Overview</div>
          <div style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:8px;">${safeTitle}</div>
          <div style="font-size:13px;color:#475569;">${safeDescription}</div>
        </div>
        <ul style="padding-left:20px;margin:0;color:#475569;">${changeItems}</ul>
        <div style="margin-top:20px;">
          <a href="${safePrimaryUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 24px;border-radius:6px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">Try Now</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
};
