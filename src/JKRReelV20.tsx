import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { loadFont as loadLoraFont }  from '@remotion/google-fonts/Lora';
import { loadFont as loadPoppins }   from '@remotion/google-fonts/Poppins';

const lora    = loadLoraFont('normal',  { weights: ['400', '600', '700'] });
const poppins = loadPoppins('normal',   { weights: ['300', '400', '500', '600', '700', '800'] });

// V20 — "NOIR" — Charcoal Black + Rose Gold + Warm Amber
// New: venetian blinds open, morph-blur text, SVG arc stats, glow border, fan-stack gallery
const NOIR   = '#0D0B08';
const NOIR2  = '#1C1714';
const ROSE   = '#C8906A';
const ROSE2  = '#E8AF84';
const AMBER  = '#F4C030';
const AMBER2 = '#FFD870';
const CREAM  = '#F8F2E8';
const WHITE  = '#FFFFFF';

// Hook:72 + 4×62 + Counter:62 + Gallery:62 + CTA:150 = 594f ≈ 20s
const SHOTS_V20: Array<{
  isHook?: boolean; isCTA?: boolean; isCounter?: boolean; isGallery?: boolean;
  img?: string; images?: string[];
  tag?: string; line1?: string; line2?: string;
  frames: number;
}> = [
  { isHook: true,    img: 'v10_shot1_rooftop.webp',                                                           frames: 72  },
  { img: 'v12_aerial_pool.webp',  tag:'01', line1:'Scenic Pool',   line2:'& Aerial Views',                    frames: 62  },
  { img: 'svl_SVL06560.webp',     tag:'02', line1:'Elegant',       line2:'Spaces',                            frames: 62  },
  { img: 'v10_shot3_ceremony.webp', tag:'03', line1:'Sacred',      line2:'Ceremonies',                        frames: 62  },
  { img: 'w10_dining4.webp',      tag:'04', line1:'Fine',          line2:'Dining',                            frames: 62  },
  { isCounter: true, img: 'v12_aerial_mandap.webp',                                                            frames: 62  },
  { isGallery: true, images: ['w10_gallery9.webp','g08_gallery10.webp','v12_lawn1.webp'],                      frames: 62  },
  { isCTA: true,     img: 'v10_shot5_entrance.webp',                                                                    frames: 150 },
];

export const TOTAL_FRAMES_V20 = SHOTS_V20.reduce((a, s) => a + s.frames, 0); // 594

// ── Venetian Blinds reveal ────────────────────────────────────────────────────
const BlindsOpen: React.FC<{ src: string; totalFrames: number; slats?: number }> = ({ src, totalFrames, slats = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = interpolate(frame, [0, totalFrames], [1.10, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})` }} />
      {Array.from({ length: slats }).map((_, i) => {
        const delay = i * 2.5;
        const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 160, mass: 0.8 } });
        // scaleY goes 1→0 (blind closes then opens) — actually we want 1→0 = blind disappears
        const sy = interpolate(p, [0, 1], [1, 0]);
        const slH = 1920 / slats;
        return (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0,
            top: i * slH, height: slH,
            background: NOIR,
            transform: `scaleY(${sy})`,
            transformOrigin: 'top center',
          }} />
        );
      })}
    </div>
  );
};

// ── Morph-blur text reveal ───────────────────────────────────────────────────
const MorphText: React.FC<{
  text: string; size: number; color?: string; delay?: number;
  weight?: number; font?: 'lora' | 'poppins'; spacing?: string; align?: string;
}> = ({ text, size, color = WHITE, delay = 0, weight = 700, font = 'lora', spacing = '0.02em', align = 'left' }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const blur   = interpolate(f, [0, 20], [18, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op     = interpolate(f, [0, 10], [0, 1],  { extrapolateRight: 'clamp' });
  const sc     = interpolate(f, [0, 20], [0.92, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const ff     = font === 'lora' ? lora.fontFamily : poppins.fontFamily;
  return (
    <div style={{
      fontFamily: ff, fontSize: size, fontWeight: weight as any, color,
      letterSpacing: spacing, opacity: op, textAlign: align as any,
      filter: `blur(${blur}px)`, transform: `scale(${sc})`,
      lineHeight: 1.1,
    }}>
      {text}
    </div>
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

// ── Animated glow border around frame ────────────────────────────────────────
const GlowBorder: React.FC<{ delay?: number }> = ({ delay = 6 }) => {
  const frame = useCurrentFrame();
  const prog = interpolate(Math.max(0, frame - delay), [0, 30], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op   = interpolate(Math.max(0, frame - delay), [0, 8], [0, 0.7], { extrapolateRight: 'clamp' });
  const size = interpolate(prog, [0, 1], [3, 1]);
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      border: `${size}px solid ${ROSE}`,
      boxShadow: `inset 0 0 40px ${ROSE}22, 0 0 30px ${ROSE}33`,
      opacity: op,
      borderRadius: 0,
      zIndex: 6,
    }} />
  );
};

// ── SVG Arc stat ──────────────────────────────────────────────────────────────
const ArcStat: React.FC<{ val: string; label: string; sub: string; delay: number; color?: string }> = ({ val, label, sub, delay, color = AMBER }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p   = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 150, mass: 0.85 } });
  const op  = interpolate(p, [0, 0.4], [0, 1]);
  const ty  = interpolate(p, [0, 1], [40, 0]);
  const R   = 48;
  const circ = 2 * Math.PI * R;
  const arc  = interpolate(p, [0, 1], [0, circ * 0.75]);
  return (
    <div style={{ flex: 1, opacity: op, transform: `translateY(${ty}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        {/* Track */}
        <circle cx={55} cy={55} r={R} fill="none" stroke={`${color}22`} strokeWidth={5} />
        {/* Arc progress */}
        <circle cx={55} cy={55} r={R} fill="none" stroke={color}
          strokeWidth={5} strokeLinecap="round"
          strokeDasharray={`${arc} ${circ}`}
          transform="rotate(-135 55 55)"
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
        <text x="55" y="52" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: lora.fontFamily, fontSize: 22, fontWeight: 700, fill: color }}>
          {val}
        </text>
      </svg>
      <div style={{ fontFamily: poppins.fontFamily, fontSize: 11, fontWeight: 700, color: WHITE, letterSpacing: '0.18em', marginTop: 4, textAlign: 'center' }}>{label}</div>
      <div style={{ fontFamily: poppins.fontFamily, fontSize: 10, fontWeight: 300, color: `${CREAM}66`, letterSpacing: '0.08em', textAlign: 'center', marginTop: 2 }}>{sub}</div>
    </div>
  );
};

// ── JKR Logo ──────────────────────────────────────────────────────────────────
const Logo: React.FC<{ size?: number; delay?: number; top?: number }> = ({ size = 100, delay = 6, top = 52 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(Math.max(0, frame - delay), [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30, opacity: op }}>
      <Img src={staticFile('logo.png')} style={{ width: size, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.85)) drop-shadow(0 0 10px rgba(244,192,48,0.35))' }} />
    </div>
  );
};

// ── Story dots ────────────────────────────────────────────────────────────────
const Dots: React.FC<{ total: number; cur: number }> = ({ total, cur }) => (
  <div style={{ position: 'absolute', top: 28, left: 0, right: 0, display: 'flex', gap: 5, justifyContent: 'center', zIndex: 20, padding: '0 24px' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ height: 3, flex: i === cur ? 2.5 : 1, borderRadius: 2, background: i < cur ? AMBER : i === cur ? ROSE2 : 'rgba(255,255,255,0.22)' }} />
    ))}
  </div>
);

// ── Amber rule line ───────────────────────────────────────────────────────────
const Rule: React.FC<{ delay?: number; width?: number }> = ({ delay = 8, width = 60 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(Math.max(0, frame - delay), [0, 16], [0, width], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return <div style={{ width: `${w}%`, height: 2, background: `linear-gradient(to right, ${ROSE}, ${AMBER})`, borderRadius: 1, boxShadow: `0 0 8px ${AMBER}66` }} />;
};

// ── SlideUp helper ────────────────────────────────────────────────────────────
const Up: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 22, stiffness: 155, mass: 0.85 } });
  return <div style={{ transform: `translateY(${interpolate(p, [0, 1], [45, 0])}px)`, opacity: interpolate(p, [0, 0.35], [0, 1]), ...style }}>{children}</div>;
};

// ── Hook ─────────────────────────────────────────────────────────────────────
const HookV20: React.FC<{ shot: typeof SHOTS_V20[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const overlayOp = interpolate(frame, [0, 35], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: NOIR }}>
      <BlindsOpen src={shot.img!} totalFrames={shot.frames} slats={10} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,11,8,0.50) 0%, rgba(13,11,8,0.20) 40%, rgba(13,11,8,0.80) 100%)', opacity: overlayOp }} />
      <GlowBorder delay={28} />
      <Dots total={7} cur={0} />
      <Logo size={115} delay={32} top={55} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
        <Up delay={26} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 16, fontWeight: 500, color: ROSE2, letterSpacing: '0.42em' }}>YOUR LOVE STORY</div>
        </Up>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <MorphText text="DESERVES" size={90} color={WHITE} delay={30} weight={700} spacing="-0.01em" align="center" />
          <MorphText text="THE PERFECT" size={90} color={WHITE} delay={34} weight={700} spacing="-0.01em" align="center" />
          <MorphText text="STAGE." size={90} color={AMBER} delay={38} weight={700} spacing="-0.01em" align="center"
          />
        </div>
        <Up delay={48} style={{ textAlign: 'center', marginTop: 24 }}>
          <Rule delay={48} width={45} />
          <div style={{ marginTop: 14, fontFamily: poppins.fontFamily, fontSize: 15, fontWeight: 600, color: CREAM, letterSpacing: '0.28em' }}>JKR FARMS &amp; RESORTS</div>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 12, fontWeight: 300, color: `${CREAM}88`, letterSpacing: '0.22em', marginTop: 5 }}>NORTH BANGALORE</div>
        </Up>
      </div>
    </AbsoluteFill>
  );
};

// ── Shot ──────────────────────────────────────────────────────────────────────
const ShotV20: React.FC<{ shot: typeof SHOTS_V20[0]; idx: number }> = ({ shot, idx }) => (
  <AbsoluteFill style={{ background: NOIR }}>
    <KenBurns src={shot.img!} totalFrames={shot.frames} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,11,8,0.10) 0%, rgba(13,11,8,0.25) 35%, rgba(13,11,8,0.82) 65%, rgba(13,11,8,0.96) 100%)' }} />
    <GlowBorder delay={4} />
    <Dots total={7} cur={idx} />
    <Logo size={85} delay={4} top={55} />

    {/* Tag pill */}
    <Up delay={4} style={{ position: 'absolute', top: 108, left: 32 }}>
      <div style={{ background: `linear-gradient(135deg, ${ROSE} 0%, ${AMBER} 100%)`, borderRadius: 8, padding: '7px 18px', display: 'inline-flex', alignItems: 'center', gap: 7, boxShadow: `0 4px 20px ${AMBER}44` }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: NOIR }} />
        <span style={{ fontFamily: poppins.fontFamily, fontSize: 12, fontWeight: 700, color: NOIR, letterSpacing: '0.16em' }}>{shot.tag}</span>
      </div>
    </Up>

    {/* Centre text */}
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '0 36px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 25%, rgba(13,11,8,0.72) 44%, rgba(13,11,8,0.78) 56%, transparent 75%)' }} />
      <div style={{ position: 'relative', zIndex: 5 }}>
        <Rule delay={6} width={30} />
        <div style={{ marginTop: 16 }}>
          <MorphText text={shot.line1!} size={80} color={CREAM} delay={6}  weight={600} font="lora" />
          <MorphText text={shot.line2!} size={80} color={AMBER} delay={12} weight={700} font="lora" />
        </div>
        <Up delay={20}>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 12, fontWeight: 400, color: `${ROSE2}CC`, letterSpacing: '0.22em', marginTop: 14 }}>
            JKR FARMS &amp; RESORTS
          </div>
        </Up>
      </div>
    </div>
  </AbsoluteFill>
);

// ── Counter with SVG arcs ─────────────────────────────────────────────────────
const CounterV20: React.FC<{ shot: typeof SHOTS_V20[0] }> = ({ shot }) => (
  <AbsoluteFill style={{ background: NOIR }}>
    <KenBurns src={shot.img!} totalFrames={shot.frames} startScale={1.06} />
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,11,8,0.88)' }} />
    <GlowBorder delay={4} />
    <Dots total={7} cur={5} />
    <Logo size={90} delay={4} top={55} />

    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 0 }}>
      <Up delay={4}>
        <div style={{ fontFamily: poppins.fontFamily, fontSize: 12, fontWeight: 600, color: ROSE2, letterSpacing: '0.42em', textAlign: 'center', marginBottom: 10 }}>BY THE NUMBERS</div>
      </Up>
      <Rule delay={6} width={38} />
      <div style={{ display: 'flex', gap: 8, marginTop: 36, width: '100%', justifyContent: 'center' }}>
        <ArcStat val="6"    label="ACRES"  sub="of paradise"  delay={10} color={AMBER} />
        <ArcStat val="500+" label="EVENTS" sub="celebrated"   delay={22} color={ROSE} />
        <ArcStat val="35+"  label="YEARS"  sub="of trust"     delay={34} color={AMBER2} />
      </div>
      <Up delay={46} style={{ textAlign: 'center', marginTop: 28 }}>
        <div style={{ fontFamily: lora.fontFamily, fontSize: 22, fontWeight: 600, color: CREAM, letterSpacing: '0.06em', fontStyle: 'italic' }}>
          "Where memories are made."
        </div>
      </Up>
    </div>
  </AbsoluteFill>
);

// ── Fan-stack gallery ─────────────────────────────────────────────────────────
const GalleryV20: React.FC<{ shot: typeof SHOTS_V20[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotations = [-6, 0, 6];
  const offsets   = [-60, 0, 60];

  return (
    <AbsoluteFill style={{ background: NOIR2 }}>
      <Dots total={7} cur={6} />
      <Logo size={85} delay={4} top={52} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '90px 24px 70px' }}>
        <Up delay={4}>
          <div style={{ fontFamily: lora.fontFamily, fontSize: 36, fontWeight: 700, color: CREAM, letterSpacing: '0.14em', textAlign: 'center', marginBottom: 8 }}>
            THE VENUE
          </div>
        </Up>
        <Rule delay={8} width={28} />

        {/* Fan stack */}
        <div style={{ position: 'relative', width: '100%', height: 780, marginTop: 32 }}>
          {shot.images!.map((img, i) => {
            const p   = spring({ frame: Math.max(0, frame - (8 + i * 10)), fps, config: { damping: 20, stiffness: 130, mass: 1.0 } });
            const op  = interpolate(p, [0, 0.4], [0, 1]);
            const sc  = interpolate(p, [0, 1], [0.7, 1]);
            const rot = rotations[i];
            const tx  = offsets[i];
            return (
              <div key={i} style={{
                position: 'absolute', left: '50%', top: 0,
                width: '85%', height: '100%',
                marginLeft: '-42.5%',
                borderRadius: 20, overflow: 'hidden',
                transform: `translateX(${tx * (1 - sc + 0.05)}px) rotate(${rot * (1 - sc + 0.05)}deg) scale(${sc})`,
                opacity: op,
                border: `2px solid ${i === 1 ? AMBER : ROSE}44`,
                boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
                zIndex: i === 1 ? 3 : i === 0 ? 1 : 2,
              }}>
                <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${NOIR}CC 0%, transparent 50%)` }} />
              </div>
            );
          })}
        </div>

        <Up delay={32} style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 12, fontWeight: 500, color: `${ROSE2}BB`, letterSpacing: '0.22em' }}>
            JKR FARMS &amp; RESORTS · NORTH BANGALORE
          </div>
        </Up>
      </div>
    </AbsoluteFill>
  );
};

// ── CTA ───────────────────────────────────────────────────────────────────────
const CTAV20: React.FC<{ shot: typeof SHOTS_V20[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });

  const p1 = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 20, stiffness: 145, mass: 0.9 } });
  const p2 = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 20, stiffness: 145, mass: 0.9 } });
  const p3 = spring({ frame: Math.max(0, frame - 42), fps, config: { damping: 22, stiffness: 130, mass: 1.0 } });
  const p4 = spring({ frame: Math.max(0, frame - 60), fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
  const btnP = spring({ frame: Math.max(0, frame - 74), fps, config: { damping: 14, stiffness: 200, mass: 0.7 } });

  const ty  = (p: number) => interpolate(p, [0, 1], [40, 0]);
  const op  = (p: number) => interpolate(p, [0, 0.4], [0, 1]);

  return (
    <AbsoluteFill style={{ background: NOIR }}>
      <KenBurns src={shot.img!} totalFrames={shot.frames} startScale={1.05} />
      <div style={{ position: 'absolute', inset: 0, background: `rgba(13,11,8,0.80)`, opacity: fadeIn }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,11,8,0.55) 0%, transparent 35%, rgba(13,11,8,0.95) 80%, rgba(13,11,8,1) 100%)' }} />
      <GlowBorder delay={6} />

      {/* Amber accent corner lines */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h], i) => {
        const p = spring({ frame: Math.max(0, frame - (8 + i * 4)), fps, config: { damping: 18, stiffness: 180, mass: 0.7 } });
        const len = interpolate(p, [0, 1], [0, 55]);
        const styles: Record<string, React.CSSProperties> = {
          'topleft':     { top: 50, left: 30, borderTop: `2px solid ${AMBER}`, borderLeft: `2px solid ${AMBER}`, width: len, height: len },
          'topright':    { top: 50, right: 30, borderTop: `2px solid ${AMBER}`, borderRight: `2px solid ${AMBER}`, width: len, height: len },
          'bottomleft':  { bottom: 50, left: 30, borderBottom: `2px solid ${AMBER}`, borderLeft: `2px solid ${AMBER}`, width: len, height: len },
          'bottomright': { bottom: 50, right: 30, borderBottom: `2px solid ${AMBER}`, borderRight: `2px solid ${AMBER}`, width: len, height: len },
        };
        return <div key={i} style={{ position: 'absolute', zIndex: 20, boxShadow: `0 0 10px ${AMBER}55`, ...styles[`${v}${h}`] }} />;
      })}

      <Logo size={130} delay={10} top={72} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
        <div style={{ transform: `translateY(${ty(p1)}px)`, opacity: op(p1), textAlign: 'center' }}>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 14, fontWeight: 500, color: ROSE2, letterSpacing: '0.36em' }}>MAKE YOUR WEDDING</div>
        </div>
        <div style={{ transform: `translateY(${ty(p2)}px)`, opacity: op(p2), textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontFamily: lora.fontFamily, fontSize: 88, fontWeight: 700, color: WHITE, lineHeight: 1, textShadow: `0 4px 40px rgba(0,0,0,0.95)`, letterSpacing: '0.01em' }}>
            LEGENDARY
          </div>
          <div style={{ width: '100%', height: 3, background: `linear-gradient(to right, transparent, ${AMBER}, transparent)`, marginTop: 8, boxShadow: `0 0 10px ${AMBER}88` }} />
        </div>
        <div style={{ transform: `translateY(${ty(p3)}px)`, opacity: op(p3), textAlign: 'center', marginTop: 20 }}>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 22, fontWeight: 600, color: AMBER2, letterSpacing: '0.12em' }}>JKR FARMS &amp; RESORTS</div>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 13, fontWeight: 300, color: `${CREAM}99`, letterSpacing: '0.2em', marginTop: 6 }}>6 ACRES · NORTH BANGALORE · EST. 1990</div>
        </div>

        {/* Button */}
        <div style={{ marginTop: 30, transform: `scale(${interpolate(btnP, [0, 1], [0.75, 1])})`, opacity: op(btnP) }}>
          <div style={{
            background: `linear-gradient(135deg, ${ROSE} 0%, ${AMBER} 100%)`,
            borderRadius: 50, padding: '20px 52px',
            fontFamily: poppins.fontFamily, fontSize: 18, fontWeight: 700,
            color: NOIR, letterSpacing: '0.14em',
            boxShadow: `0 8px 36px ${AMBER}55`,
            textAlign: 'center',
          }}>
            BOOK YOUR DATE →
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p4)}px)`, opacity: op(p4), textAlign: 'center', marginTop: 24 }}>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 30, fontWeight: 800, color: AMBER2, textShadow: `0 0 24px ${AMBER}99` }}>
            📞 73385 01337
          </div>
          <div style={{ fontFamily: poppins.fontFamily, fontSize: 12, fontWeight: 300, color: `${CREAM}77`, letterSpacing: '0.14em', marginTop: 8 }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export const JKRReelV20: React.FC = () => (
  <AbsoluteFill style={{ background: NOIR }}>
    <Series>
      {SHOTS_V20.map((shot, i) => (
        <Series.Sequence key={i} durationInFrames={shot.frames}>
          {shot.isHook    && <HookV20    shot={shot} />}
          {shot.isCounter && <CounterV20 shot={shot} />}
          {shot.isGallery && <GalleryV20 shot={shot} />}
          {shot.isCTA     && <CTAV20     shot={shot} />}
          {!shot.isHook && !shot.isCounter && !shot.isGallery && !shot.isCTA && (
            <ShotV20 shot={shot} idx={i} />
          )}
        </Series.Sequence>
      ))}
    </Series>

    {/* Shots voice: 0–444f (72 + 4×62 + 62 + 62) */}
    <Sequence durationInFrames={444}>
      <Audio src={staticFile('voice/voice_v20_shots.mp3')} volume={1} />
    </Sequence>
    <Sequence from={444}>
      <Audio src={staticFile('voice/voice_v20_cta.mp3')} volume={1} />
    </Sequence>
    <Audio src={staticFile('voice/bg_music_v9.mp3')} volume={0.18} />
  </AbsoluteFill>
);
