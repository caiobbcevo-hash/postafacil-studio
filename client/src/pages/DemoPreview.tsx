import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Instagram,
  Layers3,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  Palette,
  ShieldCheck,
  Sparkles,
  Store,
  Video,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type DemoView = "dashboard" | "criador" | "biblioteca" | "calendario" | "integracoes";

const demoContents = [
  { title: "Lançamento coleção primavera", type: "Reel", date: "18 out 2026", status: "Aguardando aprovação", statusClass: "status-warning", client: "Casa Aurora" },
  { title: "3 formas de usar nosso produto", type: "Carrossel", date: "21 out 2026", status: "Agendado", statusClass: "status-blue", client: "Casa Aurora" },
  { title: "Bastidores da produção", type: "Reel", date: "25 out 2026", status: "Rascunho", statusClass: "status-neutral", client: "Casa Aurora" },
];

const navigation: Array<{ id: DemoView; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Painel geral", icon: LayoutDashboard },
  { id: "criador", label: "Criar Reel", icon: WandSparkles },
  { id: "biblioteca", label: "Biblioteca", icon: Layers3 },
  { id: "calendario", label: "Calendário", icon: CalendarDays },
  { id: "integracoes", label: "Integrações", icon: Link2 },
];

function StatusPill({ children, className }: { children: string; className: string }) {
  return <span className={`status-pill ${className}`}>{children}</span>;
}

function DemoDashboard({ go }: { go: (view: DemoView) => void }) {
  return (
    <>
      <div className="demo-notice">
        <div className="demo-notice-icon"><Sparkles size={16} /></div>
        <div><strong>Modo demonstração</strong><span>Todos os dados desta página são fictícios. Nada é salvo no banco e nenhuma API externa é chamada.</span></div>
      </div>
      <div className="section-intro">
        <div><span className="eyebrow">Visão do estúdio</span><h1>Painel geral</h1><p>Veja como o PostaFácil organiza empresas, conteúdos e o calendário.</p></div>
        <Button className="primary-action" onClick={() => go("criador")}><WandSparkles size={17} /> Testar criador</Button>
      </div>
      <div className="client-switcher-row"><div className="client-switcher"><div className="avatar avatar-lilac">CA</div><div><span>Empresa de demonstração</span><strong>Casa Aurora</strong></div></div><span className="local-data"><i /> Dados fictícios</span></div>
      <div className="metrics-grid">
        <Metric label="Empresas cadastradas" value="01" helper="Exemplo de workspace" icon={Store} accent="accent-coral" />
        <Metric label="Conteúdos planejados" value="12" helper="Itens de demonstração" icon={FileText} accent="accent-purple" />
        <Metric label="Aguardando aprovação" value="02" helper="Revisão no fluxo interno" icon={CheckCircle2} accent="accent-amber" />
        <Metric label="Integrações ativas" value="0 / 6" helper="Nenhuma conectada" icon={Link2} accent="accent-teal" />
      </div>
      <div className="dashboard-grid">
        <section className="panel next-content-panel"><div className="panel-heading"><div><span className="eyebrow">Fila de demonstração</span><h2>Próximos conteúdos</h2></div><button className="text-button" onClick={() => go("biblioteca")}>Ver biblioteca <ArrowRight size={15} /></button></div><div className="content-list">{demoContents.map((item) => <div className="content-row" key={item.title}><div className="content-thumb thumb-reel"><Video size={19} /><span>{item.type}</span></div><div className="content-row-main"><strong>{item.title}</strong><span>{item.client} · {item.date}</span></div><StatusPill className={item.statusClass} children={item.status} /></div>)}</div></section>
        <section className="panel integration-panel"><div className="panel-heading"><div><span className="eyebrow">Saúde do ambiente</span><h2>Integrações</h2></div><button className="icon-button" onClick={() => go("integracoes")} aria-label="Abrir integrações"><ArrowRight size={16} /></button></div><div className="integration-summary"><div className="ring-progress"><span>0%</span></div><div><strong>Nenhuma conectada</strong><p>Confira os próximos passos sem cadastrar credenciais.</p></div></div><div className="integration-mini-list"><IntegrationMini icon={MessageSquareText} name="Texto / roteiro" /><IntegrationMini icon={Video} name="Vídeo" /><IntegrationMini icon={Instagram} name="Meta / Instagram" /></div></section>
      </div>
    </>
  );
}

function Metric({ label, value, helper, icon: Icon, accent }: { label: string; value: string; helper: string; icon: typeof Store; accent: string }) {
  return <div className={`metric-card ${accent}`}><div className="metric-card-top"><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><small>{helper}</small></div>;
}

function IntegrationMini({ icon: Icon, name }: { icon: typeof Store; name: string }) {
  return <div className="integration-mini"><div className="integration-mini-icon"><Icon size={16} /></div><span>{name}</span><b>Não conectado</b></div>;
}

function DemoContent({ view, go }: { view: DemoView; go: (view: DemoView) => void }) {
  if (view === "criador") return <section className="panel demo-form"><span className="eyebrow">Demonstração do fluxo</span><h1>Criar Reel</h1><p className="demo-lead">Explore as etapas visuais de um planejamento sem salvar alterações.</p><label>Título do conteúdo<input value="Lançamento coleção primavera" readOnly /></label><label>Briefing<textarea value="Apresente a nova coleção com cenas leves, acolhedoras e foco nos detalhes do produto." readOnly /></label><label>Roteiro<textarea value="Cena 1 — abertura com textura e luz natural.\nCena 2 — detalhe do produto em uso.\nCena 3 — convite para conhecer a coleção." readOnly /></label><div className="editor-note"><Sparkles size={16} /><span>A geração real exige login Manus e configuração server-side; esta Demo pública não chama IA.</span></div><Button className="outline-wide" onClick={() => go("dashboard")}><ArrowRight size={15} /> Voltar ao painel</Button></section>;
  if (view === "biblioteca") return <section className="panel demo-library"><span className="eyebrow">Planejamento</span><h1>Biblioteca de conteúdos</h1><p className="demo-lead">Itens fictícios para você testar a leitura visual da fila.</p>{demoContents.map((item) => <div className="table-row" key={item.title}><div className="table-content"><div className="content-thumb thumb-reel"><Video size={17} /></div><div><strong>{item.title}</strong><span>{item.type}</span></div></div><span>{item.client}</span><span>{item.date}</span><StatusPill className={item.statusClass} children={item.status} /></div>)}</section>;
  if (view === "calendario") return <section className="panel demo-calendar"><span className="eyebrow">Planejamento visual</span><h1>Calendário de conteúdo</h1><p className="demo-lead">Uma prévia do calendário, sem agendamento ou publicação real.</p><div className="demo-calendar-grid">{["seg", "ter", "qua", "qui", "sex", "sáb", "dom", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25"].map((day, index) => <div key={`${day}-${index}`} className={index > 6 && [10, 13, 17].includes(index) ? "has-demo-event" : ""}>{day}{index > 6 && [10, 13, 17].includes(index) && <small>Conteúdo</small>}</div>)}</div></section>;
  if (view === "integracoes") return <section className="panel demo-integrations"><span className="eyebrow">Conexões</span><h1>Integrações de APIs</h1><p className="demo-lead">A demonstração mostra a arquitetura sem pedir credenciais ou chamar fornecedores.</p><div className="integrations-grid">{[[MessageSquareText, "Texto e roteiros", "Fornecedores de LLM"], [Video, "Vídeo e cenas", "Provedores de vídeo"], [Mic2, "Voz e narração", "Provedores de voz"], [Palette, "Música", "Provedores de áudio"], [Instagram, "Meta / Instagram", "OAuth oficial"]].map(([Icon, label, vendor]) => <div className="integration-card" key={String(label)}><div className="integration-logo blue"><Icon size={21} /></div><div className="integration-card-copy"><div><strong>{String(label)}</strong><span>{String(vendor)}</span></div><span className="not-connected"><i /> Não conectado</span></div><p>Modo demonstração: nenhuma chamada externa será feita.</p></div>)}</div></section>;
  return <DemoDashboard go={go} />;
}

export default function DemoPreview() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<DemoView>("dashboard");
  const go = (next: DemoView) => setView(next);
  return <div className="app-shell demo-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark"><span>P</span></div><div><strong>PostaFácil</strong><small>STUDIO</small></div><span className="demo-badge">DEMO</span></div><div className="workspace-label">Workspace de demonstração</div><div className="workspace-select"><div className="avatar avatar-lilac small">CA</div><div><strong>Casa Aurora</strong><span>Dados fictícios</span></div></div><nav className="sidebar-nav"><span className="nav-label">Explorar</span>{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${view === id ? "active" : ""}`} onClick={() => go(id)}><Icon size={17} /><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><div className="secure-mini"><ShieldCheck size={15} /><span><strong>Modo seguro</strong><small>Nada é salvo</small></span><i /></div><button className="user-row" onClick={() => setLocation("/")}><LockKeyhole size={16} /><span><strong>Acessar conta real</strong><small>Login Manus</small></span></button></div></aside><div className="main-shell"><header className="topbar"><button className="mobile-menu"><Menu size={20} /></button><div className="breadcrumbs"><span>PostaFácil Studio</span><ArrowRight size={13} /><strong>Modo demonstração</strong></div><div className="topbar-actions"><span className="topbar-demo"><i /> Preview público</span><button className="icon-button" onClick={() => setLocation("/")} aria-label="Acessar conta real"><LockKeyhole size={18} /></button><div className="top-avatar">CA</div></div></header><main className="page-content"><div className="demo-topbar"><span><Sparkles size={14} /> Você está vendo dados fictícios</span><button onClick={() => setLocation("/")}>Ir para login real <ArrowRight size={14} /></button></div><DemoContent view={view} go={go} /></main></div></div>;
}
