import { BaseButton } from "components/common";
import styles from "./Counter.module.scss";
import { ReactComponent as PlusSign } from "assets/icons/plus-sign.svg";
import { ReactComponent as MinusSign } from "assets/icons/minus-sign.svg";
import clsx from "clsx";

interface CounterProps {
  value?: number;
  onChange: (value: number) => void;
  className?: string;
  min?: number;
}

function Counter({ value = 0, onChange, className, min = 1 }: CounterProps) {
  const handleMinus = () => onChange(value <= min ? value : value - 1);
  const handlePlus = () => onChange(value + 1);

  const handleChangeValue = (value: number) => {
    if (value >= min) {
      onChange(value);
    }
  };

  return (
    <div className={clsx(styles.counter, className)}>
      <BaseButton size="small" theme="outlined" color="gray" className={styles.counterButton}>
        <MinusSign onClick={handleMinus} />
      </BaseButton>
      <input
        type="number"
        className={styles.counterInput}
        value={value}
        onChange={(e) => handleChangeValue(Number(e.target.value))}
      />
      <BaseButton size="small" theme="outlined" color="gray" className={styles.counterButton}>
        <PlusSign onClick={handlePlus} />
      </BaseButton>
    </div>
  );
}

export default Counter;
