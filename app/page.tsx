'use client';

import React, { useState, useEffect, useRef } from 'react';

type HoleState = {
  id: number;
  isUp: boolean;
  isHit: boolean;
  burstKey: number;
};

// 5方向（星型の頂点角度：-90°, -18°, 54°, 126°, 198°）へ飛び散る種の座標ベクトル
const STAR_VECTORS = [
  { tx: '0px', ty: '-54px' },
  { tx: '51px', ty: '-17px' },
  { tx: '32px', ty: '44px' },
  { tx: '-32px', ty: '44px' },
  { tx: '-51px', ty: '-17px' },
];

export default function OkuraTatakiPage() {
  const [holes, setHoles] = useState<HoleState[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, isUp: false, isHit: false, burstKey: 0 }))
  );
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popTimerRef = useRef<NodeJS.Timeout | null>(null);

  // コンボ連動でピッチが上がる爽快ヒット音（Web Audio API）
  const playHitSound = (currentCombo: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // メインの打撃音（コンボに応じて音程上昇）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = Math.min(280 + currentCombo * 28, 880);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);

      // 5コンボ以上の時はキラキラ高音レイヤーを追加
      if (currentCombo >= 5) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
        subGain.gain.setValueAtTime(0.18, ctx.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start();
        subOsc.stop(ctx.currentTime + 0.14);
      }
    } catch {
      // 音声ブロック環境は無視
    }
  };

  // ゲーム開始
  const startGame = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    setHoles(
      Array.from({ length: 9 }, (_, i) => ({ id: i, isUp: false, isHit: false, burstKey: 0 }))
    );
  };

  // カウントダウンタイマー
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsGameOver(true);
          setHoles((h) => h.map((hole) => ({ ...hole, isUp: false, isHit: false })));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // オクラランダム出現ループ
  useEffect(() => {
    if (!isPlaying) return;

    const popUp = () => {
      const randomIdx = Math.floor(Math.random() * 9);
      const stayDuration = Math.floor(Math.random() * 450) + 600;

      setHoles((prev) =>
        prev.map((hole, idx) =>
          idx === randomIdx ? { ...hole, isUp: true, isHit: false } : hole
        )
      );

      setTimeout(() => {
        setHoles((prev) =>
          prev.map((hole, idx) => {
            if (idx === randomIdx) {
              // 叩かれずに引っ込んだらコンボリセット
              if (hole.isUp && !hole.isHit) {
                setCombo(0);
              }
              return { ...hole, isUp: false, isHit: false };
            }
            return hole;
          })
        );
      }, stayDuration);

      const nextInterval = Math.floor(Math.random() * 350) + 400;
      popTimerRef.current = setTimeout(popUp, nextInterval);
    };

    popUp();

    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, [isPlaying]);

  // タップで叩く処理
  const handleWhack = (id: number) => {
    if (!isPlaying) return;

    let hitSucceeded = false;

    setHoles((prev) =>
      prev.map((hole) => {
        if (hole.id === id && hole.isUp && !hole.isHit) {
          hitSucceeded = true;
          return { ...hole, isHit: true, burstKey: hole.burstKey + 1 };
        }
        return hole;
      })
    );

    if (hitSucceeded) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));

      // フィーバー（10コンボ以上）はスコア2倍＋コンボボーナス
      const isFever = nextCombo >= 10;
      const gained = (isFever ? 20 : 10) + Math.min(nextCombo * 2, 30);
      setScore((s) => s + gained);

      playHitSound(nextCombo);

      // 画面シェイク発火
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 120);
    } else {
      // 空振りしたらコンボリセット
      setCombo(0);
    }
  };

  const isFever = isPlaying && combo >= 10;

  return (
    <main
      className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-center p-4 select-none ${
        isFever ? 'bg-amber-200' : 'bg-amber-50'
      }`}
    >
      {/* 星型バースト ＆ 画面シェイク用アニメーション定義 */}
      <style>{`
        @keyframes seed-star-burst {
          0% {
            transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.4) rotate(180deg);
            opacity: 0;
          }
        }
        @keyframes board-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-4px, 3px) rotate(-0.8deg); }
          50% { transform: translate(4px, -3px) rotate(0.8deg); }
          75% { transform: translate(-3px, -2px) rotate(-0.4deg); }
        }
        @keyframes pop-score {
          0% { transform: translateY(0) scale(0.7); opacity: 1; }
          100% { transform: translateY(-28px) scale(1.25); opacity: 0; }
        }
        .animate-seed-burst {
          animation: seed-star-burst 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-board-shake {
          animation: board-shake 0.12s ease-in-out;
        }
        .animate-pop-score {
          animation: pop-score 0.45s ease-out forwards;
        }
      `}</style>

      <div
        className={`max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 border-4 transition-all ${
          isFever
            ? 'border-yellow-400 ring-4 ring-yellow-300/70'
            : 'border-green-600'
        } ${isShaking ? 'animate-board-shake' : ''}`}
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-extrabold text-green-700">
            🥒 髭オクラたたき！
          </h1>
          {isFever && (
            <span className="px-2.5 py-0.5 text-xs font-black bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full animate-bounce shadow">
              🔥 FEVER 2倍！
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">
          連続ヒットで種が星型に弾け飛ぶ！コンボを繋げろ！
        </p>

        {/* スコア・コンボ・残り時間 */}
        <div className="grid grid-cols-3 gap-2 bg-green-100 rounded-xl px-3 py-3 mb-5 border border-green-300">
          <div className="text-center">
            <span className="block text-[11px] font-bold text-green-800">スコア</span>
            <span className="text-xl font-black text-green-700">{score}</span>
          </div>
          <div className="text-center border-x border-green-300">
            <span className="block text-[11px] font-bold text-orange-700">コンボ</span>
            <span
              className={`text-xl font-black transition-transform inline-block ${
                combo >= 5 ? 'text-orange-600 scale-110' : 'text-gray-700'
              }`}
            >
              {combo}
              <span className="text-xs ml-0.5">連鎖</span>
            </span>
          </div>
          <div className="text-center">
            <span className="block text-[11px] font-bold text-red-800">のこり時間</span>
            <span
              className={`text-xl font-black ${
                timeLeft <= 5 && isPlaying ? 'text-red-600 animate-pulse' : 'text-gray-800'
              }`}
            >
              {timeLeft}秒
            </span>
          </div>
        </div>

        {/* 3x3 穴グリッド */}
        <div className="grid grid-cols-3 gap-3 bg-amber-800 p-4 rounded-2xl shadow-inner mb-6">
          {holes.map((hole) => (
            <div key={hole.id} className="relative h-24 w-full">
              <button
                type="button"
                onPointerDown={() => handleWhack(hole.id)}
                className="relative h-full w-full bg-amber-950 rounded-full overflow-hidden border-4 border-amber-900 focus:outline-none active:scale-90 transition-transform touch-manipulation"
              >
                {/* 髭面の男顔オクラ（SVGイラスト） */}
                <div
                  className={`absolute inset-x-0 bottom-0 flex justify-center transition-transform duration-100 ${
                    hole.isUp ? 'translate-y-1' : 'translate-y-24'
                  } ${hole.isHit ? 'scale-110' : 'scale-100'}`}
                >
                  <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
                    {/* オクラ本体 */}
                    <path
                      d="M50 5 C32 25, 22 60, 25 105 L75 105 C78 60, 68 25, 50 5 Z"
                      fill={hole.isHit ? '#facc15' : '#22c55e'}
                      stroke={hole.isHit ? '#ea580c' : '#15803d'}
                      strokeWidth="3"
                    />
                    {/* オクラの筋 */}
                    <path
                      d="M50 5 L42 105 M50 5 L58 105"
                      stroke="#16a34a"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    {/* 太眉 */}
                    <path
                      d="M32 46 L45 50 M68 46 L55 50"
                      stroke="#1f2937"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    {/* 目（ヒット時は＞＜） */}
                    {hole.isHit ? (
                      <>
                        <path
                          d="M35 54 L43 58 L35 62"
                          fill="none"
                          stroke="#1f2937"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d="M65 54 L57 58 L65 62"
                          fill="none"
                          stroke="#1f2937"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <circle cx="40" cy="57" r="3.5" fill="#1f2937" />
                        <circle cx="60" cy="57" r="3.5" fill="#1f2937" />
                      </>
                    )}
                    {/* 豪快な口ひげ・あごひげ */}
                    <path
                      d="M33 70 Q50 63 67 70 Q62 76 50 73 Q38 76 33 70 Z"
                      fill="#1f2937"
                    />
                    <path
                      d="M32 75 Q30 92 50 96 Q70 92 68 75 Q60 85 50 85 Q40 85 32 75 Z"
                      fill="#374151"
                    />
                    {/* 口 */}
                    <ellipse
                      cx="50"
                      cy="79"
                      rx="6"
                      ry={hole.isHit ? '6' : '3'}
                      fill="#991b1b"
                    />
                  </svg>
                </div>
              </button>

              {/* ヒット時の星型（5方向）種バースト ＆ ポップ演出（穴の外枠にも飛び出すように配置） */}
              {hole.burstKey > 0 && (
                <div
                  key={hole.burstKey}
                  className="pointer-events-none absolute inset-0 z-20"
                >
                  {/* 中心の星型フラッシュ */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-pop-score">
                    ⭐
                  </div>
                  {/* 5方向へ弾け飛ぶオクラの種 */}
                  {STAR_VECTORS.map((vec, i) => (
                    <span
                      key={i}
                      style={
                        {
                          '--tx': vec.tx,
                          '--ty': vec.ty,
                        } as React.CSSProperties
                      }
                      className="animate-seed-burst absolute left-1/2 top-1/2 w-3.5 h-4.5 rounded-full bg-lime-100 border-2 border-green-600 shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* コントロールボタン */}
        {!isPlaying && (
          <div className="text-center">
            {isGameOver && (
              <div className="bg-amber-100 border border-amber-300 rounded-xl p-3 mb-3">
                <p className="text-lg font-black text-green-800">
                  終了！最終スコア：{score}点
                </p>
                <p className="text-xs font-bold text-orange-700 mt-0.5">
                  最大コンボ：{maxCombo}連鎖！
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={startGame}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-lg rounded-xl shadow-md transition-colors"
            >
              {isGameOver ? 'もう一回遊ぶ！' : 'スタート！'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
