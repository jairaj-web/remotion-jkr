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

const GOLD   = '#F0C040';
const GOLD2  = '#C8960C';
const WHITE  = '#FFFFFF';
const BLACK  = '#000000';
const NAVY   = '#060D18';
const CHAMP  = '#F5E6C8';
const ROSE   = '#FFE4E1';

// V12 — Hook opening, fast cuts, blur-reveal, particles, counter, curtain CTA
// Hook:45 + 6×45 shots + CTA:435 = 750f = 25s
const SHOTS_V12 = [
  { isHook: true,    img: null,                    frames: 45 },
  { img: 'v10_shot4_aerial.webp',   tag: 'NORTH BANGALORE',   words: ['Most Breathtaking', 'Venue'],        frames: 45, idx: 0 },
  { img: 'w10_svl495.webp',         tag: 'PREMIUM LUXURY',    words: ['Luxury', 'Redefined'],               frames: 45, idx: 1 },
  { img: 'v10_shot3_ceremony.webp', tag: 'MAGICAL EVENINGS',  words: ['Unforgettable', 'Memories'],         frames: 45, idx: 2 },
  { img: 'v10_shot6_dining.webp',   tag: '1000+ GUESTS',      isCounter: true,                              frames: 45, idx: 3 },
  { img: 'v10_shot1_rooftop.webp',  tag: 'DIVINE BLESSINGS',  words: ['Your New', 'Beginning'],             frames: 45, idx: 4 },
  { img: 'v10_shot5_entrance.webp', tag: 'YOUR FOREVER',      words: ['Starts', 'RIGHT HERE'],              frames: 45, idx: 5 },
  { isCTA: true,     img: 'svl_SVL06860.webp',       frames: 435 },
];

export const TOTAL_FRAMES_V12 = SHOTS_V12.reduce((a, s) => a + s.frames, 0); // 750 = 25s

// ─── Hook Scene ────────────────────────────────────────────────────────────────
const HookScene: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flashOpacity = interpolate(frame, [2, 5, 9, 16], [0, 1, 0.5, 0], { extrapolateRight: 'clamp' });

  const waitP = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 10, stiffness: 500, mass: 0.6 } });
  const waitScale  = interpolate(waitP, [0, 1], [4.0, 1.0]);
  const waitOpacity = interpolate(frame, [4, 9], [0, 1], { extrapolateRight: 'clamp' });

  const subOpacity = interpolate(frame, [14, 24], [0, 1], { extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [14, 24], [28, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const lineW = interpolate(frame, [20, 36], [0, 500], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const fadeOut = interpolate(frame, [frames - 10, frames], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK, opacity: fadeOut }}>
      {/* White flash */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: WHITE, opacity: flashOpacity }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
      }}>
        {/* WAIT. */}
        <div style={{
          fontFamily: cinzel.fontFamily, fontSize: 160, fontWeight: 700,
          color: WHITE, letterSpacing: '0.08em',
          transform: `scale(${waitScale})`, opacity: waitOpacity,
          textShadow: `0 0 80px ${GOLD}99, 0 0 160px ${GOLD}33`,
        }}>
          WAIT.
        </div>

        {/* Gold line */}
        <div style={{ width: lineW, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: `0 0 14px ${GOLD}` }} />

        {/* subtitle */}
        <div style={{
          fontFamily: raleway.fontFamily, fontSize: 38, fontWeight: 300,
          color: CHAMP, letterSpacing: '0.20em', textTransform: 'uppercase',
          opacity: subOpacity, transform: `translateY(${subY}px)`,
        }}>
          Have you seen this place?
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Blur-to-sharp image reveal ────────────────────────────────────────────────
const BlurReveal: React.FC<{ src: string; totalFrames: number; zoomDir?: 'in' | 'out' }> = ({ src, totalFrames, zoomDir = 'in' }) => {
  const frame = useCurrentFrame();
  const blur   = interpolate(frame, [0, 18], [18, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const scaleS = zoomDir === 'in' ? 1.0 : 1.07;
  const scaleE = zoomDir === 'in' ? 1.07 : 1.0;
  const scale  = interpolate(frame, [0, totalFrames], [scaleS, scaleE], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center center', overflow: 'hidden' }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${blur}px)` }}
      />
    </div>
  );
};

// ─── Dark gradient overlay ──────────────────────────────────────────────────────
const Overlay: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(to bottom,
      rgba(6,13,24,${0.55 * strength}) 0%,
      rgba(6,13,24,${0.05 * strength}) 30%,
      rgba(6,13,24,${0.05 * strength}) 55%,
      rgba(6,13,24,${0.90 * strength}) 100%
    )`,
  }} />
);

// ─── Fade envelope ────────────────────────────────────────────────────────────
const FadeEnv: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 6, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ─── Floating gold particles ──────────────────────────────────────────────────
const PARTICLES = [
  { xPct: 12, speed: 1.2, size: 5, delay: 0  },
  { xPct: 28, speed: 0.9, size: 3, delay: 5  },
  { xPct: 45, speed: 1.4, size: 4, delay: 10 },
  { xPct: 62, speed: 1.0, size: 3, delay: 3  },
  { xPct: 75, speed: 1.3, size: 5, delay: 8  },
  { xPct: 88, speed: 0.8, size: 4, delay: 14 },
  { xPct: 35, speed: 1.1, size: 3, delay: 18 },
];

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PARTICLES.map((p, i) => {
        const f = Math.max(0, frame - p.delay);
        const totalH = 1920;
        const startY = totalH + p.size;
        const y = startY - (f * p.speed * 3.5) % (totalH + 100);
        const drift = Math.sin(f * 0.04 + i) * 12;
        const opacity = interpolate(f, [0, 10], [0, 0.7], { extrapolateRight: 'clamp' }) *
                        (0.5 + 0.5 * Math.sin(f * 0.08 + i * 1.3));
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${p.xPct}%`,
            top: y,
            transform: `translateX(${drift}px)`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            backgroundColor: GOLD,
            opacity,
            boxShadow: `0 0 ${p.size * 3}px ${GOLD}`,
          }} />
        );
      })}
    </div>
  );
};

// ─── Shimmer sweep ────────────────────────────────────────────────────────────
const Shimmer: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, totalFrames * 0.7], [-250, 1400], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const opacity = interpolate(frame, [0, 8, totalFrames * 0.6, totalFrames * 0.7], [0, 0.28, 0.20, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: x, width: 180,
        background: `linear-gradient(90deg, transparent, rgba(255,255,220,${opacity}), transparent)`,
        transform: 'skewX(-22deg)',
      }} />
    </div>
  );
};

// ─── Logo ────────────────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: number }> = ({ size = 190 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(frame, [0, 16], [-22, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', top: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity, transform: `translateY(${y}px)` }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: size, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 14px ${GOLD}99)` }} />
    </div>
  );
};

// ─── Progress dots ────────────────────────────────────────────────────────────
const ProgressDots: React.FC<{ current: number }> = ({ current }) => {
  const frame = useCurrentFrame();
  const pulse = 0.65 + 0.35 * Math.sin(frame * 0.18);
  return (
    <div style={{
      position: 'absolute', bottom: 88, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
    }}>
      {[0, 1, 2, 3, 4, 5].map(i => {
        const active = i === current;
        const done   = i < current;
        return (
          <div key={i} style={{
            height: 8,
            width: active ? 32 : 8,
            borderRadius: 4,
            backgroundColor: done || active ? GOLD : 'rgba(255,255,255,0.25)',
            opacity: active ? pulse : 1,
            boxShadow: active ? `0 0 14px ${GOLD}` : 'none',
          }} />
        );
      })}
    </div>
  );
};

// ─── Glowing tag badge ────────────────────────────────────────────────────────
const TagBadge: React.FC<{ text: string; delay?: number }> = ({ text, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16, stiffness: 320, mass: 0.7 } });
  const scale   = interpolate(p, [0, 1], [0.5, 1]);
  const opacity = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.14);
  return (
    <div style={{ display: 'inline-flex', justifyContent: 'center', transform: `scale(${scale})`, opacity }}>
      <div style={{
        paddingLeft: 26, paddingRight: 26, paddingTop: 9, paddingBottom: 9,
        border: `1.5px solid ${GOLD}`,
        borderRadius: 100,
        background: `rgba(240,192,64,${0.10 + 0.07 * glow})`,
        boxShadow: `0 0 ${16 + 10 * glow}px ${GOLD}${Math.round(35 + 25 * glow).toString(16)}`,
        fontFamily: raleway.fontFamily, fontSize: 19, fontWeight: 600,
        color: GOLD, letterSpacing: '0.24em', textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
      }}>
        {text}
      </div>
    </div>
  );
};

// ─── Blur-word headline ────────────────────────────────────────────────────────
const BlurWord: React.FC<{ text: string; delay: number; size?: number }> = ({ text, delay, size = 88 }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const t = Math.min(1, f / 16);
  const e = 1 - Math.pow(1 - t, 3);
  const blur    = interpolate(e, [0, 1], [14, 0]);
  const opacity = interpolate(e, [0, 1], [0, 1]);
  const scale   = interpolate(e, [0, 1], [0.85, 1]);
  return (
    <div style={{
      fontFamily: cinzel.fontFamily, fontSize: size, fontWeight: 700,
      color: WHITE, textAlign: 'center' as const, lineHeight: 1.15,
      letterSpacing: '0.04em',
      filter: `blur(${blur}px)`,
      opacity,
      transform: `scale(${scale})`,
      textShadow: '0 4px 36px rgba(0,0,0,0.65)',
      whiteSpace: 'nowrap' as const,
    }}>
      {text}
    </div>
  );
};

// ─── Animated counter ─────────────────────────────────────────────────────────
const Counter: React.FC<{ target: number; suffix?: string; label: string }> = ({ target, suffix = '+', label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.floor(interpolate(frame, [6, 38], [0, target], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const p = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 14, stiffness: 280, mass: 0.8 } });
  const scale   = interpolate(p, [0, 1], [0.6, 1]);
  const opacity = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.15);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `scale(${scale})`, opacity }}>
      <div style={{
        fontFamily: cinzel.fontFamily, fontSize: 120, fontWeight: 700,
        color: GOLD, lineHeight: 1,
        textShadow: `0 0 ${40 + 20 * glow}px ${GOLD}${Math.round(60 + 40 * glow).toString(16)}, 0 4px 40px rgba(0,0,0,0.7)`,
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{
        fontFamily: raleway.fontFamily, fontSize: 26, color: CHAMP,
        letterSpacing: '0.22em', fontWeight: 400, textTransform: 'uppercase' as const,
      }}>
        {label}
      </div>
    </div>
  );
};

// ─── Gold divider ─────────────────────────────────────────────────────────────
const GoldLine: React.FC<{ delay?: number; width?: number }> = ({ delay = 18, width = 280 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 20], [0, width], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return <div style={{ width: w, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: `0 0 10px ${GOLD}88` }} />;
};

// ─── Bottom ticker ────────────────────────────────────────────────────────────
const Ticker: React.FC = () => {
  const frame = useCurrentFrame();
  const TEXT = 'JKR FARMS & RESORTS  ·  NORTH BANGALORE  ·  6 ACRES  ·  1000+ GUESTS  ·  73385 01337  ·  jkrfarmsandresorts.com  ·  ';
  const x = -(frame * 1.5) % (TEXT.length * 13.5);
  const opacity = interpolate(frame, [12, 24], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
      background: 'rgba(6,13,24,0.80)', backdropFilter: 'blur(14px)',
      borderTop: `1px solid ${GOLD}1A`,
      overflow: 'hidden', display: 'flex', alignItems: 'center', opacity,
    }}>
      <div style={{
        whiteSpace: 'nowrap', transform: `translateX(${x}px)`,
        fontFamily: raleway.fontFamily, fontSize: 16, color: `${CHAMP}66`,
        letterSpacing: '0.18em', fontWeight: 300,
      }}>
        {TEXT.repeat(6)}
      </div>
    </div>
  );
};

// ─── Content shot ─────────────────────────────────────────────────────────────
const ShotV12: React.FC<{
  img: string; frames: number; tag: string;
  words?: string[]; isCounter?: boolean; idx: number;
}> = ({ img, frames, tag, words, isCounter, idx }) => (
  <FadeEnv total={frames}>
    <AbsoluteFill style={{ backgroundColor: NAVY, overflow: 'hidden' }}>
      <BlurReveal src={img} totalFrames={frames} zoomDir={idx % 2 === 0 ? 'in' : 'out'} />
      <Overlay />
      <Shimmer totalFrames={frames} />
      <Particles />
      <Logo />

      {/* Centered content block */}
      <div style={{
        position: 'absolute', bottom: 110, left: 40, right: 40,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        {/* Frosted glass card */}
        <div style={{
          padding: '32px 52px',
          background: 'rgba(6,13,24,0.60)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: `1px solid ${GOLD}22`,
          boxShadow: `0 8px 48px rgba(0,0,0,0.40), inset 0 0 0 1px ${GOLD}11`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <TagBadge text={tag} delay={4} />
          {isCounter ? (
            <Counter target={1000} label="Guests Capacity" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {words!.map((w, i) => <BlurWord key={i} text={w} delay={10 + i * 8} size={82} />)}
            </div>
          )}
          <GoldLine delay={20} width={300} />
        </div>
      </div>

      <ProgressDots current={idx} />
      <Ticker />
    </AbsoluteFill>
  </FadeEnv>
);

// ─── Curtain wipe reveal ──────────────────────────────────────────────────────
const CurtainWipe: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 24, stiffness: 110, mass: 1.1 } });
  const panelW = interpolate(p, [0, 1], [540, 0]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: panelW, backgroundColor: NAVY }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: panelW, backgroundColor: NAVY }} />
    </div>
  );
};

// ─── Pulsing ring ─────────────────────────────────────────────────────────────
const PulseRing: React.FC<{ delay?: number }> = ({ delay = 80 }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const rings = [0, 30, 60];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      {rings.map((offset, i) => {
        const t = (f + offset) % 90;
        const size = interpolate(t, [0, 90], [60, 600]);
        const opacity = interpolate(t, [0, 60, 90], [0.5, 0.15, 0]);
        return (
          <div key={i} style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: '50%',
            border: `1.5px solid ${GOLD}`,
            opacity,
            boxShadow: `0 0 20px ${GOLD}44`,
          }} />
        );
      })}
    </div>
  );
};

// ─── CTA scene ───────────────────────────────────────────────────────────────
const CTASceneV12: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Curtain wipe done by ~frame 40
  const overlayOpacity = interpolate(frame, [30, 55], [0, 0.88], { extrapolateRight: 'clamp' });

  // "Book Your" appear
  const byOpacity = interpolate(frame, [45, 62], [0, 1], { extrapolateRight: 'clamp' });
  const byY = interpolate(frame, [45, 62], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // "DREAM WEDDING" slam
  const dwP = spring({ frame: Math.max(0, frame - 62), fps, config: { damping: 14, stiffness: 260, mass: 0.9 } });
  const dwScale   = interpolate(dwP, [0, 1], [0.5, 1]);
  const dwOpacity = interpolate(dwP, [0, 0.3, 1], [0, 1, 1]);

  // Divider line
  const lineW = interpolate(frame, [85, 115], [0, 700], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Phone type-out
  const phone = '73385 01337';
  const digitsShown = Math.floor(interpolate(frame, [120, 120 + phone.length * 5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursorBlink = Math.round(frame / 5) % 2 === 0;

  // Website
  const webOpacity = interpolate(frame, [185, 205], [0, 1], { extrapolateRight: 'clamp' });

  // Instagram
  const igOpacity = interpolate(frame, [215, 235], [0, 1], { extrapolateRight: 'clamp' });

  // "Call Now" button
  const btnOpacity = interpolate(frame, [245, 265], [0, 1], { extrapolateRight: 'clamp' });
  const btnScale   = interpolate(frame, [245, 265], [0.8, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) });
  const btnGlow    = 0.5 + 0.5 * Math.sin(frame * 0.10);

  // Logo
  const logoOpacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });
  const logoY = interpolate(frame, [0, 22], [-22, 0], { extrapolateRight: 'clamp' });

  return (
    <FadeEnv total={frames}>
      <AbsoluteFill style={{ backgroundColor: NAVY }}>
        <CurtainWipe src={img} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(6,13,24,${overlayOpacity})` }} />
        <Particles />
        <PulseRing delay={80} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: logoOpacity, transform: `translateY(${logoY}px)` }}>
          <Img src={staticFile('logo_sticky.webp')} style={{ width: 220, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 18px ${GOLD}aa)` }} />
        </div>

        {/* Main CTA block */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -48%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 920,
        }}>
          {/* Top line */}
          <div style={{ width: lineW, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: `0 0 12px ${GOLD}88`, marginBottom: 30 }} />

          {/* Book Your */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 32, color: GOLD,
            letterSpacing: '0.32em', fontWeight: 400, textTransform: 'uppercase',
            opacity: byOpacity, transform: `translateY(${byY}px)`,
          }}>
            Book Your
          </div>
          <div style={{ height: 8 }} />

          {/* DREAM WEDDING */}
          <div style={{
            fontFamily: cinzel.fontFamily, fontSize: 100, color: WHITE,
            fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1,
            textShadow: `0 0 60px ${GOLD}44, 0 4px 40px rgba(0,0,0,0.85)`,
            textAlign: 'center',
            opacity: dwOpacity, transform: `scale(${dwScale})`,
          }}>
            DREAM WEDDING
          </div>
          <div style={{ height: 30 }} />

          {/* Bottom line */}
          <div style={{ width: lineW * 0.5, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: `0 0 12px ${GOLD}88`, marginBottom: 30 }} />

          {/* Phone type-out */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 62, color: GOLD,
            fontWeight: 400, letterSpacing: '0.12em',
            textShadow: `0 0 32px ${GOLD}99`,
            minHeight: 80, textAlign: 'center',
          }}>
            {phone.slice(0, digitsShown)}
            {digitsShown < phone.length && (
              <span style={{ opacity: cursorBlink ? 1 : 0 }}>|</span>
            )}
          </div>
          <div style={{ height: 12 }} />

          {/* Website */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 26, color: `${CHAMP}66`,
            letterSpacing: '0.07em', fontWeight: 300, opacity: webOpacity,
          }}>
            jkrfarmsandresorts.com
          </div>
          <div style={{ height: 8 }} />

          {/* Instagram */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 22, color: `${CHAMP}44`,
            letterSpacing: '0.06em', fontWeight: 300, opacity: igOpacity,
          }}>
            @jkrfarmsandresorts
          </div>
          <div style={{ height: 32 }} />

          {/* Call Now button */}
          <div style={{
            paddingLeft: 60, paddingRight: 60, paddingTop: 20, paddingBottom: 20,
            border: `2px solid ${GOLD}`,
            borderRadius: 100,
            background: `rgba(240,192,64,${0.12 + 0.10 * btnGlow})`,
            boxShadow: `0 0 ${24 + 16 * btnGlow}px ${GOLD}${Math.round(40 + 30 * btnGlow).toString(16)}`,
            fontFamily: raleway.fontFamily, fontSize: 26, fontWeight: 600,
            color: GOLD, letterSpacing: '0.22em', textTransform: 'uppercase',
            opacity: btnOpacity, transform: `scale(${btnScale})`,
          }}>
            CALL NOW
          </div>
        </div>

        {/* Ticker */}
        <Ticker />
      </AbsoluteFill>
    </FadeEnv>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const JKRReelV12: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts v12'));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Series>
        {SHOTS_V12.map((shot, i) => {
          if (shot.isHook) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <HookScene frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCTA) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTASceneV12 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV12
                img={shot.img!}
                frames={shot.frames}
                tag={shot.tag!}
                words={shot.words}
                isCounter={shot.isCounter}
                idx={shot.idx!}
              />
            </Series.Sequence>
          );
        })}
      </Series>

      <Audio src={staticFile('voice/voice_v12.mp3')} volume={1} />
      <Audio src={staticFile('voice/bg_music_v2.mp3')} volume={0.13} />
    </AbsoluteFill>
  );
};
