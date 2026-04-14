// src/App.jsx
// CRM Móveis Planejados — integrado com Supabase
// Requer: npm install @supabase/supabase-js

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────────────────────
// Coloque suas credenciais no arquivo .env:
//   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
//   VITE_SUPABASE_KEY=SUA-ANON-KEY
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://SEU-PROJETO.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY || "SUA-ANON-KEY"
);

// ─── Estilos globais ─────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg0:#F4F6FA;--bg1:#FFFFFF;--bg2:#F8FAFC;--bg3:#F1F5F9;--bg4:#E9EEF5;
      --border:#E2E8F0;--border-hover:#CBD5E1;
      --accent:#4F46E5;--accent-light:#EEF2FF;--accent-mid:#C7D2FE;
      --text-primary:#0F172A;--text-secondary:#475569;--text-muted:#94A3B8;
      --success:#059669;--success-bg:#ECFDF5;--success-border:#A7F3D0;
      --danger:#DC2626;--danger-bg:#FEF2F2;--danger-border:#FECACA;
      --warning:#D97706;--warning-bg:#FFFBEB;--warning-border:#FDE68A;
      --info:#2563EB;--info-bg:#EFF6FF;--info-border:#BFDBFE;
    }
    body{background:var(--bg0);color:var(--text-primary);font-family:'Plus Jakarta Sans',sans-serif;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:var(--bg3);}
    ::-webkit-scrollbar-thumb{background:var(--border-hover);border-radius:99px;}
    input,select,textarea{background:var(--bg1);border:1.5px solid var(--border);color:var(--text-primary);font-family:'Plus Jakarta Sans',sans-serif;border-radius:8px;outline:none;transition:border .18s,box-shadow .18s;}
    input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,70,229,.1);}
    input::placeholder,textarea::placeholder{color:var(--text-muted);}
    select option{background:var(--bg1);}
    .card{background:var(--bg1);border:1.5px solid var(--border);border-radius:14px;padding:1.25rem;transition:border .18s,box-shadow .18s;}
    .card-click{cursor:pointer;}
    .card-click:hover{border-color:var(--accent-mid);box-shadow:0 2px 12px rgba(79,70,229,.07);}
    .metric-card{background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;padding:.9rem 1rem;}
    .btn{border-radius:8px;cursor:pointer;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:6px 14px;border:1.5px solid;}
    .btn-default{background:var(--bg1);border-color:var(--border);color:var(--text-secondary);}
    .btn-default:hover{border-color:var(--border-hover);color:var(--text-primary);}
    .btn-primary{background:var(--accent);border-color:var(--accent);color:#fff;}
    .btn-primary:hover{filter:brightness(1.08);}
    .btn-ghost{background:transparent;border-color:transparent;color:var(--text-muted);}
    .btn-ghost:hover{color:var(--text-secondary);}
    .btn-danger{background:var(--danger-bg);border-color:var(--danger-border);color:var(--danger);}
    .pill{display:inline-block;font-size:10px;padding:2px 8px;border-radius:99px;font-weight:700;white-space:nowrap;letter-spacing:.03em;}
    .tab-btn{background:none;border:none;border-bottom:2px solid transparent;color:var(--text-muted);font-size:13px;font-weight:500;padding:8px 14px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
    .tab-btn:hover{color:var(--text-secondary);}
    .tab-btn.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:600;}
    .nav-btn{width:100%;display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;margin-bottom:2px;transition:all .15s;text-align:left;color:var(--text-secondary);background:transparent;}
    .nav-btn:hover{background:var(--bg0);color:var(--text-primary);}
    .nav-btn.active{background:var(--accent-light);color:var(--accent);font-weight:600;}
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
const fmt = v => "R$\u00A0" + Number(v||0).toLocaleString("pt-BR");
const hoje = new Date();
const isAtrasada = p => p && new Date(p) < hoje;
const initials = nome => nome?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "??";
const dataBR = () => new Date().toLocaleDateString("pt-BR");
const horaBR = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})+"h";

// Normaliza cliente do Supabase (snake_case → camelCase)
const normCliente = c => ({
  ...c,
  indicadoPor: c.indicado_por || "",
  primeiroContato: c.primeiro_contato || dataBR(),
  avatar: initials(c.nome),
  ambientes: c.ambientes || [],
});

// Normaliza projeto do Supabase
const normProjeto = p => ({
  ...p,
  clienteId: p.cliente_id,
  prazoEntrega: p.prazo_entrega || "",
  ambientes: Array.isArray(p.ambientes) ? p.ambientes : [],
});

// Normaliza histórico
const normHist = h => ({ ...h, clienteId: h.cliente_id, tags: h.tags || [] });

// Normaliza tarefa
const normTarefa = t => ({ ...t, clienteId: t.cliente_id });

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

const Input = ({label,value,onChange,placeholder,type="text"}) => (
  <div style={{marginBottom:12}}>
    {label && <label style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)",display:"block",marginBottom:5}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
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
function Dashboard({clientes,projetos,tarefas,loading}) {
  const receita = projetos.filter(p=>["Contrato","Produção","Entrega"].includes(p.etapa)).reduce((s,p)=>s+(p.valor||0),0);
  const fechados = clientes.filter(c=>["Contrato","Produção","Entrega"].includes(c.etapa)).length;
  const conv = clientes.length ? Math.round(fechados/clientes.length*100) : 0;
  const ticket = fechados ? Math.round(receita/fechados) : 0;
  const pendentes = tarefas.filter(t=>!t.concluida);
  const atrasadas = pendentes.filter(t=>isAtrasada(t.prazo));
  const porEtapa = ETAPAS.map(e=>({etapa:e,count:clientes.filter(c=>c.etapa===e).length}));
  const maxC = Math.max(...porEtapa.map(e=>e.count),1);

  return (
    <div className="fade-in">
      <div style={{marginBottom:28}}>
        <div className="accent-bar"/>
        <h1 style={{fontSize:24,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px"}}>Dashboard</h1>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>Visão geral · {new Date().toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</p>
      </div>

      {loading ? <Spinner texto="Carregando dados..."/> : (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            <MetricCard label="Receita em carteira" value={fmt(receita)} sub="Contratos + produção" subColor="var(--accent)"/>
            <MetricCard label="Clientes ativos" value={clientes.length} sub={`${fechados} com contrato`}/>
            <MetricCard label="Conversão" value={conv+"%"} sub={conv>=25?"Acima da meta":"Abaixo da meta"} subColor={conv>=25?"var(--success)":"var(--danger)"}/>
            <MetricCard label="Ticket médio" value={fmt(ticket)} sub="Por projeto fechado"/>
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

            <div className="card">
              <p className="section-label">Tarefas do dia</p>
              {pendentes.length===0 && <p style={{fontSize:13,color:"var(--text-muted)",textAlign:"center",padding:"1rem 0"}}>Tudo em dia ✓</p>}
              {pendentes.slice(0,5).map(t=>{
                const c=clientes.find(cl=>cl.id===t.clienteId||cl.id===t.cliente_id);
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
              {atrasadas.length>0 && (
                <div style={{marginTop:10,background:"var(--danger-bg)",border:"1.5px solid var(--danger-border)",borderRadius:8,padding:"7px 10px"}}>
                  <p style={{margin:0,fontSize:11,color:"var(--danger)",fontWeight:700}}>{atrasadas.length} tarefa{atrasadas.length>1?"s":""} atrasada{atrasadas.length>1?"s":""}</p>
                </div>
              )}
            </div>
          </div>

          {projetos.length>0 && (
            <div className="card">
              <p className="section-label">Projetos em andamento</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {projetos.slice(0,3).map(p=>{
                  const c=clientes.find(cl=>cl.id===p.clienteId||cl.id===p.cliente_id);
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
    </div>
  );
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
function Clientes({clientes,setClientes,historico,tarefas,setView,setClienteSelecionado,loading,toast}) {
  const [busca,setBusca]=useState("");
  const [filtro,setFiltro]=useState("Todos");
  const [showForm,setShowForm]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [novo,setNovo]=useState({nome:"",telefone:"",email:"",origem:"Indicação",imovel:"Apartamento",cidade:"",etapa:"Lead",obs:""});

  const filtrados=clientes.filter(c=>{
    const mb=c.nome?.toLowerCase().includes(busca.toLowerCase())||c.email?.toLowerCase().includes(busca.toLowerCase());
    return mb&&(filtro==="Todos"||c.etapa===filtro);
  });

  const add=async()=>{
    if(!novo.nome.trim())return;
    setSalvando(true);
    const cor=CORES_AVATAR[clientes.length%CORES_AVATAR.length];
    const payload={
      nome:novo.nome.trim(), telefone:novo.telefone, email:novo.email,
      origem:novo.origem, imovel:novo.imovel, cidade:novo.cidade,
      etapa:novo.etapa, obs:novo.obs, cor,
      indicado_por:"", ambientes:[], metragem:"",
      primeiro_contato:dataBR(),
    };
    const {data,error}=await supabase.from("clientes").insert([payload]).select().single();
    setSalvando(false);
    if(error){toast.show("Erro ao salvar cliente: "+error.message,"erro");return;}
    setClientes(prev=>[normCliente(data),...prev]);
    setNovo({nome:"",telefone:"",email:"",origem:"Indicação",imovel:"Apartamento",cidade:"",etapa:"Lead",obs:""});
    setShowForm(false);
    toast.show("Cliente salvo com sucesso!");
  };

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
        <div><div className="accent-bar"/><h1 style={{fontSize:24,fontWeight:700,color:"var(--text-primary)",margin:"0 0 3px"}}>Clientes</h1><p style={{fontSize:13,color:"var(--text-muted)"}}>{clientes.length} cadastrados</p></div>
        <button className="btn btn-primary" onClick={()=>setShowForm(true)}>+ Novo cliente</button>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar cliente..." style={{flex:1,minWidth:160,padding:"8px 12px",fontSize:13}}/>
        <select value={filtro} onChange={e=>setFiltro(e.target.value)} style={{padding:"8px 12px",fontSize:13,cursor:"pointer"}}>
          <option>Todos</option>
          {ETAPAS.map(e=><option key={e}>{e}</option>)}
        </select>
      </div>

      {loading ? <Spinner/> : (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtrados.map(c=>{
            const hist=historico.filter(h=>h.clienteId===c.id||h.cliente_id===c.id).length;
            const tarf=tarefas.filter(t=>(t.clienteId===c.id||t.cliente_id===c.id)&&!t.concluida).length;
            return (
              <div key={c.id} className="card card-click" onClick={()=>{setClienteSelecionado(c.id);setView("cliente-detalhe");}} style={{padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Avatar initials={initials(c.nome)} cor={c.cor||"#4F46E5"}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:700,color:"var(--text-primary)"}}>{c.nome}</span>
                      <EtapaBadge etapa={c.etapa}/>
                    </div>
                    <p style={{margin:0,fontSize:12,color:"var(--text-muted)"}}>{c.telefone||"—"} · {c.cidade||"—"} · {c.imovel||"—"}</p>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <p style={{margin:"0 0 2px",fontSize:11,color:"var(--text-muted)",fontWeight:500}}>{hist} interações · {tarf} tarefas</p>
                    <p style={{margin:0,fontSize:10,color:"var(--text-muted)"}}>desde {c.primeiroContato||c.primeiro_contato||"—"}</p>
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
function ClienteDetalhe({clienteId,clientes,setClientes,historico,setHistorico,tarefas,setTarefas,projetos,setView,toast}) {
  const [aba,setAba]=useState("dados");
  const [showH,setShowH]=useState(false);
  const [showT,setShowT]=useState(false);
  const [showP,setShowP]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [ni,setNi]=useState({tipo:"WhatsApp",direcao:"Saída",titulo:"",texto:"",tags:""});
  const [nt,setNt]=useState({titulo:"",prazo:"",prioridade:"media"});
  const [np,setNp]=useState({numero:"",titulo:"",valor:"",entrada:"",margem:"",projetista:"",prazoEntrega:"",obs:""});

  const c=clientes.find(cl=>cl.id===clienteId);
  if(!c)return null;

  const hist=historico.filter(h=>h.clienteId===c.id||h.cliente_id===c.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const tarf=tarefas.filter(t=>t.clienteId===c.id||t.cliente_id===c.id);
  const proj=projetos.filter(p=>p.clienteId===c.id||p.cliente_id===c.id);

  const avancar=async()=>{
    const idx=ETAPAS.indexOf(c.etapa);
    if(idx>=ETAPAS.length-1)return;
    const novaEtapa=ETAPAS[idx+1];
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

  const addT=async()=>{
    if(!nt.titulo.trim())return;
    setSalvando(true);
    const payload={cliente_id:c.id,titulo:nt.titulo,prazo:nt.prazo,prioridade:nt.prioridade,concluida:false};
    const {data,error}=await supabase.from("tarefas").insert([payload]).select().single();
    setSalvando(false);
    if(error){toast.show("Erro ao salvar tarefa","erro");return;}
    setTarefas(prev=>[...prev,normTarefa(data)]);
    setNt({titulo:"",prazo:"",prioridade:"media"});
    setShowT(false);
    toast.show("Tarefa criada!");
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
    // projetos é gerenciado no App, então recarregamos via prop de refresh
    toast.show("Projeto criado! Recarregue para ver.");
    setNp({numero:"",titulo:"",valor:"",entrada:"",margem:"",projetista:"",prazoEntrega:"",obs:""});
    setShowP(false);
  };

  const toggleTarefa=async(t)=>{
    const novoConcluida=!t.concluida;
    const {error}=await supabase.from("tarefas").update({concluida:novoConcluida}).eq("id",t.id);
    if(error){toast.show("Erro ao atualizar tarefa","erro");return;}
    setTarefas(prev=>prev.map(x=>x.id===t.id?{...x,concluida:novoConcluida}:x));
  };

  const abas=["dados","projeto","historico","tarefas"];
  const aL={dados:"Dados",projeto:`Projetos (${proj.length})`,historico:`Histórico (${hist.length})`,tarefas:`Tarefas (${tarf.filter(t=>!t.concluida).length})`};

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <button onClick={()=>setView("clientes")} className="btn btn-ghost" style={{fontSize:12}}>← Clientes</button>
        <span style={{color:"var(--text-muted)",fontSize:13}}>/</span>
        <span style={{fontSize:13,color:"var(--text-secondary)",fontWeight:500}}>{c.nome}</span>
      </div>

      <div className="card" style={{marginBottom:10}}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
          <Avatar initials={initials(c.nome)} cor={c.cor||"#4F46E5"} size={46}/>
          <div style={{flex:1,minWidth:180}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:5}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"var(--text-primary)"}}>{c.nome}</h2>
              <EtapaBadge etapa={c.etapa}/>
            </div>
            <p style={{margin:0,fontSize:13,color:"var(--text-muted)"}}>{c.telefone||"—"} · {c.email||"—"}</p>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button className="btn btn-default" onClick={()=>setShowH(true)}>+ Interação</button>
            <button className="btn btn-default" onClick={()=>setShowT(true)}>+ Tarefa</button>
            <button className="btn btn-default" onClick={()=>setShowP(true)}>+ Projeto</button>
            {ETAPAS.indexOf(c.etapa)<ETAPAS.length-1 && <button className="btn btn-primary" onClick={avancar}>Avançar etapa →</button>}
          </div>
        </div>
        <div style={{display:"flex",marginTop:16,gap:0,borderTop:"1.5px solid var(--border)",paddingTop:4}}>
          {abas.map(a=><button key={a} className={`tab-btn${aba===a?" active":""}`} onClick={()=>setAba(a)}>{aL[a]}</button>)}
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
            {[["Canal",c.origem],["Indicado por",c.indicadoPor||c.indicado_por||"—"],["Desde",c.primeiroContato||c.primeiro_contato||"—"]].map(([l,v])=>(
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
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}><span style={{fontSize:10,color:"var(--text-muted)",fontFamily:"'DM Mono',monospace",fontWeight:700}}>#{p.numero||"—"}</span><EtapaBadge etapa={p.etapa}/></div>
                  <p style={{margin:0,fontSize:15,fontWeight:700,color:"var(--text-primary)"}}>{p.titulo}</p>
                </div>
                <p style={{margin:0,fontSize:22,fontWeight:700,color:"var(--accent)",fontFamily:"'DM Mono',monospace"}}>{fmt(p.valor)}</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[["Entrada",fmt(p.entrada),"var(--text-primary)"],["Margem",(p.margem||0)+"%","var(--success)"],["Entrega",p.prazoEntrega||p.prazo_entrega||"—","var(--text-primary)"]].map(([l,v,vc])=>(
                  <div key={l} style={{background:"var(--bg2)",borderRadius:8,padding:"8px 10px",border:"1.5px solid var(--border)"}}>
                    <p style={{margin:"0 0 2px",fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".07em",fontWeight:700}}>{l}</p>
                    <p style={{margin:0,fontSize:14,fontWeight:700,color:vc,fontFamily:"'DM Mono',monospace"}}>{v}</p>
                  </div>
                ))}
              </div>
              {Array.isArray(p.ambientes)&&p.ambientes.map((a,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"var(--bg2)",borderRadius:8,marginBottom:4,fontSize:13,border:"1.5px solid var(--border)"}}>
                  <span style={{fontWeight:700,color:"var(--text-primary)"}}>{a.nome||a}</span>
                  {a.valor&&<span style={{fontWeight:700,color:"var(--accent)",fontFamily:"'DM Mono',monospace"}}>{fmt(a.valor)}</span>}
                </div>
              ))}
              {p.obs&&<p style={{margin:"10px 0 0",fontSize:12,color:"var(--text-secondary)",background:"var(--accent-light)",padding:"8px 12px",borderRadius:8,borderLeft:"3px solid var(--accent)"}}>{p.obs}</p>}
            </div>
          ))
      )}

      {aba==="historico" && (
        <div className="card">
          {hist.length===0
            ? <div style={{textAlign:"center",padding:"1.5rem",color:"var(--text-muted)"}}>Nenhuma interação registrada ainda.</div>
            : hist.map(h=>{
              const ts=TS[h.tipo]||TS.Nota;
              return (
                <div key={h.id} className="hist-entry">
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
                <input type="checkbox" checked={false} onChange={()=>toggleTarefa(t)} style={{cursor:"pointer",accentColor:"var(--accent)",width:15,height:15}}/>
                <div style={{flex:1}}>
                  <p style={{margin:0,fontSize:13,fontWeight:600,color:atras?"var(--danger)":"var(--text-primary)"}}>{t.titulo}</p>
                  <p style={{margin:0,fontSize:11,color:"var(--text-muted)"}}>{atras?"Atrasada · ":""}{t.prazo?t.prazo.split("-").reverse().join("/"):"Sem prazo"}</p>
                </div>
                <span className="pill" style={{background:t.prioridade==="alta"?"var(--warning-bg)":t.prioridade==="media"?"var(--info-bg)":"var(--bg3)",color:t.prioridade==="alta"?"var(--warning)":t.prioridade==="media"?"var(--info)":"var(--text-muted)",border:`1.5px solid ${t.prioridade==="alta"?"var(--warning-border)":t.prioridade==="media"?"var(--info-border)":"var(--border)"}`}}>{t.prioridade}</span>
              </div>
            );
          })}
          {tarf.filter(t=>t.concluida).length>0 && (
            <><Divider/><p className="section-label">Concluídas</p>
            {tarf.filter(t=>t.concluida).map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:9,marginBottom:4,background:"var(--bg2)",opacity:.65}}>
                <input type="checkbox" checked onChange={()=>toggleTarefa(t)} style={{cursor:"pointer",accentColor:"var(--accent)",width:15,height:15}}/>
                <p style={{margin:0,fontSize:13,color:"var(--text-muted)",textDecoration:"line-through"}}>{t.titulo}</p>
              </div>
            ))}</>
          )}
        </div>
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
            <button className="btn btn-primary" onClick={addT} disabled={salvando}>{salvando?"Salvando...":"Salvar"}</button>
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
    const c=clientes.find(cl=>cl.id===p.clienteId||cl.id===p.cliente_id);
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
            const c=clientes.find(cl=>cl.id===p.clienteId||cl.id===p.cliente_id);
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
            const c=clientes.find(cl=>cl.id===t.clienteId||cl.id===t.cliente_id);
            const atras=!t.concluida&&isAtrasada(t.prazo);
            return (
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:atras?"var(--danger-bg)":"var(--bg1)",border:`1.5px solid ${atras?"var(--danger-border)":"var(--border)"}`,borderRadius:10}}>
                <input type="checkbox" checked={t.concluida} onChange={()=>toggle(t)} style={{cursor:"pointer",accentColor:"var(--accent)",width:15,height:15}}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 2px",fontSize:13,fontWeight:600,color:t.concluida?"var(--text-muted)":atras?"var(--danger)":"var(--text-primary)",textDecoration:t.concluida?"line-through":"none"}}>{t.titulo}</p>
                  <p style={{margin:0,fontSize:11,color:"var(--text-muted)",fontWeight:500}}>{c?.nome||"—"}{t.prazo?` · ${t.prazo.split("-").reverse().join("/")}`:""}</p>
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  {atras&&<span className="pill" style={{background:"var(--danger-bg)",color:"var(--danger)",border:"1.5px solid var(--danger-border)"}}>Atrasada</span>}
                  <span className="pill" style={{background:t.prioridade==="alta"?"var(--warning-bg)":t.prioridade==="media"?"var(--info-bg)":"var(--bg3)",color:t.prioridade==="alta"?"var(--warning)":t.prioridade==="media"?"var(--info)":"var(--text-muted)",border:`1.5px solid ${t.prioridade==="alta"?"var(--warning-border)":t.prioridade==="media"?"var(--info-border)":"var(--border)"}`}}>{t.prioridade}</span>
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
  const [loading,setLoading]=useState(true);

  const toast=useToast();

  // Carrega todos os dados ao iniciar
  const carregarDados=useCallback(async()=>{
    setLoading(true);
    const [rc,rp,rh,rt]=await Promise.all([
      supabase.from("clientes").select("*").order("created_at",{ascending:false}),
      supabase.from("projetos").select("*").order("created_at",{ascending:false}),
      supabase.from("historico").select("*").order("created_at",{ascending:false}),
      supabase.from("tarefas").select("*").order("created_at",{ascending:false}),
    ]);
    if(rc.data) setClientes(rc.data.map(normCliente));
    if(rp.data) setProjetos(rp.data.map(normProjeto));
    if(rh.data) setHistorico(rh.data.map(normHist));
    if(rt.data) setTarefas(rt.data.map(normTarefa));
    setLoading(false);

    // Erros de conexão
    const erros=[rc,rp,rh,rt].filter(r=>r.error);
    if(erros.length>0){
      toast.show("Erro de conexão com o banco de dados. Verifique as credenciais do Supabase.","erro");
    }
  },[]);

  useEffect(()=>{ carregarDados(); },[carregarDados]);

  // Subscrição em tempo real — atualiza quando outro usuário faz mudanças
  useEffect(()=>{
    const canal=supabase.channel("crm-changes")
      .on("postgres_changes",{event:"*",schema:"public",table:"clientes"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"projetos"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"historico"},()=>carregarDados())
      .on("postgres_changes",{event:"*",schema:"public",table:"tarefas"},()=>carregarDados())
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

  const props={clientes,setClientes,projetos,setProjetos,historico,setHistorico,tarefas,setTarefas,loading,toast};

  const renderView=()=>{
    switch(view){
      case "dashboard":      return <Dashboard {...props}/>;
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
      <div style={{display:"flex",minHeight:"100vh",background:"var(--bg0)"}}>

        {/* Sidebar */}
        <div style={{width:215,background:"var(--bg1)",borderRight:"1.5px solid var(--border)",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"1.4rem 1.25rem 1.1rem",borderBottom:"1.5px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,background:"var(--accent)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",flexShrink:0}}>M</div>
              <div>
                <p style={{margin:0,fontSize:14,fontWeight:700,color:"var(--text-primary)",letterSpacing:"-.02em"}}>MóveisCRM</p>
                <p style={{margin:0,fontSize:9,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700}}>Planejados</p>
              </div>
            </div>
          </div>

          <nav style={{flex:1,padding:"1rem .75rem"}}>
            <p style={{fontSize:9,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,padding:"0 12px",marginBottom:8}}>Menu</p>
            {nav.map(item=>{
              const active=view===item.id||(item.id==="clientes"&&view==="cliente-detalhe");
              return (
                <button key={item.id} className={`nav-btn${active?" active":""}`} onClick={()=>setView(item.id)}>
                  <span style={{fontSize:13}}>{item.icon}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  {item.badge>0&&<span style={{background:"var(--danger-bg)",color:"var(--danger)",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:99,border:"1.5px solid var(--danger-border)"}}>{item.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div style={{padding:"1rem",borderTop:"1.5px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--success)",flexShrink:0}}/>
              <span style={{fontSize:11,color:"var(--success)",fontWeight:600}}>Conectado ao Supabase</span>
            </div>
            <button onClick={carregarDados} className="btn btn-default" style={{width:"100%",justifyContent:"center",fontSize:11,padding:"5px"}}>↻ Sincronizar</button>
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,overflow:"auto",background:"var(--bg0)"}}>
          <div style={{maxWidth:940,margin:"0 auto",padding:"2rem 1.5rem"}}>
            {renderView()}
          </div>
        </div>
      </div>

      {toast.toast && <Toast msg={toast.toast.msg} tipo={toast.toast.tipo} onClose={()=>toast.show(null)}/>}
    </>
  );
}
