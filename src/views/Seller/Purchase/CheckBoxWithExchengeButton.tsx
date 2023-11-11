import React, { useState, useEffect, useRef } from "react";

interface ExchangeButtonProps {
  onClick: () => void;
}

export const ExchangeButton: React.FC<ExchangeButtonProps> = ({ onClick }) => (
  <button onClick={onClick}>Exchange</button>
);

export const CheckboxWithExchangeButton: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [showExchangeButton, setShowExchangeButton] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleExchangeClick = () => {
    console.log("Exchange button was clicked!");
  };

  function handleCheckboxChange() {
    setIsChecked(!isChecked);
  }

  useEffect(() => {
    if (isChecked) {
      timerRef.current = setTimeout(() => {
        setShowExchangeButton(true);
      }, 2000);
    } else {
      timerRef.current = setTimeout(() => {
        setShowExchangeButton(false);
      }, 2000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isChecked]);

  return (
    <div>
      <label>
        <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
      </label>
      <nav>{showExchangeButton && <ExchangeButton onClick={handleExchangeClick} />}</nav>
    </div>
  );
};

export default CheckboxWithExchangeButton;
