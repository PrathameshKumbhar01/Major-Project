import { useEffect, useRef, useState } from 'react';

// Eye centers + pupil radius, all in the 400x400 viewBox coordinate space.
const EYES = [
  { x: 148, y: 196 },
  { x: 252, y: 196 },
];
const PUPIL_TRAVEL = 8;

/**
 * An original glitch-styled cat mascot for the StudyCat brand.
 * - Eyes track the mouse cursor anywhere on screen (direct DOM writes, no re-renders).
 * - Blinks on a random interval.
 * - Periodically "glitches": chromatic-aberration ghosts + sliced displacement + jitter.
 */
export function GlitchCreature({ className = '' }) {
  const svgRef = useRef(null);
  const pupilRefs = useRef([]);
  const [isGlitching, setIsGlitching] = useState(false);
  const [slices, setSlices] = useState([]);
  const [blink, setBlink] = useState(false);

  // Eyes follow the mouse, wherever it is on the page.
  useEffect(() => {
    function handleMove(e) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return;

      EYES.forEach((eye, i) => {
        const cx = rect.left + (eye.x / 400) * rect.width;
        const cy = rect.top + (eye.y / 400) * rect.height;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        // Full travel once the cursor is a bit away; scales down near the center so it doesn't jitter.
        const radius = Math.min(PUPIL_TRAVEL, dist / 15);
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        const pupil = pupilRefs.current[i];
        if (pupil) pupil.setAttribute('transform', `translate(${px.toFixed(2)}, ${py.toFixed(2)})`);
      });
    }
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Random blinking.
  useEffect(() => {
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        schedule();
      }, 2600 + Math.random() * 3200);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Random glitch bursts.
  useEffect(() => {
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        const newSlices = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => ({
          y: 100 + Math.random() * 220,
          h: 4 + Math.random() * 14,
          dx: (Math.random() - 0.5) * 50,
        }));
        setSlices(newSlices);
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 160 + Math.random() * 180);
        schedule();
      }, 2200 + Math.random() * 3200);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const eyeTransform = (cx, cy) =>
    blink
      ? `translate(${cx} ${cy}) scale(1, 0.08) translate(${-cx} ${-cy})`
      : `translate(${cx} ${cy}) scale(1, 1) translate(${-cx} ${-cy})`;

  // Reusable silhouette (body, ears, tail, feet, whiskers, pixel glitch flecks)
  // so it can be redrawn as chromatic-aberration ghosts during a glitch burst.
  const Silhouette = ({ fill, opacity = 1 }) => (
    <g opacity={opacity}>
      {/* tail */}
      <path
        d="M300 250 C 350 240, 360 190, 335 155 C 355 185, 350 225, 305 262 Z"
        fill={fill}
      />
      {/* body */}
      <rect x="90" y="130" width="220" height="190" rx="70" fill={fill} />
      {/* ears */}
      <path d="M118 142 L138 78 L166 134 Z" fill={fill} />
      <path d="M282 142 L262 78 L234 134 Z" fill={fill} />
      {/* feet */}
      <rect x="130" y="308" width="42" height="26" rx="12" fill={fill} />
      <rect x="228" y="308" width="42" height="26" rx="12" fill={fill} />
    </g>
  );

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* ambient glow behind the creature */}
      <div className="absolute w-72 h-72 rounded-full bg-primary-500/25 blur-3xl animate-pulse-soft pointer-events-none" />

      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 animate-float ${
          isGlitching ? 'creature-glitch' : ''
        }`}
      >
        <defs>
          <linearGradient id="catBodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <pattern id="scanlines" width="400" height="4" patternUnits="userSpaceOnUse">
            <rect width="400" height="1.5" fill="#000" opacity="0.35" />
          </pattern>
        </defs>

        {/* chromatic aberration ghosts, only during a glitch burst */}
        {isGlitching && (
          <>
            <g transform="translate(-6, 1)" style={{ mixBlendMode: 'screen' }}>
              <Silhouette fill="#ff3b6b" opacity={0.55} />
            </g>
            <g transform="translate(6, -1)" style={{ mixBlendMode: 'screen' }}>
              <Silhouette fill="#22e6e6" opacity={0.55} />
            </g>
          </>
        )}

        {/* main body */}
        <Silhouette fill="url(#catBodyGrad)" />

        {/* whiskers */}
        <g stroke="#4c1d95" strokeWidth="3" strokeLinecap="round" opacity="0.6">
          <path d="M105 240 L60 232" />
          <path d="M105 252 L58 256" />
          <path d="M295 240 L340 232" />
          <path d="M295 252 L342 256" />
        </g>

        {/* pixel glitch flecks scattered on the body */}
        <g opacity="0.85">
          <rect x="112" y="150" width="10" height="10" fill="#22e6e6" />
          <rect x="278" y="270" width="14" height="8" fill="#ff3b6b" />
          <rect x="196" y="300" width="8" height="8" fill="#facc15" />
        </g>

        {/* glitch slice displacement bars */}
        {isGlitching &&
          slices.map((s, i) => (
            <rect
              key={i}
              x="0"
              y={s.y}
              width="400"
              height={s.h}
              fill="url(#catBodyGrad)"
              opacity="0.6"
              transform={`translate(${s.dx}, 0)`}
            />
          ))}

        {/* eyes */}
        <g transform={eyeTransform(EYES[0].x, EYES[0].y)} style={{ transition: 'transform 90ms ease' }}>
          <circle cx={EYES[0].x} cy={EYES[0].y} r="30" fill="#fff" />
          <g ref={(el) => (pupilRefs.current[0] = el)}>
            <circle cx={EYES[0].x} cy={EYES[0].y} r="12" fill="#1e1b4b" />
          </g>
        </g>
        <g transform={eyeTransform(EYES[1].x, EYES[1].y)} style={{ transition: 'transform 90ms ease' }}>
          <circle cx={EYES[1].x} cy={EYES[1].y} r="30" fill="#fff" />
          <g ref={(el) => (pupilRefs.current[1] = el)}>
            <circle cx={EYES[1].x} cy={EYES[1].y} r="12" fill="#1e1b4b" />
          </g>
        </g>

        {/* mouth */}
        <path d="M180 250 Q200 264 220 250" stroke="#4c1d95" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* scanline overlay for the "static" feel */}
        <rect x="0" y="0" width="400" height="400" fill="url(#scanlines)" opacity="0.12" />
      </svg>
    </div>
  );
}
