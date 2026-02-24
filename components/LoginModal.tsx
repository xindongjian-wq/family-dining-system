'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { X } from 'lucide-react';

export default function LoginModal() {
  const { userName, setUserName } = useUser();
  const [inputName, setInputName] = useState('');
  const [showModal, setShowModal] = useState(!userName);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim());
      setShowModal(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">欢迎来到家庭点餐系统</h2>
          <p className="text-gray-500 mt-2">请告诉我你是谁</p>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="输入你的名字"
            className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-center"
            autoFocus
          />

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition"
          >
            开始点餐
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          你的名字会保存在本地，下次访问无需重新输入
        </p>
      </div>
    </div>
  );
}
