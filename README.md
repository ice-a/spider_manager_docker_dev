# 爬虫管理平台

一个基于Flask和React的爬虫管理平台，支持通过上传ZIP压缩包中的Dockerfile来创建和管理爬虫容器。

## 功能特点

- 支持上传ZIP格式的爬虫代码包
- 自动解析压缩包中的Dockerfile
- 自动构建Docker镜像并创建容器
- 提供容器的启动、停止、删除等管理功能
- 实时监控容器状态

## 系统要求

- Python 3.7+
- Node.js 14+
- Docker

## 安装部署

### 后端服务

1. 安装Python依赖：
```bash
pip install -r requirements.txt
```

2. 启动Flask服务：
```bash
python app.py
```
服务将在 http://localhost:5000 运行

### 前端服务

1. 进入frontend目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

## 使用说明

### 爬虫代码包要求

1. 将爬虫代码和相关依赖打包成ZIP格式
2. ZIP包根目录必须包含Dockerfile
3. Dockerfile中需要正确配置爬虫运行环境和启动命令

### API接口

#### 上传爬虫代码包
- URL: `/upload`
- 方法: POST
- 参数: 
  - file: ZIP格式文件
- 返回示例：
```json
{
    "message": "文件上传成功",
    "path": "extracted/spider_project"
}
```

#### 获取容器列表
- URL: `/containers`
- 方法: GET
- 返回示例：
```json
[
    {
        "id": "container_id",
        "name": "spider-project",
        "status": "running",
        "image": "spider-project:latest"
    }
]
```

#### 创建容器
- URL: `/containers/create`
- 方法: POST
- 参数：
```json
{
    "path": "extracted/spider_project"
}
```
- 返回示例：
```json
{
    "message": "容器创建成功",
    "container_id": "container_id"
}
```

#### 容器操作
- URL: `/containers/<container_id>/action`
- 方法: POST
- 参数：
```json
{
    "action": "start|stop|remove"
}
```
- 返回示例：
```json
{
    "message": "操作成功"
}
```