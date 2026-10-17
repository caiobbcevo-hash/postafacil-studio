import { useEffect, useMemo, useState } from "react";
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
  Heart,
  Instagram,
  Layers3,
  LayoutDashboard,
  Link2,
  ListFilter,
  LockKeyhole,
  LogIn,
  Menu,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  Music2,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Users2,
  Video,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

// This page keeps the original product surface, but all company/content data below
// comes from the protected server procedures rather than local state or localStorage.

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

type DbStatus = "draft" | "pending_approval" | "approved" | "scheduled" | "published" | "failed";
type ContentType = "reel" | "carrossel" | "story";

type CompanyRecord = {
  id: number;
  name: string;
  segment: string;
  products: string;
  services: string;
  targetAudience: string;
  voiceTone: string;
  brandColors: string;
  links: string;
  logoUrl: string | null;
};

type ContentRecord = {
  id: number;
  companyId: number;
  companyName: string;
  title: string;
  contentType: ContentType;
  format: string;
  duration: string;
  briefing: string;
  script: string;
  scenes: string;
  voice: string;
  track: string;
  caption: string;
  plannedAt: Date | string | null;
  status: DbStatus;
};

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

type CompanyForm = Omit<CompanyRecord, "id" | "logoUrl"> & { logoUrl: string };
type ContentForm = {
  title: string;
  format: string;
  duration: string;
  briefing: string;
  script: string;
  scenes: string;
  voice: string;
  track: string;
  caption: string;
  plannedAt: string;
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

const blankCompany: CompanyForm = {
  name: "",
  segment: "",
  products: "",
  services: "",
  targetAudience: "",
  voiceTone: "Acolhedor e didático",
  brandColors: "#E9B7A8, #27333A, #F7F2EC",
  links: "",
  logoUrl: "",
};

const blankContent: ContentForm = {
  title: "3 cuidados com a pele no verão",
  format: "9:16 vertical",
  duration: "30 segundos",
  briefing: "Mostrar 3 cuidados simples para preparar a pele antes do verão, com linguagem acolhedora e uma dica prática no final.",
  script: "Gancho: Sua pele também precisa de preparo antes do verão.\n\nDica 01: Comece com uma limpeza suave, sem ressecar.\n\nDica 02: Hidrate de acordo com o seu tipo de pele.\n\nFechamento: Salve este vídeo e marque sua avaliação.",
  scenes: "01 — Abertura com pergunta\n02 — Limpeza suave\n03 — Hidratação\n04 — Fechamento com CTA",
  voice: "Voz feminina · acolhedora",
  track: "Leve e solar",
  caption: "Sua pele também precisa de preparo antes do verão. Salve estas dicas e marque sua avaliação.",
  plannedAt: "",
};

function routeToView(path: string): ViewKey {
  if (path.startsWith("/empresa")) return "empresa";
  if (path.startsWith("/criador")) return "criador";
  if (path.startsWith("/biblioteca")) return "biblioteca";
  if (path.startsWith("/calendario")) return "calendario";
  if (path.startsWith("/integracoes")) return "integracoes";
  if (path.startsWith("/seguranca")) return "seguranca";
  if (path.startsWith("/configuracoes")) return "configuracoes";
  return "dashboard";
}

function initials(name: string | null | undefined) {
  return (name || "PF")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "PF";
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Sem data planejada";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data planejada";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    .format(date)
    .replace(" de ", " ");
}

function dateTimeInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function dbStatusToUi(status: DbStatus): ContentStatus {
  const map: Record<DbStatus, ContentStatus> = {
    draft: "rascunho",
    pending_approval: "aguardando",
    approved: "aprovado",
    scheduled: "agendado",
    published: "publicado",
    failed: "falhou",
  };
  return map[status];
}

function dbTypeToUi(type: ContentType): ContentItem["type"] {
  return type === "reel" ? "Reel" : type === "carrossel" ? "Carrossel" : "Story";
}

function toContentItem(content: ContentRecord): ContentItem {
  return {
    id: content.id,
    title: content.title,
    type: dbTypeToUi(content.contentType),
    client: content.companyName,
    date: formatDate(content.plannedAt),
    status: dbStatusToUi(content.status),
    duration: content.duration,
  };
}

function StatusPill({ status }: { status: ContentStatus }) {
  return <span className={`status-pill ${statusClass[status]}`}>{statusLabels[status]}</span>;
}

function SectionIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="section-intro"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="section-description">{description}</p></div>{action}</div>;
}

function DemoNotice({ compact = false }: { compact?: boolean }) {
  return <div className={`demo-notice ${compact ? "demo-notice-compact" : ""}`}><div className="demo-notice-icon"><Sparkles size={16} /></div><div><strong>{compact ? "Persistência ativa e integrações ainda desconectadas" : "Dados persistidos com segurança"}</strong><span>{compact ? "Empresas e conteúdos são salvos no banco do servidor. Nenhuma API externa ou rede social está conectada." : "Os dados abaixo vêm do banco do servidor e são protegidos pela conta autenticada. Conexões, filas e publicação real ainda dependem de backend adicional."}</span></div>{!compact && <button className="notice-close" aria-label="Fechar aviso"><X size={15} /></button>}</div>;
}

function MetricCard({ label, value, helper, icon: Icon, accent }: { label: string; value: string; helper: string; icon: LucideIcon; accent: string }) {
  return <div className="metric-card"><div className={`metric-icon ${accent}`}><Icon size={18} /></div><div className="metric-content"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div></div>;
}

function ContentRow({ item, onOpen }: { item: ContentItem; onOpen?: () => void }) {
  return <div className="content-row"><button className={`content-thumb thumb-${item.type.toLowerCase()}`} onClick={onOpen} aria-label={`Abrir ${item.title}`}>{item.type === "Reel" ? <Video size={19} /> : item.type === "Carrossel" ? <Layers3 size={19} /> : <Instagram size={19} />}<span>{item.type}</span></button><button className="content-row-main" onClick={onOpen}><strong>{item.title}</strong><span>{item.client} · {item.date}{item.duration ? ` · ${item.duration}` : ""}</span></button><StatusPill status={item.status} /><button className="row-more" onClick={onOpen} aria-label={`Editar ${item.title}`}><Pencil size={15} /></button></div>;
}

function IntegrationMini({ icon: Icon, name }: { icon: LucideIcon; name: string }) {
  return <div className="integration-mini"><div className="integration-mini-icon"><Icon size={16} /></div><span>{name}</span><b>Não conectado</b></div>;
}

function ActivityItem({ icon: Icon, title, detail, tone }: { icon: LucideIcon; title: string; detail: string; tone: string }) {
  return <div className="activity-item"><div className={`activity-icon ${tone}`}><Icon size={16} /></div><div><strong>{title}</strong><span>{detail}</span></div><span className="activity-time">agora</span></div>;
}

function Dashboard({ go, companies, contents, activeCompany }: { go: (route: string) => void; companies: CompanyRecord[]; contents: ContentRecord[]; activeCompany?: CompanyRecord }) {
  const items = contents.slice(0, 4).map(toContentItem);
  const waiting = contents.filter(content => content.status === "pending_approval").length;
  return <><SectionIntro eyebrow="Visão do estúdio" title="Painel geral" description="Acompanhe suas empresas e o planejamento de conteúdo persistido no servidor." action={<Button className="primary-action" onClick={() => go(activeCompany ? "/criador" : "/empresa")}><Plus size={17} /> {activeCompany ? "Criar conteúdo" : "Cadastrar empresa"}</Button>} /><DemoNotice /><div className="client-switcher-row"><div className="client-switcher"><div className="avatar avatar-lilac">{activeCompany ? initials(activeCompany.name) : "—"}</div><div><span>Empresa ativa</span><strong>{activeCompany?.name || "Nenhuma empresa cadastrada"}</strong></div><ChevronDown size={16} /></div><button className="text-button" onClick={() => go("/empresa")}><Settings2 size={15} /> Gerenciar empresas</button></div><div className="metrics-grid"><MetricCard label="Empresas cadastradas" value={String(companies.length)} helper={companies.length ? "Dados isolados pela conta" : "Cadastre a primeira empresa"} icon={Store} accent="accent-coral" /><MetricCard label="Conteúdos planejados" value={String(contents.length)} helper="Registros persistidos" icon={FileText} accent="accent-purple" /><MetricCard label="Aguardando aprovação" value={String(waiting).padStart(2, "0")} helper="Revisão no fluxo interno" icon={Clock3} accent="accent-amber" /><MetricCard label="Integrações ativas" value="0 / 6" helper="Conexões ainda não configuradas" icon={Link2} accent="accent-teal" /></div><div className="dashboard-grid"><section className="panel next-content-panel"><div className="panel-heading"><div><span className="eyebrow">Fila persistida</span><h2>Próximos conteúdos</h2></div><button className="text-button" onClick={() => go("/biblioteca")}>Ver biblioteca <ArrowRight size={15} /></button></div><div className="content-list">{items.length ? items.map(item => <ContentRow key={item.id} item={item} onOpen={() => go(`/criador?contentId=${item.id}`)} />) : <div className="empty-state"><FileText size={22} /><strong>Nenhum conteúdo salvo ainda</strong><span>Cadastre uma empresa e crie seu primeiro planejamento.</span></div>}</div></section><section className="panel integration-panel"><div className="panel-heading"><div><span className="eyebrow">Saúde do ambiente</span><h2>Integrações</h2></div><button className="icon-button" onClick={() => go("/integracoes")} aria-label="Abrir integrações"><ArrowRight size={16} /></button></div><div className="integration-summary"><div className="ring-progress"><span>0%</span></div><div><strong>Nenhuma conectada</strong><p>Configure uma conexão quando quiser testar o fluxo real.</p></div></div><div className="integration-mini-list"><IntegrationMini icon={MessageSquareText} name="Texto / roteiro" /><IntegrationMini icon={Video} name="Vídeo" /><IntegrationMini icon={Instagram} name="Meta / Instagram" /></div><button className="soft-action" onClick={() => go("/integracoes")}><Link2 size={15} /> Ver área de integrações</button></section></div><section className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">Operação</span><h2>Atividade recente</h2></div><span className="live-label"><i /> Dados do servidor</span></div><div className="activity-list"><ActivityItem icon={CheckCircle2} title={contents.length ? "Conteúdos carregados do banco" : "Banco pronto para receber conteúdos"} detail={`${contents.length} registro(s) visível(is) para esta conta`} tone="success" /><ActivityItem icon={AlertTriangle} title="Publicação ainda não configurada" detail="Meta / Instagram · precisa de OAuth oficial" tone="warning" /><ActivityItem icon={ShieldCheck} title="Isolamento por conta ativo" detail="Todas as queries usam o usuário autenticado" tone="purple" /></div></section></>;
}

function AuthGate() {
  return <div className="auth-gate"><div className="auth-gate-mark"><LockKeyhole size={26} /></div><p className="eyebrow">PostaFácil Studio</p><h1>Entre para acessar seus dados</h1><p>Empresas e planejamentos são privados e ficam vinculados à sua conta. Faça login pelo acesso oficial do Manus para continuar.</p><Button className="primary-action" onClick={() => startLogin()}><LogIn size={16} /> Entrar com Manus</Button><small>Nunca solicitamos senha do Instagram e nenhuma chave externa é coletada aqui.</small></div>;
}

function PersistenceError({ message }: { message: string }) {
  return <div className="data-error"><AlertTriangle size={22} /><strong>Não foi possível carregar o banco</strong><p>{message}</p><small>Verifique a configuração do banco e tente atualizar a página. Nenhum salvamento foi simulado.</small></div>;
}

function Empresa({ companies, activeCompany, onSelect, onRefresh }: { companies: CompanyRecord[]; activeCompany?: CompanyRecord; onSelect: (id: number | null) => void; onRefresh: () => Promise<void> }) {
  const utils = trpc.useUtils();
  const [creating, setCreating] = useState(!activeCompany);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<CompanyForm>(blankCompany);
  const createMutation = trpc.companies.create.useMutation();
  const updateMutation = trpc.companies.update.useMutation();
  const deleteMutation = trpc.companies.delete.useMutation();

  useEffect(() => {
    if (creating) return;
    if (activeCompany) {
      setForm({ ...activeCompany, logoUrl: activeCompany.logoUrl ?? "" });
      setSaved(false);
    }
  }, [activeCompany?.id, creating]);

  const update = <K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) => setForm(current => ({ ...current, [key]: value }));
  const save = async () => {
    try {
      const payload = { ...form, logoUrl: form.logoUrl.trim() ? form.logoUrl.trim() : null };
      if (creating) {
        const result = await createMutation.mutateAsync(payload);
        await utils.companies.list.invalidate();
        await onRefresh();
        onSelect(result.id);
        setCreating(false);
        toast.success("Empresa cadastrada no banco");
      } else if (activeCompany) {
        await updateMutation.mutateAsync({ id: activeCompany.id, data: payload });
        await utils.companies.list.invalidate();
        await onRefresh();
        setSaved(true);
        toast.success("Empresa atualizada no banco");
      }
    } catch (error) {
      toast.error("Não foi possível salvar a empresa", { description: error instanceof Error ? error.message : "Erro de servidor" });
    }
  };
  const remove = async () => {
    if (!activeCompany || !window.confirm(`Excluir a empresa “${activeCompany.name}” e seus conteúdos?`)) return;
    try {
      await deleteMutation.mutateAsync({ id: activeCompany.id });
      await utils.companies.list.invalidate();
      await utils.contents.list.invalidate();
      await onRefresh();
      onSelect(null);
      setCreating(true);
      setForm(blankCompany);
      toast.success("Empresa e conteúdos excluídos do banco");
    } catch (error) {
      toast.error("Não foi possível excluir a empresa", { description: error instanceof Error ? error.message : "Erro de servidor" });
    }
  };
  const pending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  return <><SectionIntro eyebrow="Clientes" title="Empresas" description="Cadastre e edite os dados de cada cliente. O servidor vincula cada registro à sua conta autenticada." action={<div className="header-actions"><Button variant="outline" onClick={() => { setCreating(true); setForm(blankCompany); onSelect(null); }}><Plus size={16} /> Nova empresa</Button><Button className="primary-action" disabled={pending} onClick={save}><Save size={16} /> {pending ? "Salvando…" : saved ? "Salvo no banco" : "Salvar empresa"}</Button></div>} /><DemoNotice compact /><div className="profile-layout"><aside className="profile-aside panel"><div className="profile-logo">{creating ? <Plus size={22} /> : initials(activeCompany?.name)}</div><h2>{creating ? "Nova empresa" : activeCompany?.name}</h2><p>{creating ? "Cadastro em branco" : activeCompany?.segment}</p>{!creating && <span className="profile-active"><i /> Registro persistido</span>}<div className="profile-aside-divider" /><div className="company-list"><div className="company-list-heading"><span>Suas empresas</span><b>{companies.length}</b></div>{companies.map(company => <button key={company.id} className={`company-list-item ${!creating && activeCompany?.id === company.id ? "active" : ""}`} onClick={() => { setCreating(false); onSelect(company.id); }}><span className="company-list-avatar">{initials(company.name)}</span><span>{company.name}</span><ChevronDown size={13} /></button>)}{companies.length === 0 && <p className="company-empty">Nenhuma empresa cadastrada.</p>}</div>{!creating && <button className="danger-text-button" onClick={remove} disabled={pending}><Trash2 size={14} /> Excluir empresa</button>}</aside><section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">Contexto da marca</span><h2>{creating ? "Cadastrar empresa" : "Informações principais"}</h2></div><span className="draft-label">Servidor + banco</span></div><div className="form-grid"><label>Nome da empresa<input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Ex.: Lumiê Estética" /></label><label>Segmento<input value={form.segment} onChange={e => update("segment", e.target.value)} placeholder="Ex.: Estética e bem-estar" /></label><label>Produtos<textarea value={form.products} onChange={e => update("products", e.target.value)} placeholder="Liste os produtos principais" /></label><label>Serviços<textarea value={form.services} onChange={e => update("services", e.target.value)} placeholder="Liste os serviços oferecidos" /></label><label className="field-span-2">Público-alvo<textarea value={form.targetAudience} onChange={e => update("targetAudience", e.target.value)} placeholder="Quem a empresa quer alcançar?" /></label><label>Tom de voz<select value={form.voiceTone} onChange={e => update("voiceTone", e.target.value)}><option>Acolhedor e didático</option><option>Direto e energético</option><option>Premium e sofisticado</option><option>Descontraído</option></select></label><label>Links e canais<textarea value={form.links} onChange={e => update("links", e.target.value)} placeholder="Um link por linha" /></label><label className="field-span-2">URL da logo <input value={form.logoUrl} onChange={e => update("logoUrl", e.target.value)} placeholder="https://... (opcional)" /></label></div><div className="form-section"><div><span className="eyebrow">Identidade visual</span><h3>Cores da marca</h3></div><div className="color-fields"><input className="colors-wide-input" value={form.brandColors} onChange={e => update("brandColors", e.target.value)} placeholder="#E9B7A8, #27333A, #F7F2EC" /></div><p className="field-help">Separe as cores por vírgulas. Este valor fica salvo junto do perfil.</p></div><div className="form-section logo-upload"><div className="upload-mark"><Store size={20} /></div><div><strong>Perfil pronto para uso</strong><p>Ao salvar, os dados ficam disponíveis após sair e entrar novamente.</p></div><span className="safe-badge"><Check size={14} /> Persistente</span></div></section></div></>;
}

const creatorSteps = ["Briefing", "Roteiro", "Cenas", "Áudio e legenda", "Revisão"];

function Criador({ go, activeCompany }: { go: (route: string) => void; activeCompany?: CompanyRecord }) {
  const [location, navigate] = useLocation();
  const contentId = Number(new URLSearchParams(location.split("?")[1] || "").get("contentId")) || undefined;
  const existingQuery = trpc.contents.get.useQuery({ id: contentId || 0 }, { enabled: Boolean(contentId), retry: false });
  const utils = trpc.useUtils();
  const createMutation = trpc.contents.create.useMutation();
  const updateMutation = trpc.contents.update.useMutation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ContentForm>(blankContent);
  const [hydratedId, setHydratedId] = useState<number>();

  useEffect(() => {
    if (!existingQuery.data || hydratedId === existingQuery.data.id) return;
    const saved = existingQuery.data as ContentRecord;
    setForm({ title: saved.title, format: saved.format, duration: saved.duration, briefing: saved.briefing, script: saved.script, scenes: saved.scenes, voice: saved.voice, track: saved.track, caption: saved.caption, plannedAt: dateTimeInput(saved.plannedAt) });
    setHydratedId(saved.id);
  }, [existingQuery.data, hydratedId]);

  const update = <K extends keyof ContentForm>(key: K, value: ContentForm[K]) => setForm(current => ({ ...current, [key]: value }));
  const save = async (returnToLibrary = false) => {
    if (!activeCompany) {
      toast.error("Cadastre ou selecione uma empresa antes de criar conteúdo");
      go("/empresa");
      return;
    }
    try {
      const payload = { companyId: activeCompany.id, title: form.title, contentType: "reel" as const, format: form.format, duration: form.duration, briefing: form.briefing, script: form.script, scenes: form.scenes, voice: form.voice, track: form.track, caption: form.caption, plannedAt: form.plannedAt ? new Date(form.plannedAt) : null, status: "draft" as const };
      const saved = contentId ? await updateMutation.mutateAsync({ id: contentId, data: payload }) : await createMutation.mutateAsync(payload);
      await utils.contents.list.invalidate();
      await utils.contents.get.invalidate({ id: saved.id });
      if (!contentId) navigate(`/criador?contentId=${saved.id}`);
      toast.success(contentId ? "Planejamento atualizado no banco" : "Planejamento salvo no banco");
      if (returnToLibrary) go("/biblioteca");
    } catch (error) {
      toast.error("Não foi possível salvar o planejamento", { description: error instanceof Error ? error.message : "Erro de servidor" });
    }
  };
  const pending = createMutation.isPending || updateMutation.isPending;
  return <><SectionIntro eyebrow="Estúdio de criação" title={contentId ? "Editar planejamento" : "Criar um Reel"} description="Monte o conteúdo por etapas e salve o planejamento no banco. Nenhuma geração externa ou publicação é executada." action={<div className="draft-save"><span><i /> {contentId ? "Registro persistido" : "Novo planejamento"}</span><button disabled={pending} onClick={() => save()}>{pending ? "Salvando…" : "Salvar no banco"}</button></div>} /><div className="creator-layout"><section className="panel creator-main"><div className="stepper">{creatorSteps.map((label, index) => <button key={label} className={`step ${index === step ? "active" : ""} ${index < step ? "done" : ""}`} onClick={() => setStep(index)}><span>{index < step ? <Check size={14} /> : index + 1}</span><label>{label}</label></button>)}</div>{step === 0 && <CreatorBrief form={form} update={update} />}{step === 1 && <CreatorScript script={form.script} setScript={value => update("script", value)} />}{step === 2 && <CreatorScenes scenes={form.scenes} setScenes={value => update("scenes", value)} />}{step === 3 && <CreatorAudio form={form} update={update} />}{step === 4 && <CreatorReview form={form} activeCompany={activeCompany} go={go} />}
<div className="creator-footer"><button className="back-button" disabled={step === 0} onClick={() => setStep(current => Math.max(current - 1, 0))}><ArrowLeft size={16} /> Voltar</button>{step < creatorSteps.length - 1 ? <Button className="primary-action" onClick={() => setStep(current => Math.min(current + 1, creatorSteps.length - 1))}>Continuar <ArrowRight size={16} /></Button> : <Button className="primary-action" disabled={pending} onClick={() => save(true)}><Save size={16} /> {pending ? "Salvando…" : "Salvar e abrir biblioteca"}</Button>}</div></section><aside className="panel creator-preview"><div className="panel-heading"><div><span className="eyebrow">Prévia do formato</span><h2>Reel vertical</h2></div><span className="preview-tag">{form.format}</span></div><div className="phone-preview"><div className="phone-top"><span>9:16</span><span><MoreHorizontal size={15} /></span></div><div className="phone-art"><div className="phone-art-glow" /><span className="preview-placeholder"><Sparkles size={23} /><b>Prévia visual</b><small>As cenas aparecerão aqui</small></span></div><div className="phone-copy"><span>{activeCompany ? `@${activeCompany.name.toLowerCase().replace(/\s+/g, ".")}` : "@suaempresa"}</span><strong>{form.caption.slice(0, 65)}{form.caption.length > 65 ? "…" : ""}</strong><div className="phone-actions"><Heart size={15} /> <MessageSquareText size={15} /> <Send size={15} /></div></div></div><div className="preview-footnote"><Eye size={14} /> Prévia ilustrativa. Nenhum vídeo foi gerado.</div></aside></div></>;
}

function CreatorBrief({ form, update }: { form: ContentForm; update: <K extends keyof ContentForm>(key: K, value: ContentForm[K]) => void }) {
  return <div className="creator-form"><div className="form-section-title"><div className="step-badge"><MessageSquareText size={17} /></div><div><h2>Comece com um briefing</h2><p>O título, briefing e data serão salvos no planejamento.</p></div></div><label>Título do conteúdo<input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Ex.: 3 cuidados com a pele no verão" /></label><label>O que você quer comunicar?<textarea value={form.briefing} onChange={e => update("briefing", e.target.value)} /></label><div className="form-grid"><label>Duração<select value={form.duration} onChange={e => update("duration", e.target.value)}><option>15 segundos</option><option>30 segundos</option><option>45 segundos</option><option>60 segundos</option></select></label><label>Formato<select value={form.format} onChange={e => update("format", e.target.value)}><option>9:16 vertical</option><option>1:1 quadrado</option><option>16:9 horizontal</option></select></label><label className="field-span-2">Data planejada<input type="datetime-local" value={form.plannedAt} onChange={e => update("plannedAt", e.target.value)} /></label></div><div className="suggestion-box"><Sparkles size={17} /><div><strong>Salvamento real</strong><p>Este conteúdo será vinculado à empresa ativa e poderá ser reaberto pela biblioteca depois.</p></div><button onClick={() => update("briefing", `${form.briefing} Inclua uma abertura forte nos 2 primeiros segundos.`)}><Copy size={15} /></button></div></div>;
}

function CreatorScript({ script, setScript }: { script: string; setScript: (value: string) => void }) {
  return <div className="creator-form"><div className="form-section-title"><div className="step-badge"><FileText size={17} /></div><div><h2>Roteiro</h2><p>Edite o roteiro e mantenha a versão salva no planejamento.</p></div></div><label>Roteiro completo<textarea className="large-editor" value={script} onChange={e => setScript(e.target.value)} /></label><div className="editor-note"><Sparkles size={16} /><span>A geração por IA ainda não está conectada; este texto é editável e persistido no banco.</span></div></div>;
}

function CreatorScenes({ scenes, setScenes }: { scenes: string; setScenes: (value: string) => void }) {
  return <div className="creator-form"><div className="form-section-title"><div className="step-badge"><Video size={17} /></div><div><h2>Cenas</h2><p>Descreva a sequência visual que deverá orientar a produção futura.</p></div></div><label>Sequência de cenas<textarea className="large-editor" value={scenes} onChange={e => setScenes(e.target.value)} /></label><div className="editor-note"><CheckCircle2 size={16} /><span>As cenas ficam salvas junto do roteiro e podem ser reabertas para edição.</span></div></div>;
}

function CreatorAudio({ form, update }: { form: ContentForm; update: <K extends keyof ContentForm>(key: K, value: ContentForm[K]) => void }) {
  return <div className="creator-form"><div className="form-section-title"><div className="step-badge"><Mic2 size={17} /></div><div><h2>Áudio e legenda</h2><p>Salve as referências para uso futuro, sem chamar fornecedores externos.</p></div></div><div className="audio-options"><div className="audio-card"><div className="audio-card-icon"><Mic2 size={18} /></div><div><span>Narração</span><strong>{form.voice}</strong></div><select value={form.voice} onChange={e => update("voice", e.target.value)}><option>Voz feminina · acolhedora</option><option>Voz masculina · calma</option><option>Sem narração</option></select></div><div className="audio-card"><div className="audio-card-icon music"><Music2 size={18} /></div><div><span>Trilha sonora</span><strong>{form.track}</strong></div><select value={form.track} onChange={e => update("track", e.target.value)}><option>Leve e solar</option><option>Minimalista</option><option>Sem trilha</option></select></div></div><label className="caption-field">Legenda<textarea value={form.caption} onChange={e => update("caption", e.target.value)} /></label><div className="editor-note"><AlertTriangle size={16} /><span>Narração, música e legenda ainda não são geradas nem enviadas para fornecedores externos.</span></div></div>;
}

function CreatorReview({ form, activeCompany, go }: { form: ContentForm; activeCompany?: CompanyRecord; go: (route: string) => void }) {
  return <div className="creator-form"><div className="form-section-title"><div className="step-badge success"><CheckCircle2 size={17} /></div><div><h2>Revisão do planejamento</h2><p>Confira o resumo antes de salvar no banco.</p></div></div><div className="review-grid"><div><span>Empresa</span><strong>{activeCompany?.name || "Nenhuma selecionada"}</strong></div><div><span>Formato</span><strong>{form.format} · {form.duration}</strong></div><div><span>Roteiro</span><strong>{form.script.length} caracteres</strong></div><div><span>Data</span><strong>{form.plannedAt ? formatDate(form.plannedAt) : "Sem data planejada"}</strong></div></div><div className="review-alert"><ShieldCheck size={18} /><div><strong>Salvar não publica</strong><p>O registro será persistido no banco e continuará privado da sua conta. Publicação externa não está conectada.</p></div></div><button className="outline-wide" onClick={() => go("/configuracoes")}><Settings2 size={15} /> Revisar configuração de publicação</button></div>;
}

function Biblioteca({ go, calendar = false, contents }: { go: (route: string) => void; calendar?: boolean; contents: ContentRecord[] }) {
  const [filter, setFilter] = useState<ContentStatus | "todos">("todos");
  const [query, setQuery] = useState("");
  const utils = trpc.useUtils();
  const deleteMutation = trpc.contents.delete.useMutation();
  const items = useMemo(() => contents.map(toContentItem), [contents]);
  const filtered = useMemo(() => items.filter(item => (filter === "todos" || item.status === filter) && item.title.toLowerCase().includes(query.toLowerCase())), [filter, items, query]);
  const remove = async (id: number, title: string) => {
    if (!window.confirm(`Excluir “${title}” do banco?`)) return;
    try {
      await deleteMutation.mutateAsync({ id });
      await utils.contents.list.invalidate();
      toast.success("Conteúdo excluído do banco");
    } catch (error) {
      toast.error("Não foi possível excluir o conteúdo", { description: error instanceof Error ? error.message : "Erro de servidor" });
    }
  };
  return <><SectionIntro eyebrow="Planejamento" title={calendar ? "Calendário de conteúdo" : "Biblioteca de conteúdos"} description={calendar ? "Datas planejadas vêm do banco. Agendamento visual não publica em redes sociais." : "Encontre, reabra, edite e exclua planejamentos persistidos."} action={<Button className="primary-action" onClick={() => go("/criador")}><Plus size={17} /> Novo conteúdo</Button>} /><div className="view-toggle"><button className={!calendar ? "active" : ""} onClick={() => go("/biblioteca")}><Layers3 size={15} /> Biblioteca</button><button className={calendar ? "active" : ""} onClick={() => go("/calendario")}><CalendarDays size={15} /> Calendário</button></div>{calendar ? <CalendarView contents={contents} /> : <><div className="library-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar conteúdo" /></div><div className="filter-field"><Filter size={15} /><select value={filter} onChange={e => setFilter(e.target.value as ContentStatus | "todos")}><option value="todos">Todos os status</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><button className="filter-button"><ListFilter size={15} /> Filtros</button></div><div className="library-stats"><span><b>{filtered.length}</b> conteúdos encontrados</span><span className="local-data"><i /> Dados carregados do servidor</span></div><section className="panel library-panel"><div className="table-header"><span>Conteúdo</span><span>Cliente</span><span>Data</span><span>Status</span><span /></div>{filtered.map(item => <div className="table-row" key={item.id}><button className="table-content" onClick={() => go(`/criador?contentId=${item.id}`)}><div className={`content-thumb thumb-${item.type.toLowerCase()}`}>{item.type === "Reel" ? <Video size={17} /> : item.type === "Carrossel" ? <Layers3 size={17} /> : <Instagram size={17} />}</div><div><strong>{item.title}</strong><span>{item.type}{item.duration ? ` · ${item.duration}` : ""}</span></div></button><span>{item.client}</span><span>{item.date}</span><StatusPill status={item.status} /><div className="row-actions"><button className="row-more" onClick={() => go(`/criador?contentId=${item.id}`)} aria-label={`Editar ${item.title}`}><Pencil size={15} /></button><button className="row-more danger-icon" onClick={() => remove(item.id, item.title)} aria-label={`Excluir ${item.title}`}><Trash2 size={15} /></button></div></div>)}{filtered.length === 0 && <div className="empty-state"><Search size={22} /><strong>Nenhum conteúdo encontrado</strong><span>Crie um planejamento para ele aparecer aqui.</span></div>}</section></>}</>;
}

function CalendarView({ contents }: { contents: ContentRecord[] }) {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const dates = Array.from({ length: 35 }, (_, i) => i - 1);
  const planned = contents.filter(content => content.plannedAt);
  const eventForDay = (day: number) => planned.find(content => new Date(content.plannedAt as Date | string).getDate() === day);
  return <section className="calendar-layout"><div className="panel calendar-panel"><div className="calendar-head"><button className="icon-button"><ArrowLeft size={16} /></button><div><strong>Outubro 2026</strong><span>{planned.length} data(s) planejada(s) no banco</span></div><button className="icon-button"><ArrowRight size={16} /></button><button className="today-button">Hoje</button></div><div className="calendar-grid calendar-weekdays">{days.map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid calendar-days">{dates.map((date, index) => { const current = date > 0 && date <= 31; const event = current ? eventForDay(date) : undefined; return <div key={index} className={`calendar-cell ${!current ? "muted" : ""} ${date === 17 ? "today" : ""}`}><span>{current ? date : date === 0 ? 30 : date < 0 ? 28 + date : date - 31}</span>{event && <div className={`calendar-event event-${event.status === "failed" ? "warning" : "blue"}`}><i /> {event.title}</div>}</div>; })}</div></div><aside className="panel calendar-side"><span className="eyebrow">Próximas datas</span><h2>Agenda salva</h2>{planned.slice(0, 4).map(content => <div className="agenda-item" key={content.id}><span className="agenda-date">{new Date(content.plannedAt as Date | string).getDate()}<b>out</b></span><div><strong>{content.title}</strong><span><Clock3 size={13} /> {formatDate(content.plannedAt)} · {statusLabels[dbStatusToUi(content.status)]}</span></div></div>)}{planned.length === 0 && <div className="empty-state"><CalendarDays size={21} /><strong>Nenhuma data planejada</strong><span>Defina uma data no criador de Reel.</span></div>}<div className="calendar-note"><CalendarDays size={16} /><p>O calendário organiza o planejamento no banco. A publicação real só acontece com backend de filas e rede social conectada.</p></div></aside></section>;
}

function Integracoes() {
  const integrations = [{ icon: MessageSquareText, label: "Texto e roteiros", vendor: "Fornecedores de LLM", color: "blue" }, { icon: Video, label: "Vídeo e cenas", vendor: "Provedores de vídeo", color: "purple" }, { icon: Mic2, label: "Voz e narração", vendor: "Provedores de voz", color: "coral" }, { icon: Music2, label: "Música", vendor: "Provedores de áudio", color: "teal" }, { icon: Instagram, label: "Meta / Instagram", vendor: "OAuth oficial", color: "pink" }];
  return <><SectionIntro eyebrow="Conexões" title="Integrações de APIs" description="Empresas e conteúdos já usam o banco. Fornecedores externos ainda não estão conectados." action={<Button variant="outline" onClick={() => toast("Integrações externas não fazem parte desta etapa", { description: "Nenhuma credencial foi solicitada ou armazenada." })}><CircleHelp size={16} /> Como funciona?</Button>} /><div className="integration-callout"><div className="callout-icon"><LockKeyhole size={18} /></div><div><strong>Suas chaves nunca devem ir para o navegador</strong><p>As credenciais ficarão em um armazenamento seguro no servidor. Para Meta e Instagram, usaremos OAuth oficial — nunca peça sua senha aqui.</p></div></div><div className="integrations-grid">{integrations.map(({ icon: Icon, label, vendor, color }) => <div className="integration-card" key={label}><div className={`integration-logo ${color}`}><Icon size={21} /></div><div className="integration-card-copy"><div><strong>{label}</strong><span>{vendor}</span></div><span className="not-connected"><i /> Não conectado</span></div><p>Fornecedor substituível. A escolha real será feita no servidor e registrada por cliente.</p><button className="integration-connect" onClick={() => toast("Ainda não conectado", { description: "Este botão não executa nenhuma chamada externa." })}>Ver opções <ArrowRight size={15} /></button></div>)}</div><section className="panel architecture-panel"><div className="panel-heading"><div><span className="eyebrow">Preparado para crescer</span><h2>Como a arquitetura deve funcionar</h2></div><Zap size={20} className="panel-heading-icon" /></div><div className="architecture-steps"><ArchitectureStep number="01" title="Camada de fornecedores" text="Troque o fornecedor sem mudar o fluxo da marca." /><ArchitectureStep number="02" title="Servidor protegido" text="Segredos, OAuth e permissões ficam fora do navegador." /><ArchitectureStep number="03" title="Fila e tentativas" text="Jobs, logs e retries registram cada etapa sem prometer sucesso antes da hora." /></div></section></>;
}
function ArchitectureStep({ number, title, text }: { number: string; title: string; text: string }) { return <div className="architecture-step"><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></div>; }

function Configuracoes() {
  const [mode, setMode] = useState("manual");
  return <><SectionIntro eyebrow="Publicação" title="Configurações por cliente" description="Defina a regra de aprovação. A preferência é local até o servidor de publicação estar conectado." action={<Button className="primary-action" onClick={() => toast.success("Preferência visual salva nesta sessão")}><Save size={16} /> Salvar preferência</Button>} /><DemoNotice compact /><div className="settings-layout"><section className="panel settings-main"><div className="settings-client"><div className="avatar avatar-lilac">PF</div><div><strong>Empresa selecionada</strong><span>A publicação real ainda está bloqueada</span></div><ChevronDown size={16} /></div><div className="settings-section"><span className="eyebrow">Regra de aprovação</span><h2>Quando um conteúdo estiver pronto</h2><p className="settings-help">Escolha como sua equipe revisaria um conteúdo em uma versão conectada do produto.</p><div className="radio-cards"><label className={mode === "manual" ? "selected" : ""}><input type="radio" checked={mode === "manual"} onChange={() => setMode("manual")} /><span className="radio-dot" /><div><strong>Aprovação manual</strong><p>O conteúdo fica aguardando aprovação antes de qualquer publicação.</p></div><CheckCircle2 size={18} /></label><label className={mode === "automatic" ? "selected" : ""}><input type="radio" checked={mode === "automatic"} onChange={() => setMode("automatic")} /><span className="radio-dot" /><div><strong>Publicação automática</strong><p>Após a aprovação do fluxo, o servidor poderá agendar a publicação.</p></div><AlertTriangle size={18} /></label></div></div><div className="settings-section"><span className="eyebrow">Proteções</span><div className="protection-row"><div className="protection-icon"><ShieldCheck size={17} /></div><div><strong>Bloquear publicação sem integração</strong><p>Recomendado para evitar ações externas sem credenciais válidas.</p></div><span className="switch on"><i /></span></div><div className="protection-row"><div className="protection-icon"><Bell size={17} /></div><div><strong>Avisar quando houver falha</strong><p>Notificações reais dependem do backend de filas e eventos.</p></div><span className="switch on"><i /></span></div></div></section><aside className="panel settings-side"><div className="settings-side-icon"><LockKeyhole size={19} /></div><h2>Nada será publicado agora</h2><p>Mesmo selecionando publicação automática, este protótipo não tem credenciais, fila ou acesso à Meta.</p><span className="safe-badge"><Check size={14} /> Modo seguro ativo</span></aside></div></>;
}

function Seguranca() {
  return <><SectionIntro eyebrow="Governança" title="Segurança, uso e custo" description="A persistência usa o banco do servidor; integrações externas e uso/custo por fornecedor ainda não estão conectados." action={<Button variant="outline" onClick={() => toast("Exportação ainda não implementada")}><BarChart3 size={16} /> Exportar visão</Button>} /><div className="security-grid"><section className="panel cost-card"><div className="panel-heading"><div><span className="eyebrow">Banco de dados</span><h2>Persistência ativa</h2></div><ShieldCheck size={20} className="panel-heading-icon success-icon" /></div><div className="cost-total"><strong>Protegida</strong><span>por conta autenticada</span></div><div className="cost-breakdown"><div><i className="dot dot-purple" /><span>Empresas</span><b>Owner ID</b></div><div><i className="dot dot-coral" /><span>Conteúdos</span><b>Company ID</b></div><div><i className="dot dot-teal" /><span>Chaves externas</span><b>0 no frontend</b></div></div></section><section className="panel security-health"><div className="panel-heading"><div><span className="eyebrow">Saúde operacional</span><h2>Proteções</h2></div><ShieldCheck size={20} className="panel-heading-icon success-icon" /></div><div className="health-row"><span><LockKeyhole size={15} /> Segredos no navegador</span><strong className="health-good">0 encontrados</strong></div><div className="health-row"><span><Users2 size={15} /> Isolamento por cliente</span><strong className="health-good">Ativo</strong></div><div className="health-row"><span><RotateCcw size={15} /> Retentativas de fila</span><strong className="health-plan">Planejado</strong></div><div className="health-row"><span><Activity size={15} /> Logs de publicação</span><strong className="health-plan">Planejado</strong></div></section></div><section className="panel usage-panel"><div className="panel-heading"><div><span className="eyebrow">Persistência</span><h2>Escopo desta etapa</h2></div><span className="local-data"><i /> Banco gerenciado</span></div><div className="usage-table"><div className="usage-header"><span>Recurso</span><span>Servidor</span><span>Banco</span><span>Estado</span></div><div className="usage-row"><span><Store size={15} /> Empresas</span><span>tRPC</span><span>MySQL</span><b className="health-good">Ativo</b></div><div className="usage-row"><span><FileText size={15} /> Conteúdos</span><span>tRPC</span><span>MySQL</span><b className="health-good">Ativo</b></div><div className="usage-row"><span><Instagram size={15} /> Meta / Instagram</span><span>Não usado</span><span>—</span><b className="health-plan">Pendente</b></div></div></section></>;
}

function NavLink({ item, active, go }: { item: NavItem; active: boolean; go: (route: string) => void }) { const Icon = item.icon; return <button className={`nav-link ${active ? "active" : ""}`} onClick={() => go(item.route)}><Icon size={17} /><span>{item.label}</span>{item.view === "integracoes" && <i className="nav-alert" />}</button>; }

function Studio() {
  const [location, navigate] = useLocation();
  const activeView = routeToView(location);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(null);
  const auth = useAuth({ redirectOnUnauthenticated: false });
  const companiesQuery = trpc.companies.list.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false, refetchOnWindowFocus: false });
  const contentsQuery = trpc.contents.list.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false, refetchOnWindowFocus: false });
  const companies = (companiesQuery.data ?? []) as CompanyRecord[];
  const contents = (contentsQuery.data ?? []) as ContentRecord[];
  const activeCompany = companies.find(company => company.id === activeCompanyId) ?? companies[0];

  useEffect(() => {
    if (activeCompany && activeCompanyId !== activeCompany.id) setActiveCompanyId(activeCompany.id);
    if (!activeCompany && companies.length === 0 && activeCompanyId !== null) setActiveCompanyId(null);
  }, [activeCompany?.id, activeCompanyId, companies.length]);

  const go = (route: string) => { setMobileMenuOpen(false); navigate(route); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const refresh = async () => { await Promise.all([companiesQuery.refetch(), contentsQuery.refetch()]); };
  const currentLabel = navItems.find(item => item.view === activeView)?.label ?? "Painel geral";
  const renderView = () => {
    if (activeView === "empresa") return <Empresa companies={companies} activeCompany={activeCompany} onSelect={setActiveCompanyId} onRefresh={refresh} />;
    if (activeView === "criador") return <Criador go={go} activeCompany={activeCompany} />;
    if (activeView === "biblioteca") return <Biblioteca go={go} contents={contents} />;
    if (activeView === "calendario") return <Biblioteca go={go} calendar contents={contents} />;
    if (activeView === "integracoes") return <Integracoes />;
    if (activeView === "seguranca") return <Seguranca />;
    if (activeView === "configuracoes") return <Configuracoes />;
    return <Dashboard go={go} companies={companies} contents={contents} activeCompany={activeCompany} />;
  };

  if (auth.loading) return <div className="loading-screen"><div className="brand-mark"><span>P</span></div><strong>Carregando seu workspace…</strong></div>;
  if (!auth.isAuthenticated) return <AuthGate />;
  if (companiesQuery.error || contentsQuery.error) return <PersistenceError message={companiesQuery.error?.message || contentsQuery.error?.message || "Resposta inválida do servidor"} />;
  if (companiesQuery.isLoading || contentsQuery.isLoading) return <div className="loading-screen"><div className="brand-mark"><span>P</span></div><strong>Carregando dados persistidos…</strong></div>;

  return <div className="app-shell"><aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}><div className="brand"><div className="brand-mark"><span>P</span></div><div><strong>PostaFácil</strong><small>STUDIO</small></div><button className="mobile-close" onClick={() => setMobileMenuOpen(false)}><X size={18} /></button></div><div className="workspace-label">Workspace</div><button className="workspace-select" onClick={() => go("/empresa")}><div className="avatar avatar-lilac small">{activeCompany ? initials(activeCompany.name) : "—"}</div><div><strong>{activeCompany?.name || "Nenhuma empresa"}</strong><span>{companies.length} empresa(s) na sua conta</span></div><ChevronDown size={15} /></button><nav className="sidebar-nav"><span className="nav-label">Operação</span>{navItems.slice(0, 5).map(item => <NavLink key={item.view} item={item} active={activeView === item.view} go={go} />)}<span className="nav-label nav-label-spaced">Administração</span>{navItems.slice(5).map(item => <NavLink key={item.view} item={item} active={activeView === item.view} go={go} />)}</nav><div className="sidebar-bottom"><div className="secure-mini"><ShieldCheck size={15} /><span><strong>Modo seguro</strong><small>Dados por conta</small></span><i /></div><button className="user-row"><div className="avatar avatar-dark small">{initials(auth.user?.name)}</div><div><strong>{auth.user?.name || "Usuário"}</strong><span>Conta autenticada</span></div><MoreHorizontal size={16} /></button></div></aside><div className="main-shell"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>PostaFácil Studio</span><ArrowRight size={13} /><strong>{currentLabel}</strong></div><div className="topbar-actions"><span className="topbar-demo"><i /> Banco conectado</span><button className="icon-button"><Bell size={18} /><i className="notification-dot" /></button><div className="top-avatar">{initials(auth.user?.name)}</div></div></header><main className="page-content">{renderView()}</main><nav className="mobile-bottom-nav">{navItems.slice(0, 4).map(item => <button key={item.view} className={activeView === item.view ? "active" : ""} onClick={() => go(item.route)}><item.icon size={18} /><span>{item.view === "dashboard" ? "Início" : item.view === "criador" ? "Criar" : item.view === "biblioteca" ? "Conteúdos" : "Empresas"}</span></button>)}<button className={activeView === "integracoes" || activeView === "seguranca" ? "active" : ""} onClick={() => go("/integracoes")}><MoreHorizontal size={18} /><span>Mais</span></button></nav></div></div>;
}

export default Studio;
