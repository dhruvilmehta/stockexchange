'use client';
import axios, { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SERVICE_URL = 'https://exchangebackend.dhruvilspace.site/auth';
// const SERVICE_URL = 'https://stockexchange-4p5n.onrender.com/auth';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    // console.log(username, password);
    if (username === '' || password === '') return;
    try {
      const response = await axios.post(`${SERVICE_URL}/register`, {
        username,
        password,
      });
      if (response.status === 201) {
        localStorage.setItem('token', response.data.token);
        router.push(localStorage.getItem('redirectUrl') || '/');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      // console.log(axiosError.response?.data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Sign Up
        </h2>
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
          onClick={handleSignup}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Submit
        </button>
        <div className="mt-4 text-center">
          <span className="text-black">Already have an account? </span>
          <a href="/login" className="text-blue-500 hover:underline">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
