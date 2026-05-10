import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { loadFont as loadEBGaramond } from '@remotion/google-fonts/EBGaramond';
import { loadFont as loadDMSans }     from '@remotion/google-fonts/DMSans';

const garamond = loadEBGaramond('normal', { weights: ['400', '500', '700', '800'] });
const dmsans   = loadDMSans('normal',     { weights: ['300', '400', '500', '600', '700'] });

// V21 — "CRIMSON" — Deep Burgundy + Pearl + Electric Gold
// New: circle-wipe reveal, drop-letters, spotlight text, glass panel, pulse rings
const WINE   = '#130208';
const WINE2  = '#200410';
const CRIM   = '#8B1A2A';
const CRIM2  = '#C03040';
const GOLD   = '#E8C040';
const GOLD2  = '#F8DC70';
const PEARL  = '#F5EDE0';
const WHITE  = '#FFFFFF';

// Hook:72 + 4×62 + Counter:60 + Gallery:64 + CTA:150 = 594f ≈ 20s
const SHOTS_V21: Array<{
  isHook?: boolean; isCTA?: boolean; isCounter?: boolean; isGallery?: boolean;
  img?: string; images?: string[];
  tag?: string; line1?: string; line2?: string;
  frames: number;
}> = [
  { isHook: true,    img: 'svl_SVL06860.webp',                                                                   frames: 72  },
  { img: 'v12_mandap2.webp',      tag:'01', line1:'Royal',        line2:'Mandap',                                frames: 62  },
  { img: 'v9_pool.webp',          tag:'02', line1:'Scenic',       line2:'Pool Views',                            frames: 62  },
  { img: 'v12_room2.webp',        tag:'03', line1:'Luxury',       line2:'Stays',                                 frames: 62  },
  { img: 'site_Dining-Hall-2.webp', tag:'04', line1:'Grand',      line2:'Dining Hall',                           frames: 62  },
  { isCounter: true, img: 'v12_aerial_lawn.webp',                                                                 frames: 60  },
  { isGallery: true, images: ['w04_dining.webp','w02_svl609.webp','w10_gallery10.webp','v10_shot2_bedroom.webp'], frames: 64  },
  { isCTA: true,     img: 'v12_pool1.webp',                                                                       frames: 150 },
];

export const TOTAL_FRAMES_V21 = SHOTS_V21.reduce((a, s) => a + s.frames, 0); // 592

// ── Circle wipe reveal ────────────────────────────────────────────────────────
const CircleReveal: React.FC<{ src: string; totalFrames: number }> = ({ src, totalFrames }) => {
  const frame = useCurrentFrame();
  const sc  = interpolate(frame, [0, totalFrames], [1.12, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const pct = interpolate(frame, [0, 32], [0, 150], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${sc})`,
          clipPath: `circle(${pct}% at 50% 50%)`,
        }}
      />
    </div>
  );
};

// ── Drop-letters headline ─────────────────────────────────────────────────────
const DropLetters: React.FC<{
  text: string; size: number; color?: string; delay?: number;
  weight?: number; spacing?: string; font?: 'garamond' | 'dmsans';
}> = ({ text, size, color = WHITE, delay = 0, weight = 700, spacing = '0.04em', font = 'garamond' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ff = font === 'garamond' ? garamond.fontFamily : dmsans.fontFamily;
  return (
    <div style={{ fontFamily: ff, fontSize: size, fontWeight: weight as any, color, letterSpacing: spacing, lineHeight: 1.1, display: 'flex', flexWrap: 'wrap' as const }}>
      {text.split('').map((ch, i) => {
        const p  = spring({ frame: Math.max(0, frame - delay - i * 2.2), fps, config: { damping: 16, stiffness: 220, mass: 0.6 } });
        const ty = interpolate(p, [0, 1], [-90, 0]);
        const op = interpolate(p, [0, 0.25], [0, 1]);
        return (
          <span key={i} style={{ display: 'inline-block', transform: `translateY(${ty}px)`, opacity: op }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </div>
  );
};

// ── Spotlight sweep ───────────────────────────────────────────────────────────
const SpotLight: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const x = interpolate(f, [0, 40], [-20, 120], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const op = interpolate(f, [0, 5, 35, 40], [0, 0.5, 0.5, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 320px 900px at ${x}% 50%, rgba(232,192,64,0.18) 0%, transparent 70%)`,
      opacity: op, pointerEvents: 'none', zIndex: 4,
    }} />
  );
};

// ── Ken Burns ────────────────────────────────────────────────────────────────
const KB: React.FC<{ src: string; totalFrames: number; startScale?: number }> = ({ src, totalFrames, startScale = 1.10 }) => {
  const frame = useCurrentFrame();
  const sc = interpolate(frame, [0, totalFrames], [startScale, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})` }} />
    </div>
  );
};

// ── Gradient overlay ──────────────────────────────────────────────────────────
const Overlay: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(19,2,8,0.15) 0%, rgba(19,2,8,0.28) 35%, rgba(19,2,8,0.82) 65%, rgba(19,2,8,0.97) 100%)' }} />
);

// ── JKR Logo ──────────────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: number; delay?: number; top?: number }> = ({ size = 100, delay = 6, top = 52 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(Math.max(0, frame - delay), [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30, opacity: op }}>
      <Img src={staticFile('logo.png')} style={{ width: size, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.9)) drop-shadow(0 0 10px rgba(232,192,64,0.5))' }} />
    </div>
  );
};

// ── Story progress bar ────────────────────────────────────────────────────────
const Progress: React.FC<{ total: number; cur: number }> = ({ total, cur }) => (
  <div style={{ position: 'absolute', top: 26, left: 20, right: 20, display: 'flex', gap: 5, zIndex: 20 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < cur ? GOLD : i === cur ? PEARL : 'rgba(255,255,255,0.20)' }} />
    ))}
  </div>
);

// ── Gold rule ─────────────────────────────────────────────────────────────────
const GoldRule: React.FC<{ delay?: number; width?: number; align?: string }> = ({ delay = 8, width = 60, align = 'left' }) => {
  const frame = useCurrentFrame();
  const w = interpolate(Math.max(0, frame - delay), [0, 18], [0, width], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ width: `${w}%`, height: 2, background: `linear-gradient(to right, ${CRIM2}, ${GOLD})`, borderRadius: 1, boxShadow: `0 0 8px ${GOLD}55`, ...(align === 'center' ? { margin: '0 auto' } : {}) }} />
  );
};

// ── Slide up ──────────────────────────────────────────────────────────────────
const Up: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 22, stiffness: 155, mass: 0.85 } });
  return <div style={{ transform: `translateY(${interpolate(p, [0, 1], [45, 0])}px)`, opacity: interpolate(p, [0, 0.35], [0, 1]), ...style }}>{children}</div>;
};

// ── Glass panel tag ───────────────────────────────────────────────────────────
const GlassTag: React.FC<{ tag: string; delay?: number }> = ({ tag, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 200, mass: 0.7 } });
  const tx = interpolate(p, [0, 1], [-120, 0]);
  const op = interpolate(p, [0, 0.3], [0, 1]);
  return (
    <div style={{
      position: 'absolute', top: 108, left: 0,
      transform: `translateX(${tx}px)`, opacity: op,
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      borderRight: `3px solid ${GOLD}`,
      borderTop: `1px solid rgba(255,255,255,0.15)`,
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
      padding: '10px 24px 10px 32px',
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
      <span style={{ fontFamily: dmsans.fontFamily, fontSize: 13, fontWeight: 600, color: WHITE, letterSpacing: '0.18em' }}>{tag}</span>
    </div>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
const HookV21: React.FC<{ shot: typeof SHOTS_V21[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: WINE }}>
      <CircleReveal src={shot.img!} totalFrames={shot.frames} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(19,2,8,0.55) 0%, rgba(19,2,8,0.20) 40%, rgba(19,2,8,0.82) 100%)' }} />
      <SpotLight delay={32} />
      <Progress total={7} cur={0} />
      <Logo size={115} delay={34} top={54} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 36px' }}>

        {/* "Close your eyes." italic */}
        <Up delay={24} style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: garamond.fontFamily, fontSize: 28, fontWeight: 400, color: `${PEARL}CC`, letterSpacing: '0.08em', fontStyle: 'italic' }}>
            Close your eyes.
          </div>
        </Up>

        {/* Drop letters main punch */}
        <div style={{ textAlign: 'center' }}>
          <DropLetters text="PICTURE" size={96} color={WHITE} delay={30} weight={800} spacing="0.06em" />
          <DropLetters text="YOUR PERFECT" size={62} color={GOLD} delay={42} weight={700} spacing="0.04em" font="dmsans" />
          <DropLetters text="WEDDING DAY." size={62} color={GOLD} delay={54} weight={700} spacing="0.04em" font="dmsans" />
        </div>

        <Up delay={62} style={{ textAlign: 'center', marginTop: 26 }}>
          <GoldRule delay={62} width={48} align="center" />
          <div style={{ marginTop: 14, fontFamily: dmsans.fontFamily, fontSize: 15, fontWeight: 600, color: PEARL, letterSpacing: '0.28em' }}>
            JKR FARMS &amp; RESORTS
          </div>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 12, fontWeight: 300, color: `${PEARL}88`, letterSpacing: '0.22em', marginTop: 5 }}>
            NORTH BANGALORE
          </div>
        </Up>
      </div>
    </AbsoluteFill>
  );
};

// ── Shot ──────────────────────────────────────────────────────────────────────
const ShotV21: React.FC<{ shot: typeof SHOTS_V21[0]; idx: number }> = ({ shot, idx }) => (
  <AbsoluteFill style={{ background: WINE }}>
    <KB src={shot.img!} totalFrames={shot.frames} />
    <Overlay />
    <SpotLight delay={4} />
    <Progress total={7} cur={idx} />
    <GlassTag tag={shot.tag!} delay={4} />
    <Logo size={85} delay={4} top={55} />

    {/* Centre text block */}
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '0 36px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 28%, rgba(19,2,8,0.72) 46%, rgba(19,2,8,0.78) 54%, transparent 72%)' }} />
      <div style={{ position: 'relative', zIndex: 5 }}>
        <GoldRule delay={6} width={28} />
        <div style={{ marginTop: 16 }}>
          <DropLetters text={shot.line1!} size={82} color={PEARL} delay={6}  weight={500} font="garamond" spacing="0.02em" />
          <DropLetters text={shot.line2!} size={82} color={GOLD}  delay={14} weight={800} font="garamond" spacing="0.02em" />
        </div>
        <Up delay={22}>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 12, fontWeight: 500, color: `${CRIM2}DD`, letterSpacing: '0.22em', marginTop: 14 }}>
            JKR FARMS &amp; RESORTS
          </div>
        </Up>
      </div>
    </div>
  </AbsoluteFill>
);

// ── Counter ───────────────────────────────────────────────────────────────────
const CounterV21: React.FC<{ shot: typeof SHOTS_V21[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const STATS = [
    { num: '6',    unit: 'ACRES',  desc: 'of pure paradise' },
    { num: '500+', unit: 'EVENTS', desc: 'legendary days' },
    { num: '35+',  unit: 'YEARS',  desc: 'of excellence' },
  ];

  return (
    <AbsoluteFill style={{ background: WINE }}>
      <KB src={shot.img!} totalFrames={shot.frames} startScale={1.06} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(19,2,8,0.87)' }} />
      <SpotLight delay={4} />
      <Progress total={7} cur={5} />
      <Logo size={90} delay={4} top={54} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <Up delay={4}>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 12, fontWeight: 600, color: CRIM2, letterSpacing: '0.4em', textAlign: 'center', marginBottom: 10 }}>
            THE JKR DIFFERENCE
          </div>
        </Up>
        <GoldRule delay={6} width={38} align="center" />

        <div style={{ display: 'flex', gap: 14, marginTop: 36, width: '100%' }}>
          {STATS.map((s, i) => {
            const p  = spring({ frame: Math.max(0, frame - (10 + i * 12)), fps, config: { damping: 18, stiffness: 155, mass: 0.85 } });
            const op = interpolate(p, [0, 0.4], [0, 1]);
            const ty = interpolate(p, [0, 1], [50, 0]);
            return (
              <div key={i} style={{
                flex: 1, opacity: op, transform: `translateY(${ty}px)`,
                background: `linear-gradient(160deg, rgba(139,26,42,0.25) 0%, rgba(19,2,8,0.6) 100%)`,
                border: `1px solid ${GOLD}33`,
                borderTop: `2px solid ${i === 1 ? GOLD : CRIM}`,
                borderRadius: 16, padding: '28px 12px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: garamond.fontFamily, fontSize: 58, fontWeight: 800, color: GOLD, lineHeight: 1, textShadow: `0 0 20px ${GOLD}55` }}>
                  {s.num}
                </div>
                <div style={{ fontFamily: dmsans.fontFamily, fontSize: 12, fontWeight: 600, color: PEARL, letterSpacing: '0.2em', marginTop: 6 }}>{s.unit}</div>
                <div style={{ fontFamily: dmsans.fontFamily, fontSize: 10, fontWeight: 300, color: `${PEARL}66`, marginTop: 4 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>

        <Up delay={46} style={{ textAlign: 'center', marginTop: 30 }}>
          <div style={{ fontFamily: garamond.fontFamily, fontSize: 20, fontWeight: 500, color: `${PEARL}BB`, fontStyle: 'italic', letterSpacing: '0.05em' }}>
            "Crafted for the grandest celebrations."
          </div>
        </Up>
      </div>
    </AbsoluteFill>
  );
};

// ── Gallery — 4-image mosaic grid ─────────────────────────────────────────────
const GalleryV21: React.FC<{ shot: typeof SHOTS_V21[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const anims = [
    { delay: 8,  tx: -80, ty2: 0   },
    { delay: 14, tx: 0,   ty2: -80 },
    { delay: 20, tx: 0,   ty2: 80  },
    { delay: 26, tx: 80,  tx2: 0   },
  ];

  return (
    <AbsoluteFill style={{ background: WINE2 }}>
      <Progress total={7} cur={6} />
      <Logo size={85} delay={4} top={52} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '88px 18px 60px' }}>
        <Up delay={4}>
          <div style={{ fontFamily: garamond.fontFamily, fontSize: 38, fontWeight: 700, color: PEARL, letterSpacing: '0.16em', textAlign: 'center', marginBottom: 8 }}>
            A GLIMPSE INSIDE
          </div>
        </Up>
        <GoldRule delay={8} width={32} align="center" />

        {/* 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginTop: 24, height: 840 }}>
          {shot.images!.map((img, i) => {
            const a = anims[i] || anims[0];
            const p  = spring({ frame: Math.max(0, frame - a.delay), fps, config: { damping: 20, stiffness: 135, mass: 0.95 } });
            const op = interpolate(p, [0, 0.35], [0, 1]);
            const sc = interpolate(p, [0, 1], [0.85, 1]);
            return (
              <div key={i} style={{
                borderRadius: 14, overflow: 'hidden',
                opacity: op, transform: `scale(${sc})`,
                border: `1px solid ${GOLD}22`,
                boxShadow: `0 8px 28px rgba(0,0,0,0.55)`,
                position: 'relative',
              }}>
                <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${WINE}CC 0%, transparent 60%)` }} />
              </div>
            );
          })}
        </div>

        <Up delay={34} style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 11, fontWeight: 500, color: `${CRIM2}CC`, letterSpacing: '0.24em' }}>
            JKR FARMS &amp; RESORTS · NORTH BANGALORE
          </div>
        </Up>
      </div>
    </AbsoluteFill>
  );
};

// ── CTA ───────────────────────────────────────────────────────────────────────
const CTAV21: React.FC<{ shot: typeof SHOTS_V21[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  const p1 = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 20, stiffness: 145, mass: 0.9 } });
  const p2 = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 20, stiffness: 145, mass: 0.9 } });
  const p3 = spring({ frame: Math.max(0, frame - 44), fps, config: { damping: 22, stiffness: 130, mass: 1.0 } });
  const p4 = spring({ frame: Math.max(0, frame - 62), fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
  const btnP = spring({ frame: Math.max(0, frame - 76), fps, config: { damping: 14, stiffness: 200, mass: 0.7 } });

  const ty  = (p: number) => interpolate(p, [0, 1], [40, 0]);
  const op  = (p: number) => interpolate(p, [0, 0.4], [0, 1]);

  // Crimson ribbon behind headline
  const ribbonW = interpolate(Math.max(0, frame - 22), [0, 20], [0, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ background: WINE }}>
      <KB src={shot.img!} totalFrames={shot.frames} startScale={1.05} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(19,2,8,0.80)`, opacity: fadeIn }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(19,2,8,0.50) 0%, transparent 30%, rgba(19,2,8,0.94) 75%, rgba(19,2,8,1) 100%)' }} />
      <SpotLight delay={10} />
      <Logo size={128} delay={8} top={60} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>

        <div style={{ transform: `translateY(${ty(p1)}px)`, opacity: op(p1), textAlign: 'center' }}>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 14, fontWeight: 500, color: CRIM2, letterSpacing: '0.38em' }}>
            YOUR LEGENDARY DAY
          </div>
        </div>

        {/* Headline with crimson ribbon */}
        <div style={{ position: 'relative', textAlign: 'center', marginTop: 10, transform: `translateY(${ty(p2)}px)`, opacity: op(p2) }}>
          <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, bottom: '20%', background: CRIM, width: `${ribbonW}%`, margin: '0 auto', borderRadius: 4, zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <DropLetters text="STARTS HERE" size={84} color={WHITE} delay={28} weight={700} font="garamond" spacing="0.02em" />
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p3)}px)`, opacity: op(p3), textAlign: 'center', marginTop: 22 }}>
          <GoldRule delay={44} width={55} align="center" />
          <div style={{ marginTop: 14, fontFamily: garamond.fontFamily, fontSize: 24, fontWeight: 700, color: PEARL, letterSpacing: '0.14em' }}>
            JKR FARMS &amp; RESORTS
          </div>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 12, fontWeight: 300, color: `${PEARL}99`, letterSpacing: '0.2em', marginTop: 6 }}>
            6 ACRES · NORTH BANGALORE · EST. 1990
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ marginTop: 32, transform: `scale(${interpolate(btnP, [0, 1], [0.75, 1])})`, opacity: op(btnP) }}>
          <div style={{
            background: `linear-gradient(135deg, ${CRIM2} 0%, ${GOLD} 100%)`,
            borderRadius: 50, padding: '20px 54px',
            fontFamily: dmsans.fontFamily, fontSize: 18, fontWeight: 700,
            color: WINE, letterSpacing: '0.12em',
            boxShadow: `0 8px 36px ${GOLD}44, 0 0 0 1px ${GOLD}22`,
            textAlign: 'center',
          }}>
            BOOK YOUR DATE →
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p4)}px)`, opacity: op(p4), textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 30, fontWeight: 700, color: GOLD2, textShadow: `0 0 24px ${GOLD}AA` }}>
            📞 73385 01337
          </div>
          <div style={{ fontFamily: dmsans.fontFamily, fontSize: 12, fontWeight: 300, color: `${PEARL}77`, letterSpacing: '0.14em', marginTop: 8 }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export const JKRReelV21: React.FC = () => (
  <AbsoluteFill style={{ background: WINE }}>
    <Series>
      {SHOTS_V21.map((shot, i) => (
        <Series.Sequence key={i} durationInFrames={shot.frames}>
          {shot.isHook    && <HookV21    shot={shot} />}
          {shot.isCounter && <CounterV21 shot={shot} />}
          {shot.isGallery && <GalleryV21 shot={shot} />}
          {shot.isCTA     && <CTAV21     shot={shot} />}
          {!shot.isHook && !shot.isCounter && !shot.isGallery && !shot.isCTA && (
            <ShotV21 shot={shot} idx={i} />
          )}
        </Series.Sequence>
      ))}
    </Series>

    {/* Shots voice: 0–442f (72 + 4×62 + 60 + 64) */}
    <Sequence durationInFrames={442}>
      <Audio src={staticFile('voice/voice_v21_shots.mp3')} volume={1} />
    </Sequence>
    <Sequence from={442}>
      <Audio src={staticFile('voice/voice_v21_cta.mp3')} volume={1} />
    </Sequence>
    <Audio src={staticFile('voice/bg_music_v10.mp3')} volume={0.18} />
  </AbsoluteFill>
);
