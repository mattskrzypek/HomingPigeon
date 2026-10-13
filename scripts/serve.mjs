import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const assets = new Map([['/','index.html'],['/index.html','index.html'],['/app.js','app.js'],['/analyzer.js','analyzer.js'],['/sample.js','sample.js'],['/style.css','style.css']]);
const types = new Map([['html','text/html; charset=utf-8'],['js','text/javascript; charset=utf-8'],['css','text/css; charset=utf-8']]);
const server = createServer(async(request,response)=>{
  const pathname=new URL(request.url,'http://127.0.0.1:4173').pathname;
  const asset=assets.get(pathname);
  if(request.method!=='GET' || !asset){response.writeHead(404);response.end('Not found');return;}
  try {
    const bytes=await readFile(fileURLToPath(new URL('../dist/'+asset,import.meta.url)));
    response.writeHead(200,{'Content-Type':types.get(asset.split('.').at(-1)),'Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});response.end(bytes);
  } catch(error) {if(!(error instanceof Error)) throw error;console.error('Static asset read failed',{asset,message:error.message});response.writeHead(500);response.end('Static asset unavailable');}
});
server.listen(4173,'127.0.0.1',()=>console.log('HomingPigeon preview: http://127.0.0.1:4173'));
