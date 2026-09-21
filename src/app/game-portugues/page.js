'use client'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, X, Trophy, Star, BookOpen, Leaf, Compass, Volume2, VolumeX, CheckCircle, XCircle, Unlock } from 'lucide-react'
import useSound from 'use-sound'

// ==========================================
// 1. DADOS DOS AVATARES E MUNDOS
// ==========================================
const AVATARES = [
  { id: 'livia-branca', nome: 'Lívia', img: '/menina branca.jfif.png' },
  { id: 'livia-negra', nome: 'Maria', img: '/menina negra.jfif.png' },
  { id: 'enzo-branco', nome: 'Enzo', img: '/menino branco.jfif.png' },
  { id: 'enzo-negro', nome: 'Carlos', img: '/menino negro.jfif.png' },
]

const MUNDOS = [
  { id: 1, nome: 'Bosque da Leitura', img: '/mundo-1.png' },
  { id: 2, nome: 'Reino do Saber', img: '/mundo-2.png' },
  { id: 3, nome: 'Arena da Argumentação', img: '/mundo-3.png' },
  { id: 4, nome: 'A Biblioteca dos Sentidos', img: '/mundo-4.png' },
  { id: 5, nome: 'Topo da Maestria', img: '/mundo-5.png' },
]

// ==========================================
// 2. CONFIGURAÇÃO DAS 25 FASES
// ==========================================
const FASES = [
  { id: 1, left: 48, bottom:30, ilha: 'bosque' },
  { id: 2, left: 48, bottom: 39, ilha: 'bosque' },
  { id: 3, left: 61, bottom: 43, ilha: 'bosque' },
  { id: 4, left: 52, bottom: 50, ilha: 'bosque' },
  { id: 5, left: 60.4, bottom: 55, ilha: 'bosque', isFinalDaIlha: true },

  { id: 6, left: 43, bottom: 35, ilha: 'reino' },
  { id: 7, left: 49.9, bottom: 42, ilha: 'reino' },
  { id: 8, left: 36, bottom: 50, ilha: 'reino' },
  { id: 9, left: 46, bottom: 57, ilha: 'reino' },
  { id: 10, left: 52, bottom: 64, ilha: 'reino', isFinalDaIlha: true },

  { id: 11, left: 49, bottom: 32.3, ilha: 'biblioteca' },
  { id: 12, left: 48, bottom: 42, ilha: 'biblioteca' },
  { id: 13, left: 60, bottom: 47, ilha: 'biblioteca' },
  { id: 14, left: 64, bottom: 52, ilha: 'biblioteca' },
  { id: 15, left: 59.8, bottom: 57, ilha: 'biblioteca', isFinalDaIlha: true },

  { id: 16, left: 63, bottom: 45, ilha: 'arena' },
  { id: 17, left: 55, bottom: 50, ilha: 'arena' },
  { id: 18, left: 49, bottom: 55, ilha: 'arena' },
  { id: 19, left: 39, bottom: 60, ilha: 'arena' },
  { id: 20, left: 50, bottom: 67, ilha: 'arena', isFinalDaIlha: true },

  { id: 21, left: 50, bottom: 40, ilha: 'topo' },
  { id: 22, left: 50, bottom: 48, ilha: 'topo' },
  { id: 23, left: 34, bottom: 50, ilha: 'topo' },
  { id: 24, left: 60, bottom: 51, ilha: 'topo' },
  { id: 25, left: 50.4, bottom: 57, ilha: 'topo', isFinalDaIlha: true, isFinal: true },
]

const VILOES_ILHA = [
  { ilha: 'bosque', img: '/vó da chapéuzinho.png', left: 54, bottom: 53, width: '22%', ateFase: 5 },
  { ilha: 'reino', img: '/fada madrinha.png', left: 59, bottom: 60, width: '26%', ateFase: 10 },
  { ilha: 'biblioteca', img: '/lagarta azul 2.png', left: 44, bottom: 49, width: '22%', ateFase: 15 },
  { ilha: 'arena', img: '/relógio bela e a fera.jfif.png', left: 39, bottom: 64, width: '18%', ateFase: 20 },
  { ilha: 'topo', img: '/Merlim.png', left: 50, bottom: 67, width: '25%', ateFase: 25 },
]

const VILAO_INTRO = {
  bosque: { nome: 'Guardiã do Bosque', fala: 'A leitura abre portas mágicas! Resolva este enigma para continuar sua jornada.' },
  reino: { nome: 'Mestre Verbo', fala: 'No meu reino, as regras são claras! Prove que você domina a gramática.' },
  biblioteca: { nome: 'Maya, a Investigadora', fala: 'Para sair da biblioteca, você precisa interpretar os mistérios escondidos nas entrelinhas.' },
  arena: { nome: 'Theo, o Estrategista', fala: 'Argumentar é uma arte! Convença-me com suas melhores ideias para avançar.' },
  topo: { nome: 'O Grande Merlim', fala: 'Você chegou ao topo! Mostre sua maestria unindo tudo que aprendeu para vencer o desafio final.' },
}

const imgBaseFase = (id) => `/base ${id}.png`
const IMG_BASE_CONCLUIDA = `/base concluída.png`

const FASES_CHEFAO = [5, 10, 15, 20, 25]

// ==========================================
// 3. BANCO DE QUESTÕES
// ==========================================
const QUESTOES = [
  { id: 1, pergunta: 'Entre as folhas, você encontrou estas palavras: RIO, RATO, ROSA, RODA. Qual delas representa um lugar onde podemos encontrar água?', opcoes: ['RATO', 'ROSA', 'RIO', 'RODA'], correta: 'RIO' },
  { id: 2, pergunta: 'Para atravessar a ponte, você precisa descobrir quantas sílabas existem em: BORBOLETA', opcoes: ['2', '3', '4', '5'], correta: '4' },
  { id: 3, pergunta: 'O eco do bosque só responde quando encontra uma palavra que rima. Qual palavra faz par com SAPO?', opcoes: ['CASA', 'MATO', 'PATO', 'FOLHA'], correta: 'PATO' },
  { id: 4, pergunta: 'Você encontra um papel dizendo: "Ingredientes: 2 bananas, 1 copo de leite e 1 colher de açúcar. Bata tudo no liquidificador." Que tipo de texto é esse?', opcoes: ['Receita', 'Notícia', 'Bilhete', 'Poema'], correta: 'Receita' },
  { id: 5, pergunta: 'Leia: "O coelho encontrou uma cenoura perto da árvore. Ele levou o alimento para sua toca e guardou para comer mais tarde." Onde o coelho guardou a cenoura?', opcoes: ['Debaixo da árvore', 'No rio', 'Na toca', 'No caminho'], correta: 'Na toca' },
  { id: 6, pergunta: 'Na frase "O dragão voou rapidamente", a palavra rapidamente é um advérbio. Verdadeiro ou falso?', opcoes: ['Verdadeiro', 'Falso'], correta: 'Verdadeiro' },
  { id: 7, pergunta: '"O cavaleiro protegeu o reino." Quem realiza a ação de proteger?', opcoes: ['O reino', 'O cavaleiro', 'A ação', 'A proteção'], correta: 'O cavaleiro' },
  { id: 8, pergunta: '"Amanhã, a princesa encontrará o tesouro." A ação de encontrar:', opcoes: ['Já aconteceu', 'Está acontecendo', 'Ainda acontecerá', 'Acontece sempre'], correta: 'Ainda acontecerá' },
  { id: 9, pergunta: 'O mago escreveu: "O dragão entrou no castelo" Qual sinal deve ser utilizado para indicar o final de uma frase declarativa?', opcoes: ['?', '!', '.', ':'], correta: '.' },
  { id: 10, pergunta: '"O héroi chegou ao castelo, pegou sua espada e enfrentará o dragão amanhã." Qual palavra está escrita incorretamente?', opcoes: ['héroi', 'castelo', 'espada', 'dragão'], correta: 'héroi' },
  { id: 11, pergunta: 'Um pergaminho dizia: "Não vi quem passou por aqui, mas ouvi passos apressados e encontrei uma pena azul caída no chão." O que o leitor pode inferir?', opcoes: ['Alguém passou pelo local recentemente.', 'A pessoa certamente era um pássaro.', 'A biblioteca estava vazia.', 'O pergaminho estava errado.'], correta: 'Alguém passou pelo local recentemente.' },
  { id: 12, pergunta: 'Uma das estantes começou a tremer. Quando os jogadores retiraram um livro muito pesado que estava apoiado sobre ela, a estante parou. O que causou a estante parar de tremer?', opcoes: ['A chegada dos jogadores.', 'A retirada do livro pesado.', 'O fechamento da porta.', 'O silêncio da biblioteca.'], correta: 'A retirada do livro pesado.' },
  { id: 13, pergunta: '"Atenção, aventureiros! Não toque no livro vermelho. Ele ainda está acordado." Esse texto tem principalmente a finalidade de:', opcoes: ['Contar uma história.', 'Dar uma instrução/alerta.', 'Ensinar uma receita.', 'Fazer uma descrição científica.'], correta: 'Dar uma instrução/alerta.' },
  { id: 14, pergunta: 'Você encontra pistas: "Ouvi um sino. Senti cheiro de madeira antiga. Vi uma grande porta de carvalho." Qual conclusão relaciona melhor as pistas?', opcoes: ['O jogador provavelmente está próximo de uma sala antiga.', 'O sino estava dentro de uma árvore.', 'O cheiro veio do sino.', 'A porta provavelmente é feita de metal.'], correta: 'O jogador provavelmente está próximo de uma sala antiga.' },
  { id: 15, pergunta: 'A palavra "sussurrava" na frase "A floresta sussurrava durante a noite" dá à floresta uma característica humana.', opcoes: ['Verdadeiro', 'Falso'], correta: 'Verdadeiro' },
  { id: 16, pergunta: '"O novo parque da cidade é o lugar mais divertido para passar o fim de semana." Essa frase é um fato ou uma opinião?', opcoes: ['Fato', 'Opinião'], correta: 'Opinião' },
  { id: 17, pergunta: '"Duas pessoas podem observar o mesmo acontecimento e chegar a interpretações diferentes." Verdadeiro ou falso?', opcoes: ['Verdadeiro', 'Falso'], correta: 'Verdadeiro' },
  { id: 18, pergunta: 'Qual frase completa melhor o caminho? "Pedro estudou bastante para a prova. ____ conseguiu uma boa nota."', opcoes: ['Porém', 'Por isso', 'Entretanto', 'Apesar disso'], correta: 'Por isso' },
  { id: 19, pergunta: '"A tese apresenta a ideia central que será defendida em uma argumentação." Verdadeiro ou falso?', opcoes: ['Verdadeiro', 'Falso'], correta: 'Verdadeiro' },
  { id: 20, pergunta: '"A prática de atividades físicas deve ser incentivada entre os jovens." Qual evidência ajudaria mais a fortalecer esse argumento?', opcoes: ['Eu gosto muito de praticar esportes.', 'Meu amigo joga futebol todos os dias.', 'Estudos indicam que a prática regular de atividades físicas está associada a benefícios para a saúde.', 'Esportes são divertidos.'], correta: 'Estudos indicam que a prática regular de atividades físicas está associada a benefícios para a saúde.' },
  { id: 21, pergunta: 'Antes de resolver um problema, organizar as informações disponíveis pode ajudar a identificar o melhor caminho. Verdadeiro ou falso?', opcoes: ['Verdadeiro', 'Falso'], correta: 'Verdadeiro' },
  { id: 22, pergunta: 'Você recebe 5 pistas, mas duas delas são falsas. O que fazer?', opcoes: ['Escolher a primeira pista.', 'Comparar as pistas e procurar informações que confirmem umas às outras.', 'Ignorar todas.', 'Escolher a pista mais divertida.'], correta: 'Comparar as pistas e procurar informações que confirmem umas às outras.' },
  { id: 23, pergunta: 'Dois personagens discordam sobre qual caminho seguir. Isso significa que um deles necessariamente está errado?', opcoes: ['Sim.', 'Não, eles podem estar observando o problema de maneiras diferentes.', 'Sim, porque só pode existir uma opinião.', 'Nenhuma das anteriores.'], correta: 'Não, eles podem estar observando o problema de maneiras diferentes.' },
  { id: 24, pergunta: 'Ouvir uma opinião diferente da sua pode ajudar a perceber algo que você não havia considerado. Verdadeiro ou falso?', opcoes: ['Verdadeiro', 'Falso'], correta: 'Verdadeiro' },
  { id: 25, pergunta: 'Você possui três habilidades: pensar, criar, colaborar. Qual desafio aproveita melhor as três?', opcoes: ['Decorar uma informação.', 'Resolver um problema em equipe criando uma solução.', 'Repetir uma tarefa sozinho.', 'Seguir uma instrução sem questionar.'], correta: 'Resolver um problema em equipe criando uma solução.' },
]

function obterDesafio(faseId) {
  const questao = QUESTOES.find(q => q.id === faseId)
  const opcoesEmbaralhadas = [...questao.opcoes].sort(() => Math.random() - 0.5)
  return { pergunta: questao.pergunta, opcoes: opcoesEmbaralhadas, correta: questao.correta }
}

export default function MundoPortugues() {
  const [avatarSelecionado, setAvatarSelecionado] = useState(null)
  const [faseAtual, setFaseAtual] = useState(1)
  const [introVilaoAberto, setIntroVilaoAberto] = useState(null)
  const [missaoAberta, setMissaoAberta] = useState(null)
  const [desafioAtual, setDesafioAtual] = useState(null)
  
  const [feedback, setFeedback] = useState(null)
  const [mundoDesbloqueado, setMundoDesbloqueado] = useState(null) 
  const [isMuted, setIsMuted] = useState(false)
  
  const [userId, setUserId] = useState(null)
  const [carregandoProgresso, setCarregandoProgresso] = useState(true)

  const containerRef = useRef(null)

  const [tocarClick] = useSound('/click.mp3', { volume: isMuted ? 0 : 0.5 })
  const [tocarAcerto] = useSound('/acerto.mp3', { volume: isMuted ? 0 : 0.7 })
  const [tocarErro] = useSound('/erro.mp3', { volume: isMuted ? 0 : 0.6 })
  const [tocarVilao] = useSound('/magico.mp3', { volume: isMuted ? 0 : 0.8 })
  const [tocarNovaIlha] = useSound('/tesouro.mp3', { volume: isMuted ? 0 : 0.8 })
  const [playBgm, { pause: pauseBgm }] = useSound('/meu-áudio.mp3.mp3', { volume: 0.5, loop: true })

  const toggleMute = () => {
    tocarClick()
    if (isMuted) {
      setIsMuted(false)
      playBgm()
    } else {
      setIsMuted(true)
      pauseBgm()
    }
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
    script.async = true
    document.body.appendChild(script)
    script.onload = carregarProgresso
  }, [])

  async function carregarProgresso() {
    const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      const { data: p } = await supabase.from('perfis').select('fase_portugues').eq('id', user.id).single()
      if (p && p.fase_portugues) {
        setFaseAtual(p.fase_portugues) //
      }
    }
    setCarregandoProgresso(false)
  }

  const mundoAtualIndex = Math.min(4, Math.ceil(faseAtual / 5) - 1)
  const mundoAtivo = MUNDOS[mundoAtualIndex]

  const fasesDoMundo = FASES.filter(f => Math.ceil(f.id / 5) - 1 === mundoAtualIndex)
  const posHeroi = FASES.find(f => f.id === faseAtual)
  const vilaoDoMundo = VILOES_ILHA[mundoAtualIndex]

  const abrirDesafio = (fase) => {
    setDesafioAtual(obterDesafio(fase.id))
    setMissaoAberta(fase)
  }

  const clicarFase = (fase) => {
    if (fase.id > faseAtual) return
    if (fase.id !== faseAtual) return

    tocarClick()

    if (FASES_CHEFAO.includes(fase.id)) {
      tocarVilao()
      setIntroVilaoAberto(fase)
    } else {
      abrirDesafio(fase)
    }
  }

  const continuarAposIntro = () => {
    if (introVilaoAberto) {
      tocarClick()
      abrirDesafio(introVilaoAberto)
      setIntroVilaoAberto(null)
    }
  }

  const tentarResponder = (respostaEscolhida) => {
    if (respostaEscolhida === desafioAtual.correta) {
      tocarAcerto()
      if (faseAtual < 25) {
        setFeedback({ tipo: 'acerto' })
      } else {
        setFeedback({ tipo: 'zerou' })
      }
    } else {
      tocarErro()
      setFeedback({ tipo: 'erro' })
    }
  }

  const fecharFeedback = async () => {
    tocarClick()
    const tipoAtual = feedback.tipo
    setFeedback(null)

    let novaFase = faseAtual

    if (tipoAtual === 'acerto') {
      setMissaoAberta(null) 
      novaFase = faseAtual + 1
      
      if (novaFase <= 25 && (novaFase - 1) % 5 === 0) {
        setMundoDesbloqueado(MUNDOS[Math.ceil(novaFase / 5) - 1])
        tocarNovaIlha()
      }

      setFaseAtual(novaFase) 
    } else if (tipoAtual === 'zerou') {
      setMissaoAberta(null) 
      novaFase = 26 
      setFaseAtual(novaFase) 
    }
    

    if ((tipoAtual === 'acerto' || tipoAtual === 'zerou') && userId) {
       const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
       await supabase.from('perfis').update({ fase_portugues: novaFase }).eq('id', userId)

       try {
         const { data: perfAtual } = await supabase.from('perfis').select('pontuacao').eq('id', userId).single()
         const novosPontos = (perfAtual?.pontuacao || 0) + 10
         await supabase.from('perfis').update({ pontuacao: novosPontos }).eq('id', userId)
       } catch (err) {}
    }
  }

  // ==============================================================
  // ESTRUTURA PRINCIPAL (BLINDADA CONTRA O ESTICAMENTO DO DESKTOP)
  // ==============================================================
  return (
    <div className="fixed inset-0 bg-[#111] flex items-center justify-center p-0 md:p-6 z-50">
      
      {/* Fundo do Céu cobrindo todo o monitor no PC */}
      <img src="/fundo-ceu.png" className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none z-0" alt="Fundo Céu" />

      {/* CAIXA MÁGICA: O celular virtual no centro da tela */}
      <div className="relative z-10 w-full h-full md:w-[420px] md:h-[90vh] md:max-h-[850px] md:rounded-[40px] md:border-[12px] border-[#1A1A1A] overflow-hidden bg-[#7DD3FC] shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col">
        
        {carregandoProgresso ? (
          <div className="absolute inset-0 bg-[#3B82F6] flex flex-col items-center justify-center p-4 z-50">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-white mt-4 italic animate-pulse">Lendo seus mapas...</p>
          </div>
        ) : (!avatarSelecionado && faseAtual <= 25) ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A] via-[#3B82F6] to-[#93C5FD] flex flex-col items-center justify-center p-4 z-50">
            <BookOpen className="absolute top-8 left-6 text-white opacity-20 -rotate-12" size={64} />
            <BookOpen className="absolute bottom-10 right-8 text-white opacity-20 rotate-45" size={80} />

            <div className="relative w-full max-w-sm bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-[30px] shadow-[8px_8px_0px_0px_#FFDE03] p-6 text-center">
              <div className="w-16 h-16 bg-[#3B82F6] rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
                <Compass size={32} className="text-white" />
              </div>

              <h1 className="text-2xl font-black uppercase italic mb-2 text-[#1A1A1A]">
                {faseAtual > 1 ? `De volta à Fase ${faseAtual}!` : 'Escolha seu Guia!'}
              </h1>
              <p className="font-bold text-gray-500 mb-6 flex items-center justify-center gap-1 text-sm">
                <BookOpen size={14} className="text-[#3B82F6]" /> Prepare-se para a leitura! <BookOpen size={14} className="text-[#3B82F6]" />
              </p>

              <div className="grid grid-cols-2 gap-4">
                {AVATARES.map(avatar => (
                  <button 
                    key={avatar.id}
                    onClick={() => {
                      tocarClick()
                      setAvatarSelecionado(avatar)
                      if (!isMuted) playBgm() 
                    }}
                    className="relative flex flex-col items-center gap-2 p-3 bg-white border-4 border-[#1A1A1A] rounded-2xl hover:bg-[#93C5FD] hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#3B82F6] bg-[#F9F6F0] shrink-0">
                      <img src={avatar.img} alt={avatar.nome} className="w-full h-full object-cover object-top" />
                    </div>
                    <span className="font-black text-[10px] uppercase text-[#1A1A1A] text-center">{avatar.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : mundoDesbloqueado ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-50">
            <img src="/fundo-ceu.png" className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" alt="Fundo Céu" />
            <div className="relative z-10 w-full max-w-sm bg-white border-4 border-[#1A1A1A] rounded-[30px] shadow-[8px_8px_0px_0px_#34D399] p-6 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-400 rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-4 shadow-inner animate-bounce">
                <Unlock size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase italic mb-2 text-[#1A1A1A]">Novo Mundo!</h1>
              <p className="font-bold text-gray-600 mb-6 text-base">
                Você desbloqueou uma nova ilha: <br/>
                <span className="text-emerald-500 font-black text-xl uppercase mt-2 block">{mundoDesbloqueado.nome}</span>
              </p>
              <button 
                onClick={() => {
                  tocarClick()
                  setMundoDesbloqueado(null)
                }}
                className="w-full py-3 bg-emerald-500 border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-white text-lg hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_#1A1A1A]"
              >
                Explorar Ilha
              </button>
            </div>
          </div>
        ) : faseAtual > 25 ? (
          <div className="absolute inset-0 bg-[#7DD3FC] flex flex-col z-50">
            <header className="flex-none w-full p-4 flex items-center justify-between z-50 bg-[#1A1A1A] border-b-4 border-black">
              <button onClick={() => window.location.href = '/painel-fundamental'} className="p-2 bg-white border-2 border-[#1A1A1A] rounded-xl font-black uppercase text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:bg-gray-100">
                <ArrowLeft size={16}/> Sair
              </button>
            </header>
            <div className="flex-1 w-full relative flex items-center justify-center p-4 overflow-hidden">
              <img src="/fundo-ceu.png" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-60 pointer-events-none" alt="Fundo Céu" />
              <div className="relative z-10 w-full max-w-sm bg-white border-4 border-[#1A1A1A] rounded-[30px] shadow-[8px_8px_0px_0px_#FFDE03] p-6 text-center animate-in zoom-in duration-500">
                <div className="w-28 h-36 mb-4 drop-shadow-2xl animate-bounce mx-auto">
                  <img src={avatarSelecionado?.img || AVATARES[0].img} alt="Herói" className="w-full h-full object-contain object-bottom" />
                </div>
                <div className="w-16 h-16 bg-[#F59E0B] rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-4 shadow-inner -mt-8">
                  <Trophy size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-black uppercase italic mb-2 text-[#1A1A1A]">Você Venceu!</h1>
                <p className="font-bold text-gray-600 mb-6 text-sm">
                  Mestre das Palavras! Você desbravou os 5 mundos da leitura!
                </p>
                <button onClick={() => window.location.href = '/painel-fundamental'} className="w-full py-3 bg-blue-500 border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-white text-lg hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_#1A1A1A]">
                  Voltar ao Painel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* TELA DE JOGO */}
            <header className="flex-none w-full p-4 flex items-center justify-between z-50 bg-[#1A1A1A] border-b-4 border-black relative">
              <button onClick={() => window.location.href = '/painel-fundamental'} className="p-2 bg-white border-2 border-[#1A1A1A] rounded-xl font-black uppercase text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:bg-gray-100">
                <ArrowLeft size={16}/> Sair
              </button>
              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="p-2 bg-white border-2 border-[#1A1A1A] rounded-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:bg-gray-100 transition-colors">
                  {isMuted ? <VolumeX size={18} className="text-red-500" /> : <Volume2 size={18} className="text-[#3B82F6]" />}
                </button>
                <div className="bg-[#FFDE03] border-2 border-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-2">
                  <span className="font-black uppercase text-xs md:text-sm text-[#1A1A1A]">Fase {faseAtual} / 25</span>
                </div>
              </div>
            </header>

            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative flex flex-col justify-center items-center custom-scrollbar">
              <div className="relative w-full h-max shrink-0">
                <img 
                  src={mundoAtivo.img} 
                  alt={mundoAtivo.nome}
                  className="w-full h-auto block pointer-events-none drop-shadow-2xl"
                />

                <div className="absolute inset-0 w-full h-full pb-10">
                  {fasesDoMundo.map((fase) => {
                    const isBloqueada = fase.id > faseAtual
                    const isAtual = fase.id === faseAtual
                    const isConcluida = fase.id < faseAtual
                    const imgFase = isConcluida ? IMG_BASE_CONCLUIDA : imgBaseFase(fase.id)

                    return (
                      <div 
                        key={fase.id}
                        className="absolute z-10"
                        style={{ left: `${fase.left}%`, bottom: `${fase.bottom}%`, transform: 'translate(-50%, 50%)' }}
                      >
                        {/* BOTÃO "GORDO": padding e margem negativa para aumentar a área de toque invisível */}
                        <div 
                          className="relative flex items-center justify-center p-5 -m-5 cursor-pointer touch-manipulation"
                          onClick={() => clicarFase(fase)}
                        >
                          <img
                            src={imgFase}
                            alt={`Fase ${fase.id}`}
                            className={`object-contain transition-all duration-300 drop-shadow-[0_4px_0_0_rgba(0,0,0,0.3)]
                              ${isBloqueada ? 'opacity-100 grayscale-[40%]' : 'hover:scale-110'}
                              ${isAtual ? 'animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,1)]' : ''}`}
                            style={{ width: '9vw', maxWidth: '60px', height: 'auto' }}
                            draggable={false}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {vilaoDoMundo && faseAtual <= vilaoDoMundo.ateFase && (
                    <img
                      src={vilaoDoMundo.img}
                      alt={`Vilão da ilha ${vilaoDoMundo.ilha}`}
                      className="absolute object-contain object-bottom drop-shadow-2xl pointer-events-none z-10"
                      style={{ 
                        left: `${vilaoDoMundo.left}%`, 
                        bottom: `${vilaoDoMundo.bottom}%`,
                        width: vilaoDoMundo.width, 
                        transform: 'translate(-50%, 0%)' 
                      }}
                    />
                  )}

                  {posHeroi && (
                    <div 
                      className="absolute z-20 pointer-events-none drop-shadow-2xl"
                      style={{ 
                        left: `${posHeroi.left}%`, 
                        bottom: `${posHeroi.bottom}%`, 
                        width: '15%',
                        maxWidth: '60px',
                        transform: 'translate(-10%, 10%)',
                        transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                      }}
                    >
                      <img src={avatarSelecionado.img} alt="Herói" className="w-full h-auto object-contain object-bottom" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* MODAIS (Ficam presos dentro do celular virtual) */}
        {introVilaoAberto && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="bg-white border-4 border-[#1A1A1A] rounded-2xl p-4 mb-2 relative shadow-[6px_6px_0px_0px_#3B82F6] w-full">
                <p className="font-black text-xs text-[#1A1A1A] mb-1 uppercase">{VILAO_INTRO[introVilaoAberto.ilha]?.nome}</p>
                <p className="font-bold text-sm text-[#1A1A1A]">{VILAO_INTRO[introVilaoAberto.ilha]?.fala}</p>
                <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-r-4 border-b-4 border-[#1A1A1A] transform rotate-45"></div>
              </div>
              <img
                src={VILOES_ILHA.find(v => v.ilha === introVilaoAberto.ilha)?.img}
                alt="Guia"
                className="h-56 w-auto object-contain drop-shadow-2xl mb-4"
              />
              <button
                onClick={continuarAposIntro}
                className="px-8 py-3 bg-blue-500 border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-white text-lg hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#1A1A1A]"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {missaoAberta && desafioAtual && !feedback && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-white border-4 border-[#1A1A1A] rounded-[30px] p-5 w-full max-w-sm shadow-[8px_8px_0px_0px_#3B82F6] text-center relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => {
                tocarClick()
                setMissaoAberta(null)
              }} className="absolute top-3 right-3 bg-gray-100 p-2 rounded-full hover:bg-red-400 hover:text-white transition-colors border-2 border-[#1A1A1A]">
                <X size={18} strokeWidth={3}/>
              </button>
              
              <div className={`w-14 h-14 rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-3 shadow-inner ${FASES_CHEFAO.includes(missaoAberta.id) ? 'bg-blue-500' : 'bg-emerald-400'}`}>
                {FASES_CHEFAO.includes(missaoAberta.id) ? <Trophy size={24} className="text-white fill-white" /> : <BookOpen size={24} className="text-white fill-white" />}
              </div>
              
              <h2 className="text-lg font-black uppercase italic mb-1 text-[#1A1A1A] flex items-center justify-center gap-2">
                {FASES_CHEFAO.includes(missaoAberta.id) ? 'Desafio!' : `Fase ${missaoAberta.id}`}
              </h2>
              
              <div className="bg-[#F9F6F0] p-4 rounded-2xl border-4 border-dashed border-[#1A1A1A] mb-3 mt-3 shadow-inner text-left">
                <p className="font-bold text-base text-[#1A1A1A] mb-4 drop-shadow-sm leading-snug">
                  {desafioAtual.pergunta}
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  {desafioAtual.opcoes.map((opcao, index) => (
                    <button 
                      key={index}
                      onClick={() => tentarResponder(opcao)}
                      className="p-3 bg-white border-4 border-[#1A1A1A] rounded-xl font-black text-sm hover:bg-[#93C5FD] hover:-translate-y-1 shadow-[2px_2px_0px_0px_#1A1A1A] transition-all text-left"
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
            <div className={`bg-white border-4 border-[#1A1A1A] rounded-[30px] p-6 w-full max-w-sm text-center relative ${feedback.tipo === 'acerto' ? 'shadow-[8px_8px_0px_0px_#34D399]' : feedback.tipo === 'zerou' ? 'shadow-[8px_8px_0px_0px_#F59E0B]' : 'shadow-[8px_8px_0px_0px_#EF4444]'}`}>
              
              <div className={`w-20 h-20 rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-4 shadow-inner ${feedback.tipo === 'acerto' ? 'bg-emerald-400' : feedback.tipo === 'zerou' ? 'bg-[#F59E0B]' : 'bg-red-500'}`}>
                {feedback.tipo === 'acerto' ? <CheckCircle size={40} className="text-white" /> : feedback.tipo === 'zerou' ? <Trophy size={40} className="text-white" /> : <XCircle size={40} className="text-white" />}
              </div>
              
              <h2 className="text-2xl font-black uppercase italic mb-2 text-[#1A1A1A]">
                {feedback.tipo === 'acerto' ? 'EXCELENTE!' : feedback.tipo === 'zerou' ? 'INCRÍVEL!' : 'OPS!'}
              </h2>
              
              <p className="font-bold text-gray-600 mb-6 text-sm">
                {feedback.tipo === 'acerto' ? 'A resposta está correta! Avance no mapa.' : feedback.tipo === 'zerou' ? 'VOCÊ ZEROU O MAPA!' : 'Resposta incorreta. Leia com atenção e tente de novo.'}
              </p>
              
              <button 
                onClick={fecharFeedback}
                className={`w-full p-3 border-4 border-[#1A1A1A] rounded-xl font-black text-lg hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_#1A1A1A] text-white ${feedback.tipo === 'acerto' || feedback.tipo === 'zerou' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {feedback.tipo === 'acerto' ? 'Continuar' : feedback.tipo === 'zerou' ? 'Finalizar' : 'Tentar Novamente'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}