import React, { useState } from "react";

interface Product {
  checked: any;
  id: number;
  name: string;
}

interface ProductProps {
  product: Product;
  onProductChange: (product: Product) => void;
}

const Product: React.FC<ProductProps> = ({ product, onProductChange }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newProduct = { ...product, checked: event.target.checked };
    onProductChange(newProduct);
    setIsChecked(event.target.checked);
  };

  return (
    <div>
      <label>
        <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
        {product.name}
      </label>
    </div>
  );
};

export default Product;
