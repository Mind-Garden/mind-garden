'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingShapesProps {
  colors: string[];
  className?: string;
}

export default function FloatingShapes({
  colors,
  className,
}: FloatingShapesProps) {
  const [randomOffsets, setRandomOffsets] = useState<
    { x: number; y: number }[]
  >([]);
  const [edgePositions, setEdgePositions] = useState<
    { vertical: string; horizontal: string }[]
  >([]);

  useEffect(() => {
    // Random offset function to add slight variation to animation paths
    const generateRandomOffset = () => ({
      x: Math.random() * 20 - 10, // Random value between -10 and 10
      y: Math.random() * 20 - 10, // Random value between -10 and 10
    });

    // Generate new random offsets
    setRandomOffsets([
      generateRandomOffset(),
      generateRandomOffset(),
      generateRandomOffset(),
    ]);

    // Define edge regions (top, bottom, left, right)
    const edgeRegions = [
      {
        vertical: 'top-0',
        horizontal: [
          'left-0',
          'left-16',
          'left-32',
          'right-0',
          'right-16',
          'right-32',
        ],
      },
      {
        vertical: [
          'top-8',
          'top-16',
          'top-24',
          'bottom-8',
          'bottom-16',
          'bottom-24',
        ],
        horizontal: 'right-0',
      },
      {
        vertical: 'bottom-0',
        horizontal: [
          'left-0',
          'left-16',
          'left-32',
          'right-0',
          'right-16',
          'right-32',
        ],
      },
      {
        vertical: [
          'top-8',
          'top-16',
          'top-24',
          'bottom-8',
          'bottom-16',
          'bottom-24',
        ],
        horizontal: 'left-0',
      },
    ];

    // Shuffle and pick 3 different edge positions
    const shuffledRegions = [...edgeRegions].sort(() => Math.random() - 0.5);
    const newEdgePositions = [0, 1, 2].map((i) => {
      const region = shuffledRegions[i % shuffledRegions.length];
      return {
        vertical: Array.isArray(region.vertical)
          ? region.vertical[Math.floor(Math.random() * region.vertical.length)]
          : region.vertical,
        horizontal: Array.isArray(region.horizontal)
          ? region.horizontal[
              Math.floor(Math.random() * region.horizontal.length)
            ]
          : region.horizontal,
      };
    });

    setEdgePositions(newEdgePositions);
  }, []);

  // Function to get a color for a specific index with even distribution
  const getColorForIndex = (index: number) => {
    if (!colors || colors.length === 0) return '';

    // If we have exactly the right number of colors or fewer, use them in order
    if (colors.length >= randomOffsets.length) {
      return colors[index % colors.length];
    }

    // Otherwise distribute evenly
    const colorIndex = Math.floor(
      (index / randomOffsets.length) * colors.length,
    );
    return colors[colorIndex % colors.length];
  };

  if (randomOffsets.length === 0 || edgePositions.length === 0) return null; // Avoid rendering before values are set

  return (
    <>
      {randomOffsets.map((offset, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [0.8, 1, 0.8],
            x: [0, offset.x, 0],
            y: [0, offset.y, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            repeatType: 'reverse',
          }}
          className={`absolute ${edgePositions[index].vertical} ${edgePositions[index].horizontal} w-32 h-32 rounded-full opacity-70 -z-10 ${getColorForIndex(index)} ${className}`}
        />
      ))}
    </>
  );
}
