import React from 'react';
import Link from 'next/link';

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-amber-50 py-8 px-4 text-gray-800">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 border-4 border-green-600 shadow-xl space-y-6">
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-black text-green-700">⭐ オクラたたき｜遊び方・図鑑ガイド</h1>
          <p className="text-xs text-gray-500 mt-1">〜ベジタブル王国の再生ストーリー＆攻略のコツ〜</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-lg">
            📖 物語のあらすじ
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            かつて緑豊かだったベジタブル王国は、干ばつの呪いによって大地が乾き、野菜たちが土の中で眠りについてしまいました。プレイヤーは畑の開墾者となり、タイミングよく顔を出す野菜たちを叩いて目を覚まし、4つの「神秘の種」を集めて天空の『野菜の王様』へ黄金の収穫祭を取り戻す旅に出ます。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-green-800 bg-green-100 px-3 py-1 rounded-lg">
            🎮 基本ルールとステージ構成
          </h2>
          <ul className="text-sm space-y-1.5 list-disc pl-5 text-gray-700">
            <li><strong>全5章・全25ステージ構成</strong>：各章ごとに異なる地域の畑と野菜が登場します。</li>
            <li><strong>Stage 1〜3（即クリアモード）</strong>：目標スコアに到達した瞬間にステージクリアとなります。</li>
            <li><strong>Stage 4〜5（サバイバルモード）</strong>：制限時間0秒になるまで目標スコアを維持し続ける必要があります。</li>
            <li><strong>FEVERタイム</strong>：空振りや見逃しをせずに10コンボ以上つなげると獲得スコアが2倍になります。</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-orange-800 bg-orange-100 px-3 py-1 rounded-lg">
            🌱 登場エリア・野菜とお邪魔キャラ図鑑
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p className="font-black text-green-700">第1章：日本の里山（髭オクラ）</p>
              <p className="mt-0.5">叩くと白い丸い種が星型に弾け飛びます。お邪魔キャラは「イモムシ」（叩くと減点＆コンボ消滅）。</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="font-black text-red-700">第2章：日本の畑（真っ赤なトマト）</p>
              <p className="mt-0.5">叩くと真っ赤な果汁と黄色い種が飛び散ります。お邪魔キャラは「テントウムシ」（減点）。</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
              <p className="font-black text-orange-700">第3章：世界の荒野（メキシカン唐辛子）</p>
              <p className="mt-0.5">叩くと炎の火花が爆発します。お邪魔キャラは「サボテンベビー」（トゲが刺さり1秒間タップ不能）。</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="font-black text-emerald-700">第4章：南国の楽園（スイカ大王）</p>
              <p className="mt-0.5">叩くと黒い種が四方八方へ飛び散ります。お邪魔キャラは「ヤシガニ」（減点）。</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-300">
              <p className="font-black text-amber-800">最終章：天空の王宮（野菜の王様＆全野菜）</p>
              <p className="mt-0.5">これまでの全野菜が総登場！クリアすると無限に遊べる「黄金の収穫祭モード」が解放されます。</p>
            </div>
          </div>
        </section>

        <div className="pt-2 text-center">
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
