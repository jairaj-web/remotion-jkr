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
const EMERALD = 'rgba(10, 40, 20, 0.72)';

// v6 uses: g02,g03,g05,g08,g11,g13,g10 — mostly fresh images
const SHOTS_V6 = [
  { img: 'g02_gallery1.webp',  tag: '01', headline: 'SIX ACRES',        sub: 'of pure luxury',            frames: 90,  zoomIn: true  },
  { img: 'g03_gallery3.webp',  tag: '02', headline: 'NORTH BANGALORE\'S', sub: 'most iconic venue',         frames: 84,  zoomIn: false },
  { img: 'g05_gallery5.webp',  tag: '03', headline: 'A THOUSAND GUESTS', sub: 'one perfect celebration',   frames: 90,  zoomIn: true  },
  { img: 'g08_gallery10.webp', tag: '04', headline: 'SACRED VOWS',       sub: 'blessed beginnings',        frames: 72,  zoomIn: false },
  { img: 'g11_photo.webp',     tag: '05', headline: 'EVERY DETAIL',      sub: 'crafted for you',           frames: 78,  zoomIn: true  },
  { img: 'g13_venue2.webp',    tag: '06', headline: 'JKR FARMS',         sub: '& Resorts',                 frames: 66,  zoomIn: false },
  { img: 'g10_events.webp',    tag: '07', headline: '',                  sub: '',                          frames: 147, zoomIn: true,  isCTA: true },
];

export const TOTAL_FRAMES_V6 = SHOTS_V6.reduce((a, s) => a + s.frames, 0); // 627

// ── Ken Burns ──────────────────────────────────────────────────────────────────
const KenBurns: React.FC<{ src: string; zoomIn: boolean; totalFrames: number }> = ({
  src, zoomIn, totalFrames,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, totalFrames], zoomIn ? [1, 1.16] : [1.16, 1], {
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

// ── Vertical gold bar ──────────────────────────────────────────────────────────
const VerticalBar: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const h = interpolate(frame - delay, [0, 30], [0, 220], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      width: 3, height: h,
      background: `linear-gradient(to bottom, transparent, ${GOLD}, ${GOLD}, transparent)`,
      boxShadow: `0 0 12px ${GOLD}88, 0 0 30px ${GOLD}33`,
      borderRadius: 2,
    }} />
  );
};

// ── Word stagger reveal (words slide up) ───────────────────────────────────────
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
      display: 'flex', flexWrap: 'wrap', gap: '0.25em',
      fontFamily: fontFamily ?? cinzel.fontFamily,
      fontSize, color, fontWeight: weight,
      letterSpacing: spacing, lineHeight: 1.15,
      overflow: 'hidden',
    }}>
      {words.map((word, i) => {
        const f = Math.max(0, frame - delay - i * 4);
        const p = spring({ frame: f, fps, config: { damping: 18, stiffness: 220, mass: 0.8 } });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px)`,
              opacity: interpolate(p, [0, 0.5, 1], [0, 0.8, 1]),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ── Shot number indicator ──────────────────────────────────────────────────────
const ShotTag: React.FC<{ tag: string }> = ({ tag }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [8, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', top: 88, right: 72,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
      opacity,
    }}>
      <div style={{
        fontFamily: raleway.fontFamily, fontSize: 22, color: GOLD,
        fontWeight: 300, letterSpacing: '0.22em',
      }}>
        {tag} / 07
      </div>
      <div style={{
        width: 38, height: 1.5,
        background: `linear-gradient(90deg, transparent, ${GOLD})`,
      }} />
    </div>
  );
};

// ── Top brand strip ────────────────────────────────────────────────────────────
const TopBrand: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 200,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, transparent 100%)',
      opacity,
    }}>
      <div style={{
        position: 'absolute', top: 78, left: 72,
        fontFamily: cinzel.fontFamily, fontSize: 24, color: GOLD,
        fontWeight: 700, letterSpacing: '0.20em',
      }}>
        JKR FARMS & RESORTS
      </div>
    </div>
  );
};

// ── Bottom info strip ──────────────────────────────────────────────────────────
const BottomStrip: React.FC<{ delay?: number }> = ({ delay = 40 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
      background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.65) 50%, transparent 100%)',
    }}>
      <div style={{
        position: 'absolute', bottom: 60, left: 72, right: 72,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        opacity,
      }}>
        <div style={{
          fontFamily: raleway.fontFamily, fontSize: 22, color: 'rgba(255,255,255,0.45)',
          fontWeight: 300, letterSpacing: '0.08em',
        }}>
          jkrfarmsandresorts.com
        </div>
        <div style={{
          fontFamily: raleway.fontFamily, fontSize: 22, color: 'rgba(255,255,255,0.45)',
          fontWeight: 300, letterSpacing: '0.06em',
        }}>
          73385 01337
        </div>
      </div>
    </div>
  );
};

// ── Left text block ────────────────────────────────────────────────────────────
const LeftTextBlock: React.FC<{ headline: string; sub: string }> = ({ headline, sub }) => {
  const frame = useCurrentFrame();
  const subOpacity = interpolate(frame - 28, [0, 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute', bottom: 220, left: 72, right: 72,
      display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 28,
    }}>
      {/* Vertical gold bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 6 }}>
        <VerticalBar delay={2} />
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          backgroundColor: GOLD,
          boxShadow: `0 0 10px ${GOLD}, 0 0 20px ${GOLD}88`,
          marginTop: 4,
          opacity: interpolate(frame - 25, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }} />
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <WordStagger
          text={headline}
          fontSize={headline.length > 12 ? 78 : 92}
          delay={6}
          color={WHITE}
        />
        <div style={{ opacity: subOpacity }}>
          <WordStagger
            text={sub}
            fontSize={42}
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

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotSceneV6: React.FC<{
  img: string; tag: string; headline: string; sub: string;
  zoomIn: boolean; frames: number;
}> = ({ img, tag, headline, sub, zoomIn, frames }) => (
  <FadeEnvelope totalFrames={frames}>
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <KenBurns src={img} zoomIn={zoomIn} totalFrames={frames} />
      {/* Emerald tint overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: EMERALD }} />
      <TopBrand />
      <ShotTag tag={tag} />
      <LeftTextBlock headline={headline} sub={sub} />
      <BottomStrip />
    </AbsoluteFill>
  </FadeEnvelope>
);

// ── CTA slide ──────────────────────────────────────────────────────────────────
const CTASceneV6: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 0.6 + 0.4 * Math.sin((frame / fps) * Math.PI * 1.4);
  const lineW = interpolate(frame, [10, 40], [0, 260], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const boxProgress = interpolate(frame, [5, 28], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <FadeEnvelope totalFrames={frames}>
      <AbsoluteFill style={{ backgroundColor: BLACK }}>
        <KenBurns src={img} zoomIn={false} totalFrames={frames} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.82)' }} />

        {/* Top brand */}
        <div style={{
          position: 'absolute', top: 88, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 28, color: GOLD, fontWeight: 700, letterSpacing: '0.18em' }}>
            JKR FARMS & RESORTS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 70, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
            <div style={{ width: 70, height: 1.5, background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>
        </div>

        {/* Center CTA box */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 900,
        }}>
          {/* Animated border box */}
          <div style={{
            position: 'absolute',
            width: 820 * boxProgress, height: 420 * boxProgress,
            border: `2px solid ${GOLD}`,
            opacity: 0.5 * pulse,
            borderRadius: 2,
            boxShadow: `0 0 24px ${GOLD}44, inset 0 0 24px ${GOLD}22`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />

          {/* Decorative horizontal lines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: lineW / 2, height: 1.5,
              background: `linear-gradient(90deg, transparent, ${GOLD})`,
            }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GOLD,
              boxShadow: `0 0 10px ${GOLD}`,
              opacity: interpolate(frame, [28, 40], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
            <div style={{
              width: lineW / 2, height: 1.5,
              background: `linear-gradient(90deg, ${GOLD}, transparent)`,
            }} />
          </div>

          <WordStagger text="BOOK YOUR WEDDING" fontSize={78} delay={10} spacing="0.10em" />
          <div style={{ height: 8 }} />
          <WordStagger text="VENUE TODAY" fontSize={78} delay={22} spacing="0.10em" />

          <div style={{ height: 28 }} />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: lineW / 2, height: 1.5,
              background: `linear-gradient(90deg, transparent, ${GOLD})`,
              opacity: interpolate(frame, [35, 50], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: GOLD,
              opacity: interpolate(frame, [45, 58], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
            <div style={{
              width: lineW / 2, height: 1.5,
              background: `linear-gradient(90deg, ${GOLD}, transparent)`,
              opacity: interpolate(frame, [35, 50], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
          </div>

          {/* Phone */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 52, color: GOLD,
            fontWeight: 300, letterSpacing: '0.08em',
            opacity: interpolate(frame, [42, 60], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            73385 01337
          </div>

          <div style={{ height: 12 }} />

          {/* Website */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 28, color: 'rgba(255,255,255,0.5)',
            fontWeight: 300, letterSpacing: '0.05em',
            opacity: interpolate(frame, [58, 76], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </AbsoluteFill>
    </FadeEnvelope>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────
export const JKRReelV6: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts v6'));

  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Series>
        {SHOTS_V6.map((shot, i) =>
          shot.isCTA ? (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTASceneV6 img={shot.img} frames={shot.frames} />
            </Series.Sequence>
          ) : (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotSceneV6
                img={shot.img} tag={shot.tag}
                headline={shot.headline} sub={shot.sub}
                zoomIn={shot.zoomIn} frames={shot.frames}
              />
            </Series.Sequence>
          )
        )}
      </Series>

      <Audio src={staticFile('voice/voice_v4.mp3')} />
    </AbsoluteFill>
  );
};
