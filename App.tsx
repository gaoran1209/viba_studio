import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { GenerationProvider } from './contexts/GenerationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Feature Pages (using existing views for now)
import { DerivationView } from './views/DerivationView';
import { AvatarView } from './views/AvatarView';
import { TryOnView } from './views/TryOnView';
import { SwapView } from './views/SwapView';
import { SystemPromptsView } from './views/SystemPromptsView';

// New Pages
import { SettingsPage } from './pages/SettingsPage';

// Layout Components
import { AppLayout } from './components/AppLayout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ApiKeyProvider>
          <LanguageProvider>
            <GenerationProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Navigate to="/derivation" replace />} />
                    <Route path="derivation" element={<DerivationView />} />
                    <Route path="avatar" element={<AvatarView />} />
                    <Route path="tryon" element={<TryOnView />} />
                    <Route path="swap" element={<SwapView />} />
                    <Route path="prompts" element={<SystemPromptsView />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </GenerationProvider>
          </LanguageProvider>
        </ApiKeyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
