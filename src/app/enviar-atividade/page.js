'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  UploadCloud, 
  Type, 
  FileText, 
  Sparkles,
  Paperclip,
  Gamepad2,
  Rocket
} from 'lucide-react'

export default function EnviarAtividadeAuxiliar() {
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

  // FUNÇÃO DE UPLOAD PARA O BUCKET COM SANITIZAÇÃO
  const executarUpload = async (file) => {
    if (!file) return null
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const extensao = file.name.split('.').pop()
    const nomeLimpo = file.name
      .replace(`.${extensao}`, '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, "-")            
      .replace(/[^a-zA-Z0-9.\-]/g, "") 
      .toLowerCase();

    const nomeArquivo = `atividades/${Date.now()}-${nomeLimpo}.${extensao}`

    const { data, error } = await supabase.storage
      .from('redacoes_arquivos')
      .upload(nomeArquivo, file)

    if (error) throw new Error(`Erro ao subir arquivo: ${error.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from('redacoes_arquivos')
      .getPublicUrl(nomeArquivo)

    return publicUrl
  }

  // FUNÇÃO DE PUBLICAR NO BANCO (Nova Tabela: atividades_auxiliares)
  const handlePublicar = async (e) => {
    e.preventDefault()
    if (!titulo.trim() || !arquivoApoio) return alert("O título e o arquivo PDF são obrigatórios!")
    
    setEnviando(true)
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Você precisa estar logado.")

      const urlArquivo = await executarUpload(arquivoApoio)

      const { error: dbError } = await supabase.from('atividades_auxiliares').insert([{
        titulo: titulo,
        descricao: descricao,
        arquivo_url: urlArquivo,
        professor_id: user.id
      }])

      if (dbError) throw dbError

      alert("Atividade extra lançada com sucesso!")
      window.location.href = '/painel-professor' 

    } catch (err) {
      alert("Erro: " + err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-4 sm:p-6 lg:p-12 font-sans relative overflow-y-auto pb-24">
      
      <div className="absolute top-10 right-[-5%] md:right-10 rotate-12 opacity-10 pointer-events-none hidden md:block">
        <Gamepad2 size={250} className="text-[#A78BFA]" />
      </div>
      <div className="absolute bottom-10 left-[-5%] md:left-10 -rotate-12 opacity-10 pointer-events-none hidden md:block">
        <Rocket size={200} className="text-[#70E0BB]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        <button 
          onClick={() => window.location.href = '/painel-professor'}
          className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 hover:text-[#FF0080] transition-colors group text-sm md:text-xl"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform w-5 h-5 md:w-6 md:h-6" strokeWidth={3} /> 
          Painel Docente
        </button>

        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter transform -rotate-1 leading-tight">
            Nova <span className="text-[#A78BFA] drop-shadow-[2px_2px_0px_rgba(26,26,26,1)] md:drop-shadow-[4px_4px_0px_rgba(26,26,26,1)]">Atividade Extra</span>
          </h1>
          <div className="w-32 md:w-48 h-2 md:h-3 bg-[#70E0BB] mt-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"></div>
        </header>

        <form onSubmit={handlePublicar} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white border-4 border-[#1A1A1A] p-5 md:p-10 rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
              <div className="space-y-5 md:space-y-6">

                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm mb-1 md:mb-2 ml-2">
                    <Type size={16} className="md:w-5 md:h-5" /> Título da Atividade
                  </label>
                  <input 
                    placeholder="Ex: Alfabeto Divertido em PDF" 
                    value={titulo} 
                    onChange={e => setTitulo(e.target.value)}
                    className="w-full p-3 md:p-4 bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-bold text-sm md:text-lg outline-none focus:bg-[#FFDE03]/20 transition-colors"
                    required 
                  />
                </div>

                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm mb-1 md:mb-2 ml-2">
                    <FileText size={16} className="md:w-5 md:h-5" /> Descrição 
                  </label>
                  <textarea 
                    placeholder="Descreva rapidamente o que a criança deve fazer..." 
                    value={descricao} 
                    onChange={e => setDescricao(e.target.value)}
                    className="w-full h-32 md:h-56 p-4 md:p-6 bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] font-medium text-sm md:text-base outline-none italic font-serif leading-relaxed resize-none focus:bg-[#FFDE03]/20 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            
            <div className="bg-[#70E0BB] border-4 border-[#1A1A1A] p-5 md:p-8 rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform -rotate-1 group">
              <h3 className="font-black uppercase italic flex items-center gap-2 mb-1 md:mb-2 text-[#1A1A1A] text-sm md:text-lg">
                <Paperclip size={18} className="md:w-5 md:h-5" /> Atividade em PDF
              </h3>
              <p className="text-[10px] md:text-xs font-bold opacity-70 mb-3 md:mb-4 italic">Material para imprimir ou desenhar.</p>
              
              <div className="relative border-2 md:border-4 border-dashed border-[#1A1A1A] rounded-xl md:rounded-2xl p-6 md:p-8 bg-white/50 hover:bg-white transition-all text-center cursor-pointer">
                <input type="file" accept=".pdf, image/*" onChange={e => setArquivoApoio(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                <UploadCloud className="mx-auto mb-2 text-[#1A1A1A] w-8 h-8 md:w-10 md:h-10" />
                <p className="text-xs md:text-sm font-black uppercase tracking-tight text-[#FF0080]">
                  {arquivoApoio ? arquivoApoio.name : 'Anexar Arquivo Obrigatório'}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={enviando}
              className={`w-full py-4 md:py-6 rounded-full border-2 md:border-4 border-[#1A1A1A] font-black text-lg md:text-2xl uppercase italic shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 ${
                enviando ? 'bg-slate-300 text-[#555]' : 'bg-[#1A1A1A] text-white hover:bg-[#FF0080]'
              }`}
            >
              {enviando ? 'ENVIANDO...' : 'LANÇAR ATIVIDADE'} 
              {!enviando && <Rocket size={20} className="md:w-6 md:h-6" />}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}