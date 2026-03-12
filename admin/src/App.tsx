import { useMemo, useState, useEffect } from 'react';
import { AppstoreOutlined, DashboardOutlined, DatabaseOutlined, FileTextOutlined, TeamOutlined, ClusterOutlined, BarsOutlined } from '@ant-design/icons';
import { Card, Col, Layout, Menu, Row, Statistic, Table, Tag, Typography } from 'antd';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: 'users', icon: <TeamOutlined />, label: '用户管理' },
  { key: 'records', icon: <FileTextOutlined />, label: '内容生成记录' },
  { key: 'queue', icon: <DatabaseOutlined />, label: '任务队列' },
  { key: 'assets', icon: <AppstoreOutlined />, label: '素材库' },
  { key: 'workflow', icon: <ClusterOutlined />, label: '工作流管理' },
  { key: 'logs', icon: <BarsOutlined />, label: '系统日志' }
];

export default function App() {
  const [selected, setSelected] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState<'运行中' | '异常'>('异常');

  useEffect(() => {
    axios
      .get('http://localhost:3000/health')
      .then(() => setApiStatus('运行中'))
      .catch(() => setApiStatus('异常'));
  }, []);

  const queueData = useMemo(
    () => [
      { key: '1', type: 'generate_copy', status: 'processing', created_at: '2026-03-12 10:00:00' },
      { key: '2', type: 'generate_video', status: 'pending', created_at: '2026-03-12 10:02:00' },
      { key: '3', type: 'subtitle', status: 'completed', created_at: '2026-03-12 10:05:00' }
    ],
    []
  );

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
        <Content style={{ margin: 16 }}>
          <Card>
            <Title level={4}>仪表盘</Title>
            <Paragraph>集中查看平台运行状态、生成任务与用户规模。</Paragraph>
            <Row gutter={16}>
              <Col span={6}><Card><Statistic title="今日生成数量" value={286} suffix="条" /></Card></Col>
              <Col span={6}><Card><Statistic title="任务队列处理中" value={34} suffix="个" /></Card></Col>
              <Col span={6}><Card><Statistic title="系统运行状态" value={apiStatus} /></Card></Col>
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
        </Content>
      </Layout>
    </Layout>
  );
}
