/* ══ EDITOR DE LAYOUT ══ */
function rLayout(el,acts){
  acts.innerHTML=`<button class="btn btn-gold btn-sm" onclick="saveLayout()">💾 Salvar</button>`;
  el.innerHTML=`
  <div class="card"><div class="card-header"><span class="card-title">Tema da nota</span></div>
    <div class="th-grid" id="tg">${THEMES.map((t,i)=>thCard(t,i)).join('')}</div>
    <div class="sec-lbl" style="margin-top:1.5rem">Personalizar</div>
    <div class="g3">
      <div class="field"><label>Barra lateral</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" value="${activeTheme.sidebar}" oninput="activeTheme.sidebar=this.value;upPrev()" style="width:42px;height:34px;padding:2px;border-radius:6px;border:.5px solid var(--border2);cursor:pointer"/>
          <span style="font-size:12px;color:var(--text2)" id="c1t">${activeTheme.sidebar}</span>
        </div></div>
      <div class="field"><label>Cor de destaque</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="color" value="${activeTheme.accent}" oninput="activeTheme.accent=this.value;activeTheme.accentL=this.value+'cc';upPrev()" style="width:42px;height:34px;padding:2px;border-radius:6px;border:.5px solid var(--border2);cursor:pointer"/>
          <span style="font-size:12px;color:var(--text2)" id="c2t">${activeTheme.accent}</span>
        </div></div>
      <div class="field"><label>Fonte</label>
        <select onchange="activeTheme.font=this.value;upPrev()">${['Outfit','Georgia','Trebuchet MS','Arial'].map(f=>`<option ${activeTheme.font===f?'selected':''}>${f}</option>`).join('')}</select></div>
    </div>
  </div>
  <div class="card"><div class="card-header"><span class="card-title">Blocos da nota</span><span style="font-size:12px;color:var(--text3)">Arraste para reordenar · toggle para mostrar/ocultar</span></div>
    <div class="bl-list" id="bl">${layoutBlocks.map(b=>blkHtml(b)).join('')}</div>
  </div>
  <div class="card"><div class="card-header"><span class="card-title">Pré-visualização</span></div>
    <div id="prev" style="border-radius:10px;overflow:hidden">${miniPrev()}</div>
  </div>`;
  initDrag();
}
const thCard=(t,i)=>{const s=activeTheme.sidebar===t.sidebar&&activeTheme.accent===t.accent;return`<div class="th-card ${s?'sel':''}" onclick="applyT(${i})"><div class="th-prev"><div style="width:35%;background:${t.sidebar}"></div><div style="flex:1;background:${t.bodyBg};padding:6px;display:flex;flex-direction:column;justify-content:flex-end"><div style="height:4px;background:${t.accent};border-radius:2px;margin-bottom:3px;width:60%"></div><div style="height:2px;background:${t.accentL};border-radius:1px;width:40%"></div></div></div><div class="th-lbl">${t.name}</div></div>`;};
window.applyT=(i)=>{ const t=THEMES[i]; activeTheme={...activeTheme,...t}; rLayout(document.getElementById('ca'),document.getElementById('ta')); };
window.upPrev=()=>{ const c1=document.getElementById('c1t'),c2=document.getElementById('c2t'); if(c1)c1.textContent=activeTheme.sidebar; if(c2)c2.textContent=activeTheme.accent; const p=document.getElementById('prev'); if(p)p.innerHTML=miniPrev(); };
const miniPrev=()=>{const th=activeTheme;return`<div style="display:flex;height:145px;font-family:${th.font},sans-serif"><div style="width:105px;background:${th.sidebar};padding:12px;display:flex;flex-direction:column;gap:5px"><div style="height:7px;background:${th.accent};border-radius:3px;width:70%"></div><div style="height:4px;background:rgba(255,255,255,.2);border-radius:2px;width:50%;margin-top:4px"></div><div style="height:4px;background:rgba(255,255,255,.15);border-radius:2px;width:60%"></div></div><div style="flex:1;background:${th.bodyBg};padding:12px"><div style="height:6px;background:${th.text};border-radius:2px;width:50%;margin-bottom:6px;opacity:.7"></div><div style="height:3px;background:${th.textMuted};border-radius:2px;width:80%;margin-bottom:4px;opacity:.4"></div><div style="display:flex;justify-content:flex-end;margin-top:8px"><div style="background:#f9fafb;border-radius:5px;padding:5px 8px"><div style="height:3px;background:${th.textMuted};border-radius:2px;width:50px;margin-bottom:4px;opacity:.4"></div><div style="height:5px;background:${th.accent};border-radius:2px;width:70px"></div></div></div></div></div><div style="height:4px;background:linear-gradient(90deg,${th.sidebar},${th.accent},${th.accentL},${th.accent},${th.sidebar})"></div>`;};
const blkHtml=b=>`<div class="bl-item" draggable="true" data-id="${b.id}" id="blk-${b.id}"><span class="drag-handle">⠿</span><span style="font-size:13px;font-weight:500;flex:1">${b.name}</span><div class="tog ${b.visible?'on':''}" id="tog-${b.id}" onclick="togBlk('${b.id}')"></div></div>`;
window.togBlk=(id)=>{ const b=layoutBlocks.find(x=>x.id===id); if(b){b.visible=!b.visible;const t=document.getElementById('tog-'+id);if(t)t.classList.toggle('on',b.visible);} };
window.saveLayout=()=>{ layoutCfg={blocks:layoutBlocks,theme:activeTheme}; saveLayoutDB(layoutCfg); toast('Layout salvo!','ok'); };
function initDrag(){
  let src=null;
  document.querySelectorAll('.bl-item').forEach(el=>{
    el.addEventListener('dragstart',e=>{src=el;el.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    el.addEventListener('dragend',()=>{el.classList.remove('dragging');document.querySelectorAll('.bl-item').forEach(b=>b.classList.remove('drag-over'));});
    el.addEventListener('dragover',e=>{e.preventDefault();if(el!==src)el.classList.add('drag-over');});
    el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
    el.addEventListener('drop',e=>{e.preventDefault();if(el===src)return;const list=document.getElementById('bl');const all=[...list.querySelectorAll('.bl-item')];if(all.indexOf(src)<all.indexOf(el))el.after(src);else el.before(src);el.classList.remove('drag-over');const order=[...list.querySelectorAll('.bl-item')].map(b=>b.dataset.id);layoutBlocks.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));});
  });
}

/* ══════════════════════════════════════════
   IR 2026 — tabela progressiva atualizada
   Ano-base 2025 (declaração em 2026)
══════════════════════════════════════════ */
const IR_TABELA_2026=[
  {ate:33919.80,  aliq:0,     ded:0},          // isento até R$33.919,80
  {ate:45012.60,  aliq:0.075, ded:2541.99},
  {ate:55976.16,  aliq:0.15,  ded:5936.13},
  {ate:70000.00,  aliq:0.225, ded:10130.22},
  {ate:Infinity,  aliq:0.275, ded:13613.22},
];
// Dedução por dependente 2026: R$2.275,08 (mantida — aguarda atualização oficial)
const DEP_2026 = 2275.08;

const IR_STEPS=[
  {id:'tipo',t:'Tipo de empresa',h:'Escolha sua categoria.',type:'opts',opts:[{k:'mei',i:'🧑‍💼',l:'MEI',d:'Microempreendedor Individual'},{k:'me',i:'🏪',l:'Microempresa',d:'Até R$ 4,8 mi/ano'},{k:'epp',i:'🏢',l:'Pequeno porte',d:'EPP'},{k:'aut',i:'🧑‍🔧',l:'Autônomo',d:'Pessoa física'}]},
  {id:'reg',t:'Regime tributário',h:'Se não souber, selecione Simples Nacional.',type:'opts',opts:[{k:'sim',i:'📋',l:'Simples Nacional',d:'Regime unificado'},{k:'lp',i:'📊',l:'Lucro Presumido',d:'Margem estimada'},{k:'lr',i:'📈',l:'Lucro Real',d:'Lucro efetivo'},{k:'ns',i:'❓',l:'Não sei',d:''}]},
  {id:'fat',t:'Faturamento bruto anual (2025)',h:'Total recebido antes de descontar despesas.',type:'money',field:'fat',ph:'100000'},
  {id:'desp',t:'Despesas dedutíveis (2025)',h:'Aluguel, materiais, salários, contabilidade, marketing.',type:'money',field:'desp',ph:'30000'},
  {id:'prol',t:'Você retira pró-labore?',h:'Remuneração formal do sócio. Incide INSS e IR.',type:'opts',opts:[{k:'sim',i:'✅',l:'Sim',d:''},{k:'nao',i:'❌',l:'Não',d:''}]},
  {id:'prolv',t:'Valor total do pró-labore (2025)',h:'Some todos os meses.',type:'money',field:'prolv',ph:'48000',skip:()=>irS.prol==='nao'},
  {id:'out',t:'Outras fontes de renda?',h:'Aluguéis, CLT, dividendos, aplicações.',type:'opts',opts:[{k:'sim',i:'💰',l:'Sim',d:''},{k:'nao',i:'🚫',l:'Não',d:''}]},
  {id:'outv',t:'Total de outras rendas (2025)',h:'Some todas as fontes.',type:'money',field:'outv',ph:'12000',skip:()=>irS.out==='nao'},
  {id:'dep',t:'Dependentes na declaração',h:'Filhos, cônjuge sem renda, pais — cada um reduz a base de cálculo.',type:'opts',opts:[{k:'0',i:'0️⃣',l:'Nenhum',d:''},{k:'1',i:'1️⃣',l:'1',d:''},{k:'2',i:'2️⃣',l:'2',d:''},{k:'3+',i:'3️⃣',l:'3+',d:''}]},
  {id:'ded',t:'Despesas pessoais dedutíveis (2025)',h:'Saúde (sem limite), educação (até R$3.726,00/pessoa), PGBL (12% da renda).',type:'money',field:'ded',ph:'9000'},
];
let irS={}, irCur=0, irVis=[];
const irBld=()=>{ irVis=IR_STEPS.filter(s=>!s.skip||!s.skip()); };
const irPrs=s=>parseFloat((s||'').toString().replace(/\./g,'').replace(',','.'))||0;

function rIR(el,acts){ irS={}; irCur=0; irBld(); acts.innerHTML=''; irStep(el); }
function irStep(el){
  const s=irVis[irCur], pct=Math.round(((irCur+1)/irVis.length)*100);
  let body='';
  if(s.type==='opts'){
    body=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">`+
      s.opts.map(o=>`<button style="border:.5px solid var(--border2);border-radius:var(--rs);background:${irS[s.id]===o.k?'var(--gold-dim2)':'var(--bg2)'};${irS[s.id]===o.k?'border:1.5px solid var(--gold);':''};padding:14px;text-align:center;cursor:pointer;font-family:inherit;transition:all .15s" onclick="irSel('${s.id}','${o.k}',this)">
        <div style="font-size:22px;margin-bottom:6px">${o.i}</div>
        <span style="font-size:13px;font-weight:600;color:var(--text);display:block">${o.l}</span>
        ${o.d?`<span style="font-size:11px;color:var(--text3);display:block;margin-top:2px">${o.d}</span>`:''}
      </button>`).join('')+`</div>`;
  } else {
    body=`<div style="position:relative">
      <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--text3);font-weight:600;pointer-events:none">R$</span>
      <input type="number" id="ir-inp" min="0" placeholder="${s.ph}" value="${irS[s.field]||''}"
        style="width:100%;padding:14px 14px 14px 38px;font-size:20px;font-weight:500;font-family:'Outfit',sans-serif;color:var(--text);background:var(--bg3);border:.5px solid var(--border2);border-radius:var(--rs);outline:none;-moz-appearance:textfield"
        oninput="irS['${s.field}']=this.value"/>
    </div>`;
  }
  el.innerHTML=`<div class="card">
    <div style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:6px;font-weight:600;letter-spacing:.05em">
        <span>Passo ${irCur+1} de ${irVis.length}</span><span>${pct}%</span>
      </div>
      <div style="height:2px;background:var(--border);border-radius:99px">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--gold),var(--gold-l));border-radius:99px;transition:width .4s"></div>
      </div>
    </div>
    <h2 style="font-size:20px;font-weight:600;margin-bottom:6px">${s.t}</h2>
    <p style="font-size:13px;color:var(--text2);margin-bottom:1.5rem;font-weight:300">${s.h}</p>
    ${body}
    <div style="display:flex;gap:10px;margin-top:2rem">
      ${irCur>0?`<button class="btn btn-ghost" onclick="irBk()">← Voltar</button>`:''}
      <button class="btn btn-gold" style="flex:1;justify-content:center" onclick="irNx()">
        ${irCur===irVis.length-1?'Ver resultado →':'Próximo →'}
      </button>
    </div>
  </div>`;
  if(s.type==='money'){ const i=document.getElementById('ir-inp'); if(i) setTimeout(()=>i.focus(),50); }
}
window.irSel=(id,k,el)=>{ irS[id]=k; el.closest('[style*="grid"]').querySelectorAll('button').forEach(b=>{b.style.background='var(--bg2)';b.style.border='.5px solid var(--border2)';}); el.style.background='var(--gold-dim2)'; el.style.border='1.5px solid var(--gold)'; };
window.irNx=()=>{ const s=irVis[irCur]; if(s.type==='opts'&&!irS[s.id]){toast('Selecione uma opção.','warn');return;} if(s.type==='money'&&irS[s.field]===undefined){toast('Informe o valor (pode ser 0).','warn');return;} if(irCur===irVis.length-1){irBld();irRes();return;} irCur++;irBld();irStep(document.getElementById('ca')); };
window.irBk=()=>{ if(irCur>0){irCur--;irBld();irStep(document.getElementById('ca'));} };

function irRes(){
  const fat=irPrs(irS.fat), desp=irPrs(irS.desp);
  const prol=irS.prol==='nao'?0:irPrs(irS.prolv);
  const out=irS.out==='nao'?0:irPrs(irS.outv);
  const deps=irS.dep==='3+'?3:parseInt(irS.dep||'0');
  const ded=irPrs(irS.ded), lucro=Math.max(0,fat-desp);

  const rend=prol+out;
  const dedD=deps*DEP_2026;
  const base=Math.max(0, rend-dedD-ded);

  let ir=0;
  for(const f of IR_TABELA_2026){
    if(base<=f.ate){ ir=Math.max(0, base*f.aliq-f.ded); break; }
  }

  const reg=irS.reg||'sim', tipo=irS.tipo||'mei';
  let pj=0;
  if(tipo!=='mei'){
    if(reg==='sim')  pj=fat*(fat<=180000?.04:fat<=360000?.073:.095);
    else if(reg==='lp') pj=fat*.32*.15;
    else if(reg==='lr') pj=lucro*.15;
  }

  // Isenção 2026: até R$5.000/mês de renda tributável → crédito fiscal (PLP 108/2024)
  const isento2026 = rend <= 5000*12;
  const obrig = rend>33919.80 || fat>200000 || out>0;

  pushIR({ ano:2025, r:{ir,pj,base,fat,lucro,rend}, em:new Date().toISOString() });

  const el=document.getElementById('ca');
  el.innerHTML=`
  <div class="card">
    <div class="card-header">
      <span class="card-title">Resultado — IR 2026 (ano-base 2025)</span>
      ${obrig?`<span class="badge bgold">obrigado a declarar</span>`:`<span class="badge bgreen">verifique com contador</span>`}
    </div>
    ${isento2026?`<div class="al ok" style="margin-bottom:1.25rem">🎉 Com renda até R$5.000/mês, você pode se enquadrar na isenção proposta para 2026 (PLP 108/2024 — sujeito a aprovação final). Consulte seu contador.</div>`:''}
    <div class="g4" style="margin-bottom:1.5rem">
      <div class="stat-card"><div class="stat-label">Faturamento</div><div class="stat-value gold">${irFmt(fat)}</div></div>
      <div class="stat-card"><div class="stat-label">Lucro apurado</div><div class="stat-value green">${irFmt(lucro)}</div></div>
      <div class="stat-card"><div class="stat-label">IR pessoa física</div><div class="stat-value ${ir>0?'red':''}">${irFmt(ir)}</div></div>
      <div class="stat-card"><div class="stat-label">Tributos PJ (est.)</div><div class="stat-value">${irFmt(pj)}</div></div>
    </div>
    <div class="al info" style="margin-bottom:8px">
      ${tipo==='mei'?'Como MEI, você é isento de IRPJ — mas declara IR pessoal normalmente. Não esqueça a DASN-SIMEI até 31/05/2026.':
        reg==='sim'?'No Simples Nacional, tributos PJ estão no DAS. IR pessoal incide sobre o pró-labore.':
        'No Lucro Real, distribuição de lucros ao sócio pode ser isenta — vantajoso quando o lucro efetivo é alto.'}
    </div>
    ${obrig
      ?`<div class="al warn">Você está obrigado a entregar a declaração em 2026. Prazo estimado: abril-maio/2026. Multa mínima por atraso: R$ 165,74.</div>`
      :`<div class="al ok">Com base nos dados, você pode não ser obrigado a declarar. Confirme com seu contador.</div>`}
  </div>

  <div class="card">
    <div class="card-title" style="margin-bottom:1rem">Detalhamento do cálculo — Tabela 2026</div>
    <div class="al info" style="margin-bottom:1rem;font-size:12px">
      Tabela progressiva 2026 (ano-base 2025): Isento até R$33.919,80 · 7,5% até R$45.012,60 · 15% até R$55.976,16 · 22,5% até R$70.000,00 · 27,5% acima.
    </div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:.5px solid var(--border);font-size:13px"><span style="color:var(--text2)">Pró-labore + outras rendas</span><span style="font-weight:600">${irFmt(rend)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:.5px solid var(--border);font-size:13px"><span style="color:var(--text2)">(−) Dedução dependentes (${deps} × R$2.275,08)</span><span style="font-weight:600">− ${irFmt(dedD)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:.5px solid var(--border);font-size:13px"><span style="color:var(--text2)">(−) Despesas pessoais dedutíveis</span><span style="font-weight:600">− ${irFmt(ded)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:.5px solid var(--border);font-size:13px;font-weight:600"><span>Base de cálculo</span><span>${irFmt(base)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:700"><span>IR estimado</span><span style="color:var(--gold)">${irFmt(ir)}</span></div>
  </div>

  <div style="display:flex;gap:10px">
    <button class="btn btn-ghost" onclick="go('ir')">← Refazer simulação</button>
    <button class="btn btn-ghost" onclick="go('hist')">Ver histórico →</button>
    <button class="btn btn-gold" onclick="go('simulador')">🧮 Simular impostos das notas →</button>
  </div>`;
}

/* ══ HISTÓRICO IR ══ */
function rHist(el,acts){
  acts.innerHTML=`<button class="btn btn-gold btn-sm" onclick="go('ir')">+ Nova simulação</button>`;
  const list=loadIR();
  el.innerHTML=`
  <div class="card">
    <div class="card-header"><span class="card-title">Histórico de simulações (${list.length})</span>
      ${list.length>0?`<button class="btn btn-danger btn-sm" onclick="limparHistIR()">Limpar tudo</button>`:''}
    </div>
    <div class="al info" style="margin-bottom:1rem">Use o histórico para auxiliar na sua declaração. Cada linha é uma simulação salva automaticamente.</div>
    ${list.length===0
      ?`<p style="font-size:13px;color:var(--text3)">Nenhuma simulação ainda. <a href="#" onclick="go('ir')" style="color:var(--gold)">Fazer uma agora</a></p>`
      :`<table class="data-tbl"><thead><tr><th>Data</th><th>Ano-base</th><th>Faturamento</th><th>Lucro</th><th>IR estimado</th></tr></thead>
        <tbody>${list.map(s=>`<tr><td style="color:var(--text3)">${fmtDate(s.em)}</td><td>${s.ano||2025}</td><td>${irFmt(s.r?.fat||0)}</td><td style="color:var(--green)">${irFmt(s.r?.lucro||0)}</td><td style="font-weight:600;color:var(--gold)">${irFmt(s.r?.ir||0)}</td></tr>`).join('')}</tbody>
      </table>`}
  </div>
  ${list.length>1?`<div class="card">
    <div class="card-title" style="margin-bottom:1rem">Resumo consolidado</div>
    <div class="g3">
      <div class="stat-card"><div class="stat-label">Simulações</div><div class="stat-value">${list.length}</div></div>
      <div class="stat-card"><div class="stat-label">Faturamento total</div><div class="stat-value gold">${irFmt(list.reduce((a,s)=>a+(s.r?.fat||0),0))}</div></div>
      <div class="stat-card"><div class="stat-label">IR total estimado</div><div class="stat-value red">${irFmt(list.reduce((a,s)=>a+(s.r?.ir||0),0))}</div></div>
    </div>
  </div>`:''}`;
}
window.limparHistIR=()=>{ if(!confirm('Limpar todo o histórico de IR?'))return; dbSet(SK.IR_SIMS,[]); toast('Histórico limpo.','ok'); go('hist'); };

/* ══ IMPORTAR DADOS (página) ══ */
function rImportar(el,acts){
  acts.innerHTML='';
  el.innerHTML=`
  <div class="card">
    <div class="card-header"><span class="card-title">📥 Importar CSV / Excel</span></div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:1.5rem">Importe um arquivo para preencher automaticamente os itens de uma nota fiscal.</p>

    <div class="sec-lbl">Formato esperado</div>
    <div class="al info" style="margin-bottom:1.5rem">
      O arquivo deve ter as colunas (em qualquer idioma):<br/>
      <code style="background:var(--bg3);padding:2px 8px;border-radius:4px;font-size:12px">descricao</code>
      <code style="background:var(--bg3);padding:2px 8px;border-radius:4px;font-size:12px">quantidade</code>
      <code style="background:var(--bg3);padding:2px 8px;border-radius:4px;font-size:12px">unidade</code>
      <code style="background:var(--bg3);padding:2px 8px;border-radius:4px;font-size:12px">valor_unitario</code><br/>
      <small style="opacity:.7">Variações aceitas: desc/item, qty/qtd, un/und, preco/price/valor</small>
    </div>

    <div class="upload-area" onclick="document.getElementById('imp-inp').click()" style="margin-bottom:1rem">
      <input type="file" id="imp-inp" accept=".csv,.xlsx,.xls" onchange="processarImportacao(this)"/>
      <div style="font-size:28px;margin-bottom:8px">📂</div>
      <p style="font-size:14px;color:var(--text2);font-weight:500">Clique para selecionar CSV ou Excel</p>
      <small style="font-size:12px;color:var(--text3)">.csv · .xlsx · .xls</small>
    </div>

    <div id="imp-result"></div>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-title">Baixar template CSV</span></div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:1rem">Baixe um modelo pronto para preencher e importar.</p>
    <button class="btn btn-ghost" onclick="downloadTemplate()">⬇ Baixar template.csv</button>
  </div>`;
}

window.downloadTemplate=()=>{
  const csv='descricao,quantidade,unidade,valor_unitario\nDesenvolvimento de site,1,serviço,3500.00\nManutenção mensal,3,mês,800.00\nConsultoria,2,hora,250.00';
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='template_itens.csv'; a.click();
  toast('Template baixado!','ok');
};

window.processarImportacao=(inp)=>{
  const f=inp.files[0]; if(!f)return;
  const ext=f.name.split('.').pop().toLowerCase();
  const res=document.getElementById('imp-result');
  res.innerHTML=`<p style="font-size:13px;color:var(--text3);padding:1rem">Processando...</p>`;

  if(ext==='csv'){
    const r=new FileReader();
    r.onload=e=>{ mostrarResultadoImportacao(parseCSV(e.target.result), res); };
    r.readAsText(f,'UTF-8');
  } else {
    const r=new FileReader();
    r.onload=e=>{
      try{
        const wb=XLSX.read(e.target.result,{type:'binary'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
        mostrarResultadoImportacao(rows, res);
      }catch(err){ res.innerHTML=`<div class="al err">Erro ao ler arquivo: ${esc(err.message)}</div>`; }
    };
    r.readAsBinaryString(f);
  }
};

function mostrarResultadoImportacao(rows, res){
  if(!rows||!rows.length){ res.innerHTML=`<div class="al err">Nenhum dado encontrado. Verifique o formato do arquivo.</div>`; return; }
  const itens=rows.map(r=>({
    desc:  normalizeKey(r,['descricao','descrição','desc','description','item','produto','servico','serviço','nome'])||'',
    qty:   parseFloat(normalizeKey(r,['quantidade','qty','qtd','qtde','quantity','qntd']))||1,
    unit:  normalizeKey(r,['unidade','unit','und','un'])||'un',
    price: parseFloat(normalizeKey(r,['valorunitario','valor_unitario','preco','preço','price','valor','vl_unit','vlr']))||0,
    total: 0,
  })).map(it=>({...it,total:+(it.qty*it.price).toFixed(2)})).filter(it=>it.desc);

  if(!itens.length){ res.innerHTML=`<div class="al err">Nenhum item com descrição encontrado. Verifique o cabeçalho do arquivo.</div>`; return; }

  const subtotal=itens.reduce((a,it)=>a+it.total,0);
  res.innerHTML=`
  <div class="al ok" style="margin-bottom:1rem">${itens.length} item(s) importado(s). Subtotal: <strong>${fmt(subtotal)}</strong></div>
  <div style="overflow-x:auto;max-height:300px;overflow-y:auto;margin-bottom:1rem">
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr>${['Descrição','Qtd','Un.','Valor unit.','Total'].map(h=>`<th style="padding:7px 10px;border-bottom:.5px solid var(--border2);text-align:left;color:var(--text3);font-size:10px;text-transform:uppercase;font-weight:700">${h}</th>`).join('')}</tr></thead>
      <tbody>${itens.map(it=>`<tr><td style="padding:8px 10px;border-bottom:.5px solid var(--border)">${esc(it.desc)}</td><td style="padding:8px 10px;border-bottom:.5px solid var(--border)">${it.qty}</td><td style="padding:8px 10px;border-bottom:.5px solid var(--border);color:var(--text3)">${esc(it.unit)}</td><td style="padding:8px 10px;border-bottom:.5px solid var(--border);text-align:right">${fmt(it.price)}</td><td style="padding:8px 10px;border-bottom:.5px solid var(--border);text-align:right;font-weight:600;color:var(--gold)">${fmt(it.total)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <button class="btn btn-gold" onclick="usarItensImportados(${JSON.stringify(itens).replace(/"/g,"'")})">Criar nova nota com estes itens →</button>`;
  window._itensImportados=itens;
  res.querySelector('.btn-gold').onclick=()=>{ nfReset(); nfItems=itens; go('nf-form'); toast(`${itens.length} item(s) carregado(s) na nova nota!`,'ok'); };
}

/* ══ INIT ══ */
renderApp();
