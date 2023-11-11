import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonLoadingProps {
  count?: number;
  className?: string;
  baseColor?: string;
  width?: string | number;
  height?: string | number;
}

export default function SkeletonLoading({
  className,
  baseColor,
  width,
  height,
  count = 1,
}: SkeletonLoadingProps): JSX.Element {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          className={className}
          baseColor={baseColor}
          width={width}
          height={height}
        />
      ))}
    </>
  );
}
