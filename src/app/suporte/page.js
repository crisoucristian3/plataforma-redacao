'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Send, 
  Camera, 
  Sparkles, 
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCircle
} from 'lucide-react'

export default function Suporte() {
  const [mensagem, setMensagem] = useState('')
  const [foto, setFoto] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [meusChamados, setMeusChamados] = useState([])
  const [usuarioAtual, setUsuarioAtual] = useState(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = () => {
      setIsReady(true)
      carregarMeusChamados()
    }
  }, [])

  async function carregarMeusChamados() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUsuarioAtual(user)
      const { data } = await supabase
        .from('chamados_suporte')
        .select('*')
        .eq('aluno_id', user.id)
        .neq('status', 'fechado') 
        .order('created_at', { ascending: false })
      
      if (data) setMeusChamados(data)
    }
  }

  const handleEnviarSuporte = async (e) => {
    e.preventDefault()
    
    if (!isReady || !mensagem) return alert('Por favor, descreva o problema antes de enviar!')
    setEnviando(true)

    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Você precisa estar logado!");
      window.location.href = '/login';
      return;
    }

    let urlFoto = null

    if (foto) {
      const nomeLimpo = foto.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s+/g, "-")            
        .replace(/[^a-zA-Z0-9.\-]/g, "") 
        .toLowerCase();
      
      const nomeArquivo = `${user.id}/suporte-${Date.now()}-${nomeLimpo}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage.from('suporte_arquivos').upload(nomeArquivo, foto)
      
      if (uploadError) { alert('Erro ao enviar a imagem: ' + uploadError.message); setEnviando(false); return; }
      urlFoto = supabase.storage.from('suporte_arquivos').getPublicUrl(nomeArquivo).data.publicUrl
    }

    const { error } = await supabase.from('chamados_suporte').insert([{
      aluno_id: user.id,
      mensagem: mensagem,
      imagem_url: urlFoto,
      status: 'aberto'
    }])

    if (error) {
      alert('Erro ao abrir chamado: ' + error.message)
    } else { 
      alert('Mensagem enviada com sucesso!')
      setMensagem('')
      setFoto(null)
      carregarMeusChamados() 
    }
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-[#A78BFA] text-[#1A1A1A] p-4 sm:p-6 lg:p-12 font-sans selection:bg-[#FF0080]/30 relative overflow-y-auto pb-24">
      
      {/* Elementos Decorativos */}
      <div className="absolute top-10 right-10 rotate-12 opacity-20 pointer-events-none hidden lg:block">
        <LifeBuoy size={150} />
      </div>
      <div className="absolute bottom-10 left-10 -rotate-12 opacity-20 pointer-events-none hidden lg:block">
        <Sparkles size={150} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 text-white hover:text-[#FFDE03] transition-colors group text-sm md:text-base"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform w-5 h-5 md:w-6 md:h-6" strokeWidth={3} /> 
          Voltar ao Dashboard
        </button>

        <header className="mb-8 md:mb-10 text-center md:text-left">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-[2px_2px_0px_rgba(26,26,26,1)] md:drop-shadow-[4px_4px_0px_rgba(26,26,26,1)] transform -rotate-1 leading-tight">
            Fale <span className="text-[#FFDE03]">Conosco</span>
          </h2>
          <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-xl font-bold text-[#1A1A1A] bg-white inline-block px-3 py-2 md:px-4 md:py-2 border-2 md:border-4 border-[#1A1A1A] rounded-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
            Encontrou um erro ou tem uma dúvida? Manda pra gente!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          
          {/* LADO ESQUERDO: FORMULÁRIO DE ENVIO */}
          <form onSubmit={handleEnviarSuporte} className="bg-white border-4 border-[#1A1A1A] p-5 md:p-10 rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] space-y-5 md:space-y-6 h-fit">
            <h3 className="text-xl md:text-2xl font-black uppercase italic text-[#1A1A1A] border-b-4 border-dashed border-[#1A1A1A] pb-3 md:pb-4 mb-3 md:mb-4">Novo Chamado</h3>
            
            <div className="relative">
              <label className="flex items-center gap-2 text-base md:text-lg font-black uppercase italic text-[#1A1A1A] mb-2 md:mb-3">
                <MessageSquare size={18} className="text-[#FF0080] md:w-5 md:h-5" /> Qual o problema?
              </label>
              <textarea 
                placeholder="Descreva aqui o que aconteceu..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="w-full h-[120px] md:h-[150px] p-3 md:p-4 bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-2xl md:rounded-3xl text-sm md:text-base font-bold shadow-inner focus:outline-none focus:bg-[#FFDE03]/10 transition-colors resize-none"
              />
            </div>

            <div className="p-3 md:p-4 bg-[#70E0BB] border-2 md:border-4 border-[#1A1A1A] rounded-2xl md:rounded-3xl shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transform -rotate-1">
              <h4 className="font-black uppercase flex items-center gap-2 mb-2 text-[#1A1A1A] text-xs md:text-sm">
                <Camera size={16} className="md:w-5 md:h-5" /> Anexar Print (Opcional)
              </h4>
              <div className="relative border-2 md:border-4 border-dashed border-[#1A1A1A] rounded-xl p-3 md:p-4 bg-white hover:bg-[#FFDE03] transition-colors cursor-pointer text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFoto(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-[10px] sm:text-xs md:text-sm font-black uppercase text-[#1A1A1A]">
                  {foto ? `📸 ${foto.name}` : 'Clique aqui para foto do erro'}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={enviando}
              className={`w-full p-3 md:p-4 border-2 md:border-4 border-[#1A1A1A] rounded-full font-black text-sm md:text-lg uppercase italic transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 md:gap-3 ${
                enviando ? 'bg-slate-400' : 'bg-[#1A1A1A] text-white hover:bg-[#FF0080]'
              }`}
            >
              {enviando ? 'ENVIANDO...' : 'ENVIAR MENSAGEM'} <Send size={18} className="md:w-5 md:h-5" />
            </button>
          </form>

          {/* LADO DIREITO: HISTÓRICO DE CHAMADOS */}
          <div className="space-y-5 md:space-y-6 mt-6 lg:mt-0">
            <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white drop-shadow-[2px_2px_0px_rgba(26,26,26,1)] mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Clock size={24} className="md:w-8 md:h-8" /> Seus Chamados
            </h3>

            {meusChamados.length === 0 ? (
              <div className="bg-white/50 border-4 border-[#1A1A1A] border-dashed p-6 md:p-8 rounded-[30px] text-center">
                <p className="text-base md:text-xl font-bold italic text-[#1A1A1A]">Você não possui chamados em aberto no momento.</p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6 overflow-y-auto max-h-[400px] md:max-h-[600px] pr-2 custom-scrollbar">
                {meusChamados.map((chamado) => (
                  <div key={chamado.id} className="bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col">
                    
                    <div className="p-4 md:p-6 bg-[#F9F6F0]">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[10px] md:text-xs font-black uppercase bg-[#1A1A1A] text-white px-2 py-1 md:px-3 md:py-1 rounded-full">
                          Enviado por você
                        </span>
                        <span className="text-[10px] md:text-xs font-bold text-[#555]">
                          {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm md:text-lg font-medium text-[#1A1A1A] leading-relaxed mb-3 md:mb-4">"{chamado.mensagem}"</p>
                      {chamado.imagem_url && (
                        <a href={chamado.imagem_url} target="_blank" className="inline-flex items-center gap-1 md:gap-2 text-xs md:text-sm font-black uppercase text-[#3B82F6] hover:underline">
                          <Camera size={14} className="md:w-4 md:h-4" /> Ver print anexado
                        </a>
                      )}
                    </div>

                    <div className={`p-4 md:p-6 border-t-4 border-[#1A1A1A] ${chamado.resposta ? 'bg-[#FFDE03]' : 'bg-white'}`}>
                      {chamado.resposta ? (
                        <div>
                           <div className="flex items-center gap-2 mb-2 md:mb-3">
                             <UserCircle className="text-[#FF0080] w-5 h-5 md:w-6 md:h-6" />
                             <h4 className="font-black uppercase italic text-[#1A1A1A] text-xs md:text-sm">Resposta da Equipe:</h4>
                           </div>
                           <p className="text-sm md:text-lg font-bold text-[#1A1A1A]">{chamado.resposta}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 md:gap-3 text-[#555] opacity-70">
                          <Clock size={16} className="animate-spin-slow md:w-5 md:h-5" />
                          <p className="text-[10px] md:text-sm font-black uppercase italic">Aguardando resposta do suporte...</p>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}