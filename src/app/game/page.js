'use client'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, X, Trophy, Star, UserCircle2, Leaf, Compass, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react'
import useSound from 'use-sound'

// ==========================================
// 1. DADOS DOS AVATARES
// ==========================================
const AVATARES = [
  { id: 'menina-1', nome: 'Menina Branca', img: '/Menina branca.png' },
  { id: 'menina-2', nome: 'Menina Negra', img: '/Menina negra.png' },
  { id: 'menino-1', nome: 'Menino Branco', img: '/Menino branco.png' },
  { id: 'menino-2', nome: 'Menino Negro', img: '/Menino negro.png' },
]

// ==========================================
// 2. CONFIGURAÇÃO DAS FASES
// ==========================================
const FASES = [
  { id: 1, left: 64, bottom: 10, ilha: 'floresta' },
  { id: 2, left: 63, bottom: 16, ilha: 'floresta' },
  { id: 3, left: 69, bottom: 18, ilha: 'floresta' },
  { id: 4, left: 66, bottom: 22, ilha: 'floresta' },
  { id: 5, left: 68, bottom: 25, ilha: 'floresta' },

  { id: 6, left: 76, bottom: 37, ilha: 'gelo' },
  { id: 7, left: 80, bottom: 41, ilha: 'gelo' },
  { id: 8, left: 71, bottom: 43, ilha: 'gelo' },
  { id: 9, left: 76, bottom: 46, ilha: 'gelo' },
  { id: 10, left: 69, bottom: 49, ilha: 'gelo' },

  { id: 11, left: 61, bottom: 60, ilha: 'deserto' },
  { id: 12, left: 57, bottom: 64, ilha: 'deserto' },
  { id: 13, left: 65, bottom: 66, ilha: 'deserto' },
  { id: 14, left: 60, bottom: 69, ilha: 'deserto' },
  { id: 15, left: 66, bottom: 72, ilha: 'deserto' },

  { id: 16, left: 67, bottom: 84, ilha: 'fogo' },
  { id: 17, left: 70, bottom: 87, ilha: 'fogo' },
  { id: 18, left: 65, bottom: 88, ilha: 'fogo' },
  { id: 19, left: 61, bottom: 89, ilha: 'fogo' },
  { id: 20, left: 63, bottom: 92, ilha: 'fogo', isFinal: true },
]

const VILOES_ILHA = [
  { ilha: 'floresta', img: '/inimigo tropical.png', left: 50, bottom: 24, size: 'h-24 md:h-36', ateFase: 5 },
  { ilha: 'gelo', img: '/inimigo gelo.png', left: 60, bottom: 48, size: 'h-24 md:h-36', ateFase: 10 },
  { ilha: 'deserto', img: '/inimigo velho oeste.png', left: 50, bottom: 72, size: 'h-24 md:h-36', ateFase: 15 },
  { ilha: 'fogo', img: '/Chefe final fogo.png', left: 55, bottom: 90, size: 'h-24 md:h-40', ateFase: 20 },
]

const VILAO_INTRO = {
  floresta: { nome: 'Guardião Tropical', fala: 'Ninguém atravessa minha floresta sem provar seu valor! Resolva o desafio, se for capaz!' },
  gelo: { nome: 'Guardião de Gelo', fala: 'Estas terras congeladas só deixam passar quem souber calcular direito!' },
  deserto: { nome: 'Pistoleiro do Deserto', fala: 'No Velho Oeste, só os mais espertos sobrevivem. Prove seu valor!' },
  fogo: { nome: 'Derivada, a Senhora do Limite', fala: 'Força bruta não funciona aqui. Só a lógica pura vai te levar adiante!' },
}

const imgBaseFase = (id) => `/base ${id}.png`
const IMG_BASE_CONCLUIDA = '/base concluída.png'

const FASES_CHEFAO = [5, 10, 15, 20]

// ==========================================
// 3. BANCO DE QUESTÕES
// ==========================================
const QUESTOES = [
  { id: 1, pergunta: 'Na entrada da floresta, você precisa colher frutas para abrir a porta mágica. Você já tem 14 maçãs e encontra mais 23 caídas no chão. Quantas maçãs você tem no total?', opcoes: ['35', '37', '47', '38'], correta: '37' },
  { id: 2, pergunta: 'Para atravessar uma ponte de cipó, seu personagem tinha 48 moedas de ouro, mas perdeu 15 ao desviar de um obstáculo. Com quantas moedas ele ficou?', opcoes: ['33', '23', '35', '43'], correta: '33' },
  { id: 3, pergunta: 'Você encontrou 4 baús antigos. Cada baú guarda exatamente 8 poções mágicas de cura. Quantas poções você coletou ao todo?', opcoes: ['24', '30', '32', '36'], correta: '32' },
  { id: 4, pergunta: 'Um grupo de 5 heróis da sua equipe precisa dividir igualmente um tesouro de 45 cristais de energia encontrados na floresta. Com quantos cristais cada um fica?', opcoes: ['7', '8', '9', '10'], correta: '9' },
  { id: 5, pergunta: 'Ao entrar na vila dos duendes, você compra 3 espadas de 10 moedas cada, ganha um desconto de 5 moedas no total, e depois paga uma taxa de 2 moedas. O cálculo é: 3 x 10 - 5 + 2. Qual é o valor final pago?', opcoes: ['25', '27', '30', '23'], correta: '27' },
  { id: 6, pergunta: 'Um clã de dragões de gelo possui 1.342 cristais guardados, e você precisa juntar mais 879 cristais para forjar uma armadura. Quantos cristais o clã terá ao todo?', opcoes: ['2.111', '2.221', '2.121', '2.211'], correta: '2.221' },
  { id: 7, pergunta: 'Dois portais mágicos se acendem no templo de gelo: o portal azul a cada 6 minutos e o portal roxo a cada 8 minutos. Se eles acenderam juntos agora, daqui a quantos minutos voltarão a acender juntos pela primeira vez?', opcoes: ['12 minutos', '18 minutos', '24 minutos', '48 minutos'], correta: '24 minutos' },
  { id: 8, pergunta: 'Você encontrou uma barra de chocolate mágica dividida em 8 pedaços iguais. Você comeu 3 pedaços e seu companheiro comeu 2. Que fração da barra foi consumida no total?', opcoes: ['5/8', '3/8', '1/2', '5/16'], correta: '5/8' },
  { id: 9, pergunta: 'Na lojinha do iglu, uma poção de resistência custa R$ 12,50 e um escudo de gelo custa R$ 18,75. Se você pagar a compra com uma nota de R$ 50,00, quanto receberá de troco?', opcoes: ['R$ 18,75', 'R$ 19,25', 'R$ 31,25', 'R$ 38,50'], correta: 'R$ 18,75' },
  { id: 10, pergunta: 'Um feitiço raro de proteção custa 200 moedas de ouro na cidade do gelo. Devido a uma brisa mágica, a loja aplicou um desconto de 25%. Quanto você vai pagar pelo feitiço?', opcoes: ['150 moedas', '175 moedas', '125 moedas', '160 moedas'], correta: '150 moedas' },
  { id: 11, pergunta: 'Para encher um jarro no deserto, você despeja 1/2 litro de água de um cantil e depois mais 1/4 de litro de outro. Qual é o volume total de água no jarro?', opcoes: ['3/8 litros', '2/6 litros', '3/4 litros', '1/6 litros'], correta: '3/4 litros' },
  { id: 12, pergunta: 'Um mercador do deserto troca 3 jarros de água por 15 punhados de especiarias. Se você possui 12 jarros de água, quantos punhados de especiarias conseguirá obter?', opcoes: ['45 punhados', '50 punhados', '60 punhados', '75 punhados'], correta: '60 punhados' },
  { id: 13, pergunta: 'O enigma da esfinge diz: "O triplo dos meus anos de guardião somado a 5 resulta em 35 anos". Qual é a idade (x) do guardião?', opcoes: ['8 anos', '10 anos', '12 anos', '15 anos'], correta: '10 anos' },
  { id: 14, pergunta: 'Para abrir a porta da tumba secreta, você precisa resolver a combinação mística: "raiz quadrada de 144 mais 5 elevado a 2". Qual é o resultado correto?', opcoes: ['37', '39', '49', '29'], correta: '37' },
  { id: 15, pergunta: 'Você precisa cercar um acampamento em forma de retângulo que mede 12 metros de comprimento por 8 metros de largura. Quantos metros de cerca serão necessários para contornar todo o acampamento?', opcoes: ['40 metros', '96 metros', '20 metros', '48 metros'], correta: '40 metros' },
  { id: 16, pergunta: 'Para atravessar o rio de lava, as pedras possuem números. Você pisa na primeira, depois na segunda, e assim por diante. A sequência é: 1, 3, 6, 10, 15... Qual deve ser o número da próxima pedra para você não cair na lava?', opcoes: ['18', '20', '21', '25'], correta: '21' },
  { id: 17, pergunta: 'Derivada apresenta três baús: um contém a Chave do Vulcão, os outros estão vazios. Apenas um dos guardas falou a verdade — Guarda A: "A chave está no baú 1." Guarda B: "A chave não está no baú 1." Guarda C: "A chave não está no baú 2." Se apenas um deles disse a verdade, onde está a chave?', opcoes: ['No baú 1', 'No baú 2', 'No baú 3', 'Impossível saber'], correta: 'No baú 2' },
  { id: 18, pergunta: 'Para chegar ao altar de Derivada, existem 4 bifurcações no caminho. Em cada bifurcação, você deve escolher entre seguir pelo lado Esquerdo ou Direito. Quantos caminhos diferentes você pode percorrer até chegar ao final?', opcoes: ['8', '12', '16', '32'], correta: '16' },
  { id: 19, pergunta: 'Você encontra um dado mágico de pedra vulcânica no chão. Em um dado comum, a soma das faces opostas é sempre 7. Se você olha para o dado e vê as faces 1, 2 e 3 se encontrando no vértice superior, qual número está na face oposta ao 2?', opcoes: ['4', '5', '6', '1'], correta: '5' },
  { id: 20, pergunta: 'A lava do vulcão entra em erupção em ciclos. Ela entra em erupção hoje (quarta-feira) e o ciclo de atividade completa é de exatos 8 dias. Se você precisa passar pela ponte exatamente no dia da próxima erupção, que dia da semana será?', opcoes: ['Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Segunda-feira'], correta: 'Quinta-feira' },
]

function obterDesafio(faseId) {
  const questao = QUESTOES.find(q => q.id === faseId)
  const opcoesEmbaralhadas = [...questao.opcoes].sort(() => Math.random() - 0.5)
  return { pergunta: questao.pergunta, opcoes: opcoesEmbaralhadas, correta: questao.correta }
}

export default function MundoMatematica() {
  const [avatarSelecionado, setAvatarSelecionado] = useState(null)
  const [faseAtual, setFaseAtual] = useState(1)
  const [introVilaoAberto, setIntroVilaoAberto] = useState(null)
  const [missaoAberta, setMissaoAberta] = useState(null)
  const [desafioAtual, setDesafioAtual] = useState(null)
  
  const [feedback, setFeedback] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  
  // NOVOS ESTADOS PARA O BANCO DE DADOS
  const [userId, setUserId] = useState(null)
  const [carregandoProgresso, setCarregandoProgresso] = useState(true)

  const containerRef = useRef(null)

  const [tocarClick] = useSound('/click.mp3', { volume: isMuted ? 0 : 0.5 })
  const [tocarAcerto] = useSound('/acerto.mp3', { volume: isMuted ? 0 : 0.7 })
  const [tocarErro] = useSound('/erro.mp3', { volume: isMuted ? 0 : 0.6 })
  const [playBgm, { pause: pauseBgm }] = useSound('/lofi.mp3', { volume: 0.2, loop: true })
  const [tocarVilao] = useSound('/vilao.mp3', { volume: isMuted ? 0 : 0.8 })

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

  // ==========================================
  // INJETANDO O SUPABASE PARA CARREGAR O PROGRESSO
  // ==========================================
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
      const { data: p } = await supabase.from('perfis').select('fase_saga').eq('id', user.id).single()
      if (p && p.fase_saga) {
        setFaseAtual(p.fase_saga)
      }
    }
    setCarregandoProgresso(false)
  }

  useEffect(() => {
    if (avatarSelecionado && containerRef.current) {
      setTimeout(() => {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }, 100);
    }
  }, [avatarSelecionado])
  
  const posHeroi = FASES.find(f => f.id === faseAtual)

  const abrirDesafio = (fase) => {
    setDesafioAtual(obterDesafio(fase.id))
    setMissaoAberta(fase)
  }

  const clicarFase = (fase) => {
    if (fase.id > faseAtual) return
    if (fase.id !== faseAtual) return

    tocarClick()

    if (FASES_CHEFAO.includes(fase.id)) {
      tocarVilao() // <--- SÓ ADICIONAR ESSA LINHA AQUI!
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
      if (faseAtual < 20) {
        setFeedback({ tipo: 'acerto' })
      } else {
        setFeedback({ tipo: 'zerou' })
      }
    } else {
      tocarErro()
      setFeedback({ tipo: 'erro' })
    }
  }

  // ==========================================
  // SALVANDO A FASE E DANDO PONTOS NO BANCO
  // ==========================================
  const fecharFeedback = async () => {
    tocarClick()
    const tipoAtual = feedback.tipo
    setFeedback(null)

    let novaFase = faseAtual

    if (tipoAtual === 'acerto') {
      setMissaoAberta(null) 
      novaFase = faseAtual + 1
      setFaseAtual(novaFase) 
    } else if (tipoAtual === 'zerou') {
      setMissaoAberta(null) 
      novaFase = 21 // 21 significa jogo zerado
      setFaseAtual(novaFase) 
    }

    // Se acertou, salva no banco e aumenta os pontos no ranking
    if ((tipoAtual === 'acerto' || tipoAtual === 'zerou') && userId) {
       const supabase = window.supabase.createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
       
       // 1. Atualiza a fase no perfil
       await supabase.from('perfis').update({ fase_saga: novaFase }).eq('id', userId)

       // 2. Dá 10 pontos automáticos pro Ranking
       try {
         const { data: perfAtual } = await supabase.from('perfis').select('pontuacao').eq('id', userId).single()
         const novosPontos = (perfAtual?.pontuacao || 0) + 10
         await supabase.from('perfis').update({ pontuacao: novosPontos }).eq('id', userId)
       } catch (err) {}
    }
  }

  // TELA DE CARREGAMENTO (Enquanto busca a fase no banco)
  if (carregandoProgresso) {
    return (
      <div className="fixed inset-0 bg-[#1B4332] flex flex-col items-center justify-center p-4 z-50">
        <div className="w-12 h-12 border-4 border-[#FFDE03] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-white mt-4 italic animate-pulse">Lendo seu mapa de progresso...</p>
      </div>
    )
  }

  // TELA 1: SELEÇÃO DE AVATAR
  if (!avatarSelecionado && faseAtual <= 20) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1B4332] via-[#2D6A4F] to-[#52B788] flex flex-col items-center justify-center p-4 z-50 overflow-hidden">
        <Leaf className="absolute top-8 left-6 text-[#95D5B2] opacity-40 -rotate-12" size={48} />
        <Leaf className="absolute bottom-10 right-8 text-[#95D5B2] opacity-30 rotate-45" size={64} />
        <Leaf className="absolute top-1/3 right-10 text-[#B7E4C7] opacity-30 rotate-90" size={36} />
        <Leaf className="absolute bottom-1/4 left-10 text-[#B7E4C7] opacity-20 -rotate-45" size={40} />

        <div className="relative w-full max-w-lg bg-[#F9F6F0] border-4 border-[#1A1A1A] rounded-[30px] shadow-[8px_8px_0px_0px_#FFDE03] p-8 text-center">
          
          <div className="w-20 h-20 bg-[#40916C] rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
            <Compass size={40} className="text-white" />
          </div>

          <h1 className="text-3xl font-black uppercase italic mb-2 text-[#1A1A1A]">
            {faseAtual > 1 ? `Bem-vindo de volta à Fase ${faseAtual}!` : 'Quem é Você?'}
          </h1>
          <p className="font-bold text-gray-500 mb-8 flex items-center justify-center gap-1">
            <Leaf size={14} className="text-[#40916C]" /> Escolha seu herói explorador! <Leaf size={14} className="text-[#40916C]" />
          </p>

          <div className="grid grid-cols-2 gap-5">
            {AVATARES.map(avatar => (
              <button 
                key={avatar.id}
                onClick={() => {
                  tocarClick()
                  setAvatarSelecionado(avatar)
                  if (!isMuted) playBgm() 
                }}
                className="relative flex flex-col items-center gap-2 p-4 bg-white border-4 border-[#1A1A1A] rounded-2xl hover:bg-[#D8F3DC] hover:scale-105 transition-all shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              >
                <Leaf size={16} className="absolute -top-2 -right-2 text-[#40916C] bg-white rounded-full p-0.5 border-2 border-[#1A1A1A] rotate-12" />
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-[#40916C] bg-[#F9F6F0] shrink-0">
                <img src={avatar.img} alt={avatar.nome} className="w-full h-full object-cover object-top" />
                </div>
                <span className="font-black text-xs uppercase text-[#1A1A1A]">{avatar.nome.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // TELA DE VITÓRIA (QUANDO FASEATUAL PASSA DA 20)
  if (faseAtual > 20) {
    return (
      <div className="fixed inset-0 bg-[#111] flex flex-col">
        <header className="flex-none w-full p-4 flex items-center justify-between z-50 bg-[#1A1A1A] border-b-4 border-black">
          <button onClick={() => window.location.href = '/painel-fundamental'} className="p-2 bg-white border-2 border-[#1A1A1A] rounded-xl font-black uppercase text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:bg-gray-100">
            <ArrowLeft size={16}/> Sair
          </button>
        </header>

        <div className="flex-1 w-full relative flex items-center justify-center p-4 overflow-hidden bg-sky-200">
          <img src="/mapa-oficial.PNG" className="absolute inset-0 w-full h-full object-cover blur-sm opacity-60 pointer-events-none" alt="Mapa Concluído" />
          
          <div className="relative z-10 w-full max-w-md bg-white border-4 border-[#1A1A1A] rounded-[30px] shadow-[8px_8px_0px_0px_#FFDE03] p-6 md:p-8 text-center flex flex-col items-center animate-in zoom-in duration-500">
            
            <div className="w-32 h-40 mb-4 drop-shadow-2xl animate-bounce">
              <img src={avatarSelecionado?.img || AVATARES[0].img} alt="Herói" className="w-full h-full object-contain object-bottom" />
            </div>

            <div className="w-20 h-20 bg-[#F59E0B] rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-4 shadow-inner -mt-10">
              <Trophy size={40} className="text-white" />
            </div>

            <h1 className="text-3xl font-black uppercase italic mb-2 text-[#1A1A1A]">Você Venceu!</h1>
            <p className="font-bold text-gray-600 mb-8 text-base md:text-lg">
              Parabéns, aventureiro(a)! Você derrotou todos os guardiões, resolveu todos os enigmas e finalizou a Saga da Matemática. Seu progresso já está salvo no seu perfil!
            </p>

            <button onClick={() => window.location.href = '/painel-fundamental'} className="w-full py-4 bg-emerald-500 border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-white text-xl hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_#1A1A1A]">
              Voltar ao Painel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // TELA 2: O JOGO
  return (
    <div className="fixed inset-0 bg-[#111] flex flex-col">
      
      <header className="flex-none w-full p-4 flex items-center justify-between z-50 bg-[#1A1A1A] border-b-4 border-black">
        <button onClick={() => window.location.href = '/painel-fundamental'} className="p-2 bg-white border-2 border-[#1A1A1A] rounded-xl font-black uppercase text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:bg-gray-100">
          <ArrowLeft size={16}/> Sair
        </button>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="p-2 bg-white border-2 border-[#1A1A1A] rounded-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:bg-gray-100 transition-colors">
            {isMuted ? <VolumeX size={18} className="text-red-500" /> : <Volume2 size={18} className="text-[#40916C]" />}
          </button>
          
          <div className="bg-[#FFDE03] border-2 border-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-2">
            <span className="font-black uppercase text-xs md:text-sm text-[#1A1A1A]">Fase {faseAtual} / 20</span>
          </div>
        </div>
      </header>

      <div ref={containerRef} className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-sky-200 scroll-smooth">
        
        <div className="relative w-full max-w-[700px] mx-auto">
          
          <img 
            src="/mapa-oficial.PNG" 
            alt="Mapa do Mundo"
            className="w-full h-auto block pointer-events-none"
          />

          <div className="absolute inset-0 w-full h-full">
            {FASES.map((fase) => {
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
                  <img
                    src={imgFase}
                    alt={`Fase ${fase.id}`}
                    onClick={() => clicarFase(fase)}
                    className={`cursor-pointer object-contain transition-all duration-300 drop-shadow-[0_4px_0_0_rgba(0,0,0,0.3)]
                      ${isBloqueada ? 'opacity-100 grayscale-[40%]' : 'hover:scale-110'}
                      ${isAtual ? 'animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,1)]' : ''}`}
                    style={{ width: '14%', height: 'auto' }}
                    draggable={false}
                  />
                </div>
              )
            })}

            {VILOES_ILHA.map((vilao) => {
              const jaDerrotado = faseAtual > vilao.ateFase
              if (jaDerrotado) return null
              return (
                <img
                  key={vilao.ilha}
                  src={vilao.img}
                  alt={`Vilão da ilha ${vilao.ilha}`}
                  className={`absolute w-auto object-contain object-bottom drop-shadow-2xl pointer-events-none z-10 ${vilao.size}`}
                  style={{ 
                    left: `${vilao.left}%`, 
                    bottom: `${vilao.bottom}%`, 
                    transform: 'translate(-50%, 0%)' 
                  }}
                />
              )
            })}

            {posHeroi && (
              <div 
                className="absolute z-20 pointer-events-none drop-shadow-2xl"
                style={{ 
                  left: `${posHeroi.left}%`, 
                  bottom: `${posHeroi.bottom}%`, 
                  width: '10%',
                  transform: 'translate(-140%, 20%)',
                  transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                }}
              >
                <img src={avatarSelecionado.img} alt="Herói" className="w-full h-auto object-contain object-bottom" />
              </div>
            )}
          </div>
        </div>
      </div>

      {introVilaoAberto && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-md flex flex-col items-center">
            
            <div className="bg-white border-4 border-[#1A1A1A] rounded-2xl p-4 mb-2 relative shadow-[6px_6px_0px_0px_#FFDE03] w-full">
              <p className="font-black text-sm text-[#1A1A1A] mb-1 uppercase">{VILAO_INTRO[introVilaoAberto.ilha]?.nome}</p>
              <p className="font-bold text-[#1A1A1A]">{VILAO_INTRO[introVilaoAberto.ilha]?.fala}</p>
              <div className="absolute -bottom-3 left-10 w-6 h-6 bg-white border-r-4 border-b-4 border-[#1A1A1A] transform rotate-45"></div>
            </div>

            <img
              src={VILOES_ILHA.find(v => v.ilha === introVilaoAberto.ilha)?.img}
              alt="Vilão"
              className="h-64 md:h-80 w-auto object-contain drop-shadow-2xl mb-4"
            />

            <button
              onClick={continuarAposIntro}
              className="px-8 py-3 bg-red-500 border-4 border-[#1A1A1A] rounded-2xl font-black uppercase text-white text-lg hover:bg-red-600 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#1A1A1A]"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {missaoAberta && desafioAtual && !feedback && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white border-4 border-[#1A1A1A] rounded-[30px] p-6 w-full max-w-lg shadow-[8px_8px_0px_0px_#FFDE03] text-center relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => {
              tocarClick()
              setMissaoAberta(null)
            }} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-red-400 hover:text-white transition-colors border-2 border-[#1A1A1A]">
              <X size={20} strokeWidth={3}/>
            </button>
            
            <div className={`w-16 h-16 rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-4 shadow-inner ${FASES_CHEFAO.includes(missaoAberta.id) ? 'bg-red-500' : 'bg-[#40916C]'}`}>
              {FASES_CHEFAO.includes(missaoAberta.id) ? <Trophy size={30} className="text-white fill-white" /> : <Leaf size={30} className="text-white fill-white" />}
            </div>
            
            <h2 className="text-xl font-black uppercase italic mb-1 text-[#1A1A1A] flex items-center justify-center gap-2">
              {FASES_CHEFAO.includes(missaoAberta.id) ? 'Enigma do Chefão!' : `Fase ${missaoAberta.id}`}
            </h2>
            
            <div className="bg-[#F9F6F0] p-5 rounded-2xl border-4 border-dashed border-[#1A1A1A] mb-4 mt-4 shadow-inner text-left">
              <p className="font-bold text-lg md:text-xl text-[#1A1A1A] mb-6 drop-shadow-sm leading-snug">
                {desafioAtual.pergunta}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {desafioAtual.opcoes.map((opcao, index) => (
                  <button 
                    key={index}
                    onClick={() => tentarResponder(opcao)}
                    className="p-4 bg-white border-4 border-[#1A1A1A] rounded-xl font-black text-lg md:text-2xl hover:bg-[#70E0BB] hover:-translate-y-1 shadow-[2px_2px_0px_0px_#1A1A1A] transition-all"
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
          <div className={`bg-white border-4 border-[#1A1A1A] rounded-[30px] p-8 w-full max-w-sm text-center relative ${feedback.tipo === 'acerto' ? 'shadow-[8px_8px_0px_0px_#34D399]' : feedback.tipo === 'zerou' ? 'shadow-[8px_8px_0px_0px_#F59E0B]' : 'shadow-[8px_8px_0px_0px_#EF4444]'}`}>
            
            <div className={`w-24 h-24 rounded-full border-4 border-[#1A1A1A] mx-auto flex items-center justify-center mb-6 shadow-inner ${feedback.tipo === 'acerto' ? 'bg-emerald-400' : feedback.tipo === 'zerou' ? 'bg-[#F59E0B]' : 'bg-red-500'}`}>
              {feedback.tipo === 'acerto' ? <CheckCircle size={48} className="text-white" /> : feedback.tipo === 'zerou' ? <Trophy size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
            </div>
            
            <h2 className="text-3xl font-black uppercase italic mb-3 text-[#1A1A1A]">
              {feedback.tipo === 'acerto' ? 'EXCELENTE!' : feedback.tipo === 'zerou' ? 'INCRÍVEL!' : 'OPS!'}
            </h2>
            
            <p className="font-bold text-gray-600 mb-8 text-lg">
              {feedback.tipo === 'acerto' ? 'A resposta está correta! Você avançou no mapa.' : feedback.tipo === 'zerou' ? 'VOCÊ ZEROU A SAGA DA MATEMÁTICA!' : 'Resposta incorreta. Leia o problema e tente calcular novamente.'}
            </p>
            
            <button 
              onClick={fecharFeedback}
              className={`w-full p-4 border-4 border-[#1A1A1A] rounded-xl font-black text-xl hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_#1A1A1A] text-white ${feedback.tipo === 'acerto' || feedback.tipo === 'zerou' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {feedback.tipo === 'acerto' ? 'Continuar' : feedback.tipo === 'zerou' ? 'Finalizar' : 'Tentar Novamente'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}