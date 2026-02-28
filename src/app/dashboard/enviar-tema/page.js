'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  UploadCloud, 
  Type, 
  FileText, 
  Sparkles,
  Paperclip
} from 'lucide-react'

export default function EnviarTema() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [arquivoApoio, setArquivoApoio] = useState(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // FUNÇÃO DE UPLOAD PARA O BUCKET
  const executarUpload = async (file) => {
    if (!file) return null
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const extensao = file.name.split('.').pop()
    const nomeArquivo = `temas/${Date.now()}.${extensao}`

    const { data, error } = await supabase.storage
      .from('redacoes_arquivos')
      .upload(nomeArquivo, file)

    if (error) throw new Error(`Erro ao subir arquivo: ${error.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from('redacoes_arquivos')
      .getPublicUrl(nomeArquivo)

    return publicUrl
  }

  // FUNÇÃO DE PUBLICAR NO BANCO
  const handlePublicar = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return alert("O título do tema é obrigatório!")
    
    setEnviando(true)
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Você precisa estar logado.")

      // 1. Faz o upload do arquivo de apoio (se houver)
      const urlArquivo = await executarUpload(arquivoApoio)

      // 2. Salva na tabela temas_redacao
      const { error: dbError } = await supabase.from('temas_redacao').insert([{
        titulo: titulo,
        descricao: descricao,
        arquivo_apoio_url: urlArquivo,
        professor_id: user.id
      }])

      if (dbError) throw dbError

      alert("Tema publicado com sucesso!")
      window.location.href = '/painel-professor' // Volta para o painel

    } catch (err) {
      alert("Erro: " + err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-6 lg:p-12 font-sans relative overflow-hidden">
      
      {/* Decorações de Fundo */}
      <div className="absolute top-10 right-[-5%] rotate-12 opacity-10 pointer-events-none">
        <FileText size={300} className="text-[#FF0080]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => window.location.href = '/painel-professor'}
          className="flex items-center gap-2 font-black uppercase italic mb-8 hover:text-[#FF0080] transition-colors group text-xl"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> 
          Painel Docente
        </button>

        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter transform -rotate-1">
            Propor <span className="text-[#FF0080] drop-shadow-[4px_4px_0px_rgba(26,26,26,1)]">Novo Tema</span>
          </h1>
          <div className="w-48 h-3 bg-[#FFDE03] mt-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"></div>
        </header>

        <form onSubmit={handlePublicar} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUNA DA ESQUERDA: TEXTOS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border-4 border-[#1A1A1A] p-8 md:p-10 rounded-[40px] shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
              <div className="space-y-6">

                {/* INPUT TITULO */}
                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-sm mb-2 ml-2">
                    <Type size={16} /> Qual é o tema?
                  </label>
                  <input 
                    placeholder="Ex: Os desafios da IA na educação brasileira" 
                    value={titulo} 
                    onChange={e => setTitulo(e.target.value)}
                    className="w-full p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold text-lg outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
                    required 
                  />
                </div>

                {/* TEXTAREA DESCRICAO / PROPOSTA */}
                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-sm mb-2 ml-2">
                    <FileText size={16} /> Texto da Proposta (Opcional)
                  </label>
                  <textarea 
                    placeholder="Escreva as instruções ou orientações para os alunos..." 
                    value={descricao} 
                    onChange={e => setDescricao(e.target.value)}
                    className="w-full h-56 p-6 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-[30px] font-medium outline-none italic font-serif leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: UPLOAD E BOTÃO */}
          <div className="space-y-8">
            
            {/* BOX DE ARQUIVO DE APOIO */}
            <div className="bg-[#FFDE03] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform -rotate-1 group">
              <h3 className="font-black uppercase italic flex items-center gap-2 mb-2 text-[#1A1A1A]">
                <Paperclip size={20} /> Textos de Apoio
              </h3>
              <p className="text-xs font-bold opacity-70 mb-4 italic">PDF ou Imagens com infográficos, notícias, etc.</p>
              
              <div className="relative border-4 border-dashed border-[#1A1A1A] rounded-2xl p-8 bg-white/50 hover:bg-white transition-all text-center cursor-pointer">
                <input type="file" accept=".pdf, image/*" onChange={e => setArquivoApoio(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                <UploadCloud className="mx-auto mb-2 text-[#1A1A1A]" size={32} />
                <p className="text-sm font-black uppercase tracking-tight text-[#FF0080]">
                  {arquivoApoio ? arquivoApoio.name : 'Anexar Arquivo'}
                </p>
              </div>
            </div>

            {/* BOTÃO PUBLICAR */}
            <button 
              type="submit" 
              disabled={enviando}
              className={`w-full py-6 rounded-full border-4 border-[#1A1A1A] font-black text-2xl uppercase italic shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 ${
                enviando ? 'bg-slate-300 text-[#555]' : 'bg-[#FF0080] hover:bg-[#1A1A1A] text-white'
              }`}
            >
              {enviando ? 'ENVIANDO...' : 'PUBLICAR TEMA'} 
              {!enviando && <Sparkles size={24} />}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}