'use client'
import { useEffect, useState } from 'react'
import { 
  PlusCircle, BookOpen, GraduationCap, CheckCircle2, 
  Clock, ArrowRight, UserCircle, LogOut, Camera, Search, Pencil, 
  LayoutDashboard, Users, PlayCircle, Star, FileText, ArrowLeft,
  PenTool, Trash2, Phone, School, Rocket, CalendarDays
} from 'lucide-react'

export default function PainelProfessor() {
  const [perfil, setPerfil] = useState(null)
  const [redacoesPendentes, setRedacoesPendentes] = useState([])
  const [historicoCorrigidas, setHistoricoCorrigidas] = useState([])
  const [alunos, setAlunos] = useState([]) 
  const [aulas, setAulas] = useState([]) 
  const [temas, setTemas] = useState([]) 
  const [desafios, setDesafios] = useState([])
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('home') 
  const [nome, setNome] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [detalheHistorico, setDetalheHistorico] = useState(null)
  
  const [filtroAlunoAtual, setFiltroAlunoAtual] = useState('Todos')

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

      // ATUALIZADO: Agora busca nome, escola e foto para a fila de correção
      const { data: pendentes } = await supabase
        .from('redacoes')
        .select('*, perfis(nome_completo, escola, foto_url)')
        .eq('status', 'pendente')
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

      const { data: listaTemas } = await supabase.from('temas_redacao').select('*').order('created_at', { ascending: false })
      setTemas(listaTemas || [])

      const { data: listaDesafios } = await supabase.from('desafios_kids').select('*').order('created_at', { ascending: false })
      setDesafios(listaDesafios || [])

    } else { window.location.href = '/login' }
    setLoading(false)
  }

  // LÓGICA DE FILTRAGEM DE ALUNOS
  const normalizarNome = (txt) => txt?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || "";
  
  const alunosAgrupados = alunos.map(a => {
    const n = normalizarNome(a.escola);
    let grupo = a.escola;
    if (n.includes("educa mais") || n.includes("ca+")) grupo = "Centro Educa Mais";
    if (n.includes("educandario")) grupo = "Educandário";
    return { ...a, escola_agrupada: grupo };
  });

  const escolasUnicas = [...new Set(alunosAgrupados.map(a => a.escola_agrupada).filter(Boolean))];
  const abasDeFiltro = ['Todos', 'Fundamental', 'Médio/ENEM', ...escolasUnicas];

  const alunosFiltrados = alunosAgrupados.filter(aluno => {
    if (filtroAlunoAtual === 'Todos') return true;
    if (filtroAlunoAtual === 'Fundamental') return aluno.foco_ensino === 'fundamental';
    if (filtroAlunoAtual === 'Médio/ENEM') return aluno.foco_ensino === 'enem' || !aluno.foco_ensino; 
    return aluno.escola_agrupada === filtroAlunoAtual;
  });

  async function excluirAula(id, event) {
    event.stopPropagation();
    if(!confirm("Excluir aula?")) return;
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    await supabase.from('aulas').delete().eq('id', id);
    setAulas(aulas.filter(a => a.id !== id));
  }

  async function excluirTema(id) {
    if(!confirm("Excluir tema?")) return;
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    await supabase.from('temas_redacao').delete().eq('id', id);
    setTemas(temas.filter(t => t.id !== id));
  }

  async function excluirDesafio(id) {
    if(!confirm("Excluir desafio?")) return;
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    await supabase.from('desafios_kids').delete().eq('id', id);
    setDesafios(desafios.filter(d => d.id !== id));
  }

  async function handleUploadFoto(e) {
    const file = e.target.files[0]; if (!file) return;
    setUploadingFoto(true);
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user.id}/prof-${Date.now()}`
    await supabase.storage.from('redacoes_arquivos').upload(fileName, file)
    const { data: { publicUrl } } = supabase.storage.from('redacoes_arquivos').getPublicUrl(fileName)
    await supabase.from('perfis').update({ foto_url: publicUrl }).eq('id', user.id)
    setFotoPerfil(publicUrl); setUploadingFoto(false);
  }

  if (loading) return <div className="h-screen bg-[#FDFBF7] flex items-center justify-center font-black uppercase italic text-[#FF0080]">Abrindo caderno do mestre...</div>

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#70E0BB]/30">
      
      <header className="bg-white border-b-4 border-[#1A1A1A] p-4 md:px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer transform hover:-rotate-2 transition-all" onClick={() => setAbaAtiva('home')}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFDE03] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <GraduationCap size={24} className="text-[#1A1A1A]" />
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter text-[#1A1A1A] uppercase italic hidden sm:block">DOCENTE<span className="text-[#70E0BB]">P&V</span></span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all" onClick={() => setAbaAtiva('perfil')}>
            <span className="font-black uppercase italic hidden md:block text-sm">{nome.split(' ')[0]}</span>
            <div className="w-12 h-12 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#70E0BB]">
              {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <UserCircle size={40} className="m-auto text-white mt-1" />}
            </div>
          </div>
          <button onClick={async () => { const s = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); await s.auth.signOut(); window.location.href='/login'}} className="p-3 bg-[#FF0080] text-white border-4 border-[#1A1A1A] rounded-xl hover:translate-x-1 transition-all"><LogOut size={20} strokeWidth={3} /></button>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        {abaAtiva !== 'home' && (
          <button onClick={() => setAbaAtiva('home')} className="flex items-center gap-2 font-black uppercase italic mb-8 hover:text-[#FF0080] transition-colors group text-lg">
            <ArrowLeft className="group-hover:-translate-x-2 transition-transform" strokeWidth={3} /> Voltar ao Início
          </button>
        )}

        {abaAtiva === 'home' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-10 border-b-8 border-[#FFDE03] inline-block">Painel de Controle</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div onClick={() => setAbaAtiva('correcoes')} className="lg:col-span-2 bg-[#FF0080] border-4 border-[#1A1A1A] rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 cursor-pointer relative overflow-hidden group">
                <PenTool size={150} className="absolute -right-10 -bottom-10 text-white/20 transform rotate-12" />
                <div className="relative z-10 text-white">
                  <div className="flex items-center gap-3 mb-4"><BookOpen size={32} /><h3 className="text-3xl font-black uppercase italic">Redações</h3></div>
                  <p className="text-xl font-bold opacity-90 mb-6">Você tem <span className="text-[#FFDE03] text-3xl mx-2 font-black bg-[#1A1A1A] px-3 py-1 rounded-xl">{redacoesPendentes.length}</span> textos aguardando.</p>
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFDE03] text-[#1A1A1A] border-4 border-[#1A1A1A] rounded-full font-black uppercase text-sm">Acessar Fila <ArrowRight size={20}/></span>
                </div>
              </div>
              <div onClick={() => setAbaAtiva('alunos')} className="bg-[#70E0BB] border-4 border-[#1A1A1A] rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 cursor-pointer flex flex-col justify-between">
                <div><Users size={40} className="mb-4" /><h3 className="text-2xl font-black uppercase italic mb-2">Alunos</h3><p className="font-bold opacity-80 leading-tight">Gestão da turma.</p></div>
                <div className="mt-6 font-black text-4xl">{alunos.length} <span className="text-sm uppercase opacity-60 tracking-widest">Ativos</span></div>
              </div>
              <div className="bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
                <div><FileText size={40} className="mb-4" /><h3 className="text-2xl font-black uppercase italic mb-2">Temas</h3><p className="font-bold opacity-80">Propostas ENEM.</p></div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setAbaAtiva('ver-temas')} className="w-full py-2 bg-white border-4 border-[#1A1A1A] rounded-xl font-black uppercase text-xs">Catálogo ({temas.length})</button>
                  <button onClick={() => window.location.href = '/dashboard/enviar-tema'} className="w-full py-2 bg-[#1A1A1A] text-[#FFDE03] border-4 border-[#1A1A1A] rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2"><PlusCircle size={14}/> Novo Tema</button>
                </div>
              </div>
              <div className="bg-[#A78BFA] border-4 border-[#1A1A1A] rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
                <div className="text-white"><PlayCircle size={40} className="mb-4" /><h3 className="text-2xl font-black uppercase italic mb-2">Aulas</h3><p className="font-bold opacity-80">Vídeos e materiais.</p></div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setAbaAtiva('ver-aulas')} className="w-full py-2 bg-white border-4 border-[#1A1A1A] rounded-xl font-black uppercase text-xs">Catálogo ({aulas.length})</button>
                  <button onClick={() => window.location.href = '/dashboard/enviar-aula'} className="w-full py-2 bg-[#1A1A1A] text-[#A78BFA] border-4 border-[#1A1A1A] rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2"><PlusCircle size={14}/> Nova Aula</button>
                </div>
              </div>
              <div className="bg-[#FFA07A] border-4 border-[#1A1A1A] rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between group">
                <div><Rocket size={40} className="mb-4 text-[#1A1A1A]" /><h3 className="text-2xl font-black uppercase italic mb-2 text-[#1A1A1A]">Desafios</h3><p className="font-bold opacity-80 text-[#1A1A1A]">Kids Fundamental.</p></div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setAbaAtiva('ver-desafios')} className="w-full py-2 bg-white border-4 border-[#1A1A1A] rounded-xl font-black uppercase italic text-xs">Catálogo ({desafios.length})</button>
                  <button onClick={() => window.location.href = '/dashboard/enviar-desafio'} className="w-full py-2 bg-[#1A1A1A] text-[#70E0BB] border-4 border-[#1A1A1A] rounded-xl font-black uppercase italic text-xs flex items-center justify-center gap-2"><PlusCircle size={14}/> Novo Desafio</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'correcoes' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in slide-in-from-right-8 duration-500">
            {/* FILA DE AGUARDANDO (ATUALIZADA) */}
            <section className="bg-white border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h3 className="text-2xl font-black uppercase italic mb-6 border-b-4 border-dashed border-[#1A1A1A] pb-4 text-[#70E0BB]">Aguardando ({redacoesPendentes.length})</h3>
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {redacoesPendentes.length === 0 ? <p className="font-bold opacity-50 italic">Tudo limpo por aqui! ✨</p> : null}
                {redacoesPendentes.map(r => (
                  <div key={r.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-3xl bg-[#F9F6F0] border-2 border-[#1A1A1A] gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full border-2 border-[#1A1A1A] overflow-hidden bg-white shrink-0">
                        {r.perfis?.foto_url ? <img src={r.perfis.foto_url} className="w-full h-full object-cover" /> : <UserCircle className="text-[#1A1A1A] m-auto mt-1" size={48} />}
                      </div>
                      <div className="text-left">
                        <span className="font-black uppercase line-clamp-1 text-sm md:text-base leading-none">{r.perfis?.nome_completo}</span>
                        <span className="text-[10px] font-bold text-[#FF0080] uppercase flex items-center gap-1 mt-1"><School size={12}/> {r.perfis?.escola || 'Não informado'}</span>
                      </div>
                    </div>
                    <button onClick={() => window.location.href = `/dashboard/corrigir-redacao/${r.id}`} className="w-full sm:w-auto px-6 py-2 bg-[#FFDE03] border-2 border-[#1A1A1A] rounded-full font-black text-xs md:text-sm shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-none uppercase italic">Corrigir</button>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white border-4 border-[#1A1A1A] p-8 rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              <h3 className="text-2xl font-black uppercase italic mb-6 border-b-4 border-dashed border-[#1A1A1A] pb-4 text-[#FF0080]">Histórico</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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
          <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-12 border-b-8 border-[#A78BFA] inline-block">Catálogo de Aulas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {aulas.map((aula, idx) => (
                <div key={aula.id} className={`group relative border-4 border-[#1A1A1A] rounded-[40px] overflow-hidden hover:-translate-y-2 transition-all cursor-pointer shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] ${idx % 3 === 0 ? 'bg-[#FF0080]' : idx % 3 === 1 ? 'bg-[#70E0BB]' : 'bg-[#FFDE03]'}`} onClick={() => window.location.href = `/dashboard/aula/${aula.id}`}>
                  <button onClick={(e) => excluirAula(aula.id, e)} className="absolute top-4 right-4 z-20 p-2 bg-white border-2 border-[#1A1A1A] rounded-xl text-red-500 hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all"><Trash2 size={20} strokeWidth={3} /></button>
                  <div className="aspect-square relative border-b-4 border-[#1A1A1A] bg-white overflow-hidden">{aula.capa_final ? <img src={aula.capa_final} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen size={80} className="opacity-20"/></div>}</div>
                  <div className="p-6"><h4 className="text-xl md:text-2xl font-black text-white uppercase leading-tight line-clamp-2">{aula.titulo}</h4></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'alunos' && (
          <div className="max-w-6xl mx-auto animate-in zoom-in-95 duration-500">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-10 border-b-8 border-[#70E0BB] inline-block">Filtro de Alunos</h2>
            <div className="flex flex-wrap gap-2 mb-10 bg-white border-4 border-[#1A1A1A] p-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              {abasDeFiltro.map(aba => (
                <button key={aba} onClick={() => setFiltroAlunoAtual(aba)} className={`px-4 py-2 font-black uppercase italic text-xs rounded-xl transition-all border-2 ${filtroAlunoAtual === aba ? 'bg-[#FF0080] text-white border-[#1A1A1A]' : 'bg-transparent text-[#555] border-transparent hover:bg-[#F9F6F0]'}`}>{aba}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6">
              {alunosFiltrados.map(aluno => (
                <div key={aluno.id} className="bg-white border-4 border-[#1A1A1A] p-6 rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#F9F6F0] shrink-0">{aluno.foto_url ? <img src={aluno.foto_url} className="w-full h-full object-cover" /> : <UserCircle size={70} className="text-[#1A1A1A]" />}</div>
                    <div><h4 className="text-lg md:text-2xl font-black uppercase italic">{aluno.nome_completo}</h4><div className="mt-2 inline-flex items-center gap-2 bg-[#70E0BB] border-2 border-[#1A1A1A] px-3 py-1 rounded-full text-xs font-black uppercase text-white"><Star size={14} className="fill-white" /> Nota ENEM: {aluno.ultima_nota_enem || '--'}</div></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:ml-auto p-4 bg-[#F9F6F0] rounded-2xl border-2 border-[#1A1A1A] border-dashed">
                    <div><span className="text-[10px] font-black uppercase opacity-50 block text-[#1A1A1A]">Nível</span><span className="font-bold text-xs uppercase">{aluno.foco_ensino || 'enem'}</span></div>
                    <div><span className="text-[10px] font-black uppercase opacity-50 block">Escola</span><span className="font-bold text-xs truncate block" title={aluno.escola}>{aluno.escola || '-'}</span></div>
                    <div><span className="text-[10px] font-black uppercase opacity-50 block">Telefone</span><span className="font-bold text-xs">{aluno.telefone || '-'}</span></div>
                    <div><span className="text-[10px] font-black uppercase text-[#FF0080] block">Cadastro</span><span className="font-bold text-xs flex items-center gap-1"><CalendarDays size={12}/> {new Date(aluno.created_at).toLocaleDateString('pt-BR')}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'ver-temas' && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-left-8 duration-500">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-12 border-b-8 border-[#FFDE03] inline-block">Temas Publicados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {temas.map((tema) => (
                <div key={tema.id} className="relative bg-white border-4 border-[#1A1A1A] p-6 rounded-[30px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 transition-all flex flex-col justify-between">
                  <button onClick={() => excluirTema(tema.id)} className="absolute top-4 right-4 p-2 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl text-red-500 hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all"><Trash2 size={20} strokeWidth={3} /></button>
                  <h3 className="text-xl font-black uppercase leading-tight mb-2 text-[#FF0080] pr-12">{tema.titulo}</h3>
                  <p className="text-sm font-medium italic line-clamp-3 mb-4 text-[#555]">{tema.descricao}</p>
                  {tema.arquivo_apoio_url && (<a href={tema.arquivo_apoio_url} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDE03] border-2 border-[#1A1A1A] rounded-xl font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"><FileText size={16} /> Ver Material</a>)}
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'ver-desafios' && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-12 border-b-8 border-[#70E0BB] inline-block">Desafios Kids</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {desafios.map((d) => (
                <div key={d.id} className="relative bg-white border-4 border-[#1A1A1A] p-6 rounded-[30px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 transition-all">
                  <button onClick={() => excluirDesafio(d.id)} className="absolute top-4 right-4 p-2 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl text-red-500 hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 size={20} /></button>
                  <h3 className="text-xl font-black uppercase leading-tight mb-2 text-[#A78BFA] pr-12">{d.titulo}</h3>
                  <p className="text-sm font-medium italic line-clamp-2 mb-4 text-[#555]">{d.pergunta}</p>
                  <span className="px-3 py-1 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-full text-[10px] font-black uppercase">{d.tipo_pergunta === 'texto' ? 'Escrita' : 'Múltipla Escolha'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'perfil' && (
          <div className="max-w-2xl bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] mx-auto text-center animate-in zoom-in-95 duration-300">
            <div className="relative inline-block group mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#FFDE03] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] mx-auto">{fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover" /> : <UserCircle size={120} className="text-[#1A1A1A]" />}</div>
              <label className="absolute -bottom-2 -right-2 bg-white border-2 border-[#1A1A1A] p-2 rounded-full cursor-pointer hover:bg-[#FF0080] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Camera size={20} /><input type="file" className="hidden" accept="image/*" onChange={handleUploadFoto} disabled={uploadingFoto} /></label>
            </div>
            <div className="space-y-6 text-left"><label className="text-lg md:text-xl font-black uppercase italic">Nome Mestre</label><input className="w-full bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl p-4 text-lg md:text-xl font-bold outline-none" value={nome} readOnly /></div>
          </div>
        )}
      </main>

      {detalheHistorico && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white border-4 border-[#1A1A1A] w-full max-w-2xl rounded-[40px] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-6 md:p-10 relative">
            <button onClick={() => setDetalheHistorico(null)} className="absolute top-4 right-4 font-black text-2xl hover:text-[#FF0080]">✖</button>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic border-b-4 border-[#FFDE03] inline-block mb-6 tracking-tight">{detalheHistorico.perfis?.nome_completo}</h2>
            <div className="bg-[#F9F6F0] p-4 md:p-6 rounded-3xl border-2 border-[#1A1A1A] mb-6 italic h-40 overflow-y-auto text-sm md:text-base">{detalheHistorico.texto_redacao || "Arquivo anexo."}</div>
            <div className="bg-[#70E0BB] p-4 md:p-6 rounded-3xl border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"><p className="text-xl md:text-2xl font-black text-[#1A1A1A]">NOTA: <span className="text-white drop-shadow-[2px_2px_0px_rgba(26,26,26,1)]">{detalheHistorico.correcoes?.[0]?.nota}</span></p><p className="font-bold text-xs md:text-sm mt-2 italic text-[#1A1A1A]/80 leading-tight">Feedback: "{detalheHistorico.correcoes?.[0]?.comentarios || "Sem comentários."}"</p></div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavItem({ icon, label, active, onClick, color }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-3xl font-black uppercase italic text-xl border-4 transition-all ${active ? `bg-[${color}] border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1` : 'border-transparent text-[#555] hover:bg-white hover:border-[#1A1A1A]'}`} style={active ? {backgroundColor: color} : {}}>{icon} <span>{label}</span></button>
  )
}