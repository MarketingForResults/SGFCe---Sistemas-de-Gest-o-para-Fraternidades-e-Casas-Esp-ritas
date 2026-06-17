import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, AlertCircle, Heart, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Colaborador } from '../types';

interface LoginProps {
  colaboradores: Colaborador[];
  onLoginSuccess: (user: { name: string; email: string; role: string; isAdmin: boolean }) => void;
  onAddColaborador: (newColab: Colaborador) => void;
}

export default function Login({ colaboradores, onLoginSuccess, onAddColaborador }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Recovery panel state
  const [isRecovery, setIsRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (isSignUp && !name) {
      setError('Por favor, preencha seu nome ou apelido para o cadastro.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSignUp) {
      // Check if email already exists
      const emailExists = colaboradores.some(c => c.email.toLowerCase() === cleanEmail);
      if (emailExists) {
        setError('Este e-mail já está cadastrado no sistema. Por favor, acesse usando sua conta.');
        return;
      }

      if (password.length < 4) {
        setError('A senha de acesso espiritual/administração deve ter no mínimo 4 caracteres.');
        return;
      }

      // Create new Colaborador
      const newColab: Colaborador = {
        id: `colab-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        cargo: 'Voluntário',
        permissions: { admin: false, atendimento: true, financeiro: false, cadastro: true },
        active: true,
        password: password
      };

      onAddColaborador(newColab);
      
      // Auto login in the app
      onLoginSuccess({
        name: newColab.name,
        email: newColab.email,
        role: newColab.cargo,
        isAdmin: false
      });
      
    } else {
      // Find the collaborator in database
      const foundColab = colaboradores.find(c => c.email.toLowerCase() === cleanEmail);
      
      if (!foundColab) {
        setError('Este e-mail não foi encontrado no cadastro do SGFCe. Caso seja novo tarefeiro, use o link "Não possui cadastro? Crie seu perfil" abaixo.');
        return;
      }

      if (!foundColab.active) {
        setError('Sua conta de Trabalhador no SGFCe está atualmente inativa. Contate a Presidência para reativar seu acesso.');
        return;
      }

      // Check password
      const correctPassword = foundColab.password || '123456'; // Default initial workers have '123456'
      if (password !== correctPassword) {
        setError('Senha incorreta para esta credencial. Tente novamente.');
        return;
      }

      // Success!
      onLoginSuccess({
        name: foundColab.name,
        email: foundColab.email,
        role: foundColab.cargo,
        isAdmin: foundColab.permissions.admin
      });
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recoveryEmail) {
      setError('Insira seu e-mail cadastrado.');
      return;
    }
    
    // Check if recovery email exists
    const cleanRecoveryEmail = recoveryEmail.trim().toLowerCase();
    const emailExists = colaboradores.some(c => c.email.toLowerCase() === cleanRecoveryEmail);
    
    if (!emailExists) {
      setError('E-mail não encontrado no cadastro de colaboradores.');
      return;
    }

    setRecoverySent(true);
    setSuccessMsg(`Instruções de recuperação enviadas com sucesso para ${recoveryEmail}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden relative font-sans p-4">
      {/* Dynamic Chakra background lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-chakra-6)] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-chakra-4)] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-[var(--color-chakra-3)] rounded-full filter blur-[140px] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative z-10"
      >
        {/* Colorful Chakra spectrum top-bar */}
        <div className="h-2 w-full chakra-gradient" />

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--color-chakra-6)] to-[var(--color-chakra-5)] text-white shadow-lg mb-4">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h1 id="app-title" className="text-3xl font-display font-bold text-slate-800 tracking-tight">
              SGFCe
            </h1>
            <p className="text-sm text-slate-550 mt-2 font-display">
              Gestão de Fraternidades e Centros Espíritas
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-750 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-750 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isRecovery ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-display">Nome ou Apelido</label>
                  <input
                    id="login-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como prefere ser chamado"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-display"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-display">E-mail de Trabalho Espírita</label>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@fraternidade.org"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-650 font-display">Senha de Acesso</label>
                  <button
                    type="button"
                    onClick={() => setIsRecovery(true)}
                    className="text-xs text-indigo-650 font-semibold hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha de acesso"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                    required
                  />
                  <button
                    id="toggle-password-visibility"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-550 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-505"
                  />
                  <span>Manter conectado neste dispositivo</span>
                </label>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full bg-indigo-605 bg-indigo-600 text-white hover:bg-indigo-700 font-display font-semibold rounded-xl py-3.5 transition-all text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 mt-4 cursor-pointer text-center"
              >
                <span>{isSignUp ? 'Finalizar Cadastro' : 'Entrar no Sistema'}</span>
              </button>

              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
                >
                  {isSignUp ? 'Já possui conta de tarefeiro? Faça seu login' : 'Não possui cadastro? Cadastre-se como Tarefeiro'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-5">
              <div className="text-slate-600 text-sm mb-4 leading-relaxed font-sans">
                Insira o seu e-mail cadastrado de colaborador para redefinir as credenciais administrativas.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-display">E-mail do Colaborador</label>
                <input
                  id="recovery-email-input"
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="exemplo@fraternidade.org"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                  required
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecovery(false);
                    setError('');
                    setSuccessMsg('');
                    setRecoverySent(false);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-755 border border-slate-200 font-display font-semibold rounded-xl py-3 text-sm transition-all"
                >
                  Voltar
                </button>
                <button
                  id="recovery-submit-btn"
                  type="submit"
                  className="flex-[2] bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-display font-semibold rounded-xl py-3 text-sm transition-all shadow-md cursor-pointer text-center"
                >
                  Confirmar Recuperação
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* Decorative credit footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-xs font-display">
        SGFCe v1.2.0 • Sistema Auxiliar Unificado de Caridade Espírita
      </div>
    </div>
  );
}
