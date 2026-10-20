(() => {
  const modal=document.createElement('dialog');modal.className='repo-viewer';
  modal.innerHTML='<header><button id="rv-close">← Results</button><h2 id="rv-name"></h2><a id="rv-zip" target="_blank" rel="noopener noreferrer">Download ZIP ↗</a><a id="rv-github" target="_blank" rel="noopener noreferrer">GitHub ↗</a></header><p id="rv-status" role="status"></p><div class="rv-layout"><aside><label for="rv-filter">Filter files</label><input id="rv-filter" type="search" placeholder="Find a file…"><div id="rv-files"></div></aside><section class="rv-content"><div class="rv-toolbar"><strong id="rv-path">Select a file</strong><button id="rv-download" disabled>Download file</button><button id="rv-run" disabled>▶ Run HTML</button></div><pre id="rv-code" tabindex="0"></pre><section id="rv-preview" hidden><div class="rv-toolbar"><strong>Sandboxed preview</strong><button id="rv-fullscreen">Fullscreen</button><button id="rv-stop">Stop</button></div><p class="hint">Static HTML/CSS/JavaScript only. Build tools, servers, module imports, and some network features are not supported. Preview code may contact external services.</p><div id="rv-stage"></div></section></section></div>';
  document.body.append(modal);
  const $=id=>modal.querySelector('#rv-'+id);
  modal.classList.add('github-repository');
  const githubStyle=document.createElement('link');githubStyle.rel='stylesheet';githubStyle.href='repository-github.css?v=1';document.head.append(githubStyle);
  const tabs=document.createElement('nav');tabs.className='rv-gh-tabs';tabs.setAttribute('aria-label','Repository sections');
  const codeTab=document.createElement('button');codeTab.textContent='〈〉 Code';codeTab.setAttribute('aria-current','page');codeTab.onclick=()=>showRepoTab('code',codeTab);tabs.append(codeTab);
  const externalTabs=[];for(const [label,path] of [['Issues','issues'],['Pull requests','pulls'],['Actions','actions'],['Insights','pulse']]){const link=document.createElement('button');link.textContent=label;link.onclick=()=>showRepoTab(path,link);tabs.append(link);externalTabs.push([link,path]);}
  modal.querySelector('header').after(tabs);
  modal.querySelector('.rv-layout').before($('path').parentElement);
  // Keep one repository ZIP action in the player toolbar instead of file download.
  $('download').hidden=true;
  $('download').after($('zip'));
  let folder='';
  const breadcrumb=document.createElement('button');breadcrumb.className='rv-breadcrumb';breadcrumb.type='button';breadcrumb.textContent='Repository root';
  $('filter').before(breadcrumb);
  breadcrumb.onclick=()=>{folder=folder.split('/').slice(0,-2).join('/');if(folder)folder+='/';$('filter').value='';renderFiles();};
  const readme=document.createElement('article');readme.className='rv-readme';readme.setAttribute('aria-label','Repository README');
  modal.querySelector('.rv-layout').append(readme);
  const about=document.createElement('section');about.className='rv-gh-about';about.setAttribute('aria-label','About repository');
  const body=document.createElement('div');body.className='rv-gh-body';modal.querySelector('.rv-layout').before(body);body.append(modal.querySelector('.rv-layout'),about);
  const tabPanel=document.createElement('section');tabPanel.className='rv-tab-panel';tabPanel.hidden=true;tabPanel.setAttribute('aria-live','polite');body.after(tabPanel);
  let tabRequest=0,tabController;
  async function showRepoTab(kind,button,page=1){
    const token=++tabRequest;tabController?.abort();tabController=new AbortController();
    for(const tab of tabs.children)tab.removeAttribute('aria-current');button.setAttribute('aria-current','page');
    body.hidden=kind!=='code';$('path').parentElement.hidden=kind!=='code';tabPanel.hidden=kind==='code';
    if(kind==='code')return;
    tabPanel.replaceChildren();const heading=document.createElement('h2');heading.textContent=button.textContent;tabPanel.append(heading);
    const loading=document.createElement('p');loading.textContent='Loading from GitHub…';tabPanel.append(loading);
    const base='https://api.github.com/repos/'+enc(repo.full_name);
    async function get(path){const response=await window.githubRequest(base+path,{credentials:'omit',signal:tabController.signal,headers:{Accept:'application/vnd.github+json'}});if(!response.ok)throw Error(response.status===403||response.status===429?'GitHub access or rate limit reached. Please try again later.':response.status===404?'This information is not publicly available.':'GitHub request failed ('+response.status+').');return {data:await response.json(),more:!!response.headers.get('link')?.includes('rel="next"')};}
    function row(title,meta,text){const details=document.createElement('details');details.className='rv-info-row';const summary=document.createElement('summary');summary.textContent=title;const sub=document.createElement('p');sub.className='rv-info-meta';sub.textContent=meta;const content=document.createElement('pre');content.textContent=text||'No description provided.';details.append(summary,sub,content);tabPanel.append(details);}
    try{
      if(kind==='pulse'){
        const info=await Promise.allSettled([get('/languages'),get('/contributors?per_page=10'),get('/commits?per_page=10')]);if(token!==tabRequest)return;loading.remove();
        const note=document.createElement('p');note.textContent='Public activity overview · Top 10 contributors and latest 10 commits. Private traffic and analytics are not available.';tabPanel.append(note);
        for(let i=0;i<info.length;i++){
          const title=document.createElement('h3');title.textContent=['Languages','Top contributors','Recent commits'][i];tabPanel.append(title);
          if(info[i].status==='rejected'){const error=document.createElement('p');error.textContent=info[i].reason.message;tabPanel.append(error);continue;}
          const data=info[i].value.data;
          if(i===0){const sum=Object.values(data).reduce((a,b)=>a+b,0);for(const [name,bytes] of Object.entries(data)){const p=document.createElement('p');p.textContent=name+' — '+(bytes/sum*100).toFixed(1)+'%';tabPanel.append(p);}if(!sum)tabPanel.append(document.createTextNode('No language data.'));}
          if(i===1)for(const person of data)row(person.login,person.contributions+' contributions','GitHub account: '+person.login);
          if(i===2)for(const commit of data)row(commit.commit.message.split('\n')[0],(commit.commit.author?.name||'Unknown')+' · '+(commit.commit.author?.date||''),commit.commit.message);
        }
        return;
      }
      const endpoint=kind==='actions'?'/actions/runs?per_page=20&page=':kind==='pulls'?'/pulls?state=all&sort=updated&direction=desc&per_page=20&page=':'/issues?state=all&sort=updated&direction=desc&per_page=20&page=';
      const result=await get(endpoint+page);if(token!==tabRequest)return;loading.remove();
      const items=kind==='actions'?result.data.workflow_runs:kind==='issues'?result.data.filter(item=>!item.pull_request):result.data;
      if(!items.length){const empty=document.createElement('p');empty.textContent='No '+button.textContent.toLowerCase()+' on this page.';tabPanel.append(empty);}
      for(const item of items){
        if(kind==='actions')row(item.display_title||item.name,(item.conclusion||item.status)+' · '+item.head_branch+' · '+new Date(item.created_at).toLocaleString(),'Workflow: '+item.name+'\nEvent: '+item.event+'\nCommit: '+item.head_sha+'\nRun #'+item.run_number+'\n\nLogs and artifacts are not loaded in this view.');
        else row('#'+item.number+' '+item.title,item.state+' · '+(item.user?.login||'Unknown')+' · Updated '+new Date(item.updated_at).toLocaleDateString(),item.body);
      }
      const paging=document.createElement('div');paging.className='rv-tab-paging';for(const [label,target,disabled] of [['← Previous',page-1,page===1],['Next →',page+1,!result.more]]){const control=document.createElement('button');control.textContent=label;control.disabled=disabled;control.onclick=()=>showRepoTab(kind,button,target);paging.append(control);}tabPanel.append(paging);
    }catch(error){if(token!==tabRequest||error.name==='AbortError')return;loading.textContent=error.message;const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>showRepoTab(kind,button,page);tabPanel.append(retry);}
  }
  function renderReadme(html,base){
    const parsed=new DOMParser().parseFromString(html,'text/html');
    const allowed=new Set('ARTICLE DIV SECTION H1 H2 H3 H4 H5 H6 P BR HR UL OL LI PRE CODE BLOCKQUOTE TABLE THEAD TBODY TR TH TD STRONG EM B I S DEL A IMG DETAILS SUMMARY SPAN SUP SUB KBD'.split(' '));
    function clean(node){
      if(node.nodeType===3)return document.createTextNode(node.textContent);
      if(node.nodeType!==1)return document.createDocumentFragment();
      if(['SCRIPT','STYLE','IFRAME','OBJECT','SVG','FORM'].includes(node.tagName))return document.createDocumentFragment();
      const element=allowed.has(node.tagName)?document.createElement(node.tagName.toLowerCase()):document.createElement('span');
      for(const child of node.childNodes)element.append(clean(child));
      if(node.tagName==='A'||node.tagName==='IMG'){
        const attribute=node.tagName==='IMG'?'src':'href';
        try{const url=new URL(node.getAttribute(attribute)||'',base);if(['https:','http:'].includes(url.protocol))element.setAttribute(attribute,url.href);}catch{}
        if(node.tagName==='A'){element.target='_blank';element.rel='noopener noreferrer';}
        else{element.alt=node.getAttribute('alt')||'';element.loading='lazy';element.referrerPolicy='no-referrer';}
      }
      return element;
    }
    readme.replaceChildren();const title=document.createElement('h2');title.textContent='README';readme.append(title);
    for(const child of parsed.body.childNodes)readme.append(clean(child));
  }
  async function loadReadme(id){
    const first=files.find(f=>/^readme(?:\.(md|markdown|mdown|rst|txt))?$/i.test(f.path))||files.find(f=>/^(\.github|docs)\/readme\.md$/i.test(f.path));
    if(!first){readme.textContent='No README found in this repository.';return;}
    readme.textContent='Loading README…';const base=raw(first.path);
    try{
      const response=await window.githubRequest('https://api.github.com/repos/'+enc(repo.full_name)+'/readme?ref='+encodeURIComponent(repo.default_branch),{credentials:'omit',signal:AbortSignal.timeout(15000),headers:{Accept:'application/vnd.github.html+json'}});
      if(!response.ok)throw Error('README rendering unavailable');const html=await response.text();if(id!==generation)return;renderReadme(html,base);
    }catch{
      try{const text=await read(base);if(id!==generation)return;readme.replaceChildren();const notice=document.createElement('p');notice.textContent='Formatted README unavailable; showing source.';const pre=document.createElement('pre');pre.textContent=text;readme.append(notice,pre);}catch{if(id===generation)readme.textContent='Unable to load README. Open GitHub to view it.';}
    }
  }
  const ownerAvatar=document.createElement('img');ownerAvatar.className='rv-owner-avatar';ownerAvatar.hidden=true;ownerAvatar.referrerPolicy='no-referrer';ownerAvatar.onerror=()=>{ownerAvatar.hidden=true;};
  $('name').before(ownerAvatar);
  $('run').textContent='▶ Run Project ↗';
  let repo,files=[],selected=null,source='',generation=0,fileGeneration=0,runGeneration=0;
  const textCache=new Map();
  const entryFile=()=>selected && /\.html?$/i.test(selected.path) ? selected : files.find(f=>f.path==='index.html') || files.find(f=>/(^|\/)index\.html?$/i.test(f.path)) || files.find(f=>/\.html?$/i.test(f.path));
  function setupIndicators(){
    // Conservative hints, not a guarantee: manifests can also belong to static sites.
    return files.filter(f=>/(^|\/)(package\.json|requirements\.txt|pyproject\.toml|Pipfile|manage\.py|composer\.json|Gemfile|go\.mod|Cargo\.toml|Dockerfile|Procfile|server\.[cm]?js|app\.py|next\.config\.[^/]+|vite\.config\.[^/]+|webpack\.config\.[^/]+)$|\.(php|csproj)$/i.test(f.path)).map(f=>f.path);
  }
  const enc=path=>path.split('/').map(encodeURIComponent).join('/');
  const raw=path=>'https://raw.githubusercontent.com/'+enc(repo.full_name)+'/'+encodeURIComponent(repo.default_branch)+'/'+enc(path);
  async function request(url){const r=await window.githubRequest(url,{credentials:'omit',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(r.status===403||r.status===429?'GitHub access or rate limit reached. Please wait and try again.':r.status===404?'Repository or file not found.':'GitHub request failed ('+r.status+').');return r;}
  async function read(url){if(textCache.has(url))return textCache.get(url);const r=await request(url);const blob=await r.blob();if(blob.size>2*1024*1024)throw Error('This file is larger than the 2 MB source-view limit. Download it instead.');const text=await blob.text();if(text.includes('\0'))throw Error('Binary file: download it to view it in a suitable application.');textCache.set(url,text);return text;}
  function stop(){runGeneration++;$('stage').replaceChildren();$('preview').hidden=true;}
  function close(){generation++;fileGeneration++;tabRequest++;tabController?.abort();stop();modal.close();}
  $('close').onclick=close;modal.addEventListener('cancel',()=>{generation++;fileGeneration++;stop();});
  $('stop').onclick=stop;$('fullscreen').onclick=()=>{$('stage').requestFullscreen?.().catch(()=>{$('status').textContent='Fullscreen is not available in this browser.';});};
  function renderFiles(){
    const query=$('filter').value.toLowerCase();$('files').replaceChildren();
    breadcrumb.textContent=folder?'← '+folder:'Repository root';breadcrumb.disabled=!folder;
    const fragment=document.createDocumentFragment();
    const entries=new Map();
    for(const file of files){
      if(query){if(file.path.toLowerCase().includes(query))entries.set(file.path,{file,label:file.path});continue;}
      if(!file.path.startsWith(folder))continue;const rest=file.path.slice(folder.length),slash=rest.indexOf('/');
      if(slash>=0){const name=rest.slice(0,slash);entries.set(name,{directory:folder+name+'/',label:name});}
      else entries.set(rest,{file,label:rest});
    }
    for(const item of [...entries.values()].sort((a,b)=>Number(!!b.directory)-Number(!!a.directory)||a.label.localeCompare(b.label))){const button=document.createElement('button');button.className='rv-file';button.textContent=(item.directory?'▸  ':'▤  ')+item.label;button.onclick=()=>{if(item.directory){folder=item.directory;renderFiles();}else selectFile(item.file);};fragment.append(button);}
    $('files').append(fragment);
  }
  async function selectFile(file){
    modal.querySelector('.rv-content').hidden=false;
    const id=++fileGeneration;stop();selected=file;source='';$('path').textContent=file.path;$('code').textContent='Loading source…';$('run').disabled=true;$('download').disabled=false;
    try{if(file.size>2*1024*1024)throw Error('File exceeds the 2 MB source-view limit. Use Download file.');const text=await read(raw(file.path));if(id!==fileGeneration)return;source=text;$('code').textContent=text;}
    catch(e){if(id===fileGeneration)$('code').textContent=e.message;}
    finally{if(id===fileGeneration)$('run').disabled=false;}
  }
  $('filter').oninput=renderFiles;
  $('download').onclick=async()=>{
    if(!selected)return;const url=raw(selected.path),name=selected.path.split('/').pop();
    try{const response=await request(url),blob=await response.blob(),href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(href),30000);}
    catch(e){$('status').textContent=e.message;}
  };
  window.openRepository=async item=>{
    showRepoTab('code',codeTab);
    const id=++generation;fileGeneration++;stop();repo=item;files=[];selected=null;source='';textCache.clear();
    folder='';modal.querySelector('.rv-content').hidden=true;readme.textContent='Loading README…';
    ownerAvatar.dataset.githubProfile=repo.owner?.login||'';ownerAvatar.tabIndex=0;ownerAvatar.setAttribute('role','button');ownerAvatar.setAttribute('aria-label','View '+(repo.owner?.login||'owner')+' profile');ownerAvatar.hidden=!repo.owner?.avatar_url;if(repo.owner?.avatar_url){ownerAvatar.src=repo.owner.avatar_url;ownerAvatar.alt=(repo.owner.login||'Owner')+' profile picture';}
    $('name').textContent=repo.full_name;$('filter').value='';$('files').replaceChildren();$('code').textContent='';$('path').textContent='Select a file';$('download').disabled=true;$('run').disabled=true;
    $('path').textContent='⑂ '+repo.default_branch;
    for(const [link,path] of externalTabs)link.href='https://github.com/'+enc(repo.full_name)+'/'+path;
    about.replaceChildren();const aboutTitle=document.createElement('h3');aboutTitle.textContent='About';const description=document.createElement('p');description.textContent=repo.description||'No description provided.';about.append(aboutTitle,description);
    for(const text of ['☆ '+Number(repo.stargazers_count||0).toLocaleString()+' stars','⑂ '+Number(repo.forks_count||0).toLocaleString()+' forks',repo.language?'● '+repo.language:null,repo.license?.name]){if(text){const line=document.createElement('p');line.className='rv-gh-stat';line.textContent=text;about.append(line);}}
    if(repo.topics?.length){const topics=document.createElement('div');topics.className='rv-gh-topics';for(const topic of repo.topics){const badge=document.createElement('span');badge.textContent=topic;topics.append(badge);}about.append(topics);}
    $('github').href='https://github.com/'+enc(repo.full_name);
    $('zip').href='https://github.com/'+enc(repo.full_name)+'/archive/refs/heads/'+encodeURIComponent(repo.default_branch)+'.zip';
    $('status').textContent='Loading repository file tree…';modal.showModal();
    try{
      const response=await request('https://api.github.com/repos/'+enc(repo.full_name)+'/git/trees/'+encodeURIComponent(repo.default_branch)+'?recursive=1');const data=await response.json();if(id!==generation)return;
      files=(data.tree||[]).filter(f=>f.type==='blob').sort((a,b)=>a.path.localeCompare(b.path));renderFiles();window.assessRepository(repo,files,data.truncated);$('name').append(window.repositoryStatusDot(repo));
      $('run').disabled=false;
      $('status').textContent=files.length+' files on '+repo.default_branch+(data.truncated?' · GitHub truncated this large repository. Download ZIP or open GitHub for the complete tree.':' · Select a file to read its source.');
      loadReadme(id);
    }catch(e){if(id===generation){
      const message=e.name==='TimeoutError'||e.name==='AbortError'?'GitHub took too long to respond. Try loading this repository again.':e instanceof TypeError?'Unable to reach GitHub. Check your connection and try again.':e.message;
      $('status').textContent=message;readme.textContent='README could not load because the repository file list is unavailable.';
      const retry=document.createElement('button');retry.textContent='Retry loading repository';retry.onclick=()=>window.openRepository(item);$('files').replaceChildren(retry);
    }}
  };
  const warningDialog=document.createElement('dialog');warningDialog.className='repo-run-warning';
  warningDialog.setAttribute('aria-labelledby','run-warning-title');warningDialog.setAttribute('aria-describedby','run-warning-message');
  const warningIcon=document.createElement('div');warningIcon.className='run-warning-icon';warningIcon.textContent='⚠';warningIcon.setAttribute('aria-hidden','true');
  const warningTitle=document.createElement('h2');warningTitle.id='run-warning-title';
  const warningMessage=document.createElement('p');warningMessage.id='run-warning-message';
  const warningEvidence=document.createElement('p');warningEvidence.className='run-warning-evidence';
  const warningActions=document.createElement('div');warningActions.className='run-warning-actions';
  const cancelRun=document.createElement('button');cancelRun.textContent='Cancel';
  const confirmRun=document.createElement('button');confirmRun.textContent='Try preview anyway';confirmRun.className='run-warning-confirm';
  warningActions.append(cancelRun,confirmRun);warningDialog.append(warningIcon,warningTitle,warningMessage,warningEvidence,warningActions);document.body.append(warningDialog);
  let pendingPreview=null;
  function cancelPreview(){pendingPreview=null;$('status').textContent='Preview cancelled. No project was started.';}
  cancelRun.onclick=()=>{cancelPreview();warningDialog.close();};warningDialog.addEventListener('cancel',cancelPreview);
  confirmRun.onclick=()=>{const pending=pendingPreview;pendingPreview=null;warningDialog.close();if(pending&&pending.generation===generation)launchProject(pending.entry);};
  $('run').onclick=()=>{
    const entry=entryFile();
    const indicators=setupIndicators();
    if(indicators.length||!entry){
      const evidence=indicators.length?'Detected: '+indicators.slice(0,4).join(', ')+(indicators.length>4?' …':''):'No HTML entry point was found.';
      warningDialog.dataset.level=entry?'yellow':'red';
      warningTitle.textContent=entry?'This project might not work':'This project cannot run in this preview';
      warningMessage.textContent=entry?'This repository may need a server, dependencies, or a build step. Continuing only previews its static files—it does not install anything or start a backend.':'No HTML entry point was found. This project needs a web build or another runtime before it can be previewed.';
      warningEvidence.textContent=evidence;confirmRun.hidden=!entry;cancelRun.textContent=entry?'Cancel':'Got it';
      pendingPreview=entry?{entry,generation}:null;warningDialog.showModal();cancelRun.focus();return;
    }
    launchProject(entry);
  };
  function launchProject(entry){
    if(!entry){$('status').textContent='No HTML entry point. This project must be built into a static website first. Server and native code cannot run in a browser.';return;}
    const tab=window.open('about:blank','_blank');
    if(!tab){$('status').textContent='Your browser blocked the preview tab. Allow pop-ups and try again.';return;}
    tab.opener=null;
    const shell=tab.document;
    const theme=shell.createElement('style');
    theme.textContent=`
      *{box-sizing:border-box}body{background:radial-gradient(ellipse at top left,#183b40,#0a111c 65%)!important;color:#eaf7f5!important;font:14px system-ui,sans-serif!important;height:100dvh!important}
      header{padding:16px 24px!important;gap:12px!important;background:#0c1729cc;border-bottom:1px solid #ffffff15;flex-wrap:wrap}
      header strong{font-size:15px;letter-spacing:.2px;overflow-wrap:anywhere;min-width:120px}
      header strong:before{content:'K';display:inline-grid;place-items:center;width:34px;height:34px;margin-right:12px;border-radius:11px;background:#a7efcd;color:#102c29;font-size:23px;font-weight:900;vertical-align:middle}
      button{padding:10px 18px;border:1px solid #ffffff24;border-radius:12px;background:#ffffff0c;color:#eaf7f5;font:600 13px system-ui;cursor:pointer;transition:background .15s}
      button:hover{background:#ffffff20}button:focus-visible{outline:3px solid #a7efcd;outline-offset:3px}button:last-child{color:#ffc3cb;border-color:#ff99aa40;background:#ea6a7b12}
      body>p{margin:0!important;padding:10px 24px;color:#a5b8c8;font-size:12px;line-height:1.6;border-bottom:1px solid #ffffff0a}
      main{margin:18px;border:1px solid #ffffff20;border-radius:16px;overflow:hidden;box-shadow:0 20px 65px #0006}
      main:fullscreen{margin:0;border:0;border-radius:0}iframe{display:block}
      @media(max-width:600px){header{padding:12px!important}header strong{width:100%;flex-basis:100%!important}body>p{padding:8px 12px}main{margin:8px;border-radius:10px}}
      @media(prefers-reduced-motion:reduce){button{transition:none}}
    `;
    shell.body.append(theme);
    shell.title=repo.full_name+' — Static website';
    shell.body.style.cssText='margin:0;background:#0d1117;color:#e6edf3;font:14px system-ui;display:flex;flex-direction:column;height:100vh';
    const toolbar=shell.createElement('header');toolbar.style.cssText='padding:12px;display:flex;gap:16px;align-items:center';
    const heading=shell.createElement('strong');heading.textContent=repo.full_name;heading.style.flex='1';
    const stop=shell.createElement('button');stop.textContent='Stop';
    const full=shell.createElement('button');full.textContent='Fullscreen';
    toolbar.append(heading,full,stop);
    const note=shell.createElement('p');note.style.margin='8px 12px';note.textContent='Static website preview · Files load together from an isolated local server. Build steps and backends are not executed. The local preview service must be running.';
    const stage=shell.createElement('main');stage.style.cssText='flex:1;min-height:0;display:flex;background:white';
    const [owner,name]=repo.full_name.split('/');
    const params=new URLSearchParams({owner,repo:name,ref:repo.default_branch,entry:entry.path});
    const frame=shell.createElement('iframe');frame.title='Repository website';
    frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads');
    frame.setAttribute('referrerpolicy','no-referrer');frame.allow='fullscreen; gamepad';frame.allowFullscreen=true;
    frame.src='http://127.0.0.1:8015/launch?'+params;
    frame.style.cssText='width:100%;height:100%;border:0;flex:1';stage.append(frame);
    stop.onclick=()=>{stage.replaceChildren();stage.style.background='transparent';const stopped=shell.createElement('p');stopped.textContent='Project stopped. You can close this tab or launch another project from the library.';stopped.style.cssText='margin:auto;padding:32px;text-align:center;color:#a5b8c8;max-width:480px;line-height:1.8';stage.append(stopped);note.textContent='Session ended';stop.disabled=true;};
    full.onclick=()=>stage.requestFullscreen?.().catch(()=>{note.textContent='Fullscreen unavailable.';});
    shell.body.append(toolbar,note,stage);
    $('status').textContent='Opened repository files as a static website in an about:blank tab.';
  };
})();
