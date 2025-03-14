'use client';

import type React from 'react';
import * as motion from 'motion/react-client';
import { useEffect, useState } from 'react';

export default function PathDrawing() {
  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Update viewport dimensions and handle resize
  useEffect(() => {
    const updateViewport = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };

    // Set initial dimensions
    updateViewport();
    setMounted(true);

    // Add resize listener
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Calculate path points based on viewport
  const calculatePath = () => {
    // Start from right side, zigzag down to bottom left
    const startX = 1;
    const startY = 0.65;

    // Ensure the path ends near the bottom of the screen
    // The final Y position is fixed at 85% of viewport height
    const endY = 0.85;
    const endX = 0.5;

    return [
      { x: startX, y: startY, delay: 0 }, // Starting point
      { x: 0.9, y: 0.65, delay: 0.2 }, // Diagonal "zig"
      { x: 0.8, y: 0.65, delay: 0.4 }, // Diagonal "zag"
      { x: 0.7, y: 0.75, delay: 0.8 }, // Diagonal "zag"
      { x: 0.6, y: 0.85, delay: 1.0 }, // Diagonal "zig"
      { x: 0.5, y: 0.85, delay: 1.2 }, // Diagonal "zag"
      { x: endX, y: endY, delay: 1.4 }, // Final point (fixed near bottom)
    ];
  };

  const pulsePoints = calculatePath();
  const finalPulsePoint = pulsePoints[pulsePoints.length - 1];

  // Convert percentage-based coordinates to viewport pixels
  const convertToPixels = (point: { x: number; y: number }) => ({
    x: point.x * viewportWidth,
    y: point.y * viewportHeight,
  });

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <motion.svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
        preserveAspectRatio="none"
        initial="hidden"
        animate="visible"
        style={image}
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0070F3" /> {/* Primary blue */}
            <stop offset="100%" stopColor="#00C2A8" /> {/* Teal/green accent */}
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <radialGradient id="pulseGradient">
            <stop offset="0%" stopColor="#0070F3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0070F3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Path with glow */}
        <motion.path
          d={pulsePoints
            .map((point, index) => {
              const { x, y } = convertToPixels(point);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ')}
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 5,
            ease: 'easeInOut',
          }}
        />

        {/* Pulse points */}
        {pulsePoints.map((point, index) => {
          const { x, y } = convertToPixels(point);
          return (
            <motion.g key={index}>
              {/* Outer pulse */}
              <motion.circle
                cx={x}
                cy={y}
                r="30"
                fill="url(#pulseGradient)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 2],
                  opacity: [0.4, 0],
                }}
                transition={{
                  delay: point.delay,
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.25,
                }}
              />

              {/* Inner pulse */}
              <motion.circle
                cx={x}
                cy={y}
                r="12"
                fill="#00C2A8" // Green accent for pulse points
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.9, 0.5, 0.9],
                }}
                transition={{
                  delay: point.delay,
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                }}
              />
            </motion.g>
          );
        })}

        {/* Arrow head at the bottom */}
        {finalPulsePoint && (
          <motion.g>
            <motion.path
              d={`M ${convertToPixels(finalPulsePoint).x} ${convertToPixels(finalPulsePoint).y + 40} 
                               L ${convertToPixels(finalPulsePoint).x - 20} ${convertToPixels(finalPulsePoint).y + 20} 
                               L ${convertToPixels(finalPulsePoint).x + 20} ${convertToPixels(finalPulsePoint).y + 20} Z`}
              fill="url(#pathGradient)"
              filter="url(#glow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                delay: 5,
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.5,
              }}
            />
          </motion.g>
        )}

        {/* Text above the arrow */}
        {finalPulsePoint && (
          <motion.text
            x={convertToPixels(finalPulsePoint).x}
            y={convertToPixels(finalPulsePoint).y - 30}
            textAnchor="middle"
            fontSize="16"
            fontFamily="'SF Mono', 'Roboto Mono', monospace"
            fill="#00C2A8" // Green text
            letterSpacing="0.2em"
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
            }}
          >
            EXPLORE OUR FEATURES
          </motion.text>
        )}

        {/* Arrow animation - moving down and up */}
        {finalPulsePoint && (
          <motion.path
            d={`M ${convertToPixels(finalPulsePoint).x} ${convertToPixels(finalPulsePoint).y + 40} 
               L ${convertToPixels(finalPulsePoint).x - 20} ${convertToPixels(finalPulsePoint).y + 20} 
               L ${convertToPixels(finalPulsePoint).x + 20} ${convertToPixels(finalPulsePoint).y + 20} Z`}
            fill="url(#pathGradient)"
            filter="url(#glow)"
            animate={{
              y: [
                convertToPixels(finalPulsePoint).y + 40,
                convertToPixels(finalPulsePoint).y - 10,
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              repeatType: 'reverse',
            }}
          />
        )}
      </motion.svg>
    </div>
  );
}

const image: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: -1,
};
