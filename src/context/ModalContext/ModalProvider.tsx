import React, { FC, ReactNode, createContext, useCallback, useState } from "react";

import "./Modals.styles.scss";

export const Context = createContext<ModalsContext<ReactNode>>({
  onPresent: () => {},
  onDismiss: () => {},
});

const ModalsProvider: FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>();
  const [dataProps, setDataProps] = useState({});
  const [dismiss, setDismiss] = useState(true);

  const handlePresent = useCallback(
    (modalContent: ReactNode, dataProps?: Record<string, any>, withDismiss?: boolean) => {
      setContent(modalContent);
      setIsOpen(true);
      setDataProps(dataProps ?? {});
      !withDismiss && setDismiss(!!withDismiss);
      document.body.classList.add("prevent-scroll");
    },
    [setContent, setIsOpen],
  );

  const handleDismiss = useCallback(() => {
    setContent(undefined);
    setIsOpen(false);
    setDataProps({});
    setDismiss(true);
    document.body.classList.remove("prevent-scroll");
  }, [setContent, setIsOpen]);

  return (
    <Context.Provider
      value={{
        content,
        isOpen,
        onPresent: handlePresent,
        onDismiss: handleDismiss,
      }}
    >
      {children}
      {isOpen && (
        <div className="modalWrapper">
          <div className="modalBackdrop" onClick={dismiss ? handleDismiss : undefined} />
          {React.isValidElement(content) &&
            React.cloneElement(content, {
              onDismiss: handleDismiss,
              dataProps,
            })}
        </div>
      )}
    </Context.Provider>
  );
};

export default ModalsProvider;
