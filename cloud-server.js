const http=require('http'), fs=require('fs'), path=require('path');
const PORT=process.env.PORT||8787, TOKEN=process.env.NGHU_SYNC_TOKEN||'change-me';
const file=path.join(__dirname,'nghu_cloud_state.json');
function load(){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return {}}}
function save(x){fs.writeFileSync(file,JSON.stringify(x,null,2))}
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,X-Sync-Token','Access-Control-Allow-Methods':'GET,PUT,OPTIONS'});res.end(JSON.stringify(obj));}
const server=http.createServer((req,res)=>{if(req.method==='OPTIONS')return send(res,204,{}); if(!req.url.startsWith('/state/')) return send(res,404,{error:'not found'}); if((req.headers['x-sync-token']||'')!==TOKEN)return send(res,401,{error:'unauthorized'}); const id=decodeURIComponent(req.url.slice(7).split('?')[0]); const db=load(); if(req.method==='GET'){return send(res,200,db[id]||{state:{},updatedAt:null})} if(req.method==='PUT'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{const body=JSON.parse(b);db[id]={state:body.state||{},updatedAt:new Date().toISOString()};save(db);send(res,200,{ok:true,updatedAt:db[id].updatedAt})}catch(e){send(res,400,{error:'bad json'})}});return} send(res,405,{error:'method'});});
server.listen(PORT,()=>console.log('NGHU cloud sync API on '+PORT));
