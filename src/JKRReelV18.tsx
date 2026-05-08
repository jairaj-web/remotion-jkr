import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion';
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';

const cormorant  = loadCormorant('normal', { weights: ['400', '700'] });
const montserrat = loadMontserrat('normal', { weights: ['300', '400', '600', '700', '800'] });

// V18 — "ETERNAL" — Deep Forest Green + Ivory + Rose Gold
// Fresh: curtain reveal, floating diamonds, cinematic letterbox, flip stats, scroll strip
const FOREST  = '#0A1F0E';
const FOREST2 = '#162B1A';
const IVORY   = '#F5F0E8';
const ROSE    = '#C9856A';
const ROSE2   = '#E8A090';
const GOLD    = '#D4A853';
const WHITE   = '#FFFFFF';

// Hook:70 + 4 shots:260(65ea) + Counter:60 + Strip:60 + CTA:150 = 600f = 20s
const SHOTS_V18: Array<{
  isHook?: boolean; isCTA?: boolean; isCounter?: boolean; isStrip?: boolean;
  img?: string; images?: string[];
  tag?: string; line1?: string; line2?: string;
  frames: number;
}> = [
  { isHook: true,    img: 'w_cta_jkr-gallery-8.webp',                                                       frames: 70  },
  { img: 'v12_mandap1.webp',    tag:'01', line1:'Grand Mandap',     line2:'Ceremonies',                      frames: 65  },
  { img: 'v9_entrance.webp',    tag:'02', line1:'Royal',            line2:'Entrance',                        frames: 65  },
  { img: 'v12_pool1.webp',      tag:'03', line1:'Scenic Pool',      line2:'& Gardens',                       frames: 65  },
  { img: 'site_Dining-Hall-1.webp', tag:'04', line1:'Elegant',      line2:'Dining Hall',                     frames: 65  },
  { isCounter: true, img: 'v12_aerial_lawn2.webp',                                                            frames: 60  },
  { isStrip: true,   images: ['g04_gallery4.webp','g12_venue3.webp','g13_venue2.webp'],                       frames: 60  },
  { isCTA: true,     img: 'w_cta_events.webp',                                                                frames: 150 },
];

export const TOTAL_FRAMES_V18 = SHOTS_V18.reduce((a, s) => a + s.frames, 0); // 600

// ── Curtain reveal — two forest panels slide left/right ──────────────────────
const CurtainReveal: React.FC<{ src: string; totalFrames: number }> = ({ src, totalFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame, fps, config: { damping: 22, stiffness: 130, mass: 1.1 } });
  const sc = interpolate(frame, [0, totalFrames], [1.10, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const leftPct  = interpolate(p, [0, 1], [0, -105]);
  const rightPct = interpolate(p, [0, 1], [0,  105]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,31,14,0.3) 0%, rgba(10,31,14,0.55) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: FOREST, transform: `translateX(${leftPct}%)` }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: FOREST, transform: `translateX(${rightPct}%)` }} />
    </div>
  );
};

// ── Cinematic letterbox bars ─────────────────────────────────────────────────
const LetterBox: React.FC<{ barH?: number }> = ({ barH = 90 }) => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barH, background: FOREST, zIndex: 10 }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barH, background: FOREST, zIndex: 10 }} />
  </>
);

// ── Floating gold diamonds ───────────────────────────────────────────────────
const FloatingDiamonds: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    { x: 8,  startY: 1800, speed: 1.1, size: 7,  op: 0.35, delay: 0  },
    { x: 20, startY: 1900, speed: 0.8, size: 5,  op: 0.25, delay: 10 },
    { x: 35, startY: 1750, speed: 1.3, size: 9,  op: 0.30, delay: 4  },
    { x: 55, startY: 1850, speed: 0.9, size: 6,  op: 0.28, delay: 15 },
    { x: 70, startY: 1780, speed: 1.2, size: 8,  op: 0.32, delay: 7  },
    { x: 85, startY: 1920, speed: 1.0, size: 5,  op: 0.22, delay: 12 },
    { x: 92, startY: 1860, speed: 0.7, size: 10, op: 0.20, delay: 20 },
  ];
  return (
    <>
      {items.map((d, i) => {
        const f = frame - d.delay;
        if (f <= 0) return null;
        const y = d.startY - f * d.speed;
        if (y < -20) return null;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${d.x}%`, top: y,
            width: d.size, height: d.size,
            background: GOLD, opacity: d.op,
            transform: 'rotate(45deg)',
            zIndex: 5,
          }} />
        );
      })}
    </>
  );
};

// ── Ken Burns image ──────────────────────────────────────────────────────────
const KenBurns: React.FC<{ src: string; totalFrames: number; startScale?: number }> = ({ src, totalFrames, startScale = 1.10 }) => {
  const frame = useCurrentFrame();
  const sc = interpolate(frame, [0, totalFrames], [startScale, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})` }} />
    </div>
  );
};

// ── Shot overlay gradient ─────────────────────────────────────────────────────
const ShotOverlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(10,31,14,0.08) 0%, rgba(10,31,14,0.20) 40%, rgba(10,31,14,0.75) 75%, rgba(10,31,14,0.92) 100%)',
  }} />
);

// ── Story dots ───────────────────────────────────────────────────────────────
const StoryDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div style={{ position: 'absolute', top: 52, left: 0, right: 0, display: 'flex', gap: 6, justifyContent: 'center', zIndex: 20 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: 3, borderRadius: 2,
        width: i < current ? 24 : i === current ? 20 : 16,
        background: i <= current ? GOLD : 'rgba(255,255,255,0.30)',
        transition: 'width 0.3s',
      }} />
    ))}
  </div>
);

// ── Thin gold divider line ───────────────────────────────────────────────────
const GoldLine: React.FC<{ delay?: number; width?: number }> = ({ delay = 10, width = 80 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(Math.max(0, frame - delay), [0, 20], [0, width], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return <div style={{ width: `${w}%`, height: 1.5, background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, margin: '0 auto' }} />;
};

// ── Fade-slide text ──────────────────────────────────────────────────────────
const SlideUp: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 160, mass: 0.8 } });
  const ty = interpolate(p, [0, 1], [40, 0]);
  const op = interpolate(p, [0, 0.3], [0, 1]);
  return <div style={{ transform: `translateY(${ty}px)`, opacity: op, ...style }}>{children}</div>;
};

// ── HookSection ──────────────────────────────────────────────────────────────
const HookV18: React.FC<{ shot: typeof SHOTS_V18[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textDelay = 22;
  const subDelay  = 36;

  const stopOp = interpolate(Math.max(0, frame - textDelay), [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const stopScale = spring({ frame: Math.max(0, frame - textDelay), fps, config: { damping: 16, stiffness: 200, mass: 0.7 } });
  const stopSc = interpolate(stopScale, [0, 1], [0.6, 1]);

  const subP  = spring({ frame: Math.max(0, frame - subDelay), fps, config: { damping: 22, stiffness: 140, mass: 0.9 } });
  const subTy = interpolate(subP, [0, 1], [30, 0]);
  const subOp = interpolate(subP, [0, 0.4], [0, 1]);

  return (
    <AbsoluteFill style={{ background: FOREST }}>
      <CurtainReveal src={shot.img!} totalFrames={shot.frames} />
      <LetterBox barH={80} />
      <FloatingDiamonds />

      {/* Rose gold vignette side strips */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(201,133,106,0.12) 0%, transparent 30%, transparent 70%, rgba(201,133,106,0.12) 100%)' }} />

      {/* STOP SCROLLING — big punch */}
      <div style={{
        position: 'absolute', top: '38%', left: 0, right: 0,
        textAlign: 'center',
        opacity: stopOp, transform: `scale(${stopSc})`,
      }}>
        <div style={{
          fontFamily: montserrat.fontFamily, fontSize: 88, fontWeight: 800,
          color: WHITE, letterSpacing: '0.12em', lineHeight: 1,
          textShadow: `0 0 60px rgba(212,168,83,0.6), 0 4px 40px rgba(0,0,0,0.9)`,
        }}>STOP</div>
        <div style={{
          fontFamily: montserrat.fontFamily, fontSize: 88, fontWeight: 800,
          color: GOLD, letterSpacing: '0.12em', lineHeight: 1,
          textShadow: `0 0 60px rgba(212,168,83,0.8), 0 4px 40px rgba(0,0,0,0.9)`,
        }}>SCROLLING.</div>
      </div>

      {/* JKR sub-title */}
      <div style={{
        position: 'absolute', bottom: 180, left: 0, right: 0, textAlign: 'center',
        transform: `translateY(${subTy}px)`, opacity: subOp,
      }}>
        <GoldLine delay={subDelay + 6} width={55} />
        <div style={{ marginTop: 14, fontFamily: cormorant.fontFamily, fontSize: 42, fontWeight: 700, color: IVORY, letterSpacing: '0.18em', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          JKR FARMS &amp; RESORTS
        </div>
        <div style={{ fontFamily: montserrat.fontFamily, fontSize: 18, fontWeight: 300, color: ROSE2, letterSpacing: '0.25em', marginTop: 8, textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
          NORTH BANGALORE
        </div>
        <GoldLine delay={subDelay + 6} width={55} />
      </div>
    </AbsoluteFill>
  );
};

// ── ShotSection ──────────────────────────────────────────────────────────────
const ShotV18: React.FC<{ shot: typeof SHOTS_V18[0]; sectionIdx: number }> = ({ shot, sectionIdx }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: FOREST }}>
      <KenBurns src={shot.img!} totalFrames={shot.frames} />
      <ShotOverlay />
      <FloatingDiamonds />
      <StoryDots total={7} current={sectionIdx} />

      {/* Tag pill */}
      <SlideUp delay={4} style={{ position: 'absolute', top: 110, left: 36 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${ROSE}CC`, borderRadius: 30, padding: '7px 18px',
          border: `1px solid ${ROSE2}66`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
          <span style={{ fontFamily: montserrat.fontFamily, fontSize: 14, fontWeight: 600, color: WHITE, letterSpacing: '0.12em' }}>
            {shot.tag}
          </span>
        </div>
      </SlideUp>

      {/* Main text */}
      <div style={{ position: 'absolute', bottom: 160, left: 36, right: 36 }}>
        <GoldLine delay={8} width={30} />
        <div style={{ marginTop: 16 }}>
          <SlideUp delay={8}>
            <div style={{ fontFamily: cormorant.fontFamily, fontSize: 72, fontWeight: 700, color: IVORY, lineHeight: 1.05, textShadow: '0 4px 32px rgba(0,0,0,0.9)', letterSpacing: '0.02em' }}>
              {shot.line1}
            </div>
          </SlideUp>
          <SlideUp delay={14}>
            <div style={{ fontFamily: cormorant.fontFamily, fontSize: 72, fontWeight: 400, color: GOLD, lineHeight: 1.05, textShadow: '0 4px 32px rgba(0,0,0,0.9)', letterSpacing: '0.02em' }}>
              {shot.line2}
            </div>
          </SlideUp>
        </div>
        <SlideUp delay={20}>
          <div style={{ fontFamily: montserrat.fontFamily, fontSize: 16, fontWeight: 300, color: `${IVORY}CC`, letterSpacing: '0.2em', marginTop: 12 }}>
            JKR FARMS &amp; RESORTS
          </div>
        </SlideUp>
      </div>
    </AbsoluteFill>
  );
};

// ── Counter Section ───────────────────────────────────────────────────────────
const CounterV18: React.FC<{ shot: typeof SHOTS_V18[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const STATS = [
    { val: '6',    unit: 'ACRES',    label: 'of lush paradise' },
    { val: '500+', unit: 'EVENTS',   label: 'celebrated here' },
    { val: '35+',  unit: 'YEARS',    label: 'of excellence' },
  ];

  return (
    <AbsoluteFill style={{ background: FOREST }}>
      <KenBurns src={shot.img!} totalFrames={shot.frames} startScale={1.06} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,31,14,0.82)' }} />
      <StoryDots total={7} current={5} />
      <FloatingDiamonds />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        <SlideUp delay={4}>
          <div style={{ fontFamily: cormorant.fontFamily, fontSize: 28, fontWeight: 400, color: ROSE2, letterSpacing: '0.3em', textAlign: 'center', marginBottom: 10 }}>
            BY THE NUMBERS
          </div>
        </SlideUp>
        <GoldLine delay={8} width={40} />
        <div style={{ display: 'flex', gap: 24, marginTop: 36, paddingLeft: 24, paddingRight: 24 }}>
          {STATS.map((s, i) => {
            const p = spring({ frame: Math.max(0, frame - (12 + i * 10)), fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });
            const op = interpolate(p, [0, 0.4], [0, 1]);
            const ty = interpolate(p, [0, 1], [30, 0]);
            return (
              <div key={i} style={{
                flex: 1, background: `${FOREST2}EE`,
                border: `1px solid ${GOLD}44`, borderRadius: 16,
                padding: '28px 16px', textAlign: 'center',
                opacity: op, transform: `translateY(${ty}px)`,
                boxShadow: `0 0 24px ${GOLD}22`,
              }}>
                <div style={{ fontFamily: cormorant.fontFamily, fontSize: 58, fontWeight: 700, color: GOLD, lineHeight: 1, textShadow: `0 0 20px ${GOLD}66` }}>
                  {s.val}
                </div>
                <div style={{ fontFamily: montserrat.fontFamily, fontSize: 13, fontWeight: 700, color: IVORY, letterSpacing: '0.18em', marginTop: 6 }}>
                  {s.unit}
                </div>
                <div style={{ fontFamily: montserrat.fontFamily, fontSize: 11, fontWeight: 300, color: `${IVORY}88`, letterSpacing: '0.1em', marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Gallery Strip — 3 images slide in horizontally ────────────────────────────
const StripV18: React.FC<{ shot: typeof SHOTS_V18[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: FOREST2 }}>
      <StoryDots total={7} current={6} />
      <FloatingDiamonds />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '100px 20px 80px' }}>
        <SlideUp delay={4}>
          <div style={{ fontFamily: cormorant.fontFamily, fontSize: 36, fontWeight: 700, color: IVORY, letterSpacing: '0.22em', textAlign: 'center', marginBottom: 8 }}>
            OUR VENUE
          </div>
        </SlideUp>
        <GoldLine delay={8} width={35} />

        <div style={{ display: 'flex', gap: 10, marginTop: 28, width: '100%', height: 820 }}>
          {shot.images!.map((img, i) => {
            const p  = spring({ frame: Math.max(0, frame - (10 + i * 10)), fps, config: { damping: 20, stiffness: 140, mass: 0.9 } });
            const tx = interpolate(p, [0, 1], [120, 0]);
            const op = interpolate(p, [0, 0.3], [0, 1]);
            return (
              <div key={i} style={{
                flex: 1, borderRadius: 14, overflow: 'hidden',
                transform: `translateX(${tx}px)`, opacity: op,
                border: `1px solid ${GOLD}33`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
              }}>
                <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            );
          })}
        </div>

        {/* Rose dots */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: i === 0 ? 20 : 8, height: 8, borderRadius: 4, background: i === 0 ? ROSE : `${ROSE}55` }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── CTA Section ───────────────────────────────────────────────────────────────
const CTAV18: React.FC<{ shot: typeof SHOTS_V18[0] }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const p1 = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 20, stiffness: 140, mass: 0.9 } });
  const p2 = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 20, stiffness: 140, mass: 0.9 } });
  const p3 = spring({ frame: Math.max(0, frame - 38), fps, config: { damping: 20, stiffness: 140, mass: 0.9 } });
  const p4 = spring({ frame: Math.max(0, frame - 52), fps, config: { damping: 18, stiffness: 160, mass: 0.8 } });

  const ty = (p: number) => interpolate(p, [0, 1], [35, 0]);
  const op = (p: number) => interpolate(p, [0, 0.4], [0, 1]);

  const btnScale = spring({ frame: Math.max(0, frame - 60), fps, config: { damping: 14, stiffness: 200, mass: 0.7 } });
  const btnSc = interpolate(btnScale, [0, 1], [0.7, 1]);
  const btnOp = interpolate(btnScale, [0, 0.4], [0, 1]);

  return (
    <AbsoluteFill style={{ background: FOREST }}>
      <KenBurns src={shot.img!} totalFrames={shot.frames} startScale={1.06} />
      {/* Forest overlay */}
      <div style={{ position: 'absolute', inset: 0, background: `rgba(10,31,14,0.75)`, opacity: fadeIn }} />
      {/* Ivory vignette bottom */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(10,31,14,0.90) 100%)' }} />
      <FloatingDiamonds />

      {/* Top logo strip */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', opacity: fadeIn }}>
        <div style={{ fontFamily: montserrat.fontFamily, fontSize: 13, fontWeight: 600, color: GOLD, letterSpacing: '0.35em' }}>
          ✦ JKR FARMS &amp; RESORTS ✦
        </div>
      </div>

      {/* Main CTA content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>

        <div style={{ transform: `translateY(${ty(p1)}px)`, opacity: op(p1), textAlign: 'center' }}>
          <div style={{ fontFamily: cormorant.fontFamily, fontSize: 30, fontWeight: 400, color: ROSE2, letterSpacing: '0.25em' }}>
            YOUR DREAM WEDDING
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p2)}px)`, opacity: op(p2), textAlign: 'center', marginTop: 4 }}>
          <div style={{ fontFamily: cormorant.fontFamily, fontSize: 80, fontWeight: 700, color: IVORY, lineHeight: 1, textShadow: `0 0 40px ${GOLD}44, 0 4px 32px rgba(0,0,0,0.9)`, letterSpacing: '0.04em' }}>
            AWAITS YOU
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p3)}px)`, opacity: op(p3), textAlign: 'center', marginTop: 20 }}>
          <GoldLine delay={38} width={60} />
          <div style={{ marginTop: 16, fontFamily: montserrat.fontFamily, fontSize: 15, fontWeight: 300, color: `${IVORY}CC`, letterSpacing: '0.18em', lineHeight: 2 }}>
            6 ACRES · NORTH BANGALORE · EST. 1990
          </div>
        </div>

        {/* RESERVE Button */}
        <div style={{
          marginTop: 36,
          transform: `scale(${btnSc})`, opacity: btnOp,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE2} 100%)`,
            borderRadius: 50, padding: '20px 56px',
            fontFamily: montserrat.fontFamily, fontSize: 20, fontWeight: 700,
            color: WHITE, letterSpacing: '0.18em',
            boxShadow: `0 8px 32px rgba(201,133,106,0.5)`,
            textAlign: 'center',
          }}>
            BOOK YOUR DATE →
          </div>
        </div>

        <div style={{ transform: `translateY(${ty(p4)}px)`, opacity: op(p4), textAlign: 'center', marginTop: 28 }}>
          <div style={{ fontFamily: montserrat.fontFamily, fontSize: 28, fontWeight: 700, color: GOLD, letterSpacing: '0.06em', textShadow: `0 0 20px ${GOLD}88` }}>
            📞 +91 98765 43210
          </div>
          <div style={{ fontFamily: montserrat.fontFamily, fontSize: 14, fontWeight: 300, color: `${IVORY}88`, letterSpacing: '0.15em', marginTop: 8 }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const JKRReelV18: React.FC = () => {
  const musicFile = 'voice/bg_music_v7.mp3';

  return (
    <AbsoluteFill style={{ background: FOREST, fontFamily: montserrat.fontFamily }}>
      <Series>
        {SHOTS_V18.map((shot, i) => (
          <Series.Sequence key={i} durationInFrames={shot.frames}>
            {shot.isHook    && <HookV18 shot={shot} />}
            {shot.isCounter && <CounterV18 shot={shot} />}
            {shot.isStrip   && <StripV18 shot={shot} />}
            {shot.isCTA     && <CTAV18 shot={shot} />}
            {!shot.isHook && !shot.isCounter && !shot.isStrip && !shot.isCTA && (
              <ShotV18 shot={shot} sectionIdx={i} />
            )}
          </Series.Sequence>
        ))}
      </Series>

      {/* Shots voice: 0–450f (hook + 4 shots + counter + strip = 7 × ~64f) */}
      <Sequence durationInFrames={450}>
        <Audio src={staticFile('voice/voice_v18_shots.mp3')} volume={1} />
      </Sequence>
      {/* CTA voice: from frame 450 */}
      <Sequence from={450}>
        <Audio src={staticFile('voice/voice_v18_cta.mp3')} volume={1} />
      </Sequence>
      {/* Wedding background music */}
      <Audio src={staticFile(musicFile)} volume={0.18} />
    </AbsoluteFill>
  );
};
