import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '髭オクラたたき！',
  description: '出てくる髭面のオクラをひたすら叩くゲーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
