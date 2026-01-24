'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Trophy, 
  MessageSquareText, 
  ExternalLink,
  Sparkles,
  Pencil
} from 'lucide-react'

export default function CorrigirRedacao() {
  const { id } = useParams() 
  const [redacao, setRedacao] = useState(null)
  const [nota, setNota] = useState('')
  const [feedback, setFeedback] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarRedacao
  }, [id])

  async function carregarRedacao() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data } = await supabase.from('redacoes').select('*, perfis(nome_completo)').eq('id', id).single()
    setRedacao(data)
  }

  const salvarNoBanco = async () => {
    if (!nota || !feedback) return alert("Preencha a nota e o feedback!")
    setSalvando(true)
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()

    try {
      const { error: errCorr } = await supabase.from('correcoes').insert([{
        redacao_id: id,
        professor_id: user.id,
        nota: parseFloat(nota),
        comentarios: feedback
      }])
      if (errCorr) throw errCorr

      const { error: errUpdate } = await supabase.from('redacoes').update({ status: 'corrigido' }).eq('id', id)
      if (errUpdate) throw errUpdate

      alert("Correção finalizada com sucesso!");
      window.location.href = '/painel-professor'
    } catch (err) {
      alert("Erro ao salvar: " + err.message)
    }
    setSalvando(false)
  }

  if (!redacao) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black uppercase italic text-[#1A1A1A]">Buscando folha de redação...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-6 lg:p-12 font-sans relative overflow-hidden">
      
      {/* Decorações de Fundo */}
      <div className="absolute top-10 left-[-5%] rotate-12 opacity-10 pointer-events-none">
        <Pencil size={300} className="text-[#3B82F6]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <button 
            onClick={() => window.location.href = '/painel-professor'}
            className="flex items-center gap-2 font-black uppercase italic hover:text-[#3B82F6] transition-colors group text-xl"
          >
            <ArrowLeft className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> 
            Voltar à Fila
          </button>

          <div className="bg-[#3B82F6] border-4 border-[#1A1A1A] px-8 py-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transform -rotate-1">
            <h2 className="text-white font-black uppercase italic tracking-tight">
              Corrigindo: <span className="text-[#FFDE03]">{redacao.perfis?.nome_completo}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUNA DO TEXTO (ESQUERDA) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-4 border-[#1A1A1A] p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] relative overflow-hidden min-h-[600px]">
              {/* Detalhe de folha de caderno */}
              <div className="absolute top-0 left-10 w-1 h-full bg-[#3B82F6]/10 border-l border-r border-[#3B82F6]/20"></div>
              
              <div className="relative z-10 pl-12">
                <div className="flex items-center gap-2 mb-8 text-[#3B82F6]">
                  <FileText strokeWidth={3} />
                  <h3 className="font-black uppercase italic text-2xl tracking-tighter">Texto da Redação</h3>
                </div>

                <h1 className="text-3xl font-black uppercase text-[#1A1A1A] mb-8 border-b-4 border-dashed border-[#1A1A1A]/10 pb-4">
                  {redacao.titulo || "Sem Título Definido"}
                </h1>

                <p className="text-xl font-medium leading-relaxed font-serif italic text-[#333] whitespace-pre-wrap mb-10">
                  {redacao.texto_redacao || "O aluno optou por enviar o arquivo em anexo."}
                </p>

                {redacao.arquivo_url && (
                  <a 
                    href={redacao.arquivo_url} 
                    target="_blank" 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-2xl font-black uppercase italic hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <ExternalLink size={24} /> Ver Anexo Original
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* COLUNA DA NOTA (DIREITA) */}
          <div className="space-y-8">
            <div className="bg-[#70E0BB] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
              <div className="space-y-6">
                
                {/* CAMPO NOTA */}
                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-sm mb-2 ml-2">
                    <Trophy size={18} /> Pontuação (0-1000)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ex: 920"
                    value={nota} 
                    onChange={e => setNota(e.target.value)}
                    className="w-full p-5 bg-white border-4 border-[#1A1A1A] rounded-2xl text-3xl font-black outline-none focus:bg-[#FFDE03]/20 transition-colors"
                  />
                </div>

                {/* CAMPO FEEDBACK */}
                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-sm mb-2 ml-2">
                    <MessageSquareText size={18} /> Comentários
                  </label>
                  <textarea 
                    placeholder="Dê dicas valiosas para o aluno..." 
                    value={feedback} 
                    onChange={e => setFeedback(e.target.value)}
                    className="w-full h-64 p-6 bg-white border-4 border-[#1A1A1A] rounded-[30px] font-bold outline-none focus:bg-[#3B82F6]/10 transition-colors italic leading-tight"
                  />
                </div>

                {/* BOTÃO SALVAR */}
                <button 
                  onClick={salvarNoBanco} 
                  disabled={salvando}
                  className={`w-full py-6 rounded-full border-4 border-[#1A1A1A] font-black text-2xl uppercase italic shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 ${
                    salvando ? 'bg-slate-300' : 'bg-[#FF0080] text-white'
                  }`}
                >
                  {salvando ? 'PROCESSANDO...' : 'SALVAR NOTA'} 
                  <CheckCircle2 size={28} strokeWidth={3} />
                </button>

              </div>
            </div>

            {/* DICA DE CORREÇÃO */}
            <div className="bg-[#FFDE03] border-4 border-[#1A1A1A] p-6 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] -rotate-1">
              <div className="flex items-start gap-3">
                <Sparkles className="shrink-0" />
                <p className="text-xs font-black uppercase italic leading-tight opacity-70">
                  Dica: Seja específico nas competências do ENEM para que o aluno saiba exatamente onde melhorar.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}