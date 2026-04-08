export default {
  // Client: ESLint (from client's own node_modules) + Prettier
  "client/src/**/*.{js,jsx}": (files) => [
    `./client/node_modules/.bin/eslint --fix --config client/eslint.config.js ${files.join(" ")}`,
    `prettier --write ${files.join(" ")}`,
  ],

  // Server: Prettier only
  "server/src/**/*.js": (files) => `prettier --write ${files.join(" ")}`,

  // Config / misc files
  "*.{json,md,css,html}": (files) => `prettier --write ${files.join(" ")}`,
};
