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
  const entryFile=()=>selected && /\.html?$/i.test(selected.path) ? selected : ['dist/index.html','build/index.html','out/index.html','index.html','docs/index.html','public/index.html'].map(path=>files.find(f=>f.path===path)).find(Boolean) || files.find(f=>/(^|\/)index\.html?$/i.test(f.path)) || files.find(f=>/\.html?$/i.test(f.path));
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
  // Explicitly maintained builds only; never trust arbitrary repository homepages.
  const hostedBuild=()=>['shsgames/shsgames.github.io','kermittheconqueror/kermit-shsgames'].includes(repo?.full_name?.toLowerCase())?'https://kermit-shsgames.vercel.app/':null;
  $('run').onclick=()=>{
    if(hostedBuild()){launchProject(null);return;}
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
    const builtUrl=hostedBuild();
    if(builtUrl){
      const tab=window.open('about:blank','_blank');
      if(!tab){$('status').textContent='Allow pop-ups, then click Run Project again.';return;}
      tab.opener=null;
      tab.location.replace(builtUrl);
      $('status').textContent='Opened the separately hosted SHS Games build (source b6b580e). Upstream changes require a new build.';
      return;
    }
    if(!entry){$('status').textContent='Choose an HTML entry page. Backend projects need a built website first.';return;}
    const url=new URL('https://kermit-web-github-preview.vercel.app/__preview/start');
    url.searchParams.set('repo',repo.full_name);
    url.searchParams.set('entry',entry.path);
    // Published build folders must act as the root for /assets and page links.
    const publishedRoot=entry.path.match(/^(dist|build|out|docs|public)\//)?.[1];
    if(publishedRoot)url.searchParams.set('root',publishedRoot);
    url.searchParams.set('ref',repo.default_branch);
    // Use a top-level preview origin so its host-only session cookie works.
    // Never serve untrusted repository code on Kermit's own origin.
    const tab=window.open('about:blank','_blank');
    if(!tab){$('status').textContent='Allow pop-ups, then click Run Project again.';return;}
    tab.opener=null;
    tab.location.replace(url.href);
    $('status').textContent='Opened isolated preview. If it says “Repository not enabled”, add '+repo.full_name+' to PREVIEW_REPOSITORIES in the preview Vercel project and redeploy. Close older preview tabs before switching projects.';
  };
})();

