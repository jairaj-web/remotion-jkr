import React, { useEffect } from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, Series,
  interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
  continueRender, delayRender,
} from 'remotion';
import { loadFont as loadCinzel }  from '@remotion/google-fonts/Cinzel';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';

const cinzel  = loadCinzel('normal', { weights: ['700'] });
const raleway = loadRaleway('normal', { weights: ['300', '400', '600'] });

// V17 — "SOVEREIGN" — Deep plum + champagne gold + blush
// Fresh: slice reveal, typewriter text, corner brackets, radar rings, circular counter, diagonal duo
const PLUM   = '#170A2A';
const PLUM2  = '#2D1650';
const CHAMP  = '#D4AF37';
const CHAMP2 = '#F5D87A';
const BLUSH  = '#E8C4C0';
const WHITE  = '#FFFFFF';

// Hook:60 + 4 shots:240 + Counter:60 + DiagDuo:60 + Mosaic:60 + CTA:240 = 720f = 24s
const SHOTS_V17: Array<{
  isHook?: boolean; isCTA?: boolean; isCounter?: boolean;
  isDiagDuo?: boolean; isMosaic?: boolean;
  img?: string; imgL?: string; imgR?: string; images?: string[];
  tag?: string; line1?: string; line2?: string;
  frames: number; sectionIdx?: number;
}> = [
  { isHook: true,    img: 'w_cta_hero.webp',                                                              frames: 60, sectionIdx: 0 },
  { img: 'v9_aerial.webp',       tag:'01', line1:'Where Royalty',   line2:'Celebrates',                   frames: 60, sectionIdx: 1 },
  { img: 'svl_SVL06580.webp',    tag:'02', line1:'Timeless',         line2:'Elegance',                    frames: 60, sectionIdx: 2 },
  { img: 'v9_bedroom.webp',      tag:'03', line1:'Luxury',           line2:'Redefined',                   frames: 60, sectionIdx: 3 },
  { img: 'v10_shot6_dining.webp',tag:'04', line1:'Grandest',         line2:'Occasions',                   frames: 60, sectionIdx: 4 },
  { isCounter: true, img: 'v10_shot4_aerial.webp',                                                         frames: 60, sectionIdx: 5 },
  { isDiagDuo: true, imgL:'g10_events.webp',  imgR:'g11_photo.webp',                                      frames: 60, sectionIdx: 6 },
  { isMosaic: true,  images:['g03_gallery3.webp','g06_gallery8.webp','g07_gallery9.webp'],                 frames: 60, sectionIdx: 7 },
  { isCTA: true,     img: 'v12_aerial_exterior.webp',                                                                frames: 240 },
];

export const TOTAL_FRAMES_V17 = SHOTS_V17.reduce((a, s) => a + s.frames, 0); // 720

const TOTAL_DOTS = 8;

// ── Slice reveal transition — image enters through N horizontal strips ─────────
const SliceReveal: React.FC<{ src: string; totalFrames: number; slices?: number }> = ({ src, totalFrames, slices = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc  = interpolate(frame, [0, totalFrames], [1.12, 1.02], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const sat = interpolate(frame, [0, 20], [15, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {Array.from({ length: slices }).map((_, i) => {
        const sliceH = 1920 / slices;
        const delay  = i * 3;
        const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 24, stiffness: 190, mass: 0.9 } });
        const ty = interpolate(p, [0, 1], [-sliceH * 1.5, 0]);
        return (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * sliceH, height: sliceH, overflow: 'hidden', transform: `translateY(${ty}px)` }}>
            <div style={{ position: 'absolute', top: -i * sliceH, left: 0, right: 0, height: 1920 }}>
              <Img src={staticFile(`images/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${sc})`, filter: `saturate(${sat}%)` }} />
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${Math.max(0, interpolate(frame, [0, 18], [0.55, 0], { extrapolateRight: 'clamp' }))})` }} />
    </div>
  );
};

// ── Typewriter text ────────────────────────────────────────────────────────────
const TypeWriter: React.FC<{
  text: string; size: number; color?: string; delay?: number;
  speed?: number; weight?: number; spacing?: string; font?: 'cinzel' | 'raleway';
}> = ({ text, size, color = WHITE, delay = 0, speed = 2.5, weight = 700, spacing = '0.06em', font = 'cinzel' }) => {
  const frame = useCurrentFrame();
  const shown    = Math.floor(interpolate(Math.max(0, frame - delay), [0, text.length * speed], [0, text.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const showCursor = shown < text.length && Math.round(frame / 7) % 2 === 0;
  const op = interpolate(Math.max(0, frame - delay), [0, 5], [0, 1], { extrapolateRight: 'clamp' });
  const ff = font === 'cinzel' ? cinzel.fontFamily : raleway.fontFamily;
  return (
    <div style={{ fontFamily: ff, fontSize: size, fontWeight: weight as any, color, letterSpacing: spacing, textAlign: 'center' as const, textShadow: '0 3px 32px rgba(0,0,0,0.95)', opacity: op, lineHeight: 1.15 }}>
      {text.slice(0, shown)}{showCursor && <span style={{ color: CHAMP, opacity: 0.9 }}>|</span>}
    </div>
  );
};

// ── Animated corner brackets ───────────────────────────────────────────────────
const CornerBrackets: React.FC<{ delay?: number; size?: number; color?: string; thick?: number; margin?: number }> = ({ delay = 6, size = 55, color = CHAMP, thick = 2, margin = 40 }) => {
  const frame = useCurrentFrame();
  const len = interpolate(Math.max(0, frame - delay), [0, 18], [0, size], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op  = interpolate(Math.max(0, frame - delay), [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const glow = `0 0 8px ${color}88`;
  const b = `${thick}px solid ${color}`;
  return (
    <>
      {/* Top-left */}
      <div style={{ position: 'absolute', top: margin, left: margin, width: len, height: len, borderTop: b, borderLeft: b, opacity: op, boxShadow: glow }} />
      {/* Top-right */}
      <div style={{ position: 'absolute', top: margin, right: margin, width: len, height: len, borderTop: b, borderRight: b, opacity: op, boxShadow: glow }} />
      {/* Bottom-left */}
      <div style={{ position: 'absolute', bottom: 60, left: margin, width: len, height: len, borderBottom: b, borderLeft: b, opacity: op, boxShadow: glow }} />
      {/* Bottom-right */}
      <div style={{ position: 'absolute', bottom: 60, right: margin, width: len, height: len, borderBottom: b, borderRight: b, opacity: op, boxShadow: glow }} />
    </>
  );
};

// ── Radar pulse rings (hook) ───────────────────────────────────────────────────
const RadarRings: React.FC = () => {
  const frame = useCurrentFrame();
  const PERIOD = 80;
  const offsets = [0, 18, 36, 54];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
      {offsets.map((offset, i) => {
        const f = (frame + offset) % PERIOD;
        const r = interpolate(f, [0, PERIOD], [0, 680]);
        const op = interpolate(r, [0, 120, 500, 680], [0.7, 0.5, 0.12, 0]);
        return (
          <div key={i} style={{ position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%', border: `1.5px solid ${CHAMP}`, opacity: op, boxShadow: `0 0 16px ${CHAMP}33` }} />
        );
      })}
    </div>
  );
};

// ── Progress dots ──────────────────────────────────────────────────────────────
const ProgressDots: React.FC<{ active: number }> = ({ active }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [6, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 7, opacity: op, zIndex: 100 }}>
      {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
        <div key={i} style={{
          height: 3, borderRadius: 2,
          width: i === active ? 32 : 12,
          background: i === active ? CHAMP : `${WHITE}28`,
          boxShadow: i === active ? `0 0 8px ${CHAMP}BB` : 'none',
        }} />
      ))}
    </div>
  );
};

// ── Logo ───────────────────────────────────────────────────────────────────────
const LogoV17: React.FC<{ size?: number; delay?: number }> = ({ size = 130, delay = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16, stiffness: 200, mass: 0.85 } });
  const ty = interpolate(p, [0, 1], [-30, 0]);
  const op = interpolate(p, [0, 0.25, 1], [0, 1, 1]);
  return (
    <div style={{ position: 'absolute', top: 58, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${ty}px)`, opacity: op }}>
      <Img src={staticFile('logo_sticky.webp')} style={{ width: size, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 20px ${CHAMP}BB)` }} />
    </div>
  );
};

// ── Champagne rule ─────────────────────────────────────────────────────────────
const ChampRule: React.FC<{ delay?: number; width?: number }> = ({ delay = 4, width = 80 }) => {
  const frame = useCurrentFrame();
  const w  = interpolate(Math.max(0, frame - delay), [0, 20], [0, width], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = interpolate(Math.max(0, frame - delay), [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ height: 1.5, width: w, background: `linear-gradient(90deg, transparent, ${CHAMP}, ${CHAMP2}, ${CHAMP}, transparent)`, boxShadow: `0 0 10px ${CHAMP}99` }} />
    </div>
  );
};

// ── Ambient gold particles ─────────────────────────────────────────────────────
const PARTICLE_DATA = [
  {x:10, spd:0.9, sz:2.5, dl:0 }, {x:28, spd:1.1, sz:3.5, dl:6  },
  {x:52, spd:0.8, sz:2.5, dl:2 }, {x:74, spd:1.2, sz:3,   dl:15 },
  {x:88, spd:1.0, sz:2.5, dl:8 }, {x:96, spd:0.7, sz:2,   dl:22 },
];
const AmbientParticles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {PARTICLE_DATA.map((p, i) => {
        const f  = Math.max(0, frame - p.dl);
        const y  = (1920 + p.sz) - (f * p.spd * 2.6) % 1960;
        const dx = Math.sin(f * 0.035 + i * 1.8) * 14;
        const op = interpolate(f, [0, 14], [0, 0.55], { extrapolateRight: 'clamp' }) * (0.3 + 0.7 * Math.abs(Math.sin(f * 0.065 + i)));
        return (
          <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: y, transform: `translateX(${dx}px)`, width: p.sz, height: p.sz, borderRadius: '50%', backgroundColor: CHAMP, opacity: op, boxShadow: `0 0 ${p.sz * 5}px ${CHAMP2}` }} />
        );
      })}
    </div>
  );
};

// ── Ticker ─────────────────────────────────────────────────────────────────────
const TickerV17: React.FC = () => {
  const frame = useCurrentFrame();
  const T = 'JKR FARMS & RESORTS  ◆  NORTH BANGALORE  ◆  6 ACRES  ◆  1000+ GUESTS  ◆  73385 01337  ◆  jkrfarmsandresorts.com  ◆  ';
  const x  = -(frame * 1.5) % (T.length * 13.5);
  const op = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'rgba(23,10,42,0.92)', backdropFilter: 'blur(14px)', borderTop: `1px solid ${CHAMP}18`, overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: op }}>
      <div style={{ whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: raleway.fontFamily, fontSize: 13, color: `${CHAMP}45`, letterSpacing: '0.22em', fontWeight: 300 }}>{T.repeat(6)}</div>
    </div>
  );
};

// ── Dark center overlay for text readability ───────────────────────────────────
const CenterOverlay: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `linear-gradient(180deg,
      rgba(23,10,42,0.78) 0%,
      rgba(23,10,42,0.25) 20%,
      rgba(23,10,42,0.55) 40%,
      rgba(23,10,42,0.70) 60%,
      rgba(23,10,42,0.30) 80%,
      rgba(23,10,42,0.78) 100%)`,
  }} />
);

// ── Hook ───────────────────────────────────────────────────────────────────────
const HookV17: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const bgSc = interpolate(frame, [0, frames], [1.16, 1.04], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const logoP  = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 14, stiffness: 220, mass: 0.8 } });
  const logoSc = interpolate(logoP, [0, 1], [0.4, 1]);
  const logoOp = interpolate(logoP, [0, 0.3, 1], [0, 1, 1]);

  // SOVEREIGN letters drop in
  const letters = ['S','O','V','E','R','E','I','G','N'];

  const tagP  = spring({ frame: Math.max(0, frame - 32), fps, config: { damping: 16, stiffness: 230, mass: 0.7 } });
  const tagTy = interpolate(tagP, [0, 1], [24, 0]);
  const tagOp = interpolate(tagP, [0, 0.25, 1], [0, 1, 1]);

  const subOp = interpolate(frame, [38, 50], [0, 1], { extrapolateRight: 'clamp' });
  const ruleW = interpolate(frame, [20, 38], [0, 280], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: PLUM, opacity: fadeOut }}>
      {/* BG image very dark */}
      <div style={{ position: 'absolute', inset: 0, opacity: bgOp }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgSc})`, filter: 'blur(5px) brightness(0.10) saturate(15%)' }} />
      </div>

      {/* Radar rings from center */}
      <RadarRings />
      <AmbientParticles />

      <ProgressDots active={0} />

      {/* Center content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* Logo */}
        <div style={{ transform: `scale(${logoSc})`, opacity: logoOp, marginBottom: 12 }}>
          <Img src={staticFile('logo_sticky.webp')} style={{ width: 110, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 22px ${CHAMP}CC)` }} />
        </div>
        <div style={{ height: 90 }} />

        {/* J K R */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['J','K','R'].map((ch, i) => {
            const p  = spring({ frame: Math.max(0, frame - 8 - i * 7), fps, config: { damping: 8, stiffness: 450, mass: 0.45 } });
            const sc = interpolate(p, [0, 1], [0, 1]);
            const ty = interpolate(p, [0, 1], [-90, 0]);
            const op = interpolate(p, [0, 0.15, 1], [0, 1, 1]);
            return (
              <span key={i} style={{ display: 'inline-block', transform: `scale(${sc}) translateY(${ty}px)`, opacity: op, fontFamily: cinzel.fontFamily, fontSize: 152, fontWeight: 700, color: CHAMP, letterSpacing: '0.14em', lineHeight: 1, textShadow: `0 0 60px ${CHAMP}88, 0 8px 40px rgba(0,0,0,0.95)` }}>{ch}</span>
            );
          })}
        </div>

        {/* Gold rule */}
        <div style={{ width: ruleW, height: 1.5, background: `linear-gradient(90deg, transparent, ${CHAMP}, ${CHAMP2}, ${CHAMP}, transparent)`, boxShadow: `0 0 14px ${CHAMP}99`, marginTop: 6, marginBottom: 20 }} />

        {/* FARMS & RESORTS typewriter */}
        <div style={{ opacity: tagOp, transform: `translateY(${tagTy}px)`, fontFamily: raleway.fontFamily, fontSize: 28, fontWeight: 400, color: WHITE, letterSpacing: '0.40em', textTransform: 'uppercase' as const }}>
          Farms &amp; Resorts
        </div>

        {/* Location badge */}
        <div style={{ opacity: subOp, marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: BLUSH }} />
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 15, fontWeight: 300, color: `${BLUSH}CC`, letterSpacing: '0.32em' }}>NORTH BANGALORE</div>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: BLUSH }} />
        </div>
      </div>

      <TickerV17 />
    </AbsoluteFill>
  );
};

// ── Regular shot ───────────────────────────────────────────────────────────────
const ShotV17: React.FC<{
  img: string; frames: number; tag?: string;
  line1?: string; line2?: string; sectionIdx: number;
}> = ({ img, frames, tag, line1, line2, sectionIdx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Vertical side bar (left)
  const barH = interpolate(frame, [6, 28], [0, 520], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const barOp = interpolate(frame, [6, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: PLUM, opacity: fadeOut }}>
      <SliceReveal src={img} totalFrames={frames} />
      <CenterOverlay />
      <AmbientParticles />
      <ProgressDots active={sectionIdx} />
      <LogoV17 delay={5} />
      <CornerBrackets delay={8} size={52} color={CHAMP} />

      {/* Vertical accent line left */}
      <div style={{ position: 'absolute', left: 38, top: '50%', marginTop: -260, width: 1.5, height: barH, background: `linear-gradient(180deg, transparent, ${CHAMP}88, ${CHAMP}, ${CHAMP}88, transparent)`, opacity: barOp, boxShadow: `0 0 8px ${CHAMP}55` }} />

      {/* Shot tag — vertical on left bar */}
      {tag && (() => {
        const op = interpolate(frame - 12, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', opacity: op, fontFamily: raleway.fontFamily, fontSize: 12, color: `${CHAMP}CC`, letterSpacing: '0.30em', fontWeight: 600 }}>
            {tag} / 04
          </div>
        );
      })()}

      {/* Center text block */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', paddingLeft: 60, paddingRight: 60, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8 }}>
        <ChampRule delay={5} width={55} />
        <div style={{ height: 10 }} />
        <TypeWriter text={line1!} size={92} color={WHITE} delay={7} speed={2.2} spacing="0.05em" font="cinzel" />
        <TypeWriter text={line2!} size={92} color={CHAMP} delay={7 + line1!.length * 2.2} speed={2.2} spacing="0.05em" font="cinzel" />
        <div style={{ height: 10 }} />
        <ChampRule delay={10} width={55} />

        {/* Blush sub-label */}
        {(() => {
          const op = interpolate(frame - 20, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div style={{ marginTop: 12, opacity: op, fontFamily: raleway.fontFamily, fontSize: 16, color: `${BLUSH}BB`, letterSpacing: '0.28em', textTransform: 'uppercase' as const }}>
              JKR Farms &amp; Resorts
            </div>
          );
        })()}
      </div>

      <TickerV17 />
    </AbsoluteFill>
  );
};

// ── Counter — 3 circular SVG progress rings ────────────────────────────────────
const CounterV17: React.FC<{ img: string; frames: number; sectionIdx: number }> = ({ img, frames, sectionIdx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const R = 95;
  const circ = 2 * Math.PI * R;

  const stats = [
    { label: 'ACRES',       max: 6,    val: Math.min(6,    Math.floor(interpolate(frame, [8, 38], [0, 6],    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }))), color: CHAMP,  delay: 4  },
    { label: 'GUESTS',      max: 1000, val: Math.min(1000, Math.floor(interpolate(frame, [12, 42], [0, 1000],{ extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }))), color: WHITE,  delay: 10 },
    { label: 'EVENT HALLS', max: 15,   val: Math.min(15,   Math.floor(interpolate(frame, [16, 42], [0, 15],  { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }))), color: BLUSH,  delay: 16 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PLUM, opacity: fadeOut }}>
      <SliceReveal src={img} totalFrames={frames} slices={4} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,10,42,0.78)' }} />
      <AmbientParticles />
      <ProgressDots active={sectionIdx} />
      <LogoV17 delay={4} />
      <CornerBrackets delay={6} size={45} color={`${CHAMP}88`} />

      {/* Headline */}
      <div style={{ position: 'absolute', top: 220, left: 0, right: 0, textAlign: 'center' as const }}>
        <TypeWriter text="The Grand Scale" size={22} color={`${BLUSH}CC`} delay={4} speed={1.8} font="raleway" spacing="0.32em" />
      </div>

      {/* 3 ring circles */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-48%)', display: 'flex', justifyContent: 'center', gap: 28, paddingLeft: 20, paddingRight: 20 }}>
        {stats.map((s, i) => {
          const p  = spring({ frame: Math.max(0, frame - s.delay), fps, config: { damping: 16, stiffness: 230, mass: 0.8 } });
          const sc = interpolate(p, [0, 1], [0.3, 1]);
          const op = interpolate(p, [0, 0.3, 1], [0, 1, 1]);
          const progress = s.val / s.max;
          const offset   = circ * (1 - progress);
          const glow     = 0.5 + 0.5 * Math.sin(frame * 0.12 + i * 1.2);

          return (
            <div key={i} style={{ transform: `scale(${sc})`, opacity: op, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: R * 2 + 20, height: R * 2 + 20 }}>
                <svg width={R * 2 + 20} height={R * 2 + 20} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx={R + 10} cy={R + 10} r={R} fill="none" stroke={`${s.color}18`} strokeWidth={4} />
                  <circle cx={R + 10} cy={R + 10} r={R} fill="none" stroke={s.color} strokeWidth={4}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 ${5 + 4 * glow}px ${s.color})` }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: cinzel.fontFamily, fontSize: i === 1 ? 38 : 52, fontWeight: 700, color: s.color, lineHeight: 1, textShadow: `0 0 ${18 + 12 * glow}px ${s.color}88` }}>
                    {s.val}<span style={{ fontSize: i === 1 ? 20 : 26 }}>+</span>
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: raleway.fontFamily, fontSize: 13, color: `${WHITE}60`, letterSpacing: '0.24em', textTransform: 'uppercase' as const }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <TickerV17 />
    </AbsoluteFill>
  );
};

// ── Diagonal duo — 45° diagonal split ─────────────────────────────────────────
const DiagDuo: React.FC<{ imgL: string; imgR: string; frames: number; sectionIdx: number }> = ({ imgL, imgR, frames, sectionIdx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 22, stiffness: 180, mass: 1.1 } });
  const pct = interpolate(p, [0, 1], [0, 100]);

  const leftClip  = `polygon(0 0, ${pct * 0.62}% 0, ${pct * 0.42}% 100%, 0 100%)`;
  const rightClip = `polygon(${Math.min(pct * 0.62, 62)}% 0, 100% 0, 100% 100%, ${Math.min(pct * 0.42, 42)}% 100%)`;

  const textP  = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 16, stiffness: 240, mass: 0.75 } });
  const textTy = interpolate(textP, [0, 1], [32, 0]);
  const textOp = interpolate(textP, [0, 0.2, 1], [0, 1, 1]);

  // Diagonal line flash
  const lineOp = interpolate(frame, [12, 18, 24, 30], [0, 1, 1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: PLUM, opacity: fadeOut }}>
      {/* Left image with diagonal clip */}
      <div style={{ position: 'absolute', inset: 0, clipPath: leftClip }}>
        <Img src={staticFile(`images/${imgL}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72) saturate(115%)' }} />
      </div>
      {/* Right image with diagonal clip */}
      <div style={{ position: 'absolute', inset: 0, clipPath: rightClip }}>
        <Img src={staticFile(`images/${imgR}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72) saturate(115%)' }} />
      </div>

      {/* Diagonal gold flash line */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: lineOp }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '51%', width: 3, transform: 'skewX(-12deg)', background: `linear-gradient(180deg, transparent 5%, ${CHAMP}EE 30%, ${CHAMP2} 50%, ${CHAMP}EE 70%, transparent 95%)`, boxShadow: `0 0 20px ${CHAMP}, 0 0 40px ${CHAMP}66` }} />
      </div>

      {/* Overlay for text */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(23,10,42,0.88) 0%, rgba(23,10,42,0.55) 30%, transparent 55%, transparent 68%, rgba(23,10,42,0.82) 100%)`, pointerEvents: 'none' }} />

      <AmbientParticles />
      <ProgressDots active={sectionIdx} />
      <LogoV17 delay={5} />
      <CornerBrackets delay={10} size={48} color={`${CHAMP}AA`} />

      {/* Center text */}
      <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10, transform: `translateY(${textTy}px)`, opacity: textOp }}>
        <ChampRule delay={0} width={52} />
        <div style={{ fontFamily: cinzel.fontFamily, fontSize: 70, fontWeight: 700, color: WHITE, textAlign: 'center' as const, lineHeight: 1.2, textShadow: '0 4px 32px rgba(0,0,0,0.95)', letterSpacing: '0.04em' }}>
          Every Event<br/>Remembered
        </div>
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 18, color: `${BLUSH}CC`, letterSpacing: '0.30em', textTransform: 'uppercase' as const }}>Events · Photography</div>
        <ChampRule delay={0} width={52} />
      </div>

      {/* Bottom label pills */}
      <div style={{ position: 'absolute', bottom: 62, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingLeft: 52, paddingRight: 52, opacity: textOp }}>
        {['Grand Events', 'Fine Photography'].map((label, i) => (
          <div key={i} style={{ paddingLeft: 26, paddingRight: 26, paddingTop: 10, paddingBottom: 10, border: `1px solid ${CHAMP}44`, borderRadius: 30, background: 'rgba(23,10,42,0.78)', backdropFilter: 'blur(14px)', fontFamily: raleway.fontFamily, fontSize: 15, color: `${CHAMP}CC`, letterSpacing: '0.18em' }}>{label}</div>
        ))}
      </div>

      <TickerV17 />
    </AbsoluteFill>
  );
};

// ── Mosaic — 3 vertical panels that pop in ────────────────────────────────────
const MosaicV17: React.FC<{ images: string[]; frames: number; sectionIdx: number }> = ({ images, frames, sectionIdx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = interpolate(frame, [frames - 7, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const textP  = spring({ frame: Math.max(0, frame - 24), fps, config: { damping: 15, stiffness: 210, mass: 0.88 } });
  const textSc = interpolate(textP, [0, 1], [0.86, 1]);
  const textOp = interpolate(textP, [0, 0.3, 1], [0, 1, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: PLUM, opacity: fadeOut }}>
      {/* 3 vertical panels */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'row' as const, gap: 5 }}>
        {images.map((img, i) => {
          const delay = 3 + i * 7;
          const p  = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 220, mass: 0.85 } });
          const sc = interpolate(p, [0, 1], [1.18, 1.0]);
          const op = interpolate(p, [0, 0.35, 1], [0, 1, 1]);
          const ty = interpolate(p, [0, 1], [50, 0]);
          return (
            <div key={i} style={{ flex: 1, overflow: 'hidden', opacity: op, transform: `translateY(${ty}px) scale(${sc})` }}>
              <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.60) saturate(120%)' }} />
            </div>
          );
        })}
      </div>

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,10,42,0.48)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 68% 40% at 50% 54%, rgba(23,10,42,0.90) 0%, transparent 100%)', pointerEvents: 'none' }} />

      <AmbientParticles />
      <ProgressDots active={sectionIdx} />
      <LogoV17 delay={5} />

      {/* Center text */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: `translateY(-50%) scale(${textSc})`, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12, opacity: textOp }}>
        <ChampRule delay={0} width={68} />
        <TypeWriter text="Pure Paradise" size={90} color={WHITE} delay={26} speed={2} font="cinzel" spacing="0.05em" />
        <div style={{ height: 4 }} />
        <TypeWriter text="Since 1984" size={28} color={`${BLUSH}CC`} delay={40} speed={3} font="raleway" spacing="0.32em" weight={300} />
        <div style={{ height: 6 }} />
        <ChampRule delay={0} width={68} />

        {/* Badge row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {['Gallery', 'Events', 'Memories'].map((t, i) => {
            const bP  = spring({ frame: Math.max(0, frame - 30 - i * 5), fps, config: { damping: 16, stiffness: 300, mass: 0.55 } });
            const bSc = interpolate(bP, [0, 1], [0, 1]);
            const bOp = interpolate(bP, [0, 0.35, 1], [0, 1, 1]);
            return (
              <div key={i} style={{ transform: `scale(${bSc})`, opacity: bOp }}>
                <div style={{ paddingLeft: 22, paddingRight: 22, paddingTop: 9, paddingBottom: 9, border: `1px solid ${CHAMP}55`, borderRadius: 4, background: 'rgba(23,10,42,0.75)', backdropFilter: 'blur(14px)', fontFamily: raleway.fontFamily, fontSize: 14, color: CHAMP2, letterSpacing: '0.20em' }}>{t}</div>
              </div>
            );
          })}
        </div>
      </div>

      <TickerV17 />
    </AbsoluteFill>
  );
};

// ── CTA ────────────────────────────────────────────────────────────────────────
const CTAV17: React.FC<{ img: string; frames: number }> = ({ img, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgBrt = interpolate(frame, [0, 45], [0.08, 0.40], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const imgSat = interpolate(frame, [0, 45], [5, 55], { extrapolateRight: 'clamp' });

  // Crown icon bounce
  const crownP  = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 10, stiffness: 300, mass: 0.5 } });
  const crownSc = interpolate(crownP, [0, 1], [0, 1]);

  // Main headline
  const h1P  = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 16, stiffness: 230, mass: 0.75 } });
  const h1Ty = interpolate(h1P, [0, 1], [50, 0]);
  const h1Op = interpolate(h1P, [0, 0.2, 1], [0, 1, 1]);

  const h2P  = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 16, stiffness: 230, mass: 0.75 } });
  const h2Ty = interpolate(h2P, [0, 1], [50, 0]);
  const h2Op = interpolate(h2P, [0, 0.2, 1], [0, 1, 1]);

  const ruleW = interpolate(frame, [52, 82], [0, 840], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Phone
  const phone = '73385 01337';
  const shown = Math.floor(interpolate(frame, [88, 88 + phone.length * 4.5], [0, phone.length], { extrapolateRight: 'clamp' }));
  const cursor = shown < phone.length && Math.round(frame / 5) % 2 === 0;
  const phoneGlow = 0.5 + 0.5 * Math.sin(frame * 0.11);

  const webOp = interpolate(frame, [140, 158], [0, 1], { extrapolateRight: 'clamp' });

  const btnP  = spring({ frame: Math.max(0, frame - 162), fps, config: { damping: 13, stiffness: 210, mass: 0.9 } });
  const btnSc = interpolate(btnP, [0, 1], [0.55, 1]);
  const btnOp = interpolate(btnP, [0, 0.4, 1], [0, 1, 1]);
  const pulse  = 0.5 + 0.5 * Math.sin(frame * 0.10);

  const badgeOp = interpolate(frame, [180, 198], [0, 1], { extrapolateRight: 'clamp' });

  const fadeOut = interpolate(frame, [frames - 8, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* BG image */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Img src={staticFile(`images/${img}`)} style={{ width: '100%', height: '110%', objectFit: 'cover', filter: `blur(3px) brightness(${imgBrt}) saturate(${imgSat}%)` }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, rgba(23,10,42,0.75) 0%, rgba(23,10,42,0.40) 50%, rgba(23,10,42,0.82) 100%)` }} />

      <RadarRings />
      <AmbientParticles />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 58, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Img src={staticFile('logo_sticky.webp')} style={{ width: 190, height: 'auto', mixBlendMode: 'screen', filter: `drop-shadow(0 0 26px ${CHAMP}CC)` }} />
      </div>

      <CornerBrackets delay={6} size={58} color={`${CHAMP}88`} />

      {/* Main card */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -42%)', width: 940, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 56px 36px', background: 'rgba(23,10,42,0.65)', backdropFilter: 'blur(26px)', border: `1px solid ${CHAMP}20`, borderRadius: 18, boxShadow: `0 0 80px rgba(23,10,42,0.90), inset 0 1px 0 ${CHAMP}12` }}>

        {/* Crown icon */}
        <div style={{ fontSize: 38, transform: `scale(${crownSc})`, marginBottom: 12 }}>♛</div>

        {/* THE LEGACY */}
        <div style={{ overflow: 'hidden', width: '100%', textAlign: 'center' as const }}>
          <div style={{ fontFamily: raleway.fontFamily, fontSize: 24, fontWeight: 300, color: `${BLUSH}CC`, letterSpacing: '0.38em', textTransform: 'uppercase' as const, transform: `translateY(${h1Ty}px)`, opacity: h1Op }}>
            The Legacy
          </div>
        </div>

        {/* BEGINS WITH YOU */}
        <div style={{ overflow: 'hidden', width: '100%', marginTop: 4 }}>
          <div style={{ fontFamily: cinzel.fontFamily, fontSize: 98, fontWeight: 700, color: WHITE, letterSpacing: '0.04em', lineHeight: 1, textAlign: 'center' as const, textShadow: `0 0 50px ${CHAMP}22, 0 8px 40px rgba(0,0,0,0.9)`, transform: `translateY(${h2Ty}px)`, opacity: h2Op }}>
            BEGINS
          </div>
        </div>

        <div style={{ height: 22 }} />

        {/* Champagne rule */}
        <div style={{ width: ruleW, height: 1.5, background: `linear-gradient(90deg, transparent, ${CHAMP}, ${CHAMP2}, ${CHAMP}, transparent)`, boxShadow: `0 0 12px ${CHAMP}88` }} />

        <div style={{ height: 24 }} />

        {/* Phone typewriter */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 58, color: CHAMP, fontWeight: 400, letterSpacing: '0.16em', textShadow: `0 0 ${22 + 16 * phoneGlow}px ${CHAMP}${Math.round(55 + 50 * phoneGlow).toString(16)}`, minHeight: 76, textAlign: 'center' as const }}>
          {phone.slice(0, shown)}{cursor && <span style={{ color: BLUSH }}>|</span>}
        </div>

        {/* Website */}
        <div style={{ fontFamily: raleway.fontFamily, fontSize: 20, color: `${WHITE}35`, letterSpacing: '0.12em', fontWeight: 300, opacity: webOp, marginTop: 4 }}>
          jkrfarmsandresorts.com
        </div>

        <div style={{ height: 26 }} />

        {/* RESERVE NOW button */}
        <div style={{ transform: `scale(${btnSc})`, opacity: btnOp }}>
          <div style={{ paddingLeft: 80, paddingRight: 80, paddingTop: 22, paddingBottom: 22, border: `1.5px solid ${CHAMP}`, borderRadius: 6, background: `rgba(212,175,55,${0.10 + 0.08 * pulse})`, boxShadow: `0 0 ${22 + 14 * pulse}px ${CHAMP}${Math.round(28 + 22 * pulse).toString(16)}, inset 0 1px 0 ${CHAMP}20`, fontFamily: raleway.fontFamily, fontSize: 22, fontWeight: 600, color: WHITE, letterSpacing: '0.30em', textTransform: 'uppercase' as const }}>
            RESERVE NOW
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, opacity: badgeOp }}>
        {['6 Acres', '1000+ Guests', 'Est. 1984', 'North Bangalore'].map((t, i) => (
          <div key={i} style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 7, paddingBottom: 7, border: `1px solid ${BLUSH}33`, borderRadius: 30, background: 'rgba(23,10,42,0.65)', backdropFilter: 'blur(12px)', fontFamily: raleway.fontFamily, fontSize: 14, color: `${BLUSH}88`, letterSpacing: '0.14em', fontWeight: 300 }}>{t}</div>
        ))}
      </div>

      <TickerV17 />
    </AbsoluteFill>
  );
};

// ── Root ───────────────────────────────────────────────────────────────────────
export const JKRReelV17: React.FC = () => {
  const [handle] = React.useState(() => delayRender('fonts-v17'));
  useEffect(() => {
    Promise.all([cinzel.waitUntilDone(), raleway.waitUntilDone()]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: PLUM }}>
      <Series>
        {SHOTS_V17.map((shot, i) => {
          if (shot.isHook) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <HookV17 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCTA) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CTAV17 img={shot.img!} frames={shot.frames} />
            </Series.Sequence>
          );
          if (shot.isCounter) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <CounterV17 img={shot.img!} frames={shot.frames} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
          if (shot.isDiagDuo) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <DiagDuo imgL={shot.imgL!} imgR={shot.imgR!} frames={shot.frames} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
          if (shot.isMosaic) return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <MosaicV17 images={shot.images!} frames={shot.frames} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
          return (
            <Series.Sequence key={i} durationInFrames={shot.frames}>
              <ShotV17 img={shot.img!} frames={shot.frames} tag={shot.tag} line1={shot.line1} line2={shot.line2} sectionIdx={shot.sectionIdx!} />
            </Series.Sequence>
          );
        })}
      </Series>

      {/* Shots voice: covers 0–480f (8×60f shots section) */}
      <Sequence durationInFrames={480}>
        <Audio src={staticFile('voice/voice_v17_shots.mp3')} volume={1} />
      </Sequence>
      {/* CTA voice: from frame 480 */}
      <Sequence from={480}>
        <Audio src={staticFile('voice/voice_v17_cta.mp3')} volume={1} />
      </Sequence>
      {/* Rise of a Legend — epic choir orchestral */}
      <Audio src={staticFile('voice/bg_music_v6.mp3')} volume={0.20} />
    </AbsoluteFill>
  );
};
