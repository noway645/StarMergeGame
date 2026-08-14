# 使用官方 Node.js 18 精简版镜像
FROM node:18-alpine

# 设置容器内工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖（如果 server.js 使用了 express）
RUN npm install --production

# 复制项目所有文件到工作目录
COPY . .

# 声明容器运行时监听的端口
EXPOSE 3000

# 启动服务器
CMD ["node", "server.js"]