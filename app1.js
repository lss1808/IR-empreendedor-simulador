/* ══════════════════════════════════════════
   STORAGE — chave única por item
══════════════════════════════════════════ */
const SK = {
  NOTAS:    'ire_notas_v3',
  IR_SIMS:  'ire_ir_v3',
  LAYOUT:   'ire_layout_v3',
  EMITENTE: 'ire_emitente_v1',
};

function dbGet(key, def=null){
  try{ const v=localStorage.getItem(key); return v!==null ? JSON.parse(v) : def; }
  catch(e){ return def; }
}
function dbSet(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch(e){ toast('Armazenamento cheio! Exporte suas notas e limpe o histórico.','err',6000); return false; }
}

/* ── Notas ── */
function loadNotas(){ return dbGet(SK.NOTAS, []); }
function saveNotas(arr){ dbSet(SK.NOTAS, arr); }
function getNota(id){ return loadNotas().find(n => n.id === id) || null; }
function upsertNota(nota){
  const arr = loadNotas();
  const idx = arr.findIndex(n => n.id === nota.id);
  if(idx >= 0) arr[idx] = { ...arr[idx], ...nota };
  else arr.unshift(nota);
  saveNotas(arr);
  console.log('[DB] Notas salvas:', arr.length, 'notas. IDs:', arr.map(n=>n.id));
  return nota;
}
function deleteNota(id){ saveNotas(loadNotas().filter(n => n.id !== id)); }

/* ── IR Simulações ── */
function loadIR(){ return dbGet(SK.IR_SIMS, []); }
function pushIR(sim){ const a=loadIR(); a.unshift(sim); dbSet(SK.IR_SIMS, a.slice(0,100)); }

/* ── Layout ── */
function loadLayout(){ return dbGet(SK.LAYOUT, { blocks: defBlocks(), theme: defTheme() }); }
function saveLayoutDB(l){ dbSet(SK.LAYOUT, l); }

/* ── Emitente (salva dados do emitente para reutilizar) ── */
function loadEmitente(){ return dbGet(SK.EMITENTE, {}); }
function saveEmitente(d){ dbSet(SK.EMITENTE, d); }

/* ══ UTILS ══ */
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const esc   = s => String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt   = (v,m='BRL') => new Intl.NumberFormat('pt-BR',{style:'currency',currency:m||'BRL',minimumFractionDigits:2}).format(v||0);
const fmtDate = d => { if(!d)return'—'; const s=(d.split('T')[0]).split('-'); return`${s[2]}/${s[1]}/${s[0]}`; };
const nowDate = () => new Date().toISOString().slice(0,10);
const irFmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:0,maximumFractionDigits:0}).format(v||0);

function toast(msg, type='info', ms=3500){
  const w=document.getElementById('toasts');
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.innerHTML=`<span>${esc(msg)}</span>`;
  w.appendChild(el);
  setTimeout(()=>el.remove(), ms);
}

function openModal(html){
  const root=document.getElementById('modal-root');
  root.innerHTML=`<div class="modal-bg" id="modal-overlay" onclick="e=>e.target===this&&closeModal()"><div class="modal">${html}</div></div>`;
  document.getElementById('modal-overlay').addEventListener('click', e=>{ if(e.target===e.currentTarget) closeModal(); });
}
function closeModal(){ document.getElementById('modal-root').innerHTML=''; }
window.closeModal=closeModal;

/* ══ LAYOUT / TEMA ══ */
function defBlocks(){ return[{id:'logo',name:'Logo & emitente',visible:true},{id:'cliente',name:'Dados do cliente',visible:true},{id:'itens',name:'Tabela de itens',visible:true},{id:'totais',name:'Totais',visible:true},{id:'obs',name:'Observações',visible:true},{id:'fotos',name:'Fotos de entrega',visible:true}]; }
function defTheme(){ return{sidebar:'#111827',accent:'#c9a84c',accentL:'#f0d080',bodyBg:'#ffffff',text:'#111827',textMuted:'#6b7280',font:'Outfit'}; }
const THEMES=[
  {name:'Clássico',  sidebar:'#111827',accent:'#c9a84c',accentL:'#f0d080',bodyBg:'#ffffff',text:'#111827',textMuted:'#6b7280'},
  {name:'Oceano',    sidebar:'#0c2340',accent:'#3b82f6',accentL:'#93c5fd',bodyBg:'#f8faff',text:'#0c2340',textMuted:'#4b7ab8'},
  {name:'Floresta',  sidebar:'#0d2b1a',accent:'#22c55e',accentL:'#86efac',bodyBg:'#f6fbf8',text:'#0d2b1a',textMuted:'#4a8c5c'},
  {name:'Borgonha',  sidebar:'#2d0a14',accent:'#e11d48',accentL:'#fda4af',bodyBg:'#fff8f9',text:'#2d0a14',textMuted:'#9b4460'},
  {name:'Ardósia',   sidebar:'#1e293b',accent:'#94a3b8',accentL:'#cbd5e1',bodyBg:'#f8fafc',text:'#1e293b',textMuted:'#64748b'},
  {name:'Puro',      sidebar:'#18181b',accent:'#71717a',accentL:'#d4d4d8',bodyBg:'#ffffff',text:'#18181b',textMuted:'#71717a'},
];

let layoutCfg   = loadLayout();
let layoutBlocks= [...(layoutCfg.blocks||defBlocks())];
let activeTheme = {...(layoutCfg.theme||defTheme())};

/* ══ ESTADO NOTA FISCAL ══ */
let nfId     = null;
let nfModel  = {};
let nfItems  = [];
let nfLogo   = null;
let nfImages = [];

function nfReset(){
  const emit = loadEmitente();
  nfId     = null;
  nfModel  = { tipo:'nfse', moeda:'BRL', data:nowDate(), desconto:0, impostos:0,
    nome:emit.nome||'', cnpj:emit.cnpj||'', tel:emit.tel||'', end:emit.end||'', email:emit.email||'' };
  nfItems  = [{desc:'',qty:1,unit:'un',price:'',total:0}];
  nfLogo   = emit.logo||null;
  nfImages = [];
}

function nfTotals(){
  const sub  = nfItems.reduce((a,it)=>a+(parseFloat(it.total)||0),0);
  const desc = parseFloat(nfModel.desconto)||0;
  const tax  = parseFloat(nfModel.impostos)||0;
  return { sub, desc, tax, total: Math.max(0, sub-desc+tax) };
}

const tipoInfo = k => ({
  nfse:     {l:'NFS-e',   full:'Nota Fiscal de Serviço'},
  nfe:      {l:'NF-e',    full:'Nota Fiscal Eletrônica'},
  fatura:   {l:'Fatura',  full:'Fatura Comercial'},
  recibo:   {l:'Recibo',  full:'Recibo de Pagamento'},
  orcamento:{l:'Orçamento',full:'Proposta Comercial'},
})[k]||{l:'Doc',full:'Documento'};

const statusBadge = s => ({emitida:'bb',paga:'bgreen',pendente:'bgold',cancelada:'bred'})[s]||'bg';

