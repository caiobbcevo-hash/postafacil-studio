import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  Eye,
  FileText,
  Filter,
  Gauge,
  Instagram,
  Layers3,
  LayoutDashboard,
  Link2,
  ListFilter,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  Music2,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Users2,
  Video,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewKey =
  | "dashboard"
  | "empresa"
  | "criador"
  | "biblioteca"
  | "calendario"
  | "integracoes"
  | "seguranca"
  | "configuracoes";

type ContentStatus =
  | "rascunho"
  | "aguardando"
  | "aprovado"
  | "agendado"
  | "publicado"
  | "falhou";

type ContentItem = {
  id: number;
  title: string;
  type: "Reel" | "Carrossel" | "Story";
  client: string;
  date: string;
  status: ContentStatus;
  duration?: string;
};

type NavItem = {
  label: string;
  route: string;
  view: ViewKey;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Painel geral", route: "/", view: "dashboard", icon: LayoutDashboard },
  { label: "Empresas", route: "/empresa", view: "empresa", icon: Store },
  { label: "Criar Reel", route: "/criador", view: "criador", icon: WandSparkles },
  { label: "Biblioteca", route: "/biblioteca", view: "biblioteca", icon: Layers3 },
  { label: "Calendário", route: "/calendario", view: "calendario", icon: CalendarDays },
  { label: "Integrações", route: "/integracoes", view: "integracoes", icon: Link2 },
  { label: "Segurança e uso", route: "/seguranca", view: "seguranca", icon: ShieldCheck },
  { label: "Configurações", route: "/configuracoes", view: "configuracoes", icon: Settings2 },
];

const contents: ContentItem[] = [
  { id: 1, title: "3 cuidados com a pele no verão", type: "Reel", client: "Lumiê Estética", date: "Hoje, 16:30", status: "aguardando", duration: "00:28" },
  { id: 2, title: "Antes e depois: limpeza de pele", type: "Reel", client: "Lumiê Estética", date: "Amanhã, 09:00", status: "agendado", duration: "00:34" },
  { id: 3, title: "Guia de presentes corporativos", type: "Carrossel", client: "Norte & Sul", date: "18 out", status: "rascunho" },
  { id: 4, title: "Bastidores da nova coleção", type: "Story", client: "Norte & Sul", date: "19 out", status: "aprovado" },
  { id: 5, title: "Como escolher seu kit", type: "Reel", client: "Lumiê Estética", date: "16 out", status: "publicado", duration: "00:22" },
  { id: 6, title: "Oferta de lançamento", type: "Reel", client: "Casa Amora", date: "15 out", status: "falhou", duration: "00:31" },
];

const statusLabels: Record<ContentStatus, string> = {
  rascunho: "Rascunho",
  aguardando: "Aguardando aprovação",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
  falhou: "Falhou",
};

const statusClass: Record<ContentStatus, string> = {
  rascunho: "status-neutral",
  aguardando: "status-warning",
  aprovado: "status-success",
  agendado: "status-blue",
  publicado: "status-purple",
  falhou: "status-danger",
};

const routeToView = (path: string): ViewKey => {
  if (path.startsWith("/empresa")) return "empresa";
  if (path.startsWith("/criador")) return "criador";
  if (path.startsWith("/biblioteca")) return "biblioteca";
  if (path.startsWith("/calendario")) return "calendario";
  if (path.startsWith("/integracoes")) return "integracoes";
  if (path.startsWith("/seguranca")) return "seguranca";
  if (path.startsWith("/configuracoes")) return "configuracoes";
  return "dashboard";
};

function StatusPill({ status }: { status: ContentStatus }) {
  return <span className={`status-pill ${statusClass[status]}`}>{statusLabels[status]}</span>;
}

function SectionIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="section-intro">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="section-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`demo-notice ${compact ? "demo-notice-compact" : ""}`}>
      <div className="demo-notice-icon"><Sparkles size={16} /></div>
      <div>
        <strong>Você está no modo demonstração</strong>
        <span>{compact ? "Dados e ações são locais. Nenhuma API ou rede social está conectada." : "Este ambiente mostra a experiência do produto com dados fictícios. Conexões, autenticação, filas e publicação real ainda precisam ser implementadas no servidor."}</span>
      </div>
      {!compact && <button className="notice-close" aria-label="Fechar aviso"><X size={15} /></button>}
    </div>
  );
}

function MetricCard({ label, value, helper, icon: Icon, accent }: { label: string; value: string; helper: string; icon: LucideIcon; accent: string }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${accent}`}><Icon size={18} /></div>
      <div className="metric-content"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>
    </div>
  );
}

function Dashboard({ go }: { go: (route: string) => void }) {
  return (
    <>
      <SectionIntro
        eyebrow="Visão do estúdio"
        title="Bom dia, Caio"
        description="Acompanhe o que está acontecendo com seus clientes e escolha o próximo passo."
        action={<Button className="primary-action" onClick={() => go("/criador")}><Plus size={17} /> Criar conteúdo</Button>}
      />
      <DemoNotice />
      <div className="client-switcher-row">
        <div className="client-switcher">
          <div className="avatar avatar-lilac">LE</div>
          <div><span>Empresa ativa</span><strong>Lumiê Estética</strong></div>
          <ChevronDown size={16} />
        </div>
        <button className="text-button" onClick={() => go("/empresa")}><Settings2 size={15} /> Editar empresa</button>
      </div>
      <div className="metrics-grid">
        <MetricCard label="Conteúdos no mês" value="18" helper="+4 em relação a setembro" icon={FileText} accent="accent-coral" />
        <MetricCard label="Aguardando aprovação" value="03" helper="Revisão recomendada hoje" icon={Clock3} accent="accent-amber" />
        <MetricCard label="Integrações ativas" value="0 / 6" helper="Conexões ainda não configuradas" icon={Link2} accent="accent-purple" />
        <MetricCard label="Uso estimado" value="R$ 48,20" helper="De um limite de R$ 150,00" icon={Gauge} accent="accent-teal" />
      </div>
      <div className="dashboard-grid">
        <section className="panel next-content-panel">
          <div className="panel-heading"><div><span className="eyebrow">Fila de conteúdo</span><h2>Próximos conteúdos</h2></div><button className="text-button" onClick={() => go("/biblioteca")}>Ver biblioteca <ArrowRight size={15} /></button></div>
          <div className="content-list">
            {contents.slice(0, 4).map(item => <ContentRow key={item.id} item={item} />)}
          </div>
        </section>
        <section className="panel integration-panel">
          <div className="panel-heading"><div><span className="eyebrow">Saúde do ambiente</span><h2>Integrações</h2></div><button className="icon-button" onClick={() => go("/integracoes")} aria-label="Abrir integrações"><ArrowRight size={16} /></button></div>
          <div className="integration-summary"><div className="ring-progress"><span>0%</span></div><div><strong>Nenhuma conectada</strong><p>Configure uma conexão quando quiser testar o fluxo real.</p></div></div>
          <div className="integration-mini-list"><IntegrationMini icon={MessageSquareText} name="Texto / roteiro" /><IntegrationMini icon={Video} name="Vídeo" /><IntegrationMini icon={Instagram} name="Meta / Instagram" /></div>
          <button className="soft-action" onClick={() => go("/integracoes")}><Link2 size={15} /> Ver área de integrações</button>
        </section>
      </div>
      <section className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">Operação</span><h2>Atividade recente</h2></div><span className="live-label"><i /> Dados locais</span></div><div className="activity-list"><ActivityItem icon={CheckCircle2} title="Roteiro salvo como rascunho" detail="3 cuidados com a pele no verão · há 12 min" tone="success" /><ActivityItem icon={AlertTriangle} title="Publicação ainda não configurada" detail="Meta / Instagram · precisa de OAuth oficial" tone="warning" /><ActivityItem icon={ShieldCheck} title="Limite de custo definido" detail="Lumiê Estética · R$ 150,00 / mês" tone="purple" /></div></section>
    </>
  );
}

function ContentRow({ item }: { item: ContentItem }) {
  return <div className="content-row"><div className={`content-thumb thumb-${item.type.toLowerCase()}`}>{item.type === "Reel" ? <Video size={19} /> : item.type === "Carrossel" ? <Layers3 size={19} /> : <Instagram size={19} />}<span>{item.type}</span></div><div className="content-row-main"><strong>{item.title}</strong><span>{item.client} · {item.date}{item.duration ? ` · ${item.duration}` : ""}</span></div><StatusPill status={item.status} /><button className="row-more" aria-label={`Mais opções para ${item.title}`}><MoreHorizontal size={17} /></button></div>;
}

function IntegrationMini({ icon: Icon, name }: { icon: LucideIcon; name: string }) {
  return <div className="integration-mini"><div className="integration-mini-icon"><Icon size={16} /></div><span>{name}</span><b>Não conectado</b></div>;
}

function ActivityItem({ icon: Icon, title, detail, tone }: { icon: LucideIcon; title: string; detail: string; tone: string }) {
  return <div className="activity-item"><div className={`activity-icon ${tone}`}><Icon size={16} /></div><div><strong>{title}</strong><span>{detail}</span></div><span className="activity-time">agora</span></div>;
}

function Empresa() {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("Lumiê Estética");
  const [segment, setSegment] = useState("Estética e bem-estar");
  return <>
    <SectionIntro eyebrow="Clientes" title="Perfil da empresa" description="Cada empresa tem seu próprio contexto para orientar o conteúdo e manter a comunicação consistente." action={<Button className="primary-action" onClick={() => { setSaved(true); toast.success("Alteração salva apenas nesta demonstração"); }}><Save size={16} /> {saved ? "Salvo localmente" : "Salvar alterações"}</Button>} />
    <div className="profile-layout">
      <aside className="profile-aside panel"><div className="profile-logo">LE</div><h2>{name}</h2><p>{segment}</p><span className="profile-active"><i /> Cliente ativo</span><div className="profile-aside-divider" /><button className="profile-tab active"><Store size={16} /> Dados da empresa</button><button className="profile-tab"><Palette size={16} /> Identidade visual</button><button className="profile-tab"><Link2 size={16} /> Links e canais</button></aside>
      <section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">Contexto da marca</span><h2>Informações principais</h2></div><span className="draft-label">Edição local</span></div><div className="form-grid"><label>Nome da empresa<input value={name} onChange={e => setName(e.target.value)} /></label><label>Segmento<input value={segment} onChange={e => setSegment(e.target.value)} /></label><label className="field-span-2">Produtos e serviços<textarea defaultValue="Limpeza de pele, skincare personalizado e tratamentos faciais." /></label><label>Público-alvo<input defaultValue="Mulheres de 25 a 45 anos, que buscam autocuidado." /></label><label>Tom de voz<select defaultValue="Acolhedor e didático"><option>Acolhedor e didático</option><option>Direto e energético</option><option>Premium e sofisticado</option></select></label><label className="field-span-2">Diretrizes de comunicação<textarea defaultValue="Evitar promessas absolutas. Explicar os cuidados de forma simples e responsável." /></label></div><div className="form-section"><div><span className="eyebrow">Identidade visual</span><h3>Cores da marca</h3></div><div className="color-fields"><div className="color-chip"><span style={{ background: "#E9B7A8" }} /> <input defaultValue="#E9B7A8" /></div><div className="color-chip"><span style={{ background: "#27333A" }} /> <input defaultValue="#27333A" /></div><div className="color-chip"><span style={{ background: "#F7F2EC" }} /> <input defaultValue="#F7F2EC" /></div><button className="add-color" aria-label="Adicionar cor"><Plus size={16} /></button></div></div><div className="form-section logo-upload"><div className="upload-mark"><Store size={20} /></div><div><strong>Logo da empresa</strong><p>SVG ou PNG, até 2 MB. O upload real será implementado no servidor.</p></div><Button variant="outline" size="sm" onClick={() => toast("Upload ainda não implementado", { description: "Esta ação é apenas visual no protótipo." })}>Escolher arquivo</Button></div></section>
    </div>
  </>;
}

const creatorSteps = ["Briefing", "Roteiro", "Cenas", "Áudio e legenda", "Revisão"];

function Criador({ go }: { go: (route: string) => void }) {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState("Mostrar 3 cuidados simples para preparar a pele antes do verão, com linguagem acolhedora e uma dica prática no final.");
  const [duration, setDuration] = useState("30 segundos");
  const [format, setFormat] = useState("9:16 vertical");
  const next = () => setStep(current => Math.min(current + 1, creatorSteps.length - 1));
  return <>
    <SectionIntro eyebrow="Estúdio de criação" title="Criar um Reel" description="Monte o conteúdo por etapas. Este fluxo é uma demonstração local e não chama fornecedores externos." action={<div className="draft-save"><span><i /> Rascunho não publicado</span><button onClick={() => toast.success("Rascunho salvo localmente")}>Salvar rascunho</button></div>} />
    <div className="creator-layout">
      <section className="panel creator-main"><div className="stepper">{creatorSteps.map((label, index) => <button key={label} className={`step ${index === step ? "active" : ""} ${index < step ? "done" : ""}`} onClick={() => setStep(index)}><span>{index < step ? <Check size={14} /> : index + 1}</span><label>{label}</label></button>)}</div>
        {step === 0 && <div className="creator-form"><div className="form-section-title"><div className="step-badge"><MessageSquareText size={17} /></div><div><h2>Comece com um briefing</h2><p>Quanto mais contexto, mais fácil revisar o resultado depois.</p></div></div><label>O que você quer comunicar?<textarea value={brief} onChange={e => setBrief(e.target.value)} /></label><div className="form-grid"><label>Duração<select value={duration} onChange={e => setDuration(e.target.value)}><option>15 segundos</option><option>30 segundos</option><option>45 segundos</option><option>60 segundos</option></select></label><label>Formato<select value={format} onChange={e => setFormat(e.target.value)}><option>9:16 vertical</option><option>1:1 quadrado</option><option>16:9 horizontal</option></select></label><label>Objetivo<select defaultValue="Educar"><option>Educar</option><option>Vender</option><option>Engajar</option><option>Apresentar marca</option></select></label><label>Tom de voz<select defaultValue="Acolhedor"><option>Acolhedor</option><option>Enérgico</option><option>Elegante</option><option>Descontraído</option></select></label></div><div className="suggestion-box"><Sparkles size={17} /><div><strong>Uma sugestão para o briefing</strong><p>“Inclua uma frase de abertura que chame atenção nos 2 primeiros segundos e finalize com uma orientação simples.”</p></div><button onClick={() => setBrief(value => `${value} Inclua uma abertura forte nos 2 primeiros segundos.`)}><Copy size={15} /></button></div></div>}
        {step === 1 && <CreatorScript />}
        {step === 2 && <CreatorScenes />}
        {step === 3 && <CreatorAudio />}
        {step === 4 && <CreatorReview go={go} />}
        <div className="creator-footer"><button className="back-button" disabled={step === 0} onClick={() => setStep(current => Math.max(current - 1, 0))}><ArrowLeft size={16} /> Voltar</button>{step < creatorSteps.length - 1 ? <Button className="primary-action" onClick={next}>Continuar <ArrowRight size={16} /></Button> : <Button className="primary-action" onClick={() => { toast("Envio para aprovação não executado", { description: "O backend de filas e a integração oficial ainda não estão conectados." }); go("/biblioteca"); }}>Salvar como rascunho <Save size={16} /></Button>}</div>
      </section>
      <aside className="panel creator-preview"><div className="panel-heading"><div><span className="eyebrow">Prévia do formato</span><h2>Reel vertical</h2></div><span className="preview-tag">{format}</span></div><div className="phone-preview"><div className="phone-top"><span>9:16</span><span><MoreHorizontal size={15} /></span></div><div className="phone-art"><div className="phone-art-glow" /><span className="preview-placeholder"><Sparkles size={23} /><b>Prévia visual</b><small>As cenas aparecerão aqui</small></span></div><div className="phone-copy"><span>@lumie.estetica</span><strong>{brief.slice(0, 65)}{brief.length > 65 ? "…" : ""}</strong><div className="phone-actions"><HeartIcon /> <MessageSquareText size={15} /> <Send size={15} /></div></div></div><div className="preview-footnote"><Eye size={14} /> Prévia ilustrativa. Nenhum vídeo foi gerado.</div></aside>
    </div>
  </>;
}

function HeartIcon() { return <span className="heart-icon">♡</span>; }
function CreatorScript() { return <div className="creator-form"><div className="form-section-title"><div className="step-badge"><FileText size={17} /></div><div><h2>Roteiro sugerido</h2><p>Revise o texto antes de transformar em cenas.</p></div></div><div className="script-editor"><div className="script-line"><span>00:00</span><p><b>Gancho:</b> Sua pele também precisa de preparo antes do verão.</p></div><div className="script-line"><span>00:05</span><p><b>Dica 01:</b> Comece com uma limpeza suave, sem ressecar.</p></div><div className="script-line"><span>00:14</span><p><b>Dica 02:</b> Hidrate de acordo com o seu tipo de pele.</p></div><div className="script-line"><span>00:23</span><p><b>Fechamento:</b> Salve este vídeo e marque sua avaliação.</p></div></div><div className="editor-note"><Sparkles size={16} /><span>Roteiro demonstrativo. A geração por IA será conectada por uma camada de servidor.</span></div></div>; }
function CreatorScenes() { return <div className="creator-form"><div className="form-section-title"><div className="step-badge"><Video size={17} /></div><div><h2>Organize as cenas</h2><p>Uma sugestão de sequência para o seu Reel.</p></div></div><div className="scene-list"><Scene number="01" time="00:00 — 00:05" title="Abertura com pergunta" description="Plano fechado de um rosto e texto na tela: sua pele está pronta?" /><Scene number="02" time="00:05 — 00:14" title="Limpeza suave" description="Demonstração do produto com movimento lento e luz natural." /><Scene number="03" time="00:14 — 00:23" title="Hidratação" description="Aplicação do hidratante e detalhe da textura na mão." /><Scene number="04" time="00:23 — 00:30" title="Fechamento com CTA" description="Logo da Lumiê e convite para agendar uma avaliação." /></div><button className="add-scene" onClick={() => toast("Nova cena adicionada apenas visualmente")}><Plus size={15} /> Adicionar cena</button></div>; }
function Scene({ number, time, title, description }: { number: string; time: string; title: string; description: string }) { return <div className="scene-item"><div className="scene-number">{number}</div><div className="scene-copy"><span>{time}</span><strong>{title}</strong><p>{description}</p></div><button className="row-more" aria-label="Editar cena"><MoreHorizontal size={17} /></button></div>; }
function CreatorAudio() { const [voice, setVoice] = useState("Voz feminina · acolhedora"); const [track, setTrack] = useState("Leve e solar"); return <div className="creator-form"><div className="form-section-title"><div className="step-badge"><Mic2 size={17} /></div><div><h2>Áudio e legenda</h2><p>Escolha referências para a futura geração.</p></div></div><div className="audio-options"><div className="audio-card"><div className="audio-card-icon"><Mic2 size={18} /></div><div><span>Narração</span><strong>{voice}</strong></div><select value={voice} onChange={e => setVoice(e.target.value)}><option>Voz feminina · acolhedora</option><option>Voz masculina · calma</option><option>Sem narração</option></select></div><div className="audio-card"><div className="audio-card-icon music"><Music2 size={18} /></div><div><span>Trilha sonora</span><strong>{track}</strong></div><select value={track} onChange={e => setTrack(e.target.value)}><option>Leve e solar</option><option>Minimalista</option><option>Sem trilha</option></select></div></div><label className="caption-toggle"><input type="checkbox" defaultChecked /><span className="fake-check"><Check size={13} /></span><div><strong>Gerar legenda automática</strong><p>A legenda visual é apenas uma configuração local neste protótipo.</p></div></label><div className="editor-note"><AlertTriangle size={16} /><span>Narração, música e legenda ainda não são geradas nem enviadas para fornecedores externos.</span></div></div>; }
function CreatorReview({ go }: { go: (route: string) => void }) { return <div className="creator-form"><div className="form-section-title"><div className="step-badge success"><CheckCircle2 size={17} /></div><div><h2>Revisão do Reel</h2><p>Confira o resumo antes de salvar o conteúdo.</p></div></div><div className="review-grid"><div><span>Briefing</span><strong>3 cuidados com a pele no verão</strong></div><div><span>Formato</span><strong>9:16 · 30 segundos</strong></div><div><span>Roteiro</span><strong>4 blocos sugeridos</strong></div><div><span>Publicação</span><strong>Manual · não conectado</strong></div></div><div className="review-alert"><ShieldCheck size={18} /><div><strong>Seguro para demonstrar</strong><p>Salvar este Reel não publica nada. Para publicação real, ainda serão necessários servidor, fila, credenciais protegidas e OAuth oficial.</p></div></div><button className="outline-wide" onClick={() => go("/configuracoes")}><Settings2 size={15} /> Revisar configuração de publicação</button></div>; }

function Biblioteca({ go, calendar = false }: { go: (route: string) => void; calendar?: boolean }) {
  const [filter, setFilter] = useState<ContentStatus | "todos">("todos");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => contents.filter(item => (filter === "todos" || item.status === filter) && item.title.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  return <>
    <SectionIntro eyebrow="Planejamento" title={calendar ? "Calendário de conteúdo" : "Biblioteca de conteúdos"} description={calendar ? "Planeje datas e aprovações sem confundir agenda visual com publicação real." : "Encontre, revise e acompanhe cada conteúdo dos seus clientes."} action={<Button className="primary-action" onClick={() => go("/criador")}><Plus size={17} /> Novo conteúdo</Button>} />
    <div className="view-toggle"><button className={!calendar ? "active" : ""} onClick={() => go("/biblioteca")}><Layers3 size={15} /> Biblioteca</button><button className={calendar ? "active" : ""} onClick={() => go("/calendario")}><CalendarDays size={15} /> Calendário</button></div>
    {calendar ? <CalendarView /> : <><div className="library-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar conteúdo" /></div><div className="filter-field"><Filter size={15} /><select value={filter} onChange={e => setFilter(e.target.value as ContentStatus | "todos")}><option value="todos">Todos os status</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><button className="filter-button"><ListFilter size={15} /> Filtros</button></div><div className="library-stats"><span><b>{filtered.length}</b> conteúdos encontrados</span><span className="local-data"><i /> Tudo aqui é demonstrativo</span></div><section className="panel library-panel"><div className="table-header"><span>Conteúdo</span><span>Cliente</span><span>Data</span><span>Status</span><span /></div>{filtered.map(item => <div className="table-row" key={item.id}><div className="table-content"><div className={`content-thumb thumb-${item.type.toLowerCase()}`}>{item.type === "Reel" ? <Video size={17} /> : item.type === "Carrossel" ? <Layers3 size={17} /> : <Instagram size={17} />}</div><div><strong>{item.title}</strong><span>{item.type}{item.duration ? ` · ${item.duration}` : ""}</span></div></div><span>{item.client}</span><span>{item.date}</span><StatusPill status={item.status} /><button className="row-more"><MoreHorizontal size={17} /></button></div>)}{filtered.length === 0 && <div className="empty-state"><Search size={22} /><strong>Nenhum conteúdo encontrado</strong><span>Tente outra busca ou filtro.</span></div>}</section></>}
  </>;
}

function CalendarView() { const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]; const dates = Array.from({ length: 35 }, (_, i) => i - 1); return <section className="calendar-layout"><div className="panel calendar-panel"><div className="calendar-head"><button className="icon-button"><ArrowLeft size={16} /></button><div><strong>Outubro 2026</strong><span>Semana 42</span></div><button className="icon-button"><ArrowRight size={16} /></button><button className="today-button">Hoje</button></div><div className="calendar-grid calendar-weekdays">{days.map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid calendar-days">{dates.map((date, index) => { const current = date > 0 && date <= 31; const event = date === 17 ? "3 cuidados com a pele" : date === 19 ? "Bastidores da coleção" : date === 22 ? "Oferta de lançamento" : ""; return <div key={index} className={`calendar-cell ${!current ? "muted" : ""} ${date === 17 ? "today" : ""}`}><span>{current ? date : date === 0 ? 30 : date < 0 ? 28 + date : date - 31}</span>{event && <div className={`calendar-event event-${date === 22 ? "warning" : "blue"}`}><i /> {event}</div>}</div>; })}</div></div><aside className="panel calendar-side"><span className="eyebrow">Próximas datas</span><h2>Agenda da semana</h2><div className="agenda-item"><span className="agenda-date">17<b>out</b></span><div><strong>3 cuidados com a pele</strong><span><Clock3 size={13} /> 16:30 · aguardando aprovação</span></div></div><div className="agenda-item"><span className="agenda-date">19<b>out</b></span><div><strong>Bastidores da coleção</strong><span><CheckCircle2 size={13} /> Aprovado · agenda local</span></div></div><div className="agenda-item"><span className="agenda-date">22<b>out</b></span><div><strong>Oferta de lançamento</strong><span><AlertTriangle size={13} /> Falhou · sem integração</span></div></div><div className="calendar-note"><CalendarDays size={16} /><p>Agendar aqui organiza o plano visual. A publicação real só acontece quando o backend e a rede social estiverem conectados.</p></div></aside></section>; }

function Integracoes() { const integrations = [{ icon: MessageSquareText, label: "Texto e roteiros", vendor: "Fornecedores de LLM", color: "blue" }, { icon: Video, label: "Vídeo e cenas", vendor: "Provedores de vídeo", color: "purple" }, { icon: Mic2, label: "Voz e narração", vendor: "Provedores de voz", color: "coral" }, { icon: Music2, label: "Música", vendor: "Provedores de áudio", color: "teal" }, { icon: Instagram, label: "Meta / Instagram", vendor: "OAuth oficial", color: "pink" }]; return <><SectionIntro eyebrow="Conexões" title="Integrações de APIs" description="Escolha fornecedores quando estiver pronto. Neste protótipo, nenhuma credencial é coletada ou armazenada." action={<Button variant="outline" onClick={() => toast("Configuração de integrações ainda não está conectada", { description: "O servidor e o armazenamento seguro serão implementados depois." })}><CircleHelp size={16} /> Como funciona?</Button>} /><div className="integration-callout"><div className="callout-icon"><LockKeyhole size={18} /></div><div><strong>Suas chaves nunca devem ir para o navegador</strong><p>As credenciais ficarão em um armazenamento seguro no servidor. Para Meta e Instagram, usaremos OAuth oficial — nunca peça sua senha aqui.</p></div></div><div className="integrations-grid">{integrations.map(({ icon: Icon, label, vendor, color }) => <div className="integration-card" key={label}><div className={`integration-logo ${color}`}><Icon size={21} /></div><div className="integration-card-copy"><div><strong>{label}</strong><span>{vendor}</span></div><span className="not-connected"><i /> Não conectado</span></div><p>Fornecedor substituível. A escolha real será feita no servidor e registrada por cliente.</p><button className="integration-connect" onClick={() => toast("Ainda não conectado", { description: "Este botão não executa nenhuma chamada externa." })}>Ver opções <ArrowRight size={15} /></button></div>)}</div><section className="panel architecture-panel"><div className="panel-heading"><div><span className="eyebrow">Preparado para crescer</span><h2>Como a arquitetura deve funcionar</h2></div><Zap size={20} className="panel-heading-icon" /></div><div className="architecture-steps"><ArchitectureStep number="01" title="Camada de fornecedores" text="Troque o fornecedor de texto, vídeo, voz ou música sem mudar o fluxo da marca." /><ArchitectureStep number="02" title="Servidor protegido" text="Segredos, OAuth e permissões ficam fora do código de navegador." /><ArchitectureStep number="03" title="Fila e tentativas" text="Jobs, logs e retries registram cada etapa sem prometer sucesso antes da hora." /></div></section></>; }
function ArchitectureStep({ number, title, text }: { number: string; title: string; text: string }) { return <div className="architecture-step"><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></div>; }

function Configuracoes() { const [mode, setMode] = useState("manual"); return <><SectionIntro eyebrow="Publicação" title="Configurações por cliente" description="Defina a regra de aprovação da Lumiê Estética. A preferência é local até o servidor estar conectado." action={<Button className="primary-action" onClick={() => toast.success("Preferência salva localmente")}><Save size={16} /> Salvar preferência</Button>} /><DemoNotice compact /><div className="settings-layout"><section className="panel settings-main"><div className="settings-client"><div className="avatar avatar-lilac">LE</div><div><strong>Lumiê Estética</strong><span>Cliente ativo · dados isolados conceitualmente</span></div><ChevronDown size={16} /></div><div className="settings-section"><span className="eyebrow">Regra de aprovação</span><h2>Quando um conteúdo estiver pronto</h2><p className="settings-help">Escolha como sua equipe revisaria um conteúdo em uma versão conectada do produto.</p><div className="radio-cards"><label className={mode === "manual" ? "selected" : ""}><input type="radio" checked={mode === "manual"} onChange={() => setMode("manual")} /><span className="radio-dot" /><div><strong>Aprovação manual</strong><p>O conteúdo fica aguardando aprovação antes de qualquer publicação.</p></div><CheckCircle2 size={18} /></label><label className={mode === "automatic" ? "selected" : ""}><input type="radio" checked={mode === "automatic"} onChange={() => setMode("automatic")} /><span className="radio-dot" /><div><strong>Publicação automática</strong><p>Após a aprovação do fluxo, o servidor poderá agendar a publicação.</p></div><AlertTriangle size={18} /></label></div></div><div className="settings-section"><span className="eyebrow">Proteções</span><div className="protection-row"><div className="protection-icon"><ShieldCheck size={17} /></div><div><strong>Bloquear publicação sem integração</strong><p>Recomendado para evitar ações externas sem credenciais válidas.</p></div><span className="switch on"><i /></span></div><div className="protection-row"><div className="protection-icon"><Bell size={17} /></div><div><strong>Avisar quando houver falha</strong><p>Notificações reais dependem do backend de filas e eventos.</p></div><span className="switch on"><i /></span></div></div></section><aside className="panel settings-side"><div className="settings-side-icon"><LockKeyhole size={19} /></div><h2>Nada será publicado agora</h2><p>Mesmo selecionando publicação automática, este protótipo não tem credenciais, fila ou acesso à Meta.</p><span className="safe-badge"><Check size={14} /> Modo seguro ativo</span></aside></div></>; }

function Seguranca() { return <><SectionIntro eyebrow="Governança" title="Segurança, uso e custo" description="Uma visão demonstrativa do que o produto deverá acompanhar por cliente quando o backend estiver implementado." action={<Button variant="outline" onClick={() => toast("Exportação ainda não implementada")}><BarChart3 size={16} /> Exportar visão</Button>} /><div className="security-grid"><section className="panel cost-card"><div className="panel-heading"><div><span className="eyebrow">Custo do mês</span><h2>Uso da Lumiê</h2></div><span className="cost-period">Outubro 2026</span></div><div className="cost-total"><strong>R$ 48,20</strong><span>de R$ 150,00</span></div><div className="cost-progress"><span style={{ width: "32%" }} /></div><div className="cost-foot"><span>32% utilizado</span><strong>R$ 101,80 restantes</strong></div><div className="cost-breakdown"><div><i className="dot dot-purple" /><span>Roteiros e texto</span><b>R$ 18,40</b></div><div><i className="dot dot-coral" /><span>Narração</span><b>R$ 21,80</b></div><div><i className="dot dot-teal" /><span>Outros testes</span><b>R$ 8,00</b></div></div></section><section className="panel security-health"><div className="panel-heading"><div><span className="eyebrow">Saúde operacional</span><h2>Proteções</h2></div><ShieldCheck size={20} className="panel-heading-icon success-icon" /></div><div className="health-row"><span><LockKeyhole size={15} /> Segredos no navegador</span><strong className="health-good">0 encontrados</strong></div><div className="health-row"><span><Users2 size={15} /> Isolamento por cliente</span><strong className="health-plan">Planejado</strong></div><div className="health-row"><span><RotateCcw size={15} /> Retentativas de fila</span><strong className="health-plan">Planejado</strong></div><div className="health-row"><span><Activity size={15} /> Logs de publicação</span><strong className="health-plan">Planejado</strong></div></section></div><section className="panel usage-panel"><div className="panel-heading"><div><span className="eyebrow">Por fornecedor</span><h2>Uso registrado</h2></div><span className="local-data"><i /> Dados fictícios</span></div><div className="usage-table"><div className="usage-header"><span>Categoria</span><span>Chamadas</span><span>Uso estimado</span><span>Estado</span></div><div className="usage-row"><span><MessageSquareText size={15} /> Texto e roteiro</span><span>42</span><span>R$ 18,40</span><b className="health-plan">Demonstração</b></div><div className="usage-row"><span><Mic2 size={15} /> Voz e narração</span><span>8</span><span>R$ 21,80</span><b className="health-plan">Demonstração</b></div><div className="usage-row"><span><Instagram size={15} /> Meta / Instagram</span><span>0</span><span>R$ 0,00</span><b className="health-good">Não conectado</b></div></div></section><section className="panel logs-panel"><div className="panel-heading"><div><span className="eyebrow">Rastreabilidade</span><h2>Logs recentes</h2></div><button className="text-button">Ver todos <ArrowRight size={15} /></button></div><div className="log-row"><span className="log-time">16:42:08</span><span className="log-dot success" /><span>Roteiro salvo localmente</span><code>demo.content.save</code><span className="log-ok">OK</span></div><div className="log-row"><span className="log-time">16:37:19</span><span className="log-dot warning" /><span>Publicação bloqueada sem integração</span><code>guard.publish.blocked</code><span className="log-ok">Seguro</span></div></section></>;
}

function Studio() {
  const [location, navigate] = useLocation();
  const activeView = routeToView(location);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const go = (route: string) => { setMobileMenuOpen(false); navigate(route); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const currentLabel = navItems.find(item => item.view === activeView)?.label ?? "Painel geral";
  const renderView = () => {
    if (activeView === "empresa") return <Empresa />;
    if (activeView === "criador") return <Criador go={go} />;
    if (activeView === "biblioteca") return <Biblioteca go={go} />;
    if (activeView === "calendario") return <Biblioteca go={go} calendar />;
    if (activeView === "integracoes") return <Integracoes />;
    if (activeView === "seguranca") return <Seguranca />;
    if (activeView === "configuracoes") return <Configuracoes />;
    return <Dashboard go={go} />;
  };
  return <div className="app-shell"><aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}><div className="brand"><div className="brand-mark"><span>P</span></div><div><strong>PostaFácil</strong><small>STUDIO</small></div><button className="mobile-close" onClick={() => setMobileMenuOpen(false)}><X size={18} /></button></div><div className="workspace-label">Workspace</div><button className="workspace-select"><div className="avatar avatar-lilac small">LE</div><div><strong>Lumiê Estética</strong><span>Conta de demonstração</span></div><ChevronDown size={15} /></button><nav className="sidebar-nav"><span className="nav-label">Operação</span>{navItems.slice(0, 5).map(item => <NavLink key={item.view} item={item} active={activeView === item.view} go={go} />)}<span className="nav-label nav-label-spaced">Administração</span>{navItems.slice(5).map(item => <NavLink key={item.view} item={item} active={activeView === item.view} go={go} />)}</nav><div className="sidebar-bottom"><div className="secure-mini"><ShieldCheck size={15} /><span><strong>Modo seguro</strong><small>Nada é publicado</small></span><i /></div><button className="user-row"><div className="avatar avatar-dark small">CB</div><div><strong>Caio Borges</strong><span>Administrador</span></div><MoreHorizontal size={16} /></button></div></aside><div className="main-shell"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>PostaFácil Studio</span><ArrowRight size={13} /><strong>{currentLabel}</strong></div><div className="topbar-actions"><span className="topbar-demo"><i /> Demonstração</span><button className="icon-button"><Bell size={18} /><i className="notification-dot" /></button><div className="top-avatar">CB</div></div></header><main className="page-content">{renderView()}</main><nav className="mobile-bottom-nav">{navItems.slice(0, 4).map(item => <button key={item.view} className={activeView === item.view ? "active" : ""} onClick={() => go(item.route)}><item.icon size={18} /><span>{item.view === "dashboard" ? "Início" : item.view === "criador" ? "Criar" : item.view === "biblioteca" ? "Conteúdos" : "Empresas"}</span></button>)}<button className={activeView === "integracoes" || activeView === "seguranca" ? "active" : ""} onClick={() => go("/integracoes")}><MoreHorizontal size={18} /><span>Mais</span></button></nav></div></div>;
}

function NavLink({ item, active, go }: { item: NavItem; active: boolean; go: (route: string) => void }) { const Icon = item.icon; return <button className={`nav-link ${active ? "active" : ""}`} onClick={() => go(item.route)}><Icon size={17} /><span>{item.label}</span>{item.view === "integracoes" && <i className="nav-alert" />}</button>; }

export default Studio;
