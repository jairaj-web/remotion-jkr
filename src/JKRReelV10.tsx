import React, { useEffect } from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
  continueRender, delayRender,
} from 'remotion';
import { loadFont as loadCinzel }  from '@remotion/google-fonts/Cinzel';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';

const cinzel  = loadCinzel('normal',  { weights: ['700'] });
const raleway = loadRaleway('normal', { weights: ['300', '400', '600'] });

const NAVY    = '#0D1B2A';
const GOLD    = '#F0C040';
const CHAMP   = '#F5E6C8';
const WHITE   = '#FFFFFF';

// V10 — 6 new JKR images, left-aligned style, slide-up reveal, night/golden aesthetic
// 6 shots × 90f + CTA 210f = 750f = 25s
const SHOTS_V10 = [
  { img: 'v10_shot4_aerial.webp',   tag: 'NORTH BANGALORE',  headline: "Most Breathtaking\nWedding Destination", frames: 90 },
  { img: 'v10_shot2_bedroom.webp',  tag: 'PREMIUM VENUE',    headline: "Elegance at\nEvery Turn",               frames: 90 },
  { img: 'v10_shot3_ceremony.webp', tag: 'MAGICAL EVENINGS', headline: "Under the\nOpen Sky",                   frames: 90 },
  { img: 'v10_shot6_dining.webp',   tag: '1000+ GUESTS',     headline: "One Grand\nFeast",                      frames: 90 },
  { img: 'v10_shot1_rooftop.webp',  tag: 'DIVINE BLESSINGS', headline: "Begin with\nGanesha's Grace",           frames: 90 },
  { img: 'v10_shot5_entrance.webp', tag: 'YOUR FOREVER',     headline: "Starts Right\nHere",                    frames: 90 },
  { img: 'v10_shot5_entrance.webp', isCTA: true,                                                                 frames: 210 },
];

export const TOTAL_FRAMES_V10 = SHOTS_V10.reduce((a, s) => a + s.frames, 0); // 750 = 25s

// ── Slide-up image reveal ──────────────────────────────────────────────────────
const SlideReveal: React.FC<{ src: string; totalFrames: number }> = ({ src, totalFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 28, stiffness: 120, mass: 1.2 } });
  const y = interpolate(p, [0, 1], [120, 0]);
  const scale = interpolate(frame, [0, totalFrames], [1.10, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  return (
    <div style={{ width: '100%', height: '100%', transform: `translateY(${y}px) scale(${scale})`, transformOrigin: 'center bottom' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

// ── Fade envelope ──────────────────────────────────────────────────────────────
const FadeEnv: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 6, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ── Dark overlay — heavier at bottom for text contrast ────────────────────────
const Overlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'linear-gradient(160deg, rgba(13,27,42,0.70) 0%, rgba(13,27,42,0.10) 45%, rgba(13,27,42,0.75) 100%)',
  }} />
);

// ── Vertical gold accent bar (left side) ──────────────────────────────────────
const GoldBar: React.FC<{ delay?: number }> = ({ delay = 10 }) => {
  const frame = useCurrentFrame();
  const h = interpolate(frame - delay, [0, 30], [0, 180], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      width: 4, height: h,
      background: `linear-gradient(to bottom, ${GOLD}, ${GOLD}66)`,
      boxShadow: `0 0 18px ${GOLD}88`,
      borderRadius: 2,
    }} />
  );
};

// ── Tag label (small all-caps above headline) ─────────────────────────────────
const Tag: React.FC<{ text: string; delay?: number }> = ({ text, delay = 8 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x = interpolate(frame - delay, [0, 14], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{
      fontFamily: raleway.fontFamily, fontSize: 22, fontWeight: 600,
      color: GOLD, letterSpacing: '0.22em', textTransform: 'uppercase',
      opacity, transform: `translateX(${x}px)`,
    }}>
      {text}
    </div>
  );
};

// ── Main headline (left-aligned, slide from left) ─────────────────────────────
const Headline: React.FC<{ text: string; delay?: number }> = ({ text, delay = 16 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 180, mass: 0.9 } });
  const x = interpolate(p, [0, 1], [-60, 0]);
  const opacity = interpolate(p, [0, 0.3, 1], [0, 0.9, 1]);

  return (
    <div style={{
      fontFamily: cinzel.fontFamily, fontSize: 76, fontWeight: 700,
      color: WHITE, lineHeight: 1.12, letterSpacing: '0.04em',
      transform: `translateX(${x}px)`, opacity,
      whiteSpace: 'pre-line',
      textShadow: '0 4px 32px rgba(0,0,0,0.60)',
    }}>
      {text}
    </div>
  );
};

// ── Bottom gold line draw ──────────────────────────────────────────────────────
const BottomLine: React.FC<{ delay?: number }> = ({ delay = 28 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 30], [0, 500], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      height: 1.5, width: w,
      background: `linear-gradient(90deg, ${GOLD}, transparent)`,
      boxShadow: `0 0 12px ${GOLD}66`,
    }} />
  );
};

// ── Top logo ───────────────────────────────────────────────────────────────────
const TopLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(frame, [0, 20], [-28, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: 'absolute', top: 88, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity, transform: `translateY(${y}px)` }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: 220, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 14px ${GOLD}99)` }} />
    </div>
  );
};

// ── Scrolling bottom ticker ────────────────────────────────────────────────────
const Ticker: React.FC = () => {
  const frame = useCurrentFrame();
  const TICKER = 'JKR FARMS & RESORTS  ·  NORTH BANGALORE  ·  6 ACRES  ·  1000+ GUESTS  ·  73385 01337  ·  ';
  const speed  = 1.2; // px per frame
  const x = -(frame * speed) % (TICKER.length * 13.5);
  const opacity = interpolate(frame, [20, 36], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
      background: `linear-gradient(to top, rgba(0,0,0,0.88), transparent)`,
      overflow: 'hidden', display: 'flex', alignItems: 'center', opacity,
    }}>
      <div style={{
        whiteSpace: 'nowrap',
        transform: `translateX(${x}px)`,
        fontFamily: raleway.fontFamily, fontSize: 16, color: `${CHAMP}88`,
        letterSpacing: '0.16em', fontWeight: 300,
      }}>
        {TICKER.repeat(6)}
      </div>
    </div>
  );
};

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotV10: React.FC<{ img: string; frames: number; tag: string; headline: string }> = ({ img, frames, tag, headline }) => (
  <FadeEnv total={frames}>
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <SlideReveal src={img} totalFrames={frames} />
      <Overlay />
      <TopLogo />

      {/* Left-aligned content block */}
      <div style={{
        position: 'absolute',
        bottom: 140, left: 72,
        display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'flex-end',
      }}>
        {/* Vertical gold bar */}
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
          <GoldBar delay={8} />
        </div>

        {/* Text block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Tag text={tag} delay={8} />
          <Headline text={headline} delay={16} />
          <BottomLine delay={30} />
        </div>
      </div>

      <Ticker />
    </AbsoluteFill>
  </FadeEnv>
);

// ── CTA scene ──────────────────────────────────────────────────────────────────
const CTASceneV10: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blockY = interpolate(
    spring({ frame, fps, config: { damping: 22, stiffness: 140, mass: 1 } }),
    [0, 1], [80, 0],
  );

  const lineW = interpolate(frame, [12, 40], [0, 780], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 0.9);

  return (
    <FadeEnv total={frames}>
      <AbsoluteFill style={{ backgroundColor: NAVY }}>
        <SlideReveal src={img} totalFrames={frames} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(13,27,42,0.82)' }} />

        {/* Top logo */}
        <div style={{
          position: 'absolute', top: 88, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 20], [-28, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          <Img src={staticFile('logo_sticky.webp')} style={{ width: 240, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 16px ${GOLD}aa)` }} />
        </div>

        {/* CTA block — centered */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -44%) translateY(${blockY}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: 900,
        }}>
          {/* Animated border */}
          <div style={{
            position: 'absolute', width: 840, height: 420,
            border: `1px solid ${GOLD}`,
            opacity: 0.25 + 0.25 * pulse,
            boxShadow: `0 0 60px ${GOLD}18, inset 0 0 60px ${GOLD}08`,
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          }} />

          {/* Top gold line */}
          <div style={{ width: lineW, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, marginBottom: 28 }} />

          {/* Book your */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 32, color: GOLD,
            letterSpacing: '0.30em', fontWeight: 400, textTransform: 'uppercase',
            opacity: interpolate(frame, [8, 24], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            Book Your
          </div>
          <div style={{ height: 6 }} />

          {/* Dream Wedding */}
          <div style={{
            fontFamily: cinzel.fontFamily, fontSize: 88, color: WHITE,
            fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1,
            textShadow: `0 0 60px ${GOLD}33`,
            opacity: interpolate(frame, [14, 32], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(
              spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 18, stiffness: 160, mass: 0.9 } }),
              [0, 1], [30, 0]
            )}px)`,
          }}>
            TODAY
          </div>

          <div style={{ height: 28 }} />

          {/* Bottom gold line */}
          <div style={{
            width: lineW * 0.6, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            opacity: interpolate(frame, [32, 48], [0, 1], { extrapolateRight: 'clamp' }),
            marginBottom: 28,
          }} />

          {/* Phone */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 52, color: GOLD,
            fontWeight: 400, letterSpacing: '0.10em',
            textShadow: `0 0 28px ${GOLD}66`,
            opacity: interpolate(frame, [44, 62], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            73385 01337
          </div>
          <div style={{ height: 12 }} />

          {/* Website */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 26,
            color: `${CHAMP}66`, letterSpacing: '0.06em', fontWeight: 300,
            opacity: interpolate(frame, [58, 76], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </AbsoluteFill>
    </FadeEnv>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────
export const JKRReelV10: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts v10'));

  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Series>
        {SHOTS_V10.map((shot, i) =>
          shot.isCTA ? (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTASceneV10 img={shot.img} frames={shot.frames} />
            </Series.Sequence>
          ) : (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV10 img={shot.img} frames={shot.frames} tag={shot.tag!} headline={shot.headline!} />
            </Series.Sequence>
          )
        )}
      </Series>

      <Audio src={staticFile('voice/voice_v10.mp3')} volume={1} />
      <Audio src={staticFile('voice/bg_music_v2.mp3')} volume={0.14} />
    </AbsoluteFill>
  );
};
