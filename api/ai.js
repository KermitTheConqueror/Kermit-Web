const recent=new Map();
module.exports=async(req,res)=>{
 const send=(status,obj)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj));};
 if(req.method!=='POST')return send(405,{error:'Use POST.'});
 if(!/^application\/json\b/i.test(req.headers['content-type']||''))return send(415,{error:'Expected JSON.'});
 const key=process.env.CRAXGPT_API_KEY;if(!key)return send(503,{error:'AI chat is not connected yet.'});
 let body=req.body;try{if(body==null){const parts=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>80000)return send(413,{error:'Chat is too long.'});parts.push(chunk);}body=Buffer.concat(parts).toString();}if(typeof body==='string')body=JSON.parse(body);}catch{return send(400,{error:'Invalid request.'});}
 const m=body?.messages;if(!Array.isArray(m)||!m.length||m.length>9||m.at(-1)?.role!=='user'||m.some(x=>!['assistant','user'].includes(x?.role)||typeof x.content!=='string'||!x.content.trim()||x.content.length>2000))return send(400,{error:'Invalid chat message.'});
 const now=Date.now();for(const [k,v] of recent)if(v.until<=now)recent.delete(k);
 const ip=req.socket.remoteAddress+':'+(process.env.VERCEL?req.headers['x-vercel-forwarded-for']||'':'');const bucket=recent.get(ip)||{count:0,until:now+60000};if(bucket.count>=6)return send(429,{error:'Please wait a minute before sending more messages.'});bucket.count++;recent.set(ip,bucket);
 try{const r=await fetch('https://gpt.crax.lol/v1/chat/completions',{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.CRAXGPT_MODEL||'glm-5.3',messages:m.map(({role,content})=>({role,content})),stream:false,max_tokens:600}),signal:AbortSignal.timeout(45000)});
 if(!r.ok)return send(r.status===429?429:502,{error:r.status===429?'CraxGPT is at its usage limit. Try again later.':'CraxGPT could not complete this request.'});const reply=(await r.json()).choices?.[0]?.message?.content;if(typeof reply!=='string'||!reply.trim())throw Error();send(200,{reply});}catch{send(502,{error:'Could not get a reply from CraxGPT. Please try again.'});}
};
