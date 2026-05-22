FROM node:22-alpine AS builder

ARG VITE_API_BASE_URL=/api
ARG VITE_ENABLE_MSW=false
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ENABLE_MSW=${VITE_ENABLE_MSW}

WORKDIR /app

COPY package.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src

RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
