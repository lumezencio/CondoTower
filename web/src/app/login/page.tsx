"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Building2, Shield, Zap, BarChart3 } from "lucide-react";
import AppBackground from "@/components/layout/AppBackground";
import { Button3D, Input } from "@/components/ui/forms";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const { push } = useToast();
  const [email, setEmail] = useState("admin@condotech.com");
  const [password, setPassword] = useState("Admin@2025!");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string|null; password?: string|null; }>({});

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const features = [
    { icon: Building2, title: "Condomínio Inteligente", description: "Gestão completa de pequeno porte" },
    { icon: Shield,     title: "Segurança Avançada",   description: "Criptografia e auditoria" },
    { icon: BarChart3,  title: "Painéis em Tempo Real",description: "Indicadores de arrecadação e avisos" },
    { icon: Zap,        title: "Alta Performance",     description: "Interface fluida e responsiva" },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (!email) err.email = "Email é obrigatório";
    else if (!validateEmail(email)) err.email = "Email inválido";
    if (!password) err.password = "Senha é obrigatória";
    setErrors(err);
    if (err.email || err.password) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const body = await res.json().catch(()=>({}));
        setErrors({ password: body?.message || "Email ou senha incorretos." });
        push({ title: "Falha no login", message: body?.message || "Verifique suas credenciais.", kind: "error" });
        return;
      }
      if (remember) localStorage.setItem("remember_email", email);
      else localStorage.removeItem("remember_email");
      push({ title: "Bem-vindo!", message: "Autenticação realizada." , kind: "success" });
      location.assign("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppBackground>
      {/* camada artística extra (rodopios/estrelas) */}
      <div className="absolute inset-0 -z-0 opacity-60
        bg-[radial-gradient(1200px_600px_at_20%_10%,rgba(99,102,241,0.25),transparent),
            radial-gradient(800px_400px_at_80%_20%,rgba(59,130,246,0.18),transparent),
            radial-gradient(900px_500px_at_40%_90%,rgba(99,102,241,0.22),transparent)]" />
      <div className="min-h-dvh grid lg:grid-cols-2 relative">
        {/* Lado esquerdo - branding */}
        <section className="hidden lg:flex items-center justify-center text-white">
          <div className="max-w-lg px-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CONDOTECH</h1>
                <p className="text-sm text-blue-200">Condominium Management</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Gestão condominial<br/>de última geração
            </h2>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Plataforma integrada para boletos, comunicados, reservas e muito mais.
            </p>

            {/* cards de features */}
            <div className="mt-10 grid grid-cols-2 gap-6">
              {features.map((F, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 * i }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                  <F.icon className="w-8 h-8 text-blue-300 mb-3" />
                  <div className="text-white font-semibold mb-1">{F.title}</div>
                  <div className="text-sm text-blue-200/70">{F.description}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-sm text-blue-200/60 flex items-center justify-between">
              <span>© {new Date().getFullYear()} Condotech</span><span>v1.0.0</span>
            </div>
          </div>
        </section>

        {/* Lado direito - formulário */}
        <section className="flex items-center justify-center p-8 bg-slate-50">
          <div className="w-full max-w-md">
            {/* logo mobile */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CONDOTECH</h1>
                <p className="text-sm text-slate-600">Condominium Management</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h2>
              <p className="text-slate-600">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Endereço de Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: null }); }}
                    placeholder="seu@email.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.email ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                   : "border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                  />
                  {email && !errors.email && validateEmail(email) && (
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />{errors.email}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={show ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: null }); }}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.password ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                      : "border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    }`}
                  />
                  <button type="button" onClick={() => setShow(s => !s)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />{errors.password}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Lembrar / Esqueci */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
                         className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"/>
                  <span className="ml-2 text-sm text-slate-700">Lembrar-me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Esqueceu a senha?</a>
              </div>

              {/* Entrar */}
              <Button3D type="submit" disabled={isLoading} className="mt-2">
                {isLoading ? "Entrando..." : <>Entrar no Sistema <ArrowRight className="inline w-5 h-5 ml-1" /></>}
              </Button3D>
            </form>

            <div className="mt-8 text-center text-sm text-slate-600">
              Não possui acesso? <a className="font-semibold text-blue-600 hover:text-blue-700" href="#">Fale com o suporte</a>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-blue-900 mb-1">Ambiente Seguro</div>
                  <div className="text-xs text-blue-700">Seus dados estão protegidos com criptografia de ponta a ponta.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppBackground>
  );
}
