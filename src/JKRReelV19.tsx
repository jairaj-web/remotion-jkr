import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInter }    from '@remotion/google-fonts/Inter';

const playfair = loadPlayfair('normal', { weights: ['400', '700', '900'] });
const inter    = loadInter('normal',    { weights: ['300', '400', '600', '700', '800'] });

// V19 — "LUMINA" — Midnight Navy + Electric Gold + Ice Cyan
// Fresh: split-reveal, glow pulse rings, scan-line, hex badge, count-up, glass cards
const NAVY   = '#04091A';
const NAVY2  = '#081528';
const ELEC   = '#E8B84B';
const ELEC2  = '#FFD97A';
const CYAN   = '#5DE8F5';
const PEARL  = '#F2EEE8';
const WHITE  = '#FFFFFF';

// Hook:70 + 4 shots×62 + Counter:62 + Gallery:64 + CTA:152 = 600f = 20s
const SHOTS_V19: Array<{
  isHook?: boolean; isCTA?: boolean; isCounter?: boolean; isGallery?: boolean;
  img?: string; images?: string[];
  tag?: string; line1?: string; line2?: string;
  frames: number;
}> = [
  { isHook: true,    img: 'v12_exterior1.webp',                                                                  frames: 70  },
  { img: 'v9_ceremony.webp',    tag:'01', line1:'Grand',          line2:'Ceremonies',                            frames: 62  },
  { img: 'v12_room1.webp',      tag:'02', line1:'Luxury',          line2:'Stays',                                frames: 62  },
  { img: 'v9_dining.webp',      tag:'03', line1:'Exquisite',       line2:'Dining',                               frames: 62  },
  { img: 'v12_mandap3.webp',    tag:'04', line1:'Royal',           line2:'Mandap',                               frames: 62  },
  { isCounter: true, img: 'g14_venue1.webp',                                                                      frames: 62  },
  { isGallery: true, images: ['g02_gallery1.webp','w_cta_photography.webp','g05_gallery5.webp'],                  frames: 64  },
  { isCTA: true,     img: 'v12_exterior2.webp',                                                                   frames: 152 },
];

export const TOTAL_FRAMES_V19 = SHOTS_V19.reduce((a, s) => a + s.frames, 0); // 596 ≈ 600

// ── Split reveal — image appears from vertical center split ──────────────────
const SplitReveal: React.FC<{ src: string; totalFrames: number }> = ({ src, totalFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame, fps, config: { damping: 24, stiffness: 120, mass: 1.2 } });
  const sc = interpolate(frame, [0, totalFrames], [1.12, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  // top half slides up, bottom half slides down
  const topTy    = interpolate(p, [0, 1], [-960, 0]);
  const bottomTy = interpolate(p, [0, 1], [ 960, 0]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Full image underneath */}
      <Img src={staticFile(`images/${src}`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})` }} />
      {/* Top mask slides up */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', overflow: 'hidden', transform: `translateY(${topTy}px)` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1920, background: NAVY }} />
      </div>
      {/* Bottom mask slides down */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', overflow: 'hidden', transform: `translateY(${bottomTy}px)` }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1920, background: NAVY }} />
      </div>
    </div>
  );
};

// ── Glow pulse rings — expanding from center ─────────────────────────────────
const GlowPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const PERIOD = 50;
  const rings  = [0, 16, 32];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      {rings.map((offset, i) => {
        const f = (frame + offset) % PERIOD;
        const r  = interpolate(f, [0, PERIOD], [0, 800]);
        const op = interpolate(r, [0, 80, 600, 800], [0.8, 0.5, 0.08, 0]);
        return (
          <div key={i} style={{
            position: 'absolute',
            width: r * 2, height: r * 2,
            borderRadius: '50%',
            border: `1.5px solid ${ELEC}`,
            opacity: op,
            boxShadow: `0 0 12px ${ELEC}88`,
          }} />
        );
      })}
    </div>
  );
};

// ── Scan line light sweep ────────────────────────────────────────────────────
const ScanLine: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const y = interpolate(f, [0, 35], [-40, 1960], { extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) });
  const op = interpolate(f, [0, 5, 30, 35], [0, 0.9, 0.9, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: y, height: 3,
      background: `linear-gradient(to right, transparent, ${CYAN}CC, ${WHITE}, ${CYAN}CC, transparent)`,
      boxShadow: `0 0 20px ${CYAN}, 0 0 40px ${CYAN}66`,
      opacity: op, zIndex: 8,
    }} />
  );
};

// ── Ken Burns ────────────────────────────────────────────────────────────────
const KenBurns: React.FC<{ src: string; totalFrames: number; startScale?: number }> = ({ src, totalFrames, startScale = 1.10 }) => {
  const frame = useCurrentFrame();
  const sc = interpolate(frame, [0, totalFrames], [startScale, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})` }} />
    </div>
  );
};

// ── Dark gradient overlay ─────────────────────────────────────────────────────
const DarkOverlay: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,9,26,0.15) 0%, rgba(4,9,26,0.30) 35%, rgba(4,9,26,0.80) 65%, rgba(4,9,26,0.95) 100%)' }} />
);

// ── JKR Logo ──────────────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: number; delay?: number; style?: React.CSSProperties }> = ({ size = 100, delay = 6, style }) => {
  const frame = useCurrentFrame();
  const op = interpolate(Math.max(0, frame - delay), [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 52, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30, opacity: op, ...style }}>
      <Img src={staticFile('logo.png')} style={{ width: size, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.8)) drop-shadow(0 0 8px rgba(232,184,75,0.4))' }} />
    </div>
  );
};

// ── Story dots ────────────────────────────────────────────────────────────────
const StoryDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div style={{ position: 'absolute', top: 30, left: 0, right: 0, display: 'flex', gap: 5, justifyContent: 'center', zIndex: 20, padding: '0 20px' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: 3, borderRadius: 2, flex: i === current ? 2 : 1,
        background: i < current ? ELEC : i === current ? WHITE : 'rgba(255,255,255,0.28)',
      }} />
    ))}
  </div>
);

// ── Hex badge ─────────────────────────────────────────────────────────────────
const HexBadge: React.FC<{ tag: string; delay?: number }> = ({ tag, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 220, mass: 0.6 } });
  const sc = interpolate(p, [0, 1], [0, 1]);
  const op = interpolate(p, [0, 0.3], [0, 1]);
  return (
    <div style={{
      position: 'absolute', top: 108, left: 32,
      transform: `scale(${sc})`, opacity: op,
      background: `linear-gradient(135deg, ${ELEC} 0%, ${ELEC2} 100%)`,
      borderRadius: 10, padding: '8px 20px',
      fontFamily: inter.fontFamily, fontSize: 13, fontWeight: 800,
      color: NAVY, letterSpacing: '0.15em',
      boxShadow: `0 4px 20px ${ELEC}66`,
    }}>
      {tag}
    </div>
  );
};

// ── Slide-up animated text ────────────────────────────────────────────────────
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 22, stiffness: 150, mass: 0.85 } });
  const ty = interpolate(p, [0, 1], [50, 0]);
  const op = interpolate(p, [0, 0.35], [0, 1]);
  return <div style={{ transform: `translateY(${ty}px)`, opacity: op, ...style }}>{children}</div>;
};

// ── Electric divider ──────────────────────────────────────────────────────────
const ElecLine: React.FC<{ delay?: number; width?: number; align?: string }> = ({ delay = 8, width = 70, align = 'left' }) => {
  const frame = useCurrentFrame();
  const w = interpolate(Math.max(0, frame - delay), [0, 18], [0, width], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const marginStyle = align === 'center' ? { margin: '0 auto' } : {};
  return (
    <div style={{ width: `${w}%`, height: 2, background: `linear-gradient(to right, ${ELEC}, ${CYAN})`, borderRadius: 2, boxShadow: `0 0 8px ${ELEC}88`, ...marginStyle }} />
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────
const HookV19: React.FC<{ shot: typeof SHOTS_V19[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgOp = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const line1P = spring({ frame: Math.max(0, frame - 20), fps, config: { damping: 18, stiffness: 180, mass: 0.8 } });
  const line2P = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 18, stiffness: 180, mass: 0.8 } });
  const subP   = spring({ frame: Math.max(0, frame - 44), fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });

  const ty = (p: number) => interpolate(p, [0, 1], [60, 0]);
  const op = (p: number) => interpolate(p, [0, 0.4], [0, 1]);

  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <div style={{ position: 'absolute', inset: 0, opacity: imgOp }}>
        <SplitReveal src={shot.img!} totalFrames={shot.frames} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,9,26,0.55) 0%, rgba(4,9,26,0.25) 40%, rgba(4,9,26,0.70) 100%)' }} />
      <GlowPulse />
      <ScanLine delay={4} />
      <Logo size={110} delay={44} />

      {/* Centre hook text */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${ty(line1P)}px)`, opacity: op(line1P), textAlign: 'center' }}>
          <div style={{ fontFamily: inter.fontFamily, fontSize: 26, fontWeight: 300, color: CYAN, letterSpacing: '0.4em', textTransform: 'uppercase' }}>
            IMAGINE YOUR
          </div>
        </div>
        <div style={{ transform: `translateY(${ty(line2P)}px)`, opacity: op(line2P), textAlign: 'center', marginTop: 6 }}>
          <div style={{
            fontFamily: playfair.fontFamily, fontSize: 96, fontWeight: 900, color: WHITE, lineHeight: 1,
            textShadow: `0 0 60px ${ELEC}55, 0 4px 40px rgba(0,0,0,0.95)`,
            letterSpacing: '-0.01em',
          }}>
            PERFECT
          </div>
          <div style={{
            fontFamily: playfair.fontFamily, fontSize: 96, fontWeight: 900,
            background: `linear-gradient(135deg, ${ELEC} 0%, ${ELEC2} 50%, ${CYAN} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1, letterSpacing: '-0.01em',
            filter: `drop-shadow(0 0 20px ${ELEC}88)`,
          }}>
            WEDDING
          </div>
        </div>
        <div style={{ transform: `translateY(${ty(subP)}px)`, opacity: op(subP), textAlign: 'center', marginTop: 22 }}>
          <ElecLine delay={44} width={50} align="center" />
          <div style={{ marginTop: 14, fontFamily: inter.fontFamily, fontSize: 16, fontWeight: 600, color: PEARL, letterSpacing: '0.28em' }}>
            JKR FARMS &amp; RESORTS
          </div>
          <div style={{ fontFamily: inter.fontFamily, fontSize: 13, fontWeight: 300, color: `${PEARL}99`, letterSpacing: '0.22em', marginTop: 6 }}>
            NORTH BANGALORE
          </div>
        </div>
      </div>

      <StoryDots total={7} current={0} />
    </AbsoluteFill>
  );
};

// ── Shot ──────────────────────────────────────────────────────────────────────
const ShotV19: React.FC<{ shot: typeof SHOTS_V19[0]; sectionIdx: number }> = ({ shot, sectionIdx }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <KenBurns src={shot.img!} totalFrames={shot.frames} />
      <DarkOverlay />
      <ScanLine delay={2} />
      <StoryDots total={7} current={sectionIdx} />
      <HexBadge tag={shot.tag!} delay={4} />
      <Logo size={85} delay={4} />

      {/* Centre text block */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
        padding: '0 36px',
      }}>
        {/* Dark gradient behind text */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 25%, rgba(4,9,26,0.65) 45%, rgba(4,9,26,0.75) 55%, transparent 75%)' }} />
        <div style={{ position: 'relative', zIndex: 5 }}>
          <ElecLine delay={6} width={35} />
          <div style={{ marginTop: 14 }}>
            <Rise delay={6}>
              <div style={{ fontFamily: playfair.fontFamily, fontSize: 78, fontWeight: 700, color: WHITE, lineHeight: 1.05, textShadow: '0 3px 40px rgba(0,0,0,0.95)', letterSpacing: '0.01em' }}>
                {shot.line1}
              </div>
            </Rise>
            <Rise delay={13}>
              <div style={{
                fontFamily: playfair.fontFamily, fontSize: 78, fontWeight: 900, lineHeight: 1.05, letterSpacing: '0.01em',
                background: `linear-gradient(135deg, ${ELEC} 0%, ${ELEC2} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 14px ${ELEC}66)`,
              }}>
                {shot.line2}
              </div>
            </Rise>
          </div>
          <Rise delay={20}>
            <div style={{ fontFamily: inter.fontFamily, fontSize: 13, fontWeight: 400, color: `${CYAN}CC`, letterSpacing: '0.22em', marginTop: 14 }}>
              JKR FARMS &amp; RESORTS
            </div>
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Counter ───────────────────────────────────────────────────────────────────
const CounterV19: React.FC<{ shot: typeof SHOTS_V19[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const STATS = [
    { val: '6',    unit: 'ACRES',    sub: 'lush paradise'   },
    { val: '500+', unit: 'EVENTS',   sub: 'celebrated'      },
    { val: '35+',  unit: 'YEARS',    sub: 'of excellence'   },
  ];

  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <KenBurns src={shot.img!} totalFrames={shot.frames} startScale={1.06} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,9,26,0.88)' }} />
      <StoryDots total={7} current={5} />
      <Logo size={90} delay={4} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '0 20px' }}>
        <Rise delay={4}>
          <div style={{ fontFamily: inter.fontFamily, fontSize: 13, fontWeight: 600, color: CYAN, letterSpacing: '0.4em', textAlign: 'center', marginBottom: 12 }}>
            BY THE NUMBERS
          </div>
        </Rise>
        <ElecLine delay={6} width={40} align="center" />

        <div style={{ display: 'flex', gap: 16, marginTop: 32, width: '100%' }}>
          {STATS.map((s, i) => {
            const p  = spring({ frame: Math.max(0, frame - (10 + i * 12)), fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
            const op = interpolate(p, [0, 0.4], [0, 1]);
            const ty = interpolate(p, [0, 1], [40, 0]);
            return (
              <div key={i} style={{
                flex: 1, opacity: op, transform: `translateY(${ty}px)`,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${ELEC}33`,
                borderRadius: 18, padding: '26px 12px', textAlign: 'center',
                backdropFilter: 'blur(8px)',
                boxShadow: `0 0 30px ${ELEC}11, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}>
                <div style={{
                  fontFamily: playfair.fontFamily, fontSize: 60, fontWeight: 900, lineHeight: 1,
                  background: `linear-gradient(135deg, ${ELEC} 0%, ${ELEC2} 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {s.val}
                </div>
                <div style={{ fontFamily: inter.fontFamily, fontSize: 12, fontWeight: 700, color: WHITE, letterSpacing: '0.2em', marginTop: 6 }}>{s.unit}</div>
                <div style={{ fontFamily: inter.fontFamily, fontSize: 10, fontWeight: 300, color: `${PEARL}77`, letterSpacing: '0.08em', marginTop: 4 }}>{s.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Gallery ───────────────────────────────────────────────────────────────────
const GalleryV19: React.FC<{ shot: typeof SHOTS_V19[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: NAVY2 }}>
      <StoryDots total={7} current={6} />
      <Logo size={85} delay={4} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '90px 20px 60px' }}>
        <Rise delay={4}>
          <div style={{ fontFamily: playfair.fontFamily, fontSize: 38, fontWeight: 700, color: WHITE, letterSpacing: '0.12em', textAlign: 'center', marginBottom: 6 }}>
            OUR VENUE
          </div>
        </Rise>
        <ElecLine delay={8} width={30} align="center" />

        {/* Large + 2 small layout */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, width: '100%', height: 860 }}>
          {/* Left — tall */}
          {(() => {
            const p  = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20, stiffness: 130, mass: 1.0 } });
            const ty = interpolate(p, [0, 1], [80, 0]);
            const op = interpolate(p, [0, 0.3], [0, 1]);
            return (
              <div style={{ flex: 1.2, borderRadius: 16, overflow: 'hidden', transform: `translateY(${ty}px)`, opacity: op, border: `1px solid ${ELEC}22` }}>
                <Img src={staticFile(`images/${shot.images![0]}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to top, ${NAVY}EE, transparent)` }} />
              </div>
            );
          })()}
          {/* Right — stacked */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2].map((imgIdx) => {
              const p  = spring({ frame: Math.max(0, frame - (10 + imgIdx * 10)), fps, config: { damping: 20, stiffness: 130, mass: 1.0 } });
              const tx = interpolate(p, [0, 1], [80, 0]);
              const op = interpolate(p, [0, 0.3], [0, 1]);
              return (
                <div key={imgIdx} style={{ flex: 1, borderRadius: 16, overflow: 'hidden', transform: `translateX(${tx}px)`, opacity: op, border: `1px solid ${ELEC}22` }}>
                  <Img src={staticFile(`images/${shot.images![imgIdx]}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Cyan accent dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: i === 0 ? 22 : 8, height: 6, borderRadius: 3, background: i === 0 ? CYAN : `${CYAN}44` }} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── CTA ───────────────────────────────────────────────────────────────────────
const CTAV19: React.FC<{ shot: typeof SHOTS_V19[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const p1 = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 20, stiffness: 150, mass: 0.9 } });
  const p2 = spring({ frame: Math.max(0, frame - 26), fps, config: { damping: 20, stiffness: 150, mass: 0.9 } });
  const p3 = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 22, stiffness: 130, mass: 1.0 } });
  const p4 = spring({ frame: Math.max(0, frame - 55), fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });

  const ty = (p: number) => interpolate(p, [0, 1], [40, 0]);
  const op = (p: number) => interpolate(p, [0, 0.4], [0, 1]);

  const btnP  = spring({ frame: Math.max(0, frame - 68), fps, config: { damping: 14, stiffness: 200, mass: 0.7 } });
  const btnSc = interpolate(btnP, [0, 1], [0.75, 1]);
  const btnOp = interpolate(btnP, [0, 0.4], [0, 1]);

  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <KenBurns src={shot.img!} totalFrames={shot.frames} startScale={1.05} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(4,9,26,0.78)`, opacity: fadeIn }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,9,26,0.4) 0%, transparent 40%, rgba(4,9,26,0.92) 75%, rgba(4,9,26,1) 100%)' }} />
      <GlowPulse />
      <ScanLine delay={12} />

      {/* Logo top */}
      <Logo size={130} delay={10} />

      {/* Main content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 36px' }}>

        <div style={{ transform: `translateY(${ty(p1)}px)`, opacity: op(p1), textAlign: 'center' }}>
          <div style={{ fontFamily: inter.fontFamily, fontSize: 14, fontWeight: 600, color: CYAN, letterSpacing: '0.38em' }}>
            YOUR DREAM VENUE AWAITS
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p2)}px)`, opacity: op(p2), textAlign: 'center', marginTop: 10 }}>
          <div style={{
            fontFamily: playfair.fontFamily, fontSize: 86, fontWeight: 900, lineHeight: 1,
            background: `linear-gradient(135deg, ${WHITE} 0%, ${PEARL} 50%, ${ELEC2} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textShadow: 'none', filter: `drop-shadow(0 0 30px ${ELEC}44)`,
            letterSpacing: '-0.01em',
          }}>
            JKR FARMS
          </div>
          <div style={{
            fontFamily: playfair.fontFamily, fontSize: 86, fontWeight: 900, lineHeight: 1,
            background: `linear-gradient(135deg, ${ELEC} 0%, ${ELEC2} 50%, ${CYAN} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 30px ${ELEC}66)`,
            letterSpacing: '-0.01em',
          }}>
            &amp; RESORTS
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p3)}px)`, opacity: op(p3), textAlign: 'center', marginTop: 18 }}>
          <ElecLine delay={40} width={55} align="center" />
          <div style={{ marginTop: 14, fontFamily: inter.fontFamily, fontSize: 14, fontWeight: 300, color: `${PEARL}BB`, letterSpacing: '0.2em' }}>
            6 ACRES · NORTH BANGALORE · EST. 1990
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ marginTop: 32, transform: `scale(${btnSc})`, opacity: btnOp }}>
          <div style={{
            background: `linear-gradient(135deg, ${ELEC} 0%, ${ELEC2} 50%, ${CYAN} 100%)`,
            borderRadius: 50, padding: '20px 52px',
            fontFamily: inter.fontFamily, fontSize: 18, fontWeight: 800,
            color: NAVY, letterSpacing: '0.14em',
            boxShadow: `0 8px 32px ${ELEC}55, 0 0 0 1px ${ELEC}33`,
            textAlign: 'center',
          }}>
            BOOK YOUR DATE →
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p4)}px)`, opacity: op(p4), textAlign: 'center', marginTop: 26 }}>
          <div style={{ fontFamily: inter.fontFamily, fontSize: 30, fontWeight: 800, color: ELEC2, letterSpacing: '0.04em', textShadow: `0 0 24px ${ELEC}99` }}>
            📞 73385 01337
          </div>
          <div style={{ fontFamily: inter.fontFamily, fontSize: 13, fontWeight: 300, color: `${PEARL}77`, letterSpacing: '0.14em', marginTop: 8 }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export const JKRReelV19: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Series>
      {SHOTS_V19.map((shot, i) => (
        <Series.Sequence key={i} durationInFrames={shot.frames}>
          {shot.isHook    && <HookV19    shot={shot} />}
          {shot.isCounter && <CounterV19 shot={shot} />}
          {shot.isGallery && <GalleryV19 shot={shot} />}
          {shot.isCTA     && <CTAV19     shot={shot} />}
          {!shot.isHook && !shot.isCounter && !shot.isGallery && !shot.isCTA && (
            <ShotV19 shot={shot} sectionIdx={i} />
          )}
        </Series.Sequence>
      ))}
    </Series>

    {/* Shots voice: covers 0–448f (70+4×62+62+64) */}
    <Sequence durationInFrames={448}>
      <Audio src={staticFile('voice/voice_v19_shots.mp3')} volume={1} />
    </Sequence>
    {/* CTA voice: from frame 448 */}
    <Sequence from={448}>
      <Audio src={staticFile('voice/voice_v19_cta.mp3')} volume={1} />
    </Sequence>
    <Audio src={staticFile('voice/bg_music_v8.mp3')} volume={0.18} />
  </AbsoluteFill>
);
