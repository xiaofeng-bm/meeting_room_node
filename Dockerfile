# 使用 Node.js 18.0 版本的 Alpine Linux 作为构建阶段的基础镜像
FROM node:18.0-alpine3.14 as build-stage

# 设置工作目录为 /app
WORKDIR /app

# 复制 package.json 文件到工作目录
COPY package.json .

# 设置 npm 镜像源为国内镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装项目依赖
RUN npm install

# 复制所有文件到工作目录
COPY . .

# 运行构建命令
RUN npm run build

# 使用 Node.js 18.0 版本的 Alpine Linux 作为生产阶段的基础镜像
FROM node:18.0-alpine3.14 as production-stage

# 从构建阶段复制构建输出的文件到生产阶段的工作目录
COPY --from=build-stage /app/dist /app
# 从构建阶段复制 package.json 文件到生产阶段的工作目录
COPY --from=build-stage /app/package.json /app/package.json

# 设置工作目录为 /app
WORKDIR /app

# 设置 npm 镜像源为国内镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装生产环境依赖
RUN npm install --production

# 暴露容器的 3005 端口
EXPOSE 3005

# 设置容器启动时运行的命令
CMD ["node", "/app/main.js"]