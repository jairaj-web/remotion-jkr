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

// V15 — "FOREVER" — Deep navy + copper rose, bottom panel layout, scale zoom, char reveal
const NAVY   = '#0A0A14';
const COPPER = '#C4884E';
const COPPER2= '#E8A86A';
const IVORY  = '#F8F4EF';
const IVDIM  = '#C8C0B4';

// Hook:45 + 6×45 shots + CTA:285 = 600f = 20s
const SHOTS_V15 = [
  { isHook: true,  img: 'v9_entrance.webp',          frames: 45 },
  { img: 'v12_aerial_exterior.webp', tag:'01', line1: 'Six Breathtaking',  line2: 'Acres Of Paradise', frames: 45, idx: 0 },
  { img: 'v12_mandap1.webp',         tag:'02', line1: 'Ceremonies',        line2: 'Beyond Compare',    frames: 45, idx: 1 },
  { img: 'v12_room1.webp',           tag:'03', line1: 'Rooms That Whisper', line2: 'Pure Luxury',      frames: 45, idx: 2 },
  { img: 'v9_dining.webp',           isCounter: true,                                                   frames: 45, idx: 3 },
  { img: 'v12_pool1.webp',           tag:'05', line1: 'Sky Meets',         line2: 'Your Paradise',     frames: 45, idx: 4 },
  { img: 'w02_svl609.webp',          tag:'06', line1: 'Your Perfect',      line2: 'Day Awaits',        frames: 45, idx: 5 },
  { isCTA: true,   img: 'w_cta_events.webp',         frames: 285 },
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

// ── Bottom gradient (darkens lower portion for text readability) ──────────────
const BottomPanel: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(180deg,
      transparent 0%,
      transparent 42%,
      rgba(10,10,20,0.55) 58%,
      rgba(10,10,20,0.88) 75%,
      rgba(10,10,20,0.97) 100%)`,
  }} />
);

// ── Character-by-character reveal ────────────────────────────────────────────
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

// ── Slide-up line ─────────────────────────────────────────────────────────────
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

// ── Copper rule draws from left ───────────────────────────────────────────────
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

// ── Shot number pill (top-right) ──────────────────────────────────────────────
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
      }}>{tag} / 06</div>
    </div>
  );
};

// ── Logo ──────────────────────────────────────────────────────────────────────
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

// ── Floating copper motes ─────────────────────────────────────────────────────
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

// ── Ticker ────────────────────────────────────────────────────────────────────
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

// ── Counter ───────────────────────────────────────────────────────────────────
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

// ── Hook ─────────────────────────────────────────────────────────────────────
const HookV15: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG image fades in
  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const bgSc = interpolate(frame, [0, frames], [1.15, 1.04], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // Logo springs in from top
  const logoP  = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 14, stiffness: 220, mass: 0.8 } });
  const logoSc = interpolate(logoP, [0, 1], [0.4, 1]);
  const logoOp = interpolate(logoP, [0, 0.3, 1], [0, 1, 1]);

  // "JKR" chars drop in
  const JKR = ['J','K','R'];

  // Tagline
  const tagOp = interpolate(frame, [26, 40], [0, 1], { extrapolateRight: 'clamp' });
  const tagY  = interpolate(frame, [26, 40], [18, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Subtitle
  const subOp = interpolate(frame, [32, 44], [0, 1], { extrapolateRight: 'clamp' });

  // Rule width
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
        {/* Logo */}
        <div style={{ transform: `scale(${logoSc})`, opacity: logoOp, marginBottom: 16 }}>
          <Img src={staticFile('logo_sticky.webp')} style={{ width: 130, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 20px ${COPPER}BB)` }} />
        </div>

        {/* J K R */}
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

        {/* Copper rule */}
        <div style={{ width: ruleW, height: 1.5, background: `linear-gradient(90deg, transparent, ${COPPER}, ${COPPER2}, ${COPPER}, transparent)`, boxShadow: `0 0 16px ${COPPER}99`, marginTop: 4, marginBottom: 18 }} />

        {/* FARMS & RESORTS */}
        <div style={{ opacity: tagOp, transform: `translateY(${tagY}px)`, fontFamily: raleway.fontFamily, fontSize: 30, fontWeight: 400, color: IVORY, letterSpacing: '0.38em', textTransform: 'uppercase' as const, textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>
          Farms &amp; Resorts
        </div>

        {/* Location */}
        <div style={{ opacity: subOp, marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 22, height: 1, background: `${COPPER}66` }} />
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 16, fontWeight: 300, color: `${COPPER}AA`, letterSpacing: '0.30em' }}>NORTH BANGALORE</div>
          <div style={{ width: 22, height: 1, background: `${COPPER}66` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Regular shot ─────────────────────────────────────────────────────────────
const ShotV15: React.FC<{
  img: string; frames: number; idx: number; tag?: string;
  line1?: string; line2?: string; isCounter?: boolean;
}> = ({ img, frames, idx, tag, line1, line2, isCounter }) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY, opacity: fadeOut }}>
      {/* Full bleed image */}
      <KenBurnsZoom src={img} totalFrames={frames} />
      <FlashIn />
      <BottomPanel />
      <Motes />

      {/* Logo top center */}
      <LogoV15 delay={6} />

      {/* Shot number pill top right */}
      {tag && <ShotPill tag={tag} delay={8} />}

      {/* Text content — bottom panel */}
      {isCounter ? (
        <CounterV15 />
      ) : (
        <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, paddingLeft: 56, paddingRight: 56, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 }}>
          <SlideUp text={`— ${tag} / 06 —`} size={13} color={`${COPPER}99`} delay={3} weight={300} spacing="0.28em" />
          <div style={{ height: 8 }} />
          <CharReveal text={line1!} size={74} color={IVORY} delay={6} stagger={1.8} />
          <div style={{ height: 4 }} />
          <CharReveal text={line2!} size={74} color={COPPER} delay={6 + line1!.length * 1.8} stagger={1.8} />
          <div style={{ height: 12 }} />
          <CopperRule delay={10} width={80} />
        </div>
      )}

      <TickerV15 />
    </AbsoluteFill>
  );
};

// ── CTA ───────────────────────────────────────────────────────────────────────
const CTAV15: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG image
  const imgSat = interpolate(frame, [0, 40], [8, 55], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // "YOUR FOREVER" char reveal
  const p1  = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 15, stiffness: 230, mass: 0.75 } });
  const ty1 = interpolate(p1, [0, 1], [40, 0]);
  const op1 = interpolate(p1, [0, 0.2, 1], [0, 1, 1]);

  // "BEGINS HERE" char reveal
  const p2  = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 15, stiffness: 230, mass: 0.75 } });
  const ty2 = interpolate(p2, [0, 1], [40, 0]);
  const op2 = interpolate(p2, [0, 0.2, 1], [0, 1, 1]);

  // Divider
  const divW = interpolate(frame, [50, 78], [0, 820], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Phone typing
  const phone = '73385 01337';
  const shown = Math.floor(interpolate(frame, [85, 85 + phone.length * 5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursor = shown < phone.length && Math.round(frame / 5) % 2 === 0;
  const phoneGlow = 0.5 + 0.5 * Math.sin(frame * 0.12);

  // Website
  const webOp = interpolate(frame, [160, 178], [0, 1], { extrapolateRight: 'clamp' });

  // Button
  const btnP  = spring({ frame: Math.max(0, frame - 188), fps, config: { damping: 14, stiffness: 200, mass: 0.95 } });
  const btnSc = interpolate(btnP, [0, 1], [0.6, 1]);
  const btnOp = interpolate(btnP, [0, 0.4, 1], [0, 1, 1]);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.09);

  const fadeOut = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '110%', objectFit: 'cover', filter: `blur(3px) brightness(0.20) saturate(${imgSat}%)` }} />
      </div>

      {/* Rich gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, rgba(10,10,20,0.82) 0%, rgba(10,10,20,0.58) 45%, rgba(10,10,20,0.90) 100%)` }} />

      <Motes />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Img src={staticFile('logo_sticky.webp')} style={{ width: 200, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 22px ${COPPER}CC)` }} />
      </div>

      {/* Main content */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -44%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 960 }}>

        {/* YOUR FOREVER */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 30, fontWeight: 300, color: `${COPPER}CC`, letterSpacing: '0.36em', textAlign: 'center' as const, textTransform: 'uppercase' as const, transform: `translateY(${ty1}px)`, opacity: op1 }}>
            Your Forever
          </div>
        </div>
        <div style={{ height: 6 }} />

        {/* BEGINS HERE */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 108, fontWeight: 700, color: IVORY, letterSpacing: '0.05em', lineHeight: 1, textAlign: 'center' as const, textShadow: `0 0 60px ${COPPER}33, 0 6px 40px rgba(0,0,0,0.9)`, transform: `translateY(${ty2}px)`, opacity: op2 }}>
            BEGINS HERE
          </div>
        </div>

        <div style={{ height: 24 }} />

        {/* Divider */}
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
        <div style={{ height: 32 }} />

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
      </div>

      <TickerV15 />
    </AbsoluteFill>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
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
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV15 img={shot.img!} frames={shot.frames} idx={shot.idx!} tag={shot.tag} line1={shot.line1} line2={shot.line2} isCounter={shot.isCounter} />
            </Series.Sequence>
          );
        })}
      </Series>
      {/* Shots voice: 6 lines (~10.3s speech), cut at frame 315 (10.5s) */}
      <Sequence durationInFrames={315}>
        <Audio src={staticFile('voice/voice_v15_shots.mp3')} volume={1} />
      </Sequence>
      {/* CTA voice: starts at frame 315 (10.5s) */}
      <Sequence from={315}>
        <Audio src={staticFile('voice/voice_v15_cta.mp3')} volume={1} />
      </Sequence>
      <Audio src={staticFile('voice/bg_music_v4.mp3')} volume={0.20} />
    </AbsoluteFill>
  );
};
