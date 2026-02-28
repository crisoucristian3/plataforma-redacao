'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Trophy, 
  MessageSquareText, 
  FileText, 
  Calendar, 
  User, 
  ExternalLink,
  Sparkles,
  Paperclip,
  Headphones // Ícone novo para o áudio
} from 'lucide-react'

export default function VisualizarFeedback() {
  const { id } = useParams()
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarFeedback
  }, [id])

  async function carregarFeedback() {
    const supabase = window.supabase.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase
      .from('redacoes')
      .select('*, correcoes(*, perfis:professor_id(nome_completo))')
      .eq('id', id)
      .single()

    if (error) console.error("Erro:", error)
    else setDados(data)
    setLoading(false)
  }

  if (loading) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#FF0080] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black uppercase italic text-[#1A1A1A]">Abrindo sua correção...</p>
    </div>
  )

  if (!dados) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-center p-6">
      <h2 className="text-3xl font-black uppercase italic">Redação não encontrada!</h2>
      <button onClick={() => window.location.href = '/'} className="mt-6 font-black uppercase underline">Voltar</button>
    </div>
  )

  const correcao = dados.correcoes?.[0]

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-6 lg:p-12 font-sans relative overflow-hidden">
      
      {/* Decoração de Fundo */}
      <div className="absolute top-10 right-[-5%] rotate-12 opacity-10 pointer-events-none">
        <Sparkles size={300} className="text-[#FFDE03]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 font-black uppercase italic mb-8 hover:text-[#FF0080] transition-colors group text-xl"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> 
          Voltar ao Dashboard
        </button>

        <header className="mb-12 relative">
          <div className="inline-block bg-[#FFDE03] border-4 border-[#1A1A1A] px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] mb-4 transform -rotate-1">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              {dados.titulo || 'Minha Redação'}
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LADO ESQUERDO: TEXTO DO ALUNO */}
          <div className="lg:col-span-2">
            <div className="bg-white border-4 border-[#1A1A1A] p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] relative overflow-hidden">
              {/* Linha de margem de caderno */}
              <div className="absolute top-0 left-12 w-0.5 h-full bg-[#FF0080]/20"></div>
              
              <div className="relative z-10 pl-8">
                <div className="flex items-center gap-2 mb-6 text-[#FF0080]">
                  <FileText strokeWidth={3} />
                  <h3 className="font-black uppercase italic text-xl">Seu Texto Original</h3>
                </div>
                
                <div className="text-xl font-medium leading-relaxed font-serif italic text-[#333] whitespace-pre-wrap min-h-[400px]">
                  {dados.texto_redacao || "Documento enviado via anexo."}
                </div>

                {dados.arquivo_url && (
                  <div className="mt-10 pt-10 border-t-4 border-dashed border-[#1A1A1A]/10">
                    <a 
                      href={dados.arquivo_url} 
                      target="_blank" 
                      className="inline-flex items-center gap-3 px-6 py-3 bg-[#70E0BB] border-4 border-[#1A1A1A] rounded-2xl font-black uppercase italic hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]"
                    >
                      <Paperclip size={20} /> Abrir Arquivo Original
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LADO DIREITO: NOTA E FEEDBACK */}
          <div className="space-y-8">
            
            {/* CARD DA NOTA */}
            <div className="bg-[#70E0BB] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-center transform rotate-2 relative overflow-hidden">
              <div className="relative z-10">
                <Trophy size={48} className="mx-auto mb-2 text-white drop-shadow-[2px_2px_0px_rgba(26,26,26,1)]" />
                <span className="text-sm font-black uppercase tracking-widest opacity-80 italic">Resultado Final</span>
                <h2 className="text-7xl font-black text-[#1A1A1A] my-2 leading-none">
                  {correcao?.nota || '--'}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-4 text-[#1A1A1A]/60 font-bold uppercase text-[10px] italic">
                  <Calendar size={12} />
                  {correcao?.data_correcao ? new Date(correcao.data_correcao).toLocaleDateString() : '--'}
                </div>
              </div>
            </div>

            {/* CARD DO FEEDBACK */}
            <div className="bg-[#FFDE03] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform -rotate-1">
              <h3 className="font-black uppercase italic text-lg mb-4 flex items-center gap-2 border-b-2 border-[#1A1A1A] pb-2">
                <MessageSquareText size={20} /> Recado do Prof
              </h3>
              
              {/* SE TIVER ÁUDIO, MOSTRA O PLAYER AQUI */}
              {correcao?.audio_url && (
                <div className="mb-6 p-4 bg-white border-4 border-[#1A1A1A] rounded-2xl shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  <h4 className="font-black uppercase italic text-sm mb-3 flex items-center gap-2 text-[#3B82F6]">
                    <Headphones size={18} /> Ouça a correção:
                  </h4>
                  <audio 
                    src={correcao.audio_url} 
                    controls 
                    className="w-full h-10 outline-none rounded-lg"
                  />
                </div>
              )}

              {/* TEXTO DE FEEDBACK */}
              {correcao?.comentarios && (
                <p className="text-lg font-bold text-[#1A1A1A] leading-tight italic font-serif">
                  "{correcao.comentarios}"
                </p>
              )}

              {!correcao?.comentarios && !correcao?.audio_url && (
                <p className="text-lg font-bold text-[#1A1A1A] leading-tight italic font-serif opacity-50">
                  Sua correção está sendo processada!
                </p>
              )}
              
              {correcao?.perfis?.nome_completo && (
                <div className="mt-8 pt-4 border-t-2 border-[#1A1A1A]/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-[#1A1A1A] flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="text-xs font-black uppercase italic tracking-tighter">
                    Prof. {correcao.perfis.nome_completo}
                  </span>
                </div>
              )}
            </div>

            {/* DICA FINAL */}
            <div className="p-6 bg-[#FF0080] border-4 border-[#1A1A1A] rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-white">
              <p className="text-xs font-black uppercase italic leading-tight">
                Dica: Analise cada erro apontado para não repeti-los na próxima redação! Rumo ao 1000! ✨
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}