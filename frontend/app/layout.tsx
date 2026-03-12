import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI内容自动生产平台',
  description: 'AutoContent 用户前端'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
