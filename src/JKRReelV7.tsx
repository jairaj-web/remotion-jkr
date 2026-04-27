import React, { useEffect } from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
} from 'remotion';
import { loadFont as loadCinzel } from '@remotion/google-fonts/Cinzel';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';

const cinzel  = loadCinzel('normal', { weights: ['700'] });
const raleway = loadRaleway('normal', { weights: ['300', '400'] });

const GOLD    = '#D4AF37';
const WHITE   = '#FFFFFF';
const BLACK   = '#000000';

// All fresh images downloaded directly from jkrfarmsandresorts.com gallery
// Voice: Kannada (kn-IN-SapnaNeural) per-shot audio in public/voice/kn_line_N.mp3
const SHOTS_V7 = [
  { img: 'w01_svl495.webp',  tag: '01', headline: 'SIX ACRES',          sub: 'of pure luxury',           frames: 90,  zoomIn: true  },
  { img: 'w02_svl609.webp',  tag: '02', headline: 'NORTH BANGALORE\'S',  sub: 'most iconic venue',        frames: 84,  zoomIn: false },
  { img: 'w03_svl595.webp',  tag: '03', headline: 'A THOUSAND GUESTS',   sub: 'one perfect celebration',  frames: 90,  zoomIn: true  },
  { img: 'w04_dining.webp',  tag: '04', headline: 'GRAND DINING',        sub: 'crafted for every feast',  frames: 72,  zoomIn: false },
  { img: 'w05_svl746.webp',  tag: '05', headline: 'YOUR FOREVER',        sub: 'begins here',              frames: 78,  zoomIn: true  },
  { img: 'w06_svl557.webp',  tag: '06', headline: 'JKR FARMS',           sub: '& Resorts',               frames: 66,  zoomIn: false },
  { img: 'w_cta_hero.webp',  tag: '07', headline: '',                    sub: '',                         frames: 147, zoomIn: true,  isCTA: true },
];

export const TOTAL_FRAMES_V7 = SHOTS_V7.reduce((a, s) => a + s.frames, 0);

// ── Ken Burns ──────────────────────────────────────────────────────────────────
const KenBurns: React.FC<{ src: string; zoomIn: boolean; totalFrames: number }> = ({
  src, zoomIn, totalFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, totalFrames], zoomIn ? [1, 1.15] : [1.15, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

// ── Fade envelope ──────────────────────────────────────────────────────────────
const FadeEnvelope: React.FC<{ totalFrames: number; children: React.ReactNode }> = ({
  totalFrames, children,
}) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ── Light sweep (cinematic lens flare sweep) ───────────────────────────────────
const LightSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 35], [-30, 130], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const opacity = interpolate(frame, [0, 8, 28, 35], [0, 0.55, 0.55, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(ellipse 22% 80% at ${x}% 50%, rgba(255,235,150,0.22) 0%, rgba(212,175,55,0.08) 40%, transparent 70%)`,
      opacity,
      mixBlendMode: 'screen',
    }} />
  );
};

// ── Floating gold particles ────────────────────────────────────────────────────
const PARTICLES = [
  { x: 12, delay: 0,  speed: 0.55, size: 3, opacity: 0.6 },
  { x: 27, delay: 8,  speed: 0.40, size: 2, opacity: 0.4 },
  { x: 45, delay: 3,  speed: 0.65, size: 4, opacity: 0.5 },
  { x: 61, delay: 12, speed: 0.35, size: 2, opacity: 0.35 },
  { x: 74, delay: 5,  speed: 0.50, size: 3, opacity: 0.55 },
  { x: 88, delay: 18, speed: 0.45, size: 2, opacity: 0.4 },
  { x: 35, delay: 20, speed: 0.60, size: 3, opacity: 0.45 },
  { x: 55, delay: 25, speed: 0.42, size: 2, opacity: 0.3 },
];

const FloatingParticles: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PARTICLES.map((p, i) => {
        const f = Math.max(0, frame - p.delay);
        const cycleLen = totalFrames / p.speed / 30;
        const t = (f % cycleLen) / cycleLen;
        const y = 110 - t * 130; // float from 110% to -20%
        const fadeOpacity = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: GOLD,
            boxShadow: `0 0 ${p.size * 3}px ${GOLD}`,
            opacity: p.opacity * fadeOpacity,
          }} />
        );
      })}
    </div>
  );
};

// ── Grain overlay (subtle film texture) ───────────────────────────────────────
const GrainOverlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
    backgroundSize: '256px 256px',
    opacity: 0.4,
    mixBlendMode: 'overlay',
  }} />
);

// ── Vignette ───────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
  }} />
);

// ── Word stagger reveal ────────────────────────────────────────────────────────
const WordStagger: React.FC<{
  text: string;
  fontSize: number;
  delay?: number;
  color?: string;
  weight?: number;
  fontFamily?: string;
  spacing?: string;
}> = ({ text, fontSize, delay = 0, color = WHITE, weight = 700, fontFamily, spacing = '0.12em' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.22em',
      fontFamily: fontFamily ?? cinzel.fontFamily,
      fontSize, color, fontWeight: weight,
      letterSpacing: spacing, lineHeight: 1.2,
    }}>
      {words.map((word, i) => {
        const f = Math.max(0, frame - delay - i * 4);
        const p = spring({ frame: f, fps, config: { damping: 18, stiffness: 220, mass: 0.8 } });
        return (
          <span key={i} style={{
            display: 'inline-block',
            overflow: 'hidden',
          }}>
            <span style={{
              display: 'inline-block',
              transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px)`,
              opacity: interpolate(p, [0, 0.6, 1], [0, 0.9, 1]),
            }}>
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// ── Vertical gold bar ──────────────────────────────────────────────────────────
const VerticalBar: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const h = interpolate(frame - delay, [0, 28], [0, 180], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      width: 2.5, height: h,
      background: `linear-gradient(to bottom, transparent, ${GOLD} 20%, ${GOLD} 80%, transparent)`,
      boxShadow: `0 0 10px ${GOLD}88`,
      borderRadius: 2,
    }} />
  );
};

// ── Top brand bar with logo ────────────────────────────────────────────────────
const TopBrand: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 20], [0.88, 1], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  return (
    <>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 230,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.90) 0%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', top: 28, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        opacity, transform: `scale(${scale})`,
      }}>
        <Img
          src={staticFile('logo_sticky.webp')}
          style={{
            width: 260, height: 'auto',
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 12px ${GOLD}88)`,
          }}
        />
      </div>
    </>
  );
};

// ── Shot counter ───────────────────────────────────────────────────────────────
const ShotTag: React.FC<{ tag: string }> = ({ tag }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [8, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', top: 80, right: 68,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5,
      opacity,
    }}>
      <div style={{
        fontFamily: raleway.fontFamily, fontSize: 18, color: GOLD,
        fontWeight: 300, letterSpacing: '0.24em',
      }}>
        {tag} / 07
      </div>
      <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
    </div>
  );
};

// ── Left text block ────────────────────────────────────────────────────────────
const LeftTextBlock: React.FC<{ headline: string; sub: string }> = ({ headline, sub }) => {
  const frame = useCurrentFrame();
  const subOpacity = interpolate(frame - 26, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const dotOpacity = interpolate(frame - 24, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute', bottom: 240, left: 68, right: 68,
      display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 24,
    }}>
      {/* Gold vertical accent */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 4 }}>
        <VerticalBar delay={2} />
        <div style={{
          width: 7, height: 7, borderRadius: '50%', marginTop: 4,
          backgroundColor: GOLD,
          boxShadow: `0 0 8px ${GOLD}, 0 0 18px ${GOLD}66`,
          opacity: dotOpacity,
        }} />
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <WordStagger
          text={headline}
          fontSize={headline.length > 13 ? 62 : 72}
          delay={6}
          color={WHITE}
          spacing="0.14em"
        />
        <div style={{ opacity: subOpacity }}>
          <WordStagger
            text={sub}
            fontSize={34}
            delay={0}
            color={GOLD}
            weight={300}
            fontFamily={raleway.fontFamily}
            spacing="0.06em"
          />
        </div>
      </div>
    </div>
  );
};

// ── Bottom info bar ────────────────────────────────────────────────────────────
const BottomBar: React.FC<{ delay?: number }> = ({ delay = 38 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 52, left: 68, right: 68,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity,
      }}>
        <div style={{
          fontFamily: raleway.fontFamily, fontSize: 18, color: 'rgba(255,255,255,0.38)',
          fontWeight: 300, letterSpacing: '0.07em',
        }}>
          jkrfarmsandresorts.com
        </div>
        <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: GOLD, opacity: 0.5 }} />
        <div style={{
          fontFamily: raleway.fontFamily, fontSize: 18, color: 'rgba(255,255,255,0.38)',
          fontWeight: 300, letterSpacing: '0.05em',
        }}>
          73385 01337
        </div>
      </div>
    </>
  );
};

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotSceneV7: React.FC<{
  img: string; tag: string; headline: string; sub: string;
  zoomIn: boolean; frames: number;
}> = ({ img, tag, headline, sub, zoomIn, frames }) => (
  <FadeEnvelope totalFrames={frames}>
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <KenBurns src={img} zoomIn={zoomIn} totalFrames={frames} />
      <Vignette />
      <LightSweep />
      <FloatingParticles totalFrames={frames} />
      <GrainOverlay />
      <TopBrand />
      <ShotTag tag={tag} />
      <LeftTextBlock headline={headline} sub={sub} />
      <BottomBar />
    </AbsoluteFill>
  </FadeEnvelope>
);

// ── CTA slide ──────────────────────────────────────────────────────────────────
const CTASceneV7: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 0.55 + 0.45 * Math.sin((frame / fps) * Math.PI * 1.3);
  const lineW = interpolate(frame, [8, 38], [0, 280], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const boxScale = interpolate(frame, [5, 30], [0.7, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  });
  const boxOpacity = interpolate(frame, [5, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <FadeEnvelope totalFrames={frames}>
      <AbsoluteFill style={{ backgroundColor: BLACK }}>
        <KenBurns src={img} zoomIn={false} totalFrames={frames} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.80)' }} />
        <Vignette />
        <LightSweep />
        <FloatingParticles totalFrames={frames} />
        <GrainOverlay />

        {/* Top brand logo */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 230,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.90) 0%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: 28, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `scale(${interpolate(frame, [0, 20], [0.88, 1], { extrapolateRight: 'clamp' })})`,
        }}>
          <Img
            src={staticFile('logo_sticky.webp')}
            style={{
              width: 280, height: 'auto',
              mixBlendMode: 'screen',
              filter: `drop-shadow(0 0 14px ${GOLD}99)`,
            }}
          />
        </div>

        {/* CTA center block */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -50%) scale(${boxScale})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 920,
          opacity: boxOpacity,
        }}>
          {/* Pulsing glow border */}
          <div style={{
            position: 'absolute',
            width: 800, height: 400,
            border: `1.5px solid ${GOLD}`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.4 * pulse,
            boxShadow: `0 0 30px ${GOLD}33, inset 0 0 30px ${GOLD}11`,
          }} />

          {/* Inner glow border */}
          <div style={{
            position: 'absolute',
            width: 760, height: 360,
            border: `0.5px solid ${GOLD}55`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.6 * pulse,
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: lineW / 2, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: GOLD, boxShadow: `0 0 8px ${GOLD}`,
              opacity: interpolate(frame, [28, 40], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
            <div style={{ width: lineW / 2, height: 1.5, background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <WordStagger text="BOOK YOUR WEDDING" fontSize={62} delay={10} spacing="0.12em" />
          <div style={{ height: 6 }} />
          <WordStagger text="VENUE TODAY" fontSize={62} delay={20} spacing="0.12em" />

          <div style={{ height: 22 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{
              width: lineW / 2, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD})`,
              opacity: interpolate(frame, [32, 48], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: GOLD,
              opacity: interpolate(frame, [42, 54], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
            <div style={{
              width: lineW / 2, height: 1.5, background: `linear-gradient(90deg, ${GOLD}, transparent)`,
              opacity: interpolate(frame, [32, 48], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
          </div>

          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 46, color: GOLD,
            fontWeight: 300, letterSpacing: '0.08em',
            opacity: interpolate(frame, [40, 58], [0, 1], { extrapolateRight: 'clamp' }),
            textShadow: `0 0 20px ${GOLD}66`,
          }}>
            73385 01337
          </div>
          <div style={{ height: 10 }} />
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 24, color: 'rgba(255,255,255,0.45)',
            fontWeight: 300, letterSpacing: '0.05em',
            opacity: interpolate(frame, [56, 74], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </AbsoluteFill>
    </FadeEnvelope>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────
export const JKRReelV7: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts v7'));

  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Series>
        {SHOTS_V7.map((shot, i) =>
          shot.isCTA ? (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTASceneV7 img={shot.img} frames={shot.frames} />
            </Series.Sequence>
          ) : (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotSceneV7
                img={shot.img} tag={shot.tag}
                headline={shot.headline} sub={shot.sub}
                zoomIn={shot.zoomIn} frames={shot.frames}
              />
            </Series.Sequence>
          )
        )}
      </Series>

      {/* English voice over */}
      <Audio src={staticFile('voice/voice_v4.mp3')} volume={1} />
      {/* Background music — soft luxury ambience */}
      <Audio src={staticFile('voice/bg_music.mp3')} volume={0.14} />
    </AbsoluteFill>
  );
};
