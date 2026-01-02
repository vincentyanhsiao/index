# 1. 使用 Node.js 20 官方镜像
FROM node:20-alpine

# 2. 设置工作目录
WORKDIR /app

# 3. 先复制依赖定义文件（利用 Docker 缓存加速构建）
COPY package*.json ./

# 4. 安装所有依赖
RUN npm install

# 5. 复制所有项目代码
COPY . .

# 6. 执行前端构建（生成 dist 文件夹）
RUN npm run build

# 7. 暴露后端端口（你的代码里默认是 3001）
EXPOSE 3001

# 8. 启动命令（强制运行后端服务）
CMD ["node", "server/index.js"]
