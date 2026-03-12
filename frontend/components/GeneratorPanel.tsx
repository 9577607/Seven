'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import axios from 'axios';

type CopyCandidate = { id: string; title: string; script: string; hashtags: string[]; description: string };
type ImageCandidate = { id: string; image_url: string };
type VideoCandidate = { id: string; name: string; video_url: string };

type Step = 1 | 2 | 3 | 4 | 5;

const steps = ['主题输入', '文案选择', '图片选择', '视频生成', '字幕处理', '导出视频'];

export default function GeneratorPanel() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const [topic, setTopic] = useState('金莲花好运视频');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const [copyCandidates, setCopyCandidates] = useState<CopyCandidate[]>([]);
  const [selectedCopy, setSelectedCopy] = useState<CopyCandidate | null>(null);

  const [imageCandidates, setImageCandidates] = useState<ImageCandidate[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageCandidate | null>(null);

  const [videoCandidates, setVideoCandidates] = useState<VideoCandidate[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoCandidate | null>(null);

  const [subtitleMode, setSubtitleMode] = useState<'自动字幕' | '手动字幕' | '无字幕' | ''>('');
  const [finalVideoUrl, setFinalVideoUrl] = useState('');

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loginDemo = async () => {
    setLoading('login');
    setError('');
    try {
      await axios.post(`${apiBase}/api/auth/register`, {
        email: 'demo@autocontent.ai',
        password: '123456',
        nickname: '演示用户',
      });
    } catch {
      // ignore
    }

    try {
      const { data } = await axios.post(`${apiBase}/api/auth/login`, {
        email: 'demo@autocontent.ai',
        password: '123456',
      });
      setToken(data.token || '');
    } catch {
      setError('登录失败，请先确认 API 服务可用。');
    } finally {
      setLoading('');
    }
  };

  const ensureToken = () => {
    if (!token) {
      setError('请先登录演示账号。');
      return false;
    }
    return true;
  };

  const generateCopyCandidates = async () => {
    if (!ensureToken()) return;
    setLoading('copy');
    setError('');
    try {
      const jobs = Array.from({ length: 5 }).map((_, idx) =>
        axios.post(
          `${apiBase}/api/ai/generate-copy`,
          {
            topic: `${topic} 方向${idx + 1}`,
            style: ['治愈', '励志', '国风', '温暖', '故事'][idx],
            platform: '抖音',
            length: '30s',
            language: 'zh',
          },
          { headers: authHeaders },
        ),
      );

      const results = await Promise.all(jobs);
      const candidates = results.map((res: { data: Omit<CopyCandidate, "id"> }, idx: number) => ({ id: `copy-${idx + 1}`, ...res.data }));
      setCopyCandidates(candidates);
      setSelectedCopy(null);
      setStep(2);
    } catch {
      setError('文案候选生成失败。');
    } finally {
      setLoading('');
    }
  };

  const confirmCopy = (item: CopyCandidate) => {
    setSelectedCopy(item);
    setStep(3);
  };

  const generateImageCandidates = async () => {
    if (!selectedCopy || !ensureToken()) return;
    setLoading('image');
    setError('');
    try {
      const count = 5;
      const jobs = Array.from({ length: count }).map((_, idx) =>
        axios.post(
          `${apiBase}/api/ai/generate-image`,
          {
            prompt: `${selectedCopy.title} 场景${idx + 1}`,
            style: ['插画', '写实', '电影感', '国潮', '极简'][idx % 5],
            ratio: '9:16',
            resolution: '1024x1792',
          },
          { headers: authHeaders },
        ),
      );
      const results = await Promise.all(jobs);
      const candidates = results.map((res: { data: { image_url: string } }, idx: number) => ({ id: `image-${idx + 1}`, image_url: res.data.image_url }));
      setImageCandidates(candidates);
      setSelectedImage(null);
    } catch {
      setError('图片候选生成失败。');
    } finally {
      setLoading('');
    }
  };

  const confirmImage = (item: ImageCandidate) => {
    setSelectedImage(item);
    setStep(4);
  };

  const generateVideoCandidates = async () => {
    if (!selectedCopy || !selectedImage || !ensureToken()) return;
    setLoading('video');
    setError('');

    const templates = [
      { name: '竖屏 9:16 标准版', ratio: '9:16', style: '标准', camera_motion: '稳定' },
      { name: '竖屏 9:16 带字幕版', ratio: '9:16', style: '字幕增强', camera_motion: '推进' },
      { name: '竖屏 9:16 无字幕版', ratio: '9:16', style: '纯净画面', camera_motion: '平移' },
      { name: '竖屏 9:16 轻音乐版', ratio: '9:16', style: '轻音乐氛围', camera_motion: '拉远' },
    ];

    try {
      const jobs = templates.map((tpl) =>
        axios.post(
          `${apiBase}/api/ai/generate-video`,
          {
            prompt: `${selectedCopy.script}；主视觉：${selectedImage.image_url}；模板：${tpl.name}`,
            duration: '10',
            ratio: tpl.ratio,
            fps: 30,
            style: tpl.style,
            camera_motion: tpl.camera_motion,
          },
          { headers: authHeaders },
        ),
      );

      const results = await Promise.all(jobs);
      const candidates = results.map((res: { data: { video_url: string } }, idx: number) => ({
        id: `video-${idx + 1}`,
        name: templates[idx].name,
        video_url: res.data.video_url,
      }));
      setVideoCandidates(candidates);
      setSelectedVideo(null);
    } catch {
      setError('视频候选生成失败。');
    } finally {
      setLoading('');
    }
  };

  const confirmVideo = (item: VideoCandidate) => {
    setSelectedVideo(item);
    setStep(5);
  };

  const buildFinalVideo = async (mode: '自动字幕' | '手动字幕' | '无字幕') => {
    if (!selectedVideo || !ensureToken()) return;
    setSubtitleMode(mode);
    setLoading('subtitle');
    setError('');

    try {
      let url = selectedVideo.video_url;
      if (mode === '自动字幕') {
        const { data } = await axios.post(
          `${apiBase}/api/video/subtitle`,
          { video_url: selectedVideo.video_url },
          { headers: authHeaders },
        );
        url = data.video_url || selectedVideo.video_url;
      }
      if (mode === '手动字幕') {
        url = `${selectedVideo.video_url}?manual_subtitle=true`;
      }
      if (mode === '无字幕') {
        url = `${selectedVideo.video_url}?subtitle=none`;
      }

      setFinalVideoUrl(url);

      await axios.post(
        `${apiBase}/api/workflow/production-records`,
        {
          topic,
          copy: selectedCopy?.title || '',
          image_url: selectedImage?.image_url || '',
          video_url: url,
          subtitle_mode: mode,
        },
        { headers: authHeaders },
      );
    } catch {
      setError('字幕处理或记录保存失败。');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-3 text-3xl font-bold">AI内容自动生产平台</h1>
      <p className="mb-4 text-slate-600">流程：主题输入 → 文案选择 → 图片选择 → 视频生成 → 字幕处理 → 导出视频（人工逐步确认）</p>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        {steps.map((item, idx) => {
          const current = idx + 1;
          const active = step >= current;
          return (
            <span key={item} className={`rounded px-3 py-1 ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {current}. {item}
            </span>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          className="min-w-[260px] flex-1 rounded border border-slate-300 px-4 py-2"
          value={topic}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
          placeholder="请输入主题，例如：金莲花好运视频"
        />
        <button className="rounded bg-slate-700 px-4 py-2 text-white" onClick={loginDemo}>
          {loading === 'login' ? '登录中...' : token ? '已登录' : '登录演示账号'}
        </button>
        <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={generateCopyCandidates}>
          {loading === 'copy' ? '生成中...' : '第一步：生成5条文案'}
        </button>
      </div>

      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

      {step >= 2 && (
        <section className="mb-6 rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">第二步：选择文案（5选1）</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {copyCandidates.map((c) => (
              <button key={c.id} className="rounded border p-3 text-left hover:bg-slate-50" onClick={() => confirmCopy(c)}>
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-slate-600">{c.script}</p>
              </button>
            ))}
          </div>
          {selectedCopy && <p className="mt-3 text-green-700">已选择：{selectedCopy.title}</p>}
        </section>
      )}

      {step >= 3 && (
        <section className="mb-6 rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">第三步：生成并选择图片（4~6选1）</h2>
          <button className="mb-3 rounded bg-emerald-600 px-4 py-2 text-white" onClick={generateImageCandidates}>
            {loading === 'image' ? '生成中...' : '生成5张候选图片'}
          </button>
          <div className="grid gap-3 md:grid-cols-2">
            {imageCandidates.map((img) => (
              <button key={img.id} className="rounded border p-3 text-left hover:bg-slate-50" onClick={() => confirmImage(img)}>
                <p className="break-all text-sm">{img.image_url}</p>
              </button>
            ))}
          </div>
          {selectedImage && <p className="mt-3 text-green-700">已选择图片：{selectedImage.image_url}</p>}
        </section>
      )}

      {step >= 4 && (
        <section className="mb-6 rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">第四步：生成并选择视频模板</h2>
          <button className="mb-3 rounded bg-purple-600 px-4 py-2 text-white" onClick={generateVideoCandidates}>
            {loading === 'video' ? '生成中...' : '生成多个视频版本'}
          </button>
          <div className="grid gap-3 md:grid-cols-2">
            {videoCandidates.map((v) => (
              <button key={v.id} className="rounded border p-3 text-left hover:bg-slate-50" onClick={() => confirmVideo(v)}>
                <p className="font-semibold">{v.name}</p>
                <p className="break-all text-sm">{v.video_url}</p>
              </button>
            ))}
          </div>
          {selectedVideo && <p className="mt-3 text-green-700">已选择视频：{selectedVideo.name}</p>}
        </section>
      )}

      {step >= 5 && (
        <section className="mb-6 rounded border p-4">
          <h2 className="mb-3 text-lg font-semibold">第五步：字幕处理</h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded bg-indigo-600 px-4 py-2 text-white" onClick={() => buildFinalVideo('自动字幕')}>
              {loading === 'subtitle' && subtitleMode === '自动字幕' ? '处理中...' : '自动字幕'}
            </button>
            <button className="rounded bg-indigo-500 px-4 py-2 text-white" onClick={() => buildFinalVideo('手动字幕')}>
              {loading === 'subtitle' && subtitleMode === '手动字幕' ? '处理中...' : '手动字幕'}
            </button>
            <button className="rounded bg-slate-700 px-4 py-2 text-white" onClick={() => buildFinalVideo('无字幕')}>
              {loading === 'subtitle' && subtitleMode === '无字幕' ? '处理中...' : '无字幕'}
            </button>
          </div>
        </section>
      )}

      {finalVideoUrl && (
        <section className="rounded border border-green-200 bg-green-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-green-800">第六步：导出视频</h2>
          <p className="mb-2 break-all text-sm text-green-900">最终视频地址：{finalVideoUrl}</p>
          <a className="mr-3 inline-block rounded bg-green-700 px-4 py-2 text-white" href={finalVideoUrl} target="_blank" rel="noreferrer">
            下载视频
          </a>
          <span className="text-sm text-orange-700">提示：请手动发布到抖音（系统不自动发布）。</span>
        </section>
      )}
    </div>
  );
}
