from flask import Flask, request, jsonify
from flask_cors import CORS
import docker
import os
import zipfile
import yaml
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Docker客户端
docker_client = docker.from_env()

# 配置上传文件存储路径
UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件上传'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if not file.filename.endswith('.zip'):
        return jsonify({'error': '请上传zip格式的文件'}), 400

    # 保存上传的文件
    filename = secure_filename(file.filename)
    zip_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(zip_path)
    
    # 解压文件
    extract_path = os.path.join(EXTRACT_FOLDER, filename[:-4])
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    
    # 检查Dockerfile
    dockerfile_path = os.path.join(extract_path, 'Dockerfile')
    if not os.path.exists(dockerfile_path):
        return jsonify({'error': '压缩包中没有找到Dockerfile'}), 400
    
    return jsonify({
        'message': '文件上传成功',
        'path': extract_path
    })

@app.route('/containers', methods=['GET'])
def list_containers():
    containers = docker_client.containers.list(all=True)
    return jsonify([{
        'id': container.id,
        'name': container.name,
        'status': container.status,
        'image': container.image.tags[0] if container.image.tags else 'none'
    } for container in containers])

@app.route('/containers/create', methods=['POST'])
def create_container():
    data = request.json
    path = data.get('path')
    
    if not path or not os.path.exists(path):
        return jsonify({'error': '无效的路径'}), 400
    
    try:
        # 构建Docker镜像
        image, logs = docker_client.images.build(
            path=path,
            rm=True,
            tag=f'spider-{os.path.basename(path)}'
        )
        
        # 创建并启动容器
        container = docker_client.containers.run(
            image.id,
            detach=True,
            name=f'spider-{os.path.basename(path)}'
        )
        
        return jsonify({
            'message': '容器创建成功',
            'container_id': container.id
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/containers/<container_id>/action', methods=['POST'])
def container_action(container_id):
    action = request.json.get('action')
    try:
        container = docker_client.containers.get(container_id)
        
        if action == 'start':
            container.start()
        elif action == 'stop':
            container.stop()
        elif action == 'remove':
            container.remove(force=True)
        else:
            return jsonify({'error': '无效的操作'}), 400
        
        return jsonify({'message': f'{action}操作成功'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)