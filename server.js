const http=require('http'), fs=require('fs'), path=require('path'), os=require('os');
const PORT=8787, ROOT=__dirname, DATA=path.join(ROOT,'sync-data.json');
let db={updatedAt:new Date().toISOString(),state:{}};
try{db=JSON.parse(fs.readFileSync(DATA,'utf8'));}catch{}
function save(){fs.writeFileSync(DATA,JSON.stringify(db,null,2));}
function send(res,code,type,body){res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(body);}
const server=http.createServer((req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,PUT,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
  if(req.url==='/api/state' && req.method==='GET') return send(res,200,'application/json',JSON.stringify(db));
  if(req.url==='/api/state' && req.method==='PUT'){
    let raw=''; req.on('data',c=>raw+=c); req.on('end',()=>{try{const x=JSON.parse(raw);db={updatedAt:new Date().toISOString(),state:x.state||{}};save();send(res,200,'application/json',JSON.stringify(db));}catch(e){send(res,400,'application/json',JSON.stringify({error:'bad json'}));}}); return;
  }
  let u=decodeURIComponent(req.url.split('?')[0]); if(u==='/'||u==='/index.html')u='/index.html';
  const f=path.join(ROOT,u); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()) return send(res,404,'text/plain','Not found');
  const ext=path.extname(f), types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json','.json':'application/json'};
  send(res,200,types[ext]||'application/octet-stream',fs.readFileSync(f));
});
server.listen(PORT,'0.0.0.0',()=>{
 console.log('\nНГХУ v2.8 sync server'); console.log('На Mac: http://localhost:'+PORT); 
 const nets=os.networkInterfaces(); for(const name of Object.keys(nets)) for(const n of nets[name]||[]) if(n.family==='IPv4'&&!n.internal) console.log('Для iPhone в той же Wi‑Fi сети: http://'+n.address+':'+PORT);
 console.log('\nОстановить: Ctrl+C\n');
});
