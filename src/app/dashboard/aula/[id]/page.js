'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Play, BookOpen, Sparkles, Layout, Info, Clock } from 'lucide-react'

export default function VerAula() {
  const { id } = useParams()
  const [aula, setAula] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarAula
  }, [id])

  async function carregarAula() {
    const supabase = window.supabase.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data, error } = await supabase
      .from('aulas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error("Erro ao buscar aula:", error.message)
    } else {
      setAula(data)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#70E0BB] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black uppercase italic text-[#1A1A1A]">Abrindo seu material...</p>
    </div>
  )

  if (!aula) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-black uppercase italic">Aula não encontrada!</h2>
      <button onClick={() => window.history.back()} className="mt-6 font-black uppercase underline">Voltar</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-6 lg:p-12 font-sans relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* BOTÃO VOLTAR DINÂMICO */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 font-black uppercase italic mb-8 hover:text-[#70E0BB] transition-colors group text-xl"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> 
          Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* PLAYER DE VÍDEO */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white border-4 border-[#1A1A1A] rounded-[40px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] relative">
              {aula.url_video || aula.video_url ? (
                <video 
                  key={aula.url_video || aula.video_url} 
                  controls 
                  controlsList="nodownload" 
                  className="w-full aspect-video bg-black block"
                  poster={aula.capa_url}
                >
                  <source src={aula.url_video || aula.video_url} type="video/mp4" />
                  Seu navegador não suporta a reprodução de vídeo.
                </video>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-[#F9F6F0] p-10">
                   <p className="font-black uppercase italic text-xl text-[#FF0080]">Vídeo não disponível!</p>
                </div>
              )}
            </div>

            {/* INFO DA AULA */}
            <div className="bg-white border-4 border-[#1A1A1A] p-10 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform -rotate-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#70E0BB] px-4 py-1 border-2 border-[#1A1A1A] rounded-full font-black text-xs uppercase italic">
                  Módulo de Estudos
                </span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter mb-6">{aula.titulo}</h1>
              <div className="w-full h-1 bg-[#1A1A1A] mb-8 opacity-10"></div>
              <p className="text-xl font-medium leading-relaxed font-serif italic text-[#444] whitespace-pre-wrap">
                {aula.conteudo_texto || aula.legenda || "Sem descrição."}
              </p>
            </div>
          </div>

          {/* BARRA LATERAL */}
          <div className="space-y-6">
            <div className="bg-[#70E0BB] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
              <h3 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2">
                <BookOpen size={20} /> Estudo
              </h3>
              <p className="text-sm font-bold opacity-70 uppercase italic">Anote os pontos importantes desta aula no seu caderno!</p>
            </div>
            <div className="bg-[#FFDE03] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] -rotate-1">
               <Sparkles size={24} className="mb-4" />
               <p className="text-sm font-black uppercase italic leading-tight">Reassista sempre que precisar de reforço!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}