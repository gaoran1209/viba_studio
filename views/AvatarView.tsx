import React, { useState, useEffect } from 'react';
import { Upload, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { trainAvatar, fileToBase64 } from '../services/geminiService';
import { ImageModal } from '../components/ImageModal';
import { useLanguage } from '../contexts/LanguageContext';

// Helper component for individual thumbnail
const AvatarThumbnail: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative w-32 h-40 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
        {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
            <div className="animate-pulse w-full h-full bg-gray-200" />
        )}
        <button 
          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
            <Plus className="rotate-45" size={14} />
        </button>
    </div>
  );
};

export const AvatarView: React.FC = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [resultAvatar, setResultAvatar] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Limit to 3 files total
      const newFiles = Array.from(e.target.files).slice(0, 3 - files.length);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleTrain = async () => {
    if (files.length < 1) return;
    setIsTraining(true);
    setStatusText(t.avatar.training);
    try {
      const avatarUrl = await trainAvatar(files, (status) => {
        if (status === 'retrying') setStatusText(t.common.retrying);
      });
      setResultAvatar(avatarUrl);
    } catch (error) {
      console.error(error);
      alert(t.common.failed);
    } finally {
      setIsTraining(false);
      setStatusText('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-center">
      <ImageModal 
        isOpen={!!previewImage} 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900">{t.avatar.title}</h2>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{t.avatar.desc}</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-12 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20"></div>

        {!resultAvatar ? (
          <>
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {files.map((file, idx) => (
                <AvatarThumbnail key={idx} file={file} onRemove={() => removeFile(idx)} />
              ))}
              
              {files.length < 3 && (
                <label className="w-32 h-40 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors text-blue-600 group">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <span className="text-sm font-medium">{t.avatar.add_photo}</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                </label>
              )}
            </div>

            <button
              onClick={handleTrain}
              disabled={files.length === 0 || isTraining}
              className={`px-12 py-4 rounded-full text-lg font-medium transition-all flex items-center gap-3 ${
                files.length === 0 || isTraining
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl hover:shadow-2xl hover:-translate-y-1'
              }`}
            >
              {isTraining ? (
                <>
                  <Loader2 className="animate-spin" />
                  {statusText}
                </>
              ) : (
                <>
                  {t.avatar.start_training}
                </>
              )}
            </button>
            <p className="mt-4 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{t.avatar.time_est}</p>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <div 
              className="w-80 aspect-[3/4] rounded-2xl border-4 border-white shadow-2xl overflow-hidden mb-6 relative cursor-pointer group"
              onClick={() => setPreviewImage(resultAvatar)}
            >
               <img src={resultAvatar} alt="Generated Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
               <div className="absolute bottom-4 right-4 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                 <CheckCircle2 size={16} />
               </div>
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded-full">{t.common.click_to_view}</span>
               </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.avatar.ready_title}</h3>
            <p className="text-gray-500 mb-6">{t.avatar.ready_desc}</p>
            <div className="flex gap-4">
              <button onClick={() => setResultAvatar(null)} className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">
                {t.avatar.train_another}
              </button>
              <a href={resultAvatar} download="my-avatar.png" className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
                {t.avatar.download}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};