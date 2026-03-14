import {createContext, type ReactNode, useContext, useState} from "react";

type StylingType = {
    theme: string,
    setTheme: (_: string) => void,
}

const StylingProviderContext = createContext<StylingType | null>(null);

export function StylingProvider({children}: { children: ReactNode }) {
    const [theme, setTheme] = useState<string>("dark");

    return <StylingProviderContext.Provider value={{theme, setTheme}}>
        {children}
    </StylingProviderContext.Provider>
}

export function useStyling() {
    const ctx = useContext(StylingProviderContext);
    if (!ctx) throw new Error("useStyling must be used within StylingProvider");
    return ctx;
}
