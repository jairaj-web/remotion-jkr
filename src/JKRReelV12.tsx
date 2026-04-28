import React, { useEffect } from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
  continueRender, delayRender,
} from 'remotion';
import { loadFont as loadCinzel }  from '@remotion/google-fonts/Cinzel';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';

const cinzel  = loadCinzel('normal', { weights: ['700'] });
const raleway = loadRaleway('normal', { weights: ['300', '400', '600'] });

// V12 — completely new: storytelling hook, top layout, typewriter, grayscale→color, corner frames, counter
const GOLD    = '#C9A84C';
const GOLD2   = '#FFE5A0';
const WHITE   = '#F5F0E8';
const BLACK   = '#0A0A0A';
const NAVY    = '#060D18';
const DIMGOLD = 'rgba(201,168,76,0.18)';

// Hook:45 + 6×45 shots + CTA:480 = 795f = 26.5s
const SHOTS_V12 = [
  { isHook: true,  img: 'v12_aerial_lawn.webp',    frames: 45 },
  { img: 'v12_aerial_lawn2.webp',   tag: '01 / 06', line1: 'Six Breathtaking', line2: 'Acres',          frames: 45, idx: 0 },
  { img: 'v12_mandap1.webp',        tag: '02 / 06', line1: 'Every Ceremony',   line2: 'A Masterpiece',  frames: 45, idx: 1 },
  { img: 'v12_room1.webp',          tag: '03 / 06', line1: 'Rooms Designed',   line2: 'For Royalty',    frames: 45, idx: 2 },
  { img: 'v10_shot6_dining.webp',   tag: '04 / 06', isCounter: true,                                    frames: 45, idx: 3 },
  { img: 'v12_aerial_pool.webp',    tag: '05 / 06', line1: 'Rooftop Pool',     line2: 'Touches The Sky',frames: 45, idx: 4 },
  { img: 'v12_exterior1.webp',      tag: '06 / 06', line1: 'This Is',          line2: 'YOUR Story',     frames: 45, idx: 5 },
  { isCTA: true,                                                                                          frames: 480 },
];

export const TOTAL_FRAMES_V12 = SHOTS_V12.reduce((a, s) => a + s.frames, 0); // 795f

// ── Grayscale → Color image reveal ────────────────────────────────────────────
const ColorReveal: React.FC<{ src: string; totalFrames: number; dir?: 'in' | 'out' }> = ({ src, totalFrames, dir = 'in' }) => {
  const frame = useCurrentFrame();
  const sat   = interpolate(frame, [0, 22], [0, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const bright = interpolate(frame, [0, 14], [0.65, 1.0], { extrapolateRight: 'clamp' });
  const scaleFrom = dir === 'in' ? 1.0 : 1.07;
  const scaleTo   = dir === 'in' ? 1.07 : 1.0;
  const scale = interpolate(frame, [0, totalFrames], [scaleFrom, scaleTo], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center', overflow: 'hidden' }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `saturate(${sat}%) brightness(${bright})` }}
      />
    </div>
  );
};

// ── Diagonal vignette overlay ──────────────────────────────────────────────────
const DiagOverlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(160deg,
      rgba(6,13,24,0.82) 0%,
      rgba(6,13,24,0.20) 40%,
      rgba(6,13,24,0.10) 60%,
      rgba(6,13,24,0.78) 100%
    )`,
  }} />
);

// ── Fade envelope ─────────────────────────────────────────────────────────────
const Fade: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const frame = useCurrentFrame();
  const op = Math.min(
    interpolate(frame, [0, 7], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 7, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

// ── Cinematic corner brackets ──────────────────────────────────────────────────
const Corners: React.FC<{ delay?: number }> = ({ delay = 6 }) => {
  const frame = useCurrentFrame();
  const len = interpolate(frame - delay, [0, 22], [0, 56], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op  = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s: React.CSSProperties = { position: 'absolute', width: len, height: len, opacity: op };
  const b = `2px solid ${GOLD}`;
  return (
    <>
      <div style={{ ...s, top: 36, left: 36, borderTop: b, borderLeft: b }} />
      <div style={{ ...s, top: 36, right: 36, borderTop: b, borderRight: b }} />
      <div style={{ ...s, bottom: 72, left: 36, borderBottom: b, borderLeft: b }} />
      <div style={{ ...s, bottom: 72, right: 36, borderBottom: b, borderRight: b }} />
    </>
  );
};

// ── Logo ─────────────────────────────────────────────────────────────────────
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const y  = interpolate(frame, [0, 18], [-18, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 78, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${y}px)` }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: 180, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 14px ${GOLD}99)` }} />
    </div>
  );
};

// ── Top accent line ───────────────────────────────────────────────────────────
const TopLine: React.FC<{ delay?: number }> = ({ delay = 4 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 28], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }}>
      <div style={{ height: '100%', width: `${w}%`, background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD})`, boxShadow: `0 0 16px ${GOLD}99` }} />
    </div>
  );
};

// ── Dual h-rule (draws from sides to center) ──────────────────────────────────
const DualRule: React.FC<{ delay?: number }> = ({ delay = 16 }) => {
  const frame = useCurrentFrame();
  const prog = interpolate(frame - delay, [0, 22], [0, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'relative', height: 1.5, width: '100%' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${prog}%`, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
      <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${prog}%`, background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
    </div>
  );
};

// ── Typewriter text ───────────────────────────────────────────────────────────
const Typewriter: React.FC<{ text: string; delay?: number; speed?: number; size?: number; color?: string; weight?: number; spacing?: string }> = ({
  text, delay = 8, speed = 2.2, size = 84, color = WHITE, weight = 700, spacing = '0.04em',
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const shown = Math.min(text.length, Math.floor(f / speed));
  const blink = shown < text.length && Math.round(f / 5) % 2 === 0;
  return (
    <div style={{ fontFamily: cinzel.fontFamily, fontSize: size, fontWeight: weight, color, letterSpacing: spacing, lineHeight: 1.12, textShadow: '0 4px 36px rgba(0,0,0,0.7)', whiteSpace: 'nowrap' as const }}>
      {text.slice(0, shown)}
      {blink && <span style={{ color: GOLD, opacity: 1 }}>|</span>}
    </div>
  );
};

// ── Clip-path reveal (uncovers top→bottom) ────────────────────────────────────
const ClipReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame - delay, [0, 20], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ clipPath: `inset(0 0 ${100 - pct}% 0)` }}>
      {children}
    </div>
  );
};

// ── Tag slide-in from right ───────────────────────────────────────────────────
const TagSlide: React.FC<{ text: string; delay?: number }> = ({ text, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 280, mass: 0.8 } });
  const x  = interpolate(p, [0, 1], [80, 0]);
  const op = interpolate(p, [0, 0.3, 1], [0, 1, 1]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: op, transform: `translateX(${x}px)` }}>
      <div style={{ width: 32, height: 1.5, background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
      <div style={{ fontFamily: raleway.fontFamily, fontSize: 20, fontWeight: 600, color: GOLD, letterSpacing: '0.25em', textTransform: 'uppercase' as const }}>
        {text}
      </div>
    </div>
  );
};

// ── Counter ───────────────────────────────────────────────────────────────────
const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.floor(interpolate(frame, [8, 40], [0, 1000], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const p  = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 14, stiffness: 260, mass: 0.8 } });
  const sc = interpolate(p, [0, 1], [0.5, 1]);
  const op = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.16);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transform: `scale(${sc})`, opacity: op }}>
      <div style={{ fontFamily: cinzel.fontFamily, fontSize: 130, fontWeight: 700, color: GOLD, lineHeight: 1, textShadow: `0 0 ${40 + 24 * glow}px ${GOLD}${Math.round(60 + 40 * glow).toString(16)}` }}>
        {count.toLocaleString()}+
      </div>
      <div style={{ fontFamily: raleway.fontFamily, fontSize: 28, color: WHITE, letterSpacing: '0.22em', textTransform: 'uppercase' as const }}>
        Guests Capacity
      </div>
    </div>
  );
};

// ── Floating particles ─────────────────────────────────────────────────────────
const PTS = [
  { x: 10, spd: 1.1, sz: 4, dl: 0  }, { x: 28, spd: 0.8, sz: 3, dl: 6  },
  { x: 50, spd: 1.3, sz: 5, dl: 11 }, { x: 68, spd: 1.0, sz: 3, dl: 3  },
  { x: 82, spd: 1.2, sz: 4, dl: 8  }, { x: 38, spd: 0.9, sz: 3, dl: 15 },
  { x: 92, spd: 0.7, sz: 4, dl: 18 },
];
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PTS.map((p, i) => {
        const f = Math.max(0, frame - p.dl);
        const y = (1920 + p.sz) - (f * p.spd * 3.5) % (1960);
        const drift = Math.sin(f * 0.045 + i) * 14;
        const op = interpolate(f, [0, 10], [0, 0.65], { extrapolateRight: 'clamp' }) * (0.45 + 0.55 * Math.sin(f * 0.09 + i * 1.4));
        return <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: y, transform: `translateX(${drift}px)`, width: p.sz, height: p.sz, borderRadius: '50%', backgroundColor: GOLD, opacity: op, boxShadow: `0 0 ${p.sz * 3}px ${GOLD}` }} />;
      })}
    </div>
  );
};

// ── Ticker ────────────────────────────────────────────────────────────────────
const Ticker: React.FC = () => {
  const frame = useCurrentFrame();
  const T = 'JKR FARMS & RESORTS  ·  NORTH BANGALORE  ·  6 ACRES  ·  1000+ GUESTS  ·  73385 01337  ·  jkrfarmsandresorts.com  ·  ';
  const x = -(frame * 1.5) % (T.length * 13.5);
  const op = interpolate(frame, [12, 24], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 58, background: 'rgba(6,13,24,0.82)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${GOLD}1A`, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: op }}>
      <div style={{ whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: raleway.fontFamily, fontSize: 16, color: `${WHITE}55`, letterSpacing: '0.18em', fontWeight: 300 }}>{T.repeat(6)}</div>
    </div>
  );
};

// ── Hook scene ────────────────────────────────────────────────────────────────
const HookScene: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp' });

  // "THIS IS WHERE" clip reveal
  const line1Pct = interpolate(frame, [6, 24], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  // "YOUR STORY" spring slam
  const p2 = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 14, stiffness: 280, mass: 0.85 } });
  const l2Scale = interpolate(p2, [0, 1], [0.4, 1]);
  const l2Op    = interpolate(p2, [0, 0.3, 1], [0, 1, 1]);
  // "BEGINS." fade
  const l3Op = interpolate(frame, [28, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK, opacity: fadeOut }}>
      {/* Blurred aerial bg */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(4px) brightness(0.35) saturate(60%)' }} />
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        {/* THIS IS WHERE — clip reveal */}
        <div style={{ clipPath: `inset(0 0 ${100 - line1Pct}% 0)` }}>
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 34, fontWeight: 300, color: GOLD, letterSpacing: '0.35em', textTransform: 'uppercase' as const }}>
            This Is Where
          </div>
        </div>

        {/* YOUR STORY — spring slam */}
        <div style={{ transform: `scale(${l2Scale})`, opacity: l2Op }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 110, fontWeight: 700, color: WHITE, letterSpacing: '0.06em', lineHeight: 1, textShadow: `0 0 80px ${GOLD}55, 0 4px 40px rgba(0,0,0,0.9)`, textAlign: 'center' as const }}>
            YOUR STORY
          </div>
        </div>

        {/* BEGINS. */}
        <div style={{ opacity: l3Op }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 56, fontWeight: 700, color: GOLD, letterSpacing: '0.18em', textShadow: `0 0 40px ${GOLD}88` }}>
            BEGINS.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Regular shot ──────────────────────────────────────────────────────────────
const ShotV12: React.FC<{
  img: string; frames: number; tag: string;
  line1?: string; line2?: string; isCounter?: boolean; idx: number;
}> = ({ img, frames, tag, line1, line2, isCounter, idx }) => (
  <Fade total={frames}>
    <AbsoluteFill style={{ backgroundColor: NAVY, overflow: 'hidden' }}>
      <ColorReveal src={img} totalFrames={frames} dir={idx % 2 === 0 ? 'in' : 'out'} />
      <DiagOverlay />
      <Particles />
      <TopLine delay={4} />
      <Corners delay={6} />
      <Logo />

      {/* TOP text block */}
      <div style={{
        position: 'absolute', top: 210, left: 52, right: 52,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <TagSlide text={tag} delay={5} />
        <DualRule delay={12} />
        {isCounter ? (
          <Counter />
        ) : (
          <>
            <Typewriter text={line1!} delay={10} speed={2.0} size={80} />
            <Typewriter text={line2!} delay={10 + (line1!.length * 2)} speed={2.0} size={80} color={GOLD} />
          </>
        )}
      </div>

      <Ticker />
    </AbsoluteFill>
  </Fade>
);

// ── CTA scene (animated gradient bg, no image) ────────────────────────────────
const CTAScene: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated gradient shift
  const hue = interpolate(frame, [0, frames], [200, 240], { extrapolateRight: 'clamp' });

  // "BOOK YOUR" slide from left
  const byOp = interpolate(frame, [20, 38], [0, 1], { extrapolateRight: 'clamp' });
  const byX  = interpolate(frame, [20, 38], [-60, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // "DREAM" clip reveal
  const drPct = interpolate(frame, [38, 58], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // "WEDDING" clip reveal delayed
  const wdPct = interpolate(frame, [52, 72], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Gold underline draw
  const ulW = interpolate(frame, [75, 105], [0, 860], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Phone number
  const phone = '73385 01337';
  const digitsShown = Math.floor(interpolate(frame, [115, 115 + phone.length * 5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursor = digitsShown < phone.length && Math.round(frame / 5) % 2 === 0;
  const phoneGlow = 0.5 + 0.5 * Math.sin(frame * 0.12);

  // Website
  const webOp = interpolate(frame, [195, 215], [0, 1], { extrapolateRight: 'clamp' });

  // Enquire button
  const btnP = spring({ frame: Math.max(0, frame - 230), fps, config: { damping: 14, stiffness: 220, mass: 0.9 } });
  const btnSc = interpolate(btnP, [0, 1], [0.7, 1]);
  const btnOp = interpolate(btnP, [0, 0.4, 1], [0, 1, 1]);
  const btnGlow = 0.5 + 0.5 * Math.sin(frame * 0.11);

  // Pulsing rings
  const rings = [0, 50, 100];

  return (
    <Fade total={frames}>
      <AbsoluteFill>
        {/* Animated dark gradient bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, hsla(${hue},40%,14%,1) 0%, ${BLACK} 70%)`,
        }} />

        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />

        <Particles />

        {/* Pulsing rings */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {rings.map((offset, i) => {
            const t = (frame + offset) % 120;
            const sz  = interpolate(t, [0, 120], [40, 700]);
            const op2 = interpolate(t, [0, 70, 120], [0.4, 0.12, 0]);
            return <div key={i} style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: `1px solid ${GOLD}`, opacity: op2 }} />;
          })}
        </div>

        <TopLine delay={0} />
        <Corners delay={4} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 78, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Img src={staticFile('logo_sticky.webp')} style={{ width: 200, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 18px ${GOLD}aa)` }} />
        </div>

        {/* Main content block */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -48%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 960 }}>

          {/* BOOK YOUR */}
          <div style={{ opacity: byOp, transform: `translateX(${byX}px)`, fontFamily: raleway.fontFamily, fontSize: 30, color: GOLD, letterSpacing: '0.35em', fontWeight: 400, textTransform: 'uppercase' as const }}>
            Book Your
          </div>
          <div style={{ height: 10 }} />

          {/* DREAM — clip reveal */}
          <div style={{ clipPath: `inset(0 0 ${100 - drPct}% 0)` }}>
            <div style={{ fontFamily: cinzel.fontFamily, fontSize: 112, color: WHITE, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, textShadow: `0 0 60px ${GOLD}44, 0 4px 40px rgba(0,0,0,0.9)` }}>
              DREAM
            </div>
          </div>

          {/* WEDDING — clip reveal */}
          <div style={{ clipPath: `inset(0 0 ${100 - wdPct}% 0)` }}>
            <div style={{ fontFamily: cinzel.fontFamily, fontSize: 112, color: WHITE, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, textShadow: `0 0 60px ${GOLD}44, 0 4px 40px rgba(0,0,0,0.9)` }}>
              WEDDING
            </div>
          </div>

          <div style={{ height: 18 }} />

          {/* Gold underline */}
          <div style={{ width: ulW, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD}, transparent)`, boxShadow: `0 0 14px ${GOLD}`, marginBottom: 36 }} />

          {/* Phone */}
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 68, color: GOLD, fontWeight: 400, letterSpacing: '0.12em', textShadow: `0 0 ${28 + 18 * phoneGlow}px ${GOLD}${Math.round(70 + 50 * phoneGlow).toString(16)}`, minHeight: 90, textAlign: 'center' as const }}>
            {phone.slice(0, digitsShown)}
            {cursor && <span style={{ opacity: 1 }}>|</span>}
          </div>
          <div style={{ height: 10 }} />

          {/* Website */}
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 26, color: `${WHITE}55`, letterSpacing: '0.08em', fontWeight: 300, opacity: webOp }}>
            jkrfarmsandresorts.com
          </div>
          <div style={{ height: 36 }} />

          {/* ENQUIRE NOW button */}
          <div style={{ transform: `scale(${btnSc})`, opacity: btnOp }}>
            <div style={{
              paddingLeft: 64, paddingRight: 64, paddingTop: 22, paddingBottom: 22,
              border: `2px solid ${GOLD}`,
              borderRadius: 100,
              background: `rgba(201,168,76,${0.10 + 0.10 * btnGlow})`,
              boxShadow: `0 0 ${22 + 18 * btnGlow}px ${GOLD}${Math.round(35 + 30 * btnGlow).toString(16)}`,
              fontFamily: raleway.fontFamily, fontSize: 26, fontWeight: 600,
              color: GOLD, letterSpacing: '0.26em', textTransform: 'uppercase' as const,
            }}>
              ENQUIRE NOW
            </div>
          </div>
        </div>

        <Ticker />
      </AbsoluteFill>
    </Fade>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
export const JKRReelV12: React.FC = () => {
  const [handle] = React.useState(() => delayRender('fonts-v12'));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Series>
        {SHOTS_V12.map((shot, i) => {
          if (shot.isHook) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <HookScene img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCTA) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAScene frames={shot.frames} />
            </Series.Sequence>
          );
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV12 img={shot.img!} frames={shot.frames} tag={shot.tag!} line1={shot.line1} line2={shot.line2} isCounter={shot.isCounter} idx={shot.idx!} />
            </Series.Sequence>
          );
        })}
      </Series>
      <Audio src={staticFile('voice/voice_v12.mp3')} volume={1} />
      <Audio src={staticFile('voice/bg_music_v2.mp3')} volume={0.12} />
    </AbsoluteFill>
  );
};
