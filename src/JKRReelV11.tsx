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

const GOLD   = '#F0C040';
const GOLD2  = '#C8960C';
const WHITE  = '#FFFFFF';
const NAVY   = '#080F1A';
const CHAMP  = '#F5E6C8';

// V11 — centered layout, Ken Burns, split-word reveal, frosted glass, progress bar
// 6 shots × 90f + CTA 210f = 750f = 25s @ 30fps
const SHOTS_V11 = [
  {
    img: 'v10_shot4_aerial.webp',
    tag: 'NORTH BANGALORE',
    words: ['Most', 'Breathtaking', 'Wedding', 'Destination'],
    frames: 90,
  },
  {
    img: 'w10_svl495.webp',
    tag: 'PREMIUM VENUE',
    words: ['Elegance', 'At', 'Every', 'Turn'],
    frames: 90,
  },
  {
    img: 'v10_shot3_ceremony.webp',
    tag: 'MAGICAL EVENINGS',
    words: ['Under', 'The', 'Open', 'Sky'],
    frames: 90,
  },
  {
    img: 'v10_shot6_dining.webp',
    tag: '1000+ GUESTS',
    words: ['One', 'Grand', 'Feast'],
    frames: 90,
  },
  {
    img: 'v10_shot1_rooftop.webp',
    tag: 'DIVINE BLESSINGS',
    words: ["Begin", "With", "Ganesha's", "Grace"],
    frames: 90,
  },
  {
    img: 'v10_shot5_entrance.webp',
    tag: 'YOUR FOREVER',
    words: ['Starts', 'Right', 'Here'],
    frames: 90,
  },
  {
    img: 'v10_shot5_entrance.webp',
    isCTA: true,
    frames: 210,
  },
];

export const TOTAL_FRAMES_V11 = SHOTS_V11.reduce((a, s) => a + s.frames, 0); // 750 = 25s

const CONTENT_SHOTS = SHOTS_V11.filter(s => !s.isCTA).length; // 6

// ── Ken Burns zoom ─────────────────────────────────────────────────────────────
const KenBurns: React.FC<{ src: string; totalFrames: number; direction?: 'in' | 'out' }> = ({
  src, totalFrames, direction = 'in',
}) => {
  const frame = useCurrentFrame();
  const scaleStart = direction === 'in' ? 1.0 : 1.08;
  const scaleEnd   = direction === 'in' ? 1.08 : 1.0;
  const scale = interpolate(frame, [0, totalFrames], [scaleStart, scaleEnd], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  return (
    <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'center center', overflow: 'hidden' }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

// ── Shimmer light sweep ────────────────────────────────────────────────────────
const Shimmer: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, totalFrames * 0.6], [-300, 1400], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const opacity = interpolate(frame, [0, 10, totalFrames * 0.5, totalFrames * 0.6], [0, 0.25, 0.18, 0], {
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: x, width: 200,
        background: `linear-gradient(90deg, transparent, rgba(255,255,220,${opacity}), transparent)`,
        transform: 'skewX(-20deg)',
      }} />
    </div>
  );
};

// ── Dark gradient overlay ─────────────────────────────────────────────────────
const Overlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(
      to bottom,
      rgba(8,15,26,0.55) 0%,
      rgba(8,15,26,0.10) 35%,
      rgba(8,15,26,0.10) 50%,
      rgba(8,15,26,0.80) 100%
    )`,
  }} />
);

// ── Fade envelope ─────────────────────────────────────────────────────────────
const FadeEnv: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 8, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ── Top progress bar ──────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ shotIndex: number; shotFrames: number }> = ({ shotIndex, shotFrames }) => {
  const frame = useCurrentFrame();
  const totalContentFrames = CONTENT_SHOTS * 90;
  const elapsedFrames = shotIndex * 90 + frame;
  const progress = elapsedFrames / totalContentFrames;
  const barW = interpolate(progress, [0, 1], [0, 1080], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 100 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(255,255,255,0.12)` }} />
      <div style={{
        height: '100%', width: barW,
        background: `linear-gradient(90deg, ${GOLD2}, ${GOLD}, #FFE580)`,
        boxShadow: `0 0 12px ${GOLD}99`,
      }} />
    </div>
  );
};

// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(frame, [0, 18], [-20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{
      position: 'absolute', top: 72, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      opacity, transform: `translateY(${y}px)`,
    }}>
      <Img
        src={staticFile('logo_sticky.webp')}
        style={{ width: 200, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 16px ${GOLD}99)` }}
      />
    </div>
  );
};

// ── Glowing tag pill ──────────────────────────────────────────────────────────
const TagPill: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 22, stiffness: 200, mass: 0.8 } });
  const scale = interpolate(p, [0, 1], [0.7, 1]);
  const opacity = interpolate(p, [0, 0.4, 1], [0, 1, 1]);
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.4);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transform: `scale(${scale})`, opacity,
    }}>
      <div style={{
        paddingLeft: 28, paddingRight: 28, paddingTop: 10, paddingBottom: 10,
        border: `1px solid ${GOLD}`,
        borderRadius: 100,
        background: `rgba(240,192,64,${0.08 + 0.06 * pulse})`,
        boxShadow: `0 0 ${18 + 8 * pulse}px ${GOLD}${Math.round(40 + 20 * pulse).toString(16)}`,
        fontFamily: raleway.fontFamily, fontSize: 20, fontWeight: 600,
        color: GOLD, letterSpacing: '0.25em', textTransform: 'uppercase' as const,
        whiteSpace: 'nowrap' as const,
      }}>
        {text}
      </div>
    </div>
  );
};

// ── Split-word headline ───────────────────────────────────────────────────────
const SplitHeadline: React.FC<{ words: string[]; baseDelay?: number }> = ({ words, baseDelay = 18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'center',
      gap: '0 18px',
    }}>
      {words.map((word, i) => {
        const delay = baseDelay + i * 8;
        const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 200, mass: 0.85 } });
        const y = interpolate(p, [0, 1], [50, 0]);
        const opacity = interpolate(p, [0, 0.3, 1], [0, 0.8, 1]);
        return (
          <div key={i} style={{
            fontFamily: cinzel.fontFamily, fontSize: 80, fontWeight: 700,
            color: WHITE, lineHeight: 1.1, letterSpacing: '0.04em',
            transform: `translateY(${y}px)`, opacity,
            textShadow: '0 4px 40px rgba(0,0,0,0.7)',
          }}>
            {word}
          </div>
        );
      })}
    </div>
  );
};

// ── Frosted glass card with draw-in border ────────────────────────────────────
const GlassCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 6 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Border draw animation (SVG rectangle path approach via clip)
  const borderProgress = interpolate(frame - delay, [0, 35], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  // We approximate border draw with 4 edges: top, right, bottom, left
  const topW   = interpolate(borderProgress, [0, 0.25], [0, 100], { extrapolateRight: 'clamp' });
  const rightH = interpolate(borderProgress, [0.25, 0.5], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const botW   = interpolate(borderProgress, [0.5, 0.75], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leftH  = interpolate(borderProgress, [0.75, 1.0], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'relative', opacity }}>
      {/* Glass background */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20,
        backdropFilter: 'blur(18px)',
        background: 'rgba(8,15,26,0.55)',
        border: '1px solid rgba(240,192,64,0.15)',
      }} />

      {/* Draw-in border edges */}
      {/* Top */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: 2, width: `${topW}%`, background: `linear-gradient(90deg, ${GOLD}, transparent)`, borderRadius: '2px 0 0 0', boxShadow: `0 0 8px ${GOLD}88` }} />
      {/* Right */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 2, height: `${rightH}%`, background: `linear-gradient(180deg, ${GOLD}, transparent)`, borderRadius: '0 2px 0 0', boxShadow: `0 0 8px ${GOLD}88` }} />
      {/* Bottom */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, height: 2, width: `${botW}%`, background: `linear-gradient(270deg, ${GOLD}, transparent)`, borderRadius: '0 0 2px 0', boxShadow: `0 0 8px ${GOLD}88` }} />
      {/* Left */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 2, height: `${leftH}%`, background: `linear-gradient(0deg, ${GOLD}, transparent)`, borderRadius: '0 0 0 2px', boxShadow: `0 0 8px ${GOLD}88` }} />

      {/* Content */}
      <div style={{ position: 'relative', padding: '40px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {children}
      </div>
    </div>
  );
};

// ── Gold divider line ─────────────────────────────────────────────────────────
const GoldLine: React.FC<{ delay?: number }> = ({ delay = 36 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 28], [0, 320], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      width: w, height: 1.5,
      background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
      boxShadow: `0 0 10px ${GOLD}88`,
    }} />
  );
};

// ── Bottom ticker ─────────────────────────────────────────────────────────────
const Ticker: React.FC = () => {
  const frame = useCurrentFrame();
  const TICKER = 'JKR FARMS & RESORTS  ·  NORTH BANGALORE  ·  6 ACRES  ·  1000+ GUESTS  ·  73385 01337  ·  jkrfarmsandresorts.com  ·  ';
  const speed = 1.4;
  const x = -(frame * speed) % (TICKER.length * 13.5);
  const opacity = interpolate(frame, [18, 32], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 64,
      background: 'rgba(8,15,26,0.75)',
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${GOLD}22`,
      overflow: 'hidden', display: 'flex', alignItems: 'center', opacity,
    }}>
      <div style={{
        whiteSpace: 'nowrap',
        transform: `translateX(${x}px)`,
        fontFamily: raleway.fontFamily, fontSize: 17, color: `${CHAMP}77`,
        letterSpacing: '0.18em', fontWeight: 300,
      }}>
        {TICKER.repeat(6)}
      </div>
    </div>
  );
};

// ── Regular shot ──────────────────────────────────────────────────────────────
const ShotV11: React.FC<{
  img: string; frames: number; tag: string; words: string[]; shotIndex: number;
}> = ({ img, frames, tag, words, shotIndex }) => (
  <FadeEnv total={frames}>
    <AbsoluteFill style={{ backgroundColor: NAVY, overflow: 'hidden' }}>
      <KenBurns src={img} totalFrames={frames} direction={shotIndex % 2 === 0 ? 'in' : 'out'} />
      <Overlay />
      <Shimmer totalFrames={frames} />
      <ProgressBar shotIndex={shotIndex} shotFrames={frames} />
      <Logo />

      {/* Centered content block */}
      <div style={{
        position: 'absolute',
        bottom: 100, left: 60, right: 60,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20,
      }}>
        <GlassCard delay={6}>
          <TagPill text={tag} />
          <SplitHeadline words={words} baseDelay={18} />
          <GoldLine delay={36} />
        </GlassCard>
      </div>

      <Ticker />
    </AbsoluteFill>
  </FadeEnv>
);

// ── CTA scene ─────────────────────────────────────────────────────────────────
const CTASceneV11: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blockP = spring({ frame, fps, config: { damping: 20, stiffness: 160, mass: 1 } });
  const blockY = interpolate(blockP, [0, 1], [70, 0]);

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.0);

  const lineW = interpolate(frame, [10, 45], [0, 700], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Phone digits reveal
  const phoneDigits = '73385 01337';
  const digitDelay = 50;
  const digitsShown = Math.floor(interpolate(frame, [digitDelay, digitDelay + phoneDigits.length * 4], [0, phoneDigits.length], { extrapolateRight: 'clamp' }));

  return (
    <FadeEnv total={frames}>
      <AbsoluteFill style={{ backgroundColor: NAVY }}>
        <KenBurns src={img} totalFrames={frames} direction="out" />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,15,26,0.85)' }} />

        {/* Logo */}
        <div style={{
          position: 'absolute', top: 88, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 20], [-20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          <Img src={staticFile('logo_sticky.webp')} style={{ width: 230, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 18px ${GOLD}aa)` }} />
        </div>

        {/* CTA card — centered */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -46%) translateY(${blockY}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 900,
        }}>
          {/* Outer glow box */}
          <div style={{
            position: 'absolute', width: 860, height: 460,
            border: `1px solid ${GOLD}`,
            borderRadius: 24,
            opacity: 0.20 + 0.15 * pulse,
            boxShadow: `0 0 80px ${GOLD}${Math.round(20 + 14 * pulse).toString(16)}, inset 0 0 80px ${GOLD}08`,
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            backdropFilter: 'blur(6px)',
            background: 'rgba(8,15,26,0.45)',
          }} />

          {/* Top gold line */}
          <div style={{ width: lineW, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: `0 0 12px ${GOLD}88`, marginBottom: 32 }} />

          {/* "Book Your" */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 30, color: GOLD,
            letterSpacing: '0.32em', fontWeight: 400, textTransform: 'uppercase' as const,
            opacity: interpolate(frame, [10, 26], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            Book Your
          </div>
          <div style={{ height: 8 }} />

          {/* DREAM WEDDING */}
          <div style={{
            fontFamily: cinzel.fontFamily, fontSize: 96, color: WHITE,
            fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1,
            textShadow: `0 0 60px ${GOLD}44, 0 4px 40px rgba(0,0,0,0.8)`,
            opacity: interpolate(frame, [16, 34], [0, 1], { extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(
              spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 18, stiffness: 180, mass: 0.9 } }),
              [0, 1], [36, 0]
            )}px)`,
          }}>
            DREAM WEDDING
          </div>

          <div style={{ height: 28 }} />

          {/* Bottom line */}
          <div style={{
            width: lineW * 0.55, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            boxShadow: `0 0 12px ${GOLD}88`,
            marginBottom: 28,
            opacity: interpolate(frame, [34, 50], [0, 1], { extrapolateRight: 'clamp' }),
          }} />

          {/* Phone — digits reveal */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 58, color: GOLD,
            fontWeight: 400, letterSpacing: '0.12em',
            textShadow: `0 0 32px ${GOLD}${Math.round(50 + 30 * pulse).toString(16)}`,
            minWidth: 520, textAlign: 'center' as const,
          }}>
            {phoneDigits.slice(0, digitsShown)}
            {digitsShown < phoneDigits.length && (
              <span style={{ opacity: Math.round(frame / 4) % 2 === 0 ? 1 : 0, color: GOLD }}>|</span>
            )}
          </div>
          <div style={{ height: 14 }} />

          {/* Website */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 26,
            color: `${CHAMP}55`, letterSpacing: '0.07em', fontWeight: 300,
            opacity: interpolate(frame, [digitDelay + 40, digitDelay + 58], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </AbsoluteFill>
    </FadeEnv>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────
export const JKRReelV11: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts v11'));

  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Series>
        {SHOTS_V11.map((shot, i) =>
          shot.isCTA ? (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTASceneV11 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          ) : (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV11
                img={shot.img!}
                frames={shot.frames}
                tag={shot.tag!}
                words={shot.words!}
                shotIndex={i}
              />
            </Series.Sequence>
          )
        )}
      </Series>

      <Audio src={staticFile('voice/voice_v11.mp3')} volume={1} />
      <Audio src={staticFile('voice/bg_music_v2.mp3')} volume={0.13} />
    </AbsoluteFill>
  );
};
