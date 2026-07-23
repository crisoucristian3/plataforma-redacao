'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, Send, Plus, Trash2, Map, PlayCircle, 
  HelpCircle, Paperclip, Pencil, UploadCloud, Trophy
} from 'lucide-react'

export default function MontarTrilha() {
  const [loading, setLoading] = useState(false)
  
  // 1. DADOS GERAIS
  const [titulo, setTitulo] = useState('')
  const [tema, setTema] = useState('')
  const [capa, setCapa] = useState(null)

  // 2. MISSÕES DINÂMICAS (Listas)
  const [videos, setVideos] = useState([]) // { id, file }
  const [quizzes, setQuizzes] = useState([]) // { id, pergunta, opcoes: [], correta }
  const [pdfs, setPdfs] = useState([]) // { id, file }
  const [redacoes, setRedacoes] = useState([]) // { id, titulo }

  useEffect(() => {
    if (!window.supabase) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // CÁLCULO DINÂMICO DE PONTOS
  const totalPontos = (videos.length * 30) + (quizzes.length * 20) + (pdfs.length * 10) + (redacoes.length * 40)

  // FUNÇÕES AUXILIARES PARA GERENCIAR LISTAS
  const gerarId = () => Date.now() + Math.random()

  // VÍDEOS
  const adicionarVideo = () => setVideos([...videos, { id: gerarId(), file: null }])
  const removerVideo = (id) => setVideos(videos.filter(v => v.id !== id))
  const atualizarVideo = (id, file) => setVideos(videos.map(v => v.id === id ? { ...v, file } : v))

  // QUIZZES
  const adicionarQuiz = () => setQuizzes([...quizzes, { id: gerarId(), pergunta: '', opcoes: ['', ''], correta: '' }])
  const removerQuiz = (id) => setQuizzes(quizzes.filter(q => q.id !== id))
  const atualizarQuiz = (id, campo, valor) => setQuizzes(quizzes.map(q => q.id === id ? { ...q, [campo]: valor } : q))
  const adicionarOpcaoQuiz = (quizId) => setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, opcoes: [...q.opcoes, ''] } : q))
  const removerOpcaoQuiz = (quizId, opIndex) => setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, opcoes: q.opcoes.filter((_, i) => i !== opIndex) } : q))
  const atualizarOpcaoQuiz = (quizId, opIndex, valor) => setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, opcoes: q.opcoes.map((op, i) => i === opIndex ? valor : op) } : q))

  // PDFs
  const adicionarPdf = () => setPdfs([...pdfs, { id: gerarId(), file: null }])
  const removerPdf = (id) => setPdfs(pdfs.filter(p => p.id !== id))
  const atualizarPdf = (id, file) => setPdfs(pdfs.map(p => p.id === id ? { ...p, file } : p))

  // REDAÇÕES
  const adicionarRedacao = () => setRedacoes([...redacoes, { id: gerarId(), titulo: '' }])
  const removerRedacao = (id) => setRedacoes(redacoes.filter(r => r.id !== id))
  const atualizarRedacao = (id, titulo) => setRedacoes(redacoes.map(r => r.id === id ? { ...r, titulo } : r))

  const sanitizarNome = (nome) => {
    const ext = nome.split('.').pop()
    const limpo = nome.replace(`.${ext}`, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "")
    return `${Date.now()}-${limpo}.${ext}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo || !tema) return alert("Preencha o Título e o Tema da Trilha!")
    
    // Validação de Quizzes incompletos
    for (let q of quizzes) {
      if (!q.pergunta || !q.correta) return alert("Verifique os Quizzes: todos precisam de pergunta e resposta correta.")
    }

    setLoading(true)
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada.")

      let urlCapaFinal = null
      if (capa) {
        const nomeCapa = `trilhas/capas/${sanitizarNome(capa.name)}`
        await supabase.storage.from('redacoes_arquivos').upload(nomeCapa, capa)
        urlCapaFinal = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomeCapa).data.publicUrl
      }

      // Upload de todos os VÍDEOS
      const videosFinais = []
      for (let v of videos) {
        if (v.file) {
          const nomeVideo = `trilhas/videos/${sanitizarNome(v.file.name)}`
          await supabase.storage.from('redacoes_arquivos').upload(nomeVideo, v.file)
          const urlVideo = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomeVideo).data.publicUrl
          videosFinais.push({ url: urlVideo })
        }
      }

      // Upload de todos os PDFs
      const pdfsFinais = []
      for (let p of pdfs) {
        if (p.file) {
          const nomePdf = `trilhas/pdfs/${sanitizarNome(p.file.name)}`
          await supabase.storage.from('redacoes_arquivos').upload(nomePdf, p.file)
          const urlPdf = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomePdf).data.publicUrl
          pdfsFinais.push({ nome: p.file.name, url: urlPdf })
        }
      }

      const { error } = await supabase.from('trilhas_gamificadas').insert([{
        professor_id: user.id,
        titulo,
        tema,
        capa_url: urlCapaFinal,
        videos: videosFinais,
        quizzes: quizzes.map(q => ({ pergunta: q.pergunta, opcoes: q.opcoes.filter(o => o), correta: q.correta })),
        pdfs: pdfsFinais,
        redacoes: redacoes.map(r => ({ titulo: r.titulo })).filter(r => r.titulo),
        total_pontos: totalPontos
      }])

      if (error) throw error
      alert("Trilha Épica lançada com sucesso! 🚀")
      window.location.href = '/painel-professor'

    } catch (err) {
      alert("Erro ao montar trilha: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-12 text-[#1A1A1A] font-sans pb-24">
      <button onClick={() => window.location.href = '/painel-professor'} className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 hover:text-[#FF0080] transition-colors text-sm md:text-base">
        <ArrowLeft strokeWidth={3} /> Painel Docente
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b-4 border-[#1A1A1A] pb-6 flex items-center justify-between sticky top-0 bg-[#FDFBF7] z-10 pt-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#F59E0B] flex items-center gap-3">
              <Map className="w-8 h-8 md:w-12 md:h-12 text-[#1A1A1A]" /> Forjar Trilha
            </h1>
            <p className="text-xs md:text-sm font-bold opacity-70 uppercase mt-2">Jornada gamificada dinâmica.</p>
          </div>
          <div className="flex flex-col items-center justify-center w-20 h-20 bg-[#1A1A1A] text-[#F59E0B] rounded-2xl border-4 border-[#F59E0B] shadow-[4px_4px_0px_0px_#F59E0B]">
            <span className="block text-2xl md:text-3xl font-black leading-none">{totalPontos}</span>
            <span className="text-[9px] md:text-[10px] font-bold uppercase text-white">PTS TOTAL</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* 1. DADOS GERAIS */}
          <section className="bg-white border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-[#1A1A1A] pb-2 inline-block">1. Informações do Mapa</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="font-black uppercase text-xs md:text-sm">Título da Trilha</label>
                <input placeholder="Ex: A Batalha da Interpretação" className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl p-4 font-bold outline-none" value={titulo} onChange={e => setTitulo(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <label className="font-black uppercase text-xs md:text-sm">Descrição Curta</label>
                <input placeholder="Ex: Vença os 3 chefões resolvendo quizzes e redações!" className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl p-4 font-bold outline-none" value={tema} onChange={e => setTema(e.target.value)} required />
              </div>
              <div className="pt-2">
                <label className="font-black uppercase text-xs md:text-sm block mb-2">Capa do Mapa (Opcional)</label>
                <label className="flex items-center gap-4 p-4 border-2 border-dashed border-[#1A1A1A] rounded-xl bg-white hover:bg-[#F9F6F0] cursor-pointer transition-colors">
                  <UploadCloud size={24} className="text-[#F59E0B]" />
                  <span className="font-bold text-sm">{capa ? capa.name : 'Clique para enviar imagem...'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setCapa(e.target.files[0])} />
                </label>
              </div>
            </div>
          </section>

          {/* 2. VÍDEOS (Agora com Upload e Botão Lixeira Consertado) */}
          <section className="bg-[#A78BFA] border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="flex justify-between items-center mb-6 border-b-2 border-[#1A1A1A] pb-3">
              <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2"><PlayCircle /> Vídeos (30 PTS cada)</h2>
              <button type="button" onClick={adicionarVideo} className="bg-[#1A1A1A] text-white px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-white hover:text-[#1A1A1A] transition-colors"><Plus size={14}/> Adicionar</button>
            </div>
            {videos.length === 0 && <p className="text-white/80 font-bold text-sm italic">Nenhum vídeo adicionado.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((v, i) => (
                <div key={v.id} className="relative bg-white border-4 border-[#1A1A1A] p-6 pt-10 rounded-2xl text-center flex flex-col items-center justify-center">
                  <button type="button" title="Excluir Vídeo" onClick={() => removerVideo(v.id)} className="absolute top-2 right-2 text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-lg border-2 border-transparent hover:border-[#1A1A1A] transition-all">
                    <Trash2 size={18}/>
                  </button>
                  <label className="cursor-pointer flex flex-col items-center gap-2 w-full mt-2">
                    <UploadCloud size={32} className="text-[#A78BFA]" />
                    <span className="font-bold text-xs md:text-sm line-clamp-2 w-full px-2">{v.file ? v.file.name : 'Selecionar Arquivo de Vídeo'}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={e => atualizarVideo(v.id, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* 3. QUIZZES (Botão Lixeira Consertado) */}
          <section className="bg-[#FFDE03] border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="flex justify-between items-center mb-6 border-b-2 border-[#1A1A1A] pb-3">
              <h2 className="text-xl font-black uppercase italic text-[#1A1A1A] flex items-center gap-2"><HelpCircle /> Quizzes (20 PTS cada)</h2>
              <button type="button" onClick={adicionarQuiz} className="bg-[#1A1A1A] text-[#FFDE03] px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-white hover:text-[#1A1A1A] transition-colors"><Plus size={14}/> Adicionar</button>
            </div>
            {quizzes.length === 0 && <p className="text-[#1A1A1A]/70 font-bold text-sm italic">Nenhum quiz adicionado.</p>}
            <div className="space-y-8">
              {quizzes.map((q, i) => (
                <div key={q.id} className="bg-white border-4 border-[#1A1A1A] rounded-2xl p-5 relative mt-4">
                  <button type="button" title="Excluir Quiz" onClick={() => removerQuiz(q.id)} className="absolute top-3 right-3 text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-xl border-2 border-transparent hover:border-[#1A1A1A] transition-all z-10">
                    <Trash2 size={20}/>
                  </button>
                  <span className="absolute -top-4 -left-4 w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center font-black rounded-lg border-2 border-[#FFDE03] z-10">Q{i+1}</span>
                  
                  <div className="grid gap-2 mb-4 mt-2 pr-12">
                    <label className="font-black uppercase text-[10px]">Pergunta</label>
                    <input placeholder="Digite a pergunta..." className="w-full bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl p-3 font-bold outline-none" value={q.pergunta} onChange={e => atualizarQuiz(q.id, 'pergunta', e.target.value)} />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <label className="font-black uppercase text-[10px]">Alternativas</label>
                    {q.opcoes.map((op, opIdx) => (
                      <div key={opIdx} className="flex gap-2">
                        <input placeholder={`Alternativa ${opIdx+1}`} className="flex-1 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl p-2 text-sm font-bold outline-none" value={op} onChange={e => atualizarOpcaoQuiz(q.id, opIdx, e.target.value)} />
                        <button type="button" onClick={() => removerOpcaoQuiz(q.id, opIdx)} className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg border-2 border-transparent hover:border-[#1A1A1A] transition-colors"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => adicionarOpcaoQuiz(q.id)} className="text-[10px] font-black uppercase text-[#3B82F6] flex items-center gap-1 mt-2 hover:underline"><Plus size={12}/> Nova Opção</button>
                  </div>

                  <div className="pt-3 border-t-2 border-dashed border-[#1A1A1A]/20">
                    <label className="font-black uppercase text-[10px] text-[#FF0080]">Resposta Correta (Gabarito)</label>
                    <select className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl p-2 mt-1 text-sm font-bold outline-none" value={q.correta} onChange={e => atualizarQuiz(q.id, 'correta', e.target.value)}>
                      <option value="">Selecione...</option>
                      {q.opcoes.map((op, idx) => op && <option key={idx} value={op}>{op}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. PDFs EXTRAS (Botão Lixeira Consertado) */}
          <section className="bg-[#4ADE80] border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="flex justify-between items-center mb-6 border-b-2 border-[#1A1A1A] pb-3">
              <h2 className="text-xl font-black uppercase italic text-[#1A1A1A] flex items-center gap-2"><Paperclip /> PDFs (10 PTS cada)</h2>
              <button type="button" onClick={adicionarPdf} className="bg-[#1A1A1A] text-[#4ADE80] px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-white hover:text-[#1A1A1A] transition-colors"><Plus size={14}/> Adicionar</button>
            </div>
            {pdfs.length === 0 && <p className="text-[#1A1A1A]/70 font-bold text-sm italic">Nenhum PDF adicionado.</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {pdfs.map((p, i) => (
                <div key={p.id} className="relative bg-white border-4 border-[#1A1A1A] p-6 pt-10 rounded-2xl text-center flex flex-col items-center justify-center">
                  <button type="button" title="Excluir PDF" onClick={() => removerPdf(p.id)} className="absolute top-2 right-2 text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-lg border-2 border-transparent hover:border-[#1A1A1A] transition-all">
                    <Trash2 size={18}/>
                  </button>
                  <label className="cursor-pointer flex flex-col items-center gap-2 w-full mt-2">
                    <UploadCloud size={32} className="text-[#4ADE80]" />
                    <span className="font-bold text-xs md:text-sm line-clamp-2 w-full px-2">{p.file ? p.file.name : 'Selecionar Arquivo PDF'}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={e => atualizarPdf(p.id, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* 5. REDAÇÕES (Botão Lixeira Consertado) */}
          <section className="bg-[#FF0080] border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="flex justify-between items-center mb-6 border-b-2 border-[#1A1A1A] pb-3">
              <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2"><Pencil /> Redações (40 PTS cada)</h2>
              <button type="button" onClick={adicionarRedacao} className="bg-[#1A1A1A] text-white px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-white hover:text-[#1A1A1A] transition-colors"><Plus size={14}/> Adicionar</button>
            </div>
            {redacoes.length === 0 && <p className="text-white/80 font-bold text-sm italic">Nenhuma redação adicionada.</p>}
            <div className="space-y-4">
              {redacoes.map((r, i) => (
                <div key={r.id} className="flex gap-2 items-center bg-white p-2 rounded-2xl border-4 border-[#1A1A1A]">
                  <span className="font-black text-xl ml-3 text-[#FF0080]">R{i+1}</span>
                  <input placeholder="Título ou Comando da Redação..." className="flex-1 bg-transparent p-3 font-bold outline-none text-sm md:text-base" value={r.titulo} onChange={e => atualizarRedacao(r.id, e.target.value)} />
                  <button type="button" title="Excluir Redação" onClick={() => removerRedacao(r.id)} className="p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl border-2 border-transparent hover:border-[#1A1A1A] transition-all"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </section>

          {/* BOTÃO SALVAR */}
          <button type="submit" disabled={loading} className="w-full py-6 bg-[#1A1A1A] text-white rounded-full font-black text-xl md:text-2xl uppercase italic border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#F59E0B] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
            {loading ? "SALVANDO JORNADA..." : `PUBLICAR TRILHA (${totalPontos} PTS)`}
            {!loading && <Trophy size={24} className="text-[#F59E0B]" />}
          </button>

        </form>
      </div>
    </div>
  )
}