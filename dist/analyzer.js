/** @typedef {{name:string, value:string}} Header */
/** @typedef {{method:string, result:string, detail:string}} AuthResult */
/** @typedef {{source:string, results:AuthResult[], raw:string}} AuthReport */
/** @typedef {{number:number, from:string, by:string, date:string, ips:string[], raw:string}} Hop */
/** @typedef {{kind:'ip'|'domain', value:string, eligible:boolean, reason:string}} Indicator */
/** @typedef {{headers:Header[], subject:string, from:string, to:string, replyTo:string, returnPath:string, messageId:string, date:string, authentication:AuthReport[], hops:Hop[], indicators:Indicator[], warnings:string[]}} Analysis */
export const MAX_INPUT_BYTES = 262144;

/** Parse a header block or the headers of an EML message; the body is never analyzed. @param {string} input @returns {Header[]} */
export function parseHeaders(input) {
  if (new TextEncoder().encode(input).length > MAX_INPUT_BYTES) throw new RangeError('Input exceeds 256 KiB. Paste only the message headers.');
  if (input.includes('\0')) throw new TypeError('Input contains a NUL byte. Use plain-text RFC email headers, not a binary MSG file.');
  const block = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n\n')[0].trimEnd();
  if (!block.trim()) throw new TypeError('No headers supplied. Paste a header block or load a text EML file.');
  const headers = block.split('\n').reduce((/** @type {Header[]} */ fields, line) => {
    if (/^[ \t]/.test(line)) {
      if (!fields.length) throw new TypeError('A folded line appears before any header field. Paste the complete header block.');
      return [...fields.slice(0, -1), {name:fields.at(-1).name, value:fields.at(-1).value+' '+line.trim()}];
    }
    const match = /^([!-9;-~]+):[ \t]*(.*)$/.exec(line);
    if (!match) throw new TypeError('Invalid header line: '+line.slice(0, 80)+'. Each field must start with a name followed by a colon.');
    return [...fields, {name:match[1].toLowerCase(), value:match[2].trim()}];
  }, []);
  if (!headers.some(h => ['from','received','subject','authentication-results'].includes(h.name))) throw new TypeError('No recognizable email headers found. Export “Show original” headers from your mail client.');
  return headers;
}

/** @param {Header[]} headers @param {string} name @returns {string[]} */
export function values(headers, name) { return headers.filter(h => h.name === name).map(h => h.value); }
/** @param {Header[]} headers @param {string} name @returns {string} */
function firstValue(headers, name) { return values(headers, name)[0] ?? ''; }

/** Extract reported outcomes, not cryptographic verification. @param {string} raw @returns {AuthReport} */
export function parseAuthentication(raw) {
  const source = raw.split(';')[0].trim();
  const results = [...raw.matchAll(/(?:^|;)\s*(spf|dkim|dmarc|arc|iprev|sender-id)(?:\/\d+)?\s*=\s*([a-z_-]+)([^;]*)/gi)].map(m => ({method:m[1].toLowerCase(), result:m[2].toLowerCase(), detail:m[3].trim()}));
  return {source, results, raw};
}

/** Normalize an IP literal without making a network request. @param {string} value @returns {string|null} */
export function normalizeIp(value) {
  const text = value.replace(/^\[|\]$/g, '').replace(/^IPv6:/i, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(text)) {
    const parts = text.split('.');
    return parts.every(p => /^(0|[1-9]\d{0,2})$/.test(p) && Number(p) <= 255) ? text : null;
  }
  if (!text.includes(':') || !/^[a-f\d:.]+$/i.test(text)) return null;
  try { return new URL('http://['+text+']/').hostname.replace(/^\[|\]$/g, ''); }
  catch (error) { if (error instanceof TypeError) return null; throw error; }
}

/** @param {string} text @returns {string[]} */
export function extractIps(text) {
  const ipv4 = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) ?? [];
  const bracketed = [...text.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
  const labeled = [...text.matchAll(/(?:client-ip=|\bIPv6:)([a-f\d:.]+)/gi)].map(m => m[1]);
  return [...new Set([...ipv4,...bracketed,...labeled].map(normalizeIp).filter(v => v !== null))];
}

/** Conservative public-indicator gate. Reserved, documentation and local addresses are excluded. @param {string} value @returns {boolean} */
export function isPublicIp(value) {
  const ip = normalizeIp(value);
  if (ip === null) return false;
  if (ip.includes(':')) {
    if (ip.includes('.')) return false;
    if (ip.startsWith('::ffff:')) return false;
    return /^[23]/.test(ip) && !/^2001:(db8|0|2|10|20)(:|$)/.test(ip) && !/^2002:/.test(ip);
  }
  const [a,b,c] = ip.split('.').map(Number);
  return !(a===0 || a===10 || a===127 || a>=224 || (a===100 && b>=64 && b<=127) || (a===169 && b===254) || (a===172 && b>=16 && b<=31) || (a===192 && (b===168 || b===0 || (b===88 && c===99))) || (a===198 && (b===18 || b===19 || (b===51 && c===100))) || (a===203 && b===0 && c===113));
}

/** @param {string} value @returns {boolean} */
export function isPublicDomain(value) {
  return /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,63}$/.test(value) && !/(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(value) && !/(^|\.)example\.(com|net|org)$/.test(value);
}

/** @param {string} raw @param {number} number @returns {Hop} */
function parseHop(raw, number) {
  const from = /\bfrom\s+([^\s;(]+)/i.exec(raw)?.[1] ?? '';
  const by = /\bby\s+([^\s;(]+)/i.exec(raw)?.[1] ?? '';
  return {number,from,by,date:raw.includes(';') ? raw.slice(raw.lastIndexOf(';')+1).trim() : '',ips:extractIps(raw),raw};
}

/** @param {string} input @returns {Analysis} */
export function analyzeHeaders(input) {
  const headers = parseHeaders(input);
  const authentication = values(headers,'authentication-results').map(parseAuthentication);
  const hops = values(headers,'received').slice().reverse().map((raw,i) => parseHop(raw,i+1));
  const domainFields = headers.filter(h => ['from','to','reply-to','return-path','message-id','received','authentication-results','dkim-signature'].includes(h.name)).map(h => h.value).join(' ');
  const domains = [...new Set((domainFields.match(/\b(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,63}\b(?![\w.-]|\s*=)/gi) ?? []).map(v => v.toLowerCase()).filter(v => normalizeIp(v) === null))];
  const ips = extractIps(headers.map(h => h.value).join(' '));
  const indicators = [...ips.map(value => ({kind:/** @type {'ip'} */('ip'),value,eligible:isPublicIp(value),reason:isPublicIp(value)?'':'Local, reserved or documentation address; external links disabled.'})), ...domains.map(value => ({kind:/** @type {'domain'} */('domain'),value,eligible:isPublicDomain(value),reason:isPublicDomain(value)?'':'Local, reserved or example domain; external links disabled.'}))];
  const duplicate = ['from','subject','date','reply-to','return-path'].filter(name => values(headers,name).length>1).map(name => 'Multiple '+name+' fields found; review the raw headers for ambiguity.');
  const senderDomain = /@([^>\s]+)/.exec(firstValue(headers,'from'))?.[1]?.toLowerCase();
  const replyDomain = /@([^>\s]+)/.exec(firstValue(headers,'reply-to'))?.[1]?.toLowerCase();
  const warnings = ['Pasted headers can be forged. Authentication outcomes and Received hops are reported evidence, not independent verification.', ...duplicate, ...(authentication.length?[]:['No Authentication-Results field found. Absence does not prove authentication failure.']), ...(hops.length?[]:['No Received trace found.']), ...(senderDomain && replyDomain && senderDomain!==replyDomain?['From and Reply-To domains differ. This can be legitimate; investigate the context.']:[])];
  return {headers,subject:firstValue(headers,'subject'),from:firstValue(headers,'from'),to:firstValue(headers,'to'),replyTo:firstValue(headers,'reply-to'),returnPath:firstValue(headers,'return-path'),messageId:firstValue(headers,'message-id'),date:firstValue(headers,'date'),authentication,hops,indicators,warnings};
}

/** @typedef {{provider:string,url:string,note:string}} InvestigationLink */
/** Links only: this function never requests or submits an indicator. @param {Indicator} indicator @returns {InvestigationLink[]} */
export function investigationLinks(indicator) {
  if (!indicator.eligible) return [];
  const value = encodeURIComponent(indicator.value);
  if (indicator.kind==='ip') return [
    {provider:'VirusTotal',url:'https://www.virustotal.com/gui/ip-address/'+value,note:'Opens an IP report. VirusTotal may retain queried indicators.'},
    {provider:'AbuseIPDB',url:'https://www.abuseipdb.com/check/'+value,note:'Opens community abuse reports. Reports are context, not proof.'},
    {provider:'Cisco Talos',url:'https://talosintelligence.com/reputation_center/lookup?search='+value,note:'Opens a reputation lookup.'}
  ];
  return [
    {provider:'VirusTotal',url:'https://www.virustotal.com/gui/domain/'+value,note:'Opens a domain report. VirusTotal may retain queried indicators.'},
    {provider:'urlscan.io',url:'https://urlscan.io/search/#domain:'+value,note:'Searches existing scans; does not submit a new scan.'},
    {provider:'Certificate Transparency',url:'https://crt.sh/?q='+value,note:'Searches publicly logged TLS certificates.'}
  ];
}
