# ---- 多阶段构建 ----
# 阶段 1：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src/ ./src/

# 阶段 2：运行（只复制必要文件，镜像更小）
FROM node:20-alpine
WORKDIR /app
# 创建非 root 用户（安全最佳实践）
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app /app
USER appuser
EXPOSE 3000
CMD ["node", "src/index.js"]
