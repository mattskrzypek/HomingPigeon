import {analyzeHeaders, investigationLinks, MAX_INPUT_BYTES} from './analyzer.js';
import {SAMPLE} from './sample.js';
/** @typedef {import('./analyzer.js').Analysis} Analysis */
/** @typedef {import('./analyzer.js').Indicator} Indicator */
/** @typedef {import('./analyzer.js').InvestigationLink} InvestigationLink */

/** @param {string} id @returns {HTMLElement} */
function requiredElement(id) { const el=document.getElementById(id); if(!el) throw new Error('Required UI element missing: '+id); return el; }
/** @template {keyof HTMLElementTagNameMap} T @param {T} tag @param {string} text @param {string} className @returns {HTMLElementTagNameMap[T]} */
function element(tag,text,className) { const el=document.createElement(tag); el.textContent=text; el.className=className; return el; }
/** @param {string} title @param {string} number @returns {HTMLElement} */
function section(title,number) { const el=element('section','','result-section'); el.append(element('p',number,'eyebrow'),element('h2',title,'')); return el; }
/** @param {string} raw @returns {HTMLDetailsElement} */
function rawDetails(raw) { const el=element('details','',''); el.append(element('summary','Show original header',''),element('pre',raw,'')); return el; }
/** @param {Indicator} indicator @param {InvestigationLink} link @returns {HTMLButtonElement} */
function lookupButton(indicator,link) {
  const button=element('button',link.provider,''); button.type='button';
  button.dataset.provider=link.provider; button.dataset.indicator=indicator.value;
  button.addEventListener('click',()=>{
    const dialog=requiredElement('lookup-dialog'); if(!(dialog instanceof HTMLDialogElement)) throw new TypeError('Lookup dialog must be a dialog element.');
    requiredElement('lookup-description').textContent='Destination: '+link.provider;
    requiredElement('lookup-value').textContent=indicator.kind+': '+indicator.value;
    requiredElement('lookup-note').textContent=link.note;
    const open=requiredElement('lookup-open'); if(!(open instanceof HTMLAnchorElement)) throw new TypeError('Lookup action must be a link.');
    open.href=link.url; dialog.showModal();
  }); return button;
}

/** @param {Analysis} report @returns {DocumentFragment} */
function reportView(report) {
  const fragment=document.createDocumentFragment();
  const summary=section('Message details','The header report');
  const grid=element('div','','summary-grid');
  for(const [label,value] of [['Subject',report.subject],['From',report.from],['To',report.to],['Reply-To',report.replyTo],['Return-Path',report.returnPath],['Message-ID',report.messageId],['Date',report.date]]) { const dl=element('dl','',''); dl.append(element('dt',label,''),element('dd',value||'Not present','')); grid.append(dl); }
  summary.append(grid);
  for(const warning of report.warnings) summary.append(element('p',warning,'warning'));
  const exportButton=element('button','Download report · JSON',''); exportButton.type='button';
  exportButton.id='download-analysis';
  exportButton.addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const anchor=element('a','',''); anchor.href=url; anchor.download='homingpigeon-analysis.json'; anchor.click(); URL.revokeObjectURL(url); });
  summary.append(element('p','The downloaded report includes addresses and raw header evidence. Review it before sharing.','small'),exportButton); fragment.append(summary);
  const auth=section('Authentication','Reported by the receiving servers');
  auth.append(element('p','These are header-reported outcomes. HomingPigeon does not verify SPF, DKIM signatures or DMARC alignment. Select an authserv-id only if you recognize it as your receiving mail system. A forged field can reuse that name.','small'));
  const label=element('label','Receiving authserv-id you recognize',''); label.htmlFor='trusted-source';
  const select=element('select','',''); select.id='trusted-source'; select.append(new Option('None selected — treat all claims as untrusted',''));
  for(const source of [...new Set(report.authentication.map(a=>a.source))]) select.append(new Option(source,source));
  const sourceStatus=element('p','No receiving system selected.','warning');
  select.addEventListener('change',()=>{sourceStatus.textContent=select.value?'You recognize '+select.value+'. Check its position against the receiving system’s own trace; matching the name alone does not prove authenticity.':'No receiving system selected.';});
  auth.append(label,select,sourceStatus);
  for(const claim of report.authentication) { const card=element('article','','auth-card'); card.append(element('h3',claim.source||'Unspecified source','')); for(const result of claim.results) { const line=element('div','','auth-result'); line.append(element('span',result.method.toUpperCase(),''),element('strong',result.result,''),element('code',result.detail,'')); card.append(line); } if(!claim.results.length) card.append(element('p','No supported authentication outcomes parsed. Review the raw field.','small')); card.append(rawDetails(claim.raw)); auth.append(card); }
  if(!report.authentication.length) auth.append(element('p','No Authentication-Results fields present.','small')); fragment.append(auth);
  const route=section('Flight path','Received hops · Oldest first'); route.append(element('p','Received headers are shown in reverse order. Upstream entries can be forged and clocks can disagree. This trace does not establish the original sending host.','small'));
  for(const hop of report.hops) { const card=element('article','','hop'); card.append(element('h3','Hop '+hop.number+': '+(hop.from||'Unknown sender')+' → '+(hop.by||'Unknown receiver'),''),element('p',hop.date||'No timestamp found',''),element('p','IP literals: '+(hop.ips.join(', ')||'None found'),'small'),rawDetails(hop.raw)); route.append(card); } fragment.append(route);
  const osint=section('Worth a closer look','IP and domain investigation links'); osint.append(element('p','These indicators may belong to relays, recipients or other systems mentioned in the headers. They are not automatically malicious. Use only non-sensitive indicators; no lookup occurs until you open the confirmation link.','small'));
  for(const indicator of report.indicators) { const row=element('div','','indicator'); const identity=element('div','',''); identity.append(element('code',indicator.value,''),element('small',indicator.kind+(indicator.reason?' · '+indicator.reason:''),'')); const buttons=element('div','','lookup-buttons'); for(const link of investigationLinks(indicator)) buttons.append(lookupButton(indicator,link)); row.append(identity,buttons); osint.append(row); } if(!report.indicators.length) osint.append(element('p','No IP or domain indicators found.','small')); fragment.append(osint);
  return fragment;
}

const input=requiredElement('headers'); if(!(input instanceof HTMLTextAreaElement)) throw new TypeError('Header input must be a textarea.');
const form=requiredElement('analyze-form'); const results=requiredElement('results'); const errorBox=requiredElement('error');
form.addEventListener('submit',event=>{event.preventDefault(); try {const report=analyzeHeaders(input.value); results.replaceChildren(reportView(report)); errorBox.hidden=true; results.scrollIntoView({behavior:'instant',block:'start'});} catch(error) {if(!(error instanceof Error)) throw error; errorBox.textContent=error.message; errorBox.hidden=false; results.replaceChildren();}});
requiredElement('load-sample').addEventListener('click',()=>{input.value=SAMPLE; errorBox.hidden=true; results.replaceChildren(); input.focus();});
requiredElement('clear').addEventListener('click',()=>{input.value='';results.replaceChildren();errorBox.hidden=true;const file=requiredElement('file');if(file instanceof HTMLInputElement) file.value='';input.focus();});
const fileInput=requiredElement('file'); if(!(fileInput instanceof HTMLInputElement)) throw new TypeError('File input is required.');
fileInput.addEventListener('change',async()=>{const file=fileInput.files?.[0]; if(!file) return; if(file.size>MAX_INPUT_BYTES){errorBox.textContent='File exceeds 256 KiB. Export or paste the headers only.';errorBox.hidden=false;return;} if(!/\.(eml|txt)$/i.test(file.name)){errorBox.textContent='Choose a plain-text .eml or .txt file.';errorBox.hidden=false;return;} try {input.value=await file.text();errorBox.hidden=true;results.replaceChildren();}catch(error){if(!(error instanceof Error)) throw error;errorBox.textContent='Could not read '+file.name+': '+error.message;errorBox.hidden=false;}});
requiredElement('lookup-cancel').addEventListener('click',()=>{const dialog=requiredElement('lookup-dialog');if(dialog instanceof HTMLDialogElement) dialog.close();});
requiredElement('lookup-open').addEventListener('click',()=>{const dialog=requiredElement('lookup-dialog');if(dialog instanceof HTMLDialogElement) dialog.close();});
