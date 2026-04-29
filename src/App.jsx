// src/App.jsx
// CRM Móveis Planejados — integrado com Supabase
// Requer: npm install @supabase/supabase-js

/*
-- NOVAS TABELAS PARA RODAR NO SUPABASE --

-- Parcelas financeiras por projeto
create table if not exists parcelas (
  id           uuid primary key default gen_random_uuid(),
  projeto_id   uuid references projetos(id) on delete cascade,
  cliente_id   uuid references clientes(id) on delete cascade,
  descricao    text, -- "Entrada", "Medição", "Entrega", "Saldo final", etc.
  valor        numeric default 0,
  data_prevista text,
  data_recebida text,
  status       text default 'em_aberto', -- 'em_aberto' | 'pago' | 'atrasado'
  created_at   timestamptz default now()
);
create index if not exists parcelas_projeto_id_idx on parcelas(projeto_id);
create index if not exists parcelas_cliente_id_idx on parcelas(cliente_id);

-- Pós-venda por cliente
create table if not exists pos_venda (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid references clientes(id) on delete cascade,
  data_entrega        text,
  nps                 integer check (nps between 1 and 5),
  potencial_indicacao boolean default false,
  solicitacoes        text, -- garantia, assistência etc.
  obs                 text,
  created_at          timestamptz default now()
);
create index if not exists pos_venda_cliente_id_idx on pos_venda(cliente_id);

-- Meta mensal (tabela simples, 1 registro por mês)
create table if not exists metas (
  id        uuid primary key default gen_random_uuid(),
  mes       text, -- formato "YYYY-MM"
  valor     numeric default 0,
  created_at timestamptz default now()
);

-- Índices adicionais
create index if not exists projetos_cliente_id_idx on projetos(cliente_id);
create index if not exists historico_cliente_id_idx on historico(cliente_id);
create index if not exists tarefas_cliente_id_idx on tarefas(cliente_id);
*/

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://SEU-PROJETO.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY || "SUA-ANON-KEY"
);

// ─── Estilos globais ─────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg0:#F0F2F8;--bg1:#FFFFFF;--bg2:#F7F8FC;--bg3:#ECEEF5;--bg4:#E2E5EF;
      --border:#DDE1ED;--border-hover:#C4C9DE;
      --sidebar:#0D1117;--sidebar-border:#1E2533;--sidebar-hover:#161D2A;
      --accent:#C9A84C;--accent-light:#FBF5E6;--accent-mid:#E8D49A;
      --accent2:#4F46E5;--accent2-light:#EEF2FF;--accent2-mid:#C7D2FE;
      --text-primary:#0D1117;--text-secondary:#3D4663;--text-muted:#8890A8;
      --success:#059669;--success-bg:#ECFDF5;--success-border:#A7F3D0;
      --danger:#DC2626;--danger-bg:#FEF2F2;--danger-border:#FECACA;
      --warning:#D97706;--warning-bg:#FFFBEB;--warning-border:#FDE68A;
      --info:#2563EB;--info-bg:#EFF6FF;--info-border:#BFDBFE;
    }
    html,body{height:100%;}
    body{background:var(--bg0);color:var(--text-primary);font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;}
    #root{height:100vh;display:flex;flex-direction:column;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:var(--bg3);}
    ::-webkit-scrollbar-thumb{background:var(--accent-mid);border-radius:99px;}
    input,select,textarea{background:var(--bg1);border:1.5px solid var(--border);color:var(--text-primary);font-family:'Plus Jakarta Sans',sans-serif;border-radius:8px;outline:none;transition:border .18s,box-shadow .18s;}
    input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(201,168,76,.12);}
    input::placeholder,textarea::placeholder{color:var(--text-muted);}
    select option{background:var(--bg1);}
    .card{background:var(--bg1);border:1.5px solid var(--border);border-radius:16px;padding:1.25rem;transition:border .2s,box-shadow .2s;box-shadow:0 1px 4px rgba(13,17,23,.04);}
    .card-click{cursor:pointer;}
    .card-click:hover{border-color:var(--accent-mid);box-shadow:0 4px 20px rgba(201,168,76,.10);transform:translateY(-1px);transition:all .2s;}
    .metric-card{background:var(--bg1);border:1.5px solid var(--border);border-radius:12px;padding:1rem 1.1rem;box-shadow:0 1px 4px rgba(13,17,23,.04);}
    .btn{border-radius:8px;cursor:pointer;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s;display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:6px 14px;border:1.5px solid;letter-spacing:.01em;}
    .btn-default{background:var(--bg1);border-color:var(--border);color:var(--text-secondary);}
    .btn-default:hover{border-color:var(--border-hover);color:var(--text-primary);background:var(--bg2);}
    .btn-primary{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(201,168,76,.30);}
    .btn-primary:hover{filter:brightness(1.06);box-shadow:0 4px 14px rgba(201,168,76,.40);}
    .btn-ghost{background:transparent;border-color:transparent;color:var(--text-muted);}
    .btn-ghost:hover{color:var(--text-secondary);background:var(--bg3);}
    .btn-danger{background:var(--danger-bg);border-color:var(--danger-border);color:var(--danger);}
    .pill{display:inline-block;font-size:10px;padding:2px 9px;border-radius:99px;font-weight:700;white-space:nowrap;letter-spacing:.04em;}
    .tab-btn{background:none;border:none;border-bottom:2px solid transparent;color:var(--text-muted);font-size:13px;font-weight:500;padding:9px 16px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;letter-spacing:.01em;}
    .tab-btn:hover{color:var(--text-secondary);}
    .tab-btn.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:700;}
    .nav-btn{width:100%;display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:3px;transition:all .18s;text-align:left;color:#8890A8;background:transparent;}
    .nav-btn:hover{background:var(--sidebar-hover);color:#C8CDDB;}
    .nav-btn.active{background:rgba(201,168,76,.15);color:var(--accent);font-weight:700;border:1px solid rgba(201,168,76,.20);}
    .field-row{display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:1.5px solid var(--border);font-size:13px;}
    .field-row:last-child{border-bottom:none;}
    .hist-entry{display:flex;gap:12px;padding:13px 0;border-bottom:1.5px solid var(--border);}
    .hist-entry:last-child{border-bottom:none;}
    .kanban-col{min-width:175px;flex:0 0 175px;background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;padding:10px 8px;transition:border .15s;}
    .kanban-col.drag-over{border-color:var(--accent);background:var(--accent-light);}
    .kanban-card{background:var(--bg1);border:1.5px solid var(--border);border-radius:9px;padding:10px;margin-bottom:5px;cursor:grab;transition:all .15s;}
    .kanban-card:hover{border-color:var(--accent-mid);box-shadow:0 2px 8px rgba(79,70,229,.08);transform:translateY(-1px);}
    .filter-chip{font-size:11px;padding:4px 12px;border-radius:99px;border:1.5px solid var(--border);color:var(--text-muted);background:transparent;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;font-weight:500;}
    .filter-chip.active{background:var(--accent-light);border-color:var(--accent-mid);color:var(--accent);font-weight:600;}
    .section-label{font-size:10px;font-weight:700;letter-spacing:.09em;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;}
    .accent-bar{width:24px;height:3px;background:var(--accent);border-radius:99px;margin-bottom:8px;}
    .skeleton{background:linear-gradient(90deg,var(--bg3) 25%,var(--bg4) 50%,var(--bg3) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
    @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
    .fade-in{animation:fadeIn .22s ease;}
    .spinner{width:18px;height:18px;border:2px solid var(--accent-mid);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}
    @keyframes spin{to{transform:rotate(360deg);}}
  `}</style>
);

// ─── Constantes ───────────────────────────────────────────────────────────────
const ETAPAS = ["Lead","Visita técnica","Orçamento","Negociação","Contrato","Produção","Entrega"];
const CORES_AVATAR = ["#4F46E5","#0891B2","#DC2626","#059669","#7C3AED","#D97706","#DB2777"];
const ES = {
  "Lead":          {bg:"#EFF6FF",text:"#1D4ED8",bd:"#BFDBFE"},
  "Visita técnica":{bg:"#F0F9FF",text:"#0369A1",bd:"#BAE6FD"},
  "Orçamento":     {bg:"#FFFBEB",text:"#B45309",bd:"#FDE68A"},
  "Negociação":    {bg:"#FFF7ED",text:"#C2410C",bd:"#FED7AA"},
  "Contrato":      {bg:"#ECFDF5",text:"#047857",bd:"#A7F3D0"},
  "Produção":      {bg:"#F5F3FF",text:"#6D28D9",bd:"#DDD6FE"},
  "Entrega":       {bg:"#F0FDF4",text:"#166534",bd:"#BBF7D0"},
};
const TS = {
  WhatsApp:{icon:"💬",color:"#059669",bg:"#ECFDF5"},
  Ligação: {icon:"📞",color:"#4F46E5",bg:"#EEF2FF"},
  Reunião: {icon:"🤝",color:"#D97706",bg:"#FFFBEB"},
  Visita:  {icon:"🏠",color:"#0891B2",bg:"#F0F9FF"},
  Nota:    {icon:"📝",color:"#64748B",bg:"#F8FAFC"},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = v => "R$\u00A0" + Number(v||0).toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2});
const hoje = new Date();
const hojeStr = hoje.toISOString().split('T')[0];
const isAtrasada = (p) => {
  if (!p) return false;
  const pd = new Date(p);
  pd.setHours(0,0,0,0);
  const hd = new Date();
  hd.setHours(0,0,0,0);
  return pd < hd;
};
const isHoje = (p) => {
  if (!p) return false;
  const pd = new Date(p);
  pd.setHours(0,0,0,0);
  const hd = new Date();
  hd.setHours(0,0,0,0);
  return pd.getTime() === hd.getTime();
};
const initials = nome => nome?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "??";
const dataBR = () => new Date().toLocaleDateString("pt-BR");
const horaBR = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})+"h";

const daysBetween = (d1, d2) => {
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// Normalizadores
const normCliente = c => ({
  ...c,
  indicadoPor: c.indicado_por || "",
  primeiroContato: c.primeiro_contato || dataBR(),
  avatar: initials(c.nome),
  ambientes: c.ambientes || [],
});
const normProjeto = p => ({
  ...p,
  clienteId: p.cliente_id,
  prazoEntrega: p.prazo_entrega || "",
  ambientes: Array.isArray(p.ambientes) ? p.ambientes : [],
});
const normHist = h => ({ ...h, clienteId: h.cliente_id, tags: h.tags || [] });
const normTarefa = t => ({ ...t, clienteId: t.cliente_id });
const normParcela = p => ({ ...p, projetoId: p.projeto_id, clienteId: p.cliente_id, dataPrevista: p.data_prevista, dataRecebida: p.data_recebida });
const normPosVenda = p => ({ ...p, clienteId: p.cliente_id, dataEntrega: p.data_entrega, potencialIndicacao: p.potencial_indicacao });
const normMeta = m => ({ ...m });

// ─── Componentes base ─────────────────────────────────────────────────────────
const EtapaBadge = ({etapa}) => {
  const s = ES[etapa]||{bg:"#F1F5F9",text:"#475569",bd:"#E2E8F0"};
  return <span className="pill" style={{background:s.bg,color:s.text,border:`1.5px solid ${s.bd}`}}>{etapa}</span>;
};

const Avatar = ({initials:ini, cor, size=38}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:`${cor}20`,border:`1.5px solid ${cor}45`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.3,fontWeight:700,color:cor,flexShrink:0}}>
    {ini}
  </div>
);

const MetricCard = ({label,value,sub,subColor}) => (
  <div className="metric-card">
    <p style={{fontSize:10,color:"var(--text-muted)",margin:"0 0 6px",fontWeight:700,textTransform:"uppercase",letterSpacing:".09em"}}>{label}</p>
    <p style={{fontSize:22,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px",fontFamily:"'DM Mono',monospace"}}>{value}</p>
    {sub && <p style={{fontSize:11,color:subColor||"var(--text-muted)",margin:0,fontWeight:500}}>{sub}</p>}
  </div>
);

const Divider = () => <div style={{height:1.5,background:"var(--border)",margin:"12px 0"}} />;

const Spinner = ({texto="Carregando..."}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,padding:"2rem",color:"var(--text-muted)",fontSize:13,justifyContent:"center"}}>
    <div className="spinner"/> {texto}
  </div>
);

const Toast = ({msg,tipo="ok",onClose}) => (
  <div style={{position:"fixed",bottom:24,right:24,zIndex:2000,background:tipo==="ok"?"var(--success-bg)":"var(--danger-bg)",border:`1.5px solid ${tipo==="ok"?"var(--success-border)":"var(--danger-border)"}`,color:tipo==="ok"?"var(--success)":"var(--danger)",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,0,0,.12)"}}>
    <span>{tipo==="ok"?"✓":"✕"}</span>
    <span>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"inherit",marginLeft:4}}>×</button>
  </div>
);

const Input = ({label,value,onChange,placeholder,type="text",min,max}) => (
  <div style={{marginBottom:12}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
      style={{width:"100%",padding:"9px 12px",fontSize:13}} />
  </div>
);

const Sel = ({label,value,onChange,options}) => (
  <div style={{marginBottom:12}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"9px 12px",fontSize:13,cursor:"pointer"}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Modal = ({title,onClose,children,maxWidth=520}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} className="fade-in"
      style={{background:"var(--bg1)",border:"1.5px solid var(--border)",borderRadius:16,padding:"1.75rem",width:"100%",maxWidth,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(15,23,42,.18)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22}}>
        <div><div className="accent-bar"/><h3 style={{margin:0,fontSize:16,fontWeight:700,color:"var(--text-primary)"}}>{title}</h3></div>
        <button onClick={onClose} style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:8,width:28,height:28,cursor:"pointer",color:"var(--text-muted)",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Hook de toast ────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null), 3500); };
  return { toast, show };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({clientes,projetos,tarefas,historico,parcelas,metas,setMetas,loading,setView,setClienteSelecionado,toast}) {
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [novaMeta, setNovaMeta] = useState("");
  const [salvandoMeta, setSalvandoMeta] = useState(false);
  const [hidePainel, setHidePainel] = useState(false);

  const receita = projetos.filter(p=>["Contrato","Produção","Entrega"].includes(p.etapa)).reduce((s,p)=>s+(p.valor||0),0);
  const fechados = clientes.filter(c=>["Contrato","Produção","Entrega"].includes(c.etapa)).length;
  const ticket = fechados ? Math.round(receita/fechados) : 0;
  
  const pendentes = tarefas.filter(t=>!t.concluida);
  const atrasadas = pendentes.filter(t=>isAtrasada(t.prazo));
  const paraHoje = pendentes.filter(t=>isHoje(t.prazo));
  
  const parcelasAtrasadas = parcelas.filter(p => p.status === "atrasado" || (p.status === "em_aberto" && isAtrasada(p.dataPrevista)));
  const inadimplencia = parcelasAtrasadas.reduce((s,p)=>s+(Number(p.valor)||0),0);

  const porEtapa = ETAPAS.map(e=>({etapa:e,count:clientes.filter(c=>c.etapa===e).length}));
  const maxC = Math.max(...porEtapa.map(e=>e.count),1);

  // F6 - Clientes sem follow up
  const clientesAtrasados = clientes.filter(c => {
    if(!["Orçamento", "Negociação"].includes(c.etapa)) return false;
    const ch = historico.filter(h => h.clienteId === c.id);
    const lastDate = ch.length > 0 ? new Date(Math.max(...ch.map(h => new Date(h.created_at)))) : new Date(c.created_at);
    return daysBetween(lastDate, hoje) >= 7;
  });

  // F3 - Meta
  const mesAtual = hoje.toISOString().slice(0, 7); // "YYYY-MM"
  const metaMes = metas.find(m => m.mes === mesAtual);
  
  const addMeta = async () => {
    setSalvandoMeta(true);
    const val = parseFloat(novaMeta) || 0;
    if (val <= 0) { toast.show("Digite um valor válido", "erro"); setSalvandoMeta(false); return; }
    
    // Atualiza estado local imediatamente para o usuário ver o resultado
    const novoRegistro = { id: metaMes?.id || `local-${Date.now()}`, mes: mesAtual, valor: val };
    if (metaMes) {
      setMetas(prev => prev.map(m => m.mes === mesAtual ? {...m, valor: val} : m));
    } else {
      setMetas(prev => [...prev, novoRegistro]);
    }
    setShowMetaModal(false);
    setSalvandoMeta(false);
    toast.show("Meta definida!");

    // Persiste no Supabase em background
    if (metaMes) {
      supabase.from("metas").update({valor: val}).eq("id", metaMes.id).then(({error}) => {
        if(error) toast.show("Aviso: meta salva localmente, sem sincronizar com banco", "erro");
      });
    } else {
      supabase.from("metas").insert([{mes: mesAtual, valor: val}]).select().single().then(({data, error}) => {
        if(!error && data) setMetas(prev => prev.map(m => m.mes === mesAtual ? {...m, id: data.id} : m));
        else if(error) toast.show("Aviso: meta salva localmente, sem sincronizar com banco", "erro");
      });
    }
  };

  const showPainel = !hidePainel && (atrasadas.length > 0 || paraHoje.length > 0 || parcelasAtrasadas.length > 0 || clientesAtrasados.length > 0);

  return (
    <div className="fade-in">
      <div style={{marginBottom:28}}>
        <div className="accent-bar"/>
        <h1 style={{fontSize:24,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px"}}>Dashboard</h1>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>Visão geral · {new Date().toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</p>
      </div>

      {loading ? <Spinner texto="Carregando dados..."/> : (
        <>
          {showPainel && (
            <div className="card fade-in" style={{marginBottom: 20, border: "1.5px solid var(--warning-border)", background: "var(--warning-bg)", position: "relative"}}>
              <button onClick={() => setHidePainel(true)} style={{position: "absolute", top: 10, right: 10, background: "transparent", border: "none", cursor: "pointer", fontSize: 18, color: "var(--warning)"}}>×</button>
              <p className="section-label" style={{color: "var(--warning)"}}>Atenção</p>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
                {atrasadas.length > 0 && <div onClick={()=>setView('tarefas')} className="card-click" style={{padding: "8px 12px", background: "var(--bg1)", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--danger-border)"}}><span style={{fontSize: 18}}>🔴</span> <span style={{fontSize: 13, fontWeight: 600}}>{atrasadas.length} tarefas atrasadas</span></div>}
                {paraHoje.length > 0 && <div onClick={()=>setView('tarefas')} className="card-click" style={{padding: "8px 12px", background: "var(--bg1)", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--info-border)"}}><span style={{fontSize: 18}}>📅</span> <span style={{fontSize: 13, fontWeight: 600}}>{paraHoje.length} tarefas para hoje</span></div>}
                {parcelasAtrasadas.length > 0 && <div className="card-click" style={{padding: "8px 12px", background: "var(--bg1)", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--danger-border)"}}><span style={{fontSize: 18}}>💰</span> <span style={{fontSize: 13, fontWeight: 600}}>{parcelasAtrasadas.length} parcelas em atraso</span></div>}
                {clientesAtrasados.length > 0 && <div onClick={()=>setView('pipeline')} className="card-click" style={{padding: "8px 12px", background: "var(--bg1)", borderRadius: 8, display: "flex", gap: 8, alignItems: "center", border: "1px solid var(--border)"}}><span style={{fontSize: 18}}>👻</span> <span style={{fontSize: 13, fontWeight: 600}}>{clientesAtrasados.length} clientes sem follow-up há 7+ dias</span></div>}
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            <MetricCard label="Receita em carteira" value={fmt(receita)} sub="Contratos + produção" subColor="var(--accent)"/>
            <MetricCard label="Clientes ativos" value={clientes.length} sub={`${fechados} com contrato`}/>
            <MetricCard label="Ticket médio" value={fmt(ticket)} sub="Por projeto fechado"/>
            <MetricCard label="Inadimplência" value={fmt(inadimplencia)} sub={`${parcelasAtrasadas.length} parcelas atrasadas`} subColor={inadimplencia > 0 ? "var(--danger)" : "var(--success)"}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:12,marginBottom:12}}>
            <div className="card">
              <p className="section-label">Funil de conversão</p>
              {porEtapa.map(({etapa,count})=>{
                const s=ES[etapa]||{};
                return (
                  <div key={etapa} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                    <span style={{fontSize:12,color:"var(--text-secondary)",width:114,flexShrink:0,fontWeight:500}}>{etapa}</span>
                    <div style={{flex:1,background:"var(--bg3)",borderRadius:99,height:20,overflow:"hidden",border:"1.5px solid var(--border)"}}>
                      <div style={{width:Math.round(count/maxC*100)+"%",minWidth:count>0?28:0,height:"100%",background:s.bg||"var(--bg3)",borderRadius:99,display:"flex",alignItems:"center",paddingLeft:8,transition:"width .6s ease",border:`1px solid ${s.bd||"transparent"}`}}>
                        {count>0 && <span style={{fontSize:10,fontWeight:700,color:s.text||"var(--text-muted)",fontFamily:"'DM Mono',monospace"}}>{count}</span>}
                      </div>
                    </div>
                    <span style={{fontSize:11,color:"var(--text-muted)",width:14,textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:600}}>{count}</span>
                  </div>
                );
              })}
            </div>

            <div style={{display: "flex", flexDirection: "column", gap: 12}}>
              <div className="card">
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <p className="section-label" style={{margin: 0}}>Meta do Mês</p>
                  {metaMes && <button onClick={()=>{setNovaMeta(metaMes.valor); setShowMetaModal(true);}} style={{background: "none", border: "none", cursor: "pointer", fontSize: 14}}>✏️</button>}
                </div>
                {!metaMes ? (
                  <div style={{textAlign: "center", padding: "1.5rem 0"}}>
                    <button className="btn btn-primary" onClick={()=>{setNovaMeta(""); setShowMetaModal(true);}}>Definir meta do mês</button>
                  </div>
                ) : (
                  <div style={{marginTop: 10}}>
                    <p style={{margin: "0 0 5px", fontSize: 13, fontWeight: 600}}><span style={{color: "var(--accent)", fontSize: 18}}>{fmt(receita)}</span> de {fmt(metaMes.valor)}</p>
                    <div style={{background: "var(--bg3)", borderRadius: 99, height: 12, overflow: "hidden", marginBottom: 8}}>
                      <div style={{
                        width: `${Math.min((receita / metaMes.valor) * 100, 100)}%`, 
                        height: "100%", 
                        background: (receita/metaMes.valor) >= 0.8 ? "var(--success)" : (receita/metaMes.valor) >= 0.5 ? "var(--warning)" : "var(--danger)"
                      }}/>
                    </div>
                    {receita < metaMes.valor ? (
                      <p style={{margin: 0, fontSize: 11, color: "var(--text-muted)"}}>Faltam {ticket > 0 ? Math.ceil((metaMes.valor - receita) / ticket) : 0} contratos para bater a meta</p>
                    ) : (
                      <p style={{margin: 0, fontSize: 11, color: "var(--success)", fontWeight: 600}}>Meta batida! 🎉</p>
                    )}
                  </div>
                )}
              </div>

              <div className="card" style={{flex: 1}}>
                <p className="section-label">Tarefas do dia</p>
                {pendentes.length===0 && <p style={{fontSize:13,color:"var(--text-muted)",textAlign:"center",padding:"1rem 0"}}>Tudo em dia ✓</p>}
                {pendentes.slice(0,5).map(t=>{
                  const c=clientes.find(cl=>cl.id===t.clienteId);
                  const atras=isAtrasada(t.prazo);
                  return (
                    <div key={t.id} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"6px 0",borderBottom:"1.5px solid var(--border)"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:atras?"var(--danger)":t.prioridade==="alta"?"var(--warning)":"var(--text-muted)",flexShrink:0,marginTop:5}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{margin:0,fontSize:12,fontWeight:600,color:atras?"var(--danger)":"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.titulo}</p>
                        <p style={{margin:0,fontSize:11,color:"var(--text-muted)"}}>{c?.nome}{atras&&<span style={{color:"var(--danger)"}}> · Atrasada</span>}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {projetos.length>0 && (
            <div className="card">
              <p className="section-label">Projetos em andamento</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {projetos.slice(0,3).map(p=>{
                  const c=clientes.find(cl=>cl.id===p.clienteId);
                  return (
                    <div key={p.id} style={{background:"var(--bg2)",borderRadius:10,padding:"12px",border:"1.5px solid var(--border)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'DM Mono',monospace",fontWeight:700}}>#{p.numero||"—"}</span>
                        <EtapaBadge etapa={p.etapa}/>
                      </div>
                      <p style={{margin:"0 0 2px",fontSize:13,fontWeight:700,color:"var(--text-primary)"}}>{c?.nome||"—"}</p>
                      <p style={{margin:"0 0 10px",fontSize:11,color:"var(--text-muted)"}}>{Array.isArray(p.ambientes)?p.ambientes.length:0} ambiente{(Array.isArray(p.ambientes)&&p.ambientes.length)!==1?"s":""} · {p.prazoEntrega||"—"}</p>
                      <p style={{margin:0,fontSize:17,fontWeight:700,color:"var(--accent)",fontFamily:"'DM Mono',monospace"}}>{fmt(p.valor)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showMetaModal && (
        <Modal title="Definir Meta" onClose={() => setShowMetaModal(false)}>
          <Input type="number" label="Valor da meta (R$)" value={novaMeta} onChange={setNovaMeta} />
          <div style={{display:"flex",gap:8,justifyContent:"flex-end", marginTop: 15}}>
            <button className="btn btn-default" onClick={()=>setShowMetaModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={addMeta} disabled={salvandoMeta}>{salvandoMeta?"Salvando...":"Salvar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
function Clientes({clientes,setClientes,historico,tarefas,posVenda,setView,setClienteSelecionado,loading,toast}) {
  const [busca,setBusca]=useState("");
  const [filtro,setFiltro]=useState("Todos");
  const [filtroPer,setFiltroPer]=useState("Todos");
  const [filtroOrig,setFiltroOrig]=useState("Todas");
  
  const [showForm,setShowForm]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [novo,setNovo]=useState({nome:"",telefone:"",email:"",origem:"Indicação",imovel:"Apartamento",cidade:"",etapa:"Lead",obs:"",indicadoPor:""});

  const origensUnicas = ["Todas", ...new Set(clientes.map(c => c.origem).filter(Boolean))];

  const filtrados=clientes.filter(c=>{
    const mb=c.nome?.toLowerCase().includes(busca.toLowerCase())||c.email?.toLowerCase().includes(busca.toLowerCase());
    const me = filtro==="Todos"||c.etapa===filtro;
    const mo = filtroOrig==="Todas"||c.origem===filtroOrig;
    
    let mp = true;
    if (filtroPer !== "Todos") {
      const cd = new Date(c.created_at || new Date());
      const hoje = new Date();
      if (filtroPer === "Esta semana") {
        mp = daysBetween(cd, hoje) <= 7;
      } else if (filtroPer === "Este mês") {
        mp = cd.getMonth() === hoje.getMonth() && cd.getFullYear() === hoje.getFullYear();
      } else if (filtroPer === "Mês passado") {
        const lastMonth = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        mp = cd.getMonth() === lastMonth.getMonth() && cd.getFullYear() === lastMonth.getFullYear();
      }
    }
    return mb && me && mo && mp;
  });

  const add=async()=>{
    if(!novo.nome.trim())return;
    setSalvando(true);
    const cor=CORES_AVATAR[clientes.length%CORES_AVATAR.length];
    const payload={
      nome:novo.nome.trim(), telefone:novo.telefone, email:novo.email,
      origem:novo.origem, imovel:novo.imovel, cidade:novo.cidade,
      etapa:novo.etapa, obs:novo.obs, cor,
      indicado_por: novo.origem === "Indicação" ? novo.indicadoPor : "", 
      ambientes:[], metragem:"",
      primeiro_contato:dataBR(),
    };
    const {data,error}=await supabase.from("clientes").insert([payload]).select().single();
    setSalvando(false);
    if(error){toast.show("Erro ao salvar cliente: "+error.message,"erro");return;}
    setClientes(prev=>[normCliente(data),...prev]);
    setNovo({nome:"",telefone:"",email:"",origem:"Indicação",imovel:"Apartamento",cidade:"",etapa:"Lead",obs:"",indicadoPor:""});
    setShowForm(false);
    toast.show("Cliente salvo com sucesso!");
  };

  const exportarCSV = () => {
    const colunas = ["Nome", "Telefone", "Email", "Cidade", "Origem", "Etapa", "Imóvel", "Metragem", "Primeiro Contato"];
    const linhas = filtrados.map(c => [
      c.nome, c.telefone, c.email, c.cidade, c.origem, c.etapa, c.imovel, c.metragem, c.primeiroContato
    ].map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [colunas.join(","), ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_${dataBR().replace(/\//g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
        <div><div className="accent-bar"/><h1 style={{fontSize:24,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px"}}>Clientes</h1><p style={{fontSize:13,color:"var(--text-muted)"}}>{clientes.length} cadastrados</p></div>
        <div style={{display: "flex", gap: 10}}>
          <button className="btn btn-default" onClick={exportarCSV}>↓ Exportar CSV</button>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Novo cliente</button>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar cliente..." style={{flex:1,minWidth:160,padding:"8px 12px",fontSize:13}}/>
        <select value={filtro} onChange={e=>setFiltro(e.target.value)} style={{padding:"8px 12px",fontSize:13,cursor:"pointer"}}>
          <option>Todos</option>
          {ETAPAS.map(e=><option key={e}>{e}</option>)}
        </select>
        <select value={filtroPer} onChange={e=>setFiltroPer(e.target.value)} style={{padding:"8px 12px",fontSize:13,cursor:"pointer"}}>
          {["Todos", "Esta semana", "Este mês", "Mês passado"].map(e=><option key={e}>{e}</option>)}
        </select>
        <select value={filtroOrig} onChange={e=>setFiltroOrig(e.target.value)} style={{padding:"8px 12px",fontSize:13,cursor:"pointer"}}>
          {origensUnicas.map(e=><option key={e}>{e}</option>)}
        </select>
      </div>

      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtrados.map(c=>{
            const hist=historico.filter(h=>h.clienteId===c.id).length;
            const tarf=tarefas.filter(t=>(t.clienteId===c.id)&&!t.concluida).length;
            const pv = posVenda.find(p => p.clienteId === c.id);
            return (
              <div key={c.id} className="card card-click" onClick={()=>{setClienteSelecionado(c.id);setView("cliente-detalhe");}} style={{padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Avatar initials={initials(c.nome)} cor={c.cor||"#4F46E5"}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:700,color:"var(--text-primary)"}}>{c.nome}</span>
                      <EtapaBadge etapa={c.etapa}/>
                      {pv?.potencialIndicacao && <span title="Potencial de Indicação" style={{fontSize: 12}}>⭐ Indicação</span>}
                    </div>
                    <p style={{margin:0,fontSize:12,color:"var(--text-muted)"}}>{c.telefone||"—"} · {c.cidade||"—"} · {c.imovel||"—"}</p>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <p style={{margin:"0 0 2px",fontSize:11,color:"var(--text-muted)",fontWeight:500}}>{hist} interações · {tarf} tarefas</p>
                    <p style={{margin:0,fontSize:10,color:"var(--text-muted)"}}>desde {c.primeiroContato||"—"}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filtrados.length===0&&!loading && <div style={{textAlign:"center",padding:"3rem",color:"var(--text-muted)",fontSize:14}}>Nenhum cliente encontrado</div>}
        </div>
      )}

      {showForm&&(
        <Modal title="Novo cliente" onClose={()=>setShowForm(false)}>
          <Input label="Nome completo *" value={novo.nome} onChange={v=>setNovo(p=>({...p,nome:v}))} placeholder="Ex: Maria Silva"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Telefone / WhatsApp" value={novo.telefone} onChange={v=>setNovo(p=>({...p,telefone:v}))} placeholder="(83) 99999-9999"/>
            <Input label="E-mail" value={novo.email} onChange={v=>setNovo(p=>({...p,email:v}))} placeholder="email@exemplo.com"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Sel label="Origem" value={novo.origem} onChange={v=>setNovo(p=>({...p,origem:v}))} options={["Indicação","Instagram","Google","Facebook","Loja física","Outro"]}/>
            {novo.origem === "Indicação" && <Input label="Indicado por" value={novo.indicadoPor} onChange={v=>setNovo(p=>({...p,indicadoPor:v}))} placeholder="Nome de quem indicou"/>}
            <Sel label="Imóvel" value={novo.imovel} onChange={v=>setNovo(p=>({...p,imovel:v}))} options={["Apartamento","Casa","Comercial"]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Cidade" value={novo.cidade} onChange={v=>setNovo(p=>({...p,cidade:v}))} placeholder="João Pessoa"/>
            <Sel label="Etapa inicial" value={novo.etapa} onChange={v=>setNovo(p=>({...p,etapa:v}))} options={ETAPAS}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>Observações</label>
            <textarea value={novo.obs} onChange={e=>setNovo(p=>({...p,obs:e.target.value}))} placeholder="Preferências, restrições, observações importantes..."
              style={{width:"100%",padding:"9px 12px",fontSize:13,resize:"vertical",minHeight:70,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-default" onClick={()=>setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={add} disabled={salvando} style={{opacity:salvando?.7:1}}>
              {salvando?<><div className="spinner" style={{width:14,height:14}}/>Salvando...</>:"Salvar cliente"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Detalhe do cliente ───────────────────────────────────────────────────────
function ClienteDetalhe({clienteId,clientes,setClientes,historico,setHistorico,tarefas,setTarefas,projetos,setProjetos,parcelas,setParcelas,posVenda,setPosVenda,setView,toast}) {
  const [aba,setAba]=useState("dados");
  const [showH,setShowH]=useState(false);
  const [showT,setShowT]=useState(false);
  const [showP,setShowP]=useState(false);
  const [showEditC, setShowEditC] = useState(false);
  const [showNovaParcela, setShowNovaParcela] = useState(false);
  
  const [salvando,setSalvando]=useState(false);
  
  const [ni,setNi]=useState({tipo:"WhatsApp",direcao:"Saída",titulo:"",texto:"",tags:""});
  const [nt,setNt]=useState({titulo:"",prazo:"",prioridade:"media"});
  const [np,setNp]=useState({numero:"",titulo:"",valor:"",entrada:"",margem:"",projetista:"",prazoEntrega:"",obs:""});
  const [nparc, setNparc] = useState({projetoId: "", descricao: "Entrada", valor: "", dataPrevista: "", status: "em_aberto"});
  const [npv, setNpv] = useState({dataEntrega: "", nps: 0, potencialIndicacao: false, solicitacoes: "", obs: ""});
  
  // Bug 1 - Form de edição
  const [editC, setEditC] = useState(null);

  // F4 - Mini modal
  const [miniModal, setMiniModal] = useState(null);

  useEffect(() => {
    if (miniModal?.isOpen) {
      const t = setTimeout(() => setMiniModal(null), 8000);
      return () => clearTimeout(t);
    }
  }, [miniModal?.isOpen]);

  const c=clientes.find(cl=>cl.id===clienteId);
  if(!c)return null;

  const hist=historico.filter(h=>h.clienteId===c.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const tarf=tarefas.filter(t=>t.clienteId===c.id);
  const proj=projetos.filter(p=>p.clienteId===c.id);
  const parc = parcelas.filter(p => p.clienteId === c.id);
  const pv = posVenda.find(p => p.clienteId === c.id);

  const atualizarCliente = async () => {
    setSalvando(true);
    const {error} = await supabase.from("clientes").update({
      nome: editC.nome, telefone: editC.telefone, email: editC.email,
      cidade: editC.cidade, origem: editC.origem, indicado_por: editC.origem === "Indicação" ? editC.indicadoPor : "",
      imovel: editC.imovel, metragem: editC.metragem, etapa: editC.etapa, obs: editC.obs
    }).eq("id", c.id);
    setSalvando(false);
    if(error){toast.show("Erro ao atualizar cliente", "erro"); return;}
    setClientes(prev => prev.map(cl => cl.id === c.id ? {...cl, ...editC, indicadoPor: editC.origem === "Indicação" ? editC.indicadoPor : ""} : cl));
    setShowEditC(false);
    toast.show("Cliente atualizado!");
  };

  const excluirCliente = async () => {
    if(!window.confirm("Tem certeza que deseja excluir este cliente e todos os seus dados? Esta ação é irreversível.")) return;
    const {error} = await supabase.from("clientes").delete().eq("id", c.id);
    if(error){toast.show("Erro ao excluir", "erro"); return;}
    setClientes(prev => prev.filter(cl => cl.id !== c.id));
    setView("clientes");
    toast.show("Cliente excluído.");
  };

  const avancar=async()=>{
    const idx=ETAPAS.indexOf(c.etapa);
    if(idx>=ETAPAS.length-1)return;
    const novaEtapa=ETAPAS[idx+1];
    const {error}=await supabase.from("clientes").update({etapa:novaEtapa}).eq("id",c.id);
    if(error){toast.show("Erro ao atualizar etapa","erro");return;}
    setClientes(prev=>prev.map(cl=>cl.id===c.id?{...cl,etapa:novaEtapa}:cl));
    toast.show(`Etapa atualizada: ${novaEtapa}`);

    // F4 Agendamento sugerido
    if (novaEtapa === "Visita técnica") {
      setMiniModal({ isOpen: true, msg: 'Deseja agendar a visita técnica?', defaultTitle: `Visita técnica — ${c.nome}`, data: '' });
    } else if (novaEtapa === "Negociação") {
      setMiniModal({ isOpen: true, msg: 'Agendar follow-up de negociação?', defaultTitle: `Follow-up negociação — ${c.nome}`, data: '' });
    } else if (novaEtapa === "Entrega") {
      setMiniModal({ isOpen: true, msg: 'Confirmar data de entrega com cliente?', defaultTitle: `Confirmar entrega — ${c.nome}`, data: '' });
    }
  };

  const voltar=async()=>{
    const idx=ETAPAS.indexOf(c.etapa);
    if(idx<=0)return;
    const novaEtapa=ETAPAS[idx-1];
    const {error}=await supabase.from("clientes").update({etapa:novaEtapa}).eq("id",c.id);
    if(error){toast.show("Erro ao atualizar etapa","erro");return;}
    setClientes(prev=>prev.map(cl=>cl.id===c.id?{...cl,etapa:novaEtapa}:cl));
    toast.show(`Etapa atualizada: ${novaEtapa}`);
  };

  const addH=async()=>{
    if(!ni.titulo.trim())return;
    setSalvando(true);
    const payload={
      cliente_id:c.id, tipo:ni.tipo, direcao:ni.direcao, titulo:ni.titulo,
      texto:ni.texto, tags:ni.tags.split(",").map(s=>s.trim()).filter(Boolean),
      data:dataBR(), hora:horaBR(),
    };
    const {data,error}=await supabase.from("historico").insert([payload]).select().single();
    setSalvando(false);
    if(error){toast.show("Erro ao salvar interação","erro");return;}
    setHistorico(prev=>[normHist(data),...prev]);
    setNi({tipo:"WhatsApp",direcao:"Saída",titulo:"",texto:"",tags:""});
    setShowH(false);
    toast.show("Interação registrada!");
  };

  const excluirHist = async(id) => {
    const {error} = await supabase.from("historico").delete().eq("id", id);
    if(error){toast.show("Erro ao excluir", "erro"); return;}
    setHistorico(prev => prev.filter(h => h.id !== id));
  };

  const addT=async(titulo, prazo)=>{
    if(!titulo.trim())return;
    setSalvando(true);
    const payload={cliente_id:c.id,titulo,prazo,prioridade:"alta",concluida:false};
    const {data,error}=await supabase.from("tarefas").insert([payload]).select().single();
    setSalvando(false);
    if(error){toast.show("Erro ao salvar tarefa","erro");return;}
    setTarefas(prev=>[...prev,normTarefa(data)]);
    setNt({titulo:"",prazo:"",prioridade:"media"});
    setShowT(false);
    setMiniModal(null);
    toast.show("Tarefa criada!");
  };

  const toggleTarefa=async(t)=>{
    const novoConcluida=!t.concluida;
    const {error}=await supabase.from("tarefas").update({concluida:novoConcluida}).eq("id",t.id);
    if(error){toast.show("Erro ao atualizar tarefa","erro");return;}
    setTarefas(prev=>prev.map(x=>x.id===t.id?{...x,concluida:novoConcluida}:x));
  };

  const excluirTarefa = async(id) => {
    const {error} = await supabase.from("tarefas").delete().eq("id", id);
    if(error){toast.show("Erro ao excluir", "erro"); return;}
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  const addP=async()=>{
    if(!np.titulo.trim())return;
    setSalvando(true);
    const payload={
      cliente_id:c.id, numero:np.numero, titulo:np.titulo,
      etapa:c.etapa, valor:parseFloat(np.valor)||0, entrada:parseFloat(np.entrada)||0,
      margem:parseFloat(np.margem)||0, projetista:np.projetista,
      prazo_entrega:np.prazoEntrega, obs:np.obs, ambientes:[], criado:dataBR(),
    };
    const {data,error}=await supabase.from("projetos").insert([payload]).select().single();
    setSalvando(false);
    if(error){toast.show("Erro ao salvar projeto","erro");return;}
    setProjetos(prev => [normProjeto(data), ...prev]); // Bug 3 fix
    toast.show("Projeto criado com sucesso!");
    setNp({numero:"",titulo:"",valor:"",entrada:"",margem:"",projetista:"",prazoEntrega:"",obs:""});
    setShowP(false);
  };

  const editEtapaProj = async (pId, nEtapa) => {
    const {error} = await supabase.from("projetos").update({etapa: nEtapa}).eq("id", pId);
    if(error){toast.show("Erro ao atualizar projeto","erro");return;}
    setProjetos(prev => prev.map(p => p.id === pId ? {...p, etapa: nEtapa} : p));
  };

  const addParcela = async () => {
    if(!nparc.projetoId) { toast.show("Selecione um projeto", "erro"); return; }
    setSalvando(true);
    const payload = {
      projeto_id: nparc.projetoId, cliente_id: c.id, descricao: nparc.descricao,
      valor: parseFloat(nparc.valor)||0, data_prevista: nparc.dataPrevista, status: nparc.status
    };
    const {data, error} = await supabase.from("parcelas").insert([payload]).select().single();
    setSalvando(false);
    if(error){toast.show("Erro ao salvar parcela","erro");return;}
    setParcelas(prev => [normParcela(data), ...prev]);
    setShowNovaParcela(false);
    setNparc({projetoId: "", descricao: "Entrada", valor: "", dataPrevista: "", status: "em_aberto"});
    toast.show("Parcela criada!");
  };

  const marcarPago = async (p) => {
    const {error} = await supabase.from("parcelas").update({status: "pago", data_recebida: hojeStr}).eq("id", p.id);
    if(error){toast.show("Erro ao atualizar","erro");return;}
    setParcelas(prev => prev.map(x => x.id === p.id ? {...x, status: "pago", dataRecebida: hojeStr} : x));
  };

  const addPosVenda = async () => {
    setSalvando(true);
    const payload = {
      cliente_id: c.id, data_entrega: npv.dataEntrega, nps: npv.nps, 
      potencial_indicacao: npv.potencialIndicacao, solicitacoes: npv.solicitacoes, obs: npv.obs
    };
    if (pv) {
      const {error} = await supabase.from("pos_venda").update(payload).eq("id", pv.id);
      if(error) {toast.show("Erro", "erro"); setSalvando(false); return;}
      setPosVenda(prev => prev.map(p => p.id === pv.id ? {...p, ...normPosVenda(payload)} : p));
    } else {
      const {data, error} = await supabase.from("pos_venda").insert([payload]).select().single();
      if(error) {toast.show("Erro", "erro"); setSalvando(false); return;}
      setPosVenda(prev => [normPosVenda(data), ...prev]);
    }
    setSalvando(false);
    toast.show("Pós-venda salvo!");
  };

  const abas=["dados","projeto","financeiro","historico","tarefas"];
  if (c.etapa === "Entrega") abas.push("pos_venda");

  const aL={
    dados:"Dados",
    projeto:`Projetos (${proj.length})`,
    financeiro: "Financeiro",
    historico:`Histórico (${hist.length})`,
    tarefas:`Tarefas (${tarf.filter(t=>!t.concluida).length})`,
    pos_venda: "Pós-venda"
  };

  const totalFinanceiro = parc.reduce((s,p) => s + (Number(p.valor)||0), 0);
  const recebido = parc.filter(p => p.status === 'pago').reduce((s,p) => s + (Number(p.valor)||0), 0);
  const aReceber = parc.filter(p => p.status !== 'pago').reduce((s,p) => s + (Number(p.valor)||0), 0);
  const possuiAtraso = parc.some(p => p.status === 'atrasado' || (p.status === 'em_aberto' && isAtrasada(p.dataPrevista)));

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <button onClick={()=>setView("clientes")} className="btn btn-ghost" style={{fontSize:12}}>← Clientes</button>
        <span style={{color:"var(--text-muted)",fontSize:13}}>/</span>
        <span style={{fontSize:13,color:"var(--text-secondary)",fontWeight:500}}>{c.nome}</span>
      </div>

      <div className="card" style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap: 14}}>
          <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap", flex: 1}}>
            <Avatar initials={initials(c.nome)} cor={c.cor||"#4F46E5"} size={46}/>
            <div style={{flex:1,minWidth:180}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:5}}>
                <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"var(--text-primary)"}}>{c.nome}</h2>
                <EtapaBadge etapa={c.etapa}/>
                <button onClick={() => { setEditC({...c}); setShowEditC(true); }} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"var(--text-muted)"}}>✏️ Editar</button>
              </div>
              <p style={{margin:0,fontSize:13,color:"var(--text-muted)"}}>{c.telefone||"—"} · {c.email||"—"}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap", alignItems: "center"}}>
            <button className="btn btn-default" onClick={()=>setShowH(true)}>+ Interação</button>
            <button className="btn btn-default" onClick={()=>setShowT(true)}>+ Tarefa</button>
            <button className="btn btn-default" onClick={()=>setShowP(true)}>+ Projeto</button>
            <div style={{display: "flex", gap: 2, background: "var(--bg3)", borderRadius: 8, padding: 2}}>
              {ETAPAS.indexOf(c.etapa) > 0 && <button className="btn btn-default" style={{background:"transparent", border:"none"}} onClick={voltar}>← Voltar</button>}
              {ETAPAS.indexOf(c.etapa) < ETAPAS.length-1 && <button className="btn btn-primary" onClick={avancar}>Avançar etapa →</button>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",marginTop:16,gap:0,borderTop:"1.5px solid var(--border)",paddingTop:4, overflowX:"auto"}}>
          {abas.map(a=>{
            if(a === "financeiro" && proj.length === 0) return null; // Só mostra financeiro se tem projeto
            return <button key={a} className={`tab-btn${aba===a?" active":""}`} onClick={()=>setAba(a)}>{aL[a]}</button>
          })}
        </div>
      </div>

      {aba==="dados" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="card">
            <p className="section-label">Contato</p>
            {[["Telefone",c.telefone],["E-mail",c.email],["Cidade",c.cidade]].map(([l,v])=>(
              <div key={l} className="field-row"><span style={{color:"var(--text-muted)"}}>{l}</span><span style={{color:"var(--text-primary)",fontWeight:600}}>{v||"—"}</span></div>
            ))}
            <Divider/>
            <p className="section-label">Origem</p>
            {[["Canal",c.origem],["Indicado por",c.indicadoPor||"—"],["Desde",c.primeiroContato||"—"]].map(([l,v])=>(
              <div key={l} className="field-row"><span style={{color:"var(--text-muted)"}}>{l}</span><span style={{color:"var(--text-primary)",fontWeight:600}}>{v||"—"}</span></div>
            ))}
          </div>
          <div className="card">
            <p className="section-label">Imóvel</p>
            {[["Tipo",c.imovel],["Metragem",c.metragem||"—"]].map(([l,v])=>(
              <div key={l} className="field-row"><span style={{color:"var(--text-muted)"}}>{l}</span><span style={{color:"var(--text-primary)",fontWeight:600}}>{v||"—"}</span></div>
            ))}
            {c.ambientes?.length>0 && (<><Divider/><p className="section-label">Ambientes</p><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{c.ambientes.map(a=><span key={a} style={{fontSize:11,padding:"3px 9px",background:"var(--accent-light)",borderRadius:6,color:"var(--accent)",border:"1.5px solid var(--accent-mid)",fontWeight:600}}>{a}</span>)}</div></>)}
            {c.obs && (<><Divider/><p className="section-label">Observações</p><p style={{fontSize:13,color:"var(--text-secondary)",lineHeight:1.7,background:"var(--accent-light)",padding:"10px 12px",borderRadius:8,borderLeft:"3px solid var(--accent)"}}>{c.obs}</p></>)}
          </div>
        </div>
      )}

      {aba==="projeto" && (
        proj.length===0
          ? <div className="card" style={{textAlign:"center",padding:"2rem",color:"var(--text-muted)"}}>Nenhum projeto. Clique em "+ Projeto" para criar.</div>
          : proj.map(p=>(
            <div key={p.id} className="card" style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                    <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'DM Mono',monospace",fontWeight:700}}>#{p.numero||"—"}</span>
                    <select value={p.etapa} onChange={(e) => editEtapaProj(p.id, e.target.value)} style={{fontSize: 10, padding: "2px 6px", borderRadius: 99, fontWeight: 700, border: "1.5px solid var(--border)", background: "var(--bg2)"}}>
                      {ETAPAS.map(et => <option key={et} value={et}>{et}</option>)}
                    </select>
                  </div>
                  <p style={{margin:0,fontSize:15,fontWeight:700,color:"var(--text-primary)"}}>{p.titulo}</p>
                </div>
                <p style={{margin:0,fontSize:22,fontWeight:700,color:"var(--accent)",fontFamily:"'DM Mono',monospace"}}>{fmt(p.valor)}</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[["Entrada",fmt(p.entrada),"var(--text-primary)"],["Margem",(p.margem||0)+"%","var(--success)"],["Entrega",p.prazoEntrega||"—","var(--text-primary)"]].map(([l,v,vc])=>(
                  <div key={l} style={{background:"var(--bg2)",borderRadius:8,padding:"8px 10px",border:"1.5px solid var(--border)"}}>
                    <p style={{margin:"0 0 2px",fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".07em",fontWeight:700}}>{l}</p>
                    <p style={{margin:0,fontSize:14,fontWeight:700,color:vc,fontFamily:"'DM Mono',monospace"}}>{v}</p>
                  </div>
                ))}
              </div>
              {p.obs&&<p style={{margin:"10px 0 0",fontSize:12,color:"var(--text-secondary)",background:"var(--accent-light)",padding:"8px 12px",borderRadius:8,borderLeft:"3px solid var(--accent)"}}>{p.obs}</p>}
            </div>
          ))
      )}

      {aba==="financeiro" && proj.length > 0 && (
        <div className="fade-in">
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 15}}>
            <MetricCard label="Total do Cliente" value={fmt(totalFinanceiro)} />
            <MetricCard label="Recebido" value={fmt(recebido)} subColor="var(--success)"/>
            <MetricCard label="A Receber" value={fmt(aReceber)} subColor="var(--warning)"/>
          </div>
          {possuiAtraso && <div style={{background: "var(--danger-bg)", border: "1.5px solid var(--danger-border)", padding: "10px", borderRadius: 10, marginBottom: 15, color: "var(--danger)", fontSize: 13, fontWeight: 600}}>⚠️ Há parcelas em atraso!</div>}
          
          <div className="card">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15}}>
              <p className="section-label" style={{margin: 0}}>Parcelas</p>
              <button className="btn btn-primary" onClick={() => {setNparc({...nparc, projetoId: proj[0].id}); setShowNovaParcela(true);}}>+ Parcela</button>
            </div>
            
            {parc.length === 0 ? <p style={{fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "1rem"}}>Nenhuma parcela registrada.</p> : (
              <table style={{width: "100%", borderCollapse: "collapse", fontSize: 13}}>
                <thead>
                  <tr style={{borderBottom: "1.5px solid var(--border)", textAlign: "left", color: "var(--text-muted)"}}>
                    <th style={{padding: "8px 4px"}}>Descrição</th>
                    <th style={{padding: "8px 4px"}}>Valor</th>
                    <th style={{padding: "8px 4px"}}>Prevista</th>
                    <th style={{padding: "8px 4px"}}>Recebida</th>
                    <th style={{padding: "8px 4px"}}>Status</th>
                    <th style={{padding: "8px 4px"}}></th>
                  </tr>
                </thead>
                <tbody>
                  {parc.sort((a,b)=>new Date(a.dataPrevista) - new Date(b.dataPrevista)).map(p => {
                    const st = p.status === 'pago' ? 'pago' : (isAtrasada(p.dataPrevista) || p.status === 'atrasado') ? 'atrasado' : 'em_aberto';
                    return (
                      <tr key={p.id} style={{borderBottom: "1.5px solid var(--bg3)"}}>
                        <td style={{padding: "10px 4px", fontWeight: 500}}>{p.descricao}</td>
                        <td style={{padding: "10px 4px", fontFamily: "'DM Mono', monospace", fontWeight: 700}}>{fmt(p.valor)}</td>
                        <td style={{padding: "10px 4px"}}>{p.dataPrevista ? p.dataPrevista.split('-').reverse().join('/') : "—"}</td>
                        <td style={{padding: "10px 4px"}}>{p.dataRecebida ? p.dataRecebida.split('-').reverse().join('/') : "—"}</td>
                        <td style={{padding: "10px 4px"}}>
                          <span className="pill" style={{
                            background: st === 'pago' ? 'var(--success-bg)' : st === 'atrasado' ? 'var(--danger-bg)' : 'var(--info-bg)',
                            color: st === 'pago' ? 'var(--success)' : st === 'atrasado' ? 'var(--danger)' : 'var(--info)',
                            border: `1px solid ${st === 'pago' ? 'var(--success-border)' : st === 'atrasado' ? 'var(--danger-border)' : 'var(--info-border)'}`
                          }}>{st.replace('_', ' ')}</span>
                        </td>
                        <td style={{padding: "10px 4px", textAlign: "right"}}>
                          {st !== 'pago' && <button className="btn btn-default" style={{fontSize: 10, padding: "4px 8px"}} onClick={() => marcarPago(p)}>Pagar</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {aba==="historico" && (
        <div className="card">
          {hist.length===0
            ? <div style={{textAlign:"center",padding:"1.5rem",color:"var(--text-muted)"}}>Nenhuma interação registrada ainda.</div>
            : hist.map(h=>{
              const ts=TS[h.tipo]||TS.Nota;
              return (
                <div key={h.id} className="hist-entry" style={{position:"relative"}}>
                  <button onClick={() => excluirHist(h.id)} style={{position:"absolute", top: 12, right: 0, background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize: 16}}>×</button>
                  <div style={{width:32,height:32,borderRadius:"50%",background:ts.bg,border:`1.5px solid ${ts.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{ts.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:"var(--text-primary)"}}>{h.titulo}</span>
                      <span className="pill" style={{background:ts.bg,color:ts.color,border:`1.5px solid ${ts.color}30`}}>{h.tipo}</span>
                      <span style={{fontSize:10,color:"var(--text-muted)",fontWeight:500}}>{h.data} · {h.hora}</span>
                    </div>
                    <p style={{margin:"0 0 6px",fontSize:13,color:"var(--text-secondary)",lineHeight:1.6}}>{h.texto}</p>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(h.tags||[]).map(t=><span key={t} style={{fontSize:10,padding:"2px 8px",background:"var(--bg3)",borderRadius:6,color:"var(--text-secondary)",border:"1.5px solid var(--border)",fontWeight:500}}>{t}</span>)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {aba==="tarefas" && (
        <div className="card">
          <p className="section-label">Pendentes</p>
          {tarf.filter(t=>!t.concluida).length===0 && <p style={{fontSize:13,color:"var(--text-muted)",padding:"8px 0"}}>Nenhuma tarefa pendente.</p>}
          {tarf.filter(t=>!t.concluida).map(t=>{
            const atras=isAtrasada(t.prazo);
            return (
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,marginBottom:5,border:`1.5px solid ${atras?"var(--danger-border)":"var(--border)"}`,background:atras?"var(--danger-bg)":"var(--bg2)"}}>
                <input type="checkbox" checked={t.concluida} onChange={()=>toggleTarefa(t)} style={{cursor:"pointer",accentColor:"var(--accent)",width:15,height:15}}/>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:13,fontWeight:600,color:atras?"var(--danger)":"var(--text-primary)"}}>{t.titulo}</p>
                  <p style={{margin:0,fontSize:11,color:"var(--text-muted)"}}>{atras?"Atrasada · ":""}{t.prazo?t.prazo.split("-").reverse().join("/"):"Sem prazo"}</p>
                </div>
                <div style={{display:"flex", alignItems:"center", gap: 6}}>
                  <span className="pill" style={{background:t.prioridade==="alta"?"var(--warning-bg)":t.prioridade==="media"?"var(--info-bg)":"var(--bg3)",color:t.prioridade==="alta"?"var(--warning)":t.prioridade==="media"?"var(--info)":"var(--text-muted)",border:`1.5px solid ${t.prioridade==="alta"?"var(--warning-border)":t.prioridade==="media"?"var(--info-border)":"var(--border)"}`}}>{t.prioridade}</span>
                  <button onClick={()=>excluirTarefa(t.id)} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:16}}>×</button>
                </div>
              </div>
            );
          })}
          {tarf.filter(t=>t.concluida).length>0 && (
            <><Divider/><p className="section-label">Concluídas</p>
            {tarf.filter(t=>t.concluida).map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:9,marginBottom:4,background:"var(--bg2)",opacity:.65}}>
                <input type="checkbox" checked={t.concluida} onChange={()=>toggleTarefa(t)} style={{cursor:"pointer",accentColor:"var(--accent)",width:15,height:15}}/>
                <p style={{margin:0,fontSize:13,color:"var(--text-muted)",textDecoration:"line-through", flex: 1}}>{t.titulo}</p>
                <button onClick={()=>excluirTarefa(t.id)} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:16}}>×</button>
              </div>
            ))}</>
          )}
        </div>
      )}

      {aba==="pos_venda" && (
        <div className="card fade-in">
          <p className="section-label">Registro de Pós-Venda</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input type="date" label="Data de entrega" value={npv.dataEntrega || pv?.dataEntrega || ""} onChange={v=>setNpv(p=>({...p,dataEntrega:v}))} />
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>NPS (Satisfação)</label>
              <div style={{display: "flex", gap: 5}}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={()=>setNpv(p=>({...p, nps: star}))} style={{background: "none", border: "none", cursor: "pointer", fontSize: 24, color: (npv.nps || pv?.nps) >= star ? "#EAB308" : "var(--border)"}}>★</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"flex", alignItems: "center", gap: 8, cursor: "pointer"}}>
              <input type="checkbox" checked={npv.potencialIndicacao || pv?.potencialIndicacao || false} onChange={e=>setNpv(p=>({...p,potencialIndicacao:e.target.checked}))} style={{width: 16, height: 16, accentColor: "var(--accent)"}}/>
              Cliente tem potencial de indicar novos clientes?
            </label>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>Solicitações de garantia / assistência</label>
            <textarea value={npv.solicitacoes || pv?.solicitacoes || ""} onChange={e=>setNpv(p=>({...p,solicitacoes:e.target.value}))} placeholder="Houve alguma ressalva na entrega?" style={{width:"100%",padding:"9px 12px",fontSize:13,resize:"vertical",minHeight:60}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>Observações do pós-venda</label>
            <textarea value={npv.obs || pv?.obs || ""} onChange={e=>setNpv(p=>({...p,obs:e.target.value}))} style={{width:"100%",padding:"9px 12px",fontSize:13,resize:"vertical",minHeight:60}}/>
          </div>
          <div style={{textAlign: "right"}}>
            <button className="btn btn-primary" onClick={addPosVenda} disabled={salvando}>{salvando ? "Salvando..." : pv ? "Atualizar" : "Salvar Pós-venda"}</button>
          </div>
        </div>
      )}

      {/* Mini-modal Agendamento F4 */}
      {miniModal?.isOpen && (
        <div className="fade-in" style={{position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "var(--bg1)", border: "1.5px solid var(--accent-mid)", borderRadius: 12, padding: "16px 20px", boxShadow: "0 10px 40px rgba(79,70,229,.15)", display: "flex", gap: 15, alignItems: "center"}}>
          <div>
            <p style={{margin: "0 0 5px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)"}}>{miniModal.msg}</p>
            <input type="date" value={miniModal.data} onChange={e=>setMiniModal({...miniModal, data: e.target.value})} style={{padding: "4px 8px", fontSize: 12, borderRadius: 6, border: "1px solid var(--border)"}}/>
          </div>
          <div style={{display: "flex", gap: 8}}>
            <button className="btn btn-default" onClick={()=>setMiniModal(null)}>Não agora</button>
            <button className="btn btn-primary" onClick={()=>addT(miniModal.defaultTitle, miniModal.data)}>Sim, agendar</button>
          </div>
        </div>
      )}

      {/* Modal: Editar Cliente */}
      {showEditC && (
        <Modal title="Editar cliente" onClose={()=>setShowEditC(false)}>
          <Input label="Nome completo *" value={editC.nome} onChange={v=>setEditC(p=>({...p,nome:v}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Telefone / WhatsApp" value={editC.telefone} onChange={v=>setEditC(p=>({...p,telefone:v}))} />
            <Input label="E-mail" value={editC.email} onChange={v=>setEditC(p=>({...p,email:v}))} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Sel label="Origem" value={editC.origem} onChange={v=>setEditC(p=>({...p,origem:v}))} options={["Indicação","Instagram","Google","Facebook","Loja física","Outro"]}/>
            {editC.origem === "Indicação" && <Input label="Indicado por" value={editC.indicadoPor} onChange={v=>setEditC(p=>({...p,indicadoPor:v}))}/>}
            <Sel label="Imóvel" value={editC.imovel} onChange={v=>setEditC(p=>({...p,imovel:v}))} options={["Apartamento","Casa","Comercial"]}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Cidade" value={editC.cidade} onChange={v=>setEditC(p=>({...p,cidade:v}))} />
            <Sel label="Etapa atual" value={editC.etapa} onChange={v=>setEditC(p=>({...p,etapa:v}))} options={ETAPAS}/>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>Observações</label>
            <textarea value={editC.obs} onChange={e=>setEditC(p=>({...p,obs:e.target.value}))} style={{width:"100%",padding:"9px 12px",fontSize:13,resize:"vertical",minHeight:70}}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
            <button className="btn btn-danger" onClick={excluirCliente}>Excluir cliente</button>
            <div style={{display: "flex", gap: 8}}>
              <button className="btn btn-default" onClick={()=>setShowEditC(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={atualizarCliente} disabled={salvando}>{salvando?"Salvando...":"Salvar"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Nova Parcela */}
      {showNovaParcela && (
        <Modal title="Nova Parcela" onClose={()=>setShowNovaParcela(false)}>
          <Sel label="Projeto" value={nparc.projetoId} onChange={v=>setNparc(p=>({...p,projetoId:v}))} options={proj.map(p=>p.id)} /> {/* Idealmente mostraria o nome do projeto, mas options aceita string simples. Ajustando abaixo */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>Projeto</label>
            <select value={nparc.projetoId} onChange={e=>setNparc(p=>({...p,projetoId:e.target.value}))} style={{width:"100%",padding:"9px 12px",fontSize:13}}>
              {proj.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </select>
          </div>
          <Sel label="Descrição" value={nparc.descricao} onChange={v=>setNparc(p=>({...p,descricao:v}))} options={["Entrada","Medição","Entrega","Saldo Final","Outro"]}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input type="number" label="Valor (R$)" value={nparc.valor} onChange={v=>setNparc(p=>({...p,valor:v}))} />
            <Input type="date" label="Data Prevista" value={nparc.dataPrevista} onChange={v=>setNparc(p=>({...p,dataPrevista:v}))} />
          </div>
          <Sel label="Status" value={nparc.status} onChange={v=>setNparc(p=>({...p,status:v}))} options={["em_aberto","pago"]}/>
          
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-default" onClick={()=>setShowNovaParcela(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={addParcela} disabled={salvando}>{salvando?"Salvando...":"Salvar"}</button>
          </div>
        </Modal>
      )}

      {/* Modal: Interação */}
      {showH && (
        <Modal title="Registrar interação" onClose={()=>setShowH(false)}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Sel label="Tipo" value={ni.tipo} onChange={v=>setNi(p=>({...p,tipo:v}))} options={["WhatsApp","Ligação","Reunião","Visita","Nota"]}/>
            <Sel label="Direção" value={ni.direcao} onChange={v=>setNi(p=>({...p,direcao:v}))} options={["Saída","Entrada","Presencial","Imóvel","Interna"]}/>
          </div>
          <Input label="Título *" value={ni.titulo} onChange={v=>setNi(p=>({...p,titulo:v}))} placeholder="Ex: Follow-up sobre orçamento"/>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>Descrição</label>
            <textarea value={ni.texto} onChange={e=>setNi(p=>({...p,texto:e.target.value}))} placeholder="O que foi conversado..."
              style={{width:"100%",padding:"9px 12px",fontSize:13,resize:"vertical",minHeight:80,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          </div>
          <Input label="Tags (separadas por vírgula)" value={ni.tags} onChange={v=>setNi(p=>({...p,tags:v}))} placeholder="Orçamento enviado, Aguardando decisão"/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-default" onClick={()=>setShowH(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={addH} disabled={salvando}>{salvando?"Salvando...":"Salvar"}</button>
          </div>
        </Modal>
      )}

      {/* Modal: Tarefa */}
      {showT && (
        <Modal title="Nova tarefa" onClose={()=>setShowT(false)}>
          <Input label="Tarefa *" value={nt.titulo} onChange={v=>setNt(p=>({...p,titulo:v}))} placeholder="Ex: Ligar para confirmar visita"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Prazo" value={nt.prazo} onChange={v=>setNt(p=>({...p,prazo:v}))} type="date"/>
            <Sel label="Prioridade" value={nt.prioridade} onChange={v=>setNt(p=>({...p,prioridade:v}))} options={["alta","media","baixa"]}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-default" onClick={()=>setShowT(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={()=>addT(nt.titulo, nt.prazo)} disabled={salvando}>{salvando?"Salvando...":"Salvar"}</button>
          </div>
        </Modal>
      )}

      {/* Modal: Projeto */}
      {showP && (
        <Modal title="Novo projeto" onClose={()=>setShowP(false)} maxWidth={580}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Input label="Número do projeto" value={np.numero} onChange={v=>setNp(p=>({...p,numero:v}))} placeholder="Ex: 043"/>
            <Input label="Projetista" value={np.projetista} onChange={v=>setNp(p=>({...p,projetista:v}))} placeholder="Nome do projetista"/>
          </div>
          <Input label="Título *" value={np.titulo} onChange={v=>setNp(p=>({...p,titulo:v}))} placeholder="Ex: Apto Maria — cozinha + quarto"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <Input label="Valor total (R$)" value={np.valor} onChange={v=>setNp(p=>({...p,valor:v}))} placeholder="Ex: 28000"/>
            <Input label="Entrada (R$)" value={np.entrada} onChange={v=>setNp(p=>({...p,entrada:v}))} placeholder="Ex: 11200"/>
            <Input label="Margem (%)" value={np.margem} onChange={v=>setNp(p=>({...p,margem:v}))} placeholder="Ex: 38"/>
          </div>
          <Input label="Prazo de entrega" value={np.prazoEntrega} onChange={v=>setNp(p=>({...p,prazoEntrega:v}))} placeholder="Ex: Julho 2025"/>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>Observações técnicas</label>
            <textarea value={np.obs} onChange={e=>setNp(p=>({...p,obs:e.target.value}))} placeholder="Detalhes, restrições, observações..."
              style={{width:"100%",padding:"9px 12px",fontSize:13,resize:"vertical",minHeight:60,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-default" onClick={()=>setShowP(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={addP} disabled={salvando}>{salvando?"Salvando...":"Criar projeto"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
function Pipeline({clientes,setClientes,setView,setClienteSelecionado,loading,toast}) {
  const [drag,setDrag]=useState(null);
  const [overC,setOverC]=useState(null);

  const mover=async(id,novaEtapa)=>{
    const {error}=await supabase.from("clientes").update({etapa:novaEtapa}).eq("id",id);
    if(error){toast.show("Erro ao mover cliente","erro");return;}
    setClientes(prev=>prev.map(c=>c.id===id?{...c,etapa:novaEtapa}:c));
  };

  return (
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div className="accent-bar"/>
        <h1 style={{fontSize:24,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px"}}>Pipeline</h1>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>Arraste os cards para atualizar a etapa · salva automaticamente</p>
      </div>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12}}>
          {ETAPAS.map(etapa=>{
            const itens=clientes.filter(c=>c.etapa===etapa);
            const s=ES[etapa]||{};
            return (
              <div key={etapa} className={`kanban-col${overC===etapa?" drag-over":""}`}
                onDragOver={e=>{e.preventDefault();setOverC(etapa);}}
                onDragLeave={()=>setOverC(null)}
                onDrop={()=>{if(drag){mover(drag,etapa);setDrag(null);setOverC(null);}}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"0 4px"}}>
                  <span style={{fontSize:11,fontWeight:700,color:s.text||"var(--text-secondary)"}}>{etapa}</span>
                  <span className="pill" style={{background:s.bg,color:s.text,border:`1.5px solid ${s.bd}`}}>{itens.length}</span>
                </div>
                {itens.map(c=>(
                  <div key={c.id} className="kanban-card" draggable
                    onDragStart={()=>setDrag(c.id)} onDragEnd={()=>setDrag(null)}
                    onClick={()=>{setClienteSelecionado(c.id);setView("cliente-detalhe");}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                      <Avatar initials={initials(c.nome)} cor={c.cor||"#4F46E5"} size={22}/>
                      <span style={{fontSize:12,fontWeight:700,color:"var(--text-primary)",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.nome}</span>
                    </div>
                    <p style={{margin:"0 0 5px",fontSize:11,color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{(c.ambientes||[]).slice(0,2).join(", ")||c.imovel||"—"}</p>
                    <span style={{fontSize:10,padding:"2px 7px",background:"var(--bg3)",borderRadius:6,color:"var(--text-secondary)",border:"1.5px solid var(--border)",fontWeight:600}}>{c.origem||"—"}</span>
                  </div>
                ))}
                {itens.length===0 && <div style={{textAlign:"center",padding:"1rem 0",color:"var(--text-muted)",fontSize:12}}>Vazio</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Projetos ─────────────────────────────────────────────────────────────────
function Projetos({projetos,clientes,loading}) {
  const [busca,setBusca]=useState("");
  const filtrados=projetos.filter(p=>{
    const c=clientes.find(cl=>cl.id===p.clienteId);
    return c?.nome?.toLowerCase().includes(busca.toLowerCase())||p.titulo?.toLowerCase().includes(busca.toLowerCase());
  });
  const total=projetos.reduce((s,p)=>s+(p.valor||0),0);
  const mm=projetos.length?Math.round(projetos.reduce((s,p)=>s+(p.margem||0),0)/projetos.length):0;

  return (
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div className="accent-bar"/>
        <h1 style={{fontSize:24,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px"}}>Projetos</h1>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>{projetos.length} projetos · {fmt(total)} em carteira</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        <MetricCard label="Carteira total" value={fmt(total)} subColor="var(--accent)"/>
        <MetricCard label="Margem média" value={mm+"%"} subColor="var(--success)"/>
        <MetricCard label="Total de projetos" value={projetos.length}/>
      </div>
      <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar projeto ou cliente..."
        style={{width:"100%",padding:"9px 12px",fontSize:13,marginBottom:12}}/>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtrados.length===0 && <div style={{textAlign:"center",padding:"2rem",color:"var(--text-muted)"}}>Nenhum projeto ainda. Crie um dentro do perfil de um cliente.</div>}
          {filtrados.map(p=>{
            const c=clientes.find(cl=>cl.id===p.clienteId);
            return (
              <div key={p.id} className="card" style={{padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:5}}>
                      <span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'DM Mono',monospace",fontWeight:700}}>#{p.numero||"—"}</span>
                      <span style={{fontSize:14,fontWeight:700,color:"var(--text-primary)"}}>{c?.nome||"—"}</span>
                      <EtapaBadge etapa={p.etapa}/>
                    </div>
                    <p style={{margin:"0 0 10px",fontSize:13,color:"var(--text-secondary)",fontWeight:500}}>{p.titulo}</p>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {Array.isArray(p.ambientes)&&p.ambientes.map((a,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:"var(--bg2)",borderRadius:8,fontSize:12,border:"1.5px solid var(--border)"}}>
                          <span style={{color:"var(--text-primary)",fontWeight:600}}>{a.nome||a}</span>
                          {a.valor&&<span style={{color:"var(--accent)",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:600}}>{fmt(a.valor)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <p style={{margin:"0 0 3px",fontSize:22,fontWeight:700,color:"var(--accent)",fontFamily:"'DM Mono',monospace"}}>{fmt(p.valor)}</p>
                    <p style={{margin:"0 0 2px",fontSize:12,color:"var(--text-muted)",fontWeight:500}}>Entrada: {fmt(p.entrada)}</p>
                    <p style={{margin:0,fontSize:12,color:"var(--success)",fontWeight:700}}>Margem: {p.margem||0}%</p>
                  </div>
                </div>
                {p.obs&&<p style={{margin:"10px 0 0",fontSize:12,color:"var(--text-secondary)",background:"var(--accent-light)",padding:"8px 12px",borderRadius:8,borderLeft:"3px solid var(--accent)"}}>{p.obs}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tarefas ──────────────────────────────────────────────────────────────────
function Tarefas({tarefas,setTarefas,clientes,loading,toast}) {
  const [filtro,setFiltro]=useState("pendentes");

  const toggle=async(t)=>{
    const novo=!t.concluida;
    const {error}=await supabase.from("tarefas").update({concluida:novo}).eq("id",t.id);
    if(error){toast.show("Erro ao atualizar","erro");return;}
    setTarefas(prev=>prev.map(x=>x.id===t.id?{...x,concluida:novo}:x));
  };
  
  const excluirTarefa = async(id) => {
    const {error} = await supabase.from("tarefas").delete().eq("id", id);
    if(error){toast.show("Erro ao excluir", "erro"); return;}
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  const pendentes=tarefas.filter(t=>!t.concluida).sort((a,b)=>new Date(a.prazo)-new Date(b.prazo));
  const atrasadas=pendentes.filter(t=>isAtrasada(t.prazo));
  const concluidas=tarefas.filter(t=>t.concluida);
  const itens=filtro==="pendentes"?pendentes:filtro==="atrasadas"?atrasadas:concluidas;

  return (
    <div className="fade-in">
      <div style={{marginBottom:24}}>
        <div className="accent-bar"/>
        <h1 style={{fontSize:24,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px"}}>Tarefas</h1>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>{pendentes.length} pendentes · {atrasadas.length} atrasadas</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
        <MetricCard label="Pendentes" value={pendentes.length}/>
        <MetricCard label="Atrasadas" value={atrasadas.length} subColor={atrasadas.length>0?"var(--danger)":"var(--success)"}/>
        <MetricCard label="Concluídas" value={concluidas.length} subColor="var(--success)"/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["pendentes","Pendentes"],["atrasadas","Atrasadas"],["concluidas","Concluídas"]].map(([k,l])=>(
          <button key={k} className={`filter-chip${filtro===k?" active":""}`} onClick={()=>setFiltro(k)}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {itens.length===0 && <div style={{textAlign:"center",padding:"2.5rem",color:"var(--text-muted)",fontSize:14}}>Nada por aqui.</div>}
          {itens.map(t=>{
            const c=clientes.find(cl=>cl.id===t.clienteId);
            const atras=!t.concluida&&isAtrasada(t.prazo);
            return (
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:atras?"var(--danger-bg)":"var(--bg1)",border:`1.5px solid ${atras?"var(--danger-border)":"var(--border)"}`,borderRadius:10}}>
                <input type="checkbox" checked={t.concluida} onChange={()=>toggle(t)} style={{cursor:"pointer",accentColor:"var(--accent)",width:15,height:15}}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 2px",fontSize:13,fontWeight:600,color:t.concluida?"var(--text-muted)":atras?"var(--danger)":"var(--text-primary)",textDecoration:t.concluida?"line-through":"none"}}>{t.titulo}</p>
                  <p style={{margin:0,fontSize:11,color:"var(--text-muted)",fontWeight:500}}>{c?.nome||"—"}{t.prazo?` · ${t.prazo.split("-").reverse().join("/")}`:""}</p>
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0, alignItems: "center"}}>
                  {atras&&<span className="pill" style={{background:"var(--danger-bg)",color:"var(--danger)",border:"1.5px solid var(--danger-border)"}}>Atrasada</span>}
                  <span className="pill" style={{background:t.prioridade==="alta"?"var(--warning-bg)":t.prioridade==="media"?"var(--info-bg)":"var(--bg3)",color:t.prioridade==="alta"?"var(--warning)":t.prioridade==="media"?"var(--info)":"var(--text-muted)",border:`1.5px solid ${t.prioridade==="alta"?"var(--warning-border)":t.prioridade==="media"?"var(--info-border)":"var(--border)"}`}}>{t.prioridade}</span>
                  <button onClick={()=>excluirTarefa(t.id)} style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:16, marginLeft: 4}}>×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView]=useState("dashboard");
  const [clienteSel,setClienteSel]=useState(null);

  const [clientes,setClientes]=useState([]);
  const [projetos,setProjetos]=useState([]);
  const [historico,setHistorico]=useState([]);
  const [tarefas,setTarefas]=useState([]);
  
  const [parcelas, setParcelas]=useState([]);
  const [posVenda, setPosVenda]=useState([]);
  const [metas, setMetas]=useState([]);
  
  const [loading,setLoading]=useState(true);
  const [dbOk, setDbOk]=useState(null);

  const toast=useToast();

  const carregarDados=useCallback(async()=>{
    setLoading(true);
    setDbOk(null);
    const [rc,rp,rh,rt,rpar,rpv,rm] = await Promise.all([
      supabase.from("clientes").select("*").order("created_at",{ascending:false}),
      supabase.from("projetos").select("*").order("created_at",{ascending:false}),
      supabase.from("historico").select("*").order("created_at",{ascending:false}),
      supabase.from("tarefas").select("*").order("created_at",{ascending:false}),
      supabase.from("parcelas").select("*").order("data_prevista",{ascending:true}),
      supabase.from("pos_venda").select("*").order("created_at",{ascending:false}),
      supabase.from("metas").select("*")
    ]);
    if(rc.data) setClientes(rc.data.map(normCliente));
    if(rp.data) setProjetos(rp.data.map(normProjeto));
    if(rh.data) setHistorico(rh.data.map(normHist));
    if(rt.data) setTarefas(rt.data.map(normTarefa));
    if(rpar.data) setParcelas(rpar.data.map(normParcela));
    if(rpv.data) setPosVenda(rpv.data.map(normPosVenda));
    if(rm.data) setMetas(rm.data.map(normMeta));
    setLoading(false);

    const erros=[rc,rp,rh,rt,rpar,rpv,rm].filter(r=>r.error);
    if(erros.length>0){
      setDbOk(false);
      toast.show("Erro de conexão com o banco. Verifique as credenciais.","erro");
    } else {
      setDbOk(true);
    }
  },[]);

  useEffect(()=>{ carregarDados(); },[carregarDados]);

  useEffect(()=>{
    const canal=supabase.channel("crm-changes")
      .on("postgres_changes",{event:"*",schema:"public",table:"clientes"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"projetos"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"historico"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"tarefas"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"parcelas"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"pos_venda"},()=>carregarDados())
      .subscribe();
    return ()=>{ supabase.removeChannel(canal); };
  },[carregarDados]);

  const atrasadas=tarefas.filter(t=>!t.concluida&&isAtrasada(t.prazo)).length;
  const nav=[
    {id:"dashboard",label:"Dashboard",icon:"▦"},
    {id:"clientes",  label:"Clientes",  icon:"◉"},
    {id:"pipeline",  label:"Pipeline",  icon:"⋮⋮"},
    {id:"projetos",  label:"Projetos",  icon:"◻"},
    {id:"tarefas",   label:"Tarefas",   icon:"✓",badge:atrasadas},
  ];

  const props={
    clientes,setClientes,projetos,setProjetos,historico,setHistorico,
    tarefas,setTarefas,parcelas,setParcelas,posVenda,setPosVenda,metas,setMetas,
    loading,toast
  };

  const renderView=()=>{
    switch(view){
      case "dashboard":      return <Dashboard {...props} setView={setView} setClienteSelecionado={setClienteSel}/>;
      case "clientes":       return <Clientes {...props} setView={setView} setClienteSelecionado={setClienteSel}/>;
      case "cliente-detalhe":return <ClienteDetalhe {...props} clienteId={clienteSel} setView={setView}/>;
      case "pipeline":       return <Pipeline {...props} setView={setView} setClienteSelecionado={setClienteSel}/>;
      case "projetos":       return <Projetos {...props}/>;
      case "tarefas":        return <Tarefas {...props}/>;
      default: return null;
    }
  };

  return (
    <>
      <FontLink/>
      <div style={{position:"fixed",inset:0,display:"flex",overflow:"hidden",background:"var(--bg0)"}}>

        {/* Sidebar */}
        <div style={{width:235,background:"var(--sidebar)",borderRight:"1.5px solid var(--sidebar-border)",display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",overflow:"hidden"}}>
          
          {/* Logo / Header */}
          <div style={{padding:"1.5rem 1.25rem 1.2rem",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div>
                <p style={{margin:0,fontSize:15,fontWeight:800,color:"#FFFFFF",letterSpacing:"-.01em",lineHeight:1.2}}>Estilo Design</p>
                <p style={{margin:0,fontSize:9,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".16em",fontWeight:700,marginTop:3}}>CRM</p>
              </div>
            </div>
          </div>

          <nav style={{flex:1,padding:"1.1rem .85rem"}}>
            <p style={{fontSize:9,color:"#3D4663",textTransform:"uppercase",letterSpacing:".12em",fontWeight:700,padding:"0 14px",marginBottom:10}}>Navegação</p>
            {nav.map(item=>{
              const active=view===item.id||(item.id==="clientes"&&view==="cliente-detalhe");
              return (
                <button key={item.id} className={`nav-btn${active?" active":""}`} onClick={()=>setView(item.id)}>
                  <span style={{fontSize:14,opacity:active?1:.7}}>{item.icon}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  {item.badge>0&&<span style={{background:"rgba(220,38,38,.25)",color:"#FCA5A5",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:99,border:"1px solid rgba(220,38,38,.35)"}}>{item.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div style={{padding:"1rem 1.1rem",borderTop:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:9}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:dbOk === true ? "#34D399" : dbOk === false ? "#F87171" : "#FCD34D",flexShrink:0,boxShadow:dbOk===true?"0 0 6px #34D39988":"none"}}/>
              <span style={{fontSize:11,color:dbOk === true ? "#34D399" : dbOk === false ? "#F87171" : "#FCD34D",fontWeight:600}}>
                {dbOk === true ? "Conectado" : dbOk === false ? "Erro de conexão" : "Verificando..."}
              </span>
            </div>
            <button onClick={carregarDados} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:8,color:"#8890A8",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all .18s"}} onMouseEnter={e=>{e.currentTarget.style.color="#C8CDDB";e.currentTarget.style.background="rgba(255,255,255,.10)";}} onMouseLeave={e=>{e.currentTarget.style.color="#8890A8";e.currentTarget.style.background="rgba(255,255,255,.05)";}}>↻ Sincronizar</button>
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,overflow:"auto",background:"var(--bg0)",height:"100vh"}}>
          <div style={{maxWidth:940,margin:"0 auto",padding:"2rem 1.5rem"}}>
            {renderView()}
          </div>
        </div>
      </div>

      {toast.toast && <Toast msg={toast.toast.msg} tipo={toast.toast.tipo} onClose={()=>toast.show(null)}/>}
    </>
  );
}
