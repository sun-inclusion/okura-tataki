import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-amber-50 py-8 px-4 text-gray-800">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 border-4 border-green-600 shadow-xl space-y-5">
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-xl font-black text-green-700">プライバシーポリシー・免責事項</h1>
          <p className="text-xs text-gray-500 mt-1">運営：株式会社SUN</p>
        </div>

        <section className="space-y-1.5 text-xs leading-relaxed text-gray-700">
          <h2 className="text-sm font-black text-gray-900">1. 個人情報の取得について</h2>
          <p>
            当ゲームアプリ（以下「本サービス」）は、ブラウザ上で完結する無料Webゲームであり、ユーザーの氏名・住所・電話番号・メールアドレス等の個人情報を収集・保存することはありません。
          </p>
        </section>

        <section className="space-y-1.5 text-xs leading-relaxed text-gray-700">
          <h2 className="text-sm font-black text-gray-900">2. 広告の配信について</h2>
          <p>
            本サービスでは、第三者配信の広告サービス（Google AdSense、忍者AdMax等）を利用する場合があります。これらの広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセスに関する情報（Cookie等。氏名・住所・メール・電話番号は含まれません）を使用することがあります。
          </p>
        </section>

        <section className="space-y-1.5 text-xs leading-relaxed text-gray-700">
          <h2 className="text-sm font-black text-gray-900">3. 免責事項</h2>
          <p>
            本サービスの利用により生じた損害（端末の動作不良、通信料の発生、広告リンク先でのトラブル等）について、運営者（株式会社SUN）は一切の責任を負いかねます。また、本サービスの内容は予告なく変更・終了する場合があります。
          </p>
        </section>

        <section className="space-y-1.5 text-xs leading-relaxed text-gray-700">
          <h2 className="text-sm font-black text-gray-900">4. 著作権について</h2>
          <p>
            本サービスに掲載されているイラスト・プログラム・テキスト等の著作権は株式会社SUNに帰属します。無断転載・無断複製を禁じます。
          </p>
        </section>

        <div className="pt-3 text-center">
          <Link
            href="/"
            className="inline-block w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow"
          >
            ← ゲーム画面へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
