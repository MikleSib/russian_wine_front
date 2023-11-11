interface CountProps {
  itemsCount?: number;
}

function Count({ itemsCount = 0 }: CountProps) {
  return (
    <div className="basket_link_count d-flex aling-items-center justify-content-center">
      {itemsCount > 99 ? "99+" : itemsCount}
    </div>
  );
}

export default Count;
