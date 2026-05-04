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

// V13 — "THE CROWN" — JKR slam hook, horizontal reveals, word slams, bottom-third panels, female voice
const GOLD   = '#D4A843';
const GOLD2  = '#F0D080';
const CREAM  = '#F0EBE0';
const DARK   = '#080808';

// Hook:45 + 6×45 shots + CTA:285 = 600f = 20s
const SHOTS_V13 = [
  { isHook: true, img: 'v9_ceremony.webp',         frames: 45 },
  { img: 'v9_aerial.webp',          line1: "North Bangalore's", line2: 'Crown Jewel',   frames: 45, idx: 0 },
  { img: 'w05_svl746.webp',         line1: 'Every Ceremony',   line2: 'A Masterpiece', frames: 45, idx: 1 },
  { img: 'w07_svl830.webp',         line1: 'Rooms Built',      line2: 'For Royalty',   frames: 45, idx: 2 },
  { img: 'site_Dining-Hall-2.webp', isCounter: true,                                    frames: 45, idx: 3 },
  { img: 'v10_shot1_rooftop.webp',  line1: 'Rooftop Pool',     line2: 'Paradise',      frames: 45, idx: 4 },
  { img: 'svl_SVL06580.webp',       line1: 'Begin Your',       line2: 'Forever Here',  frames: 45, idx: 5 },
  { isCTA: true, img: 'v10_shot5_entrance.webp',   frames: 285 },
];

export const TOTAL_FRAMES_V13 = SHOTS_V13.reduce((a, s) => a + s.frames, 0); // 600f = 20s

// ── Horizontal Ken Burns ──────────────────────────────────────────────────────
const KenBurnsH: React.FC<{ src: string; totalFrames: number; dir?: 1 | -1 }> = ({ src, totalFrames, dir = 1 }) => {
  const frame = useCurrentFrame();
  const tx  = interpolate(frame, [0, totalFrames], [0, dir * 3.5], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const sat = interpolate(frame, [0, 18], [5, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const brt = interpolate(frame, [0, 12], [0.45, 1.0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: '107%', height: '107%', objectFit: 'cover',
          transform: `translateX(${tx}%)`, marginLeft: '-3.5%', marginTop: '-3.5%',
          filter: `saturate(${sat}%) brightness(${brt})`,
        }}
      />
    </div>
  );
};

// ── White flash on shot entry ─────────────────────────────────────────────────
const FlashIn: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 6], [0.85, 0], { extrapolateRight: 'clamp' });
  return <div style={{ position: 'absolute', inset: 0, backgroundColor: 'white', opacity: op, pointerEvents: 'none', zIndex: 99 }} />;
};

// ── Center vignette (darkens edges, keeps center readable) ───────────────────
const BottomGrad: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `radial-gradient(ellipse 90% 75% at 50% 50%, transparent 30%, rgba(8,8,8,0.72) 100%)`,
  }} />
);

// ── Gold accent line draws left→right ─────────────────────────────────────────
const GoldAccentLine: React.FC<{ bottom: number; delay?: number }> = ({ bottom, delay = 5 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 20], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', bottom, left: 0, right: 0, height: 2 }}>
      <div style={{ height: '100%', width: `${w}%`, background: `linear-gradient(90deg, ${GOLD}, ${GOLD2}, ${GOLD})`, boxShadow: `0 0 14px ${GOLD}` }} />
    </div>
  );
};

// ── Word slam (each word springs in with rotation) ────────────────────────────
const WordSlam: React.FC<{
  text: string; delay?: number; size: number; color?: string; spacing?: string;
}> = ({ text, delay = 0, size, color = CREAM, spacing = '0.03em' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center', gap: `0 ${size * 0.26}px` }}>
      {words.map((word, i) => {
        const p = spring({ frame: Math.max(0, frame - delay - i * 5), fps, config: { damping: 10, stiffness: 400, mass: 0.5 } });
        const sc  = interpolate(p, [0, 1], [0, 1]);
        const rot = interpolate(p, [0, 0.55, 1], [-10, 3, 0]);
        const op  = interpolate(p, [0, 0.12, 1], [0, 1, 1]);
        return (
          <span key={i} style={{
            display: 'inline-block',
            transform: `scale(${sc}) rotate(${rot}deg)`,
            opacity: op, transformOrigin: 'bottom left',
            fontFamily: cinzel.fontFamily, fontSize: size, fontWeight: 700,
            color, letterSpacing: spacing, lineHeight: 1.1,
            textShadow: '0 4px 36px rgba(0,0,0,0.85)',
          }}>{word}</span>
        );
      })}
    </div>
  );
};

// ── Slide-up shot tag ─────────────────────────────────────────────────────────
const SlideTag: React.FC<{ text: string; delay?: number }> = ({ text, delay = 5 }) => {
  const frame = useCurrentFrame();
  const y  = interpolate(frame - delay, [0, 16], [28, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: op, transform: `translateY(${y}px)`, marginBottom: 18 }}>
      <div style={{ width: 28, height: 2, background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
      <div style={{ fontFamily: raleway.fontFamily, fontSize: 22, fontWeight: 600, color: GOLD, letterSpacing: '0.24em', textTransform: 'uppercase' as const }}>
        {text}
      </div>
      <div style={{ width: 28, height: 2, background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
    </div>
  );
};

// ── Logo ─────────────────────────────────────────────────────────────────────
const LogoV13: React.FC<{ size?: number; delay?: number }> = ({ size = 155, delay = 8 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y  = interpolate(frame - delay, [0, 16], [-12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 68, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${y}px)` }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: size, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 16px ${GOLD}99)` }} />
    </div>
  );
};

// ── Floating particles ─────────────────────────────────────────────────────────
const PDATA = [
  { x: 8,  spd: 1.1, sz: 3, dl: 0  }, { x: 28, spd: 0.85, sz: 4, dl: 7  },
  { x: 52, spd: 1.25, sz: 3, dl: 3 }, { x: 70, spd: 0.9,  sz: 4, dl: 13 },
  { x: 86, spd: 1.15, sz: 3, dl: 1 }, { x: 40, spd: 1.0,  sz: 3, dl: 10 },
  { x: 94, spd: 0.75, sz: 4, dl: 17 },
];
const ParticlesV13: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PDATA.map((p, i) => {
        const f  = Math.max(0, frame - p.dl);
        const y  = (1920 + p.sz) - (f * p.spd * 3.4) % 1960;
        const dx = Math.sin(f * 0.048 + i * 1.3) * 13;
        const op = interpolate(f, [0, 10], [0, 0.6], { extrapolateRight: 'clamp' }) * (0.42 + 0.58 * Math.sin(f * 0.09 + i * 1.5));
        return <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: y, transform: `translateX(${dx}px)`, width: p.sz, height: p.sz, borderRadius: '50%', backgroundColor: GOLD, opacity: op, boxShadow: `0 0 ${p.sz * 4}px ${GOLD}` }} />;
      })}
    </div>
  );
};

// ── Scrolling ticker ──────────────────────────────────────────────────────────
const TickerV13: React.FC<{ delay?: number }> = ({ delay = 10 }) => {
  const frame = useCurrentFrame();
  const T = 'JKR FARMS & RESORTS  ·  NORTH BANGALORE  ·  6 ACRES  ·  1000+ GUESTS  ·  73385 01337  ·  jkrfarmsandresorts.com  ·  ';
  const x  = -(frame * 1.55) % (T.length * 13.5);
  const op = interpolate(frame - delay, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: 'rgba(8,8,8,0.90)', backdropFilter: 'blur(14px)', borderTop: `1px solid ${GOLD}25`, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: op }}>
      <div style={{ whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: raleway.fontFamily, fontSize: 15, color: `${CREAM}40`, letterSpacing: '0.20em', fontWeight: 300 }}>{T.repeat(6)}</div>
    </div>
  );
};

// ── Counter 0 → 1000+ ────────────────────────────────────────────────────────
const CounterV13: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.floor(interpolate(frame, [5, 40], [0, 1000], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const p   = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 11, stiffness: 300, mass: 0.75 } });
  const sc  = interpolate(p, [0, 1], [0.2, 1]);
  const op  = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.18);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, transform: `scale(${sc})`, opacity: op }}>
      <div style={{ fontFamily: cinzel.fontFamily, fontSize: 128, fontWeight: 700, color: GOLD, lineHeight: 1, textShadow: `0 0 ${38 + 24 * glow}px ${GOLD}${Math.round(55 + 45 * glow).toString(16)}` }}>
        {count.toLocaleString()}+
      </div>
      <div style={{ fontFamily: raleway.fontFamily, fontSize: 28, color: CREAM, letterSpacing: '0.24em', textTransform: 'uppercase' as const }}>
        Guests Capacity
      </div>
    </div>
  );
};

// ── Hook — "JKR" letter slam + subtitle ───────────────────────────────────────
const HookV13: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  const makeLetterStyle = (delay: number): React.CSSProperties => {
    const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 9, stiffness: 450, mass: 0.48 } });
    const sc = interpolate(p, [0, 1], [0, 1]);
    const ty = interpolate(p, [0, 1], [-90, 0]);
    const op = interpolate(p, [0, 0.15, 1], [0, 1, 1]);
    return {
      display: 'inline-block',
      transform: `scale(${sc}) translateY(${ty}px)`,
      opacity: op,
      fontFamily: cinzel.fontFamily, fontSize: 188, fontWeight: 700, color: GOLD,
      letterSpacing: '0.08em', lineHeight: 1,
      textShadow: `0 0 70px ${GOLD}99, 0 8px 50px rgba(0,0,0,0.95)`,
    };
  };

  const lineW  = interpolate(frame, [18, 36], [0, 78], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const subOp  = interpolate(frame, [24, 38], [0, 1], { extrapolateRight: 'clamp' });
  const subY   = interpolate(frame, [24, 38], [22, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: DARK, opacity: fadeOut }}>
      <div style={{ position: 'absolute', inset: 0, opacity: bgOp }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px) brightness(0.26) saturate(45%)' }} />
      </div>
      <FlashIn />
      <ParticlesV13 />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* J K R letter slam */}
        <div>
          <span style={makeLetterStyle(0)}>J</span>
          <span style={makeLetterStyle(6)}>K</span>
          <span style={makeLetterStyle(12)}>R</span>
        </div>

        {/* Gold rule */}
        <div style={{ width: `${lineW}%`, height: 2.5, background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD}, transparent)`, boxShadow: `0 0 18px ${GOLD}`, marginTop: 4, marginBottom: 20 }} />

        {/* FARMS & RESORTS */}
        <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, fontFamily: raleway.fontFamily, fontSize: 36, fontWeight: 400, color: CREAM, letterSpacing: '0.32em', textTransform: 'uppercase' as const, textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          Farms &amp; Resorts
        </div>
        <div style={{ opacity: subOp, marginTop: 12, fontFamily: raleway.fontFamily, fontSize: 20, fontWeight: 300, color: `${GOLD}BB`, letterSpacing: '0.25em', textTransform: 'uppercase' as const }}>
          North Bangalore
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Glassmorphism center card ─────────────────────────────────────────────────
const GlassCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16, stiffness: 220, mass: 0.85 } });
  const sc = interpolate(p, [0, 1], [0.88, 1]);
  const op = interpolate(p, [0, 0.25, 1], [0, 1, 1]);
  const ty = interpolate(p, [0, 1], [40, 0]);
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: `translate(-50%, calc(-50% + ${ty}px)) scale(${sc})`,
      opacity: op,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: 940, textAlign: 'center' as const,
      background: 'rgba(8, 8, 8, 0.52)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      border: `1px solid rgba(212,168,67,0.28)`,
      borderRadius: 28,
      padding: '40px 56px 44px',
      boxShadow: `0 8px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,168,67,0.12)`,
    }}>
      {children}
    </div>
  );
};

// ── Shot progress dots ────────────────────────────────────────────────────────
const ProgressDots: React.FC<{ current: number; delay?: number }> = ({ current, delay = 10 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 72, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10, opacity: op }}>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const active = i === current;
        return (
          <div key={i} style={{
            width: active ? 28 : 8, height: 8, borderRadius: 4,
            background: active ? GOLD : `${GOLD}35`,
            boxShadow: active ? `0 0 10px ${GOLD}` : 'none',
          }} />
        );
      })}
    </div>
  );
};

// ── Inline gold rule (draws from center outward) ─────────────────────────────
const InlineRule: React.FC<{ delay?: number }> = ({ delay = 8 }) => {
  const frame = useCurrentFrame();
  const prog = interpolate(frame - delay, [0, 22], [0, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'relative', height: 2, width: '100%', marginBottom: 4 }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: `${prog}%`, background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
      <div style={{ position: 'absolute', right: '50%', top: 0, height: '100%', width: `${prog}%`, background: `linear-gradient(270deg, ${GOLD}, transparent)` }} />
    </div>
  );
};

// ── Regular shot ──────────────────────────────────────────────────────────────
const ShotV13: React.FC<{
  img: string; frames: number; idx: number;
  line1?: string; line2?: string; isCounter?: boolean;
}> = ({ img, frames, idx, line1, line2, isCounter }) => {
  const frame = useCurrentFrame();

  // Alternate horizontal reveal direction per shot
  const revPct = interpolate(frame, [0, 24], [0, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const clipPath = idx % 2 === 0
    ? `inset(0 ${100 - revPct}% 0 0)`   // left → right
    : `inset(0 0 0 ${100 - revPct}%)`;  // right → left

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const tagText = `0${idx + 1} / 06`;

  return (
    <AbsoluteFill style={{ backgroundColor: DARK, opacity: fadeOut }}>
      <div style={{ position: 'absolute', inset: 0, clipPath }}>
        <KenBurnsH src={img} totalFrames={frames} dir={idx % 2 === 0 ? 1 : -1} />
      </div>
      <FlashIn />
      <BottomGrad />
      <ParticlesV13 />
      <LogoV13 delay={6} />

      {/* Glassmorphism center card */}
      <GlassCard delay={5}>
        {isCounter ? (
          <CounterV13 />
        ) : (
          <>
            <SlideTag text={tagText} delay={6} />
            <InlineRule delay={8} />
            <div style={{ height: 18 }} />
            <WordSlam text={line1!} delay={8} size={88} color={CREAM} spacing="0.04em" />
            <div style={{ height: 10 }} />
            <WordSlam text={line2!} delay={8 + line1!.split(' ').length * 5} size={88} color={GOLD} spacing="0.04em" />
          </>
        )}
      </GlassCard>

      <ProgressDots current={idx} delay={10} />
      <TickerV13 />
    </AbsoluteFill>
  );
};

// ── CTA scene ─────────────────────────────────────────────────────────────────
const CTAV13: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSat  = interpolate(frame, [0, 35], [15, 65], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // "BOOK YOUR" slide from left
  const byOp = interpolate(frame, [20, 36], [0, 1], { extrapolateRight: 'clamp' });
  const byX  = interpolate(frame, [20, 36], [-55, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // "DREAM" spring slam
  const p1   = spring({ frame: Math.max(0, frame - 34), fps, config: { damping: 11, stiffness: 320, mass: 0.65 } });
  const d1Sc = interpolate(p1, [0, 1], [0.25, 1]);
  const d1Op = interpolate(p1, [0, 0.3, 1], [0, 1, 1]);

  // "WEDDING" spring slam (delayed)
  const p2   = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 11, stiffness: 320, mass: 0.65 } });
  const d2Sc = interpolate(p2, [0, 1], [0.25, 1]);
  const d2Op = interpolate(p2, [0, 0.3, 1], [0, 1, 1]);

  // Gold divider line
  const divW = interpolate(frame, [66, 95], [0, 900], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Phone digit-by-digit
  const phone = '73385 01337';
  const shown = Math.floor(interpolate(frame, [100, 100 + phone.length * 5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursor = shown < phone.length && Math.round(frame / 5) % 2 === 0;
  const phoneGlow = 0.5 + 0.5 * Math.sin(frame * 0.13);

  // Website fade
  const webOp = interpolate(frame, [175, 195], [0, 1], { extrapolateRight: 'clamp' });

  // CALL NOW button spring
  const btnP  = spring({ frame: Math.max(0, frame - 205), fps, config: { damping: 14, stiffness: 210, mass: 0.9 } });
  const btnSc = interpolate(btnP, [0, 1], [0.65, 1]);
  const btnOp = interpolate(btnP, [0, 0.4, 1], [0, 1, 1]);
  const btnPulse = 0.5 + 0.5 * Math.sin(frame * 0.11);

  // Pulsing rings
  const rings = [0, 55, 110];

  const fadeOut = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Venue image BG */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(4px) brightness(0.28) saturate(${imgSat}%)` }} />
      </div>

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(8,8,8,0.72) 0%, rgba(8,8,8,0.48) 45%, rgba(8,8,8,0.82) 100%)` }} />

      {/* Subtle grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`, backgroundSize: '88px 88px' }} />

      <ParticlesV13 />

      {/* Pulsing rings */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {rings.map((offset, i) => {
          const t  = (frame + offset) % 115;
          const sz = interpolate(t, [0, 115], [50, 700]);
          const ro = interpolate(t, [0, 65, 115], [0.38, 0.1, 0]);
          return <div key={i} style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: `1.5px solid ${GOLD}`, opacity: ro }} />;
        })}
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', top: 68, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Img src={staticFile('logo_sticky.webp')} style={{ width: 210, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 22px ${GOLD}CC)` }} />
      </div>

      {/* Main content */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -46%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 970 }}>

        {/* BOOK YOUR */}
        <div style={{ opacity: byOp, transform: `translateX(${byX}px)`, fontFamily: raleway.fontFamily, fontSize: 32, color: GOLD, letterSpacing: '0.34em', fontWeight: 400, textTransform: 'uppercase' as const }}>
          Book Your
        </div>
        <div style={{ height: 8 }} />

        {/* DREAM */}
        <div style={{ transform: `scale(${d1Sc})`, opacity: d1Op }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 120, color: CREAM, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, textShadow: `0 0 72px ${GOLD}44, 0 6px 44px rgba(0,0,0,0.9)` }}>
            DREAM
          </div>
        </div>

        {/* WEDDING */}
        <div style={{ transform: `scale(${d2Sc})`, opacity: d2Op }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 120, color: CREAM, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1, textShadow: `0 0 72px ${GOLD}44, 0 6px 44px rgba(0,0,0,0.9)` }}>
            WEDDING
          </div>
        </div>

        <div style={{ height: 18 }} />

        {/* Gold divider */}
        <div style={{ width: divW, height: 2.5, background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD}, transparent)`, boxShadow: `0 0 16px ${GOLD}`, marginBottom: 34 }} />

        {/* Phone */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 70, color: GOLD, fontWeight: 400, letterSpacing: '0.14em', textShadow: `0 0 ${30 + 22 * phoneGlow}px ${GOLD}${Math.round(65 + 55 * phoneGlow).toString(16)}`, minHeight: 95, textAlign: 'center' as const }}>
          {phone.slice(0, shown)}{cursor && <span>|</span>}
        </div>
        <div style={{ height: 10 }} />

        {/* Website */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 25, color: `${CREAM}50`, letterSpacing: '0.10em', fontWeight: 300, opacity: webOp }}>
          jkrfarmsandresorts.com
        </div>
        <div style={{ height: 34 }} />

        {/* CALL NOW button */}
        <div style={{ transform: `scale(${btnSc})`, opacity: btnOp }}>
          <div style={{
            paddingLeft: 70, paddingRight: 70, paddingTop: 24, paddingBottom: 24,
            border: `2px solid ${GOLD}`,
            borderRadius: 100,
            background: `rgba(212,168,67,${0.11 + 0.09 * btnPulse})`,
            boxShadow: `0 0 ${26 + 18 * btnPulse}px ${GOLD}${Math.round(38 + 32 * btnPulse).toString(16)}`,
            fontFamily: raleway.fontFamily, fontSize: 28, fontWeight: 600,
            color: GOLD, letterSpacing: '0.28em', textTransform: 'uppercase' as const,
          }}>
            CALL NOW
          </div>
        </div>
      </div>

      <TickerV13 />
    </AbsoluteFill>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
export const JKRReelV13: React.FC = () => {
  const [handle] = React.useState(() => delayRender('fonts-v13'));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: DARK }}>
      <Series>
        {SHOTS_V13.map((shot, i) => {
          if (shot.isHook) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <HookV13 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCTA) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAV13 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV13
                img={shot.img!} frames={shot.frames} idx={shot.idx!}
                line1={shot.line1} line2={shot.line2} isCounter={shot.isCounter}
              />
            </Series.Sequence>
          );
        })}
      </Series>
      <Audio src={staticFile('voice/voice_v13.mp3')} volume={1} />
      <Audio src={staticFile('voice/bg_music_v2.mp3')} volume={0.15} />
    </AbsoluteFill>
  );
};
