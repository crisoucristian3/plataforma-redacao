'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, Send, Image as ImageIcon, Plus, 
  Trash2, Star, BookOpen, Layers, Type
} from 'lucide-react'

export default function EnviarLivro() {
  const [loading, setLoading] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [tema, setTema] = useState('')
  const [pontos, setPontos] = useState(50) // Pontuação padrão
  const [capa, setCapa] = useState(null)
  
  // O livro começa com 1 página vazia
  const [paginas, setPaginas] = useState([''])

  useEffect(() => {
    if (!window.supabase) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const adicionarPagina = () => {
    setPaginas([...paginas, ''])
  }

  const removerPagina = (index) => {
    if (paginas.length > 1) {
      setPaginas(paginas.filter((_, i) => i !== index))
    } else {
      alert("O livro precisa ter pelo menos uma página!")
    }
  }

  const atualizarPagina = (index, valor) => {
    const novasPaginas = [...paginas]
    novasPaginas[index] = valor
    setPaginas(novasPaginas)
  }

  const sanitizarNomeArquivo = (nome) => {
    const extensao = nome.split('.').pop()
    const base = nome.replace(`.${extensao}`, '')
    const limpo = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-]/g, "").toLowerCase();
    return `${Date.now()}-${limpo}.${extensao}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Validação de páginas vazias
    const paginasVazias = paginas.some(p => p.trim() === '')
    if (paginasVazias) return alert("Preencha o texto de todas as páginas ou apague as que estiverem vazias!")
    if (!capa) return alert("Por favor, adicione uma capa bem bonita para o livro!")

    setLoading(true)
    const supabase = window.supabase.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada. Faça login novamente.")

      // 1. Fazer upload da Capa
      let capaUrl = null
      const nomeFinal = `livros/${user.id}/${sanitizarNomeArquivo(capa.name)}`
      const { error: uploadError } = await supabase.storage.from('redacoes_arquivos').upload(nomeFinal, capa)
      
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomeFinal)
      capaUrl = publicUrl

      // 2. Salvar no Banco
      const { error } = await supabase.from('livros_kids').insert([{
        professor_id: user.id,
        titulo: titulo.trim(),
        tema: tema.trim(),
        pontos: parseInt(pontos),
        capa_url: capaUrl,
        paginas: paginas // Salvamos o array de páginas inteiro no banco
      }])

      if (error) throw error
      
      alert("Livro publicado na Biblioteca com sucesso!")
      window.location.href = '/painel-professor'
    } catch (err) {
      alert("Erro ao salvar livro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-12 text-[#1A1A1A] font-sans selection:bg-[#4ADE80]/30 relative overflow-y-auto pb-24">
      
      <button onClick={() => window.location.href = '/painel-professor'} className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 hover:text-[#FF0080] transition-colors group text-sm md:text-base">
        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} /> Painel Docente
      </button>

      <div className="max-w-4xl mx-auto bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-5 md:p-10 lg:p-12 border-t-[16px] border-t-[#4ADE80]">
        
        <header className="mb-8 border-b-4 border-dashed border-[#1A1A1A]/10 pb-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A] transform -rotate-1 leading-none flex items-center gap-4">
            <BookOpen size={40} className="text-[#4ADE80] hidden sm:block" /> Publicar Livro
          </h1>
          <p className="text-xs md:text-sm font-bold text-[#555] uppercase tracking-wide mt-3">
            Escreva uma história mágica página por página para a criançada ler.
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
                <Type size={16} className="text-[#4ADE80]" /> Título da História
              </label>
              <input 
                placeholder="Ex: O Menino que Descobriu as Estrelas" 
                className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-lg font-bold outline-none focus:bg-white" 
                value={titulo} onChange={e => setTitulo(e.target.value)} required 
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
                <Star size={16} className="text-[#FFDE03] fill-[#FFDE03]" /> Recompensa (PTS)
              </label>
              <input 
                type="number"
                min="10"
                step="10"
                className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-lg font-black text-[#FF0080] outline-none focus:bg-white text-center" 
                value={pontos} onChange={e => setPontos(e.target.value)} required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
              <Layers size={16} className="text-[#4ADE80]" /> Assunto / Tema Breve
            </label>
            <input 
              placeholder="Ex: Uma aventura sobre amizade e o sistema solar." 
              className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-base font-bold outline-none focus:bg-white" 
              value={tema} onChange={e => setTema(e.target.value)} required 
            />
          </div>

          <div className="p-4 md:p-6 bg-[#4ADE80]/10 border-2 md:border-4 border-dashed border-[#1A1A1A] rounded-2xl md:rounded-3xl">
            <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
              <ImageIcon size={32} className="text-[#1A1A1A] md:w-10 md:h-10" />
              <span className="font-black uppercase text-xs md:text-sm text-[#1A1A1A]">Capa do Livro (Obrigatório)</span>
              <p className="text-[10px] md:text-xs font-bold text-[#555] italic">Escolha uma imagem chamativa para atrair os alunos.</p>
              
              {capa ? (
                <div className="mt-4 p-2 bg-white border-2 border-[#1A1A1A] rounded-xl">
                  <span className="text-xs font-bold text-[#FF0080]">{capa.name}</span>
                </div>
              ) : (
                <div className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white rounded-full font-black text-xs uppercase">Anexar Imagem</div>
              )}
              
              <input type="file" className="hidden" accept="image/*" onChange={e => setCapa(e.target.files[0])} />
            </label>
          </div>

          {/* SESSÃO DE PÁGINAS DINÂMICAS */}
          <div className="space-y-6 border-t-4 border-dashed border-[#1A1A1A]/10 pt-8">
            <div className="flex items-center justify-between">
              <label className="font-black uppercase italic text-sm md:text-lg text-[#1A1A1A] flex items-center gap-2">
                <BookOpen size={20} className="text-[#4ADE80]" /> Escrever as Páginas
              </label>
              <span className="font-black text-xs bg-[#1A1A1A] text-white px-3 py-1 rounded-full">{paginas.length} PÁGINA(S)</span>
            </div>

            {paginas.map((texto, index) => (
              <div key={index} className="relative bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] p-4 md:p-6 rounded-2xl md:rounded-[30px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black uppercase text-xs md:text-sm text-[#4ADE80] bg-[#1A1A1A] px-3 py-1 rounded-lg">Página {index + 1}</span>
                  <button type="button" onClick={() => removerPagina(index)} className="p-2 bg-white border-2 border-[#1A1A1A] rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <Trash2 size={14} strokeWidth={3} />
                  </button>
                </div>
                <textarea 
                  placeholder={`Escreva aqui a parte da história que vai aparecer na página ${index + 1}...`} 
                  className="w-full h-32 p-3 bg-white border-2 border-[#1A1A1A] rounded-xl text-sm md:text-base font-medium outline-none leading-relaxed resize-none font-serif custom-scrollbar" 
                  value={texto} 
                  onChange={e => atualizarPagina(index, e.target.value)} 
                  required 
                />
              </div>
            ))}

            <button 
              type="button" 
              onClick={adicionarPagina} 
              className="w-full py-4 border-2 md:border-4 border-dashed border-[#1A1A1A] rounded-2xl md:rounded-[30px] font-black uppercase text-sm md:text-base text-[#1A1A1A] hover:bg-[#4ADE80] hover:border-solid hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} strokeWidth={3} /> Adicionar Nova Página
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-4 md:py-6 rounded-full border-2 md:border-4 border-[#1A1A1A] font-black text-lg md:text-2xl uppercase italic shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 ${
              loading ? 'bg-slate-300 text-[#555]' : 'bg-[#4ADE80] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-[#4ADE80]'
            }`}
          >
            {loading ? "COLOCANDO NA ESTANTE..." : "PUBLICAR LIVRO"}
            {!loading && <Send size={20} className="md:w-6 md:h-6" />}
          </button>
          
        </form>
      </div>
    </div>
  )
}