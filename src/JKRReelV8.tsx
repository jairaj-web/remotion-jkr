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

const GOLD   = '#D4AF37';
const WHITE  = '#FFFFFF';
const BLACK  = '#000000';
const CREAM  = '#FFF8E7';

// v8 — all fresh images from jkrfarmsandresorts.com (August 2025 professional shoot)
// Matched to voice_v4.mp3: "Imagine.." / "Six acres.." / "A thousand guests.." /
//   "Sacred blessings.." / "Every detail.." / "This is JKR.." / "Book your.."
const SHOTS_V8 = [
  { img: 'svl_SVL06580.webp',   stat: null,   unit: 'IMAGINE YOUR',  sub: 'Most Beautiful Day',    frames: 90,  panDir:  1 },
  { img: 'svl_SVL06560.webp',   stat: '6',    unit: 'ACRES',         sub: 'North Bangalore',       frames: 84,  panDir: -1 },
  { img: 'site_Dining-Hall-1.webp', stat: '1000+', unit: 'GUESTS',   sub: 'One Celebration',       frames: 90,  panDir:  1 },
  { img: 'site_1-1-2.webp',     stat: null,   unit: 'SACRED',        sub: 'Blessed On-Site',       frames: 72,  panDir: -1 },
  { img: 'site_Dining-Hall-2.webp', stat: null, unit: 'EVERY DETAIL',sub: 'Crafted Just For You',  frames: 78,  panDir:  1 },
  { img: 'svl_SVL06860.webp',   stat: null,   unit: 'JKR FARMS',     sub: '& Resorts',             frames: 66,  panDir: -1 },
  { img: 'site_Dining-Hall-3.webp', stat: null, unit: '',            sub: '',                      frames: 147, panDir:  1, isCTA: true },
];

export const TOTAL_FRAMES_V8 = SHOTS_V8.reduce((a, s) => a + s.frames, 0);

// ── Horizontal pan (cinematic drift) ──────────────────────────────────────────
const HorizPan: React.FC<{ src: string; panDir: number; totalFrames: number }> = ({
  src, panDir, totalFrames,
}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, totalFrames], [panDir * -3, panDir * 3], {
    extrapolateRight: 'clamp',
  });
  const scale = 1.08;
  return (
    <div style={{
      width: '100%', height: '100%',
      transform: `scale(${scale}) translateX(${x}%)`,
      transformOrigin: 'center',
    }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

// ── Letterbox bars (cinematic crop) ───────────────────────────────────────────
const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  const barH = interpolate(frame, [0, 14], [0, 90], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barH, backgroundColor: BLACK }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barH, backgroundColor: BLACK }} />
    </>
  );
};

// ── Fade envelope ──────────────────────────────────────────────────────────────
const FadeEnvelope: React.FC<{ totalFrames: number; children: React.ReactNode }> = ({
  totalFrames, children,
}) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ── Vignette ───────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)',
  }} />
);

// ── Center overlay gradient ────────────────────────────────────────────────────
const CenterOverlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.85) 100%)',
  }} />
);

// ── Full-width gold sweep line ─────────────────────────────────────────────────
const SweepLine: React.FC<{ delay?: number; fromRight?: boolean }> = ({ delay = 0, fromRight = false }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 20], [0, 960], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      width: w, height: 1.5,
      background: fromRight
        ? `linear-gradient(90deg, ${GOLD}, ${GOLD}88, transparent)`
        : `linear-gradient(90deg, transparent, ${GOLD}88, ${GOLD})`,
      boxShadow: `0 0 8px ${GOLD}66`,
      alignSelf: fromRight ? 'flex-end' : 'flex-start',
    }} />
  );
};

// ── Split-word text reveal ─────────────────────────────────────────────────────
const SplitReveal: React.FC<{
  text: string;
  fontSize: number;
  delay?: number;
  fromLeft?: boolean;
  color?: string;
  weight?: number;
  fontFamily?: string;
  spacing?: string;
}> = ({ text, fontSize, delay = 0, fromLeft = true, color = WHITE, weight = 700, fontFamily, spacing = '0.15em' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 200, mass: 0.9 } });
  const x = interpolate(p, [0, 1], [fromLeft ? -80 : 80, 0]);
  const blur = interpolate(p, [0, 1], [6, 0]);

  return (
    <div style={{
      fontFamily: fontFamily ?? cinzel.fontFamily,
      fontSize, color, fontWeight: weight,
      letterSpacing: spacing,
      transform: `translateX(${x}px)`,
      filter: `blur(${blur}px)`,
      opacity: interpolate(p, [0, 0.3, 1], [0, 0.8, 1]),
      textAlign: 'center',
      lineHeight: 1.1,
    }}>
      {text}
    </div>
  );
};

// ── Stat counter (large number) ────────────────────────────────────────────────
const StatCounter: React.FC<{ stat: string; unit: string; delay?: number }> = ({ stat, unit, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 180, mass: 1.0 } });
  const scale = interpolate(p, [0, 1], [0.5, 1]);
  const opacity = interpolate(p, [0, 0.4, 1], [0, 0.9, 1]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      transform: `scale(${scale})`, opacity,
    }}>
      <div style={{
        fontFamily: cinzel.fontFamily, fontSize: 160, color: GOLD,
        fontWeight: 700, lineHeight: 1,
        textShadow: `0 0 40px ${GOLD}66, 0 0 80px ${GOLD}33`,
        letterSpacing: '-0.02em',
      }}>
        {stat}
      </div>
      <div style={{
        fontFamily: cinzel.fontFamily, fontSize: 44, color: WHITE,
        fontWeight: 700, letterSpacing: '0.28em',
      }}>
        {unit}
      </div>
    </div>
  );
};

// ── Top logo ───────────────────────────────────────────────────────────────────
const TopLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(frame, [0, 20], [-20, 0], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      position: 'absolute', top: 100, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      opacity, transform: `translateY(${y}px)`,
    }}>
      <Img
        src={staticFile('logo_sticky.webp')}
        style={{
          width: 240, height: 'auto',
          mixBlendMode: 'screen',
          filter: `drop-shadow(0 0 12px ${GOLD}88)`,
        }}
      />
    </div>
  );
};

// ── Center text block ──────────────────────────────────────────────────────────
const CenterBlock: React.FC<{
  stat: string | null; unit: string; sub: string;
}> = ({ stat, unit, sub }) => {
  const frame = useCurrentFrame();
  const subOpacity = interpolate(frame - 28, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute', top: '50%', left: 0, right: 0,
      transform: 'translateY(-48%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      padding: '0 60px',
    }}>
      <SweepLine delay={4} />

      <div style={{ height: 8 }} />

      {stat ? (
        <StatCounter stat={stat} unit={unit} delay={8} />
      ) : (
        <SplitReveal
          text={unit}
          fontSize={unit.length > 8 ? 80 : 100}
          delay={8}
          fromLeft
          spacing="0.18em"
        />
      )}

      <div style={{ height: 4 }} />

      <div style={{ opacity: subOpacity }}>
        <SplitReveal
          text={sub}
          fontSize={38}
          delay={0}
          fromLeft={false}
          color={GOLD}
          weight={300}
          fontFamily={raleway.fontFamily}
          spacing="0.06em"
        />
      </div>

      <div style={{ height: 8 }} />
      <SweepLine delay={24} fromRight />
    </div>
  );
};

// ── Bottom contact strip ───────────────────────────────────────────────────────
const BottomContact: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - 35, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      position: 'absolute', bottom: 100, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
      opacity,
    }}>
      <div style={{
        fontFamily: raleway.fontFamily, fontSize: 18,
        color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', fontWeight: 300,
      }}>
        jkrfarmsandresorts.com
      </div>
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: GOLD, opacity: 0.5 }} />
      <div style={{
        fontFamily: raleway.fontFamily, fontSize: 18,
        color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', fontWeight: 300,
      }}>
        73385 01337
      </div>
    </div>
  );
};

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotSceneV8: React.FC<{
  img: string; stat: string | null; unit: string; sub: string;
  panDir: number; frames: number;
}> = ({ img, stat, unit, sub, panDir, frames }) => (
  <FadeEnvelope totalFrames={frames}>
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <HorizPan src={img} panDir={panDir} totalFrames={frames} />
      <CenterOverlay />
      <Vignette />
      <TopLogo />
      <CenterBlock stat={stat} unit={unit} sub={sub} />
      <BottomContact />
      <Letterbox />
    </AbsoluteFill>
  </FadeEnvelope>
);

// ── CTA scene ─────────────────────────────────────────────────────────────────
const CTASceneV8: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.2);
  const lineW = interpolate(frame, [10, 38], [0, 420], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const blockScale = interpolate(frame, [6, 28], [0.85, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.1)),
  });

  return (
    <FadeEnvelope totalFrames={frames}>
      <AbsoluteFill style={{ backgroundColor: BLACK }}>
        <HorizPan src={img} panDir={1} totalFrames={frames} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.82)' }} />
        <Vignette />
        <Letterbox />

        {/* Top logo */}
        <div style={{
          position: 'absolute', top: 100, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 20], [-20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          <Img
            src={staticFile('logo_sticky.webp')}
            style={{ width: 260, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 14px ${GOLD}99)` }}
          />
        </div>

        {/* CTA center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -45%) scale(${blockScale})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 960,
        }}>
          {/* Outer glow box */}
          <div style={{
            position: 'absolute',
            width: 880, height: 460,
            border: `1.5px solid ${GOLD}`,
            opacity: 0.35 + 0.35 * pulse,
            boxShadow: `0 0 40px ${GOLD}33, inset 0 0 40px ${GOLD}11`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />

          {/* Horizontal gold lines */}
          <div style={{ width: lineW, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            marginBottom: 24,
          }} />

          <SplitReveal text="BOOK YOUR" fontSize={76} delay={8} fromLeft spacing="0.14em" />
          <div style={{ height: 4 }} />
          <SplitReveal text="DREAM WEDDING" fontSize={62} delay={18} fromLeft={false} spacing="0.10em" />

          <div style={{ height: 20 }} />

          <div style={{ width: lineW * 0.7, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            opacity: interpolate(frame, [32, 50], [0, 1], { extrapolateRight: 'clamp' }),
            marginBottom: 20,
          }} />

          {/* Phone */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 52, color: GOLD,
            fontWeight: 300, letterSpacing: '0.08em',
            textShadow: `0 0 20px ${GOLD}66`,
            opacity: interpolate(frame, [42, 60], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            73385 01337
          </div>
          <div style={{ height: 10 }} />
          {/* Website */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 26,
            color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', fontWeight: 300,
            opacity: interpolate(frame, [58, 75], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </AbsoluteFill>
    </FadeEnvelope>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────
export const JKRReelV8: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts v8'));

  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Series>
        {SHOTS_V8.map((shot, i) =>
          shot.isCTA ? (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTASceneV8 img={shot.img} frames={shot.frames} />
            </Series.Sequence>
          ) : (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotSceneV8
                img={shot.img} stat={shot.stat ?? null}
                unit={shot.unit} sub={shot.sub}
                panDir={shot.panDir} frames={shot.frames}
              />
            </Series.Sequence>
          )
        )}
      </Series>

      <Audio src={staticFile('voice/voice_v4.mp3')} volume={1} />
      <Audio src={staticFile('voice/bg_music.mp3')} volume={0.14} />
    </AbsoluteFill>
  );
};
