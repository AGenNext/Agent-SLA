FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps
COPY examples ./examples

RUN npm ci
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
WORKDIR /app

COPY --chown=node:node apps/api/package.json ./apps/api/package.json
COPY --chown=node:node packages/core/package.json ./node_modules/@agennext/agent-sla-core/package.json
COPY --chown=node:node --from=build /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=build /app/packages/core/dist ./node_modules/@agennext/agent-sla-core/dist
COPY --chown=node:node examples ./examples

EXPOSE 8080
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch(http://127.0.0.1:8080/health).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/api/dist/src/server.js"]
