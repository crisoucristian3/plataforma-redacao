'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Send, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'

export default function EnviarDesafio() {
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState('multipla_escolha') 
  const [titulo, setTitulo] = useState('')
  const [pergunta, setPergunta] = useState('')
  const [opcoes, setOpcoes] = useState(['', ''])
  const [respostaCorreta, setRespostaCorreta] = useState('')
  const [imagem, setImagem] = useState(null)

  // Garante que o script do Supabase esteja carregado
  useEffect(() => {
    if (!window.supabase) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const adicionarOpcao = () => setOpcoes([...opcoes, ''])
  const removerOpcao = (index) => setOpcoes(opcoes.filter((_, i) => i !== index))
  const atualizarOpcao = (index, valor) => {
    const novas = [...opcoes]
    novas[index] = valor
    setOpcoes(novas)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!window.supabase) {
      alert("O sistema ainda está carregando, espere um segundinho!")
      return
    }

    setLoading(true)
    const supabase = window.supabase.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não encontrado!")

      let urlFinal = null

      if (imagem) {
        const fileExt = imagem.name.split('.').pop()
        const fileName = `desafios/${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('redacoes_arquivos').upload(fileName, imagem)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('redacoes_arquivos').getPublicUrl(fileName)
        urlFinal = publicUrl
      }

      const { error } = await supabase.from('desafios_kids').insert([{
        professor_id: user.id,
        titulo,
        pergunta,
        imagem_url: urlFinal,
        tipo_pergunta: tipo,
        opcoes: tipo === 'multipla_escolha' ? opcoes : null,
        resposta_correta: respostaCorreta
      }])

      if (error) throw error
      alert("Desafio lançado com sucesso!")
      window.location.href = '/painel-professor'
    } catch (err) {
      alert("Erro ao postar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 text-[#1A1A1A]">
      <button onClick={() => window.location.href = '/painel-professor'} className="flex items-center gap-2 font-black uppercase italic mb-8 hover:text-[#FF0080]">
        <ArrowLeft strokeWidth={3} /> Voltar ao Painel
      </button>

      <div className="max-w-3xl mx-auto bg-white border-4 border-[#1A1A1A] rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-black uppercase italic mb-8 border-b-4 border-[#70E0BB] inline-block text-[#1A1A1A]">Criar Novo Desafio</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <input placeholder="Título da Missão" className="w-full bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl p-4 text-xl font-bold outline-none" value={titulo} onChange={e => setTitulo(e.target.value)} required />
            <textarea placeholder="Sua pergunta aqui..." className="w-full bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl p-4 text-lg font-medium h-32 outline-none" value={pergunta} onChange={e => setPergunta(e.target.value)} required />
          </div>

          <div className="p-6 bg-[#A78BFA]/10 border-4 border-dashed border-[#1A1A1A] rounded-3xl text-center">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <ImageIcon size={40} />
              <span className="font-black uppercase text-sm">Capa do Desafio (Opcional)</span>
              <input type="file" className="hidden" accept="image/*" onChange={e => setImagem(e.target.files[0])} />
              {imagem && <p className="text-xs font-bold text-[#FF0080] mt-2">{imagem.name}</p>}
            </label>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => setTipo('multipla_escolha')} className={`flex-1 py-3 rounded-xl border-4 border-[#1A1A1A] font-black uppercase text-sm transition-all ${tipo === 'multipla_escolha' ? 'bg-[#FFDE03] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white opacity-50'}`}>Múltipla Escolha</button>
            <button type="button" onClick={() => setTipo('texto')} className={`flex-1 py-3 rounded-xl border-4 border-[#1A1A1A] font-black uppercase text-sm transition-all ${tipo === 'texto' ? 'bg-[#FFDE03] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white opacity-50'}`}>Resposta Escrita</button>
          </div>

          {tipo === 'multipla_escolha' ? (
            <div className="space-y-4">
              {opcoes.map((op, i) => (
                <div key={i} className="flex gap-2">
                  <input placeholder={`Opção ${i+1}`} className="flex-1 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl p-3 font-bold" value={op} onChange={e => atualizarOpcao(i, e.target.value)} required />
                  <button type="button" onClick={() => removerOpcao(i)} className="p-3 text-red-500"><Trash2 size={20}/></button>
                </div>
              ))}
              <button type="button" onClick={adicionarOpcao} className="flex items-center gap-2 font-black text-xs uppercase bg-[#70E0BB] border-2 border-[#1A1A1A] px-4 py-2 rounded-lg"><Plus size={16}/> Adicionar Opção</button>
              
              <div className="mt-6">
                <label className="font-black uppercase italic text-sm">Qual a resposta correta?</label>
                <select className="w-full bg-white border-4 border-[#1A1A1A] rounded-xl p-3 mt-2 font-bold" value={respostaCorreta} onChange={e => setRespostaCorreta(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {opcoes.map((op, i) => op && <option key={i} value={op}>{op}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="font-black uppercase italic text-sm">Resposta correta esperada:</label>
              <input placeholder="Ex: Ponto Final" className="w-full bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl p-4 mt-2 font-bold" value={respostaCorreta} onChange={e => setRespostaCorreta(e.target.value)} required />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-6 bg-[#FF0080] text-white rounded-full font-black text-2xl uppercase italic border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 transition-all">
            {loading ? "LANÇANDO..." : "LANÇAR DESAFIO"}
          </button>
        </form>
      </div>
    </div>
  )
}