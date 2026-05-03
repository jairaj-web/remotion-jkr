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

// V14 — "GOLDEN HOUR" — warm maroon+champagne, vertical Ken Burns, split text reveal, Roman numerals
const MAROON = '#1A0A0A';
const CHAMP  = '#C9A96E';
const CHAMP2 = '#E8C87A';
const CREAM  = '#F5EDD8';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

// Hook:45 + 6×45 shots + CTA:285 = 600f = 20s
const SHOTS_V14 = [
  { isHook: true,  img: 'w_cta_hero.webp',          frames: 45 },
  { img: 'v12_aerial_lawn2.webp',  line1: 'Six Acres',     line2: 'Of Heaven',       frames: 45, idx: 0 },
  { img: 'v10_shot3_ceremony.webp',line1: 'Every Vow',     line2: 'Becomes Eternal', frames: 45, idx: 1 },
  { img: 'svl_SVL06560.webp',      line1: 'Luxury',        line2: 'Crafted For You', frames: 45, idx: 2 },
  { img: 'site_Dining-Hall-3.webp',isCounter: true,                                  frames: 45, idx: 3 },
  { img: 'v12_aerial_pool.webp',   line1: 'Sky Above',     line2: 'Pool Below',      frames: 45, idx: 4 },
  { img: 'w03_svl595.webp',        line1: 'Your Story',    line2: 'Starts Here',     frames: 45, idx: 5 },
  { isCTA: true,  img: 'v12_aerial_mandap.webp',    frames: 285 },
];

export const TOTAL_FRAMES_V14 = SHOTS_V14.reduce((a, s) => a + s.frames, 0); // 600f = 20s

// ── Vertical Ken Burns ────────────────────────────────────────────────────────
const KenBurnsV: React.FC<{ src: string; totalFrames: number; dir?: 1 | -1 }> = ({ src, totalFrames, dir = 1 }) => {
  const frame = useCurrentFrame();
  const ty  = interpolate(frame, [0, totalFrames], [0, dir * 4], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const sc  = interpolate(frame, [0, totalFrames], [1.08, 1.04], { extrapolateRight: 'clamp' });
  const sat = interpolate(frame, [0, 20], [10, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const brt = interpolate(frame, [0, 14], [0.4, 1.0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: '100%', height: '110%', objectFit: 'cover',
          transform: `scale(${sc}) translateY(${ty}%)`,
          filter: `saturate(${sat}%) brightness(${brt})`,
        }}
      />
    </div>
  );
};

// ── Golden sweep transition (bright band sweeps left→right on entry) ──────────
const GoldenSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 18], [0, 130], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const op    = interpolate(frame, [0, 6, 14, 18], [0, 1, 0.8, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, transparent, ${CHAMP}CC, ${CHAMP2}EE, ${CHAMP}CC, transparent)`,
        transform: `translateX(${sweep - 65}%)`,
        opacity: op,
      }} />
    </div>
  );
};

// ── Vignette ─────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `radial-gradient(ellipse 85% 70% at 50% 50%, transparent 25%, rgba(26,10,10,0.78) 100%)`,
  }} />
);

// ── Split text reveal ─────────────────────────────────────────────────────────
// Uses clipPath so each half is ALWAYS clipped correctly — no doubling at mid-animation
const SplitReveal: React.FC<{
  text: string; size: number; color?: string; delay?: number; weight?: number;
}> = ({ text, size, color = CREAM, delay = 0, weight = 700 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p    = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 260, mass: 0.7 } });
  // Both halves start fully outside (size * 1.3 ensures complete invisibility)
  const topY = interpolate(p, [0, 1], [-size * 1.3, 0]);
  const botY = interpolate(p, [0, 1], [size * 1.3, 0]);
  const op   = interpolate(p, [0, 0.1, 1], [0, 1, 1]);

  const textStyle: React.CSSProperties = {
    fontFamily: cinzel.fontFamily, fontSize: size, fontWeight: weight as any,
    color, letterSpacing: '0.06em', lineHeight: 1,
    textShadow: '0 4px 40px rgba(0,0,0,0.9)',
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div style={{ position: 'relative', height: size, display: 'inline-block', opacity: op }}>
      {/* Top half — clipPath always shows only top 50%, slides from above */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        clipPath: 'inset(0 0 50% 0)',
        transform: `translateY(${topY}px)`,
      }}>
        <div style={textStyle}>{text}</div>
      </div>
      {/* Bottom half — clipPath always shows only bottom 50%, slides from below */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        clipPath: 'inset(50% 0 0 0)',
        transform: `translateY(${botY}px)`,
      }}>
        <div style={textStyle}>{text}</div>
      </div>
    </div>
  );
};

// ── Heartbeat decoration line ─────────────────────────────────────────────────
const HeartbeatLine: React.FC<{ delay?: number }> = ({ delay = 8 }) => {
  const frame = useCurrentFrame();
  const prog = interpolate(frame - delay, [0, 30], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op   = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Pulse dot travels along
  const dotX = interpolate(frame - delay, [0, 30], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dotOp = interpolate(frame - delay, [24, 30], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'relative', height: 14, width: '100%', marginBottom: 10, opacity: op }}>
      {/* Base line */}
      <div style={{ position: 'absolute', top: 6, left: 0, right: 0, height: 1.5, background: `${CHAMP}30` }} />
      {/* Drawn line */}
      <div style={{ position: 'absolute', top: 6, left: 0, height: 1.5, width: `${prog}%`, background: `linear-gradient(90deg, transparent, ${CHAMP}, ${CHAMP2})`, boxShadow: `0 0 8px ${CHAMP}` }} />
      {/* Traveling pulse dot */}
      <div style={{
        position: 'absolute', top: 2, left: `${dotX}%`,
        width: 10, height: 10, borderRadius: '50%',
        background: CHAMP2, boxShadow: `0 0 16px ${CHAMP2}, 0 0 28px ${CHAMP}`,
        transform: 'translateX(-50%)', opacity: dotOp,
      }} />
    </div>
  );
};

// ── Roman numeral tag ─────────────────────────────────────────────────────────
const RomanTag: React.FC<{ numeral: string; delay?: number }> = ({ numeral, delay = 5 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y  = interpolate(frame - delay, [0, 14], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: op, transform: `translateY(${y}px)`, marginBottom: 14 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${CHAMP}80)` }} />
      <div style={{ fontFamily: raleway.fontFamily, fontSize: 18, fontWeight: 300, color: `${CHAMP}BB`, letterSpacing: '0.34em' }}>{numeral}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${CHAMP}80)` }} />
    </div>
  );
};

// ── Logo ──────────────────────────────────────────────────────────────────────
const LogoV14: React.FC<{ size?: number; delay?: number }> = ({ size = 150, delay = 8 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y  = interpolate(frame - delay, [0, 16], [-10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 68, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${y}px)` }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: size, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 18px ${CHAMP}AA)` }} />
    </div>
  );
};

// ── Warm particles ────────────────────────────────────────────────────────────
const PDATA14 = [
  { x: 12, spd: 1.0, sz: 3, dl: 0  }, { x: 32, spd: 0.8, sz: 4, dl: 9  },
  { x: 55, spd: 1.2, sz: 3, dl: 4  }, { x: 74, spd: 0.9, sz: 4, dl: 14 },
  { x: 88, spd: 1.1, sz: 3, dl: 2  }, { x: 44, spd: 0.95, sz: 3, dl: 11 },
  { x: 96, spd: 0.7, sz: 4, dl: 18 },
];
const ParticlesV14: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PDATA14.map((p, i) => {
        const f  = Math.max(0, frame - p.dl);
        const y  = (1920 + p.sz) - (f * p.spd * 3.2) % 1960;
        const dx = Math.sin(f * 0.044 + i * 1.4) * 12;
        const op = interpolate(f, [0, 12], [0, 0.55], { extrapolateRight: 'clamp' }) * (0.4 + 0.6 * Math.sin(f * 0.085 + i * 1.5));
        return <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: y, transform: `translateX(${dx}px)`, width: p.sz, height: p.sz, borderRadius: '50%', backgroundColor: CHAMP, opacity: op, boxShadow: `0 0 ${p.sz * 5}px ${CHAMP2}` }} />;
      })}
    </div>
  );
};

// ── Scrolling ticker ──────────────────────────────────────────────────────────
const TickerV14: React.FC<{ delay?: number }> = ({ delay = 10 }) => {
  const frame = useCurrentFrame();
  const T = 'JKR FARMS & RESORTS  ·  NORTH BANGALORE  ·  6 ACRES  ·  1000+ GUESTS  ·  73385 01337  ·  jkrfarmsandresorts.com  ·  ';
  const x  = -(frame * 1.5) % (T.length * 13.5);
  const op = interpolate(frame - delay, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: 'rgba(26,10,10,0.92)', backdropFilter: 'blur(14px)', borderTop: `1px solid ${CHAMP}22`, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: op }}>
      <div style={{ whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: raleway.fontFamily, fontSize: 15, color: `${CREAM}3A`, letterSpacing: '0.20em', fontWeight: 300 }}>{T.repeat(6)}</div>
    </div>
  );
};

// ── Warm glass card ───────────────────────────────────────────────────────────
const WarmCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 200, mass: 0.9 } });
  const sc = interpolate(p, [0, 1], [0.90, 1]);
  const op = interpolate(p, [0, 0.28, 1], [0, 1, 1]);
  const ty = interpolate(p, [0, 1], [36, 0]);
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: `translate(-50%, calc(-50% + ${ty}px)) scale(${sc})`,
      opacity: op,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: 950, textAlign: 'center' as const,
      background: 'rgba(26,10,10,0.58)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid rgba(201,169,110,0.25)`,
      borderRadius: 32,
      padding: '36px 52px 40px',
      boxShadow: `0 8px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,169,110,0.10)`,
    }}>
      {children}
    </div>
  );
};

// ── Progress dots ─────────────────────────────────────────────────────────────
const ProgressDotsV14: React.FC<{ current: number; delay?: number }> = ({ current, delay = 10 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 72, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10, opacity: op }}>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const active = i === current;
        return (
          <div key={i} style={{
            width: active ? 30 : 8, height: 8, borderRadius: 4,
            background: active ? CHAMP : `${CHAMP}30`,
            boxShadow: active ? `0 0 12px ${CHAMP}` : 'none',
            transition: 'width 0.2s',
          }} />
        );
      })}
    </div>
  );
};

// ── Counter 0 → 1000+ ─────────────────────────────────────────────────────────
const CounterV14: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.floor(interpolate(frame, [4, 38], [0, 1000], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const p   = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 12, stiffness: 280, mass: 0.8 } });
  const sc  = interpolate(p, [0, 1], [0.2, 1]);
  const op  = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.16);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, transform: `scale(${sc})`, opacity: op }}>
      <div style={{ fontFamily: cinzel.fontFamily, fontSize: 130, fontWeight: 700, color: CHAMP, lineHeight: 1, textShadow: `0 0 ${36 + 22 * glow}px ${CHAMP}${Math.round(55 + 45 * glow).toString(16)}` }}>
        {count.toLocaleString()}+
      </div>
      <div style={{ fontFamily: raleway.fontFamily, fontSize: 28, color: CREAM, letterSpacing: '0.26em', textTransform: 'uppercase' as const }}>
        Guests Capacity
      </div>
    </div>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
const HookV14: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const makeLetterStyle = (delay: number): React.CSSProperties => {
    const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10, stiffness: 420, mass: 0.5 } });
    const sc = interpolate(p, [0, 1], [0, 1]);
    const ty = interpolate(p, [0, 1], [-80, 0]);
    const op = interpolate(p, [0, 0.18, 1], [0, 1, 1]);
    return {
      display: 'inline-block',
      transform: `scale(${sc}) translateY(${ty}px)`,
      opacity: op,
      fontFamily: cinzel.fontFamily, fontSize: 192, fontWeight: 700, color: CHAMP,
      letterSpacing: '0.10em', lineHeight: 1,
      textShadow: `0 0 80px ${CHAMP}88, 0 0 40px ${CHAMP2}55, 0 8px 50px rgba(0,0,0,0.95)`,
    };
  };

  const lineW  = interpolate(frame, [18, 34], [0, 82], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const subOp  = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: 'clamp' });
  const subY   = interpolate(frame, [22, 36], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const tagOp  = interpolate(frame, [30, 42], [0, 1], { extrapolateRight: 'clamp' });
  const tagY   = interpolate(frame, [30, 42], [12, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: MAROON, opacity: fadeOut }}>
      <div style={{ position: 'absolute', inset: 0, opacity: bgOp }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px) brightness(0.20) saturate(35%)' }} />
      </div>
      <GoldenSweep />
      <ParticlesV14 />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* J K R */}
        <div>
          <span style={makeLetterStyle(0)}>J</span>
          <span style={makeLetterStyle(7)}>K</span>
          <span style={makeLetterStyle(14)}>R</span>
        </div>

        {/* Champagne rule */}
        <div style={{ width: `${lineW}%`, height: 2, background: `linear-gradient(90deg, transparent, ${CHAMP}, ${CHAMP2}, ${CHAMP}, transparent)`, boxShadow: `0 0 20px ${CHAMP}AA`, marginTop: 6, marginBottom: 22 }} />

        {/* FARMS & RESORTS */}
        <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, fontFamily: raleway.fontFamily, fontSize: 34, fontWeight: 400, color: CREAM, letterSpacing: '0.34em', textTransform: 'uppercase' as const, textShadow: '0 2px 22px rgba(0,0,0,0.8)' }}>
          Farms &amp; Resorts
        </div>

        {/* Golden Hour tag */}
        <div style={{ opacity: tagOp, transform: `translateY(${tagY}px)`, marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 20, height: 1, background: `${CHAMP}88` }} />
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 17, fontWeight: 300, color: `${CHAMP}99`, letterSpacing: '0.28em' }}>GOLDEN HOUR</div>
          <div style={{ width: 20, height: 1, background: `${CHAMP}88` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Regular shot ─────────────────────────────────────────────────────────────
const ShotV14: React.FC<{
  img: string; frames: number; idx: number;
  line1?: string; line2?: string; isCounter?: boolean;
}> = ({ img, frames, idx, line1, line2, isCounter }) => {
  const frame = useCurrentFrame();

  // Vertical reveal: top→bottom or bottom→top alternating
  const revPct = interpolate(frame, [0, 22], [0, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const clipPath = idx % 2 === 0
    ? `inset(${100 - revPct}% 0 0 0)`   // top → down
    : `inset(0 0 ${100 - revPct}% 0)`;  // bottom → up

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: MAROON, opacity: fadeOut }}>
      <div style={{ position: 'absolute', inset: 0, clipPath }}>
        <KenBurnsV src={img} totalFrames={frames} dir={idx % 2 === 0 ? 1 : -1} />
      </div>
      <GoldenSweep />
      <Vignette />
      <ParticlesV14 />
      <LogoV14 delay={6} />

      {/* Warm glass card */}
      <WarmCard delay={5}>
        {isCounter ? (
          <CounterV14 />
        ) : (
          <>
            <RomanTag numeral={ROMAN[idx]} delay={5} />
            <HeartbeatLine delay={8} />
            <div style={{ height: 14 }} />
            <SplitReveal text={line1!} size={86} color={CREAM} delay={8} />
            <div style={{ height: 8 }} />
            <SplitReveal text={line2!} size={86} color={CHAMP} delay={14} />
          </>
        )}
      </WarmCard>

      <ProgressDotsV14 current={idx} delay={10} />
      <TickerV14 />
    </AbsoluteFill>
  );
};

// ── CTA scene ─────────────────────────────────────────────────────────────────
const CTAV14: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSat = interpolate(frame, [0, 40], [10, 60], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // "YOUR LOVE STORY" split reveal — offset > half-height of 56px font (28px), use 80
  const p1   = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 14, stiffness: 240, mass: 0.75 } });
  const ty1  = interpolate(p1, [0, 1], [80, 0]);
  const tyN1 = interpolate(p1, [0, 1], [-80, 0]);
  const op1  = interpolate(p1, [0, 0.15, 1], [0, 1, 1]);

  // "BEGINS HERE" split reveal — offset > half-height of 108px font (54px), use 120
  const p2   = spring({ frame: Math.max(0, frame - 32), fps, config: { damping: 14, stiffness: 240, mass: 0.75 } });
  const ty2  = interpolate(p2, [0, 1], [120, 0]);
  const tyN2 = interpolate(p2, [0, 1], [-120, 0]);
  const op2  = interpolate(p2, [0, 0.15, 1], [0, 1, 1]);

  // Champagne divider line
  const divW = interpolate(frame, [60, 88], [0, 880], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Phone typing
  const phone = '73385 01337';
  const shown = Math.floor(interpolate(frame, [95, 95 + phone.length * 5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursor = shown < phone.length && Math.round(frame / 5) % 2 === 0;
  const phoneGlow = 0.5 + 0.5 * Math.sin(frame * 0.13);

  // Website fade
  const webOp = interpolate(frame, [170, 190], [0, 1], { extrapolateRight: 'clamp' });

  // Button spring
  const btnP  = spring({ frame: Math.max(0, frame - 200), fps, config: { damping: 14, stiffness: 200, mass: 0.95 } });
  const btnSc = interpolate(btnP, [0, 1], [0.60, 1]);
  const btnOp = interpolate(btnP, [0, 0.4, 1], [0, 1, 1]);
  const btnPulse = 0.5 + 0.5 * Math.sin(frame * 0.10);

  // Pulsing rings
  const rings = [0, 60, 120];

  // Warm diagonal light beam
  const beamOp = interpolate(frame, [0, 30, 200, 285], [0, 0.07, 0.07, 0], { extrapolateRight: 'clamp' });

  const fadeOut = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const splitStyle = (fontSize: number, color: string): React.CSSProperties => ({
    fontFamily: cinzel.fontFamily, fontSize, fontWeight: 700, color,
    letterSpacing: '0.06em', lineHeight: 1,
    textShadow: `0 4px 48px rgba(0,0,0,0.9)`,
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '110%', objectFit: 'cover', filter: `blur(3px) brightness(0.25) saturate(${imgSat}%)` }} />
      </div>

      {/* Warm overlay */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(26,10,10,0.75) 0%, rgba(26,10,10,0.45) 45%, rgba(26,10,10,0.88) 100%)` }} />

      {/* Diagonal warm beam */}
      <div style={{ position: 'absolute', inset: 0, opacity: beamOp, background: `linear-gradient(135deg, transparent 30%, rgba(201,169,110,0.5) 50%, transparent 70%)` }} />

      {/* Subtle warm grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `linear-gradient(${CHAMP} 1px, transparent 1px), linear-gradient(90deg, ${CHAMP} 1px, transparent 1px)`, backgroundSize: '90px 90px' }} />

      <ParticlesV14 />

      {/* Pulsing rings */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {rings.map((offset, i) => {
          const t  = (frame + offset) % 120;
          const sz = interpolate(t, [0, 120], [50, 720]);
          const ro = interpolate(t, [0, 70, 120], [0.35, 0.08, 0]);
          return <div key={i} style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', border: `1.5px solid ${CHAMP}`, opacity: ro }} />;
        })}
      </div>

      {/* Logo */}
      <div style={{ position: 'absolute', top: 68, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Img src={staticFile('logo_sticky.webp')} style={{ width: 210, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 24px ${CHAMP}CC)` }} />
      </div>

      {/* Main content */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -46%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 980 }}>

        {/* YOUR LOVE STORY split reveal */}
        <div style={{ position: 'relative', height: 56, opacity: op1 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, clipPath: 'inset(0 0 50% 0)', transform: `translateY(${tyN1}px)` }}>
            <div style={splitStyle(56, `${CHAMP}CC`)}>YOUR LOVE STORY</div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, clipPath: 'inset(50% 0 0 0)', transform: `translateY(${ty1}px)` }}>
            <div style={splitStyle(56, `${CHAMP}CC`)}>YOUR LOVE STORY</div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        {/* BEGINS HERE split reveal */}
        <div style={{ position: 'relative', height: 108, opacity: op2 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, clipPath: 'inset(0 0 50% 0)', transform: `translateY(${tyN2}px)` }}>
            <div style={splitStyle(108, CREAM)}>BEGINS HERE</div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, clipPath: 'inset(50% 0 0 0)', transform: `translateY(${ty2}px)` }}>
            <div style={splitStyle(108, CREAM)}>BEGINS HERE</div>
          </div>
        </div>

        <div style={{ height: 22 }} />

        {/* Divider */}
        <div style={{ width: divW, height: 2, background: `linear-gradient(90deg, transparent, ${CHAMP}, ${CHAMP2}, ${CHAMP}, transparent)`, boxShadow: `0 0 18px ${CHAMP}`, marginBottom: 32 }} />

        {/* Phone */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 68, color: CHAMP, fontWeight: 400, letterSpacing: '0.14em', textShadow: `0 0 ${28 + 20 * phoneGlow}px ${CHAMP}${Math.round(65 + 55 * phoneGlow).toString(16)}`, minHeight: 92, textAlign: 'center' as const }}>
          {phone.slice(0, shown)}{cursor && <span>|</span>}
        </div>
        <div style={{ height: 8 }} />

        {/* Website */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 24, color: `${CREAM}45`, letterSpacing: '0.10em', fontWeight: 300, opacity: webOp }}>
          jkrfarmsandresorts.com
        </div>
        <div style={{ height: 36 }} />

        {/* ENQUIRE NOW button */}
        <div style={{ transform: `scale(${btnSc})`, opacity: btnOp }}>
          <div style={{
            paddingLeft: 64, paddingRight: 64, paddingTop: 22, paddingBottom: 22,
            border: `2px solid ${CHAMP}`,
            borderRadius: 100,
            background: `rgba(201,169,110,${0.10 + 0.08 * btnPulse})`,
            boxShadow: `0 0 ${24 + 16 * btnPulse}px ${CHAMP}${Math.round(36 + 30 * btnPulse).toString(16)}`,
            fontFamily: raleway.fontFamily, fontSize: 27, fontWeight: 600,
            color: CHAMP, letterSpacing: '0.28em', textTransform: 'uppercase' as const,
          }}>
            ENQUIRE NOW
          </div>
        </div>
      </div>

      <TickerV14 />
    </AbsoluteFill>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
export const JKRReelV14: React.FC = () => {
  const [handle] = React.useState(() => delayRender('fonts-v14'));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: MAROON }}>
      <Series>
        {SHOTS_V14.map((shot, i) => {
          if (shot.isHook) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <HookV14 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCTA) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAV14 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV14
                img={shot.img!} frames={shot.frames} idx={shot.idx!}
                line1={shot.line1} line2={shot.line2} isCounter={shot.isCounter}
              />
            </Series.Sequence>
          );
        })}
      </Series>
      {/* Shots: 6 lines, hard cut at frame 270 (9.0s) */}
      <Sequence durationInFrames={270}>
        <Audio src={staticFile('voice/voice_v14_shots.mp3')} volume={1} />
      </Sequence>
      {/* CTA: starts at frame 270 (9.0s) */}
      <Sequence from={270}>
        <Audio src={staticFile('voice/voice_v14_cta.mp3')} volume={1} />
      </Sequence>
      <Audio src={staticFile('voice/bg_music_v2.mp3')} volume={0.15} />
    </AbsoluteFill>
  );
};
