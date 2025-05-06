import { useContext } from "react";
import ThemeContext from "./ThemeContext";
import type { ThemeContextType } from "./ThemeContext";

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
