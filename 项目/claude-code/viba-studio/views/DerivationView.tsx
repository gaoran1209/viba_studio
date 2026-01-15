import React, { useState, useRef, useEffect } from 'react';
import { generateDerivations } from '../services/geminiService';
import { Layers, Loader2, Download, Maximize2, Plus, X, Upload } from 'lucide-react';
import { ImageModal } from '../components/ImageModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useGeneration } from '../contexts/GenerationContext';

interface Job {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: string[];
  description?: string;
  creativity: number;
  statusText?: string;
}

export const DerivationView: React.FC = () => {
  const { t } = useLanguage();
  const { addRecord } = useGeneration();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Input State
  const [creativity, setCreativity] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-process queue effect
  useEffect(() => {
    const processNextJob = async () => {
      if (isProcessingQueue) return;

      const nextJobIndex = jobs.findIndex(j => j.status === 'pending');
      if (nextJobIndex === -1) return;

      setIsProcessingQueue(true);
      const job = jobs[nextJobIndex];

      // Update status to processing
      setJobs(prev => prev.map((j, i) => i === nextJobIndex ? { ...j, status: 'processing', statusText: t.common.processing } : j));

      try {
        const { images, description } = await generateDerivations(job.file, job.creativity, undefined, (status) => {
           let text = t.common.processing;
           if (status === 'processing_step1') text = 'Analyzing Image...';
           if (status === 'processing_step2') text = 'Generating Variations...';
           if (status === 'retrying') text = t.common.retrying;

           setJobs(prev => prev.map((j, i) => i === nextJobIndex ? { ...j, statusText: text } : j));
        });

        setJobs(prev => prev.map((j, i) => i === nextJobIndex ? {
          ...j,
          status: 'completed',
          results: images,
          description: description,
          statusText: undefined
        } : j));

        // 保存到生成历史
        addRecord({
          type: 'derivation',
          inputImages: [job.previewUrl],
          outputImages: images,
          parameters: { creativity: job.creativity, description },
          status: 'completed',
        });

      } catch (error: any) {
        console.error(error);
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        console.error('Detailed error:', errorMsg);
        setJobs(prev => prev.map((j, i) => i === nextJobIndex ? { ...j, status: 'failed', statusText: `${t.common.failed}: ${errorMsg}` } : j));

        // 保存失败记录
        addRecord({
          type: 'derivation',
          inputImages: [job.previewUrl],
          outputImages: [],
          parameters: { creativity: job.creativity },
          status: 'failed',
          error: errorMsg,
        });
      } finally {
        setIsProcessingQueue(false);
      }
    };

    if (!isProcessingQueue && jobs.some(j => j.status === 'pending')) {
      processNextJob();
    }
  }, [jobs, isProcessingQueue, t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newJobs: Job[] = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        results: [],
        creativity: creativity,
      }));
      // Add new jobs to the TOP of the list
      setJobs(prev => [...newJobs, ...prev]);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ImageModal 
        isOpen={!!previewImage} 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      {/* Top Control Bar */}
      <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.derivation.title}</h2>
          <p className="text-sm text-gray-500">{t.derivation.batch_desc}</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="w-48">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">{t.derivation.creativity_level}</label>
                <span className="text-xs text-gray-500">{creativity * 10}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={creativity}
                onChange={(e) => setCreativity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
           </div>

           <button 
             onClick={() => fileInputRef.current?.click()}
             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-md transition-all active:scale-95"
           >
             <Plus size={18} />
             {t.derivation.add_images}
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             multiple 
             accept="image/png, image/jpeg, image/webp" 
             onChange={handleFileSelect}
           />
        </div>
      </div>

      {/* Main Feed Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6">
        {jobs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
             <Layers size={64} className="mb-4 text-gray-300" />
             <p className="text-lg font-medium">{t.derivation.empty_queue}</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col lg:flex-row h-auto lg:h-[400px]">
              
              {/* Left: Info Panel (Source & Description) */}
              <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-100 p-6 flex flex-col bg-white">
                 <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                      ${job.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        job.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                        job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {job.status === 'completed' ? t.derivation.job_completed : 
                       job.status === 'processing' ? t.derivation.job_processing : 
                       job.status === 'failed' ? t.derivation.job_failed : t.derivation.job_pending}
                    </span>
                    <button onClick={() => removeJob(job.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                 </div>

                 <div className="mb-6">
                   <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.derivation.source_info}</h4>
                   <div className="flex gap-3 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <img src={job.previewUrl} alt="Source" className="w-12 h-12 object-cover rounded-md" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 truncate w-40">{job.file.name}</p>
                        <p className="text-[10px] text-gray-500">Creativity: {job.creativity * 10}%</p>
                      </div>
                   </div>
                 </div>

                 <div className="flex-1 overflow-y-auto min-h-[100px]">
                   <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.derivation.prompt_generated}</h4>
                   <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono">
                      {job.description || (
                        <span className="text-gray-400 italic">
                          {job.status === 'completed' ? 'No description available' : 'Waiting for analysis...'}
                        </span>
                      )}
                   </div>
                 </div>
              </div>

              {/* Right: Results Grid (1x4) */}
              <div className="flex-1 bg-gray-50/30 p-4 lg:p-6 overflow-y-auto lg:overflow-hidden">
                 {job.status === 'completed' ? (
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                      {job.results.map((url, idx) => (
                        <div 
                          key={idx} 
                          className="relative group rounded-xl overflow-hidden bg-gray-200 cursor-pointer border border-gray-100 h-64 lg:h-auto"
                          onClick={() => setPreviewImage(url)}
                        >
                          <img src={url} alt={`Var ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <Maximize2 className="text-white" size={20} />
                          </div>
                          <a 
                             href={url} 
                             download={`variation-${job.id}-${idx}.png`} 
                             className="absolute bottom-2 right-2 bg-white/90 text-gray-900 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                             onClick={(e) => e.stopPropagation()}
                           >
                            <Download size={14} />
                          </a>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl min-h-[300px] p-4">
                      {job.status === 'failed' ? (
                        <div className="text-center text-red-500 max-w-full">
                          <p className="font-medium mb-2">{t.common.failed}</p>
                          <p className="text-xs break-words text-red-400" title={job.statusText}>{job.statusText}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          {job.status === 'processing' ? (
                             <Loader2 className="animate-spin text-blue-500 mb-3 mx-auto" size={32} />
                          ) : (
                             <div className="w-8 h-8 rounded-full border-2 border-gray-200 mb-3 mx-auto" />
                          )}
                          <p className="font-medium text-gray-600">
                            {job.status === 'processing' ? job.statusText : t.derivation.job_pending}
                          </p>
                        </div>
                      )}
                   </div>
                 )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
