import React, { useState } from 'react';
import { X, Clock, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useGeneration, GenerationRecord } from '../contexts/GenerationContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getTypeLabel = (type: string, t: any) => {
  switch (type) {
    case 'derivation':
      return t.nav.derivation;
    case 'avatar':
      return t.nav.avatar;
    case 'tryon':
      return t.nav.try_on;
    case 'swap':
      return t.nav.swap;
    default:
      return type;
  }
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return date.toLocaleDateString('zh-CN');
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { records, deleteRecord, clearRecords } = useGeneration();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleRecordClick = (record: GenerationRecord) => {
    // 显示最新的输出图片
    if (record.outputImages.length > 0) {
      setSelectedImage(record.outputImages[0]);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(id);
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有记录吗？')) {
      clearRecords();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">生成历史</h2>
              <span className="text-sm text-gray-500">({records.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Clear All Button */}
          {records.length > 0 && (
            <div className="px-6 py-3 border-b border-gray-100">
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                清空所有记录
              </button>
            </div>
          )}

          {/* Records List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {records.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>暂无生成记录</p>
                <p className="text-sm mt-2">生成的图片会显示在这里</p>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleRecordClick(record)}
                  className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                >
                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3">
                    {record.outputImages.slice(0, 4).map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square bg-white rounded overflow-hidden border border-gray-200"
                      >
                        <img
                          src={img}
                          alt={`Result ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="px-3 pb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {getTypeLabel(record.type, t)}
                      </span>
                      <span className="text-gray-500">{formatTime(record.timestamp)}</span>
                    </div>
                    {record.status === 'failed' && (
                      <p className="text-xs text-red-500 mt-1">生成失败</p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, record.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full p-2"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
