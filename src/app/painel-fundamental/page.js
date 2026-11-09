'use client'
import { useEffect, useState, useRef } from 'react'
import { 
  LayoutDashboard, PlayCircle, UserCircle, LogOut, ChevronRight, 
  CheckCircle2, Clock, BookOpen, ArrowRight, FileText, Sparkles, 
  Pencil, Star, StickyNote, Menu, X, AlertCircle, 
  Headphones, Rocket, Trophy, Gamepad2, School, Bot, MessageCircle, Send, ArrowLeft, LifeBuoy, Map, ChevronLeft, HelpCircle
} from 'lucide-react'

// ARRAY DE AVATARES DIVERTIDOS E INCLUSIVOS
const AVATARES_DISPONIVEIS = [
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Felix&backgroundColor=70E0BB",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Aneka&backgroundColor=FFDE03",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jude&backgroundColor=A78BFA",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Avery&backgroundColor=FF0080",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Chase&backgroundColor=70E0BB",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lillian&backgroundColor=FFDE03",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Eliza&backgroundColor=A78BFA",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Leo&backgroundColor=FF0080"
];

export default function DashboardFundamental() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('home')
  const [aulas, setAulas] = useState([])
  const [temas, setTemas] = useState([]) 
  const [redacaoSelecionada, setRedacaoSelecionada] = useState(null)
  const [minhasRedacoes, setMinhasRedacoes] = useState([]) 
  
  const [desafios, setDesafios] = useState([])
  const [trilhas, setTrilhas] = useState([]) 
  const [respostasEnviadas, setRespostasEnviadas] = useState({}) 
  const [respondendoId, setRespondendoId] = useState(null)
  
  const [livros, setLivros] = useState([])
  const [livrosLidos, setLivrosLidos] = useState([]) 
  const [livroAtivo, setLivroAtivo] = useState(null) 
  const [paginaAtual, setPaginaAtual] = useState(0) 

  const [ranking, setRanking] = useState([])

  const [nome, setNome] = useState('')
  const [escola, setEscola] = useState('') 
  const [fotoPerfil, setFotoPerfil] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  
  const [menuAberto, setMenuAberto] = useState(false)
  const [creditosRestantes, setCreditosRestantes] = useState(6)
  const [mostrandoAvatares, setMostrandoAvatares] = useState(false) 

  const [viviAberta, setViviAberta] = useState(false) 
  const [mensagemVivi, setMensagemVivi] = useState('')
  const [carregandoVivi, setCarregandoVivi] = useState(false)
  const [historicoVivi, setHistoricoVivi] = useState([
    { role: 'model', parts: [{ text: 'Oi, explorador! Eu sou a Vivi, sua parceira de aventuras. Quer ajuda com seus estudos hoje?' }] }
  ])
  const chatFimRef = useRef(null)

  useEffect(() => {
    if (viviAberta && chatFimRef.current) {
      chatFimRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [historicoVivi, viviAberta])

  const formatarMensagem = (texto) => {
    const textoLimpo = texto.replace(/\*/g, '');
    return textoLimpo.split('\n').map((linha, i) => (
      <span key={i} className="block mb-2 last:mb-0">
        {linha}
      </span>
    ));
  };

  const enviarMensagemVivi = async (e) => {
    e.preventDefault()
    if (!mensagemVivi.trim()) return

    const novaMensagem = mensagemVivi
    setMensagemVivi('')
    
    const historicoAtualizado = [...historicoVivi, { role: 'user', parts: [{ text: novaMensagem }] }]
    setHistoricoVivi(historicoAtualizado)
    setCarregandoVivi(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: novaMensagem,
          focoEnsino: perfil?.foco_ensino || 'fundamental',
          historico: historicoVivi
        })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setHistoricoVivi(prev => [...prev, { role: 'model', parts: [{ text: data.resposta }] }])
    } catch (error) {
      setHistoricoVivi(prev => [...prev, { role: 'model', parts: [{ text: 'Poxa, deu um erro na minha conexão com o cérebro. Tenta mandar de novo rapidão!' }] }])
    } finally {
      setCarregandoVivi(false)
    }
  }

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
      
      if (p?.tipo_usuario !== 'aluno' || p?.foco_ensino !== 'fundamental') {
        window.location.href = '/'
        return
      }

      setPerfil(p)
      setNome(p.nome_completo || '')
      setFotoPerfil(p.foto_url || AVATARES_DISPONIVEIS[0]) 
      setEscola(p.escola || '') 
      setLivrosLidos(p.livros_lidos || []) 

      try {
        const { data: rankData } = await supabase.from('perfis')
          .select('id, nome_completo, foto_url, pontuacao, escola') 
          .eq('tipo_usuario', 'aluno')
          .eq('foco_ensino', 'fundamental')
          .order('pontuacao', { ascending: false })
          .limit(10)
        setRanking(rankData || [])
      } catch (err) { console.log('Coluna de pontuação ainda não criada.') }
      
      const { data: a } = await supabase.from('aulas').select('*').eq('foco_ensino', 'fundamental')
      const aulasMapeadas = (a || []).map(item => ({
        ...item,
        video_final: item.url_video || item.video_url,
        legenda_final: item.conteudo_texto || item.legenda,
        capa_final: item.capa_url
      }))
      setAulas(aulasMapeadas)

      const { data: listaTemas } = await supabase.from('temas_redacao').select('*').eq('foco_ensino', 'fundamental').order('created_at', { ascending: false })
      setTemas(listaTemas || [])

      const { data: d } = await supabase.from('desafios_kids').select('*').order('created_at', { ascending: true })
      setDesafios(d || [])

      const { data: listaTrilhas } = await supabase.from('trilhas_gamificadas').select('*').order('created_at', { ascending: true })
      setTrilhas(listaTrilhas || [])

      try {
        const { data: listaLivros } = await supabase.from('livros_kids').select('*').order('created_at', { ascending: false })
        setLivros(listaLivros || [])
      } catch(e) { console.log("Tabela de livros não criada.")}

      const { data: r } = await supabase.from('respostas_desafios').select('desafio_id, esta_correto').eq('aluno_id', user.id)
      const mapaRespostas = {}
      r?.forEach(item => { mapaRespostas[item.desafio_id] = item.esta_correto })
      setRespostasEnviadas(mapaRespostas)

      const { data: red } = await supabase.from('redacoes').select('*, correcoes(*, perfis:professor_id(nome_completo))').eq('aluno_id', user.id).order('data_envio', { ascending: false })
      setMinhasRedacoes(red || [])

      const dataAtual = new Date();
      const primeiroDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).toISOString();
      const { count } = await supabase.from('redacoes').select('*', { count: 'exact', head: true }).eq('aluno_id', user.id).gte('data_envio', primeiroDiaDoMes);
      const usados = count || 0;
      setCreditosRestantes(Math.max(0, 6 - usados)); 

    } else { window.location.href = '/login' }
    setLoading(false)
  }

  async function responderDesafio(desafio, respostaEscolhida) {
    if (respostasEnviadas[desafio.id] !== undefined) return 
    setRespondendoId(desafio.id)
    const acerto = respostaEscolhida.trim().toLowerCase() === desafio.resposta_correta.trim().toLowerCase()
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()

    try {
      await supabase.from('respostas_desafios').insert([{
        desafio_id: desafio.id,
        aluno_id: user.id,
        resposta_aluno: respostaEscolhida,
        esta_correto: acerto
      }])
      setRespostasEnviadas({ ...respostasEnviadas, [desafio.id]: acerto })
      
      if (acerto) {
        alert("🌟 MANDOU BEM! Você acertou!")
        try {
          const { data: perfAtual } = await supabase.from('perfis').select('pontuacao').eq('id', user.id).single()
          const novosPontos = (perfAtual?.pontuacao || 0) + 10
          await supabase.from('perfis').update({ pontuacao: novosPontos }).eq('id', user.id)
        } catch (e) {}
      } else {
        alert("🔋 Quase lá! Mas você pode tentar o próximo!")
      }
    } catch (err) { alert("Erro ao enviar.") }
    setRespondendoId(null)
  }

  async function handleSalvarPerfil() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    try {
      const { error } = await supabase.from('perfis').update({
        nome_completo: nome,
        escola: escola,
        foto_url: fotoPerfil
      }).eq('id', user.id)
      if (error) throw error
      alert("Seu perfil foi salvo, explorador!")
    } catch (err) { alert("Erro: " + err.message) }
  }

  const escolherAvatar = (url) => {
    setFotoPerfil(url);
    setMostrandoAvatares(false);
  }

  const abrirLivro = (livro) => {
    setLivroAtivo(livro)
    setPaginaAtual(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const proximaPagina = () => {
    if (paginaAtual < livroAtivo.paginas.length - 1) {
      setPaginaAtual(paginaAtual + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const paginaAnterior = () => {
    if (paginaAtual > 0) {
      setPaginaAtual(paginaAtual - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const concluirLivro = async () => {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    
    try {
      const { data: pAtual } = await supabase.from('perfis').select('pontuacao, livros_lidos').eq('id', user.id).single()
      
      const pontosAtuais = pAtual?.pontuacao || 0
      const livrosJaLidos = pAtual?.livros_lidos || []
      
      if (!livrosJaLidos.includes(livroAtivo.id)) {
        const novosPontos = pontosAtuais + livroAtivo.pontos
        const novaListaLivros = [...livrosJaLidos, livroAtivo.id]

        await supabase.from('perfis').update({ 
          pontuacao: novosPontos,
          livros_lidos: novaListaLivros
        }).eq('id', user.id)

        setLivrosLidos(novaListaLivros)
        alert(`🎉 FANTÁSTICO! Você leu o livro todo e ganhou +${livroAtivo.pontos} PONTOS MÁGICOS!`)
      } else {
        alert("Você já ganhou os pontos desse livro antes, mas é sempre bom reler! 📚")
      }
      
      setLivroAtivo(null)
      
    } catch (error) {
      alert("Ops, erro ao salvar os pontos. Tente clicar em Concluir novamente!")
    }
  }

  const desafioAtual = desafios.find(d => respostasEnviadas[d.id] === undefined);
  const trilhasLinguagens = trilhas.filter(t => t.disciplina === 'Linguagens' || !t.disciplina)
  const trilhasMatematica = trilhas.filter(t => t.disciplina === 'Matemática')
  const trilhasIngles = trilhas.filter(t => t.disciplina === 'Inglês') 

  if (loading) return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-12 h-12 border-4 border-[#FF0080] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#333] font-bold animate-pulse font-serif text-center">Preparando a aventura...</p>
    </div>
  )

  const SidebarConteudo = () => (
    <>
      <div className="absolute top-0 right-0 w-2 h-full bg-[#1A1A1A] opacity-10 hidden lg:block"></div>
      <div className="flex items-center justify-between mb-8 md:mb-12 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 px-2 transform -rotate-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFDE03] border-2 border-[#1A1A1A] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <Rocket size={20} className="text-[#1A1A1A] md:w-7 md:h-7" />
          </div>
          <span className="font-black text-xl md:text-2xl tracking-tighter text-[#1A1A1A]">KIDS<span className="text-[#FF0080]">;</span></span>
        </div>
        <button onClick={() => setMenuAberto(false)} className="lg:hidden p-2 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-lg shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center p-4 md:p-6 rounded-2xl md:rounded-3xl bg-[#A78BFA]/20 border-2 md:border-4 border-[#1A1A1A] mb-6 md:mb-8 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transform rotate-2 shrink-0">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-[#1A1A1A] p-1 mb-2 md:mb-3 bg-white overflow-hidden shadow-inner relative">
          {fotoPerfil ? <img src={fotoPerfil} className="w-full h-full object-cover rounded-full" /> : <UserCircle size={80} className="text-[#1A1A1A] m-auto mt-1" />}
        </div>
        <p className="font-black text-[#1A1A1A] text-base md:text-xl text-center leading-tight line-clamp-1">{nome.split(' ')[0]}</p>
        <span className="text-[9px] md:text-[10px] uppercase font-black bg-[#FFDE03] px-2 py-0.5 md:px-3 md:py-1 border-2 border-[#1A1A1A] mt-2 md:mt-3 rounded-full shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">EXPLORADOR</span>
      </div>

      <nav className="flex flex-col gap-3 md:gap-4 flex-1 shrink-0">
        <NavItem icon={<LayoutDashboard size={20} strokeWidth={3} className="md:w-6 md:h-6"/>} label="Home" color="#FF0080" active={abaAtiva === 'home' && !livroAtivo} onClick={() => {setAbaAtiva('home'); setLivroAtivo(null); setRedacaoSelecionada(null); setMenuAberto(false)}} />
        <NavItem icon={<HelpCircle size={20} strokeWidth={3} className="md:w-6 md:h-6"/>} label="Simulados" color="#3B82F6" active={false} onClick={() => window.location.href = '/simulados'} />
        <NavItem icon={<Gamepad2 size={20} strokeWidth={3} className="md:w-6 md:h-6"/>} label="Jogos" color="#F59E0B" active={abaAtiva === 'jogos' && !livroAtivo} onClick={() => {setAbaAtiva('jogos'); setLivroAtivo(null); setRedacaoSelecionada(null); setMenuAberto(false)}} />
        <NavItem icon={''} label="Mapa de Trilhas" color="#4ADE80" active={abaAtiva === 'trilhas' && !livroAtivo} onClick={() => {setAbaAtiva('trilhas'); setLivroAtivo(null); setRedacaoSelecionada(null); setMenuAberto(false)}} />
        <NavItem icon={<Trophy size={20} strokeWidth={3} className="md:w-6 md:h-6"/>} label="Desafios" color="#FFDE03" active={abaAtiva === 'temas' && !livroAtivo} onClick={() => {setAbaAtiva('temas'); setLivroAtivo(null); setRedacaoSelecionada(null); setMenuAberto(false)}} />
        <NavItem icon={<BookOpen size={20} strokeWidth={3} className="md:w-6 md:h-6"/>} label="Aventuras" color="#FF0080" active={abaAtiva === 'livros'} onClick={() => {setAbaAtiva('livros'); setLivroAtivo(null); setRedacaoSelecionada(null); setMenuAberto(false)}} />
        <NavItem icon={<LifeBuoy size={20}/>} label="Suporte" color="#3B82F6" active={false} onClick={() => window.location.href = '/suporte'} />
        <NavItem icon={<UserCircle size={20} strokeWidth={3} className="md:w-6 md:h-6"/>} label="Meu Perfil" color="#70E0BB" active={abaAtiva === 'perfil' && !livroAtivo} onClick={() => {setAbaAtiva('perfil'); setLivroAtivo(null); setRedacaoSelecionada(null); setMenuAberto(false)}} />
      </nav>

      <button onClick={async () => { const s = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); await s.auth.signOut(); window.location.href='/login'}} className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 px-4 py-3 font-black text-[#1A1A1A] hover:text-[#FF0080] transition-all border-2 border-transparent hover:border-[#1A1A1A] rounded-xl md:rounded-2xl hover:bg-[#FF0080]/10 mt-auto pt-6 shrink-0">
        <LogOut size={20} strokeWidth={3} className="md:w-6 md:h-6" /> <span className="text-sm md:text-base">Sair da Conta</span>
      </button>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#A78BFA]/30 relative">
      
      <button onClick={() => setMenuAberto(true)} className="lg:hidden fixed top-4 left-4 z-40 p-2 sm:p-3 bg-[#FFDE03] border-2 sm:border-4 border-[#1A1A1A] rounded-xl shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
        <Menu size={24} strokeWidth={3} />
      </button>

      <aside className="w-72 md:w-80 border-r-4 border-[#1A1A1A] bg-[#FFF] p-6 lg:p-8 flex-col hidden lg:flex relative z-30 overflow-y-auto">
        <SidebarConteudo />
      </aside>

      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm" onClick={() => setMenuAberto(false)}></div>
          <aside className="absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-white border-r-4 border-[#1A1A1A] p-5 flex flex-col animate-in slide-in-from-left duration-300 overflow-y-auto">
            <SidebarConteudo />
          </aside>
        </div>
      )}

      <main className={`flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto relative pb-32 lg:pb-12 ${menuAberto ? 'blur-sm lg:blur-none' : ''}`}>
        <div className="absolute top-10 right-10 opacity-10 pointer-events-none hidden md:block"><Star className="w-[100px] h-[100px] lg:w-[150px] lg:h-[150px] text-[#FFDE03] fill-[#FFDE03] transform rotate-45" /></div>
        
        <div className="h-16 lg:hidden"></div>

        {livroAtivo ? (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500 relative">
            <button onClick={() => setLivroAtivo(null)} className="flex items-center gap-2 font-black uppercase italic mb-6 hover:text-[#FF0080] transition-colors group">
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} /> Guardar Livro na Estante
            </button>
            
            <div className="bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] md:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] p-6 md:p-12 min-h-[500px] flex flex-col">
              
              <div className="flex items-center justify-between border-b-4 border-dashed border-[#1A1A1A]/10 pb-6 mb-8">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black uppercase text-[#1A1A1A] italic leading-tight">{livroAtivo.titulo}</h2>
                  <p className="font-bold text-[#FF0080] text-sm md:text-base">{livroAtivo.tema}</p>
                </div>
                <div className="bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-black text-sm md:text-base border-2 border-[#FFDE03] shadow-[2px_2px_0px_0px_#FFDE03]">
                  Página {paginaAtual + 1} de {livroAtivo.paginas.length}
                </div>
              </div>

               {/* O Conteúdo da Página */}
<div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in slide-in-from-right-4">
  {livroAtivo.paginas[paginaAtual]?.imagem_url && (
    <img 
      src={livroAtivo.paginas[paginaAtual].imagem_url} 
      className="max-h-[350px] w-auto object-contain rounded-2xl border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]" 
      alt={`Ilustração da página ${paginaAtual + 1}`} 
    />
  )}
  {livroAtivo.paginas[paginaAtual]?.texto && (
    <p className="text-lg md:text-2xl font-medium leading-loose md:leading-loose whitespace-pre-wrap text-[#1A1A1A] font-serif text-center w-full">
      {livroAtivo.paginas[paginaAtual].texto}
    </p>
  )}
</div>

              <div className="flex items-center justify-between mt-10 pt-6 border-t-4 border-[#1A1A1A] gap-4">
                <button 
                  onClick={paginaAnterior} 
                  disabled={paginaAtual === 0}
                  className="px-4 py-3 md:px-6 md:py-4 bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-xs md:text-sm flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-1 transition-transform"
                >
                  <ChevronLeft strokeWidth={3}/> Anterior
                </button>
                
                {paginaAtual < livroAtivo.paginas.length - 1 ? (
                  <button 
                    onClick={proximaPagina}
                    className="px-4 py-3 md:px-8 md:py-4 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-xs md:text-base flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 hover:shadow-none transition-all"
                  >
                    Próxima <ChevronRight strokeWidth={3}/>
                  </button>
                ) : (
                  <button 
                    onClick={concluirLivro}
                    className="px-4 py-3 md:px-8 md:py-4 bg-[#70E0BB] border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-xs md:text-base flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 hover:shadow-none transition-all animate-pulse"
                  >
                    <Star className="fill-[#1A1A1A]" size={18}/> Concluir Leitura (+{livroAtivo.pontos} PTS)
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {abaAtiva === 'home' && !redacaoSelecionada && (
              <div className="max-w-6xl mx-auto space-y-10 md:space-y-12">
                
                <header className="relative mt-2 md:mt-0">
                  <div className="absolute -top-4 -left-2 md:-top-6 md:-left-4 w-20 md:w-32 h-6 md:h-10 bg-[#70E0BB]/40 -rotate-2 rounded-lg md:rounded-xl"></div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] tracking-tighter uppercase italic transform -rotate-1 leading-tight">Oi, <span className="text-[#A78BFA] drop-shadow-[2px_2px_0px_rgba(26,26,26,1)] md:drop-shadow-[3px_3px_0px_rgba(26,26,26,1)]">{nome.split(' ')[0]}</span>!</h1>
                  <p className="text-sm sm:text-base md:text-xl font-bold text-[#555] mt-2 md:mt-3 flex items-center gap-2 italic"><Rocket size={20} className="text-[#FF0080] md:w-6 md:h-6" /> Vamos aprender brincando?</p>
                </header>

                <div className="p-4 md:p-6 bg-white border-4 border-[#1A1A1A] rounded-2xl md:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transform rotate-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto">
                    <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] ${creditosRestantes > 0 ? 'bg-[#FFDE03]' : 'bg-red-400'}`}>
                      <Star size={24} className="text-[#1A1A1A] fill-[#1A1A1A] md:w-8 md:h-8" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-xl font-black uppercase italic text-[#1A1A1A]">Suas Fichas de Texto</h4>
                      <p className="text-xs md:text-sm font-bold opacity-70">Todo mês novas fichas!</p>
                    </div>
                  </div>
                  <div className="text-2xl md:text-4xl font-black bg-[#F9F6F0] px-4 py-2 md:px-6 md:py-3 border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl shadow-inner text-[#FF0080] w-full sm:w-auto text-center shrink-0">
                    {creditosRestantes} <span className="text-sm md:text-lg uppercase opacity-50 text-[#1A1A1A]">/ 6</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* NOVO: CARD DE SIMULADOS AQUI NA TELA INICIAL (NO LUGAR DA VIVI) */}
                  <div className="relative group p-6 md:p-8 rounded-[30px] md:rounded-[40px] bg-[#A78BFA] border-4 border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer overflow-hidden" onClick={() => window.location.href = '/simulados'}>
                    <div className="relative z-10 text-white">
                      <h3 className="text-2xl md:text-3xl font-black uppercase mb-1 md:mb-2 leading-tight">Super<br/>Simulado</h3>
                      <p className="font-bold opacity-90 mb-4 md:mb-6 text-sm md:text-base">Teste seus poderes agora!</p>
                      <button className="flex items-center justify-between w-full px-4 py-3 md:px-6 md:py-4 bg-[#FFDE03] text-[#1A1A1A] border-4 border-[#1A1A1A] rounded-full font-black text-xs md:text-base">COMEÇAR <HelpCircle size={20} strokeWidth={3} className="md:w-6 md:h-6" /></button>
                    </div>
                    <HelpCircle size={120} className="absolute -right-4 -bottom-6 md:-right-5 md:-bottom-10 text-white/20 transform rotate-[-10deg] group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
                  </div>

                  <div className="relative group p-6 md:p-8 rounded-[30px] md:rounded-[40px] bg-[#FF0080] border-4 border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer overflow-hidden" onClick={() => setAbaAtiva('livros')}>
                    <div className="relative z-10 text-[#1A1A1A]">
                      <h3 className="text-2xl md:text-3xl font-black uppercase mb-1 md:mb-2 leading-tight">Novas<br/>Aventuras</h3>
                      <p className="font-bold opacity-80 mb-4 md:mb-6 text-sm md:text-base">Leia livros e ganhe pontos!</p>
                      <button className="flex items-center justify-between w-full px-4 py-3 md:px-6 md:py-4 bg-white text-[#1A1A1A] border-4 border-[#1A1A1A] rounded-full font-black text-xs md:text-base">LER AGORA <BookOpen size={20} strokeWidth={3} className="md:w-6 md:h-6" /></button>
                    </div>
                    <BookOpen size={120} className="absolute -right-4 -bottom-6 md:-right-5 md:-bottom-10 text-[#1A1A1A]/10 transform rotate-12 group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-end justify-between mb-4 md:mb-6 border-b-4 md:border-b-8 border-[#F59E0B] pb-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#1A1A1A] flex items-center gap-2">
                       Trilhas de português
                    </h3>
                    <button onClick={() => {setAbaAtiva('trilhas'); window.scrollTo(0,0);}} className="text-xs md:text-base font-black uppercase text-[#F59E0B] hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Ver Todas <ArrowRight size={14} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  {trilhasLinguagens.length === 0 ? (
                    <div className="bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Os mestres estão desenhando novos mapas!</p>
                    </div>
                  ) : (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1 snap-x custom-scrollbar">
                      {trilhasLinguagens.map((trilha, idx) => (
                        <div key={trilha.id} className="w-[280px] md:w-[320px] shrink-0 bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col snap-center hover:-translate-y-1 transition-transform overflow-hidden">
                          <div className="h-32 md:h-40 bg-[#F59E0B] border-b-4 border-[#1A1A1A] relative">
                            {trilha.capa_url ? (
                              <img src={trilha.capa_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"></div>
                            )}
                            <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white px-3 py-1 rounded-lg text-xs font-black uppercase">TRILHA LING. {idx + 1}</div>
                            <div className="absolute top-2 right-2 bg-white text-[#F59E0B] px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-[#1A1A1A] flex items-center gap-1 shadow-[2px_2px_0px_0px_#1A1A1A]">
                              <Trophy size={12}/> {trilha.total_pontos} PTS
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg md:text-xl font-black uppercase leading-tight text-[#1A1A1A] mb-2">{trilha.titulo}</h4>
                              <p className="text-xs md:text-sm font-bold text-[#555] line-clamp-2 italic mb-4">{trilha.tema}</p>
                            </div>
                            <button onClick={() => window.location.href = `/jogar-trilha/${trilha.id}`} className="w-full py-3 bg-[#F59E0B] border-2 md:border-4 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                              <PlayCircle size={16} /> Começar Trilha
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-end justify-between mb-4 md:mb-6 border-b-4 md:border-b-8 border-[#3B82F6] pb-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#1A1A1A] flex items-center gap-2">
                       Trilhas de Matemática
                    </h3>
                    <button onClick={() => {setAbaAtiva('trilhas'); window.scrollTo(0,0);}} className="text-xs md:text-base font-black uppercase text-[#3B82F6] hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Ver Todas <ArrowRight size={14} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  {trilhasMatematica.length === 0 ? (
                    <div className="bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Os mestres estão calculando novos mapas!</p>
                    </div>
                  ) : (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1 snap-x custom-scrollbar">
                      {trilhasMatematica.map((trilha, idx) => (
                        <div key={trilha.id} className="w-[280px] md:w-[320px] shrink-0 bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col snap-center hover:-translate-y-1 transition-transform overflow-hidden">
                          <div className="h-32 md:h-40 bg-[#3B82F6] border-b-4 border-[#1A1A1A] relative">
                            {trilha.capa_url ? (
                              <img src={trilha.capa_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"></div>
                            )}
                            <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white px-3 py-1 rounded-lg text-xs font-black uppercase">TRILHA MAT. {idx + 1}</div>
                            <div className="absolute top-2 right-2 bg-white text-[#3B82F6] px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-[#1A1A1A] flex items-center gap-1 shadow-[2px_2px_0px_0px_#1A1A1A]">
                              <Trophy size={12}/> {trilha.total_pontos} PTS
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg md:text-xl font-black uppercase leading-tight text-[#1A1A1A] mb-2">{trilha.titulo}</h4>
                              <p className="text-xs md:text-sm font-bold text-[#555] line-clamp-2 italic mb-4">{trilha.tema}</p>
                            </div>
                            <button onClick={() => window.location.href = `/jogar-trilha/${trilha.id}`} className="w-full py-3 bg-[#3B82F6] border-2 md:border-4 border-[#1A1A1A] text-white rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                              <PlayCircle size={18} /> Começar Trilha
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-end justify-between mb-4 md:mb-6 border-b-4 md:border-b-8 border-[#A78BFA] pb-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#1A1A1A] flex items-center gap-2">
                       Trilhas de Inglês
                    </h3>
                    <button onClick={() => {setAbaAtiva('trilhas'); window.scrollTo(0,0);}} className="text-xs md:text-base font-black uppercase text-[#A78BFA] hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Ver Todas <ArrowRight size={14} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  {trilhasIngles.length === 0 ? (
                    <div className="bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Os mestres estão desenhando novos mapas!</p>
                    </div>
                  ) : (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1 snap-x custom-scrollbar">
                      {trilhasIngles.map((trilha, idx) => (
                        <div key={trilha.id} className="w-[280px] md:w-[320px] shrink-0 bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col snap-center hover:-translate-y-1 transition-transform overflow-hidden">
                          <div className="h-32 md:h-40 bg-[#A78BFA] border-b-4 border-[#1A1A1A] relative">
                            {trilha.capa_url ? (
                              <img src={trilha.capa_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"></div>
                            )}
                            <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white px-3 py-1 rounded-lg text-xs font-black uppercase">TRILHA ING. {idx + 1}</div>
                            <div className="absolute top-2 right-2 bg-white text-[#A78BFA] px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-[#1A1A1A] flex items-center gap-1 shadow-[2px_2px_0px_0px_#1A1A1A]">
                              <Trophy size={12}/> {trilha.total_pontos} PTS
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg md:text-xl font-black uppercase leading-tight text-[#1A1A1A] mb-2">{trilha.titulo}</h4>
                              <p className="text-xs md:text-sm font-bold text-[#555] line-clamp-2 italic mb-4">{trilha.tema}</p>
                            </div>
                            <button onClick={() => window.location.href = `/jogar-trilha/${trilha.id}`} className="w-full py-3 bg-[#A78BFA] border-2 md:border-4 border-[#1A1A1A] text-white rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                              <PlayCircle size={16} /> Começar Trilha
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-end justify-between mb-4 md:mb-6 border-b-4 md:border-b-8 border-[#FFDE03] pb-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#1A1A1A]">
                      Desafio do Dia
                    </h3>
                    <button onClick={() => {setAbaAtiva('temas'); window.scrollTo(0,0);}} className="text-xs md:text-base font-black uppercase text-[#FF0080] hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Ver Todos <ArrowRight size={14} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  {desafios.length === 0 ? (
                    <div className="bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                      <Trophy size={60} className="mx-auto mb-3 md:mb-4 text-[#FFDE03] md:w-20 md:h-20" />
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Sem novos desafios hoje!</p>
                    </div>
                  ) : desafioAtual ? (
                    <div className="bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500" key={desafioAtual.id}>
                      {desafioAtual.imagem_url && <div className="h-32 sm:h-48 md:h-64 border-b-4 border-[#1A1A1A]"><img src={desafioAtual.imagem_url} className="w-full h-full object-cover" /></div>}
                      <div className="p-5 md:p-8">
                        <h3 className="text-xl md:text-2xl font-black uppercase text-[#FF0080] leading-tight mb-2 md:mb-3">{desafioAtual.titulo}</h3>
                        <p className="text-base md:text-xl font-bold mb-6 md:mb-8 italic text-[#1A1A1A]">"{desafioAtual.pergunta}"</p>
                        
                        {desafioAtual.tipo_pergunta === 'multipla_escolha' ? (
                          <div className="grid gap-2 md:gap-3">
                            {desafioAtual.opcoes?.map((opcao, i) => (
                              <button key={i} onClick={() => responderDesafio(desafioAtual, opcao)} className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#1A1A1A] font-black text-sm md:text-base text-left flex justify-between items-center transition-all bg-[#F9F6F0] hover:bg-[#FFDE03] active:translate-y-1">
                                {opcao}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <form onSubmit={(e) => { e.preventDefault(); responderDesafio(desafioAtual, e.target.resposta.value); }} className="flex flex-col sm:flex-row gap-2">
                            <input name="resposta" placeholder="Digite sua resposta..." className="flex-1 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#1A1A1A] font-bold text-sm md:text-base outline-none focus:bg-[#FFDE03]/20" required />
                            <button type="submit" className="bg-[#1A1A1A] text-white p-3 md:px-6 rounded-xl md:rounded-2xl font-black uppercase text-sm md:text-base hover:bg-[#FF0080] transition-colors shadow-[2px_2px_0px_0px_rgba(255,0,128,1)]">Enviar</button>
                          </form>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#70E0BB] border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transform rotate-1">
                      <Sparkles size={60} className="mx-auto mb-3 md:mb-4 text-white md:w-20 md:h-20" />
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase leading-tight">Incrível! Você completou todos os desafios!</p>
                    </div>
                  )}
                </div>

                <div>
                  <button 
                    onClick={() => window.location.href = '/enviar-redacao'}
                    className="w-full relative group p-6 sm:p-8 md:p-12 rounded-[30px] md:rounded-[40px] bg-[#FF0080] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] md:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 md:hover:translate-x-2 md:hover:translate-y-2 hover:shadow-none transition-all cursor-pointer overflow-hidden text-left"
                  >
                    <div className="relative z-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                      <div>
                        <h3 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase mb-1 md:mb-2 italic">Escrever Meu Texto!</h3>
                        <p className="font-bold opacity-90 text-sm sm:text-base md:text-xl">Aceite o desafio e envie sua história para o mestre.</p>
                      </div>
                      <div className="w-14 h-14 md:w-20 md:h-20 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-full flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] group-hover:scale-110 transition-transform self-end md:self-auto">
                        <Pencil size={24} className="text-[#1A1A1A] md:w-10 md:h-10" />
                      </div>
                    </div>
                    <Sparkles size={120} className="absolute -right-4 -bottom-10 md:-right-10 md:-bottom-20 text-white/10 transform rotate-12 md:w-[250px] md:h-[250px]" />
                  </button>
                </div>

                <div className="pt-4 md:pt-8">
                  <div className="bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] p-6 md:p-10">
                    <div className="flex items-center gap-3 mb-6 md:mb-8 border-b-4 border-[#FF0080] pb-4">
                      <div className="w-12 h-12 bg-[#FFDE03] border-4 border-[#1A1A1A] rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] shrink-0">
                        <Trophy className="text-[#1A1A1A]" size={24} strokeWidth={3}/>
                      </div>
                      <h3 className="text-2xl md:text-4xl font-black uppercase italic text-[#1A1A1A] leading-tight">
                        Top 10 Heróis
                      </h3>
                    </div>

                    {ranking.length === 0 ? (
                      <div className="text-center py-10 opacity-60">
                        <Trophy size={60} className="mx-auto mb-3" />
                        <p className="font-bold text-lg md:text-xl italic uppercase">O ranking está sendo calculado...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {ranking.map((aluno, index) => (
                          <div key={aluno.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-2xl hover:bg-white hover:-translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] group">
                            <div className={`font-black text-xl md:text-2xl w-8 md:w-10 text-center shrink-0 ${index === 0 ? 'text-[#F59E0B] text-3xl md:text-4xl' : index === 1 ? 'text-[#94A3B8] text-2xl md:text-3xl' : index === 2 ? 'text-[#B45309] text-2xl md:text-3xl' : 'text-[#1A1A1A]'}`}>
                              {index + 1}º
                            </div>
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-[#1A1A1A] overflow-hidden shrink-0 bg-white ${index === 0 ? 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' : ''}`}>
                              <img src={aluno.foto_url || AVATARES_DISPONIVEIS[0]} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-black text-sm md:text-lg uppercase truncate text-[#1A1A1A] group-hover:text-[#FF0080] transition-colors">{aluno.nome_completo?.split(' ')[0] || 'Herói'}</p>
                              <p className="text-[10px] md:text-xs font-bold text-[#555] uppercase truncate tracking-wider leading-tight mb-1">
                                {aluno.escola || 'Escola não informada'}
                              </p>
                              <p className="text-[10px] md:text-xs font-bold text-[#1A1A1A] bg-[#70E0BB] inline-block px-2 py-0.5 rounded-md border-2 border-[#1A1A1A] shadow-sm">
                                {aluno.pontuacao || 0} PTS
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {abaAtiva === 'livros' && !livroAtivo && (
              <div className="max-w-6xl mx-auto animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A] mb-8 md:mb-12 border-b-4 md:border-b-8 border-[#FF0080] inline-block">
                  Biblioteca Mágica
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {livros.length === 0 ? (
                    <div className="col-span-full bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] p-10 text-center">
                      <BookOpen size={60} className="mx-auto mb-4 text-[#F9F6F0]" />
                      <p className="font-black text-xl italic text-[#1A1A1A] uppercase">A estante está vazia hoje!</p>
                    </div>
                  ) : (
                    livros.map((livro) => {
                      const lido = livrosLidos.includes(livro.id)
                      return (
                        <div key={livro.id} className={`bg-white border-4 border-[#1A1A1A] rounded-[30px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col overflow-hidden transition-all ${lido ? 'opacity-80' : 'hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] cursor-pointer group'}`} onClick={() => abrirLivro(livro)}>
                          
                          <div className="h-48 bg-[#FF0080] border-b-4 border-[#1A1A1A] relative flex items-center justify-center">
                            {livro.capa_url ? (
                              <img src={livro.capa_url} className={`w-full h-full object-cover transition-transform duration-500 ${!lido && 'group-hover:scale-105'}`} />
                            ) : (
                              <BookOpen size={80} className="text-[#1A1A1A] opacity-20" />
                            )}
                            
                            <div className="absolute top-3 left-3 bg-[#FFDE03] text-[#1A1A1A] px-3 py-1 rounded-xl text-xs font-black uppercase border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1 z-10">
                              <Star size={14} className="fill-[#1A1A1A]" /> {livro.pontos} PTS
                            </div>
                            
                            {lido && (
                              <div className="absolute inset-0 bg-[#70E0BB]/80 backdrop-blur-sm flex items-center justify-center z-20 flex-col">
                                <CheckCircle2 size={48} className="text-[#1A1A1A] mb-2" />
                                <span className="font-black uppercase text-[#1A1A1A] border-2 border-[#1A1A1A] bg-white px-3 py-1 rounded-full text-xs">Lido!</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-6 flex-1 flex flex-col">
                            <h4 className="text-xl md:text-2xl font-black uppercase leading-tight text-[#1A1A1A] mb-2 italic">{livro.titulo}</h4>
                            <p className="font-bold text-[#555] text-xs md:text-sm line-clamp-2 mb-4">{livro.tema}</p>
                            
                            <button className={`mt-auto w-full py-3 border-4 border-[#1A1A1A] rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-colors ${lido ? 'bg-[#F9F6F0] text-[#1A1A1A]' : 'bg-[#FF0080] text-white group-hover:bg-[#1A1A1A] group-hover:text-[#FF0080]'}`}>
                              {lido ? 'Ler de Novo' : 'Abrir Livro'}
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {abaAtiva === 'jogos' && !livroAtivo && (
              <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A] mb-8 md:mb-12 border-b-4 md:border-b-8 border-[#F59E0B] inline-block">Área de Jogos</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  
                  <div onClick={() => window.location.href = '/game'} className="bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-2 hover:shadow-none transition-all cursor-pointer flex flex-col overflow-hidden group">
                    <div className="h-48 md:h-56 bg-[#FFDE03] border-b-4 border-[#1A1A1A] relative flex items-center justify-center overflow-hidden">
                       <div className="absolute inset-0 opacity-20 bg-[url('/mapa-oficial.PNG')] bg-cover bg-bottom mix-blend-multiply transition-transform duration-700 group-hover:scale-110"></div>
                       <div className="absolute top-4 left-4 bg-[#FF0080] text-white px-3 py-1 rounded-xl text-xs md:text-sm font-black uppercase border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] z-10 animate-pulse">NOVO!</div>
                       <Gamepad2 size={80} className="text-[#1A1A1A] drop-shadow-md relative z-10 group-hover:rotate-12 transition-transform md:w-[100px] md:h-[100px]" />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                       <h4 className="text-2xl md:text-3xl font-black uppercase leading-tight text-[#1A1A1A] mb-2 md:mb-3 italic">Saga da Matemática</h4>
                       <p className="font-bold text-[#555] text-sm md:text-base mb-6 md:mb-8 flex-1">Enfrente guardiões, resolva enigmas numéricos e conquiste as 4 ilhas elementais!</p>
                       <button className="w-full py-4 bg-[#F59E0B] border-4 border-[#1A1A1A] text-[#1A1A1A] rounded-2xl font-black uppercase text-sm md:text-lg flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] group-hover:bg-[#FFDE03] transition-colors">
                         <PlayCircle size={24} strokeWidth={3} /> Jogar Agora
                       </button>
                    </div>
                  </div>

                  <div onClick={() => window.location.href = '/game-portugues'} className="bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-2 hover:shadow-none transition-all cursor-pointer flex flex-col overflow-hidden group">
                    <div className="h-48 md:h-56 bg-[#70E0BB] border-b-4 border-[#1A1A1A] relative flex items-center justify-center overflow-hidden">
                       <div className="absolute top-4 left-4 bg-[#FFDE03] text-[#1A1A1A] px-3 py-1 rounded-xl text-xs md:text-sm font-black uppercase border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] z-10 animate-pulse">NOVO!</div>
                       <BookOpen size={80} className="text-[#1A1A1A] drop-shadow-md relative z-10 group-hover:rotate-12 transition-transform md:w-[100px] md:h-[100px]" />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                       <h4 className="text-2xl md:text-3xl font-black uppercase leading-tight text-[#1A1A1A] mb-2 md:mb-3 italic">Saga de Português</h4>
                       <p className="font-bold text-[#555] text-sm md:text-base mb-6 md:mb-8 flex-1">Desbrave o Bosque da Leitura, a Arena da Argumentação e torne-se mestre das palavras!</p>
                       <button className="w-full py-4 bg-[#A78BFA] border-4 border-[#1A1A1A] text-white rounded-2xl font-black uppercase text-sm md:text-lg flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] group-hover:bg-[#FF0080] transition-colors">
                         <PlayCircle size={24} strokeWidth={3} /> Jogar Agora
                       </button>
                    </div>
                  </div>

                  <div className="bg-[#F9F6F0] border-4 border-dashed border-[#1A1A1A] rounded-[30px] md:rounded-[40px] flex flex-col items-center justify-center p-8 opacity-60 h-full min-h-[350px]">
                     <Gamepad2 size={60} className="text-[#1A1A1A] mb-4 opacity-50" />
                     <p className="font-black text-xl text-[#1A1A1A] uppercase text-center italic">Mais jogos<br/>sendo criados...</p>
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === 'trilhas' && !livroAtivo && (
              <div className="max-w-6xl mx-auto animate-in slide-in-from-right-8 duration-500 space-y-12">
                
                <div>
                  <div className="flex items-end justify-between mb-4 md:mb-6 border-b-4 md:border-b-8 border-[#F59E0B] pb-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#1A1A1A] flex items-center gap-2">
                       Trilhas de português
                    </h3>
                    <button onClick={() => {setAbaAtiva('trilhas'); window.scrollTo(0,0);}} className="text-xs md:text-base font-black uppercase text-[#F59E0B] hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Ver Todas <ArrowRight size={14} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  {trilhasLinguagens.length === 0 ? (
                    <div className="bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Os mestres estão desenhando novos mapas!</p>
                    </div>
                  ) : (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1 snap-x custom-scrollbar">
                      {trilhasLinguagens.map((trilha, idx) => (
                        <div key={trilha.id} className="w-[280px] md:w-[320px] shrink-0 bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col snap-center hover:-translate-y-1 transition-transform overflow-hidden">
                          <div className="h-32 md:h-40 bg-[#F59E0B] border-b-4 border-[#1A1A1A] relative">
                            {trilha.capa_url ? (
                              <img src={trilha.capa_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"></div>
                            )}
                            <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white px-3 py-1 rounded-lg text-xs font-black uppercase">TRILHA LING. {idx + 1}</div>
                            <div className="absolute top-2 right-2 bg-white text-[#F59E0B] px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-[#1A1A1A] flex items-center gap-1 shadow-[2px_2px_0px_0px_#1A1A1A]">
                              <Trophy size={12}/> {trilha.total_pontos} PTS
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg md:text-xl font-black uppercase leading-tight text-[#1A1A1A] mb-2">{trilha.titulo}</h4>
                              <p className="text-xs md:text-sm font-bold text-[#555] line-clamp-2 italic mb-4">{trilha.tema}</p>
                            </div>
                            <button onClick={() => window.location.href = `/jogar-trilha/${trilha.id}`} className="w-full py-3 bg-[#F59E0B] border-2 md:border-4 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                              <PlayCircle size={16} /> Começar Trilha
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-end justify-between mb-4 md:mb-6 border-b-4 md:border-b-8 border-[#3B82F6] pb-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#1A1A1A] flex items-center gap-2">
                       Trilhas de Matemática
                    </h3>
                    <button onClick={() => {setAbaAtiva('trilhas'); window.scrollTo(0,0);}} className="text-xs md:text-base font-black uppercase text-[#3B82F6] hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Ver Todas <ArrowRight size={14} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  {trilhasMatematica.length === 0 ? (
                    <div className="bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Os mestres estão calculando novos mapas!</p>
                    </div>
                  ) : (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1 snap-x custom-scrollbar">
                      {trilhasMatematica.map((trilha, idx) => (
                        <div key={trilha.id} className="w-[280px] md:w-[320px] shrink-0 bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col snap-center hover:-translate-y-1 transition-transform overflow-hidden">
                          <div className="h-32 md:h-40 bg-[#3B82F6] border-b-4 border-[#1A1A1A] relative">
                            {trilha.capa_url ? (
                              <img src={trilha.capa_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"></div>
                            )}
                            <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white px-3 py-1 rounded-lg text-xs font-black uppercase">TRILHA MAT. {idx + 1}</div>
                            <div className="absolute top-2 right-2 bg-white text-[#3B82F6] px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-[#1A1A1A] flex items-center gap-1 shadow-[2px_2px_0px_0px_#1A1A1A]">
                              <Trophy size={12}/> {trilha.total_pontos} PTS
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg md:text-xl font-black uppercase leading-tight text-[#1A1A1A] mb-2">{trilha.titulo}</h4>
                              <p className="text-xs md:text-sm font-bold text-[#555] line-clamp-2 italic mb-4">{trilha.tema}</p>
                            </div>
                            <button onClick={() => window.location.href = `/jogar-trilha/${trilha.id}`} className="w-full py-3 bg-[#3B82F6] border-2 md:border-4 border-[#1A1A1A] text-white rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                              <PlayCircle size={18} /> Começar Trilha
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-end justify-between mb-4 md:mb-6 border-b-4 md:border-b-8 border-[#A78BFA] pb-2">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-[#1A1A1A] flex items-center gap-2">
                       Trilhas de Inglês
                    </h3>
                    <button onClick={() => {setAbaAtiva('trilhas'); window.scrollTo(0,0);}} className="text-xs md:text-base font-black uppercase text-[#A78BFA] hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                      Ver Todas <ArrowRight size={14} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  {trilhasIngles.length === 0 ? (
                    <div className="bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Os mestres estão desenhando novos mapas!</p>
                    </div>
                  ) : (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1 snap-x custom-scrollbar">
                      {trilhasIngles.map((trilha, idx) => (
                        <div key={trilha.id} className="w-[280px] md:w-[320px] shrink-0 bg-white border-4 border-[#1A1A1A] rounded-[20px] md:rounded-[30px] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col snap-center hover:-translate-y-1 transition-transform overflow-hidden">
                          <div className="h-32 md:h-40 bg-[#A78BFA] border-b-4 border-[#1A1A1A] relative">
                            {trilha.capa_url ? (
                              <img src={trilha.capa_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"></div>
                            )}
                            <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white px-3 py-1 rounded-lg text-xs font-black uppercase">TRILHA ING. {idx + 1}</div>
                            <div className="absolute top-2 right-2 bg-white text-[#A78BFA] px-3 py-1 rounded-lg text-xs font-black uppercase border-2 border-[#1A1A1A] flex items-center gap-1 shadow-[2px_2px_0px_0px_#1A1A1A]">
                              <Trophy size={12}/> {trilha.total_pontos} PTS
                            </div>
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg md:text-xl font-black uppercase leading-tight text-[#1A1A1A] mb-2">{trilha.titulo}</h4>
                              <p className="text-xs md:text-sm font-bold text-[#555] line-clamp-2 italic mb-4">{trilha.tema}</p>
                            </div>
                            <button onClick={() => window.location.href = `/jogar-trilha/${trilha.id}`} className="w-full py-3 bg-[#A78BFA] border-2 md:border-4 border-[#1A1A1A] text-white rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                              <PlayCircle size={16} /> Começar Trilha
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {abaAtiva === 'temas' && !livroAtivo && (
              <div className="max-w-4xl mx-auto animate-in slide-in-from-left-8 duration-500">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 md:mb-12 border-b-4 md:border-b-8 border-[#FFDE03] inline-block">Todos os Desafios</h2>
                <div className="grid gap-6 md:gap-10">
                  {desafios.length === 0 ? (
                    <div className="col-span-full bg-white border-4 border-[#1A1A1A] p-6 md:p-10 rounded-[30px] md:rounded-[40px] text-center shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                      <Trophy size={60} className="mx-auto mb-3 md:mb-4 text-[#FFDE03] md:w-20 md:h-20" />
                      <p className="font-black text-lg md:text-2xl italic text-[#1A1A1A] uppercase">Nenhum desafio lançado ainda!</p>
                    </div>
                  ) : (
                    desafios.map((d) => (
                      <div key={d.id} className={`bg-white border-4 border-[#1A1A1A] rounded-[30px] md:rounded-[40px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] md:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] overflow-hidden transition-all ${respostasEnviadas[d.id] !== undefined ? 'opacity-70 grayscale-[20%]' : ''}`}>
                        {d.imagem_url && <div className="h-32 sm:h-48 md:h-64 border-b-4 border-[#1A1A1A]"><img src={d.imagem_url} className="w-full h-full object-cover" /></div>}
                        <div className="p-5 md:p-8">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                            <h3 className="text-xl md:text-2xl font-black uppercase text-[#FF0080] leading-tight">{d.titulo}</h3>
                            {respostasEnviadas[d.id] !== undefined && <span className={`px-3 py-1 md:px-4 md:py-1 rounded-full font-black text-[10px] md:text-xs border-2 border-[#1A1A1A] shrink-0 ${respostasEnviadas[d.id] ? 'bg-[#70E0BB]' : 'bg-red-400'}`}>{respostasEnviadas[d.id] ? 'Completado!' : 'Errado!'}</span>}
                          </div>
                          <p className="text-base md:text-xl font-bold mb-6 md:mb-8 italic">"{d.pergunta}"</p>
                          
                          {d.tipo_pergunta === 'multipla_escolha' ? (
                            <div className="grid gap-2 md:gap-3">
                              {d.opcoes?.map((opcao, i) => (
                                <button key={i} disabled={respostasEnviadas[d.id] !== undefined} onClick={() => responderDesafio(d, opcao)} className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#1A1A1A] font-black text-sm md:text-base text-left flex justify-between items-center transition-all ${respostasEnviadas[d.id] !== undefined ? (opcao === d.resposta_correta ? 'bg-[#70E0BB]' : 'bg-white opacity-50') : 'bg-[#F9F6F0] hover:bg-[#FFDE03] active:translate-y-1'}`}>{opcao}{respostasEnviadas[d.id] !== undefined && opcao === d.resposta_correta && <CheckCircle2 className="md:w-6 md:h-6"/>}</button>
                              ))}
                            </div>
                          ) : (
                            <div>
                              {respostasEnviadas[d.id] === undefined ? (
                                <form onSubmit={(e) => { e.preventDefault(); responderDesafio(d, e.target.resposta.value); }} className="flex flex-col sm:flex-row gap-2">
                                  <input name="resposta" placeholder="Digite aqui..." className="flex-1 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#1A1A1A] font-bold text-sm md:text-base outline-none" required />
                                  <button type="submit" className="bg-[#1A1A1A] text-white p-3 md:px-6 rounded-xl md:rounded-2xl font-black uppercase text-sm md:text-base hover:bg-[#FF0080] transition-colors">Enviar</button>
                                </form>
                              ) : (
                                <div className="p-3 md:p-4 bg-[#F9F6F0] border-2 md:border-4 border-dashed border-[#1A1A1A] rounded-xl md:rounded-2xl font-black text-center text-sm md:text-base">Desafio Finalizado!</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {abaAtiva === 'aulas' && !livroAtivo && (
              <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#1A1A1A] mb-8 md:mb-12 border-b-4 md:border-b-8 border-[#A78BFA] inline-block">Galeria de Aventuras</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {aulas.map((aula, idx) => (
                    <div key={aula.id} className={`group border-4 border-[#1A1A1A] rounded-[30px] overflow-hidden hover:-translate-y-1 md:hover:-translate-y-2 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] ${idx % 3 === 0 ? 'bg-[#70E0BB]' : idx % 3 === 1 ? 'bg-[#FFDE03]' : 'bg-[#A78BFA]'}`} onClick={() => window.location.href = `/dashboard/aula/${aula.id}`}>
                      <div className="aspect-video relative border-b-4 border-[#1A1A1A] overflow-hidden bg-white">
                        {aula.capa_final ? <img src={aula.capa_final} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen size={40} className="text-[#1A1A1A] opacity-20 md:w-16 md:h-16"/></div>}
                      </div>
                      <div className="p-4 md:p-5"><h4 className="text-base md:text-lg font-black text-[#1A1A1A] uppercase leading-tight line-clamp-2">{aula.titulo}</h4></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'perfil' && !livroAtivo && (
              <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 md:mb-12 border-b-4 md:border-b-8 border-[#70E0BB] inline-block">Sua Base Secreta</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  
                  <div className="lg:col-span-1 bg-white border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-center flex flex-col items-center justify-start">
                    <div className="relative mb-5 md:mb-6 cursor-pointer group" onClick={() => setMostrandoAvatares(!mostrandoAvatares)}>
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#1A1A1A] overflow-hidden bg-[#F9F6F0] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] relative transition-transform group-hover:scale-105">
                        <img src={fotoPerfil || AVATARES_DISPONIVEIS[0]} className="w-full h-full object-cover" alt="Seu Avatar" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-[#FFDE03] border-2 md:border-4 border-[#1A1A1A] p-1.5 md:p-2 rounded-full shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all">
                        <Pencil size={16} strokeWidth={3} className="md:w-5 md:h-5" />
                      </div>
                    </div>

                    {mostrandoAvatares && (
                      <div className="bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 md:p-4 mb-5 md:mb-6 shadow-inner animate-in fade-in duration-200">
                        <p className="text-[10px] md:text-xs font-black uppercase mb-2 md:mb-3 text-[#FF0080]">Escolha seu personagem:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {AVATARES_DISPONIVEIS.map((url, idx) => (
                            <div key={idx} onClick={(e) => { e.stopPropagation(); escolherAvatar(url); }} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#1A1A1A] cursor-pointer hover:scale-110 transition-transform overflow-hidden ${fotoPerfil === url ? 'ring-2 md:ring-4 ring-[#FF0080]' : ''}`}>
                              <img src={url} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="w-full space-y-3 md:space-y-4">
                      <input className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 text-center text-base md:text-lg font-black uppercase outline-none focus:bg-[#70E0BB]/20" value={nome} onChange={e => setNome(e.target.value)} />
                      <input className="w-full bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] rounded-xl md:rounded-2xl p-3 text-center text-sm md:text-base font-bold uppercase outline-none focus:bg-[#70E0BB]/20" placeholder="Nome da Escola" value={escola} onChange={e => setEscola(e.target.value)} />
                      <button onClick={handleSalvarPerfil} className="w-full py-3 md:py-4 bg-[#FF0080] text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base uppercase italic border-2 md:border-4 border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all mt-2">Salvar Tudo</button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-white border-4 border-[#1A1A1A] p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                    <h3 className="text-xl md:text-2xl font-black uppercase text-[#1A1A1A] mb-4 md:mb-6 flex items-center gap-2"><StickyNote className="text-[#FF0080] w-6 h-6 md:w-7 md:h-7" strokeWidth={3} /> Meus Textos Antigos</h3>
                    <div className="grid gap-3 md:gap-4 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {minhasRedacoes.map(r => (
                        <div key={r.id} onClick={() => setRedacaoSelecionada(r)} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F9F6F0] border-2 md:border-4 border-[#1A1A1A] hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all cursor-pointer">
                          <div className="flex items-center gap-3 md:gap-4 w-full pr-2">
                            <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 md:border-4 border-[#1A1A1A] flex items-center justify-center ${r.status === 'corrigido' ? 'bg-[#70E0BB]' : 'bg-[#FFDE03]'}`}>{r.status === 'corrigido' ? <CheckCircle2 size={20} strokeWidth={3} className="md:w-6 md:h-6" /> : <Clock size={20} strokeWidth={3} className="md:w-6 md:h-6" />}</div>
                            <p className="text-sm sm:text-base md:text-lg font-black uppercase tracking-tight line-clamp-1 break-all">{r.titulo || 'Sem título'}</p>
                          </div>
                          <ChevronRight size={20} strokeWidth={4} className="shrink-0 md:w-6 md:h-6" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* BOTÃO FLUTUANTE DA VIVI */}
      <button 
        onClick={() => setViviAberta(!viviAberta)} 
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-16 h-16 md:w-20 md:h-20 bg-[#A78BFA] border-4 border-[#1A1A1A] rounded-full shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transition-all ${viviAberta ? 'scale-0' : 'scale-100'}`}
      >
        <Bot size={36} className="text-white" />
      </button>

      {/* CHAT FLUTUANTE DA VIVI */}
      {viviAberta && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] md:h-[600px] max-h-[80vh] bg-white border-4 border-[#1A1A1A] rounded-[30px] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
          
          <div className="bg-[#A78BFA] border-b-4 border-[#1A1A1A] p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-[#1A1A1A] rounded-full overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                <img src="/vivi.png" alt="Vivi" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black uppercase text-white leading-tight text-sm md:text-base">Vivi IA</h4>
                <p className="text-[10px] font-bold text-white/90 italic">Sua parceira de estudos!</p>
              </div>
            </div>
            <button onClick={() => setViviAberta(false)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors cursor-pointer">
              <X size={20} className="text-white" strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-[#F9F6F0] flex flex-col gap-4 custom-scrollbar">
            {historicoVivi.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl border-2 border-[#1A1A1A] text-xs sm:text-sm font-medium leading-relaxed shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] ${msg.role === 'user' ? 'bg-[#FFDE03] rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                  {formatarMensagem(msg.parts[0].text)}
                </div>
              </div>
            ))}
            {carregandoVivi && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-[#1A1A1A] p-3 rounded-2xl rounded-bl-none text-xs font-bold animate-pulse text-[#A78BFA] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                  Vivi está digitando...
                </div>
              </div>
            )}
            <div ref={chatFimRef} />
          </div>

          <form onSubmit={enviarMensagemVivi} className="border-t-4 border-[#1A1A1A] bg-white p-3 flex gap-2">
            <input 
              type="text" 
              value={mensagemVivi}
              onChange={(e) => setMensagemVivi(e.target.value)}
              placeholder="Pergunte algo..." 
              className="flex-1 bg-[#F9F6F0] border-2 border-[#1A1A1A] rounded-xl px-3 py-2 text-sm font-bold outline-none focus:bg-[#A78BFA]/10 transition-colors"
              disabled={carregandoVivi}
            />
            <button 
              type="submit"
              disabled={carregandoVivi || !mensagemVivi.trim()}
              className="bg-[#FF0080] border-2 border-[#1A1A1A] px-4 py-2 rounded-xl text-white hover:bg-[#1A1A1A] transition-colors disabled:opacity-50 shrink-0 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center cursor-pointer"
            >
              <Send size={16} strokeWidth={3} />
            </button>
          </form>
        </div>
      )}

    </div>
  )
}

function NavItem({ icon, label, active, onClick, color }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl font-black uppercase italic text-base md:text-xl border-2 md:border-4 transition-all ${active ? `bg-[${color}] text-[#1A1A1A] border-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1` : 'text-[#555] border-transparent hover:border-[#1A1A1A] hover:bg-white'}`} style={active ? {backgroundColor: color} : {}}>{icon} <span>{label}</span></button>
  )
}