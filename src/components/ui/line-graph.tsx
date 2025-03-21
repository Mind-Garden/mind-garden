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
  readonly aspectRatio?: number;
}

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
          {/* Tooltip */}
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
              fontFamily="var(--font-mulish)"
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

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch (e) {
    return dateString;
  }
};

export default function AnimatedLineGraph({
  data,
  lineColor = '#bea9de',
  backgroundColor = '#fcfcfc',
  gridColor = '#666666',
  tooltipColor = '#fcfcfc',
  tooltipTextColor = '#000000',
  animate = true,
  xAxisLabel = 'Date',
  yAxisLabel = 'Value',
  title,
  aspectRatio = 1.5,
}: AnimatedLineGraphProps) {
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    value: number;
    original: DataPoint;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  const handleSectionHover = (sectionIndex: number | null) => {
    if (
      sectionIndex !== null &&
      sectionIndex >= 0 &&
      sectionIndex < computedPoints.length
    ) {
      setTooltipInfo(computedPoints[sectionIndex]);
    } else {
      setTooltipInfo(null);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerWidth / aspectRatio;
      setDimensions({ width: containerWidth, height: containerHeight });
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [aspectRatio]);

  const padding = 40;
  const graphWidth = dimensions.width - padding * 2;
  const graphHeight = dimensions.height - padding * 2;
  const yValues = data.map((d) => d.y);
  let actualMin = Math.min(...yValues);
  let actualMax = Math.max(...yValues);

  // Handle the case where dataRange = 0 (all y's are the same)
  if (actualMin === actualMax) {
    // Provide some tiny range so we can actually draw
    actualMin -= 1;
    actualMax += 1;
  }

  const minY = actualMin;
  const maxY = actualMax;
  const range = maxY - minY;

  // Compute points:
  // If there's only one data point, create two points spanning horizontally
  const computedPoints =
    data.length === 1
      ? (() => {
          const y =
            padding +
            graphHeight -
            ((data[0].y - minY) / (range || 1)) * graphHeight;
          return [
            { x: padding, y, value: 0, original: data[0] },
            { x: dimensions.width - padding, y, value: 0, original: data[0] },
          ];
        })()
      : data.map((point, i) => {
          const x = padding + (i * graphWidth) / (data.length - 1);
          const y =
            padding + graphHeight - ((point.y - minY) / range) * graphHeight;
          const percentChange = Math.round(
            ((point.y - data[0].y) / data[0].y) * 100,
          );
          return { x, y, value: percentChange, original: point };
        });

  // Create SVG path from computed points
  const pathDefinition = computedPoints.reduce(
    (path, point, i) => path + `${i === 0 ? 'M' : 'L'} ${point.x},${point.y} `,
    '',
  );

  // Create shadow path extending to bottom of graph
  const shadowPathDefinition =
    pathDefinition +
    ` L ${computedPoints[computedPoints.length - 1].x},${padding + graphHeight} ` +
    ` L ${computedPoints[0].x},${padding + graphHeight} Z`;

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
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

  // get the number of y axis ticks
  const yTickCount = new Set(data.map((item) => item.y)).size;
  const safeYTickCount = yTickCount > 1 ? yTickCount : 2; // Avoid division by zero

  const yTicks = Array.from({ length: safeYTickCount }).map((_, i) => {
    const value = minY + (range / (safeYTickCount - 1)) * i;
    return {
      value: isNaN(value) ? minY : value, // Ensure value is not NaN
      y: padding + graphHeight - ((value - minY) / (range || 1)) * graphHeight,
    };
  });

  // automatically get graph configurations based on dimension size
  const fontSize = Math.max(10, Math.min(14, dimensions.width / 60));
  const titleFontSize = Math.max(16, Math.min(24, dimensions.width / 30));
  const labelFontSize = Math.max(12, Math.min(16, dimensions.width / 50));

  return (
    <div ref={containerRef} className="max-w-screen-lg mx-auto z-50 font-body">
      <Card className="bg-white backdrop-blur-sm rounded-2xl border-none w-full">
        <CardTitle className="text-2xl font-bold mb-2 opacity-50 text-center">
          {title}
        </CardTitle>
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
                {/* Set up the SVG for Graph */}
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

                    {/*Set up the Grid lines */}
                    {yTicks.map((tick, i) => (
                      <g key={`grid-${i}`}>
                        <line
                          x1={padding}
                          y1={tick.y}
                          x2={dimensions.width - padding}
                          y2={tick.y}
                          stroke={gridColor}
                          strokeWidth=".25"
                          strokeDasharray="4 0"
                        />
                        <text
                          x={padding - 10}
                          y={tick.y}
                          textAnchor="end"
                          dominantBaseline="middle"
                          fill={gridColor}
                          fontSize={fontSize}
                          style={{ fontFamily: 'var(--font-mulish)' }}
                        >
                          {Math.round(tick.value)}
                        </text>
                      </g>
                    ))}

                    {computedPoints.map((point, i) => {
                      const shouldShow =
                        dimensions.width > 500 ||
                        i %
                          Math.ceil(
                            (data.length === 1 ? 1 : data.length) / 5,
                          ) ===
                          0;
                      return shouldShow ? (
                        <text
                          key={`x-label-${i}`}
                          x={point.x}
                          y={dimensions.height - padding / 2}
                          textAnchor="middle"
                          fill={gridColor}
                          fontSize={fontSize}
                          transform={`rotate(-45, ${point.x}, ${dimensions.height - padding / 2})`}
                          style={{ fontFamily: 'var(--font-mulish)' }}
                        >
                          {formatDate(point.original.x).split(' ')[0] +
                            ' ' +
                            formatDate(point.original.x)
                              .split(' ')[1]
                              .replace(',', '')}
                        </text>
                      ) : null;
                    })}

                    <text
                      x={dimensions.width / 2}
                      y={dimensions.height + 10}
                      textAnchor="middle"
                      fill={gridColor}
                      fontSize={labelFontSize}
                      fontWeight="bold"
                      style={{ fontFamily: 'var(--font-mulish)' }}
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
                      style={{ fontFamily: 'var(--font-mulish)' }}
                    >
                      {yAxisLabel}
                    </text>
                    {/*Shadow under line */}
                    <motion.path
                      d={shadowPathDefinition}
                      fill="url(#shadowGradient)"
                      opacity={0.5}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: animate ? 0.5 : 0 }}
                      transition={{ delay: 1, duration: 1 }}
                    />
                    {/* Line for graph*/}
                    <motion.path
                      d={pathDefinition}
                      stroke={lineColor}
                      strokeWidth="2"
                      fill="none"
                      variants={pathVariants}
                      initial="hidden"
                      animate={animate ? 'visible' : 'hidden'}
                    />
                    {/* Points*/}
                    {computedPoints.map((point, i) => (
                      <motion.circle
                        key={`point-${i}`}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill={backgroundColor}
                        stroke={lineColor}
                        strokeWidth="2"
                        variants={pointVariants}
                        custom={i / computedPoints.length}
                        initial="hidden"
                        animate={animate ? 'visible' : 'hidden'}
                      />
                    ))}

                    {/* Section hover areas */}
                    {data.length === 1 ? (
                      <rect
                        x={padding}
                        y={padding}
                        width={graphWidth}
                        height={graphHeight}
                        fill="transparent"
                        className="cursor-pointer pointer-events-auto"
                        onMouseEnter={() => handleSectionHover(0)}
                        onMouseLeave={() => handleSectionHover(null)}
                      />
                    ) : (
                      computedPoints.map((point, i, arr) => {
                        let sectionStart, sectionWidth;
                        if (i === 0) {
                          const nextPoint = arr[i + 1];
                          sectionStart = point.x;
                          sectionWidth = (nextPoint.x - point.x) / 2;
                        } else if (i === arr.length - 1) {
                          const prevPoint = arr[i - 1];
                          sectionStart = point.x - (point.x - prevPoint.x) / 2;
                          sectionWidth = (point.x - prevPoint.x) / 2;
                        } else {
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
                      })
                    )}

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
