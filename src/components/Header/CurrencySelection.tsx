import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { AiFillCaretDown } from "react-icons/ai";
import api from "services/api/api";

const currencyOptions = ["EUR", "USDT"];

export default function SelectionCurrency() {
  const [selectedCurrency, setSelectedCurrency] = useState(
    localStorage.getItem("selected") || "USDT",
  );
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [conversionRate, setConversionRate] = useState(localStorage.getItem("conversionRate") || 1);

  const handleCurrencySelect = async (currency: string) => {
    setSelectedCurrency(currency);
    setModalIsOpen(false);
    localStorage.setItem("selected", currency);
    if (currency === "EUR") {
      setConversionRate(1);
      localStorage.setItem("conversionRate", "1");
    } else if (currency === "USDT") {
      const url = `https://backend.winessy.com/api/v1/public/get_rate_eur_to/USD`;
      try {
        const response: any = await api.get(url);
        setConversionRate(response.response.rate);
        localStorage.setItem("conversionRate", response.response.rate);
      } catch (error) {
        console.log(error);
      }
    }
  };
  // useEffect(() => {
  //   const reloadPage = () => window.location.reload();
  //   if (selectedCurrency === "EUR" || selectedCurrency === "USDT") {
  //     setTimeout(reloadPage, 0);
  //   }
  // }, [selectedCurrency]);
  return (
    <header>
      <div className="currency-container" onClick={() => setModalIsOpen(true)}>
        <span className="currency-text"></span>
        {selectedCurrency}
        <AiFillCaretDown />
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        {currencyOptions.map((currency) => (
          <div key={currency} onClick={() => handleCurrencySelect(currency)}>
            {currency}
          </div>
        ))}
      </Modal>
    </header>
  );
}
