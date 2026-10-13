import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyzeHeaders,parseHeaders,normalizeIp,isPublicIp,isPublicDomain,investigationLinks} from '../dist/analyzer.js';
import {SAMPLE} from '../dist/sample.js';

test('complete synthetic message preserves folding, reported outcomes and hop order',()=>{
  const report=analyzeHeaders(SAMPLE+'\nBody must not become evidence: attacker.evil.com 8.8.8.8');
  assert.equal(report.authentication[0].source,'inbox.example.net');
  assert.deepEqual(report.authentication[0].results.map(r=>[r.method,r.result]),[['spf','pass'],['dkim','fail'],['dmarc','fail']]);
  assert.equal(report.hops[0].from,'workstation.example.com');
  assert.equal(report.hops[1].by,'inbox.example.net');
  assert.ok(report.warnings.some(w=>w.includes('Reply-To')));
  assert.equal(report.indicators.some(i=>i.value==='attacker.evil.com'),false);
  assert.equal(report.indicators.some(i=>i.value==='8.8.8.8'),false);
  assert.ok(report.indicators.every(i=>!i.eligible));
  assert.equal(analyzeHeaders(SAMPLE).subject,report.subject);
});
test('multiple authentication fields remain separate and duplicate senders are flagged',()=>{
  const report=analyzeHeaders('From: one@example.com\r\nFrom: two@example.org\r\nAuthentication-Results: forged.invalid; dmarc=pass header.from=example.com\r\nAuthentication-Results: receiver.example.net; dmarc=fail header.from=example.com');
  assert.equal(report.authentication.length,2);
  assert.ok(report.warnings.some(w=>w.includes('Multiple from')));
  assert.equal(report.authentication[1].results[0].result,'fail');
});
test('malformed, empty, binary and oversized inputs fail explicitly',()=>{
  for(const value of ['', ' continuation', 'not a header', 'From: x\0', 'Subject: '+'a'.repeat(262145)]) assert.throws(()=>parseHeaders(value));
});
test('IPv4 and IPv6 parsing validates literals',()=>{
  assert.equal(normalizeIp('999.1.1.1'),null);
  assert.equal(normalizeIp('010.1.1.1'),null);
  assert.equal(normalizeIp('[IPv6:2001:db8::1]'),'2001:db8::1');
  const report=analyzeHeaders('Received: from relay ([IPv6:2001:db8::1]) by inbox.example.net; Tue, 13 Oct 2026 09:00:00 +0000');
  assert.ok(report.hops[0].ips.includes('2001:db8::1'));
});
test('OSINT links exclude local, private, documentation and reserved indicators',()=>{
  for(const ip of ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.1','169.254.1.1','100.64.0.1','198.51.100.20','203.0.113.2','224.1.1.1','::1','fc00::1','fe80::1','2001:db8::1','::ffff:192.168.1.1']) assert.equal(isPublicIp(ip),false,ip);
  assert.equal(isPublicIp('8.8.8.8'),true);
  assert.equal(isPublicIp('2606:4700:4700::1111'),true);
  for(const domain of ['mail.local','example.com','sub.example.org','host.internal','evil.test','localhost','a/b.com']) assert.equal(isPublicDomain(domain),false,domain);
  assert.deepEqual(investigationLinks({kind:'ip',value:'10.0.0.1',eligible:false,reason:'private'}),[]);
});
test('public indicators produce only HTTPS investigation links',()=>{
  const links=investigationLinks({kind:'domain',value:'giac.org',eligible:true,reason:''});
  assert.equal(links.length,3);
  assert.ok(links.every(link=>new URL(link.url).protocol==='https:'));
  assert.ok(links.find(link=>link.provider==='urlscan.io').url.includes('/search/'));
});
