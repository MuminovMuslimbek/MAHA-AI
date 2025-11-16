import { createContext, useContext, useState, useEffect } from "react";

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
}

interface TelegramContextValue {
    usern: TelegramUser | null;
}

const TelegramContext = createContext<TelegramContextValue>({
    usern: null,
});

export const TelegramProvider = ({ children }: any) => {
    const [usern, setUser] = useState<TelegramUser | null>(null);

    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
            tg.ready();
            setUser(tg.initDataUnsafe?.user || null);
        }
    }, []);

    return (
        <TelegramContext.Provider value={{ usern }}>
            {children}
        </TelegramContext.Provider>
    );
};

export const useTelegram = () => useContext(TelegramContext);
