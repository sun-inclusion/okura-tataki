'use client';

import React, { useState, useEffect, useRef } from 'react';

type CharacterType = 'okura' | 'king_okura' | 'caterpillar';

type HoleState = {
  id: number;
  isUp: boolean;
  isHit: boolean;
  charType: CharacterType;
  burstKey: number;
  burstType: 'star' | 'warn';
};

type StageConfig = {
  stage: number;
  title: string;
  targetScore: number;
  timeLimit: number;
  popIntervalMin: number;
  popIntervalMax: number;
  stayMin: number;
  stayMax: number;
  caterpillarRate: number; // お邪魔イモムシ出現率
  kingRate: number; // 金のボスオクラ出現率
  farmLabel: string;
  farmIcons: string[];
  farmBgClass: string;
};

const STAGES: StageConfig[] = [
  {
    stage: 1,
    title: 'Stage 1：荒れ地の開墾',
    targetScore: 150,
    timeLimit: 20,
    popIntervalMin: 480,
    popIntervalMax: 800,
    stayMin: 700,
    stayMax: 1100,
    caterpillarRate: 0.12,
    kingRate: 0.05,
    farmLabel: '現在の畑：荒れ地（クリアで黒土の畑に！）',
    farmIcons: ['🪨', '🏜️', '🪨', '🏜️', '🪨'],
    farmBgClass: 'bg-stone-300 border-stone-500',
  },
  {
    stage: 2,
    title: 'Stage 2：ふかふかの黒土',
    targetScore: 250,
    timeLimit: 20,
    popIntervalMin: 430,
    popIntervalMax: 730,
    stayMin: 650,
    stayMax: 1000,
    caterpillarRate: 0.18,
    kingRate: 0.08,
    farmLabel: '現在の畑：黒土完成！（クリアで新芽が出るで！）',
    farmIcons: ['🟫', '🟫', '🟫', '🟫', '🟫'],
    farmBgClass: 'bg-amber-900/20 border-amber-800',
  },
  {
    stage: 3,
    title: 'Stage 3：小さな新芽',
    targetScore: 350,
    timeLimit: 20,
    popIntervalMin: 380,
    popIntervalMax: 660,
    stayMin: 600,
    stayMax: 920,
    caterpillarRate: 0.22,
    kingRate: 0.12,
    farmLabel: '現在の畑：新芽が発芽！（クリアでふたばに成長！）',
    farmIcons: ['🌱', '🟫', '🌱', '🟫', '🌱'],
    farmBgClass: 'bg-lime-100 border-lime-600',
  },
  {
    stage: 4,
    title: 'Stage 4：元気なふたば',
    targetScore: 480,
    timeLimit: 22,
    popIntervalMin: 340,
    popIntervalMax: 580,
    stayMin: 550,
    stayMax: 850,
    caterpillarRate: 0.25,
    kingRate: 0.15,
    farmLabel: '現在の畑：ふたば成長中！（クリアで黄色い花が咲く！）',
    farmIcons: ['🌿', '🌱', '🌿', '🌱', '🌿'],
    farmBgClass: 'bg-green-100 border-green-600',
  },
  {
    stage: 5,
    title: 'Stage 5：開花＆大収穫祭！',
    targetScore: 650,
    timeLimit: 25,
    popIntervalMin: 300,
    popIntervalMax: 520,
    stayMin: 500,
    stayMax: 800,
    caterpillarRate: 0.28,
    kingRate: 0.25,
    farmLabel: '現在の畑：オクラの花満開！（クリアで豊作＆神秘の種！）',
    farmIcons: ['🌼', '🌿', '🌼', '🌿', '🌼'],
    farmBgClass: 'bg-yellow-100 border-yellow-500',
  },
];

// 5方向（星型の頂点ベクトル）
const STAR_VECTORS = [
  { tx: '0px', ty: '-56px' },
  { tx: '53px', ty: '-18px' },
  { tx: '33px', ty: '45px' },
  { tx: '-33px', ty: '45px' },
  { tx: '-53px', ty: '-18px' },
];

export default function OkuraTatakiPage() {
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [stageScore, setStageScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(STAGES[0].timeLimit);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'stage_clear' | 'all_clear' | 'game_over'>('idle');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [warnMessage, setWarnMessage] = useState<string | null>(null);

  const [holes, setHoles] = useState<HoleState[]>(
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      isUp: false,
      isHit: false,
      charType: 'okura',
      burstKey: 0,
      burstType: 'star',
    }))
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = STAGES[stageIdx];

  // 効果音再生（ヒット音／ボス音／イモムシ警告ブザー）
  const playSound = (type: 'hit' | 'king' | 'bad' | 'clear', currentCombo = 0) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'bad') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        return;
      }

      if (type === 'clear') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          g.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.09);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.09 + 0.2);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + idx * 0.09);
          o.stop(ctx.currentTime + idx * 0.09 + 0.2);
        });
        return;
      }

      const baseFreq = type === 'king' ? 520 : Math.min(280 + currentCombo * 26, 880);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, ctx.currentTime + 0.09);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // 音声ブロック環境は無視
    }
  };

  // ステージ開始（リセットまたは次ステージへ）
  const startStage = (targetIdx: number, resetTotal = false) => {
    const cfg = STAGES[targetIdx];
    setStageIdx(targetIdx);
    if (resetTotal) {
      setTotalScore(0);
      setMaxCombo(0);
    }
    setStageScore(0);
    setCombo(0);
    setTimeLeft(cfg.timeLimit);
    setWarnMessage(null);
    setGameState('playing');
    setHoles(
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        isUp: false,
        isHit: false,
        charType: 'okura',
        burstKey: 0,
        burstType: 'star',
      }))
    );
  };

  // カウントダウン＆クリア判定
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setHoles((h) => h.map((hole) => ({ ...hole, isUp: false, isHit: false })));
          // タイムアップ時のクリア判定は最新の stageScore で行うため state 更新関数内で判定
          setStageScore((currentStageScore) => {
            if (currentStageScore >= currentStage.targetScore) {
              playSound('clear');
              if (stageIdx + 1 < STAGES.length) {
                setGameState('stage_clear');
              } else {
                setGameState('all_clear');
              }
            } else {
              setGameState('game_over');
            }
            return currentStageScore;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, stageIdx, currentStage.targetScore]);

  // キャラクターランダム出現ループ
  useEffect(() => {
    if (gameState !== 'playing') return;

    const popUp = () => {
      const randomIdx = Math.floor(Math.random() * 9);
      const stayDuration =
        Math.floor(Math.random() * (currentStage.stayMax - currentStage.stayMin)) +
        currentStage.stayMin;

      const rand = Math.random();
      let charType: CharacterType = 'okura';
      if (rand < currentStage.caterpillarRate) {
        charType = 'caterpillar';
      } else if (rand < currentStage.caterpillarRate + currentStage.kingRate) {
        charType = 'king_okura';
      }

      setHoles((prev) =>
        prev.map((hole, idx) =>
          idx === randomIdx && !hole.isUp
            ? { ...hole, isUp: true, isHit: false, charType }
            : hole
        )
      );

      setTimeout(() => {
        setHoles((prev) =>
          prev.map((hole, idx) => {
            if (idx === randomIdx) {
              // オクラを見逃したらコンボリセット（イモムシは見逃してOK）
              if (hole.isUp && !hole.isHit && hole.charType !== 'caterpillar') {
                setCombo(0);
              }
              return { ...hole, isUp: false, isHit: false };
            }
            return hole;
          })
        );
      }, stayDuration);

      const nextInterval =
        Math.floor(Math.random() * (currentStage.popIntervalMax - currentStage.popIntervalMin)) +
        currentStage.popIntervalMin;
      popTimerRef.current = setTimeout(popUp, nextInterval);
    };

    popUp();

    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, [gameState, currentStage]);

  // タップで叩く処理
  const handleWhack = (id: number) => {
    if (gameState !== 'playing') return;

    let hitChar: CharacterType | null = null;

    setHoles((prev) =>
      prev.map((hole) => {
        if (hole.id === id && hole.isUp && !hole.isHit) {
          hitChar = hole.charType;
          return {
            ...hole,
            isHit: true,
            burstKey: hole.burstKey + 1,
            burstType: hole.charType === 'caterpillar' ? 'warn' : 'star',
          };
        }
        return hole;
      })
    );

    if (hitChar === 'caterpillar') {
      // お邪魔キャラを叩いたペナルティ
      setCombo(0);
      setStageScore((s) => Math.max(0, s - 30));
      setTotalScore((s) => Math.max(0, s - 30));
      playSound('bad');
      setWarnMessage('🐛 イモムシは叩いちゃダメ！ -30点');
      setTimeout(() => setWarnMessage(null), 900);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 180);
    } else if (hitChar === 'okura' || hitChar === 'king_okura') {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));

      const isFever = nextCombo >= 10;
      const basePoint = hitChar === 'king_okura' ? 35 : 15;
      const gained = (isFever ? basePoint * 2 : basePoint) + Math.min(nextCombo * 2, 30);

      setStageScore((s) => s + gained);
      setTotalScore((s) => s + gained);

      playSound(hitChar === 'king_okura' ? 'king' : 'hit', nextCombo);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 110);
    } else {
      // 空振り
      setCombo(0);
    }
  };

  // LINEでシェアする処理
  const handleLineShare = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const stageText =
      gameState === 'all_clear'
        ? '全5ステージ完全制覇＆神秘の種ゲット！'
        : `Stage ${currentStage.stage}まで到達！`;
    const text = `🥒【オクラたたき】で遊んだよ！\n記録：${totalScore}点（${stageText} / 最大${maxCombo}コンボ）\nオクラを叩いて種を星型に弾き飛ばそう！👇\n${shareUrl}`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank', 'noopener,noreferrer');
  };

  const isFever = gameState === 'playing' && combo >= 10;
  const progressPercent = Math.min(100, Math.round((stageScore / currentStage.targetScore) * 100));

  return (
    <main
      className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-center p-3 select-none ${
        isFever ? 'bg-amber-200' : 'bg-amber-50'
      }`}
    >
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
          100% { transform: translateY(-30px) scale(1.3); opacity: 0; }
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

      {/* 外枠：ステージ進行に合わせて畑が育つフレーム */}
      <div
        className={`max-w-md w-full rounded-3xl p-2.5 border-4 transition-all duration-500 shadow-2xl ${
          currentStage.farmBgClass
        } ${isShaking ? 'animate-board-shake' : ''}`}
      >
        {/* 畑の成長ステータスバー（上部） */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-white/85 rounded-2xl text-xs font-bold text-gray-700 shadow-sm">
          <span>{currentStage.farmLabel}</span>
          <span className="tracking-widest text-sm">{currentStage.farmIcons.join('')}</span>
        </div>

        {/* ゲーム盤面カード */}
        <div
          className={`bg-white rounded-2xl p-5 border-4 transition-all ${
            isFever ? 'border-yellow-400 ring-4 ring-yellow-300/70' : 'border-green-600'
          }`}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-extrabold text-green-700">🥒 オクラたたき</h1>
            {isFever ? (
              <span className="px-2.5 py-0.5 text-xs font-black bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full animate-bounce shadow">
                🔥 FEVER 2倍！
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                {currentStage.title}
              </span>
            )}
          </div>

          {/* 目標スコア進捗ゲージ */}
          <div className="mb-3">
            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
              <span>
                ステージ目標：{stageScore} / {currentStage.targetScore}点
              </span>
              <span>累計：{totalScore}点</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  progressPercent >= 100 ? 'bg-yellow-400' : 'bg-green-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* コンボ・残り時間・警告メッセージ */}
          <div className="grid grid-cols-2 gap-2 bg-green-50 rounded-xl px-3 py-2 mb-4 border border-green-200">
            <div className="text-center border-r border-green-200">
              <span className="block text-[10px] font-bold text-orange-700">コンボ</span>
              <span
                className={`text-lg font-black inline-block ${
                  combo >= 5 ? 'text-orange-600 scale-110' : 'text-gray-700'
                }`}
              >
                {combo}
                <span className="text-xs ml-0.5">連鎖</span>
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold text-red-800">のこり時間</span>
              <span
                className={`text-lg font-black ${
                  timeLeft <= 5 && gameState === 'playing'
                    ? 'text-red-600 animate-pulse'
                    : 'text-gray-800'
                }`}
              >
                {timeLeft}秒
              </span>
            </div>
          </div>

          {/* 警告ポップアップ枠 */}
          <div className="h-5 mb-2 flex items-center justify-center">
            {warnMessage ? (
              <span className="text-xs font-black text-red-600 bg-red-100 px-3 py-0.5 rounded-full animate-pulse">
                {warnMessage}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">
                ※ 🐛イモムシは叩いちゃダメ！
              </span>
            )}
          </div>

          {/* 3x3 穴グリッド */}
          <div className="grid grid-cols-3 gap-3 bg-amber-800 p-3.5 rounded-2xl shadow-inner mb-5">
            {holes.map((hole) => (
              <div key={hole.id} className="relative h-24 w-full">
                <button
                  type="button"
                  onPointerDown={() => handleWhack(hole.id)}
                  className="relative h-full w-full bg-amber-950 rounded-full overflow-hidden border-4 border-amber-900 focus:outline-none active:scale-90 transition-transform touch-manipulation"
                >
                  <div
                    className={`absolute inset-x-0 bottom-0 flex justify-center transition-transform duration-100 ${
                      hole.isUp ? 'translate-y-1' : 'translate-y-24'
                    } ${hole.isHit ? 'scale-110' : 'scale-100'}`}
                  >
                    {hole.charType === 'caterpillar' ? (
                      /* お邪魔キャラ：イモムシくん */
                      <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
                        <circle cx="50" cy="85" r="16" fill="#a3e635" stroke="#4d7c0f" strokeWidth="3" />
                        <circle cx="50" cy="65" r="18" fill="#bef264" stroke="#4d7c0f" strokeWidth="3" />
                        <circle cx="50" cy="43" r="20" fill="#d9f99d" stroke="#4d7c0f" strokeWidth="3" />
                        {/* 触角 */}
                        <path d="M40 25 Q35 12 28 15 M60 25 Q65 12 72 15" fill="none" stroke="#4d7c0f" strokeWidth="3" strokeLinecap="round" />
                        {/* 泣き顔／通常顔 */}
                        {hole.isHit ? (
                          <>
                            <text x="50" y="50" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#dc2626">
                              × ×
                            </text>
                          </>
                        ) : (
                          <>
                            <circle cx="43" cy="40" r="3.5" fill="#1f2937" />
                            <circle cx="57" cy="40" r="3.5" fill="#1f2937" />
                            <path d="M45 49 Q50 54 55 49" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
                          </>
                        )}
                      </svg>
                    ) : (
                      /* 髭オクラ（通常 or 金のボスオクラ） */
                      <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
                        {/* 金オクラなら王冠を表示 */}
                        {hole.charType === 'king_okura' && (
                          <path
                            d="M32 22 L38 8 L50 18 L62 8 L68 22 Z"
                            fill="#facc15"
                            stroke="#b45309"
                            strokeWidth="2.5"
                          />
                        )}
                        {/* オクラ本体 */}
                        <path
                          d="M50 14 C32 32, 22 62, 25 105 L75 105 C78 62, 68 32, 50 14 Z"
                          fill={
                            hole.isHit
                              ? '#ef4444'
                              : hole.charType === 'king_okura'
                              ? '#eab308'
                              : '#22c55e'
                          }
                          stroke={hole.charType === 'king_okura' ? '#a16207' : '#15803d'}
                          strokeWidth="3"
                        />
                        {/* オクラの筋 */}
                        <path
                          d="M50 14 L42 105 M50 14 L58 105"
                          stroke={hole.charType === 'king_okura' ? '#ca8a04' : '#16a34a'}
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                        {/* 太眉 */}
                        <path
                          d="M32 48 L45 52 M68 48 L55 52"
                          stroke="#1f2937"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        {/* 目 */}
                        {hole.isHit ? (
                          <>
                            <path d="M35 56 L43 60 L35 64" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                            <path d="M65 56 L57 60 L65 64" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                          </>
                        ) : (
                          <>
                            <circle cx="40" cy="59" r="3.5" fill="#1f2937" />
                            <circle cx="60" cy="59" r="3.5" fill="#1f2937" />
                          </>
                        )}
                        {/* 豪快な髭 */}
                        <path d="M33 72 Q50 65 67 72 Q62 78 50 75 Q38 78 33 72 Z" fill="#1f2937" />
                        <path d="M32 77 Q30 93 50 97 Q70 93 68 77 Q60 86 50 86 Q40 86 32 77 Z" fill="#374151" />
                        {/* 口 */}
                        <ellipse cx="50" cy="81" rx="6" ry={hole.isHit ? '6' : '3'} fill="#991b1b" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* ヒット時の星型種バースト ＆ ポップ演出 */}
                {hole.burstKey > 0 && (
                  <div key={hole.burstKey} className="pointer-events-none absolute inset-0 z-20">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-pop-score">
                      {hole.burstType === 'warn' ? '💥' : '⭐'}
                    </div>
                    {hole.burstType === 'star' &&
                      STAR_VECTORS.map((vec, i) => (
                        <span
                          key={i}
                          style={{ '--tx': vec.tx, '--ty': vec.ty } as React.CSSProperties}
                          className="animate-seed-burst absolute left-1/2 top-1/2 w-3.5 h-4.5 rounded-full bg-lime-100 border-2 border-green-600 shadow-sm"
                        />
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 状態ごとのアクションボタン群 */}
          {gameState !== 'playing' && (
            <div className="space-y-2.5 text-center">
              {gameState === 'stage_clear' && (
                <div className="bg-green-100 border-2 border-green-400 rounded-xl p-3">
                  <p className="text-base font-black text-green-800">
                    🎉 {currentStage.title} クリア！
                  </p>
                  <p className="text-xs font-bold text-green-700 mt-1">
                    畑が一段階育ったで！次のステージへ進もう！
                  </p>
                </div>
              )}

              {gameState === 'all_clear' && (
                <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 border-2 border-yellow-400 rounded-xl p-3.5">
                  <p className="text-lg font-black text-amber-800">
                    👑 オクラ全5ステージ完全制覇！
                  </p>
                  <p className="text-xs font-bold text-green-800 mt-1">
                    立派なオクラが豊作！『神秘の種のカケラ』を獲得したで！
                  </p>
                  <p className="text-sm font-black text-orange-700 mt-1">
                    最終累計スコア：{totalScore}点（最大{maxCombo}連鎖）
                  </p>
                </div>
              )}

              {gameState === 'game_over' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-base font-black text-red-700">
                    時間切れ！目標まであと {currentStage.targetScore - stageScore}点！
                  </p>
                  <p className="text-xs font-bold text-gray-600 mt-0.5">
                    累計スコア：{totalScore}点（最大{maxCombo}連鎖）
                  </p>
                </div>
              )}

              {/* メイン進行ボタン */}
              {gameState === 'stage_clear' ? (
                <button
                  type="button"
                  onClick={() => startStage(stageIdx + 1, false)}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-lg rounded-xl shadow-md transition-colors"
                >
                  次のステージへ進む！ ➔
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startStage(0, true)}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-black text-lg rounded-xl shadow-md transition-colors"
                >
                  {gameState === 'idle' ? 'スタート！' : '最初からもう一回遊ぶ！'}
                </button>
              )}

              {/* LINEでシェアボタン */}
              <button
                type="button"
                onClick={handleLineShare}
                className="w-full py-3 bg-[#06C755] hover:bg-[#05b34c] active:bg-[#049f43] text-white font-bold text-sm rounded-xl shadow flex items-center justify-center gap-2 transition-colors"
              >
                <span className="text-base">💬</span>
                <span>LINEでうえちん・友達にシェアする</span>
              </button>
            </div>
          )}
        </div>

        {/* 下部の畑アイコンライン */}
        <div className="flex justify-around items-center pt-2 text-lg">
          {currentStage.farmIcons.map((icon, i) => (
            <span key={i}>{icon}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
