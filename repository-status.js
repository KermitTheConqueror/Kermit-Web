(() => {
  const checked=new Map();
  function paint(dot,repo){
    const state=checked.get(repo.full_name);
    dot.hidden=!state;
    if(!state)return;
    dot.className='deploy-dot deploy-'+state.color;
    dot.title=state.label;dot.setAttribute('aria-label',state.label);
  }
  function update(repo,state){
    checked.set(repo.full_name,state);
    document.querySelectorAll('[data-repository-status]').forEach(dot=>{if(dot.dataset.repositoryStatus===repo.full_name)paint(dot,repo);});
  }
  window.repositoryStatusDot=repo=>{
    const dot=document.createElement('span');dot.dataset.repositoryStatus=repo.full_name;
    dot.setAttribute('role','img');dot.tabIndex=0;paint(dot,repo);return dot;
  };
  window.assessRepository=(repo,files,truncated)=>{
    const html=files.some(f=>/\.html?$/i.test(f.path));
    const setup=files.some(f=>/(^|\/)(package\.json|requirements\.txt|pyproject\.toml|composer\.json|Gemfile|go\.mod|Cargo\.toml|Dockerfile|Procfile|server\.[cm]?js|app\.py)$|\.(php|csproj)$/i.test(f.path));
    const state=truncated?{color:'yellow',label:'Partial file listing — compatibility uncertain'}:!html?{color:'red',label:'Not directly deployable in this preview — no HTML entry point found'}:setup?{color:'yellow',label:'May work — build or server files detected'}:{color:'green',label:'Static website candidate — HTML found, no known setup files; not runtime-tested'};
    update(repo,state);
  };
})();
