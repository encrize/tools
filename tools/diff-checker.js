function lcs(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length:m+1}, ()=>new Array(n+1).fill(0));
    for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
        dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
    let i=m, j=n, result=[];
    while(i>0 && j>0) {
        if(a[i-1]===b[j-1]) { result.push({type:'eq',val:a[i-1]}); i--;j--; }
        else if(dp[i-1][j]>=dp[i][j-1]) { result.push({type:'rem',val:a[i-1]}); i--; }
        else { result.push({type:'add',val:b[j-1]}); j--; }
    }
    while(i>0){ result.push({type:'rem',val:a[i-1]}); i--; }
    while(j>0){ result.push({type:'add',val:b[j-1]}); j--; }
    return result.reverse();
}

function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function runDiff() {
    const a = document.getElementById('textA').value.split('\n');
    const b = document.getElementById('textB').value.split('\n');
    const diff = lcs(a, b);

    let added=0, removed=0, unchanged=0, html='';
    for(const d of diff) {
        if(d.type==='add'){ added++; html+=`<div class="diff-line added"><span class="line-marker add">+</span><span>${esc(d.val)}</span></div>`; }
        else if(d.type==='rem'){ removed++; html+=`<div class="diff-line removed"><span class="line-marker rem">−</span><span>${esc(d.val)}</span></div>`; }
        else { unchanged++; html+=`<div class="diff-line unchanged"><span class="line-marker unc"> </span><span>${esc(d.val)}</span></div>`; }
    }

    document.getElementById('statAdded').textContent = `+ ${added} added`;
    document.getElementById('statRemoved').textContent = `− ${removed} removed`;
    document.getElementById('statUnchanged').textContent = `${unchanged} unchanged`;
    document.getElementById('diffOutput').innerHTML = html;
    document.getElementById('diffResult').style.display = 'block';
}

function clearAll() {
    document.getElementById('textA').value = '';
    document.getElementById('textB').value = '';
    document.getElementById('diffResult').style.display = 'none';
}

document.querySelector('[data-split-event="1"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {runDiff()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.querySelector('[data-split-event="2"]').addEventListener('click', function(event) {
    const splitEventResult = (function(event) {clearAll()}).call(this, event);
    if (splitEventResult === false) {
        event.preventDefault();
        event.stopPropagation();
    }
});
