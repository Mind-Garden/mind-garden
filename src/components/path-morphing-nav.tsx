'use client';

import { motion, useMotionValue, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

// SVG file paths in the public folder
const paths = {
  habits: '/habits.svg',
  journal: '/journal.svg',
  data: '/chart.svg',
  ai: '/robot.svg',
};

const featureLabels = [
  'Track Habits',
  'Journal Entries',
  'Data Insights',
  'AI Assistant',
];
const featureColors = ['#4ade80', '#60a5fa', '#f472b6', '#a78bfa'];

interface PathMorphingNavProps {
  readonly featuresRef: React.RefObject<HTMLDivElement | null>;
}

export default function PathMorphingNav({ featuresRef }: PathMorphingNavProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useMotionValue(0);
  const pathKeys = Object.keys(paths) as Array<keyof typeof paths>;

  // Use scroll progress to control the animation
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ['start 25%', 'end 25%'], // Ensures the section is tracked properly
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      // Dynamically divide the scroll progress into equal sections
      const sectionSize = 1 / pathKeys.length;

      // Calculate the new index based on scroll position
      const newIndex = Math.min(
        pathKeys.length - 1,
        Math.round(value / sectionSize), // Use rounding instead of flooring
      );

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }

      // Ensure smooth transitions between icons
      const normalizedProgress = (value - newIndex * sectionSize) / sectionSize;
      progress.set(Math.max(0, Math.min(1, normalizedProgress))); // Clamp values between 0 and 1
    });

    return unsubscribe;
  }, [activeIndex, pathKeys.length, progress, scrollYProgress]);

  return (
    <div className="fixed top-1/2 left-6 -translate-y-1/2 z-50 flex items-center gap-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-auto max-w-[30vw]">
      <div className="w-[10vw] h-[10vw] max-w-20 max-h-20">
        {' '}
        {/* Responsive size */}
        <motion.img
          key={activeIndex}
          src={paths[pathKeys[activeIndex]]}
          alt={featureLabels[activeIndex]}
          className="w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0px 0px 15px ${featureColors[activeIndex]})`,
            transition: 'filter 0.3s ease-out', // Smooth transition for filter
          }}
        />
      </div>
      <div className="text-xl font-semibold text-gray-900 dark:text-white">
        {featureLabels[activeIndex]}
      </div>
    </div>
  );
}
