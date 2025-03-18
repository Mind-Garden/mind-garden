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
  const [direction, setDirection] = useState(0);
  const pathKeys = Object.keys(paths) as Array<keyof typeof paths>;

  // Use scroll progress to control the animation
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ['start 25%', 'end 25%'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      const sectionSize = 1 / pathKeys.length;
      const newIndex = Math.min(
        pathKeys.length - 1,
        Math.round(value / sectionSize),
      );

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        setDirection(newIndex % 2);
      }

      const normalizedProgress = (value - newIndex * sectionSize) / sectionSize;
      progress.set(Math.max(0, Math.min(1, normalizedProgress)));
    });

    return unsubscribe;
  }, [activeIndex, pathKeys.length, progress, scrollYProgress]);

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 z-[-2] flex items-center gap-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-auto max-w-[30vw] 
        ${direction === 1 ? 'left-6 flex-row' : 'right-6 flex-row-reverse'}`}
    >
      <div className="w-[10vw] h-[10vw] max-w-20 max-h-20">
        <motion.img
          key={activeIndex}
          src={paths[pathKeys[activeIndex]]}
          alt={featureLabels[activeIndex]}
          className="w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0px 0px 15px ${featureColors[activeIndex]})`,
            transition: 'filter 0.3s ease-out',
          }}
        />
      </div>
      <div className="text-xl font-semibold text-gray-900 dark:text-white">
        {featureLabels[activeIndex]}
      </div>
    </div>
  );
}
