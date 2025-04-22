import React, { useState, useEffect } from 'react';
import { Layout, Upload, Table, Button, message, Card, Space } from 'antd';
import { UploadOutlined, PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Content } = Layout;
const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContainers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/containers`);
      setContainers(response.data);
    } catch (error) {
      message.error('获取容器列表失败');
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (info) => {
    if (info.file.status === 'done') {
      const response = info.file.response;
      try {
        await axios.post(`${API_BASE_URL}/containers/create`, {
          path: response.path
        });
        message.success('爬虫容器创建成功');
        fetchContainers();
      } catch (error) {
        message.error('创建容器失败');
      }
    } else if (info.file.status === 'error') {
      message.error('文件上传失败');
    }
  };

  const handleContainerAction = async (containerId, action) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/containers/${containerId}/action`, { action });
      message.success(`${action}操作成功`);
      fetchContainers();
    } catch (error) {
      message.error(`${action}操作失败`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '容器ID',
      dataIndex: 'id',
      key: 'id',
      width: 220
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100
    },
    {
      title: '镜像',
      dataIndex: 'image',
      key: 'image',
      width: 200
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status !== 'running' ? (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleContainerAction(record.id, 'start')}
              loading={loading}
            >
              启动
            </Button>
          ) : (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={() => handleContainerAction(record.id, 'stop')}
              loading={loading}
            >
              停止
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleContainerAction(record.id, 'remove')}
            loading={loading}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <h1>爬虫管理平台</h1>
      </Header>
      <Content style={{ padding: '20px' }}>
        <Card title="上传爬虫代码" style={{ marginBottom: 20 }}>
          <Upload
            name="file"
            action={`${API_BASE_URL}/upload`}
            onChange={handleUpload}
            accept=".zip"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>选择ZIP文件上传</Button>
          </Upload>
        </Card>
        <Card title="容器管理">
          <Table
            columns={columns}
            dataSource={containers}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Content>
    </Layout>
  );
}

export default App;