FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY . .

USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
