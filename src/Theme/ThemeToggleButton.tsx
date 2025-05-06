import { useTheme } from "../Theme/useTheme";
import { Sun, Moon } from "lucide-react"; // Используем красивые иконки из lucide-react

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border 
        ${
          isDark
            ? "bg-gradient-to-tr from-gray-800 to-gray-700 border-gray-600"
            : "bg-gradient-to-tr from-yellow-300 to-yellow-400 border-yellow-500"
        } 
        hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDark ? "focus:ring-yellow-400" : "focus:ring-gray-300"
        }`}
    >
      <div
        className={`transition-transform duration-500 ${
          isDark ? "rotate-0 scale-100" : "-rotate-180 scale-90"
        }`}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-yellow-300" />
        ) : (
          <Sun className="w-5 h-5 text-white" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggleButton;
