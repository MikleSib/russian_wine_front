import { useCallback, useMemo, useState } from "react";
import { useMediaQuery } from "./index";

export default function usePagination(props: TUsePaginationProps = {}): TUsePaginationResult {
  const {
    boundaryCount = 1,
    totalPages = 1,
    initialPage = 1,
    hideNextButton = false,
    hidePrevButton = false,
    initialPageSize = 1,
    siblingCount = 1,
    onSetPage,
  } = props;

  const [page, setPage] = useState(initialPage);

  const isMobile = useMediaQuery("(max-width: 767px)");

  const range = (start: number, end: number): number[] => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
  };

  const totalItems = Math.ceil(totalPages / initialPageSize);
  const startPages = useMemo(
    () => range(1, Math.min(boundaryCount, totalPages)),
    [boundaryCount, totalPages],
  );
  const endPages = useMemo(
    () => range(Math.max(totalPages - boundaryCount + 1, boundaryCount + 1), totalPages),
    [boundaryCount, totalPages],
  );

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] - 2,
  );

  const startIndex = initialPageSize * page;
  const endIndex = useMemo(() => {
    const lastPageEndIndex = initialPageSize * (page + 1);

    if (lastPageEndIndex > totalItems) {
      return totalItems - 1;
    }

    return lastPageEndIndex - 1;
  }, [initialPageSize, page, totalItems]);
  const handleSetPage = useCallback(
    (page: number) => {
      setPage(page);
      onSetPage && onSetPage(page);
    },
    [setPage, onSetPage],
  );

  // Basic list of items for render
  // e.g. itemList = ["previous", 1, "ellipsis", 4, 5, 6, "ellipsis", 10, "next"]
  //prettier-ignore
  const itemList = [
    ...(hidePrevButton ? [] : ["previous"]),
    ...(isMobile && siblingsStart >= page ? startPages : !isMobile ? startPages : []),
    // Start ellipsis
    ...(siblingsStart > boundaryCount + 2
      ? ["start-ellipsis"]
      : boundaryCount + 1 < totalPages - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    // End ellipsis
    ...(siblingsEnd < totalPages - boundaryCount - 1
      ? ["end-ellipsis"]
      : totalPages - boundaryCount > boundaryCount
        ? [totalPages - boundaryCount]
        : []),
    ...(isMobile && siblingsEnd < page ? endPages : !isMobile ? endPages : []),
    ...(hideNextButton ? [] : ["next"]),
  ];

  const items = itemList.map((item) => {
    if (typeof item === "number") {
      return {
        onClick: () => handleSetPage(item),
        type: "page",
        page: item,
        selected: item === page,
        disabled: false,
      };
    } else {
      return {
        onClick: () => handleSetPage(item === "previous" ? page - 1 : page + 1),
        type: item as any,
        page: item === "previous" ? page - 1 : page + 1,
        selected: false,
        disabled:
          item.indexOf("ellipsis") === -1 && (item === "next" ? page >= totalPages : page <= 1),
      };
    }
  });

  return {
    items,
    startIndex,
    endIndex,
    currentPage: page,
  };
}
