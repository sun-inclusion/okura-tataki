'use client';

import React, { useState, useEffect, useRef } from 'react';

type VeggieKey = 'okura' | 'tomato' | 'chili' | 'watermelon' | 'king';
type ObstacleKey = 'caterpillar' | 'ladybug' | 'cactus' | 'crab' | 'fairy';
type CharType = VeggieKey | ObstacleKey;

type HoleState = {
  id: number;
  isUp: boolean;
  isHit: boolean;
  charType: CharType;
  burstKey: number;
  burstVeggie: VeggieKey | 'warn';
};

type StageConfig = {
  stage: number;
  title: string;
  targetScore: number;
  timeLimit: number;
  instantClear: boolean;
  popIntervalMin: number;
  popIntervalMax: number;
  stayMin: number;
  stayMax: number;
  obstacleRate: number;
  kingRate: number;
  farmLabel: string;
  farmIcons: string[];
  farmBgClass: string;
};

type ChapterConfig = {
  id: number;
  name: string;
  subtitle: string;
  veggie: VeggieKey;
  veggieName: string;
  obstacle: ObstacleKey;
  obstacleName: string;
  obstacleDesc: string;
  storyIntro: string;
  storyClear: string;
  seedReward: string;
  themeColor: string;
  stages: StageConfig[];
};

const CHAPTERS: ChapterConfig[] = [
  {
    id: 1,
    name: '第1章：日本の里山',
    subtitle: '髭オクラ編（チュートリアル）',
    veggie: 'okura',
    veggieName: '髭オクラ',
    obstacle: 'caterpillar',
    obstacleName: 'イモムシ',
    obstacleDesc: '叩くと減点＆コンボ消滅',
    storyIntro: 'まずは里山の畑を開墾や！オクラの種を星型に弾き飛ばして大地に命を吹き込め！',
    storyClear: '里山に立派なオクラが実った！『星の種』を手に入れたで！',
    seedReward: '⭐ 星の種',
    themeColor: 'green',
    stages: [
      { stage: 1, title: '1-1：荒れ地の開墾', targetScore: 120, timeLimit: 20, instantClear: true, popIntervalMin: 500, popIntervalMax: 820, stayMin: 750, stayMax: 1150, obstacleRate: 0.10, kingRate: 0.08, farmLabel: '荒れ地（達成で即クリア！）', farmIcons: ['🪨', '🏜️', '🪨', '🏜️', '🪨'], farmBgClass: 'bg-stone-300 border-stone-500' },
      { stage: 2, title: '1-2：ふかふかの黒土', targetScore: 200, timeLimit: 20, instantClear: true, popIntervalMin: 450, popIntervalMax: 750, stayMin: 700, stayMax: 1050, obstacleRate: 0.15, kingRate: 0.10, farmLabel: '黒土完成（達成で即クリア！）', farmIcons: ['🟫', '🟫', '🟫', '🟫', '🟫'], farmBgClass: 'bg-amber-900/20 border-amber-800' },
      { stage: 3, title: '1-3：小さな新芽', targetScore: 280, timeLimit: 20, instantClear: true, popIntervalMin: 400, popIntervalMax: 680, stayMin: 650, stayMax: 950, obstacleRate: 0.18, kingRate: 0.12, farmLabel: '新芽発芽（達成で即クリア！）', farmIcons: ['🌱', '🟫', '🌱', '🟫', '🌱'], farmBgClass: 'bg-lime-100 border-lime-600' },
      { stage: 4, title: '1-4：元気なふたば', targetScore: 380, timeLimit: 22, instantClear: false, popIntervalMin: 360, popIntervalMax: 600, stayMin: 580, stayMax: 880, obstacleRate: 0.22, kingRate: 0.15, farmLabel: 'ふたば成長（0秒までキープ！）', farmIcons: ['🌿', '🌱', '🌿', '🌱', '🌿'], farmBgClass: 'bg-green-100 border-green-600' },
      { stage: 5, title: '1-5：里山の大収穫祭', targetScore: 500, timeLimit: 25, instantClear: false, popIntervalMin: 330, popIntervalMax: 550, stayMin: 530, stayMax: 820, obstacleRate: 0.25, kingRate: 0.22, farmLabel: 'オクラ満開（0秒までキープ！）', farmIcons: ['🌼', '🌿', '🌼', '🌿', '🌼'], farmBgClass: 'bg-yellow-100 border-yellow-500' },
    ],
  },
  {
    id: 2,
    name: '第2章：日本の畑',
    subtitle: '真っ赤なトマト編',
    veggie: 'tomato',
    veggieName: '真っ赤なトマト',
    obstacle: 'ladybug',
    obstacleName: 'テントウムシ',
    obstacleDesc: '畑の守り神！叩くと減点',
    storyIntro: '里山が蘇った！次は隣のトマト畑に真っ赤な果汁の潤いを届けるで！',
    storyClear: 'トマト畑が真っ赤に染まった！『太陽の種』を手に入れたで！',
    seedReward: '☀️ 太陽の種',
    themeColor: 'red',
    stages: [
      { stage: 1, title: '2-1：乾いた畝づくり', targetScore: 180, timeLimit: 20, instantClear: true, popIntervalMin: 450, popIntervalMax: 750, stayMin: 680, stayMax: 1020, obstacleRate: 0.16, kingRate: 0.08, farmLabel: '畝づくり（達成で即クリア！）', farmIcons: ['🟫', '🪨', '🟫', '🪨', '🟫'], farmBgClass: 'bg-orange-100 border-orange-400' },
      { stage: 2, title: '2-2：朝露の水やり', targetScore: 280, timeLimit: 20, instantClear: true, popIntervalMin: 400, popIntervalMax: 680, stayMin: 620, stayMax: 950, obstacleRate: 0.20, kingRate: 0.10, farmLabel: '朝露キラリ（達成で即クリア！）', farmIcons: ['💧', '🌱', '💧', '🌱', '💧'], farmBgClass: 'bg-sky-100 border-sky-500' },
      { stage: 3, title: '2-3：支柱立て', targetScore: 380, timeLimit: 20, instantClear: true, popIntervalMin: 360, popIntervalMax: 620, stayMin: 580, stayMax: 880, obstacleRate: 0.22, kingRate: 0.14, farmLabel: 'グングン成長（達成で即クリア！）', farmIcons: ['🌿', '💧', '🌿', '💧', '🌿'], farmBgClass: 'bg-emerald-100 border-emerald-500' },
      { stage: 4, title: '2-4：青い実の季節', targetScore: 520, timeLimit: 22, instantClear: false, popIntervalMin: 330, popIntervalMax: 550, stayMin: 520, stayMax: 820, obstacleRate: 0.26, kingRate: 0.18, farmLabel: '色づき始め（0秒までキープ！）', farmIcons: ['🍏', '🌿', '🍏', '🌿', '🍏'], farmBgClass: 'bg-rose-100 border-rose-400' },
      { stage: 5, title: '2-5：完熟トマト祭り', targetScore: 680, timeLimit: 25, instantClear: false, popIntervalMin: 290, popIntervalMax: 500, stayMin: 480, stayMax: 760, obstacleRate: 0.28, kingRate: 0.25, farmLabel: '完熟トマト鈴なり（0秒までキープ！）', farmIcons: ['🍅', '🌿', '🍅', '🌿', '🍅'], farmBgClass: 'bg-red-100 border-red-500' },
    ],
  },
  {
    id: 3,
    name: '第3章：世界の荒野',
    subtitle: 'メキシカン唐辛子編',
    veggie: 'chili',
    veggieName: 'メキシカン唐辛子',
    obstacle: 'cactus',
    obstacleName: 'サボテンベビー',
    obstacleDesc: 'トゲが刺さり1秒間しびれる！',
    storyIntro: '海を越えて灼熱の荒野へ！情熱の火花で枯れ野に生命の火を灯せ！',
    storyClear: '荒野に灼熱の生命力が宿った！『炎の種』を手に入れたで！',
    seedReward: '🔥 炎の種',
    themeColor: 'orange',
    stages: [
      { stage: 1, title: '3-1：赤土の開拓', targetScore: 220, timeLimit: 20, instantClear: true, popIntervalMin: 420, popIntervalMax: 700, stayMin: 640, stayMax: 960, obstacleRate: 0.18, kingRate: 0.10, farmLabel: '赤土の荒野（達成で即クリア！）', farmIcons: ['🏜️', '🔥', '🏜️', '🔥', '🏜️'], farmBgClass: 'bg-amber-200 border-amber-600' },
      { stage: 2, title: '3-2：太陽の恵み', targetScore: 340, timeLimit: 20, instantClear: true, popIntervalMin: 380, popIntervalMax: 640, stayMin: 580, stayMax: 900, obstacleRate: 0.22, kingRate: 0.12, farmLabel: '熱風の芽吹き（達成で即クリア！）', farmIcons: ['🌱', '🔥', '🌱', '🔥', '🌱'], farmBgClass: 'bg-orange-200 border-orange-600' },
      { stage: 3, title: '3-3：スパイシー開花', targetScore: 460, timeLimit: 20, instantClear: true, popIntervalMin: 340, popIntervalMax: 580, stayMin: 540, stayMax: 840, obstacleRate: 0.24, kingRate: 0.15, farmLabel: '情熱の開花（達成で即クリア！）', farmIcons: ['🌺', '🌿', '🌺', '🌿', '🌺'], farmBgClass: 'bg-red-200 border-red-600' },
      { stage: 4, title: '3-4：灼熱の嵐', targetScore: 620, timeLimit: 22, instantClear: false, popIntervalMin: 300, popIntervalMax: 520, stayMin: 490, stayMax: 780, obstacleRate: 0.28, kingRate: 0.20, farmLabel: '灼熱サバイバル（0秒までキープ！）', farmIcons: ['🌶️', '🔥', '🌶️', '🔥', '🌶️'], farmBgClass: 'bg-orange-300 border-red-700' },
      { stage: 5, title: '3-5：激辛カーニバル', targetScore: 800, timeLimit: 25, instantClear: false, popIntervalMin: 270, popIntervalMax: 470, stayMin: 450, stayMax: 720, obstacleRate: 0.30, kingRate: 0.25, farmLabel: '炎の収穫祭（0秒までキープ！）', farmIcons: ['🔥', '🌶️', '👑', '🌶️', '🔥'], farmBgClass: 'bg-red-300 border-red-800' },
    ],
  },
  {
    id: 4,
    name: '第4章：南国の楽園',
    subtitle: 'スイカ大王編',
    veggie: 'watermelon',
    veggieName: 'スイカ大王',
    obstacle: 'crab',
    obstacleName: 'ヤシガニ',
    obstacleDesc: 'ハサミで挟まれて大幅減点！',
    storyIntro: '南国の楽園でスイカ大王が暴走中！硬い縞模様を叩き割って黒種を撒け！',
    storyClear: '南国に甘い実りが戻った！『大地の種』を手に入れたで！',
    seedReward: '🍉 大地の種',
    themeColor: 'emerald',
    stages: [
      { stage: 1, title: '4-1：砂浜の農園', targetScore: 260, timeLimit: 20, instantClear: true, popIntervalMin: 390, popIntervalMax: 660, stayMin: 600, stayMax: 920, obstacleRate: 0.20, kingRate: 0.10, farmLabel: '白い砂浜（達成で即クリア！）', farmIcons: ['🏖️', '🌴', '🏖️', '🌴', '🏖️'], farmBgClass: 'bg-cyan-100 border-cyan-500' },
      { stage: 2, title: '4-2：スコールと虹', targetScore: 400, timeLimit: 20, instantClear: true, popIntervalMin: 350, popIntervalMax: 600, stayMin: 550, stayMax: 850, obstacleRate: 0.23, kingRate: 0.14, farmLabel: '南国のスコール（達成で即クリア！）', farmIcons: ['🌈', '🌱', '🌈', '🌱', '🌈'], farmBgClass: 'bg-teal-100 border-teal-500' },
      { stage: 3, title: '4-3：ツルが伸びる！', targetScore: 540, timeLimit: 20, instantClear: true, popIntervalMin: 310, popIntervalMax: 540, stayMin: 500, stayMax: 790, obstacleRate: 0.25, kingRate: 0.18, farmLabel: 'ツル拡大中（達成で即クリア！）', farmIcons: ['🌿', '🌴', '🌿', '🌴', '🌿'], farmBgClass: 'bg-emerald-200 border-emerald-600' },
      { stage: 4, title: '4-4：大玉ゴロゴロ', targetScore: 720, timeLimit: 22, instantClear: false, popIntervalMin: 280, popIntervalMax: 490, stayMin: 460, stayMax: 730, obstacleRate: 0.28, kingRate: 0.22, farmLabel: '大玉ラッシュ（0秒までキープ！）', farmIcons: ['🍉', '🌿', '🍉', '🌿', '🍉'], farmBgClass: 'bg-green-200 border-emerald-700' },
      { stage: 5, title: '4-5：スイカ大王の試練', targetScore: 920, timeLimit: 25, instantClear: false, popIntervalMin: 250, popIntervalMax: 440, stayMin: 420, stayMax: 680, obstacleRate: 0.32, kingRate: 0.28, farmLabel: '楽園の大収穫（0秒までキープ！）', farmIcons: ['👑', '🍉', '🌴', '🍉', '👑'], farmBgClass: 'bg-emerald-300 border-green-800' },
    ],
  },
  {
    id: 5,
    name: '最終章：天空の王宮',
    subtitle: '野菜の王様・大団円編',
    veggie: 'king',
    veggieName: '野菜の王様＆全野菜',
    obstacle: 'fairy',
    obstacleName: '妖精ピコ',
    obstacleDesc: '王様の使い！叩くと減点＆コンボ消滅',
    storyIntro: '4つの種が共鳴し天空の王宮への扉が開いた！王様へ虹色の神秘の種を届けよう！',
    storyClear: 'すべての畑に黄金の収穫祭が蘇った！君こそが伝説の収穫王や！！',
    seedReward: '🌈 神秘の種',
    themeColor: 'yellow',
    stages: [
      { stage: 1, title: '5-1：雲の上の庭園', targetScore: 320, timeLimit: 20, instantClear: true, popIntervalMin: 360, popIntervalMax: 600, stayMin: 560, stayMax: 860, obstacleRate: 0.22, kingRate: 0.15, farmLabel: '雲上の庭園（達成で即クリア！）', farmIcons: ['☁️', '✨', '☁️', '✨', '☁️'], farmBgClass: 'bg-indigo-100 border-indigo-400' },
      { stage: 2, title: '5-2：光の泉', targetScore: 480, timeLimit: 20, instantClear: true, popIntervalMin: 320, popIntervalMax: 540, stayMin: 510, stayMax: 800, obstacleRate: 0.25, kingRate: 0.18, farmLabel: '光の泉湧出（達成で即クリア！）', farmIcons: ['⛲', '🌱', '⛲', '🌱', '⛲'], farmBgClass: 'bg-sky-200 border-sky-600' },
      { stage: 3, title: '5-3：虹の架け橋', targetScore: 650, timeLimit: 20, instantClear: true, popIntervalMin: 290, popIntervalMax: 490, stayMin: 470, stayMax: 740, obstacleRate: 0.27, kingRate: 0.22, farmLabel: '虹の架け橋（達成で即クリア！）', farmIcons: ['🌈', '🌿', '🌈', '🌿', '🌈'], farmBgClass: 'bg-purple-100 border-purple-500' },
      { stage: 4, title: '5-4：四天王の総進撃', targetScore: 850, timeLimit: 22, instantClear: false, popIntervalMin: 260, popIntervalMax: 450, stayMin: 430, stayMax: 690, obstacleRate: 0.30, kingRate: 0.25, farmLabel: '全野菜総登場（0秒までキープ！）', farmIcons: ['⭐', '🍅', '🌶️', '🍉', '👑'], farmBgClass: 'bg-amber-200 border-amber-600' },
      { stage: 5, title: '5-5：野菜の王様・最終決戦', targetScore: 1100, timeLimit: 25, instantClear: false, popIntervalMin: 230, popIntervalMax: 410, stayMin: 400, stayMax: 640, obstacleRate: 0.32, kingRate: 0.35, farmLabel: '黄金の収穫祭（0秒までキープ！）', farmIcons: ['👑', '🌈', '✨', '🌈', '👑'], farmBgClass: 'bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 border-yellow-500' },
    ],
  },
];

// 10方向弾け飛びベクトル
const BURST_VECTORS = [
  { tx: '0px', ty: '-74px', size: 'w-4 h-5' },
  { tx: '70px', ty: '-23px', size: 'w-4 h-5' },
  { tx: '44px', ty: '60px', size: 'w-4 h-5' },
  { tx: '-44px', ty: '60px', size: 'w-4 h-5' },
  { tx: '-70px', ty: '-23px', size: 'w-4 h-5' },
  { tx: '32px', ty: '-46px', size: 'w-3 h-3.5' },
  { tx: '50px', ty: '25px', size: 'w-3 h-3.5' },
  { tx: '0px', ty: '54px', size: 'w-3 h-3.5' },
  { tx: '-50px', ty: '25px', size: 'w-3 h-3.5' },
  { tx: '-32px', ty: '-46px', size: 'w-3 h-3.5' },
];

// 紙吹雪パーティクル配置データ（エピローグ祝福演出用）
const CONFETTI_ITEMS = [
  { left: '8%', delay: '0s', duration: '2.6s', icon: '✨' },
  { left: '20%', delay: '0.4s', duration: '3.1s', icon: '⭐' },
  { left: '33%', delay: '0.9s', duration: '2.8s', icon: '🍅' },
  { left: '48%', delay: '0.2s', duration: '3.3s', icon: '🎊' },
  { left: '62%', delay: '0.7s', duration: '2.7s', icon: '🌶️' },
  { left: '76%', delay: '0.3s', duration: '3.0s', icon: '🍉' },
  { left: '89%', delay: '0.8s', duration: '2.5s', icon: '👑' },
];

// 輪切りオクラ断面SVG
function OkuraSliceIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M50 5 C62 5, 92 27, 95 39 C98 51, 86 86, 76 93 C66 100, 34 100, 24 93 C14 86, 2 51, 5 39 C8 27, 38 5, 50 5 Z" fill="#16a34a" stroke="#14532d" strokeWidth="4" />
      <path d="M50 13 C60 13, 84 31, 87 41 C89 51, 79 80, 71 86 C63 91, 37 91, 29 86 C21 80, 11 51, 13 41 C16 31, 40 13, 50 13 Z" fill="#bef264" />
      <ellipse cx="50" cy="31" rx="8" ry="11" fill="#4d7c0f" />
      <ellipse cx="69" cy="45" rx="8" ry="11" transform="rotate(72 69 45)" fill="#4d7c0f" />
      <ellipse cx="62" cy="68" rx="8" ry="11" transform="rotate(144 62 68)" fill="#4d7c0f" />
      <ellipse cx="38" cy="68" rx="8" ry="11" transform="rotate(216 38 68)" fill="#4d7c0f" />
      <ellipse cx="31" cy="45" rx="8" ry="11" transform="rotate(288 31 45)" fill="#4d7c0f" />
      <circle cx="50" cy="27" r="3.8" fill="#fefce8" />
      <circle cx="50" cy="35" r="3.4" fill="#fefce8" />
      <circle cx="72" cy="43" r="3.8" fill="#fefce8" />
      <circle cx="65" cy="46" r="3.4" fill="#fefce8" />
      <circle cx="64" cy="71" r="3.8" fill="#fefce8" />
      <circle cx="59" cy="65" r="3.4" fill="#fefce8" />
      <circle cx="36" cy="71" r="3.8" fill="#fefce8" />
      <circle cx="41" cy="65" r="3.4" fill="#fefce8" />
      <circle cx="28" cy="43" r="3.8" fill="#fefce8" />
      <circle cx="35" cy="46" r="3.4" fill="#fefce8" />
      <circle cx="50" cy="52" r="5" fill="#ecfccb" />
    </svg>
  );
}

// キャラクター描画コンポーネント
function CharacterIllustration({ charType, isHit }: { charType: CharType; isHit: boolean }) {
  switch (charType) {
    case 'okura':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <path d="M50 12 C32 30, 22 62, 25 105 L75 105 C78 62, 68 30, 50 12 Z" fill={isHit ? '#ef4444' : '#22c55e'} stroke="#15803d" strokeWidth="3" />
          <path d="M50 12 L42 105 M50 12 L58 105" stroke="#16a34a" strokeWidth="1.5" opacity="0.6" />
          <path d="M32 48 L45 52 M68 48 L55 52" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
          {isHit ? (
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
          <path d="M33 72 Q50 65 67 72 Q62 78 50 75 Q38 78 33 72 Z" fill="#1f2937" />
          <path d="M32 77 Q30 93 50 97 Q70 93 68 77 Q60 86 50 86 Q40 86 32 77 Z" fill="#374151" />
          <ellipse cx="50" cy="81" rx="6" ry={isHit ? '6' : '3'} fill="#991b1b" />
        </svg>
      );
    case 'tomato':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <ellipse cx="50" cy="68" rx="34" ry="30" fill={isHit ? '#fca5a5' : '#ef4444'} stroke="#991b1b" strokeWidth="3" />
          <path d="M50 42 L35 30 L45 43 L28 45 L44 49 L38 60 L50 51 L62 60 L56 49 L72 45 L55 43 L65 30 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
          {isHit ? (
            <text x="50" y="74" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#7f1d1d">＞＜</text>
          ) : (
            <>
              <circle cx="38" cy="68" r="4" fill="#1f2937" />
              <circle cx="62" cy="68" r="4" fill="#1f2937" />
              <path d="M43 78 Q50 85 57 78" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    case 'chili':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <path d="M55 25 C75 35, 78 75, 42 102 C35 106, 28 100, 34 92 C52 70, 50 45, 42 30 Z" fill={isHit ? '#fde047' : '#dc2626'} stroke="#7f1d1d" strokeWidth="3" />
          <path d="M46 27 Q42 14 52 10" fill="none" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
          {isHit ? (
            <text x="54" y="65" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#7f1d1d">× ×</text>
          ) : (
            <>
              <path d="M45 50 L54 54 M66 50 L57 54" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
              <circle cx="49" cy="58" r="3" fill="#1f2937" />
              <circle cx="61" cy="58" r="3" fill="#1f2937" />
              <path d="M48 68 Q55 64 62 68" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      );
    case 'watermelon':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <circle cx="50" cy="65" r="35" fill={isHit ? '#f87171' : '#22c55e'} stroke="#14532d" strokeWidth="3.5" />
          <path d="M36 33 Q28 65 36 97 M50 30 L50 100 M64 33 Q72 65 64 97" fill="none" stroke="#14532d" strokeWidth="4" />
          {isHit ? (
            <text x="50" y="72" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#fef08a">💥</text>
          ) : (
            <>
              <circle cx="39" cy="62" r="4" fill="#1f2937" />
              <circle cx="61" cy="62" r="4" fill="#1f2937" />
              <rect x="42" y="73" width="16" height="6" rx="3" fill="#991b1b" />
            </>
          )}
        </svg>
      );
    case 'king':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <path d="M26 30 L34 12 L50 24 L66 12 L74 30 Z" fill="#facc15" stroke="#b45309" strokeWidth="3" />
          <circle cx="50" cy="68" r="33" fill={isHit ? '#fef08a' : '#eab308'} stroke="#a16207" strokeWidth="3.5" />
          <path d="M32 54 L46 58 M68 54 L54 58" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
          <circle cx="40" cy="64" r="4" fill="#1f2937" />
          <circle cx="60" cy="64" r="4" fill="#1f2937" />
          <path d="M34 76 Q50 69 66 76 Q60 83 50 79 Q40 83 34 76 Z" fill="#ffffff" />
          <path d="M38 82 Q50 94 62 82" fill="none" stroke="#991b1b" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'caterpillar':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <circle cx="50" cy="85" r="16" fill="#a3e635" stroke="#4d7c0f" strokeWidth="3" />
          <circle cx="50" cy="65" r="18" fill="#bef264" stroke="#4d7c0f" strokeWidth="3" />
          <circle cx="50" cy="43" r="20" fill="#d9f99d" stroke="#4d7c0f" strokeWidth="3" />
          <path d="M40 25 Q35 12 28 15 M60 25 Q65 12 72 15" fill="none" stroke="#4d7c0f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="43" cy="40" r="3.5" fill="#1f2937" />
          <circle cx="57" cy="40" r="3.5" fill="#1f2937" />
          <path d="M45 49 Q50 54 55 49" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'ladybug':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <circle cx="50" cy="66" r="28" fill="#dc2626" stroke="#1f2937" strokeWidth="3" />
          <path d="M50 38 L50 94" stroke="#1f2937" strokeWidth="3" />
          <circle cx="39" cy="58" r="4" fill="#1f2937" />
          <circle cx="61" cy="58" r="4" fill="#1f2937" />
          <circle cx="37" cy="75" r="4.5" fill="#1f2937" />
          <circle cx="63" cy="75" r="4.5" fill="#1f2937" />
          <path d="M34 44 Q50 26 66 44 Z" fill="#1f2937" />
        </svg>
      );
    case 'cactus':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <rect x="36" y="30" width="28" height="72" rx="14" fill="#15803d" stroke="#14532d" strokeWidth="3" />
          <path d="M36 62 H24 V46 M64 56 H76 V40" fill="none" stroke="#15803d" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="44" cy="52" r="3" fill="#fef08a" />
          <circle cx="56" cy="52" r="3" fill="#fef08a" />
          <path d="M28 42 L22 38 M72 36 L78 32 M50 28 L50 20" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'crab':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <ellipse cx="50" cy="70" rx="28" ry="20" fill="#ea580c" stroke="#7c2d12" strokeWidth="3" />
          <circle cx="26" cy="44" r="11" fill="#f97316" stroke="#7c2d12" strokeWidth="2.5" />
          <circle cx="74" cy="44" r="11" fill="#f97316" stroke="#7c2d12" strokeWidth="2.5" />
          <circle cx="42" cy="64" r="3.5" fill="#1f2937" />
          <circle cx="58" cy="64" r="3.5" fill="#1f2937" />
        </svg>
      );
    case 'fairy':
      return (
        <svg viewBox="0 0 100 110" className="w-20 h-22 pointer-events-none">
          <ellipse cx="32" cy="56" rx="16" ry="10" transform="rotate(-25 32 56)" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
          <ellipse cx="68" cy="56" rx="16" ry="10" transform="rotate(25 68 56)" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="50" cy="62" r="22" fill="#fbcfe8" stroke="#db2777" strokeWidth="2.5" />
          <circle cx="43" cy="60" r="3" fill="#1f2937" />
          <circle cx="57" cy="60" r="3" fill="#1f2937" />
          <path d="M46 69 Q50 73 54 69" fill="none" stroke="#db2777" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
}

// 野菜ごとの弾け飛びエフェクト
function BurstEffect({ burstVeggie }: { burstVeggie: VeggieKey | 'warn' }) {
  if (burstVeggie === 'warn') {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl animate-pop-slice">
        💥
      </div>
    );
  }

  return (
    <>
      <div className="animate-shockwave absolute left-1/2 top-1/2 w-14 h-14 rounded-full border-4 border-yellow-300 bg-white/40" />
      <div className="absolute left-1/2 top-1/2 animate-pop-slice">
        {burstVeggie === 'okura' && <OkuraSliceIcon className="w-11 h-11 drop-shadow-md" />}
        {burstVeggie === 'tomato' && <span className="text-3xl">🍅</span>}
        {burstVeggie === 'chili' && <span className="text-3xl">🔥</span>}
        {burstVeggie === 'watermelon' && <span className="text-3xl">🍉</span>}
        {burstVeggie === 'king' && <span className="text-3xl">🌈</span>}
      </div>
      {BURST_VECTORS.map((vec, i) => {
        let particleClass = 'rounded-full bg-amber-50 border-2 border-green-600';
        if (burstVeggie === 'tomato') {
          particleClass = i % 2 === 0 ? 'rounded-full bg-red-500 border border-red-700' : 'rounded-full bg-yellow-300';
        } else if (burstVeggie === 'chili') {
          particleClass = i % 2 === 0 ? 'rotate-45 bg-orange-500 border border-red-600' : 'rounded-full bg-yellow-300';
        } else if (burstVeggie === 'watermelon') {
          particleClass = 'rounded-full bg-gray-900 border border-gray-600';
        } else if (burstVeggie === 'king') {
          const rainbow = ['bg-red-400', 'bg-yellow-300', 'bg-green-400', 'bg-sky-400', 'bg-purple-400'];
          particleClass = `rounded-full ${rainbow[i % rainbow.length]} border border-white`;
        }
        return (
          <span
            key={i}
            style={{ '--tx': vec.tx, '--ty': vec.ty } as React.CSSProperties}
            className={`animate-seed-explode absolute left-1/2 top-1/2 ${vec.size} ${particleClass} shadow-md`}
          />
        );
      })}
    </>
  );
}

// 🎬 プロローグアニメーションステージ（種降臨 ➔ 新芽発芽）
function PrologueAnimationStage() {
  return (
    <div className="relative bg-gradient-to-b from-sky-100 via-amber-50 to-amber-200/80 border-2 border-amber-300 rounded-2xl p-4 overflow-hidden">
      {/* キラキラ光る神秘の種が舞い降りる演出 */}
      <div className="relative h-20 flex flex-col items-center justify-end">
        <div className="animate-seed-descend absolute top-0 flex flex-col items-center">
          <span className="text-2xl drop-shadow">✨</span>
          <span className="w-3.5 h-4.5 rounded-full bg-yellow-200 border-2 border-amber-500 shadow-md -mt-1" />
        </div>

        {/* 荒れ地から新芽がピョコッと顔を出す */}
        <div className="flex items-end gap-5 z-10 pb-1">
          <span className="text-lg opacity-70">🪨</span>
          <span className="text-lg opacity-70">🏜️</span>
          <div className="animate-sprout-pop flex flex-col items-center">
            <span className="text-3xl">🌱</span>
          </div>
          <span className="text-lg opacity-70">🏜️</span>
          <span className="text-lg opacity-70">🪨</span>
        </div>

        {/* 大地のライン */}
        <div className="w-full h-2.5 bg-amber-800 rounded-full shadow-inner" />
      </div>

      {/* ストーリーテキスト（順次フェードイン） */}
      <div className="mt-3 space-y-1 text-center">
        <p className="animate-story-line-1 text-[11px] font-black text-amber-800">
          📖 プロローグ 〜ベジタブル王国の再生〜
        </p>
        <p className="animate-story-line-2 text-xs font-bold text-gray-700 leading-relaxed">
          干ばつの呪いで眠りについた野菜たちを叩き起こせ！
        </p>
        <p className="animate-story-line-3 text-xs font-bold text-green-800 leading-relaxed">
          4つの『神秘の種』を集め、天空の野菜の王様へ届けよう！
        </p>
      </div>
    </div>
  );
}

// 🎬 エピローグアニメーションステージ（4種合体 ➔ 虹色の神秘の種 ＆ 王様ジャンプ ＆ 紙吹雪）
function EpilogueAnimationStage({
  storyClear,
  rankLabel,
  totalScore,
  maxCombo,
}: {
  storyClear: string;
  rankLabel: string;
  totalScore: number;
  maxCombo: number;
}) {
  return (
    <div className="relative bg-gradient-to-b from-yellow-100 via-amber-100 to-orange-100 border-2 border-yellow-500 rounded-2xl p-4 overflow-hidden">
      {/* 祝福の紙吹雪 */}
      {CONFETTI_ITEMS.map((item, idx) => (
        <span
          key={idx}
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
          className="animate-confetti-fall pointer-events-none absolute -top-4 text-base z-10"
        >
          {item.icon}
        </span>
      ))}

      {/* 4つの種が回転しながら中央へ集まり、虹色の種＆王様が輝くステージ */}
      <div className="relative h-24 flex items-center justify-center">
        {/* 周囲を回る4つの種 */}
        <div className="animate-orbit-seeds absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute -top-1 text-lg">⭐</span>
          <span className="absolute -bottom-1 text-lg">🔥</span>
          <span className="absolute left-6 text-lg">☀️</span>
          <span className="absolute right-6 text-lg">🍉</span>
        </div>

        {/* 中央の虹色の神秘の種 ＆ 喜ぶ野菜の王様 */}
        <div className="relative z-20 flex flex-col items-center animate-king-celebrate">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">🌈</span>
            <span className="text-4xl drop-shadow">👑</span>
            <span className="text-2xl">🌈</span>
          </div>
          <span className="px-2.5 py-0.5 mt-1 bg-white/90 rounded-full text-[10px] font-black text-amber-800 shadow-sm">
            ✨ 4つの種が合体！虹色の神秘の種が完成！ ✨
          </span>
        </div>
      </div>

      {/* エピローグメッセージ ＆ 称号認定 */}
      <div className="relative z-20 mt-2 space-y-1.5 text-center">
        <p className="text-base font-black text-amber-900">🎊 全5章・完全大団円！！</p>
        <p className="text-xs font-bold text-gray-800 leading-relaxed">{storyClear}</p>
        <div className="bg-white/85 rounded-xl p-2 border border-amber-300">
          <p className="text-sm font-black text-orange-700">{rankLabel}</p>
          <p className="text-xs font-bold text-gray-600 mt-0.5">
            最終スコア：{totalScore}点（最大{maxCombo}連鎖）
          </p>
        </div>
      </div>
    </div>
  );
}

const createInitialHoles = (): HoleState[] =>
  Array.from({ length: 9 }, (_, i) => ({
    id: i,
    isUp: false,
    isHit: false,
    charType: 'okura',
    burstKey: 0,
    burstVeggie: 'okura',
  }));

const OBSTACLES: ObstacleKey[] = ['caterpillar', 'ladybug', 'cactus', 'crab', 'fairy'];
const VEGGIES: VeggieKey[] = ['okura', 'tomato', 'chili', 'watermelon', 'king'];

export default function OkuraTatakiPage() {
  const [chapterIdx, setChapterIdx] = useState<number>(0);
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [isEndless, setIsEndless] = useState<boolean>(false);
  const [endlessLives, setEndlessLives] = useState<number>(3);

  const [totalScore, setTotalScore] = useState<number>(0);
  const [stageScore, setStageScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(CHAPTERS[0].stages[0].timeLimit);

  const [gameState, setGameState] = useState<
    'title' | 'chapter_intro' | 'playing' | 'stage_clear' | 'chapter_clear' | 'all_clear' | 'game_over'
  >('title');

  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isStunned, setIsStunned] = useState<boolean>(false);
  const [warnMessage, setWarnMessage] = useState<string | null>(null);
  const [showDevMenu, setShowDevMenu] = useState<boolean>(false);

  const [holes, setHoles] = useState<HoleState[]>(createInitialHoles);

  const holesRef = useRef<HoleState[]>(holes);
  holesRef.current = holes;
  const comboRef = useRef<number>(combo);
  comboRef.current = combo;
  const stageScoreRef = useRef<number>(stageScore);
  stageScoreRef.current = stageScore;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const popTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentChapter = CHAPTERS[chapterIdx];
  const currentStage = currentChapter.stages[stageIdx];

  // 効果音再生
  const playSound = (type: 'hit' | 'king' | 'bad' | 'clear', currentCombo = 0) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'bad') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(75, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        return;
      }

      if (type === 'clear') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + idx * 0.09);
          g.gain.setValueAtTime(0.25, now + idx * 0.09);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.2);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.09);
          o.stop(now + idx * 0.09 + 0.2);
        });
        return;
      }

      // 破裂ノイズ（パァーン！）
      const bufferSize = Math.floor(ctx.sampleRate * 0.14);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(1.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = type === 'king' ? 540 : Math.min(310 + currentCombo * 28, 920);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.75, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.16);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // ignore
    }
  };

  // クリア遷移処理
  const triggerClear = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    setHoles((h) => h.map((hole) => ({ ...hole, isUp: false, isHit: false })));
    playSound('clear');

    if (stageIdx + 1 < currentChapter.stages.length) {
      setGameState('stage_clear');
    } else if (chapterIdx + 1 < CHAPTERS.length) {
      setGameState('chapter_clear');
    } else {
      setGameState('all_clear');
    }
  };

  // 章のイントロを開く
  const openChapterIntro = (targetChapIdx: number, resetTotal = false) => {
    setIsEndless(false);
    setChapterIdx(targetChapIdx);
    setStageIdx(0);
    if (resetTotal) {
      setTotalScore(0);
      setMaxCombo(0);
    }
    setGameState('chapter_intro');
  };

  // ステージ開始
  const startStage = (targetChapIdx: number, targetStageIdx: number) => {
    const cfg = CHAPTERS[targetChapIdx].stages[targetStageIdx];
    setIsEndless(false);
    setChapterIdx(targetChapIdx);
    setStageIdx(targetStageIdx);
    setStageScore(0);
    stageScoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setTimeLeft(cfg.timeLimit);
    setWarnMessage(null);
    setIsStunned(false);
    const freshHoles = createInitialHoles();
    setHoles(freshHoles);
    holesRef.current = freshHoles;
    setGameState('playing');
  };

  // エンドレスモード開始
  const startEndlessMode = () => {
    setIsEndless(true);
    setEndlessLives(3);
    setTotalScore(0);
    setStageScore(0);
    stageScoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setMaxCombo(0);
    setWarnMessage(null);
    setIsStunned(false);
    const freshHoles = createInitialHoles();
    setHoles(freshHoles);
    holesRef.current = freshHoles;
    setGameState('playing');
  };

  // カウントダウンタイマー（通常モードのみ）
  useEffect(() => {
    if (gameState !== 'playing' || isEndless) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isEndless]);

  // 0秒到達時の判定（通常モード）
  useEffect(() => {
    if (gameState !== 'playing' || isEndless || timeLeft > 0) return;

    if (timerRef.current) clearInterval(timerRef.current);
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
    setHoles((h) => h.map((hole) => ({ ...hole, isUp: false, isHit: false })));

    if (stageScoreRef.current >= currentStage.targetScore) {
      triggerClear();
    } else {
      setGameState('game_over');
    }
  }, [timeLeft, gameState, isEndless]);

  // キャラクターランダム出現ループ
  useEffect(() => {
    if (gameState !== 'playing') return;

    const popUp = () => {
      const randomIdx = Math.floor(Math.random() * 9);
      const stayDuration = isEndless
        ? Math.max(380, 650 - Math.floor(stageScoreRef.current / 100) * 15)
        : Math.floor(Math.random() * (currentStage.stayMax - currentStage.stayMin)) + currentStage.stayMin;

      const rand = Math.random();
      let charType: CharType = currentChapter.veggie;

      if (isEndless) {
        if (rand < 0.25) {
          charType = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
        } else {
          charType = VEGGIES[Math.floor(Math.random() * VEGGIES.length)];
        }
      } else {
        if (rand < currentStage.obstacleRate) {
          charType = currentChapter.obstacle;
        } else if (currentChapter.veggie === 'king' && rand < 0.65) {
          charType = VEGGIES[Math.floor(Math.random() * 4)];
        } else if (rand < currentStage.obstacleRate + currentStage.kingRate) {
          charType = 'king';
        }
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
              const isObs = OBSTACLES.includes(hole.charType as ObstacleKey);
              if (hole.isUp && !hole.isHit && !isObs) {
                setCombo(0);
                comboRef.current = 0;
              }
              return { ...hole, isUp: false, isHit: false };
            }
            return hole;
          })
        );
      }, stayDuration);

      const nextInterval = isEndless
        ? Math.max(220, 420 - Math.floor(stageScoreRef.current / 100) * 12)
        : Math.floor(Math.random() * (currentStage.popIntervalMax - currentStage.popIntervalMin)) +
          currentStage.popIntervalMin;
      popTimerRef.current = setTimeout(popUp, nextInterval);
    };

    popUp();

    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, [gameState, isEndless, currentChapter, currentStage]);

  // タップで叩く処理
  const handleWhack = (id: number) => {
    if (gameState !== 'playing' || isStunned) return;

    const targetHole = holesRef.current.find((h) => h.id === id);
    if (targetHole && targetHole.isUp && targetHole.isHit) return;

    if (targetHole && targetHole.isUp && !targetHole.isHit) {
      const hitChar = targetHole.charType;
      const isObstacle = OBSTACLES.includes(hitChar as ObstacleKey);

      setHoles((prev) =>
        prev.map((hole) =>
          hole.id === id
            ? {
                ...hole,
                isHit: true,
                burstKey: Date.now() + Math.random(),
                burstVeggie: isObstacle ? 'warn' : (hitChar as VeggieKey),
              }
            : hole
        )
      );

      if (isObstacle) {
        setCombo(0);
        comboRef.current = 0;
        playSound('bad');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 180);

        if (hitChar === 'cactus') {
          setIsStunned(true);
          setWarnMessage('🌵 サボテンのトゲで1秒しびれた！');
          setTimeout(() => {
            setIsStunned(false);
            setWarnMessage(null);
          }, 1000);
        } else {
          setStageScore((s) => {
            const next = Math.max(0, s - 30);
            stageScoreRef.current = next;
            return next;
          });
          setTotalScore((s) => Math.max(0, s - 30));
          setWarnMessage('⚠️ お邪魔キャラは叩いちゃダメ！ -30点');
          setTimeout(() => setWarnMessage(null), 900);
        }

        if (isEndless) {
          setEndlessLives((l) => {
            if (l <= 1) {
              if (popTimerRef.current) clearTimeout(popTimerRef.current);
              setGameState('game_over');
              return 0;
            }
            return l - 1;
          });
        }
      } else {
        const nextCombo = comboRef.current + 1;
        comboRef.current = nextCombo;
        setCombo(nextCombo);
        setMaxCombo((m) => Math.max(m, nextCombo));

        const isFever = nextCombo >= 10;
        const basePoint = hitChar === 'king' ? 35 : 15;
        const gained = (isFever ? basePoint * 2 : basePoint) + Math.min(nextCombo * 2, 30);

        const nextStageScore = stageScoreRef.current + gained;
        stageScoreRef.current = nextStageScore;
        setStageScore(nextStageScore);
        setTotalScore((s) => s + gained);

        playSound(hitChar === 'king' ? 'king' : 'hit', nextCombo);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 110);

        if (!isEndless && currentStage.instantClear && nextStageScore >= currentStage.targetScore) {
          setTimeout(() => {
            triggerClear();
          }, 220);
        }
      }
    } else {
      setCombo(0);
      comboRef.current = 0;
    }
  };

  // ランク判定
  const getRankLabel = (score: number) => {
    if (score >= 8000) return '👑 SSSランク：伝説の野菜神';
    if (score >= 5000) return '🏆 SSランク：黄金の収穫王';
    if (score >= 3000) return '🥇 Sランク：ベジタブルマスター';
    if (score >= 1500) return '🥈 Aランク：凄腕の農夫';
    return '🌱 Bランク：見習い農夫';
  };

  // LINEでシェア
  const handleLineShare = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const statusText = isEndless
      ? `無限収穫祭モードで ${totalScore}点 達成！`
      : gameState === 'all_clear'
      ? `全5章（全25ステージ）完全制覇！称号：${getRankLabel(totalScore)}`
      : `${currentChapter.name}（Stage ${currentStage.stage}）まで到達！`;
    const text = `⭐【オクラたたき】で遊んだよ！\n${statusText}\n累計スコア：${totalScore}点（最大${maxCombo}コンボ）\n野菜を叩いて神秘の種を届けよう！👇\n${shareUrl}`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank', 'noopener,noreferrer');
  };

  const isFever = gameState === 'playing' && combo >= 10;
  const progressPercent = Math.min(100, Math.round((stageScore / currentStage.targetScore) * 100));
  const isGoalReached = stageScore >= currentStage.targetScore;

  return (
    <main
      className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-center p-3 select-none overflow-hidden ${
        isFever ? 'bg-amber-200' : 'bg-amber-50'
      }`}
    >
      <style>{`
        @keyframes seed-pop-explode {
          0% { transform: translate(-50%, -50%) scale(0.4) rotate(0deg); opacity: 1; }
          20% { transform: translate(calc(-50% + var(--tx) * 0.45), calc(-50% + var(--ty) * 0.45)) scale(1.35) rotate(90deg); opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.3) rotate(240deg); opacity: 0; }
        }
        @keyframes shockwave-ring {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.95; }
          100% { transform: translate(-50%, -50%) scale(2.3); opacity: 0; }
        }
        @keyframes board-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-4px, 3px) rotate(-0.8deg); }
          50% { transform: translate(4px, -3px) rotate(0.8deg); }
          75% { transform: translate(-3px, -2px) rotate(-0.4deg); }
        }
        @keyframes pop-slice {
          0% { transform: translate(-50%, -50%) scale(0.4) rotate(-25deg); opacity: 1; }
          45% { transform: translate(-50%, -85%) scale(1.35) rotate(15deg); opacity: 1; }
          100% { transform: translate(-50%, -120%) scale(0.95) rotate(35deg); opacity: 0; }
        }
        /* プロローグ用：種が舞い降りて新芽が顔を出すループ */
        @keyframes seed-descend {
          0% { transform: translateY(-6px) scale(0.8); opacity: 0; }
          25% { opacity: 1; }
          65% { transform: translateY(34px) scale(1.1); opacity: 1; }
          85%, 100% { transform: translateY(42px) scale(0.2); opacity: 0; }
        }
        @keyframes sprout-pop {
          0%, 55% { transform: scale(0) translateY(8px); opacity: 0; }
          75% { transform: scale(1.25) translateY(-2px); opacity: 1; }
          88%, 100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fade-slide-up {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        /* エピローグ用：4種回転合体・王様ジャンプ・紙吹雪 */
        @keyframes orbit-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(0.82); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes king-celebrate {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-7px) scale(1.06); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(230px) rotate(360deg); opacity: 0; }
        }
        .animate-seed-explode { animation: seed-pop-explode 0.46s cubic-bezier(0.12, 0.95, 0.25, 1) forwards; }
        .animate-shockwave { animation: shockwave-ring 0.32s ease-out forwards; }
        .animate-board-shake { animation: board-shake 0.12s ease-in-out; }
        .animate-pop-slice { animation: pop-slice 0.48s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-seed-descend { animation: seed-descend 2.8s ease-in-out infinite; }
        .animate-sprout-pop { animation: sprout-pop 2.8s ease-out infinite; }
        .animate-story-line-1 { animation: fade-slide-up 0.5s ease-out 0.1s both; }
        .animate-story-line-2 { animation: fade-slide-up 0.5s ease-out 0.35s both; }
        .animate-story-line-3 { animation: fade-slide-up 0.5s ease-out 0.6s both; }
        .animate-orbit-seeds { animation: orbit-spin 5s linear infinite; }
        .animate-king-celebrate { animation: king-celebrate 1.4s ease-in-out infinite; }
        .animate-confetti-fall { animation: confetti-fall linear infinite; }
      `}</style>

      <div
        className={`max-w-md w-full rounded-3xl p-2.5 border-4 transition-all duration-500 shadow-2xl ${
          isEndless ? 'bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 border-yellow-500' : currentStage.farmBgClass
        } ${isShaking ? 'animate-board-shake' : ''}`}
      >
        {/* 上部畑ステータス */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-white/90 rounded-2xl text-xs font-bold text-gray-700 shadow-sm">
          <span>{isEndless ? '♾️ 無限・黄金の収穫祭' : `${currentChapter.name}｜${currentStage.farmLabel}`}</span>
          <span className="tracking-widest text-sm">{isEndless ? '👑🌈✨' : currentStage.farmIcons.join('')}</span>
        </div>

        {/* メインカード */}
        <div
          className={`bg-white rounded-2xl p-5 border-4 transition-all ${
            isFever ? 'border-yellow-400 ring-4 ring-yellow-300/70' : 'border-green-600'
          }`}
        >
          {/* タイトルヘッダー */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-green-700">
              <OkuraSliceIcon className="w-8 h-8 shrink-0 drop-shadow-sm" />
              <span>オクラたたき</span>
            </h1>
            {isFever ? (
              <span className="px-2.5 py-0.5 text-xs font-black bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full animate-bounce shadow">
                🔥 FEVER 2倍！
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                {isEndless ? 'エンドレスモード' : currentStage.title}
              </span>
            )}
          </div>

          {/* タイトル画面（プロローグアニメーション付き） */}
          {gameState === 'title' && (
            <div className="space-y-3.5 py-1 text-center">
              <PrologueAnimationStage />

              <div className="grid grid-cols-5 gap-1.5 text-center bg-green-50 p-2 rounded-xl border border-green-200">
                <div><span className="text-xl block">⭐</span><span className="text-[10px] font-bold">1.オクラ</span></div>
                <div><span className="text-xl block">🍅</span><span className="text-[10px] font-bold">2.トマト</span></div>
                <div><span className="text-xl block">🌶️</span><span className="text-[10px] font-bold">3.唐辛子</span></div>
                <div><span className="text-xl block">🍉</span><span className="text-[10px] font-bold">4.スイカ</span></div>
                <div><span className="text-xl block">👑</span><span className="text-[10px] font-bold">5.王様</span></div>
              </div>

              <button
                type="button"
                onClick={() => openChapterIntro(0, true)}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-black text-lg rounded-xl shadow-lg transition-colors"
              >
                冒険をスタートする！ ➔
              </button>

              <button
                type="button"
                onClick={handleLineShare}
                className="w-full py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm rounded-xl shadow flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>LINEで友達にシェアする</span>
              </button>
            </div>
          )}

          {/* 章のイントロ画面 */}
          {gameState === 'chapter_intro' && (
            <div className="space-y-4 py-3 text-center">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-black rounded-full">
                {currentChapter.name}
              </div>
              <h2 className="text-xl font-black text-gray-800">{currentChapter.subtitle}</h2>

              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-left space-y-2">
                <p className="animate-story-line-1 text-xs font-bold text-gray-800 leading-relaxed">
                  「{currentChapter.storyIntro}」
                </p>
                <div className="animate-story-line-2 pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-green-700">🎯 ターゲット：{currentChapter.veggieName}</span>
                  <span className="font-bold text-red-600">⚠️ 注意：{currentChapter.obstacleName}</span>
                </div>
                <p className="animate-story-line-3 text-[11px] text-red-600 font-bold">
                  ※ {currentChapter.obstacleName}：{currentChapter.obstacleDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => startStage(chapterIdx, 0)}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-xl shadow-md"
              >
                Stage 1 スタート！
              </button>
            </div>
          )}

          {/* プレイ中 ＆ リザルト共通盤面 */}
          {gameState !== 'title' && gameState !== 'chapter_intro' && (
            <>
              {/* 進捗ゲージ */}
              <div className="mb-3">
                <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                  {isEndless ? (
                    <span>のこりライフ：{'❤️'.repeat(endlessLives)}{'🖤'.repeat(3 - endlessLives)}</span>
                  ) : (
                    <span className={isGoalReached ? 'text-orange-600 font-black' : ''}>
                      目標：{stageScore} / {currentStage.targetScore}点
                    </span>
                  )}
                  <span>累計：{totalScore}点</span>
                </div>
                {!isEndless && (
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isGoalReached ? 'bg-yellow-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* コンボ・残り時間 */}
              <div className="grid grid-cols-2 gap-2 bg-green-50 rounded-xl px-3 py-2 mb-3 border border-green-200">
                <div className="text-center border-r border-green-200">
                  <span className="block text-[10px] font-bold text-orange-700">コンボ</span>
                  <span
                    className={`text-lg font-black inline-block transition-transform ${
                      combo >= 5 ? 'text-orange-600 scale-110' : 'text-gray-700'
                    }`}
                  >
                    {combo}
                    <span className="text-xs ml-0.5">連鎖</span>
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-red-800">
                    {isEndless ? '最大コンボ' : 'のこり時間'}
                  </span>
                  <span
                    className={`text-lg font-black ${
                      !isEndless && timeLeft <= 5 && gameState === 'playing'
                        ? 'text-red-600 animate-pulse'
                        : 'text-gray-800'
                    }`}
                  >
                    {isEndless ? `${maxCombo}連鎖` : `${timeLeft}秒`}
                  </span>
                </div>
              </div>

              {/* 警告バー */}
              <div className="h-5 mb-2 flex items-center justify-center">
                {warnMessage ? (
                  <span className="text-xs font-black text-red-600 bg-red-100 px-3 py-0.5 rounded-full animate-pulse">
                    {warnMessage}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-500 font-medium">
                    {isEndless
                      ? '※ お邪魔キャラ3回ミスで終了！限界に挑め！'
                      : `※ ${currentChapter.obstacleName}注意！（${
                          currentStage.instantClear ? '目標到達で即クリア' : '0秒まで目標キープ'
                        }）`}
                  </span>
                )}
              </div>

              {/* 3x3 穴グリッド（全章クリアのエピローグ表示時は畳んで演出に集中） */}
              {gameState !== 'all_clear' && (
                <div
                  className={`grid grid-cols-3 gap-3 bg-amber-800 p-3.5 rounded-2xl shadow-inner mb-4 transition-opacity ${
                    isStunned ? 'opacity-60 ring-4 ring-yellow-400' : ''
                  }`}
                >
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
                          <CharacterIllustration charType={hole.charType} isHit={hole.isHit} />
                        </div>
                      </button>

                      {hole.burstKey > 0 && (
                        <div key={hole.burstKey} className="pointer-events-none absolute inset-0 z-30">
                          <BurstEffect burstVeggie={hole.burstVeggie} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* リザルト・進行ボタン */}
              {gameState !== 'playing' && (
                <div className="space-y-2.5 text-center">
                  {gameState === 'stage_clear' && (
                    <div className="bg-green-100 border-2 border-green-400 rounded-xl p-3">
                      <p className="text-base font-black text-green-800">🎉 {currentStage.title} クリア！</p>
                      <p className="text-xs font-bold text-green-700 mt-1">畑が一段階育ったで！次のステージへ！</p>
                    </div>
                  )}

                  {gameState === 'chapter_clear' && (
                    <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 rounded-xl p-3.5">
                      <p className="text-base font-black text-amber-900">🎊 {currentChapter.name} 完全制覇！</p>
                      <p className="animate-story-line-1 text-xs font-bold text-gray-800 mt-1">{currentChapter.storyClear}</p>
                      <span className="animate-story-line-2 inline-block mt-1.5 px-3 py-0.5 bg-white rounded-full text-xs font-black text-orange-600 shadow-sm">
                        獲得：{currentChapter.seedReward}
                      </span>
                    </div>
                  )}

                  {gameState === 'all_clear' && (
                    <EpilogueAnimationStage
                      storyClear={currentChapter.storyClear}
                      rankLabel={getRankLabel(totalScore)}
                      totalScore={totalScore}
                      maxCombo={maxCombo}
                    />
                  )}

                  {gameState === 'game_over' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-base font-black text-red-700">
                        {isEndless ? '無限収穫祭 終了！' : `時間切れ！あと ${currentStage.targetScore - stageScore}点！`}
                      </p>
                      <p className="text-xs font-bold text-gray-700 mt-1">
                        累計スコア：{totalScore}点（最大{maxCombo}連鎖）
                      </p>
                    </div>
                  )}

                  {/* メイン遷移ボタン */}
                  {gameState === 'stage_clear' && (
                    <button
                      type="button"
                      onClick={() => startStage(chapterIdx, stageIdx + 1)}
                      className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-xl shadow-md"
                    >
                      次のステージへ進む！ ➔
                    </button>
                  )}

                  {gameState === 'chapter_clear' && (
                    <button
                      type="button"
                      onClick={() => openChapterIntro(chapterIdx + 1, false)}
                      className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-xl shadow-md"
                    >
                      {CHAPTERS[chapterIdx + 1].name} へ進む！ ➔
                    </button>
                  )}

                  {gameState === 'all_clear' && (
                    <button
                      type="button"
                      onClick={startEndlessMode}
                      className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-base rounded-xl shadow-md"
                    >
                      ♾️ クリア特典：無限・黄金の収穫祭に挑む！
                    </button>
                  )}

                  {gameState === 'game_over' && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => (isEndless ? startEndlessMode() : startStage(chapterIdx, 0))}
                        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black text-base rounded-xl shadow-md"
                      >
                        {isEndless ? '無限収穫祭にもう一回挑む！' : `${currentChapter.name}のStage 1からリトライ！`}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLineShare}
                    className="w-full py-3 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm rounded-xl shadow flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    <span>LINEで友達にシェアする</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameState('title')}
                    className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                  >
                    タイトルへ戻る
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 下部の畑アイコンライン */}
        <div className="flex justify-around items-center pt-2 text-lg">
          {(isEndless ? ['⭐', '🍅', '🌶️', '🍉', '👑'] : currentStage.farmIcons).map((icon, i) => (
            <span key={i}>{icon}</span>
          ))}
        </div>
      </div>

      {/* 🔧 テスト用クイックジャンプバー（公開前に削除可能） */}
      <div className="max-w-md w-full mt-3 text-center">
        <button
          type="button"
          onClick={() => setShowDevMenu((v) => !v)}
          className="text-[11px] font-bold text-gray-500 underline"
        >
          {showDevMenu ? '▲ テストメニューを閉じる' : '🔧 テスト用：各章ジャンプ＆即クリア'}
        </button>

        {showDevMenu && (
          <div className="mt-2 p-2.5 bg-gray-800 text-white rounded-xl text-xs space-y-2 shadow-lg">
            <p className="text-[10px] text-gray-300">※ 動作確認用ショートカット</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {CHAPTERS.map((chap, idx) => (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => openChapterIntro(idx, false)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[11px] font-bold"
                >
                  第{chap.id}章
                </button>
              ))}
              <button
                type="button"
                onClick={startEndlessMode}
                className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-[11px] font-bold"
              >
                ♾️無限
              </button>
              <button
                type="button"
                onClick={() => {
                  setChapterIdx(4);
                  setStageIdx(4);
                  setIsEndless(false);
                  setGameState('all_clear');
                }}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 rounded text-[11px] font-bold"
              >
                🎊エピローグ
              </button>
            </div>
            {gameState === 'playing' && !isEndless && (
              <button
                type="button"
                onClick={triggerClear}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-xs"
              >
                ⚡ 今のステージを強制クリア
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
