import React, { FC, memo, useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { PriceFilter } from "./PriceFilter";
import { WineProducerFilter } from "./WineProducerFilter";
import { WineCountryFilter } from "./WineCountryFilter";
import { WineRegionFilter } from "./WineRegionFilter";
import { WineYearFilter } from "./WineYearFilter";
import { WineVolumeFilter } from "./WineVolumeFilter";
import { RatingRPFilter } from "./RatingRPFilter";
import "./MultiFilters.styles.scss";

type FiltersName = Exclude<FilterName, "WineName" | "IsNew" | "WineColor">;
type StateFilters<K extends FilterName = FiltersName> = {
  [key in K]: K extends "FirstSalePrice" ? Omit<FilterRangeValueType, "count"> : string[];
};

interface MultiFiltersProps {
  onClose?: () => void;
  filters: Record<FilterName, BaseFilter>;
  onApplyFilter: (filter: StateFilters) => void;
  isMarketSale?: boolean;
}

const MultiFilters: FC<MultiFiltersProps> = memo(
  ({ onClose, filters, onApplyFilter, isMarketSale }) => {
    const [searchParams, setSearchParams] = useSearchParams({});
    const priceKey = isMarketSale ? "MarketPlacePrice" : "FirstSalePrice";

    const [price, setPrice] = useState<number[]>(() => {
      if (searchParams.has(priceKey)) {
        return searchParams.getAll(priceKey).map(Number);
      }
      return [0, 0];
    });
    const [WineNames, setWineNames] = useState<string[]>(() => {
      if (searchParams.has("WineName")) {
        return searchParams.getAll("WineName");
      }
      return [];
    });
    const [producerNames, setProducerNames] = useState<string[]>(() => {
      if (searchParams.has("WineProducerName")) {
        return searchParams.getAll("WineProducerName");
      }
      return [];
    });
    const [productionCountries, setProductionCountries] = useState<string[]>(() => {
      if (searchParams.has("WineProductionCountry")) {
        return searchParams.getAll("WineProductionCountry");
      }
      return [];
    });
    const [productionRegions, setProductionRegions] = useState<string[]>(() => {
      if (searchParams.has("WineProductionRegion")) {
        return searchParams.getAll("WineProductionRegion");
      }
      return [];
    });
    const [productionYears, setProductionYears] = useState<string[]>(() => {
      if (searchParams.has("WineProductionYear")) {
        return searchParams.getAll("WineProductionYear");
      }
      return [];
    });
    const [bottleVolumes, setBottleVolumes] = useState<string[]>(() => {
      if (searchParams.has("WineBottleVolume")) {
        return searchParams.getAll("WineBottleVolume");
      }
      return [];
    });
    const [ratingRPs, setRatingRPs] = useState<string[]>(() => {
      if (searchParams.has("RatingRP")) {
        return searchParams.getAll("RatingRP");
      }
      return [];
    });

    const clearRangeSliderStateFn = useRef<null | (() => void)>(null);

    const defaultPriceValues: [number, number] = [
      +((filters?.[priceKey]?.values as FilterRangeValueType)?.min ?? 0),
      +((filters?.[priceKey]?.values as FilterRangeValueType)?.max ?? 0),
    ];

    const handleApplyFilter = useCallback(
      (state) => {
        onApplyFilter(state);
      },
      [onApplyFilter],
    );

    const priceFilter = useMemo(() => {
      return price.reduce((acc, item, index) => {
        // Don't trigger query if prices are 0 or equals to default values
        if (item && item !== defaultPriceValues[index]) {
          acc[index ? "max" : "min"] = String(item);
        }
        return acc;
      }, {} as any);
    }, [price]);

    useEffect(() => {
      const filters = {
        ...(Object.keys(priceFilter).length && { [priceKey]: priceFilter }),
        ...(producerNames.length && { WineProducerName: producerNames }),
        ...(productionCountries.length && { WineProductionCountry: productionCountries }),
        ...(productionRegions.length && { WineProductionRegion: productionRegions }),
        ...(productionYears.length && { WineProductionYear: productionYears }),
        ...(bottleVolumes.length && { WineBottleVolume: bottleVolumes }),
        ...(ratingRPs.length && { RatingRP: ratingRPs }),
      };

      setSearchParams(
        {
          ...filters,
          ...(WineNames.length && { WineName: WineNames }),
          [priceKey]: Object.values(priceFilter),
        },
        { replace: true },
      );
      handleApplyFilter(filters); // trigger firstSaleApi
    }, [
      price,
      producerNames,
      productionCountries,
      productionRegions,
      productionYears,
      bottleVolumes,
      ratingRPs,
    ]);
    //TODO: refactor
    // for search by WineName
    useEffect(() => {
      if (searchParams.toString() === "") {
        // crutch
        setWineNames([]);
        return;
      }
      // @ts-ignore: Unreachable code error
      if (!searchParams.has("WineName") && WineNames !== []) {
        setWineNames([]);
        return;
      } else {
        setWineNames(searchParams.getAll("WineName"));
      }
      // console.log(searchParams.getAll("WineName"));
      // trigger firstSaleApi
      // handleApplyFilter(
      //   searchParams.has("WineName") && {
      //     WineName: searchParams.getAll("WineName"),
      //   },
      // );
    }, [searchParams]);

    const handleClearAll = useCallback(() => {
      setPrice([0, 0]);
      setWineNames([]);
      setProducerNames([]);
      setProductionCountries([]);
      setProductionRegions([]);
      setProductionYears([]);
      setBottleVolumes([]);
      setRatingRPs([]);
      clearRangeSliderStateFn && clearRangeSliderStateFn.current?.();
    }, [
      setPrice,
      setWineNames,
      setProducerNames,
      setProductionCountries,
      setProductionRegions,
      setProductionYears,
      setBottleVolumes,
      setRatingRPs,
      clearRangeSliderStateFn,
    ]);

    return (
      <div className="filters">
        <div className="filters__top-actions">
          <span onClick={handleClearAll}>Очистить</span>
          <span onClick={onClose}>Готово</span>
        </div>
        <h3 className="filters__title">Фильтры</h3>
        <PriceFilter
          values={defaultPriceValues}
          onChangeValue={setPrice}
          onClearCallback={(callback) => (clearRangeSliderStateFn.current = callback)}
        />
        <WineProducerFilter
          title={filters.WineProducerName?.alias}
          values={producerNames}
          options={filters.WineProducerName?.values as FilterSelectValueType[]}
          onChangeValue={setProducerNames}
        />
        <WineCountryFilter
          title={filters.WineProductionCountry?.alias}
          values={productionCountries}
          options={filters.WineProductionCountry?.values as FilterSelectValueType[]}
          onChangeValue={setProductionCountries}
        />
        <span id="for-region-and-year-filter-hint">
          <WineRegionFilter
            title={filters.WineProductionRegion?.alias}
            values={productionRegions}
            options={filters.WineProductionRegion?.values as FilterSelectValueType[]}
            onChangeValue={setProductionRegions}
          />
          <WineYearFilter
            title={filters.WineProductionYear?.alias}
            values={productionYears}
            options={filters.WineProductionYear?.values as FilterSelectValueType[]}
            onChangeValue={setProductionYears}
          />
        </span>
        <WineVolumeFilter
          title={filters.WineBottleVolume?.alias}
          values={bottleVolumes}
          options={filters.WineBottleVolume?.values as FilterSelectValueType[]}
          onChangeValue={setBottleVolumes}
        />
        <span id="for-rating-rp-filter-hint">
          <RatingRPFilter
            title={filters.RatingRP?.alias}
            values={ratingRPs}
            options={filters.RatingRP?.values as FilterSelectValueType[]}
            onChangeValue={setRatingRPs}
          />
        </span>
      </div>
    );
  },
);
export default MultiFilters;
