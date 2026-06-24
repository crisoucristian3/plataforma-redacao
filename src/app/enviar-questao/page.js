'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Layers 
} from 'lucide-react'

export default function EnviarQuestaoEnem() {
  const [loading, setLoading] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [enunciado, setEnunciado] = useState('')
  const [caderno, setCaderno] = useState('linguagens') // linguagens, humanas, natureza, matematica
  
  // Estrutura fixa do ENEM: A, B, C, D, E
  const [opcoes, setOpcoes] = useState({
    A: '',
    B: '',
    C: '',
    D: '',
    E: ''
  })
  const [alternativaCorreta, setAlternativaCorreta] = useState('') // 'A', 'B', etc.
  const [explicacao, setExplicacao] = useState('')
  
  // Suporte a múltiplas imagens
  const [imagens, setImagens] = useState([])

  useEffect(() => {
    if (!window.supabase) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handleAdicionarImagens = (e) => {
    const arquivos = Array.from(e.target.files)
    setImagens([...imagens, ...arquivos])
  }

  const handleRemoverImagem = (index) => {
    setImagens(imagens.filter((_, i) => i !== index))
  }

  const handleAlternativaChange = (letra, valor) => {
    setOpcoes({
      ...opcoes,
      [letra]: valor
    })
  }

  // Sanitização de nomes de arquivos para evitar falhas no Supabase Storage
  const sanitizarNomeArquivo = (nome) => {
    const extensao = nome.split('.').pop()
    const base = nome.replace(`.${extensao}`, '')
    const limpo = base
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-]/g, "")
      .toLowerCase();
    return `${Date.now()}-${limpo}.${extensao}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!window.supabase) {
      return alert("O sistema de banco de dados ainda está carregando. Aguarde um instante.")
    }
    if (!alternativaCorreta) {
      return alert("Por favor, selecione qual é a alternativa correta antes de publicar!")
    }

    setLoading(true)
    const supabase = window.supabase.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sessão expirada. Faça login novamente.")

      const urlsImagensFinais = []

      // Upload sequencial de todas as imagens anexadas
      for (const img of imagens) {
        const nomeFinal = `questoes/${user.id}/${sanitizarNomeArquivo(img.name)}`
        const { error: uploadError } = await supabase.storage
          .from('redacoes_arquivos')
          .upload(nomeFinal, img)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('redacoes_arquivos')
          .getPublicUrl(nomeFinal)
        
        urlsImagensFinais.push(publicUrl)
      }

      // Envio dos dados estruturados para a tabela do simulador do Ensino Médio
      const { error } = await supabase.from('questoes_enem').insert([{
        professor_id: user.id,
        titulo: titulo.trim(),
        enunciado: enunciado.trim(),
        caderno: caderno,
        alternativas: opcoes,
        resposta_correta: alternativaCorreta,
        explicacao: explicacao.trim(),
        imagens_urls: urlsImagensFinais.length > 0 ? urlsImagensFinais : null
      }])

      if (error) throw error
      
      alert("Questão do ENEM publicada com sucesso!")
      window.location.href = '/painel-professor'
    } catch (err) {
      alert("Erro ao salvar questão: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 lg:p-12 text-[#1A1A1A] font-sans selection:bg-[#A78BFA]/30 relative overflow-y-auto pb-24">
      
      {/* BOTÃO RETORNAR */}
      <button 
        onClick={() => window.location.href = '/painel-professor'} 
        className="flex items-center gap-2 font-black uppercase italic mb-6 md:mb-8 hover:text-[#FF0080] transition-colors group text-sm md:text-base"
      >
        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} /> 
        Painel Docente
      </button>

      <div className="max-w-4xl mx-auto bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-5 md:p-10 lg:p-12">
        
        <header className="mb-8 border-b-4 border-dashed border-[#1A1A1A]/10 pb-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A] transform -rotate-1 leading-none">
            Cadastrar <span className="text-[#A78BFA]">Questão ENEM</span>
          </h1>
          <p className="text-xs md:text-sm font-bold text-[#555] uppercase tracking-wide mt-2">
            Crie exames simulados de alta performance para o Ensino Médio.
          </p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* SELETOR DE CADERNO / ÁREA DO CONHECIMENTO */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
              <Layers size={16} className="text-[#FF0080]" /> Caderno do Exame
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'linguagens', label: 'Linguagens', color: '#70E0BB' },
                { id: 'humanas', label: 'Humanas', color: '#FFDE03' },
                { id: 'natureza', label: 'Natureza', color: '#FFA07A' },
                { id: 'matematica', label: 'Matemática', color: '#A78BFA' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCaderno(item.id)}
                  className={`py-3 px-2 rounded-xl border-2 md:border-4 border-[#1A1A1A] font-black uppercase text-[10px] md:text-xs transition-all tracking-tight ${
                    caderno === item.id 
                      ? 'shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' 
                      : 'bg-white opacity-60 hover:opacity-100'
                  }`}
                  style={caderno === item.id ? { backgroundColor: item.color } : {}}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* DADOS GERAIS: TITULO E ENUNCIADO EXTENSO */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
                <HelpCircle size={16} className="text-[#FF0080]" /> Identificação da Questão
              </label>
              <input 
                placeholder="Ex: ENEM 2024 - Questão 135 (Caderno Azul)" 
                className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-lg font-bold outline-none" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
                <FileText size={16} className="text-[#FF0080]" /> Texto Base / Enunciado Completo
              </label>
              <textarea 
                placeholder="Insira o texto motivador, charge ou fragmento literário e o comando da questão aqui..." 
                className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 text-sm md:text-base font-medium h-60 md:h-80 outline-none leading-relaxed resize-none font-serif custom-scrollbar" 
                value={enunciado} 
                onChange={e => setEnunciado(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* COMPONENTE DE MULTIPLO UPLOAD MULTIPART (OPCIONAL) */}
          <div className="p-4 md:p-6 bg-[#FDFBF7] border-2 md:border-4 border-dashed border-[#1A1A1A] rounded-2xl md:rounded-3xl">
            <label className="cursor-pointer flex flex-col items-center gap-2 text-center">
              <ImageIcon size={32} className="text-[#1A1A1A] md:w-10 md:h-10" />
              <span className="font-black uppercase text-xs md:text-sm text-[#1A1A1A]">Imagens ou Gráficos de Apoio (Opcional)</span>
              <p className="text-[10px] md:text-xs font-bold text-[#555] italic">Você pode carregar múltiplos arquivos simultaneamente se a questão exigir.</p>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                accept="image/*" 
                onChange={handleAdicionarImagens} 
              />
            </label>

            {imagens.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t-2 border-[#1A1A1A]/10 pt-4">
                {imagens.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white border-2 border-[#1A1A1A] rounded-xl gap-2">
                    <span className="text-[10px] md:text-xs font-bold truncate flex-1">{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoverImagem(idx)} 
                      className="text-red-500 hover:text-red-700 shrink-0 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LISTA FIXA DE ALTERNATIVAS (A ATÉ E) */}
          <div className="space-y-4 border-t-4 border-dashed border-[#1A1A1A]/10 pt-6">
            <label className="block font-black uppercase italic text-xs md:text-sm ml-1">
              Alternativas de Resposta
            </label>
            
            {['A', 'B', 'C', 'D', 'E'].map((letra) => (
              <div key={letra} className="flex items-center gap-2 md:gap-3 group">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 md:border-4 border-[#1A1A1A] flex items-center justify-center font-black text-xs md:text-base shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] ${
                  alternativaCorreta === letra ? 'bg-[#FFDE03]' : 'bg-[#F9F6F0]'
                }`}>
                  {letra}
                </div>
                <input 
                  placeholder={`Texto descritivo da alternativa ${letra}...`} 
                  className="flex-1 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl p-2.5 md:p-3 font-medium text-xs md:text-sm outline-none focus:bg-white transition-colors" 
                  value={opcoes[letra]} 
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
                  Gabarito
                </button>
              </div>
            ))}
          </div>

          {/* JUSTIFICATIVA PEDAGÓGICA (BALÃO DE COMENTÁRIOS DO MESTRE) */}
          <div className="space-y-2 border-t-4 border-dashed border-[#1A1A1A]/10 pt-6">
            <label className="flex items-center gap-2 font-black uppercase italic text-xs md:text-sm ml-1">
              <Sparkles size={16} className="text-[#FFDE03]" /> Resolução Comentada / Justificativa
            </label>
            <p className="text-[10px] md:text-xs font-bold text-[#555] italic leading-tight">
              Este texto será exibido como feedback explicativo imediato quando o estudante finalizar a tentativa, validando o acerto ou elucidando o distrator (erro).
            </p>
            <textarea 
              placeholder="Ex: A alternativa [X] está correta porque o gráfico demonstra que... Enquanto a alternativa [Y] incorre em erro de interpretação conceitual ao afirmar..." 
              className="w-full h-32 md:h-40 p-3 md:p-4 bg-[#FFDE03]/5 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl text-xs md:text-sm font-medium outline-none leading-relaxed resize-none focus:bg-white transition-colors custom-scrollbar" 
              value={explicacao} 
              onChange={e => setExplicacao(e.target.value)} 
              required 
            />
          </div>

          {/* BOTÃO DE SUBMISSÃO GERAL */}
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-4 md:py-6 rounded-full border-2 md:border-4 border-[#1A1A1A] font-black text-lg md:text-2xl uppercase italic shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 ${
              loading ? 'bg-slate-300 text-[#555]' : 'bg-[#FF0080] hover:bg-[#1A1A1A] text-white'
            }`}
          >
            {loading ? "PUBLICANDO NO BANCO..." : "PUBLICAR QUESTÃO ENEM"}
            {!loading && <Send size={20} className="md:w-6 md:h-6" />}
          </button>
          
        </form>
      </div>
    </div>
  )
}