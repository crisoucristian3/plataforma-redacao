'use client'
import { useEffect, useState } from 'react'
import { 
  PlusCircle, BookOpen, GraduationCap, CheckCircle2, 
  Clock, ArrowRight, UserCircle, LogOut, Camera, Search, Pencil, 
  LayoutDashboard, Users, PlayCircle, Star, Menu, X
} from 'lucide-react'

export default function PainelProfessor() {
  const [perfil, setPerfil] = useState(null)
  const [redacoesPendentes, setRedacoesPendentes] = useState([])
  const [historicoCorrigidas, setHistoricoCorrigidas] = useState([])
  const [alunos, setAlunos] = useState([]) 
  const [aulas, setAulas] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('correcoes') 
  const [nome, setNome] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [detalheHistorico, setDetalheHistorico] = useState(null)
  const [menuAberto, setMenuAberto] = useState(false) // Controle do celular

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarDados
  }, [])

  async function carregarDados() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: p } = await supabase.from('perfis').select('*').eq('id', user.id).single()
      if (p?.tipo_usuario !== 'professor') { window.location.href = '/'; return }
      
      setPerfil(p)
      setNome(p.nome_completo || '')
      setFotoPerfil(p.foto_url || null)

      const { data: pendentes } = await supabase.from('redacoes').select('*, perfis(nome_completo)').eq('status', 'pendente')
      setRedacoesPendentes(pendentes || [])

      const { data: corrigidas } = await supabase.from('redacoes').select('*, perfis(nome_completo, escolaridade), correcoes(*)').eq('status', 'corrigido').order('data_envio', { ascending: false })
      setHistoricoCorrigidas(corrigidas || [])

      const { data: listaAlunos } = await supabase.from('perfis').select('*').eq('tipo_usuario', 'aluno').order('nome_completo')
      setAlunos(listaAlunos || [])

      const { data: a } = await supabase.from('aulas').select('*')
      const aulasMapeadas = (a || []).map(item => ({
        ...item,
        video_final: item.url_video || item.video_url,
        legenda_final: item.conteudo_texto || item.legenda,
        capa_final: item.capa_url
      }))
      setAulas(aulasMapeadas)

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
      const fileName = `${user.id}/prof-${Date.now()}`
      await supabase.storage.from('redacoes_arquivos').upload(fileName, file, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('redacoes_arquivos').getPublicUrl(fileName)
      await supabase.from('perfis').update({ foto_url: publicUrl }).eq('id', user.id)
      setFotoPerfil(publicUrl)
    } catch (err) { alert(err.message) } finally { setUploadingFoto(false) }
  }

  if (loading) return <div className="h-screen bg-[#FDFBF7] flex items-center justify-center font-black uppercase italic text-[#FF0080]">Abrindo caderno do mestre...</div>

  // Componente reaproveitável da Sidebar
  const SidebarConteudo = () => (
    <>
      <div className="absolute top-0 right-0 w-2 h-full bg-[#1A1A1A] opacity-10"></div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 px-2 transform -rotate-2">
          <div className="w-12 h-12 bg-[#FFDE03] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <GraduationCap size={24} className="text-[#1A1A1A]" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-[#1A1A1A] uppercase italic">DOCENTE<span className="text-[#70E0BB]">;</span></span>
        </div>
        <button onClick={() => setMenuAberto(false)} className="lg:hidden p-2 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-lg shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center p-6 rounded-2xl bg-[#FFDE03]/20 border-2 border-[#1A1A1A] mb-8 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full border-4 border-[#1A1A1A] p-1 mb-3 bg-white overflow-hidden shadow-inner relative">
            {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <UserCircle size={64} className="text-[#1A1A1A]" />}
          </div>
          <label className="absolute -bottom-1 -right-1 bg-white border-2 border-[#1A1A1A] p-1.5 rounded-full cursor-pointer hover:bg-[#FF0080] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <Camera size={16} />
            <input type="file" className="hidden" accept="image/*" onChange={handleUploadFoto} disabled={uploadingFoto} />
          </label>
        </div>
        <p className="font-black text-[#1A1A1A] text-center leading-tight mt-2 line-clamp-1">{nome}</p>
      </div>

      <nav className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
        <button onClick={() => {setAbaAtiva('correcoes'); setMenuAberto(false)}} className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black uppercase italic text-lg border-4 transition-all ${abaAtiva === 'correcoes' ? 'bg-[#70E0BB] text-white border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'text-[#555] border-transparent hover:border-[#1A1A1A]'}`}><BookOpen size={20} /> Correções</button>
        <button onClick={() => {setAbaAtiva('alunos'); setMenuAberto(false)}} className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black uppercase italic text-lg border-4 transition-all ${abaAtiva === 'alunos' ? 'bg-[#FFDE03] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'text-[#555] border-transparent hover:border-[#1A1A1A]'}`}><Users size={20} /> Alunos</button>
        <button onClick={() => {setAbaAtiva('postar-aula'); setMenuAberto(false)}} className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black uppercase italic text-lg border-4 transition-all ${abaAtiva === 'postar-aula' ? 'bg-[#FF0080] text-white border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'text-[#555] border-transparent hover:border-[#1A1A1A]'}`}><PlusCircle size={20} /> Postar Aula</button>
        <button onClick={() => {setAbaAtiva('ver-aulas'); setMenuAberto(false)}} className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black uppercase italic text-lg border-4 transition-all ${abaAtiva === 'ver-aulas' ? 'bg-[#70E0BB] text-white border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'text-[#555] border-transparent hover:border-[#1A1A1A]'}`}><PlayCircle size={20} /> Ver Aulas</button>
        <button onClick={() => {setAbaAtiva('perfil'); setMenuAberto(false)}} className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black uppercase italic text-lg border-4 transition-all ${abaAtiva === 'perfil' ? 'bg-[#FFDE03] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'text-[#555] border-transparent hover:border-[#1A1A1A]'}`}><UserCircle size={20} /> Perfil</button>
      </nav>

      <button onClick={async () => { const s = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); await s.auth.signOut(); window.location.href='/login'}} className="flex items-center gap-3 px-4 py-3 font-black text-[#1A1A1A] hover:text-[#FF0080] transition-all"><LogOut size={22} /> <span>Sair</span></button>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#70E0BB]/30 relative">
      
      {/* BOTÃO HAMBÚRGUER (MOBILE) */}
      <button 
        onClick={() => setMenuAberto(true)}
        className="lg:hidden fixed top-6 left-6 z-40 p-3 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-2xl shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:shadow-none transition-all"
      >
        <Menu size={28} strokeWidth={3} />
      </button>

      {/* SIDEBAR DESKTOP */}
      <aside className="w-72 border-r-4 border-[#1A1A1A] bg-[#FFF] p-8 flex flex-col hidden lg:flex relative">
        <SidebarConteudo />
      </aside>

      {/* SIDEBAR MOBILE */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm" onClick={() => setMenuAberto(false)}></div>
          <aside className="absolute top-0 left-0 h-full w-72 bg-white border-r-4 border-[#1A1A1A] p-8 flex flex-col animate-in slide-in-from-left duration-300">
            <SidebarConteudo />
          </aside>
        </div>
      )}

      <main className={`flex-1 p-8 lg:p-12 overflow-y-auto ${menuAberto ? 'blur-sm lg:blur-none' : ''}`}>
        
        {/* Espaço para o botão no mobile */}
        <div className="h-16 lg:hidden"></div>

        {abaAtiva === 'correcoes' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <section className="bg-white border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h3 className="text-2xl font-black uppercase italic mb-6 border-b-4 border-dashed border-[#1A1A1A] pb-4 text-[#70E0BB]">Aguardando ({redacoesPendentes.length})</h3>
              <div className="space-y-4">
                {redacoesPendentes.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-[#1A1A1A] hover:bg-[#70E0BB]/20 transition-all">
                    <span className="font-black uppercase line-clamp-1">{r.perfis?.nome_completo}</span>
                    <button onClick={() => window.location.href = `/dashboard/corrigir-redacao/${r.id}`} className="px-4 md:px-6 py-2 bg-[#FFDE03] border-2 border-[#1A1A1A] rounded-full font-black text-xs md:text-sm shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] uppercase italic">Corrigir</button>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h3 className="text-2xl font-black uppercase italic mb-6 border-b-4 border-dashed border-[#1A1A1A] pb-4 text-[#FF0080]">Histórico</h3>
              <div className="space-y-4">
                {historicoCorrigidas.map(r => (
                  <div key={r.id} onClick={() => setDetalheHistorico(r)} className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F6F0] border-2 border-[#1A1A1A] cursor-pointer hover:bg-[#FFDE03]/20 group transition-all">
                    <div className="line-clamp-1"><p className="font-black uppercase leading-none">{r.perfis?.nome_completo}</p><small className="font-bold text-[#FF0080]">Nota: {r.correcoes?.[0]?.nota}</small></div><Search size={24} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {abaAtiva === 'ver-aulas' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-12 border-b-8 border-[#70E0BB] inline-block">Minhas Aulas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {aulas.map((aula, idx) => (
                <div key={aula.id} className={`group border-4 border-[#1A1A1A] rounded-[40px] overflow-hidden hover:-translate-y-2 transition-all cursor-pointer shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] ${idx % 3 === 0 ? 'bg-[#FF0080]' : idx % 3 === 1 ? 'bg-[#70E0BB]' : 'bg-[#FFDE03]'}`} onClick={() => window.location.href = `/dashboard/aula/${aula.id}`}>
                  <div className="aspect-square relative border-b-4 border-[#1A1A1A] bg-white overflow-hidden">
                    {aula.capa_final ? <img src={aula.capa_final} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen size={80} className="text-[#1A1A1A] opacity-20"/></div>}
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl md:text-2xl font-black text-white uppercase leading-tight line-clamp-2">{aula.titulo}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... Alunos, Postar Aula e Perfil seguem a mesma lógica de main ... */}
        {abaAtiva === 'alunos' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-12 border-b-8 border-[#FFDE03] inline-block">Alunos Matriculados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alunos.map(aluno => (
                <div key={aluno.id} className="bg-white border-4 border-[#1A1A1A] p-6 rounded-[30px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex items-center gap-4 md:gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#F9F6F0] flex-shrink-0">
                    {aluno.foto_url ? <img src={aluno.foto_url} className="w-full h-full object-cover" /> : <UserCircle size={70} className="text-[#1A1A1A]" />}
                  </div>
                  <div className="line-clamp-1">
                    <h4 className="text-lg md:text-xl font-black uppercase italic">{aluno.nome_completo}</h4>
                    <p className="text-xs font-bold opacity-60 uppercase">{aluno.escolaridade}</p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-[#70E0BB] border-2 border-[#1A1A1A] px-2 py-1 rounded-full text-[10px] md:text-xs">
                      <Star size={12} className="fill-white text-white" />
                      <span className="font-black uppercase">Nota: {aluno.ultima_nota_enem || '--'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'postar-aula' && (
          <div className="max-w-3xl bg-[#FFDE03] border-4 border-[#1A1A1A] p-8 md:p-12 rounded-[50px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] text-center transform -rotate-1 mx-auto">
            <PlusCircle size={60} className="mx-auto mb-6 text-[#1A1A1A]" />
            <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-4 text-white drop-shadow-[2px_2px_0px_rgba(26,26,26,1)] tracking-tighter">Nova Aula</h2>
            <button onClick={() => window.location.href = '/dashboard/enviar-aula'} className="px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-black text-xl md:text-2xl shadow-[6px_6px_0px_0px_rgba(255,0,128,1)] hover:scale-105 transition-all">POSTAR AGORA</button>
          </div>
        )}

        {abaAtiva === 'perfil' && (
          <div className="max-w-2xl bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] mx-auto text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#FFDE03] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] mx-auto mb-6">
              {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <UserCircle size={120} className="text-[#1A1A1A]" />}
            </div>
            <div className="space-y-6 text-left">
              <label className="text-lg md:text-xl font-black uppercase italic">Nome Mestre</label>
              <input className="w-full bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl p-4 text-lg md:text-xl font-bold" value={nome} readOnly />
              <div className="p-4 bg-[#70E0BB]/20 border-2 border-dashed border-[#1A1A1A] rounded-2xl text-center font-black uppercase italic tracking-tighter text-sm md:text-base">Professor Autorizado</div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE FEEDBACK */}
      {detalheHistorico && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-2xl rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-6 md:p-10 relative">
            <button onClick={() => setDetalheHistorico(null)} className="absolute top-4 right-4 font-black text-2xl hover:text-[#FF0080]">✖</button>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic border-b-4 border-[#FFDE03] inline-block mb-6 tracking-tight">{detalheHistorico.perfis?.nome_completo}</h2>
            <div className="bg-[#F9F6F0] p-4 md:p-6 rounded-3xl border-2 border-[#1A1A1A] mb-6 italic h-40 overflow-y-auto text-sm md:text-base">{detalheHistorico.texto_redacao || "Arquivo anexo."}</div>
            <div className="bg-[#70E0BB] p-4 md:p-6 rounded-3xl border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <p className="text-xl md:text-2xl font-black text-[#1A1A1A]">NOTA: <span className="text-white drop-shadow-[2px_2px_0px_rgba(26,26,26,1)]">{detalheHistorico.correcoes?.[0]?.nota}</span></p>
              <p className="font-bold text-xs md:text-sm mt-2 italic text-[#1A1A1A]/80 leading-tight">Feedback: "{detalheHistorico.correcoes?.[0]?.comentarios || "Sem comentários."}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}