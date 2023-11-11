import React, { FC, memo } from "react";
import clsx from "clsx";
import SwiperCore, { Autoplay, EffectFade, Pagination, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import "./Slider.styles.scss";

SwiperCore.use([EffectFade, Autoplay, Pagination, Navigation]);

type SliderProps = {
  slides: JSX.Element[];
  className?: string;
  settings?: Record<string, unknown>;
  withPagination?: boolean;
};
const Slider: FC<SliderProps> = memo(({ slides, className, settings, withPagination }) => {
  const defaultSettings = {
    slidesPerGroup: 1,
    slidesPerView: 1,
    speed: 700,
    spaceBetween: 20,
    pagination: {
      clickable: withPagination,
    },
    autoplay: {
      delay: 5000,
      loop: true,
      disableOnInteraction: false,
    },
  };
  const allSettings = Object.assign({}, defaultSettings, settings);

  return (
    <>
      {slides.length > 1 ? (
        <div className="position-relative">
          <Swiper
            className={clsx("slider", className, { "slider--withPagination": withPagination })}
            {...allSettings}
          >
            {slides.map((item, index) => (
              <SwiperSlide key={index}>{item}</SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className={className}>{slides}</div>
      )}
    </>
  );
});

export default Slider;
