import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type GenerationType = 'derivation' | 'avatar' | 'tryon' | 'swap';

export interface GenerationRecord {
  id: string;
  type: GenerationType;
  timestamp: number;
  inputImages: string[]; // Base64 or URLs
  outputImages: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface GenerationContextType {
  records: GenerationRecord[];
  addRecord: (record: Omit<GenerationRecord, 'id' | 'timestamp'>) => void;
  updateRecord: (id: string, updates: Partial<GenerationRecord>) => void;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  getRecordsByType: (type: GenerationType) => GenerationRecord[];
}

const STORAGE_KEY = 'generation_cache';

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<GenerationRecord[]>([]);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecords(parsed);
        console.log('📦 加载了缓存的生成记录:', parsed.length, '条');
      }
    } catch (error) {
      console.error('加载缓存失败:', error);
    }
  }, []);

  // Save to sessionStorage whenever records change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('保存缓存失败:', error);
    }
  }, [records]);

  const addRecord = (record: Omit<GenerationRecord, 'id' | 'timestamp'>) => {
    const newRecord: GenerationRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setRecords(prev => [newRecord, ...prev]);
    console.log('➕ 添加生成记录:', newRecord.id);
  };

  const updateRecord = (id: string, updates: Partial<GenerationRecord>) => {
    setRecords(prev =>
      prev.map(record =>
        record.id === id ? { ...record, ...updates } : record
      )
    );
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
    console.log('🗑️ 删除生成记录:', id);
  };

  const clearRecords = () => {
    setRecords([]);
    console.log('🧹 清空所有生成记录');
  };

  const getRecordsByType = (type: GenerationType) => {
    return records.filter(record => record.type === type);
  };

  return (
    <GenerationContext.Provider
      value={{
        records,
        addRecord,
        updateRecord,
        deleteRecord,
        clearRecords,
        getRecordsByType,
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
};

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};
