import React from 'react';
import { Composition } from 'remotion';
import { JKRReel, TOTAL_FRAMES } from './JKRReel';
import { JKRReelV6, TOTAL_FRAMES_V6 } from './JKRReelV6';
import { JKRReelV7, TOTAL_FRAMES_V7 } from './JKRReelV7';
import { JKRReelV8, TOTAL_FRAMES_V8 } from './JKRReelV8';

export const Root: React.FC = () => (
  <>
    <Composition
      id="JKRReel"
      component={JKRReel}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="JKRReelV6"
      component={JKRReelV6}
      durationInFrames={TOTAL_FRAMES_V6}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="JKRReelV7"
      component={JKRReelV7}
      durationInFrames={TOTAL_FRAMES_V7}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="JKRReelV8"
      component={JKRReelV8}
      durationInFrames={TOTAL_FRAMES_V8}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
