'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, XCircle, Trophy, GraduationCap, ChevronRight, FileQuestion, Sparkles, Image as ImageIcon } from 'lucide-react'

export default function SimuladosEnem() {
  const [questoes, setQuestoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [indiceAtual, setIndiceAtual] = useState(0)
  
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null) // Guarda a letra: 'A', 'B', 'C', 'D' ou 'E'
  const [respondido, setRespondido] = useState(false)
  const [acertos, setAcertos] = useState(0)
  const [finalizado, setFinalizado] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarQuestoes
  }, [])

  async function carregarQuestoes() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data, error } = await supabase.from('questoes_enem').select('*')
      
      if (error) throw error
      
      // Embaralha as questões para o simulado não ficar repetitivo
      const questoesEmbaralhadas = (data || []).sort(() => Math.random() - 0.5)
      setQuestoes(questoesEmbaralhadas)
    } catch (err) {
      console.error("Erro ao buscar questões:", err)
    } finally {
      setLoading(false)
    }
  }

  const confirmarResposta = () => {
    if (!opcaoSelecionada) return
    
    setRespondido(true)
    const questaoAtual = questoes[indiceAtual]
    
    if (opcaoSelecionada === questaoAtual.resposta_correta) {
      setAcertos(prev => prev + 1)
    }
  }

  const proximaQuestao = () => {
    if (indiceAtual + 1 < questoes.length) {
      setIndiceAtual(prev => prev + 1)
      setOpcaoSelecionada(null)
      setRespondido(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setFinalizado(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // TELA 1: CARREGANDO
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-16 h-16 border-4 border-[#FF0080] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#1A1A1A] font-black uppercase tracking-widest animate-pulse mt-4">Buscando caderno de questões...</p>
      </div>
    )
  }

  // TELA 2: NENHUMA QUESTÃO NO BANCO
  if (questoes.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-4 flex flex-col items-center justify-center">
        <div className="bg-white border-4 border-[#1A1A1A] p-8 md:p-12 rounded-[40px] text-center max-w-xl shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <FileQuestion size={80} className="mx-auto text-[#FF0080] mb-6" strokeWidth={1.5} />
          <h2 className="text-3xl font-black uppercase text-[#1A1A1A] mb-4">Sem Simulados</h2>
          <p className="font-bold text-[#555] mb-8 text-lg">Os professores ainda não enviaram questões para treinar. Tente novamente mais tarde!</p>
          <button onClick={() => window.location.href = '/painel-fundamental'} className="w-full py-4 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FFDE03] transition-colors shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">Voltar ao Painel</button>
        </div>
      </div>
    )
  }

  // TELA 3: RESULTADO FINAL DO SIMULADO
  if (finalizado) {
    const porcentagem = Math.round((acertos / questoes.length) * 100)
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-4 flex flex-col items-center justify-center">
        <div className="bg-white border-4 border-[#1A1A1A] p-8 md:p-12 rounded-[40px] text-center max-w-2xl shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] w-full animate-in zoom-in duration-500">
          <div className="w-32 h-32 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-full mx-auto flex items-center justify-center mb-6 -mt-20 shadow-inner">
            <Trophy size={60} className="text-[#1A1A1A]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic text-[#1A1A1A] mb-2 tracking-tighter">Simulado Concluído!</h1>
          <p className="font-bold text-[#555] text-lg md:text-xl mb-10">Você finalizou a bateria de questões.</p>
          
          <div className="bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-3xl p-8 mb-10 flex flex-col sm:flex-row items-center justify-around gap-6 shadow-inner">
            <div className="text-center w-full sm:w-auto border-b-4 sm:border-b-0 sm:border-r-4 border-[#1A1A1A]/10 pb-6 sm:pb-0 sm:pr-8">
              <span className="block text-sm md:text-base font-black uppercase text-[#555] mb-2">Acertos</span>
              <span className="text-5xl md:text-7xl font-black text-[#1A1A1A]">{acertos}<span className="text-3xl text-gray-400">/{questoes.length}</span></span>
            </div>
            <div className="text-center w-full sm:w-auto">
              <span className="block text-sm md:text-base font-black uppercase text-[#555] mb-2">Desempenho</span>
              <span className={`text-5xl md:text-7xl font-black ${porcentagem >= 70 ? 'text-[#70E0BB]' : porcentagem >= 40 ? 'text-[#FFDE03]' : 'text-[#FF0080]'}`}>{porcentagem}%</span>
            </div>
          </div>

          <button onClick={() => window.location.href = '/painel-fundamental'} className="w-full py-5 bg-[#3B82F6] border-4 border-[#1A1A1A] rounded-2xl font-black text-xl uppercase text-white hover:bg-[#1A1A1A] hover:-translate-y-1 transition-all shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ==============================================================
  // TELA DE RESOLUÇÃO (ENEM STYLE)
  // ==============================================================
  const questaoAtual = questoes[indiceAtual]
  
  // Como o professor salva as alternativas num objeto JSON (Ex: { A: 'texto', B: 'texto' })
  // Nós lemos as chaves desse objeto
  const alternativas = questaoAtual.alternativas ? ['A', 'B', 'C', 'D', 'E'].map(letra => ({
    letra: letra,
    texto: questaoAtual.alternativas[letra]
  })).filter(opt => opt.texto) : [] // Remove caso não tenha texto (ex: se fez só até a D)

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-[#1A1A1A]">
      
      {/* HEADER FIXO */}
      <header className="bg-white p-4 md:p-6 flex items-center justify-between sticky top-0 z-40 border-b-4 border-[#1A1A1A] shadow-sm">
        <button onClick={() => window.location.href = '/painel-fundamental'} className="p-3 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl font-black uppercase text-xs md:text-sm flex items-center gap-2 hover:bg-[#1A1A1A] hover:text-white transition-colors">
          <ArrowLeft size={18} strokeWidth={3} /> <span className="hidden sm:block">Sair do Simulado</span>
        </button>
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:flex bg-[#FF0080] border-2 border-[#1A1A1A] px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] items-center gap-2">
            <GraduationCap size={20} className="text-white" />
            <span className="font-black uppercase text-sm text-white tracking-widest">{questaoAtual.caderno || 'Simulado'}</span>
          </div>
          <div className="bg-[#FFDE03] border-2 border-[#1A1A1A] px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <span className="font-black uppercase text-sm md:text-base text-[#1A1A1A] tracking-wider">Questão {indiceAtual + 1} <span className="opacity-40">/ {questoes.length}</span></span>
          </div>
        </div>
      </header>

      {/* ÁREA DE LEITURA (PROVA DIGITAL) */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 pb-40">
        
        {/* BLOCO DA PERGUNTA E IMAGENS */}
        <div className="mb-10 bg-white border-4 border-[#1A1A1A] rounded-[30px] p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-4 border-dashed border-[#1A1A1A]/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#3B82F6] border-2 border-[#1A1A1A] rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-inner shrink-0 transform -rotate-3">
                {indiceAtual + 1}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] uppercase tracking-tight line-clamp-2">
                {questaoAtual.titulo || 'Questão do Enem'}
              </h2>
            </div>
          </div>

          {/* RENDERIZAÇÃO DE MÚLTIPLAS IMAGENS (Se o professor enviou anexos) */}
          {questaoAtual.imagens_urls && questaoAtual.imagens_urls.length > 0 && (
            <div className="mb-8 space-y-4">
              {questaoAtual.imagens_urls.map((imgUrl, idx) => (
                <div key={idx} className="border-4 border-[#1A1A1A] rounded-2xl overflow-hidden bg-[#F9F6F0] p-2 flex justify-center shadow-inner">
                  <img src={imgUrl} alt={`Material de apoio ${idx + 1}`} className="max-w-full max-h-[500px] object-contain rounded-xl" />
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-lg max-w-none text-[#1A1A1A]">
            <p className="text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap font-serif">
              {questaoAtual.enunciado}
            </p>
          </div>
        </div>

        {/* BLOCO DAS ALTERNATIVAS */}
        <div className="space-y-4 md:space-y-5">
          <h3 className="font-black uppercase italic text-sm md:text-base text-gray-500 ml-2 mb-4">Escolha uma alternativa:</h3>
          
          {alternativas.map((opt) => {
            const isSelecionada = opcaoSelecionada === opt.letra;
            const isCorreta = respondido && opt.letra === questaoAtual.resposta_correta;
            const isErro = respondido && isSelecionada && opt.letra !== questaoAtual.resposta_correta;

            // Cores e estilos adaptativos
            let containerClass = "bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F9F6F0] hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1";
            let circleClass = "bg-[#F9F6F0] text-[#1A1A1A]";

            if (isSelecionada && !respondido) {
              containerClass = "bg-[#FFDE03] border-[#1A1A1A] text-[#1A1A1A] -translate-y-1 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]";
              circleClass = "bg-white text-[#1A1A1A]";
            }
            if (isCorreta) {
              containerClass = "bg-[#70E0BB] border-[#1A1A1A] text-[#1A1A1A]";
              circleClass = "bg-white text-[#1A1A1A]";
            }
            if (isErro) {
              containerClass = "bg-[#FF0080] border-[#1A1A1A] text-white";
              circleClass = "bg-white text-[#FF0080]";
            }

            return (
              <button
                key={opt.letra}
                disabled={respondido}
                onClick={() => setOpcaoSelecionada(opt.letra)}
                className={`w-full p-4 md:p-6 rounded-[24px] border-4 flex items-center md:items-start gap-4 md:gap-6 transition-all text-left ${containerClass}`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-2xl border-4 border-[#1A1A1A] font-black text-xl md:text-2xl shadow-inner ${circleClass}`}>
                  {isCorreta ? <CheckCircle2 size={32} strokeWidth={3} /> : isErro ? <XCircle size={32} strokeWidth={3} /> : opt.letra}
                </div>
                <div className="flex-1 pt-1">
                  <span className={`text-base md:text-lg font-medium leading-snug ${isErro ? 'text-white' : 'text-[#1A1A1A]'}`}>
                    {opt.texto}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* FEEDBACK DO PROFESSOR (Aparece após responder) */}
        {respondido && questaoAtual.explicacao && (
          <div className="mt-10 p-6 md:p-8 bg-[#A78BFA]/10 border-4 border-[#1A1A1A] rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] animate-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black uppercase text-[#1A1A1A] mb-4 flex items-center gap-2">
              <Sparkles className="text-[#A78BFA]" /> Resolução Comentada
            </h3>
            <p className="text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap text-[#333] italic">
              {questaoAtual.explicacao}
            </p>
          </div>
        )}

      </main>

      {/* BARRA INFERIOR DE AÇÕES FIXA */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t-4 border-[#1A1A1A] p-4 md:p-6 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex justify-end">
          {!respondido ? (
            <button
              onClick={confirmarResposta}
              disabled={!opcaoSelecionada}
              className="w-full sm:w-auto px-10 py-4 md:py-5 bg-[#1A1A1A] border-4 border-[#1A1A1A] rounded-2xl font-black text-lg md:text-xl uppercase text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FF0080] hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(255,0,128,1)] disabled:shadow-none"
            >
              Confirmar Resposta
            </button>
          ) : (
            <button
              onClick={proximaQuestao}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 md:py-5 bg-[#3B82F6] border-4 border-[#1A1A1A] rounded-2xl font-black text-lg md:text-xl uppercase text-white hover:bg-[#1A1A1A] hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            >
              {indiceAtual + 1 === questoes.length ? 'Finalizar Simulado' : 'Próxima Questão'} 
              <ChevronRight size={28} strokeWidth={3} />
            </button>
          )}
        </div>
      </footer>

    </div>
  )
}