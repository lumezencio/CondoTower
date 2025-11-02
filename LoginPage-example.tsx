// src/app/(auth)/login/page.tsx - WORDCONDOS
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password, data.remember);
      
      toast({
        type: 'success',
        title: 'Login realizado com sucesso!',
        message: 'Bem-vindo ao WORDCONDOS',
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao fazer login',
        message: error.message || 'Verifique suas credenciais e tente novamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
        {/* Grid Pattern de fundo */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Orbs decorativos */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-pulse-soft" 
             style={{ animationDelay: '1s' }} />
        
        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo/Icon */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="mb-8 inline-block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <Building2 className="w-20 h-20 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl font-bold mb-4"
            >
              WORDCONDOS
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-primary-100 max-w-md"
            >
              Sistema de Gestão Inteligente para Condomínios
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-12 flex flex-col gap-4 text-left max-w-md"
            >
              {[
                { icon: '✨', text: 'Interface moderna e intuitiva' },
                { icon: '🔒', text: 'Segurança de nível enterprise' },
                { icon: '📊', text: 'Relatórios completos e em tempo real' },
                { icon: '🚀', text: 'Gestão eficiente e simplificada' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-white/90">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Ilustração de cidade no rodapé */}
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30">
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path
              fill="rgba(255, 255, 255, 0.1)"
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/20 relative">
        {/* Grid Pattern de fundo */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #3B82F6 1px, transparent 1px),
              linear-gradient(to bottom, #3B82F6 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Card de Login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200/50 backdrop-blur-sm p-8 md:p-10">
            {/* Logo Mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">WORDCONDOS</h2>
            </div>
            
            {/* Cabeçalho */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-neutral-600">
                Faça login para acessar o sistema
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={`
                      block w-full pl-10 pr-3 py-3
                      border rounded-lg
                      transition-all duration-200
                      ${errors.email 
                        ? 'border-error focus:border-error focus:ring-error' 
                        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                      }
                      focus:ring-2 focus:ring-offset-0
                      placeholder:text-neutral-400
                    `}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-error"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`
                      block w-full pl-10 pr-10 py-3
                      border rounded-lg
                      transition-all duration-200
                      ${errors.password 
                        ? 'border-error focus:border-error focus:ring-error' 
                        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500'
                      }
                      focus:ring-2 focus:ring-offset-0
                      placeholder:text-neutral-400
                    `}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-error"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Lembrar-me e Esqueci a senha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('remember')}
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label 
                    htmlFor="remember" 
                    className="ml-2 block text-sm text-neutral-700"
                  >
                    Lembrar-me
                  </label>
                </div>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading}
                icon={!isLoading && <ArrowRight className="w-5 h-5" />}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">
                    ou
                  </span>
                </div>
              </div>
            </div>

            {/* Criar Conta */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Não tem uma conta?{' '}
                <Link
                  href="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Solicitar cadastro
                </Link>
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-8 text-center text-sm text-neutral-500">
            <p>
              © 2025 WORDCONDOS. Todos os direitos reservados.
            </p>
            <div className="mt-2 flex justify-center gap-4">
              <Link href="/terms" className="hover:text-primary-600 transition-colors">
                Termos de Uso
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-primary-600 transition-colors">
                Privacidade
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
