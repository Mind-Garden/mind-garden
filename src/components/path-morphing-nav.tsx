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
    offset: ['start start', 'end end'],
  });

  // Change the active index based on scroll position
  useEffect(() => {
    console.log('Yelloq');
    const unsubscribe = scrollYProgress.on('change', (value) => {
      const sectionSize = 1 / pathKeys.length;
      const newIndex = Math.min(
        pathKeys.length - 1,
        Math.floor(value / sectionSize),
      );

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }

      // Calculate progress within the current section
      const sectionProgress = (value % sectionSize) / sectionSize;
      progress.set(sectionProgress);
    });

    return unsubscribe;
  }, [activeIndex, pathKeys.length, progress, scrollYProgress]);

  return (
    <div className="fixed top-6 left-6 z-50 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-3 rounded-full shadow-lg">
      <div className=" w-10 h-10">
        <motion.img
          key={activeIndex}
          src={paths[pathKeys[activeIndex]]}
          alt={featureLabels[activeIndex]}
          className="w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0px 0px 5px ${featureColors[activeIndex]})`,
          }}
        />
      </div>
      <div className="font-medium text-sm">{featureLabels[activeIndex]}</div>
    </div>
  );
}
