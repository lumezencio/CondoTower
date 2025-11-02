"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, Building2, Shield, Zap, BarChart3 } from "lucide-react";
import AppBackground from "@/components/layout/AppBackground";
import { Button3D } from "@/components/ui/forms";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const { push } = useToast();
  const [email, setEmail] = useState("admin@condotech.com");
  const [password, setPassword] = useState("Admin@2025!");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const valid = (v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !valid(email) || !password) {
      push({ title:"Dados inválidos", message:"Preencha email e senha.", kind:"warning" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const b = await res.json().catch(()=>({}));
        push({ title:"Falha no login", message:b?.message || "Verifique suas credenciais.", kind:"error" });
        return;
      }
      if (remember) localStorage.setItem("remember_email", email); else localStorage.removeItem("remember_email");
      push({ title:"Bem-vindo!", kind:"success" });
      location.assign("/dashboard");
    } finally { setIsLoading(false); }
  }

  const features = [
    { icon: Building2, title: "Condomínio Inteligente", desc: "Gestão completa de pequeno porte" },
    { icon: Shield,    title: "Segurança Avançada",     desc: "Criptografia e auditoria" },
    { icon: BarChart3, title: "Painéis em Tempo Real",  desc: "Indicadores e avisos" },
    { icon: Zap,       title: "Alta Performance",       desc: "Interface fluida e responsiva" },
  ];

  return (
    <AppBackground>
      <div className="cdx-aurora" />
      {/* 62% / 38% — hero amplo e form elegante */}
      <div className="min-h-dvh grid lg:grid-cols-[62%_38%]">
        {/* ESQUERDA */}
        <section className="hidden lg:flex items-center justify-end text-white">
          <div className="w-full max-w-[1100px] pr-14 pl-16">
            <div className="inline-flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CONDOTECH</h1>
                <p className="text-sm text-blue-200">Condominium Management</p>
              </div>
            </div>

            <h2 className="text-5xl font-bold leading-tight mb-8">Plataforma integrada de gestão condominial.</h2>

            <div className="mt-12 grid grid-cols-2 gap-8">
              {features.map((F, i)=>(
                <motion.div key={i}
                  initial={{opacity:0, y:18}} animate={{opacity:1, y:0}}
                  transition={{delay:0.10*i}} 
                  className="rounded-3xl p-7 min-h-[160px] bg-white/8 hover:bg-white/12 transition-all
                             backdrop-blur-sm border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,.15)]">
                  <F.icon className="w-9 h-9 text-blue-300 mb-3" />
                  <div className="text-[1.1rem] font-semibold">{F.title}</div>
                  <div className="text-sm text-blue-200/80">{F.desc}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-sm text-blue-200/60 flex items-center justify-between">
              <span>© {new Date().getFullYear()} Condotech</span><span>v1.0.0</span>
            </div>
          </div>
        </section>

        {/* DIREITA */}
        <section className="flex items-center justify-center p-10 bg-slate-50">
          <div className="w-full max-w-md">
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Endereço de Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder-slate-400
                               focus:outline-none border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    placeholder="voce@condotech.com"
                  />
                  {email && valid(email) && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={show ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder-slate-400
                               focus:outline-none border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={()=>setShow(s=>!s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"/>
                  <span className="ml-2 text-sm text-slate-700">Lembrar-me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Esqueceu a senha?</a>
              </div>

              <Button3D type="submit" disabled={isLoading} className="mt-2">
                {isLoading ? "Entrando..." : <>Entrar no Sistema <ArrowRight className="inline w-5 h-5 ml-1"/></>}
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

