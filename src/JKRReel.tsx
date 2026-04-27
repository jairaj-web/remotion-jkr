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

// ── Load fonts ────────────────────────────────────────────────────────────────
const cinzel  = loadCinzel('normal', { weights: ['700'] });
const raleway = loadRaleway('normal', { weights: ['300', '400'] });

// ── Brand ─────────────────────────────────────────────────────────────────────
const GOLD  = '#D4AF37';
const WHITE = '#FFFFFF';
const BLACK = '#000000';

// ── Shot config — ALL different images from v3/v4 ────────────────────────────
// v3 used: g14,g02,g07,g04,g08,g06,g10
// v4 used: g06,g02,g14,g04,g12,g08,g10
// v5 uses: g13,g07,g12,g04,g06,g14,g10  ← fresh sequence
const SHOTS = [
  { img: 'g13_venue2.webp',    lines: ['IMAGINE YOUR',       'MOST BEAUTIFUL DAY'],      frames: 90,  zoomIn: true  },
  { img: 'g07_gallery9.webp',  lines: ['A THOUSAND GUESTS.', 'ONE CELEBRATION.'],         frames: 84,  zoomIn: false },
  { img: 'g12_venue3.webp',    lines: ['LUXURY IN',          'EVERY CORNER.'],            frames: 96,  zoomIn: true  },
  { img: 'g04_gallery4.webp',  lines: ['SACRED.',            'BLESSED.'],                 frames: 66,  zoomIn: false },
  { img: 'g06_gallery8.webp',  lines: ['YOUR STAGE.',        'YOUR STORY.'],              frames: 75,  zoomIn: true  },
  { img: 'g14_venue1.webp',    lines: ['JKR FARMS',          '& RESORTS'],                frames: 66,  zoomIn: false },
  { img: 'g10_events.webp',    lines: ['BOOK YOUR WEDDING',  'VENUE TODAY'],              frames: 150, zoomIn: true,  isCTA: true },
];

export const TOTAL_FRAMES = SHOTS.reduce((a, s) => a + s.frames, 0); // 627 ≈ 20.9s

// ── Ken Burns ─────────────────────────────────────────────────────────────────
const KenBurns: React.FC<{ src: string; zoomIn: boolean; totalFrames: number }> = ({
  src, zoomIn, totalFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, totalFrames], zoomIn ? [1, 1.18] : [1.18, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

// ── Animated gold line (draws left → right) ───────────────────────────────────
const GoldLine: React.FC<{ totalWidth: number; delay?: number; thickness?: number }> = ({
  totalWidth, delay = 0, thickness = 2,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 22], [0, totalWidth], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      width: w, height: thickness,
      background: `linear-gradient(90deg, ${GOLD}, #FFF8DC, ${GOLD})`,
      boxShadow: `0 0 10px ${GOLD}99, 0 0 25px ${GOLD}44`,
      borderRadius: 1,
    }} />
  );
};

// ── Gold dot ─────────────────────────────────────────────────────────────────
const GoldDot: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      backgroundColor: GOLD,
      boxShadow: `0 0 8px ${GOLD}, 0 0 16px ${GOLD}88`,
      opacity,
    }} />
  );
};

// ── Letter drop (blur → sharp, fall from top) ─────────────────────────────────
const LetterDrop: React.FC<{
  text: string;
  fontSize: number;
  delay?: number;
  color?: string;
  spacing?: string;
}> = ({ text, fontSize, delay = 0, color = WHITE, spacing = '0.10em' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
      fontFamily: cinzel.fontFamily,
      fontSize, color, fontWeight: 700,
      letterSpacing: spacing, lineHeight: 1.1,
    }}>
      {text.split('').map((char, i) => {
        const f = Math.max(0, frame - delay - i * 1.8);
        const p = spring({ frame: f, fps, config: { damping: 16, stiffness: 200, mass: 0.9 } });
        return (
          <span key={i} style={{
            display: 'inline-block',
            transform: `translateY(${interpolate(p, [0, 1], [-55, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
            opacity: interpolate(p, [0, 0.4, 1], [0, 0.7, 1]),
            filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`,
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}>
            {char === ' ' ? ' ' : char}
          </span>
        );
      })}
    </div>
  );
};

// ── Bottom gradient ───────────────────────────────────────────────────────────
const BottomGrad: React.FC = () => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)',
  }} />
);

// ── Top gradient (logo area) ──────────────────────────────────────────────────
const TopGrad: React.FC = () => (
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, height: 260,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, transparent 100%)',
  }} />
);

// ── Logo bar (top) ────────────────────────────────────────────────────────────
const LogoBar: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', top: 72, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      opacity,
    }}>
      <div style={{
        fontFamily: cinzel.fontFamily, fontSize: 28, color: GOLD,
        fontWeight: 700, letterSpacing: '0.18em',
      }}>
        JKR FARMS & RESORTS
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <GoldLine totalWidth={100} delay={10} />
        <GoldDot delay={20} />
        <GoldLine totalWidth={100} delay={10} />
      </div>
    </div>
  );
};

// ── Text block (bottom) ───────────────────────────────────────────────────────
const TextBlock: React.FC<{ lines: string[] }> = ({ lines }) => (
  <div style={{
    position: 'absolute', bottom: 200, left: 0, right: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    padding: '0 50px',
  }}>
    {/* Top line with dot */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <GoldLine totalWidth={130} delay={2} />
      <GoldDot delay={14} />
      <GoldLine totalWidth={130} delay={2} />
    </div>

    <div style={{ height: 14 }} />

    {lines.map((line, i) => (
      <LetterDrop
        key={i}
        text={line}
        fontSize={line.length > 14 ? 84 : 96}
        delay={8 + i * 14}
      />
    ))}

    <div style={{ height: 14 }} />

    {/* Bottom line with dot */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <GoldLine totalWidth={130} delay={22} />
      <GoldDot delay={34} />
      <GoldLine totalWidth={130} delay={22} />
    </div>
  </div>
);

// ── Fade envelope (fade-in + fade-out per shot) ───────────────────────────────
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

// ── Regular shot ──────────────────────────────────────────────────────────────
const ShotScene: React.FC<{ img: string; lines: string[]; zoomIn: boolean; frames: number }> = ({
  img, lines, zoomIn, frames,
}) => (
  <FadeEnvelope totalFrames={frames}>
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <KenBurns src={img} zoomIn={zoomIn} totalFrames={frames} />
      <BottomGrad />
      <TopGrad />
      <LogoBar />
      <TextBlock lines={lines} />
    </AbsoluteFill>
  </FadeEnvelope>
);

// ── CTA slide ─────────────────────────────────────────────────────────────────
const CTAScene: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cornerProgress = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  const pulse = 0.75 + 0.25 * Math.sin((frame / fps) * Math.PI * 1.5);

  const corners = [
    { top: 280, left: 70, borderTop: 3, borderLeft: 3, borderBottom: 0, borderRight: 0 },
    { top: 280, right: 70, borderTop: 3, borderRight: 3, borderBottom: 0, borderLeft: 0 },
    { bottom: 190, left: 70, borderBottom: 3, borderLeft: 3, borderTop: 0, borderRight: 0 },
    { bottom: 190, right: 70, borderBottom: 3, borderRight: 3, borderTop: 0, borderLeft: 0 },
  ];

  return (
    <FadeEnvelope totalFrames={frames}>
      <AbsoluteFill style={{ backgroundColor: BLACK }}>
        <KenBurns src={img} zoomIn={false} totalFrames={frames} />

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.78)' }} />
        <TopGrad />

        {/* Logo */}
        <div style={{
          position: 'absolute', top: 80, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 30, color: GOLD, fontWeight: 700, letterSpacing: '0.18em' }}>
            JKR FARMS & RESORTS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <GoldLine totalWidth={120} delay={10} />
            <GoldDot delay={22} />
            <GoldLine totalWidth={120} delay={10} />
          </div>
        </div>

        {/* Animated corner brackets */}
        {corners.map((style, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 65 * cornerProgress,
            height: 65 * cornerProgress,
            borderColor: GOLD,
            borderStyle: 'solid',
            ...style,
            boxShadow: `0 0 14px ${GOLD}${Math.round(pulse * 180).toString(16)}`,
          }} />
        ))}

        {/* CTA text block */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          padding: '0 70px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <GoldLine totalWidth={140} delay={5} thickness={2} />
            <GoldDot delay={18} />
            <GoldLine totalWidth={140} delay={5} thickness={2} />
          </div>

          <div style={{ height: 8 }} />
          <LetterDrop text="BOOK YOUR WEDDING" fontSize={80} delay={8} spacing="0.08em" />
          <LetterDrop text="VENUE TODAY"        fontSize={80} delay={22} spacing="0.08em" />
          <div style={{ height: 8 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <GoldLine totalWidth={140} delay={30} thickness={2} />
            <GoldDot delay={42} />
            <GoldLine totalWidth={140} delay={30} thickness={2} />
          </div>

          <div style={{ height: 24 }} />

          {/* Phone */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 46, color: GOLD,
            fontWeight: 300, letterSpacing: '0.06em',
            opacity: interpolate(frame, [40, 58], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            73385 01337
          </div>

          {/* Website */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 30, color: 'rgba(255,255,255,0.6)',
            fontWeight: 300, letterSpacing: '0.04em',
            opacity: interpolate(frame, [55, 72], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </AbsoluteFill>
    </FadeEnvelope>
  );
};

// ── Root composition ──────────────────────────────────────────────────────────
export const JKRReel: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts'));

  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Series>
        {SHOTS.map((shot, i) =>
          shot.isCTA ? (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAScene img={shot.img} frames={shot.frames} />
            </Series.Sequence>
          ) : (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotScene img={shot.img} lines={shot.lines} zoomIn={shot.zoomIn} frames={shot.frames} />
            </Series.Sequence>
          )
        )}
      </Series>

      {/* Voice over */}
      <Audio src={staticFile('voice/voice_v4.mp3')} />
    </AbsoluteFill>
  );
};
