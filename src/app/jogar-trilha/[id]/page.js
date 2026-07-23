'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, PlayCircle, HelpCircle, Paperclip, Pencil, 
  CheckCircle2, Trophy, X, Star, UploadCloud, Map, Send
} from 'lucide-react'

export default function JogarTrilha() {
  const { id } = useParams() 
  const [loading, setLoading] = useState(true)
  const [trilha, setTrilha] = useState(null)
  const [progresso, setProgresso] = useState(null)
  const [missoes, setMissoes] = useState([])
  const [missaoAtiva, setMissaoAtiva] = useState(null) 

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarAventura
  }, [])

  async function carregarAventura() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { window.location.href = '/login'; return }

    try {
      const { data: trilhaData } = await supabase.from('trilhas_gamificadas').select('*').eq('id', id).single()
      if (!trilhaData) throw new Error("Trilha não encontrada!")
      setTrilha(trilhaData)

      let { data: progressoData } = await supabase.from('progresso_trilhas').select('*').eq('trilha_id', id).eq('aluno_id', user.id).single()
      
      if (!progressoData) {
        const { data: novoProgresso } = await supabase.from('progresso_trilhas').insert([{
          trilha_id: id,
          aluno_id: user.id,
          pontos_acumulados: 0,
          missoes_concluidas: []
        }]).select().single()
        progressoData = novoProgresso
      }
      setProgresso(progressoData)

      const listaMissoes = []
      
      trilhaData.videos?.forEach((v, i) => listaMissoes.push({ idKey: `video_${i}`, tipo: 'video', data: v, pontos: 30, titulo: `Vídeo Secreto ${i+1}`, icone: PlayCircle, cor: '#A78BFA' }))
      trilhaData.quizzes?.forEach((q, i) => listaMissoes.push({ idKey: `quiz_${i}`, tipo: 'quiz', data: q, pontos: 20, titulo: `Desafio Quiz ${i+1}`, icone: HelpCircle, cor: '#FFDE03' }))
      trilhaData.pdfs?.forEach((p, i) => listaMissoes.push({ idKey: `pdf_${i}`, tipo: 'pdf', data: p, pontos: 10, titulo: `Missão de Leitura ${i+1}`, icone: Paperclip, cor: '#4ADE80' }))
      trilhaData.redacoes?.forEach((r, i) => listaMissoes.push({ idKey: `redacao_${i}`, tipo: 'redacao', data: r, pontos: 40, titulo: `Grande Missão Final`, icone: Pencil, cor: '#FF0080' }))

      setMissoes(listaMissoes)

    } catch (err) {
      alert("Erro ao carregar trilha.")
      window.location.href = '/painel-fundamental'
    }
    setLoading(false)
  }

  // ==========================================
  // LÓGICA BLINDADA PARA CONCLUIR MISSÕES
  // ==========================================
  async function concluirMissaoAtiva() {
    if (!missaoAtiva) return
    const idMissao = missaoAtiva.idKey
    const pontosGanhos = missaoAtiva.pontos

    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const missoesAtuais = progresso?.missoes_concluidas || []
    const novasMissoesConcluidas = [...missoesAtuais, idMissao]
    const novosPontos = (progresso?.pontos_acumulados || 0) + pontosGanhos

    try {
      const { error } = await supabase.from('progresso_trilhas').update({
        missoes_concluidas: novasMissoesConcluidas,
        pontos_acumulados: novosPontos
      }).eq('id', progresso.id)

      if (error) throw error

      setProgresso({ ...progresso, missoes_concluidas: novasMissoesConcluidas, pontos_acumulados: novosPontos })
      setMissaoAtiva(null)
      alert(`🎉 VITÓRIA! Você ganhou +${pontosGanhos} Pontos!`)
    } catch (err) {
      console.error(err)
      alert("Ops, deu um erro ao salvar seu progresso. Tente novamente!")
    }
  }

  async function validarQuiz(opcaoEscolhida) {
    if (opcaoEscolhida === missaoAtiva.data.correta) {
      await concluirMissaoAtiva()
    } else {
      alert("💥 Ops! Essa não é a resposta certa. Tente novamente!")
    }
  }

  // NOVA FUNÇÃO: Redireciona para o envio geral de redações
  async function irParaRedacao() {
    await concluirMissaoAtiva() // Dá os pontos da missão da trilha
    window.location.href = '/enviar-redacao' // Leva para a página de redação que já funciona
  }

  if (loading) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-12 h-12 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#1A1A1A] font-black uppercase italic animate-pulse">Carregando Mapa...</p>
    </div>
  )

  const trilhaCompleta = progresso?.pontos_acumulados >= trilha?.total_pontos

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-12 text-[#1A1A1A] font-sans pb-24">
      <button onClick={() => window.location.href = '/painel-fundamental'} className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 hover:text-[#FF0080] transition-colors text-sm md:text-base">
        <ArrowLeft strokeWidth={3} /> Voltar para Base
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* CABEÇALHO DO MAPA */}
        <header className="bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
          <div className="h-32 md:h-48 bg-[#F59E0B] border-b-4 border-[#1A1A1A] relative">
            {trilha.capa_url ? (
              <img src={trilha.capa_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20"><Map size={80} /></div>
            )}
            {trilhaCompleta && (
              <div className="absolute inset-0 bg-[#70E0BB]/80 flex items-center justify-center backdrop-blur-sm z-10">
                <Trophy size={60} className="text-white drop-shadow-lg" />
              </div>
            )}
          </div>
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-4xl font-black uppercase italic text-[#1A1A1A] leading-tight mb-2">{trilha.titulo}</h1>
              <p className="font-bold text-[#555]">{trilha.tema}</p>
            </div>
            
            <div className="flex flex-col items-center justify-center min-w-[120px] p-4 bg-[#F9F6F0] rounded-2xl border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#F59E0B]">
              <span className="font-black uppercase text-[10px] text-[#F59E0B] mb-1">Seus Pontos</span>
              <span className="text-3xl md:text-4xl font-black leading-none">{progresso?.pontos_acumulados || 0}</span>
              <span className="text-xs font-bold opacity-50 uppercase mt-1">DE {trilha.total_pontos}</span>
            </div>
          </div>
        </header>

        {/* MENSAGEM DE VITÓRIA */}
        {trilhaCompleta && (
          <div className="bg-[#70E0BB] border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-center animate-in zoom-in">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic text-white flex items-center justify-center gap-3"><Star className="fill-white"/> VOCÊ ZEROU A TRILHA! <Star className="fill-white"/></h2>
            <p className="font-bold text-[#1A1A1A] mt-2">Você completou todas as missões. Volte para a base e pegue uma nova jornada!</p>
          </div>
        )}

        {/* LISTA DE MISSÕES (O MAPA) */}
        <div className="grid gap-4 md:gap-6">
          {missoes.map((missao, idx) => {
            const estaConcluida = progresso?.missoes_concluidas?.includes(missao.idKey)
            const IconeDaMissao = missao.icone

            return (
              <button 
                key={missao.idKey}
                disabled={estaConcluida}
                onClick={() => setMissaoAtiva(missao)}
                className={`w-full relative bg-white border-4 border-[#1A1A1A] p-5 md:p-6 rounded-[20px] md:rounded-[30px] flex items-center gap-4 transition-all text-left ${estaConcluida ? 'opacity-60 bg-gray-50' : 'hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none cursor-pointer'}`}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 border-[#1A1A1A] flex items-center justify-center shrink-0 ${estaConcluida ? 'bg-[#70E0BB]' : ''}`} style={{ backgroundColor: estaConcluida ? '#70E0BB' : missao.cor }}>
                  {estaConcluida ? <CheckCircle2 size={32} className="text-[#1A1A1A]" /> : <IconeDaMissao size={32} className="text-[#1A1A1A]" />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg md:text-xl font-black uppercase italic leading-tight ${estaConcluida ? 'line-through text-[#555]' : 'text-[#1A1A1A]'}`}>
                    {idx + 1}. {missao.titulo}
                  </h3>
                  <p className="text-xs md:text-sm font-bold text-[#555] uppercase mt-1">Recompensa: {missao.pontos} PTS</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* POP-UP DA MISSÃO ATIVA                                      */}
      {/* ========================================================= */}
      {missaoAtiva && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-3xl rounded-[30px] md:rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] p-6 md:p-10 relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setMissaoAtiva(null)} className="absolute top-4 right-4 md:top-6 md:right-6 bg-[#F9F6F0] p-2 rounded-full border-2 border-[#1A1A1A] hover:bg-red-400 hover:text-white transition-colors">
              <X size={24} strokeWidth={3} />
            </button>
            
            <div className="flex items-center gap-3 mb-6 border-b-4 border-[#1A1A1A] pb-4 pr-12">
              <div className="p-2 rounded-xl border-2 border-[#1A1A1A]" style={{ backgroundColor: missaoAtiva.cor }}><missaoAtiva.icone size={24}/></div>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight">{missaoAtiva.titulo}</h2>
            </div>

            {/* CONTEÚDO DINÂMICO DEPENDENDO DO TIPO DA MISSÃO */}
            
            {missaoAtiva.tipo === 'video' && (
              <div className="space-y-6 flex flex-col items-center">
                <video src={missaoAtiva.data.url} controls className="w-full rounded-2xl border-4 border-[#1A1A1A] bg-black max-h-[400px]" />
                <button onClick={concluirMissaoAtiva} className="w-full py-4 bg-[#70E0BB] border-4 border-[#1A1A1A] rounded-xl font-black uppercase md:text-lg shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2">
                  <CheckCircle2 size={24} /> Terminei de Assistir
                </button>
              </div>
            )}

            {missaoAtiva.tipo === 'quiz' && (
              <div className="space-y-6">
                <p className="text-xl md:text-2xl font-black italic mb-6">"{missaoAtiva.data.pergunta}"</p>
                <div className="grid gap-3">
                  {missaoAtiva.data.opcoes.map((opcao, i) => (
                    <button key={i} onClick={() => validarQuiz(opcao)} className="w-full p-4 rounded-xl border-4 border-[#1A1A1A] bg-[#F9F6F0] hover:bg-[#FFDE03] font-black text-left text-sm md:text-lg transition-colors flex items-center gap-3 active:translate-y-1">
                      <span className="w-8 h-8 rounded-lg bg-white border-2 border-[#1A1A1A] flex items-center justify-center shrink-0">{['A','B','C','D','E'][i] || '*'}</span>
                      {opcao}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {missaoAtiva.tipo === 'pdf' && (
              <div className="space-y-6 text-center py-6">
                <Paperclip size={80} className="mx-auto text-[#4ADE80] mb-4" />
                <h3 className="text-xl font-black uppercase">Material de Leitura</h3>
                <p className="font-bold text-[#555] mb-6">Baixe o material, leia com atenção e depois marque a missão como concluída!</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={missaoAtiva.data.url} target="_blank" className="py-4 px-8 bg-white border-4 border-[#1A1A1A] rounded-xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 text-[#1A1A1A]">
                    <UploadCloud size={20}/> Abrir Arquivo
                  </a>
                  <button onClick={concluirMissaoAtiva} className="py-4 px-8 bg-[#70E0BB] border-4 border-[#1A1A1A] rounded-xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 text-[#1A1A1A]">
                    <CheckCircle2 size={20}/> Marcar como Lido
                  </button>
                </div>
              </div>
            )}

            {/* A NOVA MISSÃO DE REDAÇÃO */}
            {missaoAtiva.tipo === 'redacao' && (
              <div className="space-y-6 text-center py-4">
                <Pencil size={64} className="mx-auto text-[#FF0080] mb-2" />
                
                <div className="bg-[#FF0080]/10 p-4 rounded-xl border-2 border-[#FF0080] text-left">
                  <p className="font-black uppercase text-[#FF0080] mb-1 text-sm">Comando da Missão:</p>
                  <p className="font-bold italic text-lg">{missaoAtiva.data.titulo}</p>
                </div>
                
                <p className="font-bold text-[#555] px-4">
                  Esta é a missão final! Você será levado para a área de escrita oficial para enviar seu texto ou foto.
                </p>

                <button onClick={irParaRedacao} className="w-full py-4 bg-[#FF0080] text-white border-4 border-[#1A1A1A] rounded-xl font-black uppercase md:text-lg shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2">
                  <Pencil size={24} /> Aceitar Missão e Ir Escrever
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}