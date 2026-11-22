'use client';

import React, { useState, useEffect, useRef } from 'react';

type HoleState = {
  id: number;
  isUp: boolean;
  isHit: boolean;
};

export default function OkuraTatakiPage() {
  const [holes, setHoles] = useState<HoleState[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, isUp: false, isHit: false }))
  );
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 簡易効果音（Web Audio API）
  const playHitSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // 音声ブロック環境は無視
    }
  };

  // ゲーム開始
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    setHoles(Array.from({ length: 9 }, (_, i) => ({ id: i, isUp: false, isHit: false })));
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
      const stayDuration = Math.floor(Math.random() * 500) + 650;

      setHoles((prev) =>
        prev.map((hole, idx) =>
          idx === randomIdx ? { ...hole, isUp: true, isHit: false } : hole
        )
      );

      setTimeout(() => {
        setHoles((prev) =>
          prev.map((hole, idx) =>
            idx === randomIdx ? { ...hole, isUp: false, isHit: false } : hole
          )
        );
      }, stayDuration);

      const nextInterval = Math.floor(Math.random() * 400) + 450;
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

    setHoles((prev) =>
      prev.map((hole) => {
        if (hole.id === id && hole.isUp && !hole.isHit) {
          playHitSound();
          setScore((s) => s + 10);
          return { ...hole, isHit: true };
        }
        return hole;
      })
    );
  };

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border-4 border-green-600">
        <h1 className="text-2xl font-extrabold text-center text-green-700 mb-2">
          🥒 髭オクラたたき！
        </h1>
        <p className="text-xs text-center text-gray-500 mb-4">
          出てくる髭面のオクラをひたすら叩け！
        </p>

        {/* スコア＆残り時間 */}
        <div className="flex justify-between items-center bg-green-100 rounded-xl px-5 py-3 mb-6 border border-green-300">
          <div className="text-center">
            <span className="block text-xs font-bold text-green-800">スコア</span>
            <span className="text-2xl font-black text-green-700">{score}</span>
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-red-800">のこり時間</span>
            <span className={`text-2xl font-black ${timeLeft <= 5 && isPlaying ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
              {timeLeft}秒
            </span>
          </div>
        </div>

        {/* 3x3 穴グリッド */}
        <div className="grid grid-cols-3 gap-3 bg-amber-800 p-4 rounded-2xl shadow-inner mb-6">
          {holes.map((hole) => (
            <button
              key={hole.id}
              type="button"
              onClick={() => handleWhack(hole.id)}
              className="relative h-24 w-full bg-amber-950 rounded-full overflow-hidden border-4 border-amber-900 focus:outline-none active:scale-95 transition-transform"
            >
              {/* 髭面の男顔オクラ（SVGイラスト） */}
              <div
                className={`absolute inset-x-0 bottom-0 flex justify-center transition-transform duration-150 ${
                  hole.isUp ? 'translate-y-1' : 'translate-y-24'
                }`}
              >
                <svg viewBox="0 0 100 110" className="w-20 h-22">
                  {/* オクラ本体 */}
                  <path
                    d="M50 5 C32 25, 22 60, 25 105 L75 105 C78 60, 68 25, 50 5 Z"
                    fill={hole.isHit ? '#ef4444' : '#22c55e'}
                    stroke="#15803d"
                    strokeWidth="3"
                  />
                  {/* オクラの筋 */}
                  <path d="M50 5 L42 105 M50 5 L58 105" stroke="#16a34a" strokeWidth="1.5" opacity="0.6" />
                  {/* 太眉 */}
                  <path d="M32 46 L45 50 M68 46 L55 50" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                  {/* 目（ヒット時は＞＜） */}
                  {hole.isHit ? (
                    <>
                      <path d="M35 54 L43 58 L35 62" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                      <path d="M65 54 L57 58 L65 62" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
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
                  <ellipse cx="50" cy="79" rx="6" ry={hole.isHit ? '6' : '3'} fill="#991b1b" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* コントロールボタン */}
        {!isPlaying && (
          <div className="text-center">
            {isGameOver && (
              <p className="text-lg font-bold text-green-700 mb-3">
                終了！最終スコア：{score}点
              </p>
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
