/* ══ APP SHELL ══ */
let pg = 'dashboard';

function renderApp(){
  document.getElementById('root').innerHTML=`
  <div class="shell">
    <nav class="sidebar">
      <div class="sidebar-logo"><div class="s-logo-txt">IR Empreendedor</div><div class="s-logo-sub">& Notas Fiscais</div></div>
      <div class="nav-section">Menu</div>
      <button class="nav-item" data-p="dashboard"  onclick="go('dashboard')"><span class="ni">📊</span>Painel</button>
      <button class="nav-item" data-p="notas"      onclick="go('notas')"><span class="ni">🧾</span>Notas Fiscais</button>
      <button class="nav-item" data-p="layout"     onclick="go('layout')"><span class="ni">🎨</span>Editor de Layout</button>
      <div class="nav-section">Tributário</div>
      <button class="nav-item" data-p="simulador"  onclick="go('simulador')"><span class="ni">🧮</span>Simulador Fiscal</button>
      <button class="nav-item" data-p="ir"         onclick="go('ir')"><span class="ni">📋</span>IR 2026</button>
      <button class="nav-item" data-p="hist"       onclick="go('hist')"><span class="ni">🕐</span>Histórico IR</button>
      <div class="nav-section">Dados</div>
      <button class="nav-item" data-p="importar"   onclick="go('importar')"><span class="ni">📥</span>Importar CSV/Excel</button>
      <div class="sidebar-bottom">
        <div class="user-pill">
          <div class="avatar">💾</div>
          <div><div style="font-size:13px;font-weight:500">Dados locais</div><div style="font-size:11px;color:var(--text3)" id="nota-count">—</div></div>
        </div>
      </div>
    </nav>
    <div class="main-area">
      <div class="topbar"><span class="page-title" id="pt">Painel</span><div id="ta" style="display:flex;gap:8px;align-items:center"></div></div>
      <div class="content" id="ca"></div>
    </div>
  </div>`;
  atualizarContador();
  go('dashboard');
}

function atualizarContador(){
  const el=document.getElementById('nota-count');
  if(el){ const n=loadNotas().length; el.textContent=`${n} nota${n!==1?'s':''} salva${n!==1?'s':''}`; }
}

function go(page, params={}){
  pg=page;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',
    el.dataset.p===page||(page==='nf-form'&&el.dataset.p==='notas')));
  const el=document.getElementById('ca'), title=document.getElementById('pt'), acts=document.getElementById('ta');
  acts.innerHTML=''; el.innerHTML='';
  const pages={
    'dashboard': ()=>{ title.textContent='Painel';          rDash(el,acts); },
    'notas':     ()=>{ title.textContent='Notas Fiscais';   rNotas(el,acts); },
    'nf-form':   ()=>{ title.textContent=nfId?'Editar Nota':'Nova Nota'; rNFForm(el,acts,params); },
    'layout':    ()=>{ title.textContent='Editor de Layout';rLayout(el,acts); },
    'simulador': ()=>{ title.textContent='Simulador Fiscal';rSimulador(el,acts); },
    'ir':        ()=>{ title.textContent='Simulação IR 2026';rIR(el,acts); },
    'hist':      ()=>{ title.textContent='Histórico IR';    rHist(el,acts); },
    'importar':  ()=>{ title.textContent='Importar Dados';  rImportar(el,acts); },
  };
  (pages[page]||function(){})();
}
window.go=go;

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
function rDash(el,acts){
  acts.innerHTML=`<button class="btn btn-gold btn-sm" onclick="novaNotaFresh()">+ Nova Nota</button>`;
  const notas=loadNotas(), ir=loadIR();
  const total=notas.reduce((a,n)=>a+(n.total||0),0);
  const pagas=notas.filter(n=>n.status==='paga').reduce((a,n)=>a+(n.total||0),0);
  const pend=notas.filter(n=>n.status==='pendente').length;

  el.innerHTML=`
  <div class="g4" style="margin-bottom:1.5rem">
    <div class="stat-card"><div class="stat-label">Total emitido</div><div class="stat-value gold">${fmt(total)}</div></div>
    <div class="stat-card"><div class="stat-label">Total recebido</div><div class="stat-value green">${fmt(pagas)}</div></div>
    <div class="stat-card"><div class="stat-label">Pendentes</div><div class="stat-value ${pend>0?'red':''}">${pend}</div></div>
    <div class="stat-card"><div class="stat-label">Simulações IR</div><div class="stat-value">${ir.length}</div></div>
  </div>
  <div class="g2">
    <div class="card">
      <div class="card-header"><span class="card-title">Últimas notas</span><button class="btn btn-ghost btn-sm" onclick="go('notas')">Ver todas</button></div>
      ${notas.length===0
        ?`<p style="font-size:13px;color:var(--text3)">Nenhuma nota ainda. <a href="#" onclick="novaNotaFresh()" style="color:var(--gold)">Criar a primeira</a></p>`
        :`<table class="data-tbl"><thead><tr><th>Cliente</th><th>Tipo</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>${notas.slice(0,5).map(n=>`<tr onclick="editarNota('${n.id}')">
            <td>${esc(n.cnom||'—')}</td>
            <td><span class="badge bg">${esc(n.tipo||'')}</span></td>
            <td style="font-weight:600;color:var(--gold)">${fmt(n.total||0,n.moeda)}</td>
            <td><span class="badge ${statusBadge(n.status)}">${n.status||'emitida'}</span></td>
          </tr>`).join('')}</tbody></table>`}
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Simulações IR</span><button class="btn btn-ghost btn-sm" onclick="go('hist')">Histórico</button></div>
      ${ir.length===0
        ?`<p style="font-size:13px;color:var(--text3)">Nenhuma simulação ainda.</p>`
        :ir.slice(0,5).map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:.5px solid var(--border);font-size:13px">
            <div><div style="font-weight:500">Ano-base ${s.ano||2025}</div><div style="color:var(--text3);font-size:11px">${fmtDate(s.em)}</div></div>
            <div style="color:var(--gold);font-weight:600">${irFmt(s.r?.ir||0)}</div>
          </div>`).join('')}
    </div>
  </div>`;
}

window.novaNotaFresh=()=>{ nfReset(); go('nf-form'); };
window.editarNota=(id)=>{
  const n=getNota(id);
  if(!n){ toast('Nota não encontrada.','err'); return; }
  nfId=id;
  nfModel={...n.dados, tipo:n.tipo, moeda:n.moeda, numero:n.numero};
  nfItems=JSON.parse(JSON.stringify(n.itens||[]));
  nfLogo=n.dados?.logo||null;
  nfImages=JSON.parse(JSON.stringify(n.imagens||[]));
  go('nf-form',{edit:true});
};

/* ══════════════════════════════════════════
   LISTA DE NOTAS
══════════════════════════════════════════ */
function rNotas(el,acts){
  acts.innerHTML=`<button class="btn btn-gold btn-sm" onclick="novaNotaFresh()">+ Nova Nota</button>`;
  const notas=loadNotas();
  el.innerHTML=`<div class="card">
    <div class="card-header">
      <span class="card-title">Notas salvas (${notas.length})</span>
      <input type="text" id="busca-nota" placeholder="Buscar por cliente ou número…"
        style="padding:7px 12px;font-size:13px;background:var(--bg3);border:.5px solid var(--border2);border-radius:var(--rs);color:var(--text);outline:none;width:220px"
        oninput="filtrarNotas(this.value)"/>
    </div>
    ${notas.length===0
      ?`<p style="font-size:13px;color:var(--text3)">Nenhuma nota encontrada. <a href="#" onclick="novaNotaFresh()" style="color:var(--gold)">Criar</a></p>`
      :`<div style="overflow-x:auto"><table class="data-tbl" id="notas-tbl">
        <thead><tr><th>Nº</th><th>Cliente</th><th>Tipo</th><th>Emissão</th><th>Total</th><th>Status</th><th style="width:140px"></th></tr></thead>
        <tbody id="notas-body">${notas.map(n=>notaRow(n)).join('')}</tbody>
      </table></div>`}
  </div>`;
}

function notaRow(n){
  return `<tr id="row-${n.id}" onclick="editarNota('${n.id}')">
    <td style="color:var(--text3)">#${esc(n.numero||'—')}</td>
    <td>${esc(n.cnom||'—')}</td>
    <td><span class="badge bg">${esc(n.tipo||'')}</span></td>
    <td style="color:var(--text3)">${fmtDate(n.emitidaEm||n.em)}</td>
    <td style="font-weight:600;color:var(--gold)">${fmt(n.total||0,n.moeda)}</td>
    <td><span class="badge ${statusBadge(n.status)}">${n.status||'emitida'}</span></td>
    <td onclick="event.stopPropagation()" style="white-space:nowrap;display:flex;gap:4px;align-items:center">
      <button class="btn btn-ghost btn-sm" title="Gerar PDF" onclick="event.stopPropagation();imprimirId('${n.id}')">🖨</button>
      <select class="btn btn-ghost btn-sm" style="padding:5px 8px;cursor:pointer"
        onchange="mudarStatus('${n.id}',this.value)" onclick="event.stopPropagation()">
        <option value="">Status…</option>
        <option value="emitida">Emitida</option>
        <option value="paga">Paga</option>
        <option value="pendente">Pendente</option>
        <option value="cancelada">Cancelada</option>
      </select>
      <button class="btn btn-danger btn-sm" title="Excluir" onclick="event.stopPropagation();confirmarExcluir('${n.id}')">🗑</button>
    </td>
  </tr>`;
}

window.filtrarNotas=(q)=>{
  const tbody=document.getElementById('notas-body'); if(!tbody)return;
  const notas=loadNotas();
  const filtradas=q?notas.filter(n=>(n.cnom||'').toLowerCase().includes(q.toLowerCase())||(n.numero||'').includes(q)):notas;
  tbody.innerHTML=filtradas.map(n=>notaRow(n)).join('');
};

window.mudarStatus=(id,s)=>{
  if(!s)return;
  const n=getNota(id); if(!n)return;
  n.status=s; upsertNota(n);
  toast('Status atualizado!','ok');
  atualizarContador();
  const row=document.getElementById('row-'+id);
  if(row){ const badge=row.querySelector('.badge:last-of-type'); if(badge){badge.className=`badge ${statusBadge(s)}`;badge.textContent=s;} }
};

window.confirmarExcluir=(id)=>{
  openModal(`<div class="modal-header"><span class="modal-title">Excluir nota?</span><button class="modal-x" onclick="closeModal()">×</button></div>
    <p style="font-size:14px;color:var(--text2);margin-bottom:1.5rem">Esta ação não pode ser desfeita.</p>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-danger" onclick="excluirNota('${id}')">Excluir</button>
    </div>`);
};
window.excluirNota=(id)=>{ deleteNota(id); closeModal(); toast('Nota excluída.','ok'); atualizarContador(); go('notas'); };
window.imprimirId=(id)=>{
  const n=getNota(id); if(!n){toast('Nota não encontrada.','err');return;}
  nfId=id; nfModel={...n.dados,tipo:n.tipo,moeda:n.moeda,numero:n.numero};
  nfItems=JSON.parse(JSON.stringify(n.itens||[]));
  nfLogo=n.dados?.logo||null; nfImages=JSON.parse(JSON.stringify(n.imagens||[]));
  abrirPDF();
};

/* ══════════════════════════════════════════
   FORMULÁRIO NOTA FISCAL
══════════════════════════════════════════ */
function rNFForm(el,acts,params={}){
  const m=nfModel||{};
  acts.innerHTML=`
    <button class="btn btn-ghost btn-sm" onclick="go('notas')">← Voltar</button>
    <button class="btn btn-sm" onclick="salvar(false)">💾 Salvar</button>
    <button class="btn btn-sm" onclick="abrirSimuladorModal()">🧮 Simular imposto</button>
    <button class="btn btn-gold btn-sm" onclick="salvar(true)">⬇ Salvar & PDF</button>`;

  const tipoOpts=[
    {k:'nfse', l:'NFS-e — Nota Fiscal de Serviço'},
    {k:'nfe',  l:'NF-e — Nota Fiscal de Produto'},
    {k:'fatura',l:'Fatura Comercial'},
    {k:'recibo',l:'Recibo de Pagamento'},
    {k:'orcamento',l:'Orçamento / Proposta'},
  ].map(t=>`<option value="${t.k}" ${(m.tipo||'nfse')===t.k?'selected':''}>${t.l}</option>`).join('');
  const moedaOpts=['BRL','USD','EUR'].map(c=>`<option ${(m.moeda||'BRL')===c?'selected':''}>${c}</option>`).join('');

  const logoArea=nfLogo
    ?`<div class="upload-area" style="display:flex;align-items:center;gap:10px;cursor:default;padding:10px 14px">
        <img src="${esc(nfLogo)}" style="height:42px;border-radius:5px"/>
        <button class="btn btn-danger btn-sm" onclick="nfLogo=null;rr()">Remover logo</button>
      </div>`
    :`<div class="upload-area" onclick="document.getElementById('logo-inp').click()">
        <input type="file" id="logo-inp" accept="image/*" onchange="hdLogo(this)"/>
        <div style="font-size:20px;margin-bottom:6px">🖼️</div>
        <p style="font-size:13px;color:var(--text2)">Upload do logotipo</p>
        <small style="font-size:11px;color:var(--text3)">PNG, JPG ou SVG</small>
      </div>`;

  const {sub,desc,tax,total}=nfTotals();
  const rows=nfItems.map((it,i)=>`<tr>
    <td><input value="${esc(it.desc||'')}" placeholder="Descrição do item/serviço" oninput="ic(${i},'desc',this.value)" style="min-width:150px"/></td>
    <td style="width:60px"><input type="number" class="r" value="${it.qty||1}" min="0.01" step="any" oninput="ic(${i},'qty',this.value)"/></td>
    <td style="width:60px"><input value="${esc(it.unit||'un')}" placeholder="un" oninput="ic(${i},'unit',this.value)"/></td>
    <td style="width:105px"><input type="number" class="r" value="${it.price||''}" placeholder="0,00" step="0.01" min="0" oninput="ic(${i},'price',this.value)"/></td>
    <td class="td-tot" id="it${i}">${fmt(it.total||0,m.moeda||'BRL')}</td>
    <td style="width:26px"><button class="rm-btn" onclick="rm(${i})">×</button></td>
  </tr>`).join('');

  el.innerHTML=`
  <div class="card">
    <div class="sec-lbl">Documento</div>
    <div class="g2">
      <div class="field"><label>Tipo</label><select onchange="fc('tipo',this.value)">${tipoOpts}</select></div>
      <div class="field"><label>Número</label><input value="${esc(m.numero||'')}" placeholder="001" oninput="fc('numero',this.value)"/></div>
    </div>
    <div class="g3">
      <div class="field"><label>Emissão</label><input type="date" value="${esc(m.data||nowDate())}" oninput="fc('data',this.value)"/></div>
      <div class="field"><label>Vencimento</label><input type="date" value="${esc(m.venc||'')}" oninput="fc('venc',this.value)"/></div>
      <div class="field"><label>Moeda</label><select onchange="fc('moeda',this.value)">${moedaOpts}</select></div>
    </div>
  </div>

  <div class="card">
    <div class="sec-lbl">Emitente <span style="font-size:10px;color:var(--text3);font-weight:400;text-transform:none;letter-spacing:0">— <a href="#" onclick="salvarEmitente()" style="color:var(--gold)">Salvar como padrão</a></span></div>
    <div style="display:grid;grid-template-columns:170px 1fr;gap:1.25rem;margin-bottom:.5rem">
      <div>${logoArea}</div>
      <div>
        <div class="field"><label>Razão Social / Nome</label><input value="${esc(m.nome||'')}" placeholder="Minha Empresa Ltda." oninput="fc('nome',this.value)"/></div>
        <div class="g2">
          <div class="field"><label>CNPJ / CPF</label><input value="${esc(m.cnpj||'')}" placeholder="00.000.000/0001-00" oninput="fc('cnpj',this.value)"/></div>
          <div class="field"><label>Telefone</label><input value="${esc(m.tel||'')}" placeholder="(81) 99999-9999" oninput="fc('tel',this.value)"/></div>
        </div>
        <div class="field"><label>Endereço</label><input value="${esc(m.end||'')}" placeholder="Rua Exemplo, 123 — Recife, PE" oninput="fc('end',this.value)"/></div>
        <div class="field"><label>E-mail</label><input value="${esc(m.email||'')}" placeholder="contato@empresa.com.br" oninput="fc('email',this.value)"/></div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="sec-lbl">Cliente</div>
    <div class="g2">
      <div class="field"><label>Nome / Razão Social</label><input value="${esc(m.cnom||'')}" placeholder="Cliente S.A." oninput="fc('cnom',this.value)"/></div>
      <div class="field"><label>CNPJ / CPF</label><input value="${esc(m.ccnpj||'')}" placeholder="00.000.000/0001-00" oninput="fc('ccnpj',this.value)"/></div>
    </div>
    <div class="g2">
      <div class="field"><label>Endereço</label><input value="${esc(m.cend||'')}" placeholder="Rua do Cliente, 456 — Cidade, UF" oninput="fc('cend',this.value)"/></div>
      <div class="field"><label>E-mail</label><input value="${esc(m.cemail||'')}" placeholder="cliente@empresa.com.br" oninput="fc('cemail',this.value)"/></div>
    </div>
  </div>

  <div class="card">
    <div class="sec-lbl" style="justify-content:space-between;align-items:center">
      <span style="display:flex;align-items:center;gap:10px">Itens / Serviços<span style="display:flex;width:100%;height:.5px;background:var(--border)"></span></span>
      <button class="btn btn-ghost btn-sm" onclick="abrirImportarItens()" style="white-space:nowrap;margin-left:8px">📥 Importar itens</button>
    </div>
    <div style="overflow-x:auto">
      <table class="it-tbl">
        <thead><tr>
          <th>Descrição</th>
          <th style="width:60px">Qtd</th>
          <th style="width:60px">Unid.</th>
          <th class="r" style="width:105px">Valor unit.</th>
          <th class="r" style="width:95px">Total</th>
          <th style="width:26px"></th>
        </tr></thead>
        <tbody id="it-body">${rows}</tbody>
      </table>
    </div>
    <button class="add-row" onclick="addIt()">
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
      Adicionar linha
    </button>
    <div class="tots-wrap"><div class="tots-box">
      <div class="tot-row"><span>Subtotal</span><span class="tv" id="sb">${fmt(sub,m.moeda||'BRL')}</span></div>
      <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="field" style="margin:0"><label>Desconto</label><input type="number" value="${m.desconto||0}" min="0" step="0.01" oninput="fc('desconto',this.value);upT()"/></div>
        <div class="field" style="margin:0"><label>Impostos / Taxas</label><input type="number" value="${m.impostos||0}" min="0" step="0.01" oninput="fc('impostos',this.value);upT()"/></div>
      </div>
      <div class="tot-grand"><span>Total</span><span class="tv" id="tv">${fmt(total,m.moeda||'BRL')}</span></div>
    </div></div>
  </div>

  <div class="card">
    <div class="sec-lbl">Observações</div>
    <div class="field"><label>Condições de pagamento ou instruções</label>
      <textarea placeholder="Ex: PIX — chave: cnpj@empresa.com.br" oninput="fc('obs',this.value)">${esc(m.obs||'')}</textarea></div>
  </div>

  <div class="card">
    <div class="sec-lbl">Fotos de produtos / serviços entregues</div>
    <div class="upload-area" onclick="document.getElementById('img-inp').click()">
      <input type="file" id="img-inp" accept="image/*" multiple onchange="hdImgs(this)"/>
      <div style="font-size:20px;margin-bottom:6px">📷</div>
      <p style="font-size:13px;color:var(--text2)">Clique para adicionar fotos</p>
      <small style="font-size:11px;color:var(--text3)">PNG, JPG ou WEBP • máx 5MB cada</small>
    </div>
    <div class="img-gallery" id="ig">${nfImages.map((u,i)=>itImg(u,i)).join('')}</div>
  </div>`;
}

const itImg=(u,i)=>`<div class="img-thumb"><img src="${esc(u)}"/><button class="img-rm" onclick="rmImg(${i})">×</button></div>`;
window.rr=()=>rNFForm(document.getElementById('ca'),document.getElementById('ta'),{edit:!!nfId});
window.fc=(k,v)=>{ nfModel[k]=v; };
window.ic=(i,k,v)=>{
  nfItems[i][k]=v;
  const q=parseFloat(nfItems[i].qty)||1, p=parseFloat(nfItems[i].price)||0;
  nfItems[i].total=+(q*p).toFixed(2);
  const td=document.getElementById('it'+i);
  if(td) td.textContent=fmt(nfItems[i].total, nfModel?.moeda||'BRL');
  upT();
};
window.rm=(i)=>{ if(nfItems.length===1){toast('Precisa de ao menos um item.','warn');return;} nfItems.splice(i,1); rr(); };
window.addIt=()=>{ nfItems.push({desc:'',qty:1,unit:'un',price:'',total:0}); rr(); setTimeout(()=>{ const r=document.querySelectorAll('#it-body tr'); if(r.length) r[r.length-1].querySelector('input').focus(); },50); };
window.upT=()=>{ const{sub,total}=nfTotals(); const s=document.getElementById('sb'); if(s)s.textContent=fmt(sub,nfModel?.moeda||'BRL'); const t=document.getElementById('tv'); if(t)t.textContent=fmt(total,nfModel?.moeda||'BRL'); };
window.hdLogo=(inp)=>{ const f=inp.files[0]; if(!f)return; const r=new FileReader(); r.onload=e=>{nfLogo=e.target.result;rr();}; r.readAsDataURL(f); };
window.hdImgs=(inp)=>{ Array.from(inp.files).forEach(f=>{ if(f.size>5*1024*1024){toast('Imagem muito grande (máx 5MB)','warn');return;} const r=new FileReader(); r.onload=e=>{nfImages.push(e.target.result);const g=document.getElementById('ig');if(g)g.innerHTML=nfImages.map((u,j)=>itImg(u,j)).join('');}; r.readAsDataURL(f); }); };
window.rmImg=(i)=>{ nfImages.splice(i,1); const g=document.getElementById('ig'); if(g)g.innerHTML=nfImages.map((u,j)=>itImg(u,j)).join(''); };
window.salvarEmitente=()=>{ saveEmitente({nome:nfModel.nome,cnpj:nfModel.cnpj,tel:nfModel.tel,end:nfModel.end,email:nfModel.email,logo:nfLogo}); toast('Dados do emitente salvos como padrão!','ok'); };

function buildPayload(){
  const{total}=nfTotals();
  return {
    id:       nfId || newId(),
    tipo:     nfModel.tipo||'nfse',
    numero:   nfModel.numero||'',
    cnom:     nfModel.cnom||'',
    total,
    moeda:    nfModel.moeda||'BRL',
    dados:    {...nfModel, logo:nfLogo},
    itens:    JSON.parse(JSON.stringify(nfItems)),
    imagens:  JSON.parse(JSON.stringify(nfImages)),
    status:   'emitida',
    emitidaEm:nfModel.data||nowDate(),
    em:       new Date().toISOString(),
  };
}

window.salvar=(pdf=false)=>{
  const nota=buildPayload();
  nfId=nota.id;
  const ok=upsertNota(nota);
  atualizarContador();
  if(ok!==false){
    toast('✅ Nota salva com sucesso!','ok');
    if(pdf) setTimeout(()=>abrirPDF(),300);
  }
};

/* ══ SIMULADOR DE IMPOSTO (modal antes de emitir) ══ */
window.abrirSimuladorModal=()=>{
  const{total}=nfTotals();
  if(total<=0){toast('Adicione itens com valor antes de simular.','warn');return;}
  const sim=calcSimulacao(total,nfModel.tipo||'nfse');
  let html=`<div class="modal-header"><span class="modal-title">🧮 Simulação de impostos</span><button class="modal-x" onclick="closeModal()">×</button></div>
  <p style="font-size:13px;color:var(--text2);margin-bottom:1.25rem">Valor da nota: <strong style="color:var(--gold)">${fmt(total)}</strong> — estimativa baseada nos regimes tributários mais comuns.</p>`;

  sim.forEach((op,i)=>{
    const cls=i===0?'best':(i===sim.length-1?'worst':'');
    html+=`<div class="sim-option ${cls}">
      <div class="sim-header">
        <div>
          <div class="sim-name">${op.nome} ${i===0?'<span class="badge bgreen" style="font-size:10px">Melhor opção</span>':''}</div>
          <div class="sim-detail">${op.descricao}</div>
        </div>
        <div class="sim-valor ${i===0?'ok':''}">${fmt(op.imposto)}</div>
      </div>
      <div style="margin-top:8px;font-size:12px;color:var(--text3)">
        Alíquota efetiva: <strong>${op.aliq}%</strong> · Líquido: <strong>${fmt(total-op.imposto)}</strong>
      </div>
    </div>`;
  });

  html+=`<div class="al info" style="margin-top:1rem">Esta é uma estimativa simplificada. Consulte seu contador para o cálculo exato do seu regime.</div>
  <div style="display:flex;gap:10px;margin-top:1.25rem;justify-content:flex-end">
    <button class="btn btn-ghost" onclick="closeModal()">Fechar</button>
    <button class="btn btn-gold" onclick="closeModal();salvar(true)">Emitir & PDF →</button>
  </div>`;
  openModal(html);
};

function calcSimulacao(total, tipo){
  const isServico=tipo==='nfse'||tipo==='fatura'||tipo==='recibo'||tipo==='orcamento';
  const opcoes=[];
  if(isServico){
    opcoes.push({nome:'MEI',       descricao:'DAS fixo mensal (estimado anual ÷ notas)', imposto:+(total*0.06).toFixed(2), aliq:6});
    opcoes.push({nome:'Simples Nacional (Serviços)', descricao:'Anexo III — faixa inicial', imposto:+(total*0.06).toFixed(2), aliq:6});
    opcoes.push({nome:'Lucro Presumido',             descricao:'ISS + PIS + COFINS + IRPJ + CSLL', imposto:+(total*0.1325).toFixed(2), aliq:13.25});
    opcoes.push({nome:'Lucro Real',                  descricao:'Tributação sobre lucro efetivo', imposto:+(total*0.15).toFixed(2), aliq:15});
    opcoes.push({nome:'Autônomo (CARNÊ-LEÃO)',        descricao:'IRPF direto + ISS', imposto:+(total*0.275).toFixed(2), aliq:27.5});
  } else {
    opcoes.push({nome:'Simples Nacional (Comércio)',  descricao:'Anexo I — faixa inicial', imposto:+(total*0.04).toFixed(2), aliq:4});
    opcoes.push({nome:'Simples Nacional (Indústria)', descricao:'Anexo II — faixa inicial', imposto:+(total*0.045).toFixed(2), aliq:4.5});
    opcoes.push({nome:'Lucro Presumido',              descricao:'ICMS + PIS + COFINS + IRPJ + CSLL', imposto:+(total*0.105).toFixed(2), aliq:10.5});
    opcoes.push({nome:'Lucro Real',                   descricao:'Tributação sobre lucro efetivo', imposto:+(total*0.15).toFixed(2), aliq:15});
  }
  return opcoes.sort((a,b)=>a.imposto-b.imposto);
}

