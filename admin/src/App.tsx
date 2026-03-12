import { useMemo, useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import {
  AppstoreOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  TeamOutlined,
  ClusterOutlined,
  BarsOutlined
} from '@ant-design/icons';
import { Card, Col, Layout, Menu, Row, Statistic, Table, Tag, Typography } from 'antd';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

type RecordItem = {
  id: number;
  topic: string;
  copy: string;
  image_url: string;
  video_url: string;
  subtitle_mode: string;
  created_at: string;
};

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
  { key: 'records', icon: <FileTextOutlined />, label: '内容生产记录' },
  { key: 'queue', icon: <DatabaseOutlined />, label: '任务队列' },
  { key: 'assets', icon: <AppstoreOutlined />, label: '素材库' },
  { key: 'workflow', icon: <ClusterOutlined />, label: '工作流管理' },
  { key: 'logs', icon: <BarsOutlined />, label: '系统日志' }
];

export default function App() {
  const [selected, setSelected] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState<'运行中' | '异常'>('异常');
  const [aiStatus, setAiStatus] = useState<'运行中' | '异常'>('异常');
  const [records, setRecords] = useState<RecordItem[]>([]);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const aiBase = import.meta.env.VITE_AI_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    axios.get(`${apiBase}/health`).then(() => setApiStatus('运行中')).catch(() => setApiStatus('异常'));
    axios.get(`${aiBase}/health`).then(() => setAiStatus('运行中')).catch(() => setAiStatus('异常'));
  }, [apiBase, aiBase]);

  useEffect(() => {
    if (selected !== 'records') return;
    axios
      .get(`${apiBase}/api/workflow/production-records`)
      .then((res) => setRecords(res.data || []))
      .catch(() => setRecords([]));
  }, [selected, apiBase]);

  const queueData = useMemo(
    () => [
      { key: '1', type: 'generate_copy', status: 'processing', created_at: '2026-03-12 10:00:00' },
      { key: '2', type: 'generate_video', status: 'pending', created_at: '2026-03-12 10:02:00' },
      { key: '3', type: 'subtitle', status: 'completed', created_at: '2026-03-12 10:05:00' }
    ],
    []
  );

  const renderDashboard = () => (
    <Card>
      <Title level={4}>仪表盘</Title>
      <Paragraph>集中查看平台运行状态、生成任务与用户规模。</Paragraph>
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="今日生成数量" value={records.length || 286} suffix="条" /></Card></Col>
        <Col span={6}><Card><Statistic title="任务队列处理中" value={34} suffix="个" /></Card></Col>
        <Col span={6}><Card><Statistic title="API系统运行状态" value={apiStatus} /></Card></Col>
        <Col span={6}><Card><Statistic title="AI系统运行状态" value={aiStatus} /></Card></Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}><Card><Statistic title="用户数量" value={1248} suffix="人" /></Card></Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Title level={5}>任务队列状态</Title>
        <Table
          dataSource={queueData}
          pagination={false}
          columns={[
            { title: '任务类型', dataIndex: 'type' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (value: string) => {
                const color = value === 'completed' ? 'green' : value === 'processing' ? 'blue' : 'orange';
                const text = value === 'completed' ? '已完成' : value === 'processing' ? '处理中' : '待处理';
                return <Tag color={color}>{text}</Tag>;
              }
            },
            { title: '创建时间', dataIndex: 'created_at' }
          ]}
        />
      </div>
    </Card>
  );

  const renderRecords = () => (
    <Card>
      <Title level={4}>内容生产记录</Title>
      <Paragraph>记录每一次内容生产主题、文案、图片、视频与生成时间。</Paragraph>
      <Table
        rowKey="id"
        dataSource={records}
        pagination={{ pageSize: 8 }}
        columns={[
          { title: '主题', dataIndex: 'topic', width: 160 },
          { title: '文案', dataIndex: 'copy', width: 220 },
          {
            title: '图片',
            dataIndex: 'image_url',
            render: (v: string) => <a href={v} target="_blank" rel="noreferrer">查看图片</a>
          },
          {
            title: '视频',
            dataIndex: 'video_url',
            render: (v: string) => <a href={v} target="_blank" rel="noreferrer">查看视频</a>
          },
          { title: '字幕模式', dataIndex: 'subtitle_mode', width: 120 },
          { title: '时间', dataIndex: 'created_at', width: 180 }
        ]}
      />
    </Card>
  );

  const placeholder = (title: string, desc: string) => (
    <Card>
      <Title level={4}>{title}</Title>
      <Paragraph>{desc}</Paragraph>
    </Card>
  );

  const moduleViews: Record<string, ReactElement> = {
    dashboard: renderDashboard(),
    users: placeholder('用户管理', '管理用户信息、会员状态、登录行为与权限。'),
    records: renderRecords(),
    queue: placeholder('任务队列', '查看队列堆积、任务执行状态和失败重试情况。'),
    assets: placeholder('素材库', '管理所有生成素材，支持搜索、标签和删除。'),
    workflow: placeholder('工作流管理', '配置人工控制的分步骤内容生产工作流。'),
    logs: placeholder('系统日志', '审计用户操作和系统行为日志。')
  };

  return (
    <Layout style={{ minHeight: '100%' }}>
      <Sider theme="dark" width={240}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, padding: '18px 16px' }}>AutoContent 管理后台</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selected]} items={menuItems} onClick={(e) => setSelected(e.key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>AutoContent 内容生产管理系统</Title>
        </Header>
        <Content style={{ margin: 16 }}>{moduleViews[selected]}</Content>
      </Layout>
    </Layout>
  );
}
