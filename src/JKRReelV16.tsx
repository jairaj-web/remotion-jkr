import React, { useEffect } from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
  continueRender, delayRender,
} from 'remotion';
import { loadFont as loadCinzel }  from '@remotion/google-fonts/Cinzel';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';

const cinzel  = loadCinzel('normal', { weights: ['700'] });
const raleway = loadRaleway('normal', { weights: ['300', '400', '600'] });

// V16 — "PRESTIGE" — Void black + electric gold + teal accent, word-pop, story dots, pull-up
const VOID   = '#070810';
const GOLD   = '#E8C44A';
const GOLD2  = '#FFD97A';
const TEAL   = '#2DD4BF';
const WHITE  = '#FFFFFF';
const GOLD_D = '#A8892C';

// Hook:45 + 4 shots:180 + Counter:45 + Duo:45 + TriStrip:45 + CTA:240 = 600f
const SHOTS_V16: Array<{
  isHook?: boolean; isCTA?: boolean; isCounter?: boolean;
  isDuo?: boolean; isTriStrip?: boolean;
  img?: string; imgL?: string; imgR?: string; images?: string[];
  tag?: string; line1?: string; line2?: string;
  frames: number; sectionIdx?: number;
}> = [
  { isHook: true,     img: 'g14_venue1.webp',                                                               frames: 45, sectionIdx: 0 },
  { img: 'v12_exterior2.webp',  tag:'01', line1: "North Bangalore's", line2: "Pride & Glory",              frames: 45, sectionIdx: 1 },
  { img: 'v9_ceremony.webp',    tag:'02', line1: 'Sacred Ceremonies', line2: 'Beautifully Done',           frames: 45, sectionIdx: 2 },
  { img: 'v10_shot1_rooftop.webp', tag:'03', line1: 'Rooftop Views', line2: 'Unmatched',                  frames: 45, sectionIdx: 3 },
  { img: 'v12_mandap2.webp',    tag:'04', line1: 'Timeless Mandaps', line2: 'Crafted To Perfection',      frames: 45, sectionIdx: 4 },
  { isCounter: true,  img: 'v12_aerial_lawn.webp',                                                          frames: 45, sectionIdx: 5 },
  { isDuo: true,      imgL: 'w05_svl746.webp', imgR: 'w07_svl830.webp',                                   frames: 45, sectionIdx: 6 },
  { isTriStrip: true, images: ['g02_gallery1.webp','g05_gallery5.webp','g08_gallery10.webp'],               frames: 45, sectionIdx: 7 },
  { isCTA: true,      img: 'w_cta_photography.webp',                                                        frames: 240 },
];

export const TOTAL_FRAMES_V16 = SHOTS_V16.reduce((a, s) => a + s.frames, 0); // 600

const TOTAL_DOTS = 8; // 0-7 story sections (excluding CTA)

// ── Pull-up Ken Burns (image slides up from bottom on entry) ──────────────────
const PullUp: React.FC<{ src: string; totalFrames: number }> = ({ src, totalFrames }) => {
  const frame = useCurrentFrame();
  const ty  = interpolate(frame, [0, 20], [60, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const sc  = interpolate(frame, [0, totalFrames], [1.12, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const sat = interpolate(frame, [0, 20], [10, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const brt = interpolate(frame, [0, 14], [0.3, 1.0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `translateY(${ty}px) scale(${sc})`,
          filter: `saturate(${sat}%) brightness(${brt})`,
        }}
      />
    </div>
  );
};

// ── Flash on entry ────────────────────────────────────────────────────────────
const FlashV16: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 10], [0.85, 0], { extrapolateRight: 'clamp' });
  return <div style={{ position: 'absolute', inset: 0, backgroundColor: WHITE, opacity: op, pointerEvents: 'none', zIndex: 90 }} />;
};

// ── Story progress dots (top center) ─────────────────────────────────────────
const StoryDots: React.FC<{ active: number }> = ({ active }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [6, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 28, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, opacity: op, zIndex: 100 }}>
      {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
        <div key={i} style={{
          height: 4, borderRadius: 2,
          width: i === active ? 28 : 14,
          background: i === active ? GOLD : `${WHITE}30`,
          boxShadow: i === active ? `0 0 8px ${GOLD}99` : 'none',
          transition: 'none',
        }} />
      ))}
    </div>
  );
};

// ── Word-by-word pop reveal ───────────────────────────────────────────────────
const WordPop: React.FC<{
  text: string; size: number; color?: string; weight?: number;
  spacing?: string; delay?: number; stagger?: number; font?: 'cinzel' | 'raleway';
}> = ({ text, size, color = WHITE, weight = 700, spacing = '0.04em', delay = 0, stagger = 5, font = 'cinzel' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const ff = font === 'cinzel' ? cinzel.fontFamily : raleway.fontFamily;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center', gap: '0 12px' }}>
      {words.map((word, i) => {
        const p  = spring({ frame: Math.max(0, frame - delay - i * stagger), fps, config: { damping: 13, stiffness: 380, mass: 0.55 } });
        const ty = interpolate(p, [0, 1], [55, 0]);
        const sc = interpolate(p, [0, 1], [0.5, 1]);
        const op = interpolate(p, [0, 0.15, 1], [0, 1, 1]);
        return (
          <span key={i} style={{
            display: 'inline-block',
            transform: `translateY(${ty}px) scale(${sc})`,
            opacity: op,
            fontFamily: ff, fontSize: size, fontWeight: weight as any,
            color, letterSpacing: spacing, lineHeight: 1.15,
            textShadow: '0 3px 30px rgba(0,0,0,0.95)',
          }}>{word}</span>
        );
      })}
    </div>
  );
};

// ── Slide-in line ─────────────────────────────────────────────────────────────
const SlideIn: React.FC<{ text: string; size: number; color?: string; delay?: number; weight?: number; spacing?: string; fromRight?: boolean }> = ({ text, size, color = TEAL, delay = 0, weight = 300, spacing = '0.28em', fromRight = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 260, mass: 0.7 } });
  const tx = interpolate(p, [0, 1], [fromRight ? 40 : -40, 0]);
  const op = interpolate(p, [0, 0.2, 1], [0, 1, 1]);
  return (
    <div style={{ overflow: 'hidden', width: '100%', textAlign: 'center' as const }}>
      <div style={{ transform: `translateX(${tx}px)`, opacity: op, fontFamily: raleway.fontFamily, fontSize: size, fontWeight: weight as any, color, letterSpacing: spacing, textTransform: 'uppercase' as const, textShadow: `0 0 20px ${TEAL}44` }}>{text}</div>
    </div>
  );
};

// ── Gold rule ─────────────────────────────────────────────────────────────────
const GoldRule: React.FC<{ delay?: number; width?: number }> = ({ delay = 4, width = 80 }) => {
  const frame = useCurrentFrame();
  const w  = interpolate(frame - delay, [0, 20], [0, width], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ height: 2, width: w, background: `linear-gradient(90deg, transparent, ${GOLD_D}, ${GOLD}, ${GOLD2}, ${GOLD}, ${GOLD_D}, transparent)`, boxShadow: `0 0 12px ${GOLD}88` }} />
    </div>
  );
};

// ── Teal rule ─────────────────────────────────────────────────────────────────
const TealRule: React.FC<{ delay?: number; width?: number }> = ({ delay = 4, width = 60 }) => {
  const frame = useCurrentFrame();
  const w  = interpolate(frame - delay, [0, 18], [0, width], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ height: 1.5, width: w, background: `linear-gradient(90deg, transparent, ${TEAL}88, ${TEAL}, ${TEAL}88, transparent)`, boxShadow: `0 0 10px ${TEAL}55` }} />
    </div>
  );
};

// ── Logo ───────────────────────────────────────────────────────────────────────
const LogoV16: React.FC<{ size?: number; delay?: number }> = ({ size = 130, delay = 5 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ty = interpolate(frame - delay, [0, 16], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', top: 58, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${ty}px)` }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: size, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 18px ${GOLD}AA)` }} />
    </div>
  );
};

// ── Location badge (bottom-left) ───────────────────────────────────────────────
const LocationBadge: React.FC<{ delay?: number }> = ({ delay = 10 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tx = interpolate(frame - delay, [0, 14], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', bottom: 64, left: 36, opacity: op, transform: `translateX(${tx}px)` }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingLeft: 16, paddingRight: 18, paddingTop: 8, paddingBottom: 8,
        background: 'rgba(7,8,16,0.78)', backdropFilter: 'blur(14px)',
        border: `1px solid ${TEAL}44`, borderRadius: 30,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, boxShadow: `0 0 8px ${TEAL}` }} />
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 14, color: `${WHITE}88`, letterSpacing: '0.22em', fontWeight: 300 }}>NORTH BANGALORE</div>
      </div>
    </div>
  );
};

// ── Gold motes ─────────────────────────────────────────────────────────────────
const MOTE_DATA = [
  { x:8,  spd:1.0, sz:3, dl:0  }, { x:22, spd:0.8, sz:4, dl:7  },
  { x:50, spd:1.3, sz:3, dl:2  }, { x:72, spd:0.9, sz:4, dl:14 },
  { x:88, spd:1.1, sz:3, dl:5  }, { x:95, spd:0.7, sz:3, dl:19 },
];
const MotesV16: React.FC<{ color?: string }> = ({ color = GOLD }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {MOTE_DATA.map((m, i) => {
        const f  = Math.max(0, frame - m.dl);
        const y  = (1920 + m.sz) - (f * m.spd * 2.8) % 1960;
        const dx = Math.sin(f * 0.038 + i * 1.6) * 13;
        const op = interpolate(f, [0, 14], [0, 0.55], { extrapolateRight: 'clamp' }) * (0.3 + 0.7 * Math.abs(Math.sin(f * 0.07 + i)));
        return <div key={i} style={{ position: 'absolute', left: `${m.x}%`, top: y, transform: `translateX(${dx}px)`, width: m.sz, height: m.sz, borderRadius: '50%', backgroundColor: color, opacity: op, boxShadow: `0 0 ${m.sz * 5}px ${color}` }} />;
      })}
    </div>
  );
};

// ── Ticker ─────────────────────────────────────────────────────────────────────
const TickerV16: React.FC = () => {
  const frame = useCurrentFrame();
  const T = 'JKR FARMS & RESORTS  ◆  NORTH BANGALORE  ◆  6 ACRES  ◆  1000+ GUESTS  ◆  73385 01337  ◆  jkrfarmsandresorts.com  ◆  ';
  const x  = -(frame * 1.6) % (T.length * 13.8);
  const op = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: `rgba(7,8,16,0.90)`, backdropFilter: 'blur(16px)', borderTop: `1px solid ${GOLD}18`, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: op }}>
      <div style={{ whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: raleway.fontFamily, fontSize: 13, color: `${GOLD}40`, letterSpacing: '0.22em', fontWeight: 300 }}>{T.repeat(6)}</div>
    </div>
  );
};

// ── Gradient overlay (bottom-heavy) ───────────────────────────────────────────
const BottomPanel: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(180deg,
      rgba(7,8,16,0.70) 0%,
      rgba(7,8,16,0.20) 22%,
      transparent 40%,
      transparent 50%,
      rgba(7,8,16,0.55) 72%,
      rgba(7,8,16,0.92) 100%)`,
  }} />
);

// ── Hook ───────────────────────────────────────────────────────────────────────
const HookV16: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgSc = interpolate(frame, [0, frames], [1.16, 1.04], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  // "JKR" — left word, then middle, then right
  const words = ['J·K·R', 'FARMS', '& RESORTS'];
  const wordDelays = [6, 14, 22];

  // Gold slash accent
  const slashOp = interpolate(frame, [4, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slashW  = interpolate(frame, [4, 20], [0, 1080], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Teal accent line
  const tealOp = interpolate(frame, [18, 28], [0, 1], { extrapolateRight: 'clamp' });

  // Tagline
  const tagP  = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 16, stiffness: 240, mass: 0.7 } });
  const tagTy = interpolate(tagP, [0, 1], [28, 0]);
  const tagOp = interpolate(tagP, [0, 0.25, 1], [0, 1, 1]);

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: VOID, opacity: fadeOut }}>
      {/* BG image blurred dark */}
      <div style={{ position: 'absolute', inset: 0, opacity: bgOp }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgSc})`, filter: 'blur(6px) brightness(0.12) saturate(20%)' }} />
      </div>

      {/* Gold horizontal slash across screen */}
      <div style={{ position: 'absolute', top: '50%', left: 0, marginTop: -1, width: slashW, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}44, ${GOLD}22, transparent)`, opacity: slashOp }} />

      <FlashV16 />
      <MotesV16 />
      <StoryDots active={0} />

      {/* Center content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Logo */}
        <div style={{ marginBottom: 20 }}>
          <LogoV16 size={110} delay={3} />
        </div>
        <div style={{ height: 100 }} />

        {/* J·K·R */}
        {words.map((word, i) => {
          const p  = spring({ frame: Math.max(0, frame - wordDelays[i]), fps, config: { damping: 11, stiffness: 420, mass: 0.5 } });
          const sc = interpolate(p, [0, 1], [0.3, 1]);
          const op = interpolate(p, [0, 0.18, 1], [0, 1, 1]);
          const fontSize = i === 0 ? 148 : i === 1 ? 94 : 48;
          const color    = i === 0 ? GOLD : i === 1 ? WHITE : `${WHITE}88`;
          const spacing  = i === 0 ? '0.22em' : i === 1 ? '0.18em' : '0.32em';
          return (
            <div key={i} style={{ transform: `scale(${sc})`, opacity: op, fontFamily: cinzel.fontFamily, fontSize, fontWeight: 700, color, letterSpacing: spacing, lineHeight: i === 0 ? 1 : 1.1, textShadow: i === 0 ? `0 0 60px ${GOLD}77, 0 6px 40px rgba(0,0,0,0.95)` : '0 4px 30px rgba(0,0,0,0.9)' }}>
              {word}
            </div>
          );
        })}

        {/* Teal accent rule */}
        <div style={{ marginTop: 16, opacity: tealOp }}>
          <TealRule delay={0} width={120} />
        </div>

        {/* Tagline */}
        <div style={{ marginTop: 18, overflow: 'hidden' }}>
          <div style={{ transform: `translateY(${tagTy}px)`, opacity: tagOp, fontFamily: raleway.fontFamily, fontSize: 20, fontWeight: 300, color: `${WHITE}70`, letterSpacing: '0.35em', textTransform: 'uppercase' as const }}>
            North Bangalore's Premier Estate
          </div>
        </div>
      </div>

      <TickerV16 />
    </AbsoluteFill>
  );
};

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotV16: React.FC<{
  img: string; frames: number; tag?: string;
  line1?: string; line2?: string; sectionIdx: number;
}> = ({ img, frames, tag, line1, line2, sectionIdx }) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: VOID, opacity: fadeOut }}>
      <PullUp src={img} totalFrames={frames} />
      <FlashV16 />
      <BottomPanel />
      <MotesV16 />
      <StoryDots active={sectionIdx} />
      <LogoV16 delay={5} />
      <LocationBadge delay={10} />

      {/* Shot number — top-left teal badge */}
      {tag && (() => {
        const op = interpolate(frame - 6, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const ty = interpolate(frame - 6, [0, 12], [-14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
        return (
          <div style={{ position: 'absolute', top: 58, left: 36, opacity: op, transform: `translateY(${ty}px)` }}>
            <div style={{ fontFamily: raleway.fontFamily, fontSize: 13, color: TEAL, letterSpacing: '0.28em', fontWeight: 600, textShadow: `0 0 14px ${TEAL}88` }}>
              {tag} <span style={{ color: `${WHITE}33` }}>/ 04</span>
            </div>
          </div>
        );
      })()}

      {/* Text block — bottom third */}
      <div style={{ position: 'absolute', bottom: 68, left: 0, right: 0, paddingLeft: 48, paddingRight: 48, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6 }}>
        <TealRule delay={4} width={50} />
        <div style={{ height: 8 }} />
        <WordPop text={line1!} size={82} color={WHITE} delay={6} stagger={5} font="cinzel" />
        <WordPop text={line2!} size={82} color={GOLD} delay={6 + (line1!.split(' ').length * 5)} stagger={5} font="cinzel" />
        <div style={{ height: 8 }} />
        <GoldRule delay={12} width={70} />
      </div>

      <TickerV16 />
    </AbsoluteFill>
  );
};

// ── Counter shot — 3 animated stat cards ──────────────────────────────────────
const CounterV16: React.FC<{ img: string; frames: number; sectionIdx: number }> = ({ img, frames, sectionIdx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const acreCount   = Math.floor(interpolate(frame, [8, 32], [0, 6], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const guestCount  = Math.floor(interpolate(frame, [12, 38], [0, 1000], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const hallCount   = Math.floor(interpolate(frame, [16, 38], [0, 15], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));

  const stats = [
    { value: `${acreCount}`, suffix: '+', label: 'ACRES', color: GOLD, delay: 4 },
    { value: `${guestCount}`, suffix: '+', label: 'GUESTS', color: WHITE, delay: 10 },
    { value: `${hallCount}`, suffix: '+', label: 'EVENT HALLS', color: TEAL, delay: 16 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: VOID, opacity: fadeOut }}>
      <PullUp src={img} totalFrames={frames} />
      <FlashV16 />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,8,16,0.72)' }} />
      <MotesV16 />
      <StoryDots active={sectionIdx} />
      <LogoV16 delay={5} />
      <LocationBadge delay={10} />

      {/* Label at top-center */}
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10 }}>
        <SlideIn text="The Scale Of Grandeur" size={18} color={`${TEAL}CC`} delay={4} spacing="0.28em" />
        <GoldRule delay={6} width={60} />
      </div>

      {/* 3 stat cards */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', gap: 22, paddingLeft: 32, paddingRight: 32 }}>
        {stats.map((s, i) => {
          const p  = spring({ frame: Math.max(0, frame - s.delay), fps, config: { damping: 14, stiffness: 280, mass: 0.75 } });
          const sc = interpolate(p, [0, 1], [0.4, 1]);
          const op = interpolate(p, [0, 0.3, 1], [0, 1, 1]);
          const glow = 0.5 + 0.5 * Math.sin(frame * 0.14 + i * 1.2);
          return (
            <div key={i} style={{ transform: `scale(${sc})`, opacity: op, flex: 1 }}>
              <div style={{
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8,
                paddingTop: 28, paddingBottom: 28, paddingLeft: 12, paddingRight: 12,
                background: `rgba(7,8,16,0.72)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${s.color}30`,
                borderRadius: 12,
                boxShadow: `0 0 ${20 + 12 * glow}px ${s.color}${Math.round(12 + 10 * glow).toString(16)}`,
              }}>
                <div style={{ fontFamily: cinzel.fontFamily, fontSize: 72, fontWeight: 700, color: s.color, lineHeight: 1, textShadow: `0 0 ${28 + 18 * glow}px ${s.color}${Math.round(55 + 40 * glow).toString(16)}` }}>
                  {s.value}<span style={{ fontSize: 36 }}>{s.suffix}</span>
                </div>
                <div style={{ width: 30, height: 1.5, background: s.color, opacity: 0.5 }} />
                <div style={{ fontFamily: raleway.fontFamily, fontSize: 14, color: `${WHITE}70`, letterSpacing: '0.24em', fontWeight: 300 }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <TickerV16 />
    </AbsoluteFill>
  );
};

// ── Duo shot — side by side, teal divider ─────────────────────────────────────
const DuoV16: React.FC<{ imgL: string; imgR: string; frames: number; sectionIdx: number }> = ({ imgL, imgR, frames, sectionIdx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pL = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 20, stiffness: 200, mass: 1.0 } });
  const xL = interpolate(pL, [0, 1], [-560, 0]);
  const pR = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 20, stiffness: 200, mass: 1.0 } });
  const xR = interpolate(pR, [0, 1], [560, 0]);

  const divOp = interpolate(frame, [12, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textP  = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 16, stiffness: 240, mass: 0.75 } });
  const textTy = interpolate(textP, [0, 1], [32, 0]);
  const textOp = interpolate(textP, [0, 0.2, 1], [0, 1, 1]);

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: VOID, opacity: fadeOut }}>
      {/* Left panel */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${xL}px)` }}>
        <Img src={staticFile(`images/${imgL}`)} style={{ width: '200%', height: '100%', objectFit: 'cover', filter: 'brightness(0.70) saturate(120%)' }} />
      </div>
      {/* Right panel */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', right: 0, overflow: 'hidden', transform: `translateX(${xR}px)` }}>
        <Img src={staticFile(`images/${imgR}`)} style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', objectFit: 'cover', filter: 'brightness(0.70) saturate(120%)' }} />
      </div>

      {/* Teal center divider */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, background: `linear-gradient(180deg, transparent 5%, ${TEAL}BB 30%, ${TEAL} 50%, ${TEAL}BB 70%, transparent 95%)`, opacity: divOp, boxShadow: `0 0 14px ${TEAL}88, 0 0 30px ${TEAL}44` }} />

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(7,8,16,0.88) 0%, rgba(7,8,16,0.55) 32%, transparent 55%, transparent 68%, rgba(7,8,16,0.82) 100%)`, pointerEvents: 'none' }} />

      <FlashV16 />
      <MotesV16 color={TEAL} />
      <StoryDots active={sectionIdx} />
      <LogoV16 delay={5} />

      {/* Center text */}
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10, transform: `translateY(${textTy}px)`, opacity: textOp }}>
        <TealRule delay={0} width={55} />
        <div style={{ fontFamily: cinzel.fontFamily, fontSize: 66, fontWeight: 700, color: WHITE, letterSpacing: '0.06em', textAlign: 'center' as const, lineHeight: 1.2, textShadow: '0 4px 32px rgba(0,0,0,0.95)' }}>
          Luxury In<br/>Every Corner
        </div>
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 18, color: `${TEAL}CC`, letterSpacing: '0.32em', textTransform: 'uppercase' as const }}>Suites · Lawns · Halls</div>
        <TealRule delay={0} width={55} />
      </div>

      {/* Bottom label pills */}
      <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingLeft: 48, paddingRight: 48, opacity: textOp }}>
        {['Wedding Suites', 'Grand Lawns'].map((label, i) => (
          <div key={i} style={{
            paddingLeft: 26, paddingRight: 26, paddingTop: 10, paddingBottom: 10,
            border: `1px solid ${TEAL}50`, borderRadius: 30,
            background: 'rgba(7,8,16,0.75)', backdropFilter: 'blur(12px)',
            fontFamily: raleway.fontFamily, fontSize: 15, color: `${TEAL}CC`, letterSpacing: '0.18em',
          }}>{label}</div>
        ))}
      </div>

      <TickerV16 />
    </AbsoluteFill>
  );
};

// ── Tri-strip — 3 horizontal images ───────────────────────────────────────────
const TriStrip: React.FC<{ images: string[]; frames: number; sectionIdx: number }> = ({ images, frames, sectionIdx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const textP  = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 15, stiffness: 220, mass: 0.85 } });
  const textSc = interpolate(textP, [0, 1], [0.85, 1]);
  const textOp = interpolate(textP, [0, 0.3, 1], [0, 1, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: VOID, opacity: fadeOut }}>
      {/* 3-column horizontal strip */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'row' as const, gap: 6 }}>
        {images.map((img, i) => {
          const delay = 2 + i * 7;
          const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 22, stiffness: 240, mass: 0.85 } });
          const ty = interpolate(p, [0, 1], [80, 0]);
          const op = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
          return (
            <div key={i} style={{ flex: 1, overflow: 'hidden', opacity: op, transform: `translateY(${ty}px)` }}>
              <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.60) saturate(125%)' }} />
            </div>
          );
        })}
      </div>

      {/* Dark overlay for text */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,8,16,0.50)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 38% at 50% 54%, rgba(7,8,16,0.88) 0%, transparent 100%)', pointerEvents: 'none' }} />

      <MotesV16 />
      <StoryDots active={sectionIdx} />
      <LogoV16 delay={5} />

      {/* Center text */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: `translateY(-50%) scale(${textSc})`, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12, opacity: textOp }}>
        <GoldRule delay={0} width={72} />
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 20, color: `${GOLD}AA`, letterSpacing: '0.34em', textTransform: 'uppercase' as const, textShadow: '0 2px 20px rgba(0,0,0,0.95)' }}>Every Moment</div>
        <WordPop text="PERFECTED" size={96} color={WHITE} delay={24} stagger={6} font="cinzel" />
        <div style={{ height: 4 }} />
        <GoldRule delay={0} width={72} />

        {/* Three venue type tags */}
        <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
          {['Gallery', 'Events', 'Celebrations'].map((t, i) => {
            const bP  = spring({ frame: Math.max(0, frame - 28 - i * 5), fps, config: { damping: 16, stiffness: 300, mass: 0.55 } });
            const bSc = interpolate(bP, [0, 1], [0, 1]);
            const bOp = interpolate(bP, [0, 0.35, 1], [0, 1, 1]);
            return (
              <div key={i} style={{ transform: `scale(${bSc})`, opacity: bOp }}>
                <div style={{
                  paddingLeft: 22, paddingRight: 22, paddingTop: 9, paddingBottom: 9,
                  border: `1px solid ${GOLD}55`, borderRadius: 4,
                  background: 'rgba(7,8,16,0.75)', backdropFilter: 'blur(14px)',
                  fontFamily: raleway.fontFamily, fontSize: 14, color: GOLD2, letterSpacing: '0.20em',
                }}>{t}</div>
              </div>
            );
          })}
        </div>
      </div>

      <TickerV16 />
    </AbsoluteFill>
  );
};

// ── CTA ────────────────────────────────────────────────────────────────────────
const CTAV16: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSat = interpolate(frame, [0, 45], [5, 50], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Glass card slide up
  const cardP  = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 18, stiffness: 180, mass: 1.1 } });
  const cardTy = interpolate(cardP, [0, 1], [80, 0]);
  const cardOp = interpolate(cardP, [0, 0.3, 1], [0, 1, 1]);

  // Headline inside card
  const h1P  = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 15, stiffness: 240, mass: 0.75 } });
  const h1Ty = interpolate(h1P, [0, 1], [40, 0]);
  const h1Op = interpolate(h1P, [0, 0.2, 1], [0, 1, 1]);

  const h2P  = spring({ frame: Math.max(0, frame - 32), fps, config: { damping: 15, stiffness: 240, mass: 0.75 } });
  const h2Ty = interpolate(h2P, [0, 1], [40, 0]);
  const h2Op = interpolate(h2P, [0, 0.2, 1], [0, 1, 1]);

  // Divider
  const divW = interpolate(frame, [52, 80], [0, 800], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Phone typing
  const phone = '73385 01337';
  const shown = Math.floor(interpolate(frame, [88, 88 + phone.length * 4.5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursor = shown < phone.length && Math.round(frame / 5) % 2 === 0;
  const phoneGlow = 0.5 + 0.5 * Math.sin(frame * 0.11);

  // Website
  const webOp = interpolate(frame, [135, 152], [0, 1], { extrapolateRight: 'clamp' });

  // Button
  const btnP  = spring({ frame: Math.max(0, frame - 158), fps, config: { damping: 13, stiffness: 210, mass: 0.9 } });
  const btnSc = interpolate(btnP, [0, 1], [0.55, 1]);
  const btnOp = interpolate(btnP, [0, 0.4, 1], [0, 1, 1]);
  const pulse  = 0.5 + 0.5 * Math.sin(frame * 0.10);

  // Badge row
  const badgeOp = interpolate(frame, [178, 196], [0, 1], { extrapolateRight: 'clamp' });

  const fadeOut = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '110%', objectFit: 'cover', filter: `blur(4px) brightness(0.18) saturate(${imgSat}%)` }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(150deg, rgba(7,8,16,0.80) 0%, rgba(7,8,16,0.55) 50%, rgba(7,8,16,0.88) 100%)` }} />

      <MotesV16 />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Img src={staticFile('logo_sticky.webp')} style={{ width: 190, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 24px ${GOLD}CC)` }} />
      </div>

      {/* Glass card */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -44%) translateY(${cardTy}px)`, opacity: cardOp, width: 940, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 60px 40px', background: 'rgba(7,8,16,0.60)', backdropFilter: 'blur(24px)', border: `1px solid ${GOLD}22`, borderRadius: 16, boxShadow: `0 0 60px rgba(7,8,16,0.80), inset 0 1px 0 ${GOLD}14` }}>

        {/* WHERE YOUR */}
        <div style={{ overflow: 'hidden', width: '100%', textAlign: 'center' as const }}>
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 26, fontWeight: 300, color: `${TEAL}CC`, letterSpacing: '0.36em', textTransform: 'uppercase' as const, transform: `translateY(${h1Ty}px)`, opacity: h1Op }}>
            Where Your Forever
          </div>
        </div>

        {/* BEGINS */}
        <div style={{ overflow: 'hidden', width: '100%', marginTop: 4 }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 106, fontWeight: 700, color: WHITE, letterSpacing: '0.05em', lineHeight: 1, textAlign: 'center' as const, textShadow: `0 0 50px ${GOLD}22, 0 6px 40px rgba(0,0,0,0.9)`, transform: `translateY(${h2Ty}px)`, opacity: h2Op }}>
            BEGINS
          </div>
        </div>

        <div style={{ height: 20 }} />

        {/* Gold divider */}
        <div style={{ width: divW, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD_D}, ${GOLD}, ${GOLD2}, ${GOLD}, ${GOLD_D}, transparent)`, boxShadow: `0 0 12px ${GOLD}88` }} />

        <div style={{ height: 24 }} />

        {/* Phone */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 60, color: GOLD, fontWeight: 400, letterSpacing: '0.16em', textShadow: `0 0 ${24 + 16 * phoneGlow}px ${GOLD}${Math.round(55 + 50 * phoneGlow).toString(16)}`, minHeight: 80, textAlign: 'center' as const }}>
          {phone.slice(0, shown)}{cursor && <span style={{ color: TEAL }}>|</span>}
        </div>

        {/* Website */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 20, color: `${WHITE}35`, letterSpacing: '0.12em', fontWeight: 300, opacity: webOp, marginTop: 4 }}>
          jkrfarmsandresorts.com
        </div>

        <div style={{ height: 26 }} />

        {/* BOOK NOW button */}
        <div style={{ transform: `scale(${btnSc})`, opacity: btnOp }}>
          <div style={{
            paddingLeft: 80, paddingRight: 80, paddingTop: 22, paddingBottom: 22,
            border: `1.5px solid ${GOLD}`,
            borderRadius: 6,
            background: `rgba(232,196,74,${0.10 + 0.08 * pulse})`,
            boxShadow: `0 0 ${20 + 14 * pulse}px ${GOLD}${Math.round(28 + 24 * pulse).toString(16)}, inset 0 1px 0 ${GOLD}22`,
            fontFamily: raleway.fontFamily, fontSize: 22, fontWeight: 600,
            color: WHITE, letterSpacing: '0.32em', textTransform: 'uppercase' as const,
          }}>
            BOOK NOW
          </div>
        </div>
      </div>

      {/* Social proof badges below card */}
      <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18, opacity: badgeOp }}>
        {['6 Acres', '1000+ Guests', 'North Bangalore', '15+ Halls'].map((t, i) => (
          <div key={i} style={{
            paddingLeft: 18, paddingRight: 18, paddingTop: 7, paddingBottom: 7,
            border: `1px solid ${TEAL}33`, borderRadius: 30,
            background: 'rgba(7,8,16,0.65)', backdropFilter: 'blur(12px)',
            fontFamily: raleway.fontFamily, fontSize: 14, color: `${WHITE}70`, letterSpacing: '0.14em', fontWeight: 300,
          }}>{t}</div>
        ))}
      </div>

      <TickerV16 />
    </AbsoluteFill>
  );
};

// ── Root ───────────────────────────────────────────────────────────────────────
export const JKRReelV16: React.FC = () => {
  const [handle] = React.useState(() => delayRender('fonts-v16'));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: VOID }}>
      <Series>
        {SHOTS_V16.map((shot, i) => {
          if (shot.isHook) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <HookV16 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCTA) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAV16 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCounter) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CounterV16 img={shot.img!} frames={shot.frames} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
          if (shot.isDuo) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <DuoV16 imgL={shot.imgL!} imgR={shot.imgR!} frames={shot.frames} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
          if (shot.isTriStrip) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <TriStrip images={shot.images!} frames={shot.frames} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV16 img={shot.img!} frames={shot.frames} tag={shot.tag} line1={shot.line1} line2={shot.line2} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
        })}
      </Series>

      {/* Shots voice: hook+7 sections = 8×45 = 360f, voice ends naturally around 10.3s (309f) */}
      <Sequence durationInFrames={315}>
        <Audio src={staticFile('voice/voice_v16_shots.mp3')} volume={1} />
      </Sequence>
      {/* CTA voice: starts at frame 315 (plays over TriStrip tail + CTA) */}
      <Sequence from={315}>
        <Audio src={staticFile('voice/voice_v16_cta.mp3')} volume={1} />
      </Sequence>
      {/* Background music: Heroes Tournament — epic orchestral */}
      <Audio src={staticFile('voice/bg_music_v5.mp3')} volume={0.22} />
    </AbsoluteFill>
  );
};
