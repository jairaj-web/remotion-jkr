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

// V15 — "FOREVER" — Deep navy + copper rose, top panel, duo+gallery shots
const NAVY   = '#0A0A14';
const COPPER = '#C4884E';
const COPPER2= '#E8A86A';
const IVORY  = '#F8F4EF';

// Hook:45 + 4 shots:180 + Counter:45 + Duo:45 + Gallery:45 + CTA:240 = 600f
const SHOTS_V15 = [
  { isHook: true,    img: 'v9_entrance.webp',          frames: 45 },
  { img: 'v12_aerial_exterior.webp', tag:'01', line1: 'Six Breathtaking',   line2: 'Acres Of Paradise', frames: 45, idx: 0 },
  { img: 'v12_mandap1.webp',         tag:'02', line1: 'Ceremonies',          line2: 'Beyond Compare',    frames: 45, idx: 1 },
  { img: 'v12_room1.webp',           tag:'03', line1: 'Rooms That Whisper',  line2: 'Pure Luxury',       frames: 45, idx: 2 },
  { img: 'v9_dining.webp',           isCounter: true,                                                     frames: 45, idx: 3 },
  { isDuo: true,     imgL: 'svl_SVL06560.webp', imgR: 'w06_svl557.webp',    frames: 45 },
  { isGallery: true, images: ['v12_mandap3.webp','v9_pool.webp','v12_lawn1.webp','site_Dining-Hall-4.webp'], frames: 45 },
  { isCTA: true,     img: 'w_cta_events.webp',          frames: 285 },
];

export const TOTAL_FRAMES_V15 = SHOTS_V15.reduce((a, s) => a + s.frames, 0);

// ── Scale zoom Ken Burns ──────────────────────────────────────────────────────
const KenBurnsZoom: React.FC<{ src: string; totalFrames: number }> = ({ src, totalFrames }) => {
  const frame = useCurrentFrame();
  const sc  = interpolate(frame, [0, totalFrames], [1.14, 1.04], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const sat = interpolate(frame, [0, 18], [8, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const brt = interpolate(frame, [0, 12], [0.35, 1.0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${sc})`,
          filter: `saturate(${sat}%) brightness(${brt})`,
        }}
      />
    </div>
  );
};

// ── Flash on entry ────────────────────────────────────────────────────────────
const FlashIn: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 8], [0.7, 0], { extrapolateRight: 'clamp' });
  return <div style={{ position: 'absolute', inset: 0, backgroundColor: IVORY, opacity: op, pointerEvents: 'none', zIndex: 90 }} />;
};

// ── Top gradient (darkens upper portion for text readability) ─────────────────
const TopPanel: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(180deg,
      rgba(10,10,20,0.94) 0%,
      rgba(10,10,20,0.80) 28%,
      rgba(10,10,20,0.35) 50%,
      transparent 65%)`,
  }} />
);

// ── Progress bar fills left→right over shot duration ─────────────────────────
const ProgressBar: React.FC<{ totalFrames: number; delay?: number }> = ({ totalFrames, delay = 8 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(Math.max(0, frame - delay), [0, totalFrames - delay - 4], [0, 100], { extrapolateRight: 'clamp' });
  const op = interpolate(frame - delay, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: op, zIndex: 100 }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${COPPER}88, ${COPPER2}, ${COPPER})`,
        boxShadow: `0 0 8px ${COPPER}99`,
      }} />
    </div>
  );
};

// ── Character-by-character reveal ─────────────────────────────────────────────
const CharReveal: React.FC<{
  text: string; size: number; color?: string; weight?: number;
  spacing?: string; delay?: number; stagger?: number;
}> = ({ text, size, color = IVORY, weight = 700, spacing = '0.06em', delay = 0, stagger = 2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = text.split('');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center' }}>
      {chars.map((ch, i) => {
        const p = spring({ frame: Math.max(0, frame - delay - i * stagger), fps, config: { damping: 18, stiffness: 300, mass: 0.6 } });
        const ty = interpolate(p, [0, 1], [28, 0]);
        const op = interpolate(p, [0, 0.2, 1], [0, 1, 1]);
        return (
          <span key={i} style={{
            display: 'inline-block',
            transform: `translateY(${ty}px)`, opacity: op,
            fontFamily: cinzel.fontFamily, fontSize: size, fontWeight: weight as any,
            color, letterSpacing: spacing, lineHeight: 1.15,
            textShadow: '0 2px 24px rgba(0,0,0,0.9)',
            whiteSpace: ch === ' ' ? 'pre' : 'normal',
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

// ── Slide-up line ──────────────────────────────────────────────────────────────
const SlideUp: React.FC<{ text: string; size: number; color?: string; delay?: number; weight?: number; spacing?: string }> = ({ text, size, color = COPPER, delay = 0, weight = 300, spacing = '0.22em' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16, stiffness: 240, mass: 0.7 } });
  const ty = interpolate(p, [0, 1], [22, 0]);
  const op = interpolate(p, [0, 0.18, 1], [0, 1, 1]);
  return (
    <div style={{ overflow: 'hidden', width: '100%', textAlign: 'center' as const }}>
      <div style={{ transform: `translateY(${ty}px)`, opacity: op, fontFamily: raleway.fontFamily, fontSize: size, fontWeight: weight as any, color, letterSpacing: spacing, textTransform: 'uppercase' as const, textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}>{text}</div>
    </div>
  );
};

// ── Copper rule draws from left ────────────────────────────────────────────────
const CopperRule: React.FC<{ delay?: number; width?: number }> = ({ delay = 4, width = 72 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 18], [0, width], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', opacity: op, marginBottom: 8 }}>
      <div style={{ height: 1.5, width: w, background: `linear-gradient(90deg, transparent, ${COPPER}, ${COPPER2}, ${COPPER}, transparent)`, boxShadow: `0 0 10px ${COPPER}88` }} />
    </div>
  );
};

// ── Shot number pill (top-right) ───────────────────────────────────────────────
const ShotPill: React.FC<{ tag: string; delay?: number }> = ({ tag, delay = 8 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x  = interpolate(frame - delay, [0, 12], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', top: 72, right: 52, opacity: op, transform: `translateX(${x}px)` }}>
      <div style={{
        paddingLeft: 18, paddingRight: 18, paddingTop: 8, paddingBottom: 8,
        border: `1px solid ${COPPER}60`,
        borderRadius: 40,
        background: 'rgba(10,10,20,0.65)',
        backdropFilter: 'blur(12px)',
        fontFamily: raleway.fontFamily, fontSize: 14, fontWeight: 600,
        color: COPPER2, letterSpacing: '0.18em',
      }}>{tag} / 05</div>
    </div>
  );
};

// ── Logo ───────────────────────────────────────────────────────────────────────
const LogoV15: React.FC<{ size?: number; delay?: number }> = ({ size = 145, delay = 6 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sc = interpolate(frame - delay, [0, 18], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op, transform: `scale(${sc})` }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: size, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 16px ${COPPER}99)` }} />
    </div>
  );
};

// ── Floating copper motes ──────────────────────────────────────────────────────
const PMOTES = [
  { x:6,  spd:1.1, sz:3, dl:0  }, { x:24, spd:0.8, sz:4, dl:8  },
  { x:48, spd:1.2, sz:3, dl:3  }, { x:68, spd:0.9, sz:4, dl:13 },
  { x:85, spd:1.0, sz:3, dl:6  }, { x:92, spd:0.7, sz:3, dl:18 },
];
const Motes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PMOTES.map((p, i) => {
        const f  = Math.max(0, frame - p.dl);
        const y  = (1920 + p.sz) - (f * p.spd * 3.0) % 1960;
        const dx = Math.sin(f * 0.042 + i * 1.5) * 11;
        const op = interpolate(f, [0, 12], [0, 0.5], { extrapolateRight: 'clamp' }) * (0.35 + 0.65 * Math.sin(f * 0.08 + i));
        return <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: y, transform: `translateX(${dx}px)`, width: p.sz, height: p.sz, borderRadius: '50%', backgroundColor: COPPER, opacity: op, boxShadow: `0 0 ${p.sz * 4}px ${COPPER2}` }} />;
      })}
    </div>
  );
};

// ── Ticker ─────────────────────────────────────────────────────────────────────
const TickerV15: React.FC<{ delay?: number }> = ({ delay = 12 }) => {
  const frame = useCurrentFrame();
  const T = 'JKR FARMS & RESORTS  ·  NORTH BANGALORE  ·  6 ACRES  ·  1000+ GUESTS  ·  73385 01337  ·  jkrfarmsandresorts.com  ·  ';
  const x  = -(frame * 1.5) % (T.length * 13.5);
  const op = interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: `rgba(10,10,20,0.92)`, backdropFilter: 'blur(12px)', borderTop: `1px solid ${COPPER}20`, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: op }}>
      <div style={{ whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: raleway.fontFamily, fontSize: 14, color: `${IVORY}35`, letterSpacing: '0.20em', fontWeight: 300 }}>{T.repeat(6)}</div>
    </div>
  );
};

// ── Counter ────────────────────────────────────────────────────────────────────
const CounterV15: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.floor(interpolate(frame, [4, 38], [0, 1000], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const p  = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 12, stiffness: 260, mass: 0.8 } });
  const sc = interpolate(p, [0, 1], [0.2, 1]);
  const op = interpolate(p, [0, 0.35, 1], [0, 1, 1]);
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.14);
  return (
    <div style={{ position: 'absolute', bottom: 68, left: 0, right: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, transform: `scale(${sc})`, opacity: op }}>
      <div style={{ fontFamily: cinzel.fontFamily, fontSize: 120, fontWeight: 700, color: COPPER, lineHeight: 1, textShadow: `0 0 ${32 + 20 * glow}px ${COPPER}${Math.round(60 + 40 * glow).toString(16)}` }}>
        {count.toLocaleString()}+
      </div>
      <div style={{ fontFamily: raleway.fontFamily, fontSize: 24, color: IVORY, letterSpacing: '0.28em', textTransform: 'uppercase' as const }}>
        Guests Capacity
      </div>
    </div>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
const HookV15: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const bgSc = interpolate(frame, [0, frames], [1.15, 1.04], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const logoP  = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 14, stiffness: 220, mass: 0.8 } });
  const logoSc = interpolate(logoP, [0, 1], [0.4, 1]);
  const logoOp = interpolate(logoP, [0, 0.3, 1], [0, 1, 1]);

  const JKR = ['J','K','R'];

  const tagOp = interpolate(frame, [26, 40], [0, 1], { extrapolateRight: 'clamp' });
  const tagY  = interpolate(frame, [26, 40], [18, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const subOp = interpolate(frame, [32, 44], [0, 1], { extrapolateRight: 'clamp' });

  const ruleW = interpolate(frame, [18, 34], [0, 260], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, opacity: fadeOut }}>
      <div style={{ position: 'absolute', inset: 0, opacity: bgOp }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgSc})`, filter: 'blur(4px) brightness(0.18) saturate(30%)' }} />
      </div>
      <FlashIn />
      <Motes />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <div style={{ transform: `scale(${logoSc})`, opacity: logoOp, marginBottom: 16 }}>
          <Img src={staticFile('logo_sticky.webp')} style={{ width: 130, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 20px ${COPPER}BB)` }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {JKR.map((ch, i) => {
            const p  = spring({ frame: Math.max(0, frame - 8 - i * 6), fps, config: { damping: 9, stiffness: 400, mass: 0.5 } });
            const sc = interpolate(p, [0, 1], [0, 1]);
            const ty = interpolate(p, [0, 1], [-70, 0]);
            const op = interpolate(p, [0, 0.2, 1], [0, 1, 1]);
            return (
              <span key={i} style={{
                display: 'inline-block', transform: `scale(${sc}) translateY(${ty}px)`, opacity: op,
                fontFamily: cinzel.fontFamily, fontSize: 170, fontWeight: 700, color: COPPER,
                letterSpacing: '0.12em', lineHeight: 1,
                textShadow: `0 0 60px ${COPPER}77, 0 6px 40px rgba(0,0,0,0.95)`,
              }}>{ch}</span>
            );
          })}
        </div>

        <div style={{ width: ruleW, height: 1.5, background: `linear-gradient(90deg, transparent, ${COPPER}, ${COPPER2}, ${COPPER}, transparent)`, boxShadow: `0 0 16px ${COPPER}99`, marginTop: 4, marginBottom: 18 }} />

        <div style={{ opacity: tagOp, transform: `translateY(${tagY}px)`, fontFamily: raleway.fontFamily, fontSize: 30, fontWeight: 400, color: IVORY, letterSpacing: '0.38em', textTransform: 'uppercase' as const, textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>
          Farms &amp; Resorts
        </div>

        <div style={{ opacity: subOp, marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 22, height: 1, background: `${COPPER}66` }} />
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 16, fontWeight: 300, color: `${COPPER}AA`, letterSpacing: '0.30em' }}>NORTH BANGALORE</div>
          <div style={{ width: 22, height: 1, background: `${COPPER}66` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotV15: React.FC<{
  img: string; frames: number; idx: number; tag?: string;
  line1?: string; line2?: string; isCounter?: boolean;
}> = ({ img, frames, idx, tag, line1, line2, isCounter }) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, opacity: fadeOut }}>
      <KenBurnsZoom src={img} totalFrames={frames} />
      <FlashIn />
      <TopPanel />
      <Motes />
      <LogoV15 delay={6} />
      {tag && <ShotPill tag={tag} delay={8} />}
      <ProgressBar totalFrames={frames} delay={6} />

      {isCounter ? (
        <CounterV15 />
      ) : (
        <div style={{ position: 'absolute', top: 230, left: 0, right: 0, paddingLeft: 52, paddingRight: 52, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 }}>
          <SlideUp text={`— ${tag} / 05 —`} size={13} color={`${COPPER}BB`} delay={3} weight={300} spacing="0.28em" />
          <div style={{ height: 10 }} />
          <CharReveal text={line1!} size={76} color={IVORY} delay={6} stagger={1.8} />
          <div style={{ height: 6 }} />
          <CharReveal text={line2!} size={76} color={COPPER} delay={6 + line1!.length * 1.8} stagger={1.8} />
          <div style={{ height: 14 }} />
          <CopperRule delay={10} width={90} />
        </div>
      )}

      <TickerV15 />
    </AbsoluteFill>
  );
};

// ── Duo Shot — two images side by side ────────────────────────────────────────
const DuoShot: React.FC<{ imgL: string; imgR: string; frames: number }> = ({ imgL, imgR, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pL = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 20, stiffness: 200, mass: 1.0 } });
  const xL = interpolate(pL, [0, 1], [-560, 0]);

  const pR = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 20, stiffness: 200, mass: 1.0 } });
  const xR = interpolate(pR, [0, 1], [560, 0]);

  const divOp = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const textP  = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 16, stiffness: 240, mass: 0.75 } });
  const textTy = interpolate(textP, [0, 1], [30, 0]);
  const textOp = interpolate(textP, [0, 0.2, 1], [0, 1, 1]);

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, opacity: fadeOut }}>
      {/* Left image panel */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${xL}px)` }}>
        <Img src={staticFile(`images/${imgL}`)} style={{ width: '200%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72) saturate(115%)' }} />
      </div>
      {/* Right image panel */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', right: 0, overflow: 'hidden', transform: `translateX(${xR}px)` }}>
        <Img src={staticFile(`images/${imgR}`)} style={{ position: 'absolute', top: 0, right: 0, width: '200%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72) saturate(115%)' }} />
      </div>

      {/* Center gold divider */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, background: `linear-gradient(180deg, transparent 5%, ${COPPER}CC 30%, ${COPPER2}EE 50%, ${COPPER}CC 70%, transparent 95%)`, opacity: divOp, boxShadow: `0 0 12px ${COPPER}88` }} />

      {/* Gradient overlays for text area */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(10,10,20,0.88) 0%, rgba(10,10,20,0.60) 35%, transparent 55%, transparent 70%, rgba(10,10,20,0.70) 100%)`, pointerEvents: 'none' }} />

      <FlashIn />
      <Motes />
      <LogoV15 delay={6} />
      <ProgressBar totalFrames={frames} delay={6} />

      {/* Text block */}
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', transform: `translateY(${textTy}px)`, opacity: textOp }}>
        <CopperRule delay={16} width={60} />
        <div style={{ fontFamily: cinzel.fontFamily, fontSize: 68, fontWeight: 700, color: IVORY, letterSpacing: '0.06em', textAlign: 'center' as const, textShadow: '0 4px 32px rgba(0,0,0,0.95)', lineHeight: 1.2 }}>
          The Perfect<br/>Setting
        </div>
        <div style={{ height: 10 }} />
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 20, color: `${COPPER}CC`, letterSpacing: '0.30em', textTransform: 'uppercase' as const, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>For Every Occasion</div>
        <div style={{ height: 12 }} />
        <CopperRule delay={22} width={60} />
      </div>

      {/* Bottom label badges */}
      <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingLeft: 40, paddingRight: 40, opacity: textOp }}>
        {['Ceremony Halls', 'Luxury Suites'].map((label, i) => (
          <div key={i} style={{
            paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10,
            border: `1px solid ${COPPER}55`, borderRadius: 30,
            background: 'rgba(10,10,20,0.70)', backdropFilter: 'blur(10px)',
            fontFamily: raleway.fontFamily, fontSize: 16, color: COPPER2, letterSpacing: '0.18em',
          }}>{label}</div>
        ))}
      </div>

      <TickerV15 />
    </AbsoluteFill>
  );
};

// ── Gallery Shot — 2×2 mosaic grid ────────────────────────────────────────────
const GalleryShot: React.FC<{ images: string[]; frames: number }> = ({ images, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const textP  = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 16, stiffness: 220, mass: 0.85 } });
  const textSc = interpolate(textP, [0, 1], [0.88, 1]);
  const textOp = interpolate(textP, [0, 0.3, 1], [0, 1, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, opacity: fadeOut }}>
      {/* 2×2 grid */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 5 }}>
        {images.map((img, i) => {
          const delay = 4 + i * 5;
          const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 22, stiffness: 230, mass: 0.85 } });
          const sc = interpolate(p, [0, 1], [1.18, 1.0]);
          const op = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
          return (
            <div key={i} style={{ overflow: 'hidden', opacity: op }}>
              <Img
                src={staticFile(`images/${img}`)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})`, filter: 'brightness(0.62) saturate(120%)' }}
              />
            </div>
          );
        })}
      </div>

      {/* Dark vignette overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,20,0.44)', pointerEvents: 'none' }} />
      {/* Center bright spot for text readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 68% 42% at 50% 52%, rgba(10,10,20,0.82) 0%, transparent 100%)', pointerEvents: 'none' }} />

      <Motes />
      <LogoV15 delay={6} />
      <ProgressBar totalFrames={frames} delay={6} />

      {/* Center text block */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: `translateY(-50%) scale(${textSc})`, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10, opacity: textOp }}>
        <CopperRule delay={20} width={80} />
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 22, color: `${COPPER}CC`, letterSpacing: '0.34em', textTransform: 'uppercase' as const, textShadow: '0 2px 20px rgba(0,0,0,0.95)' }}>The Venue Of</div>
        <CharReveal text="YOUR DREAMS" size={84} color={IVORY} delay={22} stagger={1.8} />
        <div style={{ height: 4 }} />
        <CopperRule delay={26} width={80} />

        {/* Four icon badges */}
        <div style={{ display: 'flex', gap: 28, marginTop: 18 }}>
          {['Mandap', 'Pool', 'Lawn', 'Dining'].map((label, i) => {
            const bP  = spring({ frame: Math.max(0, frame - 28 - i * 4), fps, config: { damping: 16, stiffness: 280, mass: 0.6 } });
            const bSc = interpolate(bP, [0, 1], [0, 1]);
            const bOp = interpolate(bP, [0, 0.35, 1], [0, 1, 1]);
            return (
              <div key={i} style={{ transform: `scale(${bSc})`, opacity: bOp }}>
                <div style={{
                  paddingLeft: 20, paddingRight: 20, paddingTop: 9, paddingBottom: 9,
                  border: `1px solid ${COPPER}66`, borderRadius: 4,
                  background: 'rgba(10,10,20,0.72)', backdropFilter: 'blur(14px)',
                  fontFamily: raleway.fontFamily, fontSize: 14, color: COPPER2, letterSpacing: '0.18em',
                }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <TickerV15 />
    </AbsoluteFill>
  );
};

// ── CTA ────────────────────────────────────────────────────────────────────────
const CTAV15: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSat = interpolate(frame, [0, 40], [8, 55], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const p1  = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 15, stiffness: 230, mass: 0.75 } });
  const ty1 = interpolate(p1, [0, 1], [40, 0]);
  const op1 = interpolate(p1, [0, 0.2, 1], [0, 1, 1]);

  const p2  = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 15, stiffness: 230, mass: 0.75 } });
  const ty2 = interpolate(p2, [0, 1], [40, 0]);
  const op2 = interpolate(p2, [0, 0.2, 1], [0, 1, 1]);

  const divW = interpolate(frame, [50, 78], [0, 820], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const phone = '73385 01337';
  const shown = Math.floor(interpolate(frame, [85, 85 + phone.length * 5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursor = shown < phone.length && Math.round(frame / 5) % 2 === 0;
  const phoneGlow = 0.5 + 0.5 * Math.sin(frame * 0.12);

  const webOp = interpolate(frame, [130, 148], [0, 1], { extrapolateRight: 'clamp' });

  const btnP  = spring({ frame: Math.max(0, frame - 155), fps, config: { damping: 14, stiffness: 200, mass: 0.95 } });
  const btnSc = interpolate(btnP, [0, 1], [0.6, 1]);
  const btnOp = interpolate(btnP, [0, 0.4, 1], [0, 1, 1]);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.09);

  // Social proof badges
  const badgeOp = interpolate(frame, [170, 188], [0, 1], { extrapolateRight: 'clamp' });

  const fadeOut = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '110%', objectFit: 'cover', filter: `blur(3px) brightness(0.20) saturate(${imgSat}%)` }} />
      </div>

      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, rgba(10,10,20,0.82) 0%, rgba(10,10,20,0.58) 45%, rgba(10,10,20,0.90) 100%)` }} />

      <Motes />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Img src={staticFile('logo_sticky.webp')} style={{ width: 200, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 22px ${COPPER}CC)` }} />
      </div>

      {/* Main content */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -44%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 960 }}>

        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 30, fontWeight: 300, color: `${COPPER}CC`, letterSpacing: '0.36em', textAlign: 'center' as const, textTransform: 'uppercase' as const, transform: `translateY(${ty1}px)`, opacity: op1 }}>
            Your Forever
          </div>
        </div>
        <div style={{ height: 6 }} />

        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 108, fontWeight: 700, color: IVORY, letterSpacing: '0.05em', lineHeight: 1, textAlign: 'center' as const, textShadow: `0 0 60px ${COPPER}33, 0 6px 40px rgba(0,0,0,0.9)`, transform: `translateY(${ty2}px)`, opacity: op2 }}>
            BEGINS HERE
          </div>
        </div>

        <div style={{ height: 24 }} />

        <div style={{ width: divW, height: 1.5, background: `linear-gradient(90deg, transparent, ${COPPER}, ${COPPER2}, ${COPPER}, transparent)`, boxShadow: `0 0 14px ${COPPER}88`, marginBottom: 28 }} />

        {/* Phone */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 64, color: COPPER, fontWeight: 400, letterSpacing: '0.16em', textShadow: `0 0 ${26 + 18 * phoneGlow}px ${COPPER}${Math.round(60 + 50 * phoneGlow).toString(16)}`, minHeight: 86, textAlign: 'center' as const }}>
          {phone.slice(0, shown)}{cursor && <span>|</span>}
        </div>
        <div style={{ height: 8 }} />

        {/* Website */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 22, color: `${IVORY}40`, letterSpacing: '0.10em', fontWeight: 300, opacity: webOp }}>
          jkrfarmsandresorts.com
        </div>
        <div style={{ height: 28 }} />

        {/* BOOK NOW button */}
        <div style={{ transform: `scale(${btnSc})`, opacity: btnOp }}>
          <div style={{
            paddingLeft: 72, paddingRight: 72, paddingTop: 22, paddingBottom: 22,
            border: `1.5px solid ${COPPER}`,
            borderRadius: 4,
            background: `rgba(196,136,78,${0.12 + 0.08 * pulse})`,
            boxShadow: `0 0 ${22 + 14 * pulse}px ${COPPER}${Math.round(30 + 26 * pulse).toString(16)}`,
            fontFamily: raleway.fontFamily, fontSize: 24, fontWeight: 600,
            color: IVORY, letterSpacing: '0.30em', textTransform: 'uppercase' as const,
          }}>
            BOOK NOW
          </div>
        </div>
        <div style={{ height: 22 }} />

        {/* Social proof row */}
        <div style={{ display: 'flex', gap: 20, opacity: badgeOp }}>
          {['6 Acres', '1000+ Guests', 'North Bangalore'].map((t, i) => (
            <div key={i} style={{
              paddingLeft: 18, paddingRight: 18, paddingTop: 8, paddingBottom: 8,
              border: `1px solid ${COPPER}44`, borderRadius: 30,
              background: 'rgba(10,10,20,0.60)', backdropFilter: 'blur(10px)',
              fontFamily: raleway.fontFamily, fontSize: 15, color: `${IVORY}88`, letterSpacing: '0.14em', fontWeight: 300,
            }}>{t}</div>
          ))}
        </div>
      </div>

      <TickerV15 />
    </AbsoluteFill>
  );
};

// ── Root ───────────────────────────────────────────────────────────────────────
export const JKRReelV15: React.FC = () => {
  const [handle] = React.useState(() => delayRender('fonts-v15'));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Series>
        {SHOTS_V15.map((shot, i) => {
          if (shot.isHook) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <HookV15 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCTA) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAV15 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isDuo) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <DuoShot imgL={shot.imgL!} imgR={shot.imgR!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isGallery) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <GalleryShot images={shot.images!} frames={shot.frames} />
            </Series.Sequence>
          );
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV15 img={shot.img!} frames={shot.frames} idx={shot.idx!} tag={shot.tag} line1={shot.line1} line2={shot.line2} isCounter={shot.isCounter} />
            </Series.Sequence>
          );
        })}
      </Series>
      {/* Shots voice: covers 0–315f (10.5s) */}
      <Sequence durationInFrames={315}>
        <Audio src={staticFile('voice/voice_v15_shots.mp3')} volume={1} />
      </Sequence>
      {/* CTA voice: starts at frame 360 (after hook+5 shots+duo+gallery) */}
      <Sequence from={360}>
        <Audio src={staticFile('voice/voice_v15_cta.mp3')} volume={1} />
      </Sequence>
      <Audio src={staticFile('voice/bg_music_v4.mp3')} volume={0.20} />
    </AbsoluteFill>
  );
};
