(() => {
 const $=id=>document.getElementById(id), messages=[];
 function draw(role,content){const p=document.createElement('p'),who=document.createElement('strong');who.textContent=role==='user'?'You':'Kermit AI';p.append(who,document.createTextNode(content));$('log').append(p);$('log').scrollTop=$('log').scrollHeight;}
 $('clear').onclick=()=>{messages.length=0;$('log').replaceChildren();$('status').textContent='';$('prompt').value='';$('prompt').focus();};
 document.querySelector('form').onsubmit=async event=>{
  event.preventDefault();const content=$('prompt').value.trim();if(!content||$('send').disabled)return;
  const next={role:'user',content};$('send').disabled=$('clear').disabled=$('prompt').disabled=true;$('status').textContent='Thinking…';
  try{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[...messages.slice(-8),next]}),signal:AbortSignal.timeout(55000)});const data=await r.json();if(!r.ok||!data.reply)throw Error(data.error||'No reply received.');draw('user',content);draw('assistant',data.reply);messages.push(next,{role:'assistant',content:data.reply.slice(0,2000)});$('prompt').value='';$('status').textContent='';}
  catch(e){$('status').textContent=e instanceof SyntaxError?'The chat server is unavailable.':e.message;}
  finally{$('send').disabled=$('clear').disabled=$('prompt').disabled=false;$('prompt').focus();}
 };
})();
