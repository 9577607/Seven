'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

type CopyResult = {
  title?: string;
  script?: string;
  hashtags?: string[];
  description?: string;
};

export default function GeneratorPanel() {
  const [topic, setTopic] = useState('好运金莲花');
  const [copy, setCopy] = useState<CopyResult | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [apiHealth, setApiHealth] = useState('检测中');
  const [aiHealth, setAiHealth] = useState('检测中');

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const aiBase = process.env.NEXT_PUBLIC_AI_BASE_URL || 'http://localhost:8000';

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    axios.get(`${apiBase}/health`).then(() => setApiHealth('运行中')).catch(() => setApiHealth('异常'));
    axios.get(`${aiBase}/health`).then(() => setAiHealth('运行中')).catch(() => setAiHealth('异常'));
  }, [apiBase, aiBase]);

  const loginDemo = async () => {
    setLoading('login');
    setError('');
    try {
      await axios.post(`${apiBase}/api/auth/register`, {
        email: 'demo@autocontent.ai',
        password: '123456',
        nickname: '演示用户'
      });
    } catch {
      // ignore duplicate user
    }

    try {
      const { data } = await axios.post(`${apiBase}/api/auth/login`, {
        email: 'demo@autocontent.ai',
        password: '123456'
      });
      setToken(data.token || '');
    } catch {
      setError('登录失败，请检查 API 服务。');
    } finally {
      setLoading(null);
    }
  };

  const ensureToken = () => {
    if (!token) {
      setError('请先点击“登录演示账号”获取授权。');
      return false;
    }
    return true;
  };

  const generateCopy = async () => {
    if (!ensureToken()) return;
    setLoading('copy');
    setError('');
    try {
      const { data } = await axios.post(
        `${apiBase}/api/ai/generate-copy`,
        { topic, style: '治愈风', platform: '抖音', length: '30s', language: 'zh' },
        { headers: authHeaders }
      );
      setCopy(data);
    } catch {
      setError('文案生成失败，请检查 API / AI 服务是否启动。');
    } finally {
      setLoading(null);
    }
  };

  const generateImage = async () => {
    if (!ensureToken()) return;
    setLoading('image');
    setError('');
    try {
      const { data } = await axios.post(
        `${apiBase}/api/ai/generate-image`,
        { prompt: topic, style: '插画', ratio: '9:16', resolution: '1024x1792' },
        { headers: authHeaders }
      );
      setImageUrl(data.image_url || '');
    } catch {
      setError('图片生成失败，请检查 API / AI 服务是否启动。');
    } finally {
      setLoading(null);
    }
  };

  const generateVideo = async () => {
    if (!ensureToken()) return;
    setLoading('video');
    setError('');
    try {
      const { data } = await axios.post(
        `${apiBase}/api/ai/generate-video`,
        { prompt: topic, duration: '10', ratio: '9:16', fps: 30, style: '电影感', camera_motion: '推进' },
        { headers: authHeaders }
      );
      setVideoUrl(data.video_url || '');
    } catch {
      setError('视频生成失败，请检查 API / AI 服务是否启动。');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-2 text-3xl font-bold">AI内容自动生产平台</h1>
      <p className="mb-2 text-slate-500">接入 API 服务（3000）与 AI 服务（8000）的中文 Web 用户端。</p>
      <div className="mb-6 text-sm text-slate-600">
        API状态：<span className="font-semibold">{apiHealth}</span> ｜ AI状态：<span className="font-semibold">{aiHealth}</span>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          className="min-w-[260px] flex-1 rounded border border-slate-300 px-4 py-2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="请输入主题，例如：好运金莲花"
        />
        <button onClick={loginDemo} className="rounded bg-slate-700 px-4 py-2 text-white">
          {loading === 'login' ? '登录中...' : token ? '已登录演示账号' : '登录演示账号'}
        </button>
        <button onClick={generateCopy} className="rounded bg-blue-600 px-4 py-2 text-white">
          {loading === 'copy' ? '生成中...' : '生成文案'}
        </button>
        <button onClick={generateImage} className="rounded bg-emerald-600 px-4 py-2 text-white">
          {loading === 'image' ? '生成中...' : '生成图片'}
        </button>
        <button onClick={generateVideo} className="rounded bg-purple-600 px-4 py-2 text-white">
          {loading === 'video' ? '生成中...' : '生成视频'}
        </button>
      </div>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border border-slate-200 p-4">
          <h2 className="mb-3 text-lg font-semibold">文案结果</h2>
          {copy ? (
            <div className="space-y-2 text-sm">
              <p><strong>标题：</strong>{copy.title}</p>
              <p><strong>脚本：</strong>{copy.script}</p>
              <p><strong>标签：</strong>{copy.hashtags?.join(' ')}</p>
              <p><strong>描述：</strong>{copy.description}</p>
            </div>
          ) : (
            <p className="text-slate-400">暂无结果</p>
          )}
        </div>

        <div className="rounded border border-slate-200 p-4">
          <h2 className="mb-3 text-lg font-semibold">图片结果</h2>
          {imageUrl ? (
            <div className="space-y-3 text-sm">
              <p className="break-all">{imageUrl}</p>
              <a className="inline-block rounded bg-slate-800 px-3 py-2 text-white" href={imageUrl} target="_blank" rel="noreferrer">
                下载图片
              </a>
            </div>
          ) : (
            <p className="text-slate-400">暂无结果</p>
          )}
        </div>

        <div className="rounded border border-slate-200 p-4">
          <h2 className="mb-3 text-lg font-semibold">视频结果</h2>
          {videoUrl ? (
            <div className="space-y-3 text-sm">
              <p className="break-all">{videoUrl}</p>
              <a className="inline-block rounded bg-slate-800 px-3 py-2 text-white" href={videoUrl} target="_blank" rel="noreferrer">
                下载视频
              </a>
            </div>
          ) : (
            <p className="text-slate-400">暂无结果</p>
          )}
        </div>
      </div>
    </div>
  );
}
