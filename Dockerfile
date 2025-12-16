FROM node:18-alpine AS builder

WORKDIR /app

# Installer curl (pour healthcheck)
RUN apk add --no-cache curl

# Copier dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances avec dev
RUN npm ci

# Copier le code source
COPY src ./src

# Compiler TypeScript en JS
RUN npm run build

# --------------------
# Image finale
FROM node:18-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

# Copier uniquement prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copier la build
COPY --from=builder /app/dist ./dist

EXPOSE 3003

CMD ["node", "dist/server.js"]

