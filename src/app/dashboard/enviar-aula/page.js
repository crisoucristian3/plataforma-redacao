'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Video, 
  Image as ImageIcon, 
  UploadCloud, 
  BookOpen, 
  Type, 
  FileText, 
  Sparkles 
} from 'lucide-react'

export default function EnviarAula() {
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [arquivoVideo, setArquivoVideo] = useState(null)
  const [arquivoCapa, setArquivoCapa] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [cursos, setCursos] = useState([])
  const [cursoSelecionado, setCursoSelecionado] = useState('')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarDados
  }, [])

  async function carregarDados() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data } = await supabase.from('cursos').select('*')
    setCursos(data || [])
    if (data?.length > 0) setCursoSelecionado(data[0].id)
  }

  const executarUpload = async (file, pasta) => {
    if (!file) return null
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const extensao = file.name.split('.').pop()
    const nomeArquivo = `${pasta}/${Date.now()}.${extensao}`

    const { data, error } = await supabase.storage
      .from('redacoes_arquivos')
      .upload(nomeArquivo, file)

    if (error) throw new Error(`Erro ao subir ${pasta}: ${error.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from('redacoes_arquivos')
      .getPublicUrl(nomeArquivo)

    return publicUrl
  }

  const handlePublicar = async (e) => {
    e.preventDefault()
    if (!arquivoVideo || !cursoSelecionado) return alert("Selecione o vídeo e o curso!")
    
    setEnviando(true)
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    try {
      const urlVideo = await executarUpload(arquivoVideo, 'videos')
      const urlCapa = await executarUpload(arquivoCapa, 'capas')

      const { error: dbError } = await supabase.from('aulas').insert([{
        titulo: titulo,
        conteudo_texto: conteudo,
        url_video: urlVideo,
        capa_url: urlCapa,
        curso_id: cursoSelecionado
      }])

      if (dbError) throw dbError

      alert("Aula publicada com sucesso!")
      window.location.href = '/painel-professor'

    } catch (err) {
      alert(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] p-6 lg:p-12 font-sans relative overflow-hidden">
      
      {/* Decorações de Fundo */}
      <div className="absolute top-[-5%] right-[-5%] rotate-12 opacity-10 pointer-events-none">
        <Video size={300} className="text-[#A78BFA]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => window.location.href = '/painel-professor'}
          className="flex items-center gap-2 font-black uppercase italic mb-8 hover:text-[#A78BFA] transition-colors group text-xl"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> 
          Painel Docente
        </button>

        <header className="mb-12">
          <h1 className="text-6xl font-black uppercase italic tracking-tighter transform -rotate-1">
            Criar <span className="text-[#A78BFA] drop-shadow-[4px_4px_0px_rgba(26,26,26,1)]">Nova Aula</span>
          </h1>
          <div className="w-48 h-3 bg-[#FFDE03] mt-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"></div>
        </header>

        <form onSubmit={handlePublicar} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUNA DA ESQUERDA: INFOS */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
              <div className="space-y-6">
                
                {/* SELECT CURSO */}
                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-sm mb-2 ml-2">
                    <BookOpen size={16} /> Selecione o Curso
                  </label>
                  <select 
                    value={cursoSelecionado} 
                    onChange={e => setCursoSelecionado(e.target.value)}
                    className="w-full p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold outline-none appearance-none cursor-pointer focus:bg-[#A78BFA]/10"
                  >
                    {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                {/* INPUT TITULO */}
                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-sm mb-2 ml-2">
                    <Type size={16} /> Título da Aula
                  </label>
                  <input 
                    placeholder="Ex: Domine a Competência 1 do ENEM" 
                    value={titulo} 
                    onChange={e => setTitulo(e.target.value)}
                    className="w-full p-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-bold outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
                    required 
                  />
                </div>

                {/* TEXTAREA DESCRICAO */}
                <div className="relative group">
                  <label className="flex items-center gap-2 font-black uppercase italic text-sm mb-2 ml-2">
                    <FileText size={16} /> Descrição / Material de Apoio
                  </label>
                  <textarea 
                    placeholder="O que os alunos vão aprender nesta aula?" 
                    value={conteudo} 
                    onChange={e => setConteudo(e.target.value)}
                    className="w-full h-48 p-6 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-[30px] font-medium outline-none italic font-serif leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: UPLOADS */}
          <div className="space-y-8">
            
            {/* BOX VÍDEO */}
            <div className="bg-[#A78BFA] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform -rotate-1 group">
              <h3 className="font-black uppercase italic flex items-center gap-2 mb-4 text-white">
                <Video size={20} /> Arquivo de Vídeo
              </h3>
              <div className="relative border-4 border-dashed border-[#1A1A1A] rounded-2xl p-6 bg-white/30 hover:bg-white transition-all text-center cursor-pointer">
                <input type="file" accept="video/*" onChange={e => setArquivoVideo(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                <UploadCloud className="mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-tight">
                  {arquivoVideo ? arquivoVideo.name : 'Selecionar MP4'}
                </p>
              </div>
            </div>

            {/* BOX CAPA */}
            <div className="bg-[#FFA07A] border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] rotate-1 group">
              <h3 className="font-black uppercase italic flex items-center gap-2 mb-4 text-white">
                <ImageIcon size={20} /> Capa da Aula
              </h3>
              <div className="relative border-4 border-dashed border-[#1A1A1A] rounded-2xl p-6 bg-white/30 hover:bg-white transition-all text-center cursor-pointer">
                <input type="file" accept="image/*" onChange={e => setArquivoCapa(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                <ImageIcon className="mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-tight">
                  {arquivoCapa ? arquivoCapa.name : 'Selecionar JPG/PNG'}
                </p>
              </div>
            </div>

            {/* BOTÃO PUBLICAR */}
            <button 
              type="submit" 
              disabled={enviando}
              className={`w-full py-6 rounded-full border-4 border-[#1A1A1A] font-black text-2xl uppercase italic shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 ${
                enviando ? 'bg-slate-300' : 'bg-[#70E0BB] hover:bg-[#FFDE03]'
              }`}
            >
              {enviando ? 'SUBINDO...' : 'PUBLICAR'} 
              <Sparkles size={24} />
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}