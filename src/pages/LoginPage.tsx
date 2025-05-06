import React, { useState } from "react";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const testEmail = "test@example.com";
  const testPassword = "password123";

  const handleLogin = () => {
    setError("");
    if (email === testEmail && password === testPassword) {
      console.log("Вход успешен");
      localStorage.setItem("isAuthenticated", "true");
      navigate("/"); // Перенаправляем на главную страницу
    } else {
      setError("Неверный email или пароль");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="px-8 py-6 mx-auto mt-4 text-left bg-white shadow-lg rounded-lg dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-white">
          Вход
        </h2>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={testEmail}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={testPassword}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="mt-6">
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Войти
            </button>
          </div>
          {/* Убрал ссылку на регистрацию, так как она больше не нужна */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
