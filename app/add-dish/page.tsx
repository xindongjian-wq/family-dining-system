'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/types';
import { ArrowLeft, Camera, X } from 'lucide-react';

export default function AddDishPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState('');

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（GitHub API 限制 25MB，这里限制 3MB）
    if (file.size > 3 * 1024 * 1024) {
      setError('图片太大，请选择 3MB 以内的图片');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 压缩图片
      const compressedBase64 = await compressImage(file, 800);

      // 上传到 GitHub
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressedBase64 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '上传失败');
      }

      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  }

  async function compressImage(file: File, maxWidth: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new (window as any).Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // 计算缩放比例
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // 绘制并压缩
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError('请输入菜品名称');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          image: imageUrl,
        }),
      });

      if (res.ok) {
        alert('添加成功！');
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || '添加失败，请重试');
      }
    } catch (err) {
      setError('添加失败，请重试');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center pr-8">
            添加菜品
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto pb-20">
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            菜品图片
          </label>
          <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ minHeight: '200px' }}>
            {imageUrl && !imageError ? (
              <div className="relative w-full">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-auto"
                  onError={() => setImageError(true)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setImageError(false);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-16 cursor-pointer hover:bg-gray-200 transition">
                <Camera size={48} className="text-gray-400 mb-2" />
                <span className="text-gray-500">点击上传图片</span>
                <span className="text-xs text-gray-400 mt-1">支持 JPG、PNG，最大 3MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white">上传中...</div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            菜品名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：番茄炒蛋"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  category === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="介绍一下这道菜..."
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-lg"
        >
          {uploading ? '添加中...' : '添加菜品'}
        </button>
      </form>
    </div>
  );
}
