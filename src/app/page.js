'use client'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, PlayCircle, UserCircle, LogOut, ChevronRight, 
  GraduationCap, CheckCircle2, Clock, BookOpen, ArrowRight, 
  FileText, Sparkles, Pencil, Star, StickyNote, Paperclip, Camera
} from 'lucide-react'

export default function Dashboard() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('home')
  const [aulas, setAulas] = useState([])
  const [redacaoSelecionada, setRedacaoSelecionada] = useState(null)
  const [minhasRedacoes, setMinhasRedacoes] = useState([]) 
  const [redacoesPendentes, setRedacoesPendentes] = useState([]) 
  const [nome, setNome] = useState('')
  const [ultimaNota, setUltimaNota] = useState('')
  const [escolaridade, setEscolaridade] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarTudo
  }, [])

  async function carregarTudo() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: p } = await supabase.from('perfis').select('*').eq('id', user.id).single()
      
      // Só redireciona se estiver na raiz
      if (p?.tipo_usuario === 'professor' && window.location.pathname === '/') {
        window.location.href = '/painel-professor'
        return
      }

      setPerfil(p)
      if (p) { 
        setNome(p.nome_completo || ''); 
        setFotoPerfil(p.foto_url || null);
        setUltimaNota(p.ultima_nota_enem || '');
        setEscolaridade(p.escolaridade || '');
      }

      // BUSCA AULAS COM MAPEAMENTO CORRETO
      const { data: a } = await supabase.from('aulas').select('*')
      const aulasMapeadas = (a || []).map(item => ({
        ...item,
        video_final: item.url_video || item.video_url,
        legenda_final: item.conteudo_texto || item.legenda,
        capa_final: item.capa_url
      }))
      setAulas(aulasMapeadas)

      if (p?.tipo_usuario === 'aluno') {
        const { data: red } = await supabase
          .from('redacoes')
          .select('*, correcoes(*, perfis:professor_id(nome_completo))')
          .eq('aluno_id', user.id)
          .order('data_envio', { ascending: false })
        setMinhasRedacoes(red || [])
      }
    } else { window.location.href = '/login' }
    setLoading(false)
  }

  async function handleUploadFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingFoto(true)
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('redacoes_arquivos').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('redacoes_arquivos').getPublicUrl(fileName)
      const { error: updateError } = await supabase.from('perfis').update({ foto_url: publicUrl }).eq('id', user.id)
      if (updateError) throw updateError
      setFotoPerfil(publicUrl)
      alert("Foto atualizada!")
    } catch (err) { alert("Erro: " + err.message) } finally { setUploadingFoto(false) }
  }

  async function handleSalvarPerfil() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    try {
      const { error } = await supabase.from('perfis').update({
        nome_completo: nome,
        ultima_nota_enem: ultimaNota ? parseInt(ultimaNota) : null,
        escolaridade: escolaridade
      }).eq('id', user.id)
      if (error) throw error
      alert("Perfil atualizado com sucesso!")
    } catch (err) { alert("Erro: " + err.message) }
  }

  if (loading) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#FF0080] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#333] font-bold animate-pulse font-serif">Preparando seu material...</p>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#FF0080]/30">
      <aside className="w-72 border-r-4 border-[#1A1A1A] bg-[#FFF] p-8 flex flex-col hidden lg:flex relative">
        <div className="absolute top-0 right-0 w-2 h-full bg-[#1A1A1A] opacity-10"></div>
        <div className="flex items-center gap-3 px-2 mb-12 transform -rotate-2">
          <div className="w-12 h-12 bg-[#FF0080] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <Pencil size={24} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-[#1A1A1A]">PONTO<span className="text-[#FF0080]">&</span>VÍRGULA</span>
        </div>
        <div className="flex flex-col items-center p-6 rounded-2xl bg-[#70E0BB]/20 border-2 border-[#1A1A1A] mb-8 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
          <div className="w-20 h-20 rounded-full border-4 border-[#1A1A1A] p-1 mb-3 bg-white overflow-hidden shadow-inner relative">
            {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <UserCircle size={64} className="text-[#1A1A1A]" />}
            {uploadingFoto && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><div className="w-5 h-5 border-2 border-[#FF0080] border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
          <p className="font-black text-[#1A1A1A] text-center leading-tight">{nome}</p>
          <span className="text-[10px] uppercase font-black bg-[#FFDE03] px-2 py-0.5 border border-[#1A1A1A] mt-2 rounded">ALUNO</span>
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          <NavItem icon={<LayoutDashboard size={22}/>} label="Início" color="#FF0080" active={abaAtiva === 'home'} onClick={() => {setAbaAtiva('home'); setRedacaoSelecionada(null)}} />
          <NavItem icon={<PlayCircle size={22}/>} label="Aulas" color="#70E0BB" active={abaAtiva === 'aulas'} onClick={() => {setAbaAtiva('aulas'); setRedacaoSelecionada(null)}} />
          <NavItem icon={<UserCircle size={22}/>} label="Perfil" color="#FFDE03" active={abaAtiva === 'perfil'} onClick={() => {setAbaAtiva('perfil'); setRedacaoSelecionada(null)}} />
        </nav>
        <button onClick={async () => { const s = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); await s.auth.signOut(); window.location.href='/login'}} className="flex items-center gap-3 px-4 py-3 font-black text-[#1A1A1A] hover:text-[#FF0080] transition-all border-2 border-transparent hover:border-[#1A1A1A] rounded-xl hover:bg-[#FF0080]/10"><LogOut size={22} /> <span>Sair</span></button>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative">
        <div className="absolute top-10 right-10 opacity-10 pointer-events-none"><Sparkles size={120} className="text-[#FF0080] animate-pulse" /></div>
        
        {abaAtiva === 'home' && !redacaoSelecionada && (
          <div className="max-w-6xl mx-auto">
            <header className="mb-12 relative">
               <div className="absolute -top-6 -left-4 w-24 h-8 bg-[#FFDE03]/40 -rotate-3 rounded-sm"></div>
               <h1 className="text-6xl font-black text-[#1A1A1A] tracking-tighter uppercase italic transform -rotate-1">Olá, <span className="text-[#FF0080]">{nome.split(' ')[0]}</span>!</h1>
               <p className="text-xl font-bold text-[#555] mt-2 flex items-center gap-2 italic"><Star size={20} className="text-[#FFDE03] fill-[#FFDE03]" /> Pronto para o próximo nível?</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="relative group p-8 rounded-[40px] bg-[#FF0080] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer overflow-hidden" onClick={() => window.location.href = '/enviar-redacao'}>
                <div className="relative z-10 text-white">
                  <h3 className="text-3xl font-black uppercase mb-2">Enviar Redação</h3>
                  <p className="font-bold opacity-90 mb-6 text-lg">Seu texto corrigido por quem entende!</p>
                  <button className="flex items-center gap-2 px-8 py-4 bg-[#FFDE03] text-[#1A1A1A] border-4 border-[#1A1A1A] rounded-full font-black text-xl">COMEÇAR <ArrowRight size={24} strokeWidth={3} /></button>
                </div>
                <Paperclip size={180} className="absolute -right-10 -bottom-10 text-white/20 transform rotate-12" />
              </div>
              <div className="relative group p-8 rounded-[40px] bg-[#70E0BB] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer overflow-hidden" onClick={() => setAbaAtiva('aulas')}>
                <div className="relative z-10 text-[#1A1A1A]">
                  <h3 className="text-3xl font-black uppercase mb-2">Continuar Aulas</h3>
                  <p className="font-bold opacity-80 mb-6 text-lg">Retome de onde você parou.</p>
                  <button className="flex items-center gap-2 px-8 py-4 bg-white text-[#1A1A1A] border-4 border-[#1A1A1A] rounded-full font-black text-xl">ASSISTIR <PlayCircle size={24} strokeWidth={3} /></button>
                </div>
                <PlayCircle size={180} className="absolute -right-10 -bottom-10 text-[#1A1A1A]/10 transform rotate-45" />
              </div>
            </div>
            <div className="bg-white border-4 border-[#1A1A1A] rounded-[40px] p-10 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h3 className="text-3xl font-black uppercase text-[#1A1A1A] mb-8 border-b-4 border-dashed border-[#1A1A1A] pb-4"><StickyNote className="text-[#FF0080] inline mr-2" size={32} strokeWidth={3} /> Seu Histórico</h3>
              <div className="grid gap-6">
                {minhasRedacoes.map(r => (
                  <div key={r.id} onClick={() => setRedacaoSelecionada(r)} className="flex items-center justify-between p-6 rounded-3xl bg-[#F9F6F0] border-2 border-[#1A1A1A] hover:rotate-1 hover:bg-[#FFDE03]/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl border-2 border-[#1A1A1A] flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] ${r.status === 'corrigido' ? 'bg-[#70E0BB]' : 'bg-[#FFDE03]'}`}>{r.status === 'corrigido' ? <CheckCircle2 size={28} /> : <Clock size={28} />}</div>
                      <p className="text-xl font-black uppercase tracking-tight">{r.titulo || 'Sem título'}</p>
                    </div>
                    <ChevronRight size={32} strokeWidth={3} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {redacaoSelecionada && (
          <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500">
            <button onClick={() => setRedacaoSelecionada(null)} className="flex items-center gap-2 font-black text-xl text-[#1A1A1A] mb-8 hover:text-[#FF0080] transition-colors uppercase italic"><ArrowRight size={24} className="rotate-180" strokeWidth={3} /> Voltar ao Início</button>
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 bg-white border-4 border-[#1A1A1A] p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] transform -rotate-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFDE03] border-l-4 border-b-4 border-[#1A1A1A] -rotate-45 translate-x-10 -translate-y-10"></div>
                <h1 className="text-4xl font-black uppercase text-[#1A1A1A] mb-8 border-b-4 border-dashed border-[#1A1A1A] pb-4">{redacaoSelecionada.titulo}</h1>
                <p className="text-xl font-medium text-[#333] leading-relaxed whitespace-pre-wrap font-serif italic">{redacaoSelecionada.texto_redacao || "Documento em anexo."}</p>
              </div>
              <div className="lg:w-80 space-y-8 transform rotate-1">
                <div className="p-8 rounded-[40px] bg-[#70E0BB] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-center">
                  <span className="text-lg font-black uppercase tracking-tighter">Nota Final</span>
                  <h2 className="text-7xl font-black text-[#1A1A1A] my-4 leading-none">{redacaoSelecionada.correcoes?.[0]?.nota || '--'}</h2>
                  <p className="text-sm font-bold opacity-60 uppercase italic">Corrigido por {redacaoSelecionada.correcoes?.[0]?.perfis?.nome_completo || 'Professor'}</p>
                </div>
                <div className="p-8 rounded-[40px] bg-[#FFDE03] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                  <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-[#1A1A1A] pb-2"><Sparkles size={20} /> FEEDBACK</h3>
                  <p className="text-lg font-bold text-[#1A1A1A] leading-tight italic">"{redacaoSelecionada.correcoes?.[0]?.comentarios || "Aguardando correção..."}"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'perfil' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-black uppercase italic text-[#1A1A1A] mb-8">Dados do Aluno</h2>
            <div className="bg-white border-4 border-[#1A1A1A] p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] space-y-8 relative overflow-hidden">
              <div className="flex flex-col items-center pb-8 border-b-4 border-dashed border-[#1A1A1A]">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#FFDE03] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] relative">
                    {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <UserCircle size={120} className="text-[#1A1A1A]" />}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-white border-2 border-[#1A1A1A] p-2 rounded-full cursor-pointer hover:bg-[#70E0BB] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                    <Camera size={20} /><input type="file" className="hidden" accept="image/*" onChange={handleUploadFoto} disabled={uploadingFoto} />
                  </label>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-xl font-black uppercase italic text-[#1A1A1A]">Nome Completo</label>
                  <input className="w-full bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl p-4 text-xl font-bold outline-none" value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="grid gap-2">
                    <label className="text-xl font-black uppercase italic text-[#1A1A1A]">Nota ENEM</label>
                    <input type="number" className="w-full bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl p-4 text-xl font-bold outline-none" value={ultimaNota} onChange={e => setUltimaNota(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xl font-black uppercase italic text-[#1A1A1A]">Série</label>
                    <select className="w-full bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl p-4 text-xl font-bold outline-none" value={escolaridade} onChange={e => setEscolaridade(e.target.value)}>
                      <option value="">Selecione...</option>
                      <option value="1º Ano do Ensino Médio">1º Ano</option>
                      <option value="2º Ano do Ensino Médio">2º Ano</option>
                      <option value="3º Ano do Ensino Médio">3º Ano</option>
                      <option value="Ensino Médio Completo">Completo</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleSalvarPerfil} className="w-full py-6 bg-[#FF0080] text-white rounded-full font-black text-2xl uppercase italic border-4 border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 transition-all">Confirmar Alterações</button>
              </div>
            </div>
          </div>
        )}
        
        {abaAtiva === 'aulas' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A] mb-12 border-b-8 border-[#FFDE03] inline-block">Módulo de Estudos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {aulas.map((aula, idx) => (
                <div key={aula.id} className={`group border-4 border-[#1A1A1A] rounded-[40px] overflow-hidden hover:-translate-y-2 transition-all cursor-pointer shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] ${idx % 3 === 0 ? 'bg-[#FF0080]' : idx % 3 === 1 ? 'bg-[#70E0BB]' : 'bg-[#FFDE03]'}`} onClick={() => window.location.href = `/dashboard/aula/${aula.id}`}>
                  <div className="aspect-square relative border-b-4 border-[#1A1A1A] overflow-hidden bg-white">
                    {aula.capa_final ? <img src={aula.capa_final} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen size={80} className="text-[#1A1A1A] opacity-20"/></div>}
                  </div>
                  <div className="p-6"><h4 className="text-2xl font-black text-white uppercase leading-tight line-clamp-2">{aula.titulo}</h4></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick, color }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase italic text-xl border-4 transition-all ${active ? `bg-[${color}] text-[#1A1A1A] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1` : 'text-[#555] border-transparent hover:border-[#1A1A1A] hover:bg-white'}`} style={active ? {backgroundColor: color} : {}}>{icon} <span>{label}</span></button>
  )
}