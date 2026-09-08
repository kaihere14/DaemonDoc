import winston from "winston";

const { combine, timestamp, printf, colorize, errors, json, splat } =
  winston.format;

const isProduction = process.env.NODE_ENV === "production";

// Tags name the subsystem a line came from, so no call site has to hand-write
// a "[Something]" prefix into its message any more. Add a tag here rather than
// passing a raw string at the call site — a typo'd tag is invisible in search.
export const TAGS = {
  SERVER: "server",
  GITHUB: "github",
  AI: "ai",
  WORKER: "worker",
  QUEUE: "queue",
  DB: "db",
  AUTH: "auth",
  EMAIL: "email",
  CONVEX: "convex",
  REDIS: "redis",
};

// Anything that is not part of the message itself is printed as key=value at
// the end of the line, so structured fields survive the human-readable format
// instead of being flattened into prose.
function formatMeta(meta) {
  const entries = Object.entries(meta).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  if (entries.length === 0) return "";

  return (
    " " +
    entries
      .map(([key, value]) => {
        const text =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        return `${key}=${text}`;
      })
      .join(" ")
  );
}

const humanFormat = printf((info) => {
  const {
    level,
    message,
    timestamp: time,
    tag,
    provider,
    stack,
    ...rest
  } = info;

  // Winston's own bookkeeping symbols carry no information the printed line
  // needs, and they would otherwise show up as key=value noise.
  const meta = Object.fromEntries(Object.entries(rest));

  // Provider rides alongside the tag (ai:Gemini) because for AI lines the
  // provider is the first thing you look for when a run goes wrong.
  const label = provider ? `${tag}:${provider}` : tag;
  const head = `${time} ${level} [${label ?? "app"}] ${message}`;

  return stack
    ? `${head}${formatMeta(meta)}\n${stack}`
    : head + formatMeta(meta);
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  // errors({ stack: true }) lets `log.error("msg", error)` keep the stack
  // instead of collapsing the error to "[object Object]".
  format: combine(errors({ stack: true }), splat(), timestamp()),
  transports: [
    new winston.transports.Console({
      // JSON in production so a log shipper can parse it; readable lines in
      // development where a human is the only consumer.
      format: isProduction
        ? json()
        : combine(colorize({ level: true }), humanFormat),
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Child logger bound to a tag (and any other permanent fields, such as the
// provider name for an AI call). Children inherit the level and transports.
export function taggedLogger(tag, meta = {}) {
  return logger.child({ tag, ...meta });
}

export const serverLog = taggedLogger(TAGS.SERVER);
export const githubLog = taggedLogger(TAGS.GITHUB);
export const aiLog = taggedLogger(TAGS.AI);
export const workerLog = taggedLogger(TAGS.WORKER);
export const queueLog = taggedLogger(TAGS.QUEUE);
export const dbLog = taggedLogger(TAGS.DB);
export const authLog = taggedLogger(TAGS.AUTH);
export const emailLog = taggedLogger(TAGS.EMAIL);
export const convexLog = taggedLogger(TAGS.CONVEX);
export const redisLog = taggedLogger(TAGS.REDIS);

// AI lines always carry the provider that served the call, so a fallback run
// reads as ai:Gemini failing and ai:Sarvam succeeding rather than one blur.
export function providerLog(providerName) {
  return taggedLogger(TAGS.AI, { provider: providerName });
}

// Express request logging: one line per finished request, with the status and
// duration attached as fields instead of being baked into the message.
export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    serverLog.log(level, `${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      durationMs,
    });
  });

  next();
}

export default logger;
