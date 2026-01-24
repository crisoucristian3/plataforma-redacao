'use client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  FileText, 
  Sparkles, 
  Pencil,
  AlertCircle 
} from 'lucide-react'

export default function EnviarRedacao() {
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = () => setIsReady(true)
  }, [])

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!isReady || !titulo || (!texto && !arquivo)) return alert('Preencha o título e o conteúdo!')
    setEnviando(true)

    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    let urlPublica = null

    if (arquivo) {
      const nomeArquivo = `${user.id}/${Date.now()}-${arquivo.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('redacoes_arquivos').upload(nomeArquivo, arquivo)
      if (uploadError) { alert('Erro: ' + uploadError.message); setEnviando(false); return }
      urlPublica = supabase.storage.from('redacoes_arquivos').getPublicUrl(nomeArquivo).data.publicUrl
    }

    const { error } = await supabase.from('redacoes').insert([
      {
        aluno_id: user.id,
        titulo: titulo,
        texto_redacao: texto,
        arquivo_url: urlPublica,
        status: 'pendente'
      }
    ])

    if (error) alert('Erro ao salvar: ' + error.message)
    else { alert('Redação enviada com sucesso!'); window.location.href = '/' }
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-[#FFDE03] text-[#1A1A1A] p-6 lg:p-12 font-sans selection:bg-[#FF0080]/30 relative overflow-hidden">
      
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-10 right-10 rotate-12 opacity-20 pointer-events-none hidden lg:block">
        <Pencil size={150} />
      </div>
      <div className="absolute bottom-10 left-10 -rotate-12 opacity-20 pointer-events-none hidden lg:block">
        <Sparkles size={150} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 font-black uppercase italic mb-8 hover:text-[#FF0080] transition-colors group"
        >
          <ArrowLeft className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> 
          Voltar ao Dashboard
        </button>

        <header className="mb-12">
          <h2 className="text-6xl font-black uppercase italic tracking-tighter transform -rotate-1">
            Nova <span className="text-white drop-shadow-[4px_4px_0px_rgba(26,26,26,1)]">Redação</span>
          </h2>
          <div className="w-48 h-2 bg-[#FF0080] mt-2"></div>
        </header>

        <form onSubmit={handleEnviar} className="space-y-8">
          
          {/* CAMPO DE TÍTULO */}
          <div className="relative group">
            <div className="absolute -top-4 -left-4 bg-[#70E0BB] px-4 py-1 border-2 border-[#1A1A1A] font-black uppercase text-xs z-20 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              Título da Redação
            </div>
            <input 
              placeholder="Ex: Os desafios da educação no Brasil..." 
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-6 bg-white border-4 border-[#1A1A1A] rounded-2xl text-xl font-bold focus:outline-none shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* TEXTAREA DO TEXTO */}
            <div className="lg:col-span-2 relative">
               <div className="absolute top-4 right-4 text-[#1A1A1A]/10 pointer-events-none">
                  <FileText size={100} />
               </div>
               <textarea 
                placeholder="Digite seu texto aqui ou cole sua redação..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="w-full h-[450px] p-8 bg-white border-4 border-[#1A1A1A] rounded-[40px] text-lg font-medium leading-relaxed font-serif shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] focus:outline-none"
              />
            </div>

            {/* BOX DE ARQUIVO E DICAS */}
            <div className="space-y-6">
              
              {/* UPLOAD DE ARQUIVO */}
              <div className="p-6 bg-[#70E0BB] border-4 border-[#1A1A1A] rounded-3xl shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
                <h4 className="font-black uppercase flex items-center gap-2 mb-4">
                  <Paperclip size={20} /> Anexar Arquivo
                </h4>
                <div className="relative border-2 border-dashed border-[#1A1A1A] rounded-xl p-4 bg-white/50 hover:bg-white transition-colors">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf" 
                    onChange={(e) => setArquivo(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <p className="text-xs font-black uppercase text-[#1A1A1A]">
                      {arquivo ? arquivo.name : 'Clique para subir PDF ou Foto'}
                    </p>
                  </div>
                </div>
              </div>

              {/* AVISO IMPORTANTE */}
              <div className="p-6 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-3xl shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] -rotate-1">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-[#FF0080] shrink-0" />
                  <p className="text-xs font-bold leading-tight uppercase italic">
                    Lembre-se: O título é obrigatório para que o professor identifique seu tema!
                  </p>
                </div>
              </div>

              {/* BOTÃO DE ENVIAR */}
              <button 
                type="submit" 
                disabled={enviando}
                className={`w-full p-6 border-4 border-[#1A1A1A] rounded-full font-black text-xl uppercase italic transition-all shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
                  enviando ? 'bg-slate-400' : 'bg-[#FF0080] text-white'
                }`}
              >
                {enviando ? 'ENVIANDO...' : 'POSTAR TEXTO'}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  )
}