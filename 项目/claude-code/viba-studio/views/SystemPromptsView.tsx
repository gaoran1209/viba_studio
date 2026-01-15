import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PROMPTS, MODEL_NAME, TEXT_MODEL_NAME } from '../services/geminiService';
import { Layers, User, Shirt, RefreshCw } from 'lucide-react';

export const SystemPromptsView: React.FC = () => {
  const { t } = useLanguage();

  const promptItems = [
    {
      icon: Layers,
      title: t.nav.derivation,
      steps: [
        {
          model: TEXT_MODEL_NAME,
          desc: "Step 1: Image Analysis (Image-to-Text)",
          prompt: PROMPTS.derivation_describe
        },
        {
          model: MODEL_NAME,
          desc: "Step 2: Variation Generation (Text-to-Image)",
          prompt: PROMPTS.derivation_generate("[Image Description from Step 1]", 5)
        }
      ],
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: User,
      title: t.nav.avatar,
      steps: [{
        model: MODEL_NAME,
        prompt: PROMPTS.avatar
      }],
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Shirt,
      title: t.nav.try_on,
      steps: [{
        model: MODEL_NAME,
        prompt: PROMPTS.tryOn
      }],
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    },
    {
      icon: RefreshCw,
      title: t.nav.swap,
      steps: [{
        model: MODEL_NAME,
        prompt: PROMPTS.swap
      }],
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">{t.prompts.title}</h2>
        <p className="text-gray-500 mt-2">{t.prompts.desc}</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 bg-gray-50/80 border-b border-gray-200 p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">{t.prompts.feature}</div>
          <div className="col-span-3">{t.prompts.model}</div>
          <div className="col-span-6">{t.prompts.prompt}</div>
        </div>

        <div className="divide-y divide-gray-100">
          {promptItems.map((item, idx) => {
             const Icon = item.icon;
             return (
               <div key={idx} className="grid grid-cols-12 p-6 hover:bg-gray-50/50 transition-colors">
                 <div className="col-span-3 flex items-start gap-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                     <Icon size={18} />
                   </div>
                   <span className="font-medium text-gray-900 mt-1">{item.title}</span>
                 </div>
                 
                 <div className="col-span-9 grid grid-cols-9 gap-4">
                   {item.steps.map((step, stepIdx) => (
                     <React.Fragment key={stepIdx}>
                       <div className="col-span-3">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mt-1">
                           {step.model}
                         </span>
                         {step.desc && (
                           <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
                         )}
                       </div>
                       <div className="col-span-6 mb-2">
                         <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                           <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                             {step.prompt}
                           </pre>
                         </div>
                       </div>
                     </React.Fragment>
                   ))}
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};