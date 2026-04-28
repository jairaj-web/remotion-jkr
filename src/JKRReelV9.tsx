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
const raleway = loadRaleway('normal', { weights: ['300', '400', '600'] });

const AMBER  = '#E8A830';
const WHITE  = '#FFFFFF';
const BLACK  = '#0A0A0A';
const CREAM  = '#FFF6E0';

// V9 — 6 fresh user-provided professional photos, 25 seconds
// voice_v9.mp3 at rate=-12%: each content line = 3s (90f), CTA starts at 18s, audio ends at 22s
const SHOTS_V9 = [
  { img: 'v9_entrance.webp', headline: 'WAIT.',   sub: 'Have You Seen This Place?',        frames: 90 },
  { img: 'v9_aerial.webp',   stat: '6',  unit: 'ACRES', sub: 'North Bangalore',            frames: 90 },
  { img: 'v9_ceremony.webp', stat: '1000+', unit: 'GUESTS', sub: 'One Grand Celebration.', frames: 90 },
  { img: 'v9_pool.webp',     headline: 'ROOFTOP', sub: 'Pool & Temple',                    frames: 45 },
  { img: 'site_1-1-2.webp', headline: 'SACRED',  sub: 'A Dream Come True',                frames: 45 },
  { img: 'v9_bedroom.webp',  headline: 'LUXURY',  sub: 'Rooms Beyond Imagination',         frames: 90 },
  { img: 'v9_dining.webp',   headline: 'ROYAL',   sub: 'Feasts Crafted for You',           frames: 90 },
  { img: 'v9_ceremony.webp', isCTA: true,                                                   frames: 210 },
];

export const TOTAL_FRAMES_V9 = SHOTS_V9.reduce((a, s) => a + s.frames, 0); // 750 = 25s

// ── Ken Burns zoom (zoom in gently) ────────────────────────────────────────────
const ZoomIn: React.FC<{ src: string; totalFrames: number }> = ({ src, totalFrames }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, totalFrames], [1.12, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  return (
    <div style={{
      width: '100%', height: '100%',
      transform: `scale(${scale})`,
      transformOrigin: 'center',
    }}>
      <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

// ── Fade envelope ──────────────────────────────────────────────────────────────
const FadeEnv: React.FC<{ total: number; children: React.ReactNode }> = ({ total, children }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(
    interpolate(frame, [0, 7], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 7, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ── Gradient overlay (dark top/bottom, clear mid) ──────────────────────────────
const Overlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.18) 28%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.88) 100%)',
  }} />
);

// ── Vignette ───────────────────────────────────────────────────────────────────
const Vignette: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)',
  }} />
);

// ── Amber underline draw ───────────────────────────────────────────────────────
const UnderlineDraw: React.FC<{ delay?: number; width?: number }> = ({ delay = 0, width = 320 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 22], [0, width], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{
      height: 2, width: w,
      background: `linear-gradient(90deg, ${AMBER}, ${AMBER}88)`,
      boxShadow: `0 0 10px ${AMBER}99`,
    }} />
  );
};

// ── Pop-in text (spring scale + fade from bottom) ─────────────────────────────
const PopIn: React.FC<{
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
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 220, mass: 0.8 } });
  const scale = interpolate(p, [0, 1], [0.6, 1]);
  const y = interpolate(p, [0, 1], [40, 0]);
  const opacity = interpolate(p, [0, 0.25, 1], [0, 0.9, 1]);

  return (
    <div style={{
      fontFamily: fontFamily ?? cinzel.fontFamily,
      fontSize, color, fontWeight: weight,
      letterSpacing: spacing,
      transform: `scale(${scale}) translateY(${y}px)`,
      opacity,
      textAlign: 'center',
      lineHeight: 1.05,
    }}>
      {text}
    </div>
  );
};

// ── Big stat (number + label) ──────────────────────────────────────────────────
const BigStat: React.FC<{ stat: string; unit: string; delay?: number }> = ({ stat, unit, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 13, stiffness: 170, mass: 1.1 } });
  const scale = interpolate(p, [0, 1], [0.4, 1]);
  const opacity = interpolate(p, [0, 0.35, 1], [0, 0.95, 1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transform: `scale(${scale})`, opacity }}>
      <div style={{
        fontFamily: cinzel.fontFamily, fontSize: 168, color: AMBER,
        fontWeight: 700, lineHeight: 1,
        textShadow: `0 0 50px ${AMBER}55, 0 0 100px ${AMBER}22`,
        letterSpacing: '-0.02em',
      }}>
        {stat}
      </div>
      <div style={{
        fontFamily: cinzel.fontFamily, fontSize: 42, color: WHITE,
        fontWeight: 700, letterSpacing: '0.30em',
      }}>
        {unit}
      </div>
    </div>
  );
};

// ── Top logo ───────────────────────────────────────────────────────────────────
const TopLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(frame, [0, 18], [-24, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <div style={{
      position: 'absolute', top: 96, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      opacity, transform: `translateY(${y}px)`,
    }}>
      <Img
        src={staticFile('logo_sticky.webp')}
        style={{ width: 230, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 14px ${AMBER}99)` }}
      />
    </div>
  );
};

// ── Bottom brand strip ─────────────────────────────────────────────────────────
const BrandStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - 30, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
      background: `linear-gradient(to top, rgba(0,0,0,0.9), transparent)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 18, opacity,
    }}>
      <div style={{ width: 30, height: 1, backgroundColor: `${AMBER}88` }} />
      <div style={{
        fontFamily: raleway.fontFamily, fontSize: 15, color: `${CREAM}99`,
        letterSpacing: '0.22em', fontWeight: 600, textTransform: 'uppercase',
      }}>
        JKR Farms & Resorts
      </div>
      <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: AMBER, opacity: 0.7 }} />
      <div style={{
        fontFamily: raleway.fontFamily, fontSize: 15, color: `${CREAM}88`,
        letterSpacing: '0.16em', fontWeight: 300,
      }}>
        North Bangalore
      </div>
      <div style={{ width: 30, height: 1, backgroundColor: `${AMBER}88` }} />
    </div>
  );
};

// ── Center content block ───────────────────────────────────────────────────────
const CenterContent: React.FC<{
  stat?: string; unit?: string;
  headline?: string; sub?: string;
}> = ({ stat, unit, headline, sub }) => {
  const frame = useCurrentFrame();
  const subOpacity = interpolate(frame - 32, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', top: '50%', left: 0, right: 0,
      transform: 'translateY(-44%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      padding: '0 60px',
    }}>
      {stat ? (
        <BigStat stat={stat} unit={unit!} delay={6} />
      ) : (
        <PopIn
          text={headline!}
          fontSize={headline!.length <= 5 ? 124 : headline!.length <= 8 ? 96 : 80}
          delay={6}
          color={headline === 'WAIT.' ? AMBER : WHITE}
          spacing={headline === 'WAIT.' ? '0.08em' : '0.18em'}
        />
      )}

      <UnderlineDraw delay={20} width={Math.min(360, 60 * (sub?.length ?? 10))} />

      <div style={{ opacity: subOpacity }}>
        <PopIn
          text={sub!}
          fontSize={40}
          delay={0}
          color={CREAM}
          weight={300}
          fontFamily={raleway.fontFamily}
          spacing='0.04em'
        />
      </div>
    </div>
  );
};

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotV9: React.FC<{
  img: string; frames: number;
  stat?: string; unit?: string; headline?: string; sub?: string;
}> = ({ img, frames, stat, unit, headline, sub }) => (
  <FadeEnv total={frames}>
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <ZoomIn src={img} totalFrames={frames} />
      <Overlay />
      <Vignette />
      <TopLogo />
      <CenterContent stat={stat} unit={unit} headline={headline} sub={sub} />
      <BrandStrip />
    </AbsoluteFill>
  </FadeEnv>
);

// ── CTA scene ──────────────────────────────────────────────────────────────────
const CTAScene: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 1.0);
  const lineW = interpolate(frame, [10, 36], [0, 400], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const blockScale = interpolate(frame, [5, 26], [0.88, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.05)),
  });

  return (
    <FadeEnv total={frames}>
      <AbsoluteFill style={{ backgroundColor: BLACK }}>
        <ZoomIn src={img} totalFrames={frames} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.84)' }} />
        <Vignette />

        {/* Top logo */}
        <div style={{
          position: 'absolute', top: 96, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [0, 18], [-24, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          <Img
            src={staticFile('logo_sticky.webp')}
            style={{ width: 250, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 16px ${AMBER}aa)` }}
          />
        </div>

        {/* Center CTA block */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: `translate(-50%, -44%) scale(${blockScale})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 940,
        }}>
          {/* Glowing amber border box */}
          <div style={{
            position: 'absolute',
            width: 860, height: 430,
            border: `1.5px solid ${AMBER}`,
            opacity: 0.30 + 0.30 * pulse,
            boxShadow: `0 0 48px ${AMBER}22, inset 0 0 48px ${AMBER}0A`,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }} />

          <div style={{ width: lineW, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)`,
            marginBottom: 22,
          }} />

          <PopIn text="BOOK YOUR" fontSize={80} delay={8} spacing="0.14em" />
          <div style={{ height: 4 }} />
          <PopIn text="DREAM WEDDING" fontSize={64} delay={18} color={AMBER} spacing="0.10em" />

          <div style={{ height: 22 }} />

          <div style={{ width: lineW * 0.68, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)`,
            opacity: interpolate(frame, [30, 48], [0, 1], { extrapolateRight: 'clamp' }),
            marginBottom: 22,
          }} />

          {/* Phone */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 54, color: AMBER,
            fontWeight: 400, letterSpacing: '0.09em',
            textShadow: `0 0 24px ${AMBER}66`,
            opacity: interpolate(frame, [44, 62], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            73385 01337
          </div>
          <div style={{ height: 12 }} />
          {/* Website */}
          <div style={{
            fontFamily: raleway.fontFamily, fontSize: 27,
            color: 'rgba(255,255,255,0.50)', letterSpacing: '0.05em', fontWeight: 300,
            opacity: interpolate(frame, [60, 78], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            jkrfarmsandresorts.com
          </div>
        </div>
      </AbsoluteFill>
    </FadeEnv>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────
export const JKRReelV9: React.FC = () => {
  const [handle] = React.useState(() => delayRender('Loading fonts v9'));

  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()])
      .then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Series>
        {SHOTS_V9.map((shot, i) =>
          shot.isCTA ? (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAScene img={shot.img} frames={shot.frames} />
            </Series.Sequence>
          ) : (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV9
                img={shot.img}
                frames={shot.frames}
                stat={shot.stat}
                unit={shot.unit}
                headline={shot.headline}
                sub={shot.sub}
              />
            </Series.Sequence>
          )
        )}
      </Series>

      <Audio src={staticFile('voice/voice_v9.mp3')} volume={1} />
      <Audio src={staticFile('voice/bg_music_v2.mp3')} volume={0.15} />
    </AbsoluteFill>
  );
};
