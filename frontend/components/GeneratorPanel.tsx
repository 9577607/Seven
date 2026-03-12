'use client';

import { useState } from 'react';
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
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const aiBase = process.env.NEXT_PUBLIC_AI_BASE_URL || 'http://localhost:8000';

  const generateCopy = async () => {
    setLoading('copy');
    setError('');
    try {
      const { data } = await axios.post(`${aiBase}/generate/copy`, {
        topic,
        style: '治愈风',
        platform: '抖音',
        length: '30s',
        language: 'zh'
      });
      setCopy(data);
    } catch (e) {
      setError('文案生成失败，请检查 AI 服务是否启动。');
    } finally {
      setLoading(null);
    }
  };

  const generateImage = async () => {
    setLoading('image');
    setError('');
    try {
      const { data } = await axios.post(`${aiBase}/generate/image`, {
        prompt: topic,
        style: '插画',
        ratio: '9:16',
        resolution: '1024x1792'
      });
      setImageUrl(data.image_url || '');
    } catch (e) {
      setError('图片生成失败，请检查 AI 服务是否启动。');
    } finally {
      setLoading(null);
    }
  };

  const generateVideo = async () => {
    setLoading('video');
    setError('');
    try {
      const { data } = await axios.post(`${aiBase}/generate/video`, {
        prompt: topic,
        duration: '10',
        ratio: '9:16',
        fps: 30,
        style: '电影感',
        camera_motion: '推进'
      });
      setVideoUrl(data.video_url || '');
    } catch (e) {
      setError('视频生成失败，请检查 AI 服务是否启动。');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-2 text-3xl font-bold">AI内容自动生产平台</h1>
      <p className="mb-6 text-slate-500">输入一个主题，一键生成文案、图片和视频。</p>

      <div className="mb-6 flex gap-3">
        <input
          className="flex-1 rounded border border-slate-300 px-4 py-2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="请输入主题，例如：好运金莲花"
        />
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
              <a className="inline-block rounded bg-slate-800 px-3 py-2 text-white" href={imageUrl} target="_blank">
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
              <a className="inline-block rounded bg-slate-800 px-3 py-2 text-white" href={videoUrl} target="_blank">
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
