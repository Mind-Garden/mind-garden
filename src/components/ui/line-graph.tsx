'use client';

import { useState, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  animate,
  useTransform,
} from 'framer-motion';

// Types for our data and props
import type { DataPoint } from '@/supabase/schema';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

// Update the props interface to include axis labels
interface AnimatedLineGraphProps {
  readonly data: DataPoint[];
  readonly lineColor?: string;
  readonly backgroundColor?: string;
  readonly gridColor?: string;
  readonly tooltipColor?: string;
  readonly tooltipTextColor?: string;
  readonly animate?: boolean;
  readonly xAxisLabel?: string;
  readonly yAxisLabel?: string;
  readonly title?: string;
  readonly aspectRatio?: number; // Added aspect ratio prop
}

// Helper component to animate numbers
const AnimateNumber = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(
    motionValue,
    (latest) => `${Math.round(latest)}`,
  );

  useEffect(() => {
    const animation = animate(motionValue, value, {
      duration: 0.8,
      type: 'spring',
      bounce: 0.2,
    });
    return animation.stop;
  }, [motionValue, value]);

  return <motion.span>{rounded}</motion.span>;
};

// Update the Cursor component to show more detailed information
const Cursor = ({
  point,
  visible,
  tooltipColor,
  tooltipTextColor,
}: {
  point: { x: number; y: number; value: number; original: DataPoint };
  visible: boolean;
  tooltipColor: string;
  tooltipTextColor: string;
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {/* Enhanced Tooltip */}
          <motion.g transform={`translate(${point.x}, ${point.y + 20})`}>
            <motion.rect
              x="-80"
              y="0"
              width="160"
              height="60"
              rx="8"
              fill={tooltipColor}
              filter="drop-shadow(0px 2px 8px rgba(0,0,0,0.25))"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            />
            <motion.text
              x="0"
              y="20"
              textAnchor="middle"
              fill={tooltipTextColor}
              fontSize="14"
              fontWeight="500"
              fontFamily="system-ui, sans-serif"
            >
              <tspan x="0" dy="0">
                {formatDate(point.original.x)}
              </tspan>
              <tspan x="0" dy="20">
                Value: {point.original.y}
              </tspan>
              <tspan x="0" dy="20">
                <AnimateNumber value={Math.abs(point.value)} />
              </tspan>
            </motion.text>
          </motion.g>

          {/* Point highlight */}
          <motion.circle
            cx={point.x}
            cy={point.y}
            r="6"
            fill={tooltipColor}
            stroke="#000"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          />
        </motion.g>
      )}
    </AnimatePresence>
  );
};

// Add a helper function to format dates
const formatDate = (dateString: string) => {
  try {
    // Add time and force UTC to avoid timezone issues
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC', // Force UTC timezone
    });
  } catch (e) {
    return dateString;
  }
};

// Update the main component to be responsive
export default function AnimatedLineGraph({
  data,
  lineColor = '#bea9de', // Mint/teal color for line like in image
  backgroundColor = '#fcfcfc', // white
  gridColor = '#666666', // Subtle dark grid if needed
  tooltipColor = '#fcfcfc', // white
  tooltipTextColor = '#000000', // Matching the line color for consistency
  animate = true,
  xAxisLabel = 'Date',
  yAxisLabel = 'Value',
  title,
  aspectRatio = 1.5, // Default aspect ratio (width:height = 2:1)
}: AnimatedLineGraphProps) {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    value: number;
    original: DataPoint;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Function to handle section hovering
  const handleSectionHover = (sectionIndex: number | null) => {
    setHoveredSection(sectionIndex);

    if (
      sectionIndex !== null &&
      sectionIndex >= 0 &&
      sectionIndex < points.length
    ) {
      setTooltipInfo(points[sectionIndex]);
    } else {
      setTooltipInfo(null);
    }
  };

  // Update dimensions based on container size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerWidth / aspectRatio;
      setDimensions({
        width: containerWidth,
        height: containerHeight,
      });
    };

    // Initial update
    updateDimensions();

    // Set up resize observer to update dimensions when container changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [aspectRatio]);

  // Calculate min/max values for scaling
  const padding = 40; // Increased padding to accommodate axis labels
  const graphWidth = dimensions.width - padding * 2;
  const graphHeight = dimensions.height - padding * 2;

  const yValues = data.map((d) => d.y);
  const minY = Math.min(...yValues) * 0.9; // Add some padding to the range
  const maxY = Math.max(...yValues) * 1.1;
  const range = maxY - minY;

  // Scale data points to fit the graph
  const points = data.map((point, i) => {
    const x = padding + (i * graphWidth) / (data.length - 1);
    const y = padding + graphHeight - ((point.y - minY) / range) * graphHeight;

    // Calculate percentage change from first point
    const percentChange = Math.round(((point.y - data[0].y) / data[0].y) * 100);

    return {
      x,
      y,
      value: percentChange,
      original: point,
    };
  });

  // Create SVG path from points
  const pathDefinition = points.reduce((path, point, i) => {
    return path + `${i === 0 ? 'M' : 'L'} ${point.x},${point.y} `;
  }, '');

  // Create shadow path that extends to the bottom
  const shadowPathDefinition =
    pathDefinition +
    ` L ${points[points.length - 1].x},${padding + graphHeight} ` +
    ` L ${points[0].x},${padding + graphHeight} Z`;

  // Animation variants
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: 'easeInOut' },
        opacity: { duration: 0.5 },
      },
    },
  };

  const pointVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: custom * 0.2 + 1,
        duration: 0.5,
        type: 'spring',
        damping: 10,
      },
    }),
  };

  // Y-axis tick values
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }).map((_, i) => {
    const value = minY + (range / (yTickCount - 1)) * i;
    return {
      value,
      y: padding + graphHeight - ((value - minY) / range) * graphHeight,
    };
  });

  // Calculate font sizes based on container width
  const fontSize = Math.max(10, Math.min(14, dimensions.width / 60));
  const titleFontSize = Math.max(16, Math.min(24, dimensions.width / 30));
  const labelFontSize = Math.max(12, Math.min(16, dimensions.width / 50));

  return (
    <div ref={containerRef} className="w-full z-50">
      <Card className="bg-white backdrop-blur-sm rounded-2xl border-none w-full">
        <CardTitle className="text-2xl font-bold mb-2 opacity-50 text-center"></CardTitle>
        <CardDescription className="text-center text-muted-foreground"></CardDescription>
        <CardContent>
          <div className="flex flex-col items-center justify-center bg-white p-4 w-full">
            <h1
              className="text-white mb-8"
              style={{ fontSize: `${titleFontSize}px` }}
            >
              {title}
            </h1>
            <div className="relative w-full">
              <div
                className="relative rounded-xl overflow-hidden w-full"
                style={{
                  height: dimensions.height,
                  backgroundColor,
                  aspectRatio: `${aspectRatio}/1`,
                }}
              >
                <MotionConfig reducedMotion="user">
                  <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    preserveAspectRatio="xMidYMid meet"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none"
                  >
                    {/* Define gradient for shadow */}
                    <defs>
                      <linearGradient
                        id="shadowGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={lineColor}
                          stopOpacity="0.9"
                        />
                        <stop
                          offset="100%"
                          stopColor={lineColor}
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {yTicks.map((tick, i) => (
                      <g key={`grid-${i}`}>
                        <line
                          x1={padding}
                          y1={tick.y}
                          x2={dimensions.width - padding}
                          y2={tick.y}
                          stroke={gridColor}
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padding - 10}
                          y={tick.y}
                          textAnchor="end"
                          dominantBaseline="middle"
                          fill={gridColor}
                          fontSize={fontSize}
                        >
                          {Math.round(tick.value)}
                        </text>
                      </g>
                    ))}

                    {/* X-axis labels */}
                    {points.map((point, i) => {
                      // Only show a subset of labels on smaller screens
                      const shouldShow =
                        dimensions.width > 500 ||
                        i % Math.ceil(points.length / 5) === 0;
                      return shouldShow ? (
                        <text
                          key={`x-label-${i}`}
                          x={point.x}
                          y={dimensions.height - padding / 2}
                          textAnchor="middle"
                          fill={gridColor}
                          fontSize={fontSize}
                          transform={`rotate(-45, ${point.x}, ${dimensions.height - padding / 2})`}
                        >
                          {formatDate(point.original.x).split(' ')[0] +
                            ' ' +
                            formatDate(point.original.x)
                              .split(' ')[1]
                              .replace(',', '')}
                        </text>
                      ) : null;
                    })}

                    {/* Axis labels - moved outside the graph area */}
                    <text
                      x={dimensions.width / 2}
                      y={dimensions.height + 10}
                      textAnchor="middle"
                      fill={gridColor}
                      fontSize={labelFontSize}
                      fontWeight="bold"
                    >
                      {xAxisLabel}
                    </text>

                    <text
                      x={5}
                      y={dimensions.height / 2 + 10}
                      textAnchor="middle"
                      fill={gridColor}
                      fontSize={labelFontSize}
                      fontWeight="bold"
                      transform={`rotate(-90, 5, ${dimensions.height / 2})`}
                    >
                      {yAxisLabel}
                    </text>

                    {/* Shadow area */}
                    <motion.path
                      d={shadowPathDefinition}
                      fill="url(#shadowGradient)"
                      opacity={0.5}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: animate ? 0.5 : 0 }}
                      transition={{ delay: 1, duration: 1 }}
                    />

                    {/* Animated path */}
                    <motion.path
                      d={pathDefinition}
                      stroke={lineColor}
                      strokeWidth="2"
                      fill="none"
                      variants={pathVariants}
                      initial="hidden"
                      animate={animate ? 'visible' : 'hidden'}
                    />

                    {/* Data points - now just visual, not interactive */}
                    {points.map((point, i) => (
                      <motion.circle
                        key={`point-${i}`}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill={backgroundColor}
                        stroke={lineColor}
                        strokeWidth="2"
                        variants={pointVariants}
                        custom={i / points.length}
                        initial="hidden"
                        animate={animate ? 'visible' : 'hidden'}
                      />
                    ))}

                    {/* Section hover areas - invisible rectangles that trigger tooltips */}
                    {points.map((point, i, arr) => {
                      // Calculate section boundaries
                      let sectionStart, sectionWidth;

                      if (i === 0) {
                        // First point - half width section to the right
                        sectionStart = point.x;
                        const nextPoint = arr[i + 1];
                        const fullSectionWidth = nextPoint.x - point.x;
                        sectionWidth = fullSectionWidth / 2;
                      } else if (i === arr.length - 1) {
                        // Last point - half width section to the left
                        const prevPoint = arr[i - 1];
                        const fullSectionWidth = point.x - prevPoint.x;
                        sectionStart = point.x - fullSectionWidth / 2;
                        sectionWidth = fullSectionWidth / 2;
                      } else {
                        // Middle points - section extends halfway to previous and next points
                        const prevPoint = arr[i - 1];
                        const nextPoint = arr[i + 1];
                        sectionStart = (prevPoint.x + point.x) / 2;
                        sectionWidth = (nextPoint.x - prevPoint.x) / 2;
                      }

                      return (
                        <rect
                          key={`section-${i}`}
                          x={sectionStart}
                          y={padding}
                          width={sectionWidth}
                          height={graphHeight}
                          fill="transparent"
                          className="cursor-pointer pointer-events-auto"
                          onMouseEnter={() => handleSectionHover(i)}
                          onMouseLeave={() => handleSectionHover(null)}
                        />
                      );
                    })}

                    {/* Tooltip cursor */}
                    {tooltipInfo && (
                      <Cursor
                        point={tooltipInfo}
                        visible={true}
                        tooltipColor={tooltipColor}
                        tooltipTextColor={tooltipTextColor}
                      />
                    )}
                  </svg>
                </MotionConfig>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
