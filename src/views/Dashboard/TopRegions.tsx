import React from "react";

import { CardRegion, Slider, SkeletonLoading } from "components";
import { useTopRegions } from "hooks/resources/useTopRegions";

const regionsSliderSettings = {
  slidesPerGroup: 1,
  autoplay: false,
  navigation: true,
  breakpoints: {
    640: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 3,
    },
    992: {
      slidesPerView: 4,
    },
  },
};

function TopRegions() {
  const { isLoading, regions } = useTopRegions();

  return (
    <>
      <h3 className="dashboard__title">Вино</h3>
      <Slider slides={renderSlides()} settings={regionsSliderSettings} />
    </>
  );

  function renderSlides() {
    return isLoading
      ? Array.from({ length: 4 }, (_, index) => (
          <SkeletonLoading key={index} width={265} height={121} />
        ))
      : regions.map((item, index) => <CardRegion key={index} {...item} />);
  }
}

export default TopRegions;
