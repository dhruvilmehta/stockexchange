'use client';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// const SERVICE_URL = 'http://localhost:3001/auth';
const SERVICE_URL = 'https://stockexchange-4p5n.onrender.com/auth';

export const Login = () => {
  const [username, setUsername] = useState<string>('dhruvil');
  const [password, setPassword] = useState<string>('1234');
  const router = useRouter();

  const handleLogin = async () => {
    console.log(username, password);
    if (username === '' || password === '') return;
    try {
      const response = await axios.post(`${SERVICE_URL}/login`, {
        username,
        password,
      });
      if (response.status === 201) {
        localStorage.setItem('token', response.data.token);
        router.push(localStorage.getItem('redirectUrl') || '/');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log(axiosError.response?.data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Login
        </h2>
        <div className="text-center text-red-500">
          Dummy credentials are already entered. Click submit to Login
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-black"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-black"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Submit
        </button>
        <div className="mt-4 text-center">
          <span className="text-black">Not signed up? </span>
          <a href="/signup" className="text-blue-500 hover:underline">
            Click here
          </a>
        </div>
      </div>
    </div>
  );
};
