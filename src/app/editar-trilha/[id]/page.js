'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, Send, Plus, Trash2, Map, PlayCircle, 
  HelpCircle, Paperclip, Pencil, UploadCloud, Trophy, RefreshCw
} from 'lucide-react'

export default function EditarTrilha() {
  const { id } = useParams() // Pega o ID da trilha pela URL
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  
  // 1. DADOS GERAIS
  const [titulo, setTitulo] = useState('')
  const [tema, setTema] = useState('')
  const [capa, setCapa] = useState(null)
  const [capaUrlAtual, setCapaUrlAtual] = useState(null)
  const [disciplina, setDisciplina] = useState('Linguagens')

  // 2. MISSÕES DINÂMICAS (Listas)
  const [videos, setVideos] = useState([]) 
  const [quizzes, setQuizzes] = useState([]) 
  const [pdfs, setPdfs] = useState([]) 
  const [redacoes, setRedacoes] = useState([]) 

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarTrilhaExistente
  }, [])

  // CARREGA OS DADOS QUE JÁ ESTÃO NO BANCO
  async function carregarTrilhaExistente() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data } = await supabase.from('trilhas_gamificadas').select('*').eq('id', id).single()
      
      if (data) {
        setTitulo(data.titulo || '')
        setTema(data.tema || '')
        setDisciplina(data.disciplina || 'Linguagens')
        setCapaUrlAtual(data.capa_url || null)
        
        setVideos((data.videos || []).map(v => ({ id: gerarId(), url: v.url, file: null })))
        setQuizzes((data.quizzes || []).map(q => ({ id: gerarId(), ...q })))
        setPdfs((data.pdfs || []).map(p => ({ id: gerarId(), nome: p.nome, url: p.url, file: null })))
        setRedacoes((data.redacoes || []).map(r => ({ id: gerarId(), ...r })))
      }
    } catch (err) {
      alert("Erro ao carregar a trilha para edição.")
      window.location.href = '/painel-professor'
    } finally {
      setLoading(false)
    }
  }

  const totalPontos = (videos.length * 30) + (quizzes.length * 20) + (pdfs.length * 10) + (redacoes.length * 40)
  const gerarId = () => Date.now() + Math.random()

  // VÍDEOS
  const adicionarVideo = () => setVideos([...videos, { id: gerarId(), url: null, file: null }])
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
  const adicionarPdf = () => setPdfs([...pdfs, { id: gerarId(), nome: null, url: null, file: null }])
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

  async function handleUpdate(e) {
    e.preventDefault()
    if (!titulo || !tema) return alert("Preencha o Título e o Tema da Trilha!")
    
    for (let q of quizzes) {
      if (!q.pergunta || !q.correta) return alert("Verifique os Quizzes: todos precisam de pergunta e resposta correta.")
    }

    setSalvando(true)
    setLoadingText("Atualizando a Trilha...")
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada.")

      let urlCapaFinal = capaUrlAtual
      if (capa) {
        setLoadingText("Atualizando a Capa...")
        const nomeCapa = `trilhas/capas/${sanitizarNome(capa.name)}`
        const { error: errCapa } = await supabase.storage.from('redacoes_arquivos').upload(nomeCapa, capa, { upsert: true })
        if (errCapa) throw new Error("Erro ao subir Capa: " + errCapa.message)
        urlCapaFinal = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomeCapa).data.publicUrl
      }

      // ATUALIZAÇÃO DE VÍDEOS
      const videosFinais = []
      let contVideo = 1
      for (let v of videos) {
        if (v.file) { // Se escolheu arquivo novo, sobe pro banco
          setLoadingText(`Atualizando Vídeo ${contVideo}... (Isso pode demorar dependendo da internet)`)
          const nomeVideo = `trilhas/videos/${sanitizarNome(v.file.name)}`
          const { error: errVideo } = await supabase.storage.from('redacoes_arquivos').upload(nomeVideo, v.file, { upsert: true })
          if (errVideo) throw new Error(`O vídeo "${v.file.name}" foi bloqueado! Motivo: ${errVideo.message}`)
          const urlVideo = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomeVideo).data.publicUrl
          videosFinais.push({ url: urlVideo })
        } else if (v.url) { // Se não mexeu, mantém a URL antiga
          videosFinais.push({ url: v.url })
        }
        contVideo++
      }

      // ATUALIZAÇÃO DE PDFs
      const pdfsFinais = []
      let contPdf = 1
      for (let p of pdfs) {
        if (p.file) {
          setLoadingText(`Atualizando PDF ${contPdf}...`)
          const nomePdf = `trilhas/pdfs/${sanitizarNome(p.file.name)}`
          const { error: errPdf } = await supabase.storage.from('redacoes_arquivos').upload(nomePdf, p.file, { upsert: true })
          if (errPdf) throw new Error(`O PDF "${p.file.name}" foi bloqueado! Motivo: ${errPdf.message}`)
          const urlPdf = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomePdf).data.publicUrl
          pdfsFinais.push({ nome: p.file.name, url: urlPdf })
        } else if (p.url) {
          pdfsFinais.push({ nome: p.nome, url: p.url })
        }
        contPdf++
      }

      setLoadingText("Salvando as alterações finais...")
      
      const { error } = await supabase.from('trilhas_gamificadas').update({
        titulo,
        tema,
        disciplina,
        capa_url: urlCapaFinal,
        videos: videosFinais,
        quizzes: quizzes.map(q => ({ pergunta: q.pergunta, opcoes: q.opcoes.filter(o => o), correta: q.correta })),
        pdfs: pdfsFinais,
        redacoes: redacoes.map(r => ({ titulo: r.titulo })).filter(r => r.titulo),
        total_pontos: totalPontos
      }).eq('id', id)

      if (error) throw new Error("Erro ao atualizar dados: " + error.message)
      
      alert("Trilha atualizada com sucesso! 🚀")
      window.location.href = '/painel-professor'

    } catch (err) {
      alert("Atenção, Professor: " + err.message)
    } finally {
      setSalvando(false)
      setLoadingText('')
    }
  }

  if (loading) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#1A1A1A] font-black uppercase italic animate-pulse">Puxando dados da trilha...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-12 text-[#1A1A1A] font-sans pb-24">
      <button onClick={() => window.location.href = '/painel-professor'} className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 hover:text-[#FF0080] transition-colors text-sm md:text-base">
        <ArrowLeft strokeWidth={3} /> Painel Docente
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b-4 border-[#1A1A1A] pb-6 flex items-center justify-between sticky top-0 bg-[#FDFBF7] z-10 pt-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#3B82F6] flex items-center gap-3">
              <Pencil className="w-8 h-8 md:w-12 md:h-12 text-[#1A1A1A]" /> Editar Trilha
            </h1>
            <p className="text-xs md:text-sm font-bold opacity-70 uppercase mt-2">Atualize sua jornada gamificada.</p>
          </div>
          <div className="flex flex-col items-center justify-center w-20 h-20 bg-[#1A1A1A] text-[#3B82F6] rounded-2xl border-4 border-[#3B82F6] shadow-[4px_4px_0px_0px_#3B82F6]">
            <span className="block text-2xl md:text-3xl font-black leading-none">{totalPontos}</span>
            <span className="text-[9px] md:text-[10px] font-bold uppercase text-white">PTS TOTAL</span>
          </div>
        </header>

        <form onSubmit={handleUpdate} className="space-y-10">
          
          {/* 1. DADOS GERAIS */}
          <section className="bg-white border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-xl font-black uppercase italic mb-6 border-b-2 border-[#1A1A1A] pb-2 inline-block">1. Informações do Mapa</h2>
            <div className="space-y-4">
              
              <div className="grid gap-2 mb-4">
                <label className="font-black uppercase text-xs md:text-sm">Disciplina da Trilha</label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-black uppercase text-center cursor-pointer transition-all ${disciplina === 'Linguagens' ? 'bg-[#FF0080] text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] translate-y-1' : 'bg-white text-[#1A1A1A] hover:bg-[#F9F6F0]'}`}>
                    <input type="radio" className="hidden" value="Linguagens" checked={disciplina === 'Linguagens'} onChange={(e) => setDisciplina(e.target.value)} />
                    Linguagens
                  </label>
                  <label className={`flex-1 p-4 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-black uppercase text-center cursor-pointer transition-all ${disciplina === 'Matemática' ? 'bg-[#3B82F6] text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] translate-y-1' : 'bg-white text-[#1A1A1A] hover:bg-[#F9F6F0]'}`}>
                    <input type="radio" className="hidden" value="Matemática" checked={disciplina === 'Matemática'} onChange={(e) => setDisciplina(e.target.value)} />
                    Matemática
                  </label>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="font-black uppercase text-xs md:text-sm">Título da Trilha</label>
                <input placeholder="Ex: A Batalha da Interpretação" className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl p-4 font-bold outline-none" value={titulo} onChange={e => setTitulo(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <label className="font-black uppercase text-xs md:text-sm">Descrição Curta</label>
                <input placeholder="Ex: Vença os 3 chefões resolvendo quizzes e redações!" className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl p-4 font-bold outline-none" value={tema} onChange={e => setTema(e.target.value)} required />
              </div>
              <div className="pt-2">
                <label className="font-black uppercase text-xs md:text-sm block mb-2">Capa do Mapa</label>
                <label className="flex items-center gap-4 p-4 border-2 border-dashed border-[#1A1A1A] rounded-xl bg-white hover:bg-[#F9F6F0] cursor-pointer transition-colors">
                  <UploadCloud size={24} className="text-[#3B82F6]" />
                  <span className="font-bold text-sm">{capa ? capa.name : (capaUrlAtual ? 'Capa atual mantida (clique para trocar)' : 'Clique para enviar imagem...')}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setCapa(e.target.files[0])} />
                </label>
              </div>
            </div>
          </section>

          {/* 2. VÍDEOS */}
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
                    <span className="font-bold text-xs md:text-sm line-clamp-2 w-full px-2">
                      {v.file ? v.file.name : (v.url ? 'Vídeo atual salvo (clique para trocar)' : 'Selecionar Arquivo')}
                    </span>
                    <input type="file" accept="video/*" className="hidden" onChange={e => atualizarVideo(v.id, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* 3. QUIZZES */}
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

          {/* 4. PDFs EXTRAS */}
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
                    <span className="font-bold text-xs md:text-sm line-clamp-2 w-full px-2">
                      {p.file ? p.file.name : (p.url ? 'PDF atual salvo (clique para trocar)' : 'Selecionar Arquivo PDF')}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={e => atualizarPdf(p.id, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* 5. REDAÇÕES */}
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

          {/* BOTÃO ATUALIZAR */}
          <button type="submit" disabled={salvando} className="w-full py-6 bg-[#3B82F6] text-white rounded-full font-black text-xl md:text-2xl uppercase italic border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
            {salvando ? loadingText : `ATUALIZAR TRILHA (${totalPontos} PTS)`}
            {!salvando && <RefreshCw size={24} className="text-white" />}
          </button>

        </form>
      </div>
    </div>
  )
}