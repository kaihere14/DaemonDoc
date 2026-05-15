export default {
  // Client: ESLint + Prettier (via pnpm workspace filter)
  "client/src/**/*.{js,jsx}": (files) => {
    const clientPaths = files.map((f) => f.replace(/^client\//, ""));
    return [
      `pnpm --filter client exec eslint --fix --config eslint.config.js ${clientPaths.join(" ")}`,
      `pnpm exec prettier --write ${files.join(" ")}`,
    ];
  },

  // Server: Prettier only
  "server/src/**/*.js": (files) => `prettier --write ${files.join(" ")}`,

  // Config / misc files
  "*.{json,md,css,html}": (files) => `prettier --write ${files.join(" ")}`,
};
