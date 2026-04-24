# Stage 1: prod-deps — instala sólo dependencias de producción
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: builder — compila TypeScript + reescribe path aliases
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 3: runner — imagen final mínima sin fuentes ni devDeps
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S nodeapp && adduser -S -G nodeapp nodeapp
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
USER nodeapp
EXPOSE 3000
CMD ["node", "dist/index.js"]
