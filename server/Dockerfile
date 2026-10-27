FROM oven/bun:1 AS runtime
WORKDIR /app

COPY shared ./shared
COPY server/package.json server/bun.lock ./server/
WORKDIR /app/server
RUN bun install --frozen-lockfile

COPY server ./
COPY server/assets ./assets

EXPOSE 3000
CMD ["bun", "src/index.ts"]
