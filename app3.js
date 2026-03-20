/* ══ PDF ══ */
function abrirPDF(){
  const th=activeTheme, m=nfModel||{}, moeda=m.moeda||'BRL';
  const{sub,desc,tax,total}=nfTotals();
  const tipo=tipoInfo(m.tipo||'nfse');
  const vm={}; layoutBlocks.forEach(b=>{vm[b.id]=b.visible;});
  const order=layoutBlocks.map(b=>b.id);
  const fd=d=>{if(!d)return'—';const s=(d.split('T')[0]).split('-');return`${s[2]}/${s[1]}/${s[0]}`;};

  const iRows=nfItems.map(it=>`<tr>
    <td style="padding:11px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">${esc(it.desc||'—')}</td>
    <td style="padding:11px 12px;font-size:13px;text-align:center;color:#374151;border-bottom:1px solid #f3f4f6">${it.qty||1}</td>
    <td style="padding:11px 12px;font-size:13px;text-align:center;color:#9ca3af;border-bottom:1px solid #f3f4f6">${esc(it.unit||'')}</td>
    <td style="padding:11px 12px;font-size:13px;text-align:right;color:#374151;border-bottom:1px solid #f3f4f6">${fmt(parseFloat(it.price)||0,moeda)}</td>
    <td style="padding:11px 12px;font-size:13px;text-align:right;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6">${fmt(it.total||0,moeda)}</td>
  </tr>`).join('');

  const blks={
    logo:vm.logo?`<div style="padding-bottom:1.5rem;border-bottom:1.5px solid #f3f4f6;margin-bottom:1.5rem"><div style="font-size:21px;font-weight:700;color:${th.text};margin-bottom:2px">${esc(m.nome||'Emitente')}</div>${m.end?`<div style="font-size:12px;color:${th.textMuted}">${esc(m.end)}</div>`:''}<div style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-top:5px">${tipo.full}</div></div>`:'',
    cliente:vm.cliente&&(m.cnom||m.ccnpj)?`<div style="margin-bottom:1.5rem"><div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:5px">Faturado para</div><div style="font-size:14px;font-weight:600;color:${th.text};margin-bottom:2px">${esc(m.cnom||'')}</div>${m.ccnpj?`<div style="font-size:12px;color:${th.textMuted}">CNPJ/CPF: ${esc(m.ccnpj)}</div>`:''}${m.cend?`<div style="font-size:12px;color:${th.textMuted}">${esc(m.cend)}</div>`:''}${m.cemail?`<div style="font-size:12px;color:${th.textMuted}">${esc(m.cemail)}</div>`:''}</div>`:'',
    itens:vm.itens?`<table style="width:100%;border-collapse:collapse;margin-bottom:1.25rem"><thead style="background:#f9fafb"><tr><th style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:left;border-bottom:1.5px solid #e5e7eb">Descrição</th><th style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:center;border-bottom:1.5px solid #e5e7eb;width:55px">Qtd</th><th style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:center;border-bottom:1.5px solid #e5e7eb;width:55px">Un.</th><th style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:right;border-bottom:1.5px solid #e5e7eb;width:100px">Unit.</th><th style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:9px 12px;text-align:right;border-bottom:1.5px solid #e5e7eb;width:100px">Total</th></tr></thead><tbody>${iRows}</tbody></table>`:'',
    totais:vm.totais?`<div style="display:flex;justify-content:flex-end;margin-bottom:1.25rem"><div style="min-width:220px;background:#f9fafb;border-radius:8px;padding:1rem 1.25rem"><div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;padding:3px 0"><span>Subtotal</span><span style="font-weight:500;color:#374151">${fmt(sub,moeda)}</span></div>${desc>0?`<div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;padding:3px 0"><span>Desconto</span><span style="font-weight:500">− ${fmt(desc,moeda)}</span></div>`:''}${tax>0?`<div style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;padding:3px 0"><span>Impostos/Taxas</span><span style="font-weight:500">${fmt(tax,moeda)}</span></div>`:''}<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#111827;border-top:1.5px solid #e5e7eb;padding-top:10px;margin-top:6px"><span>Total</span><span>${fmt(total,moeda)}</span></div></div></div>`:'',
    obs:vm.obs&&m.obs?`<div style="background:#f9fafb;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1rem"><div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:5px">Observações</div><div style="font-size:12px;color:#6b7280;line-height:1.75">${esc(m.obs)}</div></div>`:'',
    fotos:vm.fotos&&nfImages.length>0?`<div><div style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.14em;margin-bottom:8px">Fotos do serviço</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">${nfImages.map(u=>`<div style="border-radius:6px;overflow:hidden;aspect-ratio:4/3"><img src="${esc(u)}" style="width:100%;height:100%;object-fit:cover"/></div>`).join('')}</div></div>`:'',
  };

  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Nota ${esc(m.numero||'Fiscal')}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'${th.font}',sans-serif;background:#e5e7eb;display:flex;justify-content:center;padding:2rem 1rem;min-height:100vh}.wrap{background:#fff;max-width:820px;width:100%;border-radius:14px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.18)}.accent{height:4px;background:linear-gradient(90deg,${th.sidebar},${th.accent},${th.accentL},${th.accent},${th.sidebar})}.layout{display:flex;min-height:560px}.side{width:200px;flex-shrink:0;background:${th.sidebar};padding:1.75rem 1.5rem;display:flex;flex-direction:column;-webkit-print-color-adjust:exact;print-color-adjust:exact}.main{flex:1;padding:2rem 1.75rem;background:${th.bodyBg}}.actions{margin-bottom:1.5rem;display:flex;gap:10px;justify-content:flex-end}.btn-pdf{padding:9px 20px;background:linear-gradient(135deg,${th.accent},${th.accentL});color:#111;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit}.btn-close{padding:9px 16px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-family:inherit}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{background:#fff!important;padding:0!important}.wrap{border-radius:0!important;box-shadow:none!important;max-width:100%!important}.actions{display:none!important}}</style></head>
<body><div class="wrap">
<div class="accent"></div>
<div class="layout">
<div class="side">
${nfLogo?`<div style="margin-bottom:1.75rem"><img src="${esc(nfLogo)}" style="max-height:50px;max-width:160px;object-fit:contain"/></div>`:`<div style="margin-bottom:1.75rem;font-family:'Playfair Display',serif;font-size:15px;color:${th.accentL};line-height:1.3">${esc(m.nome||'Empresa')}</div>`}
<div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.18em;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:.5px solid rgba(255,255,255,.07)">${tipo.l}</div>
${m.numero?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Número</div><div style="font-size:14px;color:${th.accent};font-weight:700">#${esc(m.numero)}</div></div>`:''}
<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Emissão</div><div style="font-size:12px;color:#c9d0e0">${fd(m.data)}</div></div>
${m.venc?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Vencimento</div><div style="font-size:12px;color:#c9d0e0">${fd(m.venc)}</div></div>`:''}
<div style="height:.5px;background:rgba(255,255,255,.07);margin:.9rem 0"></div>
<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Total</div><div style="font-size:15px;color:${th.accent};font-weight:700">${fmt(total,moeda)}</div></div>
<div style="height:.5px;background:rgba(255,255,255,.07);margin:.9rem 0"></div>
${m.cnpj?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">CNPJ/CPF</div><div style="font-size:11px;color:#c9d0e0">${esc(m.cnpj)}</div></div>`:''}
${m.email?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">E-mail</div><div style="font-size:11px;color:#c9d0e0">${esc(m.email)}</div></div>`:''}
${m.tel?`<div style="margin-bottom:.9rem"><div style="font-size:9px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">Telefone</div><div style="font-size:11px;color:#c9d0e0">${esc(m.tel)}</div></div>`:''}
</div>
<div class="main">
<div class="actions"><button class="btn-pdf" onclick="window.print()">⬇ Imprimir / Salvar PDF</button><button class="btn-close" onclick="window.close()">✕ Fechar</button></div>
${order.map(id=>blks[id]||'').join('')}
</div></div></div></body></html>`;

  const pw=window.open('','_blank','width=920,height=780,scrollbars=yes,resizable=yes');
  if(!pw){toast('Permita pop-ups para gerar o PDF.','warn',6000);return;}
  pw.document.write(html);
  pw.document.close();
}
window.abrirPDF=abrirPDF;

/* ══ IMPORTAR ITENS (CSV/Excel) no formulário ══ */
window.abrirImportarItens=()=>{
  openModal(`<div class="modal-header"><span class="modal-title">📥 Importar itens</span><button class="modal-x" onclick="closeModal()">×</button></div>
  <p style="font-size:13px;color:var(--text2);margin-bottom:1rem">O arquivo deve ter as colunas: <strong>descricao, quantidade, unidade, valor_unitario</strong></p>
  <div class="al info" style="margin-bottom:1rem">Formatos aceitos: <strong>CSV</strong> (.csv) e <strong>Excel</strong> (.xlsx / .xls)</div>
  <div class="upload-area" onclick="document.getElementById('csv-inp').click()">
    <input type="file" id="csv-inp" accept=".csv,.xlsx,.xls" onchange="processarArquivoItens(this)"/>
    <div style="font-size:24px;margin-bottom:8px">📂</div>
    <p style="font-size:13px;color:var(--text2)">Clique para selecionar o arquivo</p>
  </div>
  <div id="csv-preview" style="margin-top:1rem"></div>`);
};

window.processarArquivoItens=(inp)=>{
  const f=inp.files[0]; if(!f)return;
  const ext=f.name.split('.').pop().toLowerCase();
  if(ext==='csv'){
    const r=new FileReader();
    r.onload=e=>{ const rows=parseCSV(e.target.result); mostrarPreviewItens(rows); };
    r.readAsText(f,'UTF-8');
  } else {
    const r=new FileReader();
    r.onload=e=>{
      const wb=XLSX.read(e.target.result,{type:'binary'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      mostrarPreviewItens(rows);
    };
    r.readAsBinaryString(f);
  }
};

function parseCSV(text){
  const lines=text.trim().split('\n');
  const headers=lines[0].split(/[,;]/).map(h=>h.trim().toLowerCase().replace(/['"]/g,''));
  return lines.slice(1).map(line=>{
    const vals=line.split(/[,;]/).map(v=>v.trim().replace(/^["']|["']$/g,''));
    const obj={};
    headers.forEach((h,i)=>{ obj[h]=vals[i]||''; });
    return obj;
  }).filter(r=>Object.values(r).some(v=>v));
}

function normalizeKey(obj, keys){ for(const k of keys){ const found=Object.keys(obj).find(ok=>ok.toLowerCase().replace(/[\s_-]/g,'')===k.replace(/[\s_-]/g,'')); if(found) return obj[found]; } return ''; }

function mostrarPreviewItens(rows){
  if(!rows.length){document.getElementById('csv-preview').innerHTML=`<div class="al err">Nenhum dado encontrado no arquivo.</div>`;return;}
  const itensNovos=rows.map(r=>({
    desc:  normalizeKey(r,['descricao','descrição','desc','description','item','produto','servico','serviço'])||'',
    qty:   parseFloat(normalizeKey(r,['quantidade','qty','qtd','qtde','quantity']))||1,
    unit:  normalizeKey(r,['unidade','unit','und','un'])||'un',
    price: parseFloat(normalizeKey(r,['valorunitario','valor_unitario','preco','preço','price','valor','vl_unit']))||0,
    total: 0,
  })).map(it=>({...it, total:+(it.qty*it.price).toFixed(2)}));

  const prev=document.getElementById('csv-preview');
  prev.innerHTML=`<p style="font-size:13px;color:var(--text2);margin-bottom:10px">${itensNovos.length} item(s) encontrado(s):</p>
  <div style="overflow-x:auto;max-height:200px;overflow-y:auto">
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead><tr>${['Descrição','Qtd','Un.','Unit.','Total'].map(h=>`<th style="padding:5px 8px;border-bottom:.5px solid var(--border2);text-align:left;color:var(--text3);font-size:10px;text-transform:uppercase">${h}</th>`).join('')}</tr></thead>
      <tbody>${itensNovos.map(it=>`<tr><td style="padding:5px 8px;border-bottom:.5px solid var(--border)">${esc(it.desc)}</td><td style="padding:5px 8px;border-bottom:.5px solid var(--border)">${it.qty}</td><td style="padding:5px 8px;border-bottom:.5px solid var(--border)">${esc(it.unit)}</td><td style="padding:5px 8px;border-bottom:.5px solid var(--border)">${fmt(it.price)}</td><td style="padding:5px 8px;border-bottom:.5px solid var(--border);color:var(--gold);font-weight:600">${fmt(it.total)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div style="display:flex;gap:10px;margin-top:1rem;justify-content:flex-end">
    <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-gold" onclick="importarItens(${JSON.stringify(itensNovos).split('"').join("'")})">Adicionar à nota</button>
  </div>`;
  window._itensParaImportar=itensNovos;
  prev.querySelector('.btn-gold').onclick=()=>{ nfItems=[...nfItems.filter(it=>it.desc),...itensNovos]; closeModal(); rr(); toast(`${itensNovos.length} item(s) importado(s)!`,'ok'); };
}

/* ══ SIMULADOR FISCAL (página) ══ */
function rSimulador(el,acts){
  acts.innerHTML='';
  el.innerHTML=`
  <div class="card">
    <div class="card-header"><span class="card-title">Simulador de impostos</span></div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:1.5rem">Informe o valor do serviço ou produto e o tipo de operação para comparar quanto você vai pagar em cada regime tributário.</p>
    <div class="g3">
      <div class="field"><label>Valor da operação (R$)</label>
        <input type="number" id="sim-val" placeholder="10000" min="0" step="0.01" oninput="simAtualizar()"/></div>
      <div class="field"><label>Tipo</label>
        <select id="sim-tipo" onchange="simAtualizar()">
          <option value="servico">Serviço (NFS-e)</option>
          <option value="produto">Produto (NF-e)</option>
        </select></div>
      <div class="field"><label>Regime atual</label>
        <select id="sim-regime" onchange="simAtualizar()">
          <option value="">Selecione</option>
          <option value="mei">MEI</option>
          <option value="simples">Simples Nacional</option>
          <option value="lp">Lucro Presumido</option>
          <option value="lr">Lucro Real</option>
          <option value="autonomo">Autônomo</option>
        </select></div>
    </div>
    <div id="sim-result"></div>
  </div>
  <div class="card">
    <div class="card-header"><span class="card-title">Tabela de alíquotas de referência 2025</span></div>
    <table class="data-tbl">
      <thead><tr><th>Regime</th><th>Tipo</th><th>Alíquota estimada</th><th>Base de cálculo</th></tr></thead>
      <tbody>
        <tr><td>MEI</td><td>Serviços</td><td>~6% (DAS fixo)</td><td>Faturamento</td></tr>
        <tr><td>Simples Nacional</td><td>Serviços (Anexo III)</td><td>6% a 33%</td><td>Faturamento</td></tr>
        <tr><td>Simples Nacional</td><td>Comércio (Anexo I)</td><td>4% a 19%</td><td>Faturamento</td></tr>
        <tr><td>Lucro Presumido</td><td>Serviços</td><td>~13,25%</td><td>Receita bruta</td></tr>
        <tr><td>Lucro Presumido</td><td>Comércio/Indústria</td><td>~8–10%</td><td>Receita bruta</td></tr>
        <tr><td>Lucro Real</td><td>Qualquer</td><td>~15–25%</td><td>Lucro efetivo</td></tr>
        <tr><td>Autônomo (CARNÊ-LEÃO)</td><td>Serviços PF</td><td>Até 27,5%</td><td>Rendimento mensal</td></tr>
      </tbody>
    </table>
  </div>`;
}

window.simAtualizar=()=>{
  const val=parseFloat(document.getElementById('sim-val')?.value)||0;
  const tipo=document.getElementById('sim-tipo')?.value||'servico';
  const res=document.getElementById('sim-result');
  if(!res||val<=0)return;
  const isServico=tipo==='servico';
  const sims=calcSimulacao(val, isServico?'nfse':'nfe');
  let html=`<div style="margin-top:1.25rem"><div class="sec-lbl">Comparação de regimes</div>`;
  sims.forEach((op,i)=>{
    const cls=i===0?'best':(i===sims.length-1?'worst':'');
    html+=`<div class="sim-option ${cls}">
      <div class="sim-header">
        <div><div class="sim-name">${op.nome} ${i===0?'<span class="badge bgreen" style="font-size:10px">Menor imposto</span>':''}</div><div class="sim-detail">${op.descricao}</div></div>
        <div class="sim-valor ${i===0?'ok':''}">${fmt(op.imposto)}</div>
      </div>
      <div style="display:flex;gap:16px;margin-top:8px;font-size:12px;color:var(--text3)">
        <span>Alíquota: <strong>${op.aliq}%</strong></span>
        <span>Líquido: <strong style="color:var(--green)">${fmt(val-op.imposto)}</strong></span>
        <div style="flex:1;background:var(--bg);border-radius:99px;height:6px;overflow:hidden;align-self:center"><div style="height:100%;width:${op.aliq/30*100}%;background:${i===0?'var(--green)':'var(--gold)'}"></div></div>
      </div>
    </div>`;
  });
  html+='</div>';
  res.innerHTML=html;
};

