import React, { createContext, useContext, useEffect, useState } from "react";

interface OnlineStatusContextValue {
  isOnline: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextValue>({ isOnline: true });

export const OnlineStatusProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return <OnlineStatusContext.Provider value={{ isOnline }}>{children}</OnlineStatusContext.Provider>;
};

export const useOnlineStatus = (): OnlineStatusContextValue => useContext(OnlineStatusContext);
