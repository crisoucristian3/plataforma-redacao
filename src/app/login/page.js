'use client'
import { useState, useEffect } from 'react'
import { 
  Pencil, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  UserCircle,
  Key,
  School,
  Phone
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [escola, setEscola] = useState('') // Novo campo
  const [telefone, setTelefone] = useState('') // Novo campo
  const [tipo, setTipo] = useState('aluno')
  const [chaveProfessor, setChaveProfessor] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modoCadastro, setModoCadastro] = useState(false)

  const CHAVE_MESTRA = "MESTRADO2026" 

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = () => setIsReady(true)
  }, [])

  const getSupabase = () => {
    return window.supabase.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    if (!isReady) return
    if (!email.trim() || !password.trim()) {
      alert("Por favor, preencha e-mail e senha.")
      return
    }

    setLoading(true)
    const supabase = getSupabase()

    if (modoCadastro) {
      if (tipo === 'professor' && chaveProfessor !== CHAVE_MESTRA) {
        alert('Chave de Professor incorreta!');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password: password 
      });

      if (error) {
        alert('Erro no Cadastro: ' + error.message);
      } else if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // SALVANDO NOVOS DADOS NO BANCO
        const { error: pError } = await supabase.from('perfis').insert([{
          id: data.user.id,
          nome_completo: nome,
          tipo_usuario: tipo,
          escola: escola, // Salva Escola
          telefone: telefone // Salva Telefone
        }]);

        if (pError) {
          alert('Sua conta foi criada, mas o perfil falhou. Tente fazer LOGIN agora.');
        } else {
          alert('Cadastro realizado! Bem-vindo ao Ponto e Vírgula.');
          setModoCadastro(false);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      })
      if (error) alert('Erro ao entrar: ' + error.message)
      else window.location.href = '/'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FF0080] flex items-center justify-center p-6 font-sans selection:bg-[#70E0BB]/30 relative overflow-y-auto">
      
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-5%] left-[-5%] rotate-12 opacity-10 pointer-events-none">
        <Sparkles size={300} className="text-white" />
      </div>
      <div className="absolute bottom-[-5%] right-[-5%] -rotate-12 opacity-10 pointer-events-none">
        <Pencil size={300} className="text-white" />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 relative z-10 py-10">
        
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 mb-8 transform -rotate-2">
          <div className="w-14 h-14 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <Pencil size={32} className="text-[#1A1A1A]" />
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-[4px_4px_0px_rgba(26,26,26,1)]">
            PONTO<span className="text-[#FFDE03]">&</span>VÍRGULA
          </h1>
        </div>

        {/* CARD DE LOGIN */}
        <div className="bg-white border-4 border-[#1A1A1A] rounded-[40px] p-8 md:p-10 shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] relative">
          
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#70E0BB] border-4 border-[#1A1A1A] px-6 py-1 rounded-full font-black uppercase text-sm italic shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] whitespace-nowrap">
            {modoCadastro ? 'Novo Membro' : 'Bem-vindo de volta'}
          </div>

          <form onSubmit={handleAuth} className="mt-4 space-y-4">
            
            {modoCadastro && (
              <>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40">
                    <User size={20} strokeWidth={3} />
                  </div>
                  <input 
                    type="text" placeholder="Seu Nome Lindo" required 
                    className="w-full pl-12 p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold placeholder:text-[#1A1A1A]/30 focus:bg-[#FFDE03]/10 outline-none transition-all" 
                    onChange={(e) => setNome(e.target.value)} 
                  />
                </div>

                {/* CAMPO ESCOLA */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40">
                    <School size={20} strokeWidth={3} />
                  </div>
                  <input 
                    type="text" placeholder="Sua Escola ou Curso" required 
                    className="w-full pl-12 p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold placeholder:text-[#1A1A1A]/30 focus:bg-[#FFDE03]/10 outline-none transition-all" 
                    onChange={(e) => setEscola(e.target.value)} 
                  />
                </div>

                {/* CAMPO TELEFONE */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40">
                    <Phone size={20} strokeWidth={3} />
                  </div>
                  <input 
                    type="tel" placeholder="Seu Telefone / WhatsApp" required 
                    className="w-full pl-12 p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold placeholder:text-[#1A1A1A]/30 focus:bg-[#FFDE03]/10 outline-none transition-all" 
                    onChange={(e) => setTelefone(e.target.value)} 
                  />
                </div>
              </>
            )}
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40">
                <Mail size={20} strokeWidth={3} />
              </div>
              <input 
                type="email" placeholder="E-mail" required 
                className="w-full pl-12 p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold placeholder:text-[#1A1A1A]/30 focus:bg-[#FFDE03]/10 outline-none transition-all" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40">
                <Lock size={20} strokeWidth={3} />
              </div>
              <input 
                type="password" placeholder="Sua senha secreta" required 
                className="w-full pl-12 p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold placeholder:text-[#1A1A1A]/30 focus:bg-[#FFDE03]/10 outline-none transition-all" 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {modoCadastro && (
              <div className="space-y-3">
                <label className="text-sm font-black uppercase italic tracking-tighter text-[#1A1A1A] ml-2">Eu sou...</label>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setTipo('aluno')} 
                    className={`flex-1 p-3 rounded-xl border-4 border-[#1A1A1A] font-black uppercase italic transition-all flex items-center justify-center gap-2 ${tipo === 'aluno' ? 'bg-[#70E0BB] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-white text-[#555]'}`}
                  >
                    <UserCircle size={18} /> Aluno
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setTipo('professor')} 
                    className={`flex-1 p-3 rounded-xl border-4 border-[#1A1A1A] font-black uppercase italic transition-all flex items-center justify-center gap-2 ${tipo === 'professor' ? 'bg-[#FFDE03] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-white text-[#555]'}`}
                  >
                    <GraduationCap size={18} /> Prof
                  </button>
                </div>
              </div>
            )}

            {modoCadastro && tipo === 'professor' && (
              <div className="relative animate-in slide-in-from-top-2 duration-300">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40">
                  <Key size={20} strokeWidth={3} />
                </div>
                <input 
                  type="password" 
                  placeholder="Chave do Mestre" 
                  required 
                  className="w-full pl-12 p-4 bg-[#FFDE03]/20 border-4 border-[#FFDE03] rounded-2xl font-bold outline-none" 
                  onChange={(e) => setChaveProfessor(e.target.value)} 
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading || !isReady} 
              className="w-full py-5 bg-[#FF0080] text-white rounded-full border-4 border-[#1A1A1A] font-black text-xl uppercase italic shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              {loading ? 'CARREGANDO...' : modoCadastro ? 'CRIAR CONTA' : 'ENTRAR'}
              {!loading && <ArrowRight size={24} strokeWidth={3} />}
            </button>
            
            <p 
              onClick={() => setModoCadastro(!modoCadastro)} 
              className="text-[#1A1A1A] text-center cursor-pointer mt-6 font-black uppercase italic text-sm hover:text-[#FF0080] transition-colors"
            >
              {modoCadastro ? 'Já tenho minha conta? Entrar' : 'Não tem conta? Cadastre-se'}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}