// Core imports
import React, { useState } from 'react';

// UI
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

interface SwiperUIProps<T> {
  data: T[];
  renderSlide: (item: T) => React.ReactNode;
  onReachEnd?: () => void;
}

function SwiperUI<T extends {}>({
  data,
  renderSlide,
  onReachEnd,
}: Readonly<SwiperUIProps<T>>) {
  // Track current slide for pagination display
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Swiper
        modules={[Navigation, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        speed={300}
        navigation
        loop={false}
        className="journal-swiper"
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
          // Only trigger when on the last slide
          if (swiper.isEnd && swiper.activeIndex === data.length - 1) {
            onReachEnd?.();
          }
        }}
      >
        {data.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl min-h-[300px] flex flex-col">
              {renderSlide(item)}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Show current entry position */}
      <div className="text-center mt-4 text-sm text-gray-600">
        Journal Entry {activeIndex + 1} of {data.length}
      </div>
    </div>
  );
}

export default SwiperUI;
