'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Send, 
  Camera, 
  Sparkles, 
  LifeBuoy,
  CheckCircle2,
  UserCircle,
  Clock
} from 'lucide-react'

export default function ChamadosProfessor() {
  const [chamados, setChamados] = useState([])
  const [textoResposta, setTextoResposta] = useState('')
  const [respondendoId, setRespondendoId] = useState(null)
  const [carregandoChamado, setCarregandoChamado] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = () => {
      setIsReady(true)
      carregarChamados()
    }
  }, [])

const carregarChamados = async () => {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // 1. Busca APENAS os chamados abertos (sem cruzar dados ainda)
    const { data: chamadosData, error: chamadosError } = await supabase
      .from('chamados_suporte')
      .select('*')
      .neq('status', 'fechado')
      .order('created_at', { ascending: false })
    
    if (chamadosError) {
      console.error("Erro na busca:", chamadosError)
      return
    }

    if (chamadosData && chamadosData.length > 0) {
      // 2. Busca os perfis de todo mundo
      const { data: perfisData } = await supabase
        .from('perfis')
        .select('id, nome_completo, foto_url')

      // 3. O Javascript cruza o dono do chamado com o perfil dele
      const chamadosComPerfis = chamadosData.map(chamado => {
        const perfilAluno = perfisData?.find(p => p.id === chamado.aluno_id)
        return {
          ...chamado,
          perfis: perfilAluno || { nome_completo: 'Aluno Oculto', foto_url: null }
        }
      })

      setChamados(chamadosComPerfis)
    } else {
      setChamados([])
    }
  }

  const handleResponderChamado = async (chamadoId) => {
    if (!textoResposta.trim()) return alert("Digite uma resposta!")
    setCarregandoChamado(true)

    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { error } = await supabase
      .from('chamados_suporte')
      .update({ resposta: textoResposta })
      .eq('id', chamadoId)

    if (error) {
      alert("Erro ao responder: " + error.message)
    } else {
      alert("Resposta enviada ao aluno!")
      setTextoResposta('')
      setRespondendoId(null)
      carregarChamados() 
    }
    setCarregandoChamado(false)
  }

  const handleEncerrarChamado = async (chamadoId) => {
    const confirmar = window.confirm("Tem certeza que deseja fechar este chamado? Ele sumirá da sua tela e da do aluno.")
    if (!confirmar) return

    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { error } = await supabase
      .from('chamados_suporte')
      .update({ status: 'fechado' })
      .eq('id', chamadoId)

    if (error) {
      alert("Erro ao encerrar: " + error.message)
    } else {
      carregarChamados() 
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-4 sm:p-6 lg:p-12 font-sans selection:bg-[#FF0080]/30 relative overflow-y-auto pb-24">
      
      {/* Elementos Decorativos */}
      <div className="absolute top-10 right-10 rotate-12 opacity-10 pointer-events-none hidden lg:block">
        <LifeBuoy size={150} />
      </div>
      <div className="absolute bottom-10 left-10 -rotate-12 opacity-10 pointer-events-none hidden lg:block">
        <Sparkles size={150} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => window.location.href = '/painel-professor'}
          className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 text-[#1A1A1A] hover:text-[#FF0080] transition-colors group text-sm md:text-base"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform w-5 h-5 md:w-6 md:h-6" strokeWidth={3} /> 
          Voltar ao Painel
        </button>

        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-dashed border-[#1A1A1A] pb-6 md:pb-8">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-[#1A1A1A] drop-shadow-[2px_2px_0px_rgba(255,222,3,1)] md:drop-shadow-[4px_4px_0px_rgba(255,222,3,1)] transform -rotate-1 leading-tight">
              Central de <span className="text-[#FF0080]">Chamados</span>
            </h2>
            <p className="mt-2 md:mt-4 text-sm md:text-lg font-bold text-[#555] flex items-center gap-2">
              <LifeBuoy size={18} className="text-[#3B82F6] md:w-6 md:h-6" /> {chamados.length} chamados aguardando suporte
            </p>
          </div>
          <button onClick={carregarChamados} className="w-full md:w-auto px-4 py-3 bg-[#FFDE03] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
            Atualizar Lista <Clock size={16} />
          </button>
        </header>

        {chamados.length === 0 ? (
          <div className="bg-white border-4 border-[#1A1A1A] p-8 md:p-16 rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-center transform rotate-1">
            <CheckCircle2 size={60} className="mx-auto text-[#70E0BB] mb-4 md:mb-6 md:w-20 md:h-20" />
            <h3 className="text-xl md:text-3xl font-black uppercase italic text-[#1A1A1A] mb-2">Tudo Limpo por Aqui!</h3>
            <p className="text-sm md:text-xl font-bold text-[#555]">Nenhum aluno precisando de ajuda no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {chamados.map((chamado) => (
              <div key={chamado.id} className="bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row">
                
                {/* Lado Esquerdo do Card: Dados do Aluno e Mensagem */}
                <div className="flex-1 p-4 md:p-6 bg-[#F9F6F0] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4 md:mb-6 border-b-2 border-[#1A1A1A]/10 pb-3 md:pb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#1A1A1A] bg-[#FFDE03] overflow-hidden shrink-0">
                        {chamado.perfis?.foto_url ? (
                          <img src={chamado.perfis.foto_url} alt="Aluno" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle size={40} className="text-[#1A1A1A] md:w-12 md:h-12 -ml-0.5 -mt-0.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#1A1A1A] font-black uppercase text-sm md:text-base line-clamp-1">
                          {chamado.perfis?.nome_completo || 'Aluno Oculto'}
                        </p>
                        <p className="text-[#555] font-bold text-[10px] md:text-xs flex items-center gap-1">
                          <Clock size={10} /> {new Date(chamado.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm md:text-lg font-bold text-[#1A1A1A] leading-relaxed mb-4">"{chamado.mensagem}"</p>
                  </div>

                  {chamado.imagem_url && (
                    <a href={chamado.imagem_url} target="_blank" className="self-start inline-flex items-center gap-2 text-xs md:text-sm font-black uppercase bg-[#3B82F6] text-white px-3 py-2 md:px-4 md:py-2 rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                      <Camera size={16} className="md:w-5 md:h-5" /> Ver Anexo do Erro
                    </a>
                  )}
                </div>

                {/* Lado Direito do Card: Área de Ação do Professor */}
                <div className="w-full md:w-[400px] p-4 md:p-6 border-t-4 md:border-t-0 md:border-l-4 border-[#1A1A1A] bg-white flex flex-col justify-center">
                  
                  {chamado.resposta && respondendoId !== chamado.id && (
                    <div className="mb-4 p-3 md:p-4 bg-[#FFDE03]/20 border-2 md:border-4 border-[#FFDE03] rounded-xl md:rounded-2xl">
                      <p className="text-[10px] md:text-xs font-black uppercase text-[#555] mb-1 flex items-center gap-1"><CheckCircle2 size={12} className="text-[#70E0BB]"/> Sua Resposta Atual:</p>
                      <p className="text-sm md:text-base font-bold text-[#1A1A1A]">{chamado.resposta}</p>
                    </div>
                  )}

                  {respondendoId === chamado.id ? (
                    <div className="space-y-3 md:space-y-4">
                      <textarea 
                        value={textoResposta}
                        onChange={(e) => setTextoResposta(e.target.value)}
                        placeholder="Escreva a resposta para o aluno..."
                        className="w-full h-[100px] md:h-[120px] p-3 md:p-4 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl text-sm md:text-base font-bold resize-none focus:outline-none focus:bg-[#A78BFA]/10"
                      />
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button onClick={() => handleResponderChamado(chamado.id)} disabled={carregandoChamado} className="w-full bg-[#FF0080] text-white font-black uppercase text-xs md:text-sm py-3 rounded-xl border-2 md:border-4 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                          {carregandoChamado ? 'Enviando...' : 'Enviar'}
                        </button>
                        <button onClick={() => {setRespondendoId(null); setTextoResposta('');}} className="w-full px-4 py-3 bg-[#F9F6F0] font-black uppercase text-xs md:text-sm rounded-xl border-2 md:border-4 border-[#1A1A1A] hover:bg-slate-200 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 md:gap-3">
                      <button onClick={() => { setRespondendoId(chamado.id); setTextoResposta(chamado.resposta || ''); }} className="w-full py-3 bg-white border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#A78BFA] hover:text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2">
                        <Send size={16} /> {chamado.resposta ? 'Editar Resposta' : 'Responder Aluno'}
                      </button>
                      <button onClick={() => handleEncerrarChamado(chamado.id)} className="w-full px-4 py-3 bg-[#70E0BB] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-red-400 hover:text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2" title="Resolver e fechar chamado">
                        <CheckCircle2 size={16} /> Encerrar Chamado
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}