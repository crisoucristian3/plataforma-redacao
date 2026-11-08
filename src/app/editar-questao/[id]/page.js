'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, Send, Image as ImageIcon, Trash2, 
  Sparkles, FileText, HelpCircle, Layers, Rocket, GraduationCap
} from 'lucide-react'

export default function EditarQuestaoEnem() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  
  const [focoEnsino, setFocoEnsino] = useState('fundamental')
  const [titulo, setTitulo] = useState('')
  const [enunciado, setEnunciado] = useState('')
  const [caderno, setCaderno] = useState('linguagens') 
  
  const [opcoes, setOpcoes] = useState({ A: '', B: '', C: '', D: '', E: '' })
  const [alternativaCorreta, setAlternativaCorreta] = useState('') 
  const [explicacao, setExplicacao] = useState('')
  
  const [imagens, setImagens] = useState([]) // Novos arquivos
  const [imagensAntigas, setImagensAntigas] = useState([]) // URLs que já vieram do banco

  useEffect(() => {
    if (!window.supabase) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
      script.async = true
      document.body.appendChild(script)
      script.onload = carregarQuestao
    } else {
      carregarQuestao()
    }
  }, [id])

  async function carregarQuestao() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    try {
      const { data, error } = await supabase.from('questoes_enem').select('*').eq('id', id).single()
      if (error) throw error
      
      if (data) {
        setFocoEnsino(data.foco_ensino || 'enem')
        setTitulo(data.titulo || '')
        setEnunciado(data.enunciado || '')
        setCaderno(data.caderno || 'linguagens')
        setOpcoes(data.alternativas || { A: '', B: '', C: '', D: '', E: '' })
        setAlternativaCorreta(data.resposta_correta || '')
        setExplicacao(data.explicacao || '')
        setImagensAntigas(data.imagens_urls || [])
      }
    } catch (err) {
      alert("Erro ao carregar a questão: " + err.message)
      window.location.href = '/painel-professor'
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionarImagens = (e) => {
    const arquivos = Array.from(e.target.files)
    setImagens([...imagens, ...arquivos])
  }

  const handleRemoverImagemAntiga = (index) => {
    setImagensAntigas(imagensAntigas.filter((_, i) => i !== index))
  }

  const handleRemoverImagemNova = (index) => {
    setImagens(imagens.filter((_, i) => i !== index))
  }

  const handleAlternativaChange = (letra, valor) => {
    setOpcoes({ ...opcoes, [letra]: valor })
  }

  const sanitizarNomeArquivo = (nome) => {
    const extensao = nome.split('.').pop()
    const base = nome.replace(`.${extensao}`, '')
    const limpo = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-]/g, "").toLowerCase();
    return `${Date.now()}-${limpo}.${extensao}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!alternativaCorreta) return alert("Por favor, selecione qual é a alternativa correta antes de salvar!")

    setSalvando(true)
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada. Faça login novamente.")

      const urlsImagensFinais = [...imagensAntigas] // Mantém as que não foram apagadas

      // Upload das imagens novas, se houver
      for (const img of imagens) {
        const nomeFinal = `questoes/${user.id}/${sanitizarNomeArquivo(img.name)}`
        const { error: uploadError } = await supabase.storage.from('redacoes_arquivos').upload(nomeFinal, img)
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomeFinal)
        urlsImagensFinais.push(publicUrl)
      }

      // UPDATE no banco em vez de INSERT
      const { error } = await supabase.from('questoes_enem').update({
        foco_ensino: focoEnsino,
        titulo: titulo.trim(),
        enunciado: enunciado.trim(),
        caderno: caderno,
        alternativas: opcoes,
        resposta_correta: alternativaCorreta,
        explicacao: explicacao.trim(),
        imagens_urls: urlsImagensFinais.length > 0 ? urlsImagensFinais : null
      }).eq('id', id)

      if (error) throw error
      
      alert(`Questão atualizada com sucesso!`)
      window.location.href = '/painel-professor'
    } catch (err) {
      alert("Erro ao salvar questão: " + err.message)
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <div className="h-screen bg-[#FDFBF7] flex items-center justify-center font-black uppercase italic text-[#FF0080]">Buscando dados da questão...</div>

  const isKids = focoEnsino === 'fundamental'
  const listaLetras = isKids ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E']
  const cadernos = isKids ? [
    { id: 'portugues', label: 'Português', color: '#FF0080' },
    { id: 'matematica', label: 'Matemática', color: '#3B82F6' },
    { id: 'ciencias', label: 'Ciências', color: '#4ADE80' },
    { id: 'hist_geo', label: 'Hist. / Geo.', color: '#F59E0B' }
  ] : [
    { id: 'linguagens', label: 'Linguagens', color: '#70E0BB' },
    { id: 'humanas', label: 'Humanas', color: '#FFDE03' },
    { id: 'natureza', label: 'Natureza', color: '#FFA07A' },
    { id: 'matematica', label: 'Matemática', color: '#A78BFA' }
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-12 text-[#1A1A1A] font-sans selection:bg-[#A78BFA]/30 relative overflow-y-auto pb-24">
      
      <button onClick={() => window.location.href = '/painel-professor'} className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 hover:text-[#FF0080] transition-colors group text-sm md:text-base">
        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} /> Painel Docente
      </button>

      <div className={`max-w-4xl mx-auto bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-5 md:p-10 lg:p-12 ${isKids ? 'border-t-[16px] border-t-[#70E0BB]' : 'border-t-[16px] border-t-sky-400'}`}>
        
        <header className="mb-8 border-b-4 border-dashed border-[#1A1A1A]/10 pb-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A] transform -rotate-1 leading-none">
            Editar <span className={isKids ? 'text-[#FF0080]' : 'text-sky-400'}>Questão</span>
          </h1>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1 text-[#FF0080]">
               Para qual nível é esta questão?
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 p-4 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-black uppercase text-center cursor-pointer transition-all ${focoEnsino === 'fundamental' ? 'bg-[#70E0BB] text-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] translate-y-1' : 'bg-[#F9F6F0] text-gray-400 hover:bg-gray-100'}`}>
                <input type="radio" className="hidden" value="fundamental" checked={focoEnsino === 'fundamental'} onChange={(e) => { setFocoEnsino(e.target.value); setCaderno('portugues'); setOpcoes({...opcoes, E: ''}); }} />
                Ensino Fundamental
              </label>
              <label className={`flex-1 p-4 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl font-black uppercase text-center cursor-pointer transition-all ${focoEnsino === 'enem' ? 'bg-sky-400 text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] translate-y-1' : 'bg-[#F9F6F0] text-gray-400 hover:bg-gray-100'}`}>
                <input type="radio" className="hidden" value="enem" checked={focoEnsino === 'enem'} onChange={(e) => { setFocoEnsino(e.target.value); setCaderno('linguagens'); }} />
                Médio / ENEM
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
              <Layers size={16} className={isKids ? 'text-[#FF0080]' : 'text-sky-400'} /> {isKids ? 'Matéria da Questão' : 'Caderno do Exame'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cadernos.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCaderno(item.id)}
                  className={`py-3 px-2 rounded-xl border-2 md:border-4 border-[#1A1A1A] font-black uppercase text-[10px] md:text-xs transition-all tracking-tight ${
                    caderno === item.id 
                      ? 'shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5 text-white' 
                      : 'bg-[#F9F6F0] opacity-70 hover:opacity-100 text-[#1A1A1A]'
                  }`}
                  style={caderno === item.id ? { backgroundColor: item.color } : {}}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
                <HelpCircle size={16} className={isKids ? 'text-[#FF0080]' : 'text-sky-400'} /> Identificação da Questão
              </label>
              <input 
                className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-lg font-bold outline-none focus:bg-white" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
                <FileText size={16} className={isKids ? 'text-[#FF0080]' : 'text-sky-400'} /> Texto Base / Enunciado Completo
              </label>
              <textarea 
                className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-base font-medium h-48 md:h-64 outline-none leading-relaxed resize-none font-serif custom-scrollbar focus:bg-white" 
                value={enunciado} 
                onChange={e => setEnunciado(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className={`p-4 md:p-6 border-2 md:border-4 border-dashed border-[#1A1A1A] rounded-2xl md:rounded-3xl ${isKids ? 'bg-[#FFDE03]/20' : 'bg-[#FDFBF7]'}`}>
            <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
              <ImageIcon size={32} className="text-[#1A1A1A] md:w-10 md:h-10" />
              <span className="font-black uppercase text-xs md:text-sm text-[#1A1A1A]">Imagens ou Gráficos de Apoio</span>
              <p className="text-[10px] md:text-xs font-bold text-[#555] italic">Adicione novas imagens se precisar (as antigas continuam salvas a não ser que você as apague).</p>
              <input type="file" multiple className="hidden" accept="image/*" onChange={handleAdicionarImagens} />
            </label>

            {(imagensAntigas.length > 0 || imagens.length > 0) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t-2 border-[#1A1A1A]/10 pt-4">
                {/* Imagens que já estavam no banco */}
                {imagensAntigas.map((url, idx) => (
                  <div key={`old-${idx}`} className="flex flex-col items-center justify-between p-2 bg-white border-2 border-[#1A1A1A] rounded-xl gap-2">
                    <img src={url} className="h-16 object-contain" />
                    <button type="button" onClick={() => handleRemoverImagemAntiga(idx)} className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1"><Trash2 size={12}/> Apagar</button>
                  </div>
                ))}
                {/* Novas imagens anexadas agora */}
                {imagens.map((file, idx) => (
                  <div key={`new-${idx}`} className="flex flex-col items-center justify-between p-2 bg-sky-100 border-2 border-[#1A1A1A] rounded-xl gap-2">
                    <span className="text-[10px] md:text-xs font-bold truncate w-full text-center">{file.name}</span>
                    <button type="button" onClick={() => handleRemoverImagemNova(idx)} className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1"><Trash2 size={12}/> Apagar</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t-4 border-dashed border-[#1A1A1A]/10 pt-6">
            <label className="block font-black uppercase italic text-xs md:text-sm ml-1">Alternativas de Resposta</label>
            {listaLetras.map((letra) => (
              <div key={letra} className="flex items-center gap-2 md:gap-3 group">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 md:border-4 border-[#1A1A1A] flex items-center justify-center font-black text-xs md:text-base shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] ${
                  alternativaCorreta === letra ? 'bg-[#FFDE03]' : 'bg-[#F9F6F0]'
                }`}>
                  {letra}
                </div>
                <input 
                  className="flex-1 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl p-2.5 md:p-3 font-medium text-xs md:text-sm outline-none focus:bg-white transition-colors" 
                  value={opcoes[letra] || ''} 
                  onChange={e => handleAlternativaChange(letra, e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setAlternativaCorreta(letra)}
                  className={`px-3 py-2 md:py-3 border-2 border-[#1A1A1A] rounded-xl font-black text-[9px] md:text-xs uppercase transition-all shrink-0 ${
                    alternativaCorreta === letra
                      ? 'bg-[#70E0BB] text-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-[#555] opacity-50 hover:opacity-100'
                  }`}
                >
                  {isKids ? 'Certa' : 'Gabarito'}
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t-4 border-dashed border-[#1A1A1A]/10 pt-6">
            <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
              <Sparkles size={16} className="text-[#FFDE03]" /> Resolução Comentada / Justificativa
            </label>
            <textarea 
              className="w-full h-32 md:h-40 p-3 md:p-4 bg-[#FFDE03]/10 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl text-xs md:text-sm font-medium outline-none leading-relaxed resize-none focus:bg-white transition-colors custom-scrollbar" 
              value={explicacao} 
              onChange={e => setExplicacao(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={salvando} 
            className={`w-full py-4 md:py-6 rounded-full border-2 md:border-4 border-[#1A1A1A] font-black text-lg md:text-2xl uppercase italic shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 ${
              salvando ? 'bg-slate-300 text-[#555]' : (isKids ? 'bg-[#70E0BB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-[#70E0BB]' : 'bg-sky-400 hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-sky-400')
            }`}
          >
            {salvando ? "SALVANDO EDIÇÕES..." : "ATUALIZAR QUESTÃO"}
            {!salvando && <Send size={20} className="md:w-6 md:h-6" />}
          </button>
          
        </form>
      </div>
    </div>
  )
}