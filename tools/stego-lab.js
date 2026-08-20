(function(){
const canvas  = document.getElementById('steg-canvas');
const ctx     = canvas.getContext('2d');
const dropEl  = document.getElementById('steg-drop');
const dropIcon= document.getElementById('steg-drop-icon');
const wsEl    = document.getElementById('steg-workspace');
const MAGIC = [0x47,0x53,0x4C,0x31];

let orig = null, stegoData = null, lastFileName = 'image';
let activeTab = 'bitplane', activeChannel = 'R', activeMode = 'bw';
let rgbView = 'original', rgbOp = null;
let hideMode = 'text', secretFile = null, secretBytes = null;
let revealBlob = null, revealName = 'secret.bin';

function $(id){ return document.getElementById(id); }
function toast(msg, dur){
    const t = $('steg-toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, dur || 2000);
}

/* ---------- load image ---------- */
$('steg-file').addEventListener('change', function(e){ if (e.target.files[0]) loadImage(e.target.files[0]); });
dropEl.addEventListener('dragover', function(e){ e.preventDefault(); dropEl.style.borderColor='var(--clr-accent,#e07820)'; dropEl.style.background='rgba(224,120,32,.06)'; dropIcon.style.color='var(--clr-accent,#e07820)'; });
dropEl.addEventListener('dragleave', function(){ dropEl.style.borderColor='var(--clr-muted,#555)'; dropEl.style.background='rgba(0,0,0,.2)'; dropIcon.style.color='var(--clr-muted,#888)'; });
dropEl.addEventListener('drop', function(e){ e.preventDefault(); dropEl.style.borderColor='var(--clr-muted,#555)'; dropEl.style.background='rgba(0,0,0,.2)'; dropIcon.style.color='var(--clr-muted,#888)'; if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]); });
window.addEventListener('paste', function(e){ const items=(e.clipboardData||{}).items||[]; for (let i=0;i<items.length;i++){ if (items[i].type && items[i].type.indexOf('image')===0){ const f=items[i].getAsFile(); if (f){ loadImage(f); toast('Pasted image loaded'); } } } });

function loadImage(file){
    const r = new FileReader();
    r.onload = function(ev){
        const img = new Image();
        img.onload = function(){
            canvas.width = img.width; canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            orig = ctx.getImageData(0, 0, canvas.width, canvas.height);
            stegoData = null;
            const nm = file.name || 'image';
            lastFileName = nm.indexOf('.')>=0 ? nm.slice(0, nm.lastIndexOf('.')) : nm;
            $('steg-canvas-empty').style.display = 'none';
            canvas.style.display = 'block';
            $('steg-canvas-label').style.display = 'block';
            wsEl.style.display = 'block';
            dropEl.style.marginBottom = '0';
            updateFileInfo(file, img);
            renderEntropy(); renderAnalysis(); runSteganalysis(); updateCompare(); updateCapacity();
            updateCanvas();
        };
        img.src = ev.target.result;
    };
    r.readAsDataURL(file);
}

/* ---------- tabs ---------- */
document.querySelectorAll('.steg-tab').forEach(function(b){ b.addEventListener('click', function(){
    document.querySelectorAll('.steg-tab').forEach(function(x){ x.classList.remove('active'); });
    b.classList.add('active'); activeTab = b.dataset.tab;
    document.querySelectorAll('.steg-panel').forEach(function(p){ p.classList.remove('active'); });
    $('steg-panel-' + activeTab).classList.add('active');
    if (orig) updateCanvas();
    if (orig && activeTab === 'analysis'){ renderAnalysis(); runSteganalysis(); }
}); });

function updateCanvas(){
    if (!orig) return;
    if      (activeTab === 'bitplane') renderBitPlane();
    else if (activeTab === 'rgb')      renderRGB();
    else if (activeTab === 'hide' && stegoData) ctx.putImageData(stegoData, 0, 0);
    else ctx.putImageData(orig, 0, 0);
    updateLabel();
}
function updateLabel(){
    const l = $('steg-canvas-label');
    if (activeTab === 'bitplane') l.textContent = 'Bit ' + $('bitSlider').value + ' - ' + activeChannel + ' - ' + activeMode;
    else if (activeTab === 'rgb') l.textContent = 'Channel: ' + rgbView;
    else if (activeTab === 'hide' && stegoData) l.textContent = 'stego (encoded)';
    else l.textContent = 'original';
}

function renderBitPlane(){
    const bit = parseInt($('bitSlider').value);
    const d = orig.data, out = ctx.createImageData(canvas.width, canvas.height), od = out.data;
    for (let i = 0; i < d.length; i += 4){
        let r=(d[i]>>bit)&1, g=(d[i+1]>>bit)&1, b=(d[i+2]>>bit)&1, v;
        if      (activeChannel==='R') v = r*255;
        else if (activeChannel==='G') v = g*255;
        else if (activeChannel==='B') v = b*255;
        else v = ((r+g+b)>1?1:0)*255;
        if (activeMode==='invert') v = 255-v;
        if (activeMode==='color'){ od[i]=r*255; od[i+1]=g*255; od[i+2]=b*255; }
        else { od[i]=od[i+1]=od[i+2]=v; }
        od[i+3]=255;
    }
    ctx.putImageData(out, 0, 0);
}

function renderRGB(){
    const d = orig.data, out = ctx.createImageData(canvas.width, canvas.height), od = out.data;
    for (let i = 0; i < d.length; i += 4){
        if      (rgbView==='r')       { od[i]=d[i];     od[i+1]=0;        od[i+2]=0;        }
        else if (rgbView==='g')       { od[i]=0;        od[i+1]=d[i+1];   od[i+2]=0;        }
        else if (rgbView==='b')       { od[i]=0;        od[i+1]=0;        od[i+2]=d[i+2];   }
        else if (rgbView==='gray')    { const l=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]); od[i]=od[i+1]=od[i+2]=l; }
        else if (rgbOp==='swap_rb')   { od[i]=d[i+2];   od[i+1]=d[i+1];   od[i+2]=d[i];     }
        else if (rgbOp==='swap_rg')   { od[i]=d[i+1];   od[i+1]=d[i];     od[i+2]=d[i+2];   }
        else if (rgbOp==='invert_all'){ od[i]=255-d[i]; od[i+1]=255-d[i+1];od[i+2]=255-d[i+2]; }
        else if (rgbOp==='neg_r')     { od[i]=255-d[i]; od[i+1]=d[i+1];   od[i+2]=d[i+2];   }
        else if (rgbOp==='neg_g')     { od[i]=d[i];     od[i+1]=255-d[i+1];od[i+2]=d[i+2];  }
        else if (rgbOp==='neg_b')     { od[i]=d[i];     od[i+1]=d[i+1];   od[i+2]=255-d[i+2]; }
        else                          { od[i]=d[i];     od[i+1]=d[i+1];   od[i+2]=d[i+2];   }
        od[i+3]=255;
    }
    ctx.putImageData(out, 0, 0);
}

$('bitSlider').addEventListener('input', function(){
    $('bitVal').textContent = this.value;
    document.querySelectorAll('#qpGrid .btn').forEach(function(b){ b.classList.toggle('active', b.dataset.qp == this.value); }, this);
    if (orig && activeTab==='bitplane') renderBitPlane();
    updateLabel();
});
document.querySelectorAll('.ch-btn[data-ch]').forEach(function(b){ b.addEventListener('click', function(){
    document.querySelectorAll('.ch-btn[data-ch]').forEach(function(x){ x.classList.remove('active'); });
    b.classList.add('active'); activeChannel = b.dataset.ch;
    if (orig && activeTab==='bitplane') renderBitPlane();
}); });
document.querySelectorAll('.btn[data-mode]').forEach(function(b){ b.addEventListener('click', function(){
    document.querySelectorAll('.btn[data-mode]').forEach(function(x){ x.classList.remove('active'); });
    b.classList.add('active'); activeMode = b.dataset.mode;
    if (orig && activeTab==='bitplane') renderBitPlane();
}); });
document.querySelectorAll('.ch-btn[data-view]').forEach(function(b){ b.addEventListener('click', function(){
    document.querySelectorAll('.ch-btn[data-view]').forEach(function(x){ x.classList.remove('active'); });
    b.classList.add('active'); rgbView = b.dataset.view; rgbOp = null;
    if (orig && activeTab==='rgb') renderRGB();
}); });
document.querySelectorAll('.btn[data-op]').forEach(function(b){ b.addEventListener('click', function(){
    rgbOp = b.dataset.op; rgbView = 'op';
    if (orig && activeTab==='rgb') renderRGB();
}); });
document.querySelectorAll('#qpGrid .btn').forEach(function(b){ b.addEventListener('click', function(){
    const v = b.dataset.qp;
    $('bitSlider').value = v; $('bitVal').textContent = v;
    document.querySelectorAll('#qpGrid .btn').forEach(function(x){ x.classList.remove('active'); });
    b.classList.add('active');
    document.querySelectorAll('.steg-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab==='bitplane'); });
    document.querySelectorAll('.steg-panel').forEach(function(p){ p.classList.remove('active'); });
    $('steg-panel-bitplane').classList.add('active');
    activeTab = 'bitplane';
    if (orig){ renderBitPlane(); updateLabel(); }
}); });

function updateFileInfo(file, img){
    $('fileInfo').innerHTML =
        '<div class="stat-row"><span>' + file.name + '</span></div>' +
        '<div class="stat-row"><span>Resolution</span><span class="stat-val">' + img.width + '&times;' + img.height + '</span></div>' +
        '<div class="stat-row"><span>File size</span><span class="stat-val">' + (file.size/1024).toFixed(1) + ' KB</span></div>' +
        '<div class="stat-row"><span>Total pixels</span><span class="stat-val">' + (img.width*img.height).toLocaleString() + '</span></div>' +
        '<div class="stat-row"><span>Capacity (1-bit RGB)</span><span class="stat-val">' + Math.floor(img.width*img.height*3/8).toLocaleString() + ' bytes</span></div>';
}

function renderAnalysis(){
    if (!orig) return;
    const d = orig.data, n = d.length/4;
    let rs=0, gs=0, bs=0;
    for (let i=0;i<d.length;i+=4){ rs+=d[i]; gs+=d[i+1]; bs+=d[i+2]; }
    $('statsTable').innerHTML =
        '<div class="stat-row"><span>Pixels</span><span class="stat-val">' + n.toLocaleString() + '</span></div>' +
        '<div class="stat-row"><span style="color:#cc4455;">Avg Red</span><span class="stat-val">' + (rs/n).toFixed(1) + '</span></div>' +
        '<div class="stat-row"><span style="color:#44aa66;">Avg Green</span><span class="stat-val">' + (gs/n).toFixed(1) + '</span></div>' +
        '<div class="stat-row"><span style="color:#5588ee;">Avg Blue</span><span class="stat-val">' + (bs/n).toFixed(1) + '</span></div>' +
        '<div class="stat-row"><span>LSB capacity</span><span class="stat-val">' + Math.floor(n*3/8).toLocaleString() + ' bytes</span></div>';
    const bins=24, step=256/bins;
    const rH=new Array(bins).fill(0), gH=new Array(bins).fill(0), bH=new Array(bins).fill(0);
    for (let i=0;i<d.length;i+=4){
        rH[Math.min(bins-1,Math.floor(d[i]/step))]++;
        gH[Math.min(bins-1,Math.floor(d[i+1]/step))]++;
        bH[Math.min(bins-1,Math.floor(d[i+2]/step))]++;
    }
    const mx = Math.max.apply(null, rH.concat(gH).concat(bH));
    let html = '<div class="hist-wrap">';
    [['R',rH,'#cc4455'],['G',gH,'#44aa66'],['B',bH,'#5588ee']].forEach(function(t){
        html += '<div class="hist-col"><div class="hist-lbl" style="color:' + t[2] + '">' + t[0] + '</div><div class="hist-bars">';
        t[1].forEach(function(v){ const h=Math.max(1,Math.round((v/mx)*38)); html += '<div class="hist-bar" style="height:' + h + 'px;background:' + t[2] + '"></div>'; });
        html += '</div></div>';
    });
    html += '</div>';
    $('histogram').innerHTML = html;
    const sd = (stegoData||orig).data;
    let lb='';
    for (let i=0;i<64;i++){ const bit=sd[i*4]&1; lb += '<div class="lsb-cell ' + (bit?'on':'off') + '">' + bit + '</div>'; }
    $('lsbGrid').innerHTML = lb;
}

function renderEntropy(){
    if (!orig) return;
    const d = (stegoData||orig).data, n = d.length/4;
    let html = '';
    for (let bit=0; bit<8; bit++){
        let ones=0;
        for (let i=0;i<d.length;i+=4) ones += (d[i]>>bit)&1;
        const ratio=ones/n;
        const ent=-((ratio*Math.log2(ratio+1e-9))+((1-ratio)*Math.log2(1-ratio+1e-9)));
        const pct=Math.round(ent*100);
        const col = bit<3 ? 'var(--clr-accent,#e07820)' : 'rgba(255,255,255,.25)';
        html += '<div class="ent-row"><span style="font-size:10px;color:var(--clr-muted,#888);min-width:38px;">Bit ' + bit + '</span><div class="ent-bg"><div class="ent-bar" style="width:' + pct + '%;background:' + col + '"></div></div><span style="font-size:10px;color:var(--clr-muted,#aaa);min-width:28px;">' + pct + '%</span></div>';
    }
    $('entropyBars').innerHTML = html;
}

/* ---------- steganalysis (chi-square attack) ---------- */
function gammln(xx){
    const cof=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
    let x=xx, y=xx, tmp=x+5.5; tmp-=(x+0.5)*Math.log(tmp);
    let ser=1.000000000190015;
    for (let j=0;j<6;j++){ y++; ser+=cof[j]/y; }
    return -tmp+Math.log(2.5066282746310005*ser/x);
}
function gammp(a,x){
    if (x<=0||a<=0) return 0;
    if (x<a+1){
        let ap=a, sum=1/a, del=sum;
        for (let n=0;n<300;n++){ ap++; del*=x/ap; sum+=del; if (Math.abs(del)<Math.abs(sum)*1e-12) break; }
        return sum*Math.exp(-x+a*Math.log(x)-gammln(a));
    } else {
        const FPMIN=1e-300; let b=x+1-a, c=1/FPMIN, d=1/b, h=d;
        for (let i=1;i<=300;i++){ const an=-i*(i-a); b+=2; d=an*d+b; if (Math.abs(d)<FPMIN) d=FPMIN; c=b+an/c; if (Math.abs(c)<FPMIN) c=FPMIN; d=1/d; const del=d*c; h*=del; if (Math.abs(del-1)<1e-12) break; }
        return 1-Math.exp(-x+a*Math.log(x)-gammln(a))*h;
    }
}
function chiSquareAttack(channel){
    const d=(stegoData||orig).data, h=new Array(256).fill(0);
    for (let i=0;i<d.length;i+=4) h[d[i+channel]]++;
    let chi=0, df=0;
    for (let k=0;k<128;k++){ const e=(h[2*k]+h[2*k+1])/2; if (e>=1){ const diff=h[2*k]-e; chi+=diff*diff/e; df++; } }
    if (df<1) df=1;
    return { chi: chi, df: df, p: 1 - gammp(df/2, chi/2) };
}
function lsbRatio(channel){
    const d=(stegoData||orig).data, n=d.length/4; let ones=0;
    for (let i=0;i<d.length;i+=4) ones += d[i+channel]&1;
    return ones/n;
}
function runSteganalysis(){
    if (!orig) return;
    const el=$('steganalysis'); if (!el) return;
    const res=chiSquareAttack(0);
    const pr=lsbRatio(0), pg=lsbRatio(1), pb=lsbRatio(2);
    const pct=Math.round(res.p*100);
    const col = pct>66?'#cc4455':(pct>33?'#cc8820':'#44aa66');
    const verdict = pct>66?'Likely contains hidden data':(pct>33?'Possibly modified':'Looks clean');
    let html='';
    html += '<div class="verdict" style="color:' + col + '">' + verdict + ' (' + pct + '%)</div>';
    html += '<div class="mini-bar-bg"><div class="mini-bar" style="width:' + pct + '%;background:' + col + '"></div></div>';
    html += '<div class="stat-row" style="margin-top:8px;"><span>Chi-square</span><span class="stat-val">' + res.chi.toFixed(1) + '</span></div>';
    html += '<div class="stat-row"><span style="color:#cc4455;">LSB ratio R</span><span class="stat-val">' + pr.toFixed(4) + '</span></div>';
    html += '<div class="stat-row"><span style="color:#44aa66;">LSB ratio G</span><span class="stat-val">' + pg.toFixed(4) + '</span></div>';
    html += '<div class="stat-row"><span style="color:#5588ee;">LSB ratio B</span><span class="stat-val">' + pb.toFixed(4) + '</span></div>';
    html += '<p class="steg-note">Chi-square attack: a high percentage means LSB value pairs are equalized, a classic sign of embedded data. Ratios near 0.5000 are also suspicious.</p>';
    el.innerHTML=html;
}

/* ---------- compare vs original ---------- */
function luma(d,i){ return 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; }
function computePSNR(a,b){ let mse=0,c=0; for (let i=0;i<a.length;i+=4){ for (let k=0;k<3;k++){ const dd=a[i+k]-b[i+k]; mse+=dd*dd; c++; } } mse/=c; return mse===0?Infinity:10*Math.log10(255*255/mse); }
function computeSSIM(a,b){ let n=0,ma=0,mb=0; for (let i=0;i<a.length;i+=4){ ma+=luma(a,i); mb+=luma(b,i); n++; } ma/=n; mb/=n; let va=0,vb=0,cov=0; for (let i=0;i<a.length;i+=4){ const la=luma(a,i)-ma, lb=luma(b,i)-mb; va+=la*la; vb+=lb*lb; cov+=la*lb; } va/=n; vb/=n; cov/=n; const c1=6.5025,c2=58.5225; return ((2*ma*mb+c1)*(2*cov+c2))/((ma*ma+mb*mb+c1)*(va+vb+c2)); }
function changedPct(a,b){ let ch=0,c=0; for (let i=0;i<a.length;i+=4){ for (let k=0;k<3;k++){ if (a[i+k]!==b[i+k]) ch++; c++; } } return ch/c*100; }
function updateCompare(){
    const el=$('compareStats'); if (!el) return;
    if (!stegoData){ el.innerHTML='<p class="steg-note">Hide data (or load a stego image and re-hide) to measure distortion against the original.</p>'; return; }
    const psnr=computePSNR(orig.data, stegoData.data);
    const ssim=computeSSIM(orig.data, stegoData.data);
    const chp=changedPct(orig.data, stegoData.data);
    el.innerHTML =
        '<div class="stat-row"><span>PSNR</span><span class="stat-val">' + (psnr===Infinity?'∞':psnr.toFixed(2)+' dB') + '</span></div>' +
        '<div class="stat-row"><span>SSIM (global)</span><span class="stat-val">' + ssim.toFixed(5) + '</span></div>' +
        '<div class="stat-row"><span>Sub-pixels changed</span><span class="stat-val">' + chp.toFixed(2) + '%</span></div>' +
        '<p class="steg-note">Higher PSNR and SSIM closer to 1 mean the hidden data is harder to detect.</p>';
}
function renderDiff(amp){
    if (!orig || !stegoData){ toast('Need an original and an encoded image'); return; }
    const out=ctx.createImageData(canvas.width, canvas.height), od=out.data, a=orig.data, b=stegoData.data;
    for (let i=0;i<a.length;i+=4){ for (let k=0;k<3;k++){ od[i+k]=Math.min(255, Math.abs(a[i+k]-b[i+k])*amp); } od[i+3]=255; }
    ctx.putImageData(out,0,0);
    $('steg-canvas-label').textContent = 'diff x' + amp;
}

/* ---------- bit / slot helpers ---------- */
const CHMAP=[[0],[1],[2],[0,1,2]];
function buildSlots(numPixels, channels){ const m=channels.length; const slots=new Int32Array(numPixels*m); let k=0; for (let p=0;p<numPixels;p++){ const base=p*4; for (let c=0;c<m;c++) slots[k++]=base+channels[c]; } return slots; }
function seedFromPw(pw){ let h=2166136261; for (let i=0;i<pw.length;i++){ h=h^pw.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function mulberry32(a){ return function(){ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function shuffleSlots(slots, seed){ const r=mulberry32(seed); for (let i=slots.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=slots[i]; slots[i]=slots[j]; slots[j]=t; } return slots; }
function embedBits(data, slots, bpp, bits){ let bi=0; const mask=(~((1<<bpp)-1))&0xFF; for (let s=0;s<slots.length && bi<bits.length;s++){ const idx=slots[s]; let v=data[idx]&mask; for (let b=bpp-1;b>=0 && bi<bits.length;b--,bi++) v|=bits[bi]<<b; data[idx]=v; } }
function bytesToBits(bytes){ const bits=new Uint8Array(bytes.length*8); let k=0; for (let q=0;q<bytes.length;q++){ const byte=bytes[q]; for (let b=7;b>=0;b--) bits[k++]=(byte>>b)&1; } return bits; }
function makeReader(data, slots, bpp){
    let si=0; const buf=[];
    function ensure(nbits){ while (buf.length<nbits && si<slots.length){ const idx=slots[si++]; for (let b=bpp-1;b>=0;b--) buf.push((data[idx]>>b)&1); } }
    return {
        readBytes:function(n){ ensure(n*8); if (buf.length<n*8) return null; const out=new Uint8Array(n); for (let i=0;i<n;i++){ let v=0; for (let b=0;b<8;b++) v=(v<<1)|buf[i*8+b]; out[i]=v; } buf.splice(0,n*8); return out; },
        capacityBytes:function(){ return Math.floor(slots.length*bpp/8); }
    };
}

/* ---------- crypto (AES-256-GCM via PBKDF2) ---------- */
async function deriveKey(pw, salt){
    const km=await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), {name:'PBKDF2'}, false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2', salt:salt, iterations:120000, hash:'SHA-256'}, km, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
}
async function encryptBytes(pw, plain){
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await deriveKey(pw, salt);
    const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, key, plain));
    const blob=new Uint8Array(28+ct.length); blob.set(salt,0); blob.set(iv,16); blob.set(ct,28); return blob;
}
async function decryptBytes(pw, blob){
    const salt=blob.slice(0,16), iv=blob.slice(16,28), ct=blob.slice(28);
    const key=await deriveKey(pw, salt);
    return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, key, ct));
}

/* ---------- container ---------- */
function buildContainer(type, name, blob, encrypted){
    const nameBytes=new TextEncoder().encode(name||'');
    const nameLen=Math.min(255, nameBytes.length);
    const head=new Uint8Array(7+nameLen+4);
    head[0]=MAGIC[0]; head[1]=MAGIC[1]; head[2]=MAGIC[2]; head[3]=MAGIC[3];
    head[4]=encrypted?1:0; head[5]=type; head[6]=nameLen;
    for (let i=0;i<nameLen;i++) head[7+i]=nameBytes[i];
    const off=7+nameLen, len=blob.length;
    head[off]=(len>>>24)&0xFF; head[off+1]=(len>>>16)&0xFF; head[off+2]=(len>>>8)&0xFF; head[off+3]=len&0xFF;
    const out=new Uint8Array(head.length+blob.length); out.set(head,0); out.set(blob,head.length); return out;
}

/* ---------- capacity ---------- */
function updateCapacity(){
    const bar=$('capFill'), txt=$('capText'); if (!bar||!txt||!orig) return;
    const channels=CHMAP[parseInt($('hideCh').value)];
    const bpp=parseInt($('hideBits').value);
    const capacity=Math.floor((orig.data.length/4)*channels.length*bpp/8);
    let payloadLen=0, nameLen=0;
    if (hideMode==='text'){ payloadLen=new TextEncoder().encode($('hideText').value||'').length; }
    else if (secretBytes){ payloadLen=secretBytes.length; nameLen=Math.min(255, new TextEncoder().encode(secretFile?secretFile.name:'').length); }
    const encrypted=($('hidePass').value||'').length>0;
    const used=7+nameLen+4+payloadLen+(encrypted?44:0);
    const pct=capacity>0?Math.min(100, used/capacity*100):100;
    bar.style.width=pct.toFixed(1)+'%';
    bar.classList.toggle('over', used>capacity);
    txt.textContent=used.toLocaleString()+' / '+capacity.toLocaleString()+' bytes ('+pct.toFixed(1)+'%)'+(used>capacity?' - too large!':'');
}

/* ---------- hide UI ---------- */
document.querySelectorAll('.seg [data-hm]').forEach(function(b){ b.addEventListener('click', function(){
    document.querySelectorAll('.seg [data-hm]').forEach(function(x){ x.classList.remove('active'); });
    b.classList.add('active'); hideMode=b.dataset.hm;
    $('hideTextWrap').style.display = hideMode==='text'?'block':'none';
    $('hideFileWrap').style.display = hideMode==='text'?'none':'block';
    $('hideFileLabel').textContent = hideMode==='image'?'Select an image to hide':'Select a file to hide';
    updateCapacity();
}); });
$('hideFile').addEventListener('change', function(e){
    const f=e.target.files[0]; if (!f) return; secretFile=f;
    f.arrayBuffer().then(function(buf){
        secretBytes=new Uint8Array(buf);
        $('hideFileInfo').textContent=f.name+' - '+(f.size/1024).toFixed(1)+' KB';
        const prev=$('hidePreview');
        if (f.type.indexOf('image')===0){ prev.src=URL.createObjectURL(f); prev.style.display='block'; } else { prev.style.display='none'; }
        updateCapacity();
    });
});
['hideText','hideCh','hideBits','hidePass'].forEach(function(id){ $(id).addEventListener('input', updateCapacity); });
$('hideCh').addEventListener('change', updateCapacity);
$('hideBits').addEventListener('change', updateCapacity);
document.querySelectorAll('[data-preset]').forEach(function(b){ b.addEventListener('click', function(){
    const p=b.dataset.preset;
    if (p==='stealth'){ $('hideCh').value='0'; $('hideBits').value='1'; }
    else if (p==='balanced'){ $('hideCh').value='3'; $('hideBits').value='1'; }
    else { $('hideCh').value='3'; $('hideBits').value='4'; }
    updateCapacity(); toast('Preset: '+p);
}); });

$('btnHide').addEventListener('click', async function(){
    if (!orig) return toast('Load a cover image first');
    let type, name='', payload;
    if (hideMode==='text'){ const txt=$('hideText').value; if (!txt) return toast('Enter a message to hide'); type=0; payload=new TextEncoder().encode(txt); }
    else { if (!secretBytes) return toast('Choose a file to hide'); type=1; name=secretFile.name; payload=secretBytes; }
    const pw=$('hidePass').value||'';
    const channels=CHMAP[parseInt($('hideCh').value)];
    const bpp=parseInt($('hideBits').value);
    const scatter=$('hideScatter').checked;
    if (scatter && !pw) return toast('Scatter needs a password');
    const btn=$('btnHide');
    try {
        btn.disabled=true; $('hideStatus').textContent='Working...';
        let blob=payload, encrypted=false;
        if (pw){ blob=await encryptBytes(pw, payload); encrypted=true; }
        const container=buildContainer(type, name, blob, encrypted);
        const bits=bytesToBits(container);
        const numPixels=orig.data.length/4;
        let slots=buildSlots(numPixels, channels);
        if (scatter) slots=shuffleSlots(slots, seedFromPw(pw));
        if (bits.length > slots.length*bpp){ $('hideStatus').textContent=''; toast('Payload too large for this image / settings'); btn.disabled=false; return; }
        const data=new Uint8ClampedArray(orig.data);
        embedBits(data, slots, bpp, bits);
        stegoData=new ImageData(data, canvas.width, canvas.height);
        ctx.putImageData(stegoData,0,0); activeTab='hide';
        $('btnSaveStego').disabled=false;
        const psnr=computePSNR(orig.data, stegoData.data);
        $('hideStatus').innerHTML='Hid '+container.length.toLocaleString()+' bytes'+(encrypted?' (encrypted)':'')+(scatter?' (scattered)':'')+' - PSNR '+(psnr===Infinity?'∞':psnr.toFixed(1)+' dB');
        updateCompare(); runSteganalysis(); renderEntropy();
        toast('Data hidden successfully!');
    } catch(err){ $('hideStatus').textContent=''; toast('Error: '+(err&&err.message?err.message:err)); }
    btn.disabled=false;
});
$('btnSaveStego').addEventListener('click', function(){ saveImageData(stegoData, lastFileName+'_stego.png'); });

/* ---------- reveal ---------- */
function revealLegacy(src, channels, bpp){
    const d=src.data, bits=[], maxC=5000;
    for (let i=0;i<d.length;i+=4){ for (let c=0;c<channels.length;c++) for (let b=bpp-1;b>=0;b--) bits.push((d[i+channels[c]]>>b)&1); if (bits.length>maxC*8+16) break; }
    let result='';
    for (let i=0;i<bits.length-7;i+=8){ let code=0; for (let b=0;b<8;b++) code=(code<<1)|bits[i+b]; if (code===0) break; result+=String.fromCharCode(code); if (result.length>=maxC) break; }
    $('revText').value=result||'(no readable text found)'; $('revText').style.display='block'; $('btnRevCopy').style.display='block';
    $('revStatus').textContent = result?('Recovered '+result.length+' chars (raw mode)'):'Nothing found';
    toast(result?'Extracted text':'Nothing found');
}
$('btnReveal').addEventListener('click', async function(){
    if (!orig) return toast('Load an image first');
    const src=stegoData||orig;
    const pw=$('revPass').value||'';
    const channels=CHMAP[parseInt($('revCh').value)];
    const bpp=parseInt($('revBits').value);
    const scatter=$('revScatter').checked;
    $('revText').style.display='none'; $('revPreview').style.display='none'; $('btnRevDownload').style.display='none'; $('btnRevCopy').style.display='none';
    if (scatter && !pw) return toast('Scatter needs the password');
    if ($('revRaw').checked){ return revealLegacy(src, channels, bpp); }
    let slots=buildSlots(src.data.length/4, channels);
    if (scatter) slots=shuffleSlots(slots, seedFromPw(pw));
    const reader=makeReader(src.data, slots, bpp);
    const head=reader.readBytes(7);
    if (!head || head[0]!==MAGIC[0] || head[1]!==MAGIC[1] || head[2]!==MAGIC[2] || head[3]!==MAGIC[3]){
        $('revStatus').textContent='No EncrizeLab payload found. Match the channel / bits / scatter settings, or enable raw text mode.'; toast('No payload found'); return;
    }
    const encrypted=head[4]&1, type=head[5], nameLen=head[6];
    const nameBytes = nameLen ? reader.readBytes(nameLen) : new Uint8Array(0);
    const lenB=reader.readBytes(4); if (!lenB){ toast('Corrupt header'); return; }
    const plen=((lenB[0]<<24)|(lenB[1]<<16)|(lenB[2]<<8)|lenB[3])>>>0;
    if (plen>reader.capacityBytes()){ $('revStatus').textContent='Invalid payload length - wrong settings?'; toast('Wrong settings'); return; }
    const blob=reader.readBytes(plen); if (!blob){ toast('Truncated payload'); return; }
    let payload=blob;
    if (encrypted){
        if (!pw){ $('revStatus').textContent='This payload is encrypted - enter the password.'; toast('Password required'); return; }
        try { payload=await decryptBytes(pw, blob); } catch(e){ $('revStatus').textContent='Wrong password or corrupted data.'; toast('Decryption failed'); return; }
    }
    if (type===0){
        const text=new TextDecoder().decode(payload);
        $('revText').value=text; $('revText').style.display='block'; $('btnRevCopy').style.display='block';
        $('revStatus').textContent='Recovered '+text.length+' characters'+(encrypted?' (decrypted)':'');
        toast('Hidden text revealed!');
    } else {
        const name=new TextDecoder().decode(nameBytes)||'secret.bin';
        revealName=name; revealBlob=new Blob([payload]);
        $('btnRevDownload').style.display='block'; $('btnRevDownload').innerHTML='<i class="fas fa-download"></i> Download '+name;
        const lower=name.toLowerCase(); const exts=['.png','.jpg','.jpeg','.gif','.webp','.bmp','.svg'];
        let isImg=false; for (let i=0;i<exts.length;i++){ if (lower.lastIndexOf(exts[i])===lower.length-exts[i].length && lower.length>=exts[i].length) isImg=true; }
        if (isImg){ $('revPreview').src=URL.createObjectURL(revealBlob); $('revPreview').style.display='block'; }
        $('revStatus').textContent='Recovered file: '+name+' ('+(payload.length/1024).toFixed(1)+' KB)'+(encrypted?' (decrypted)':'');
        toast('Hidden file revealed!');
    }
});
$('btnRevDownload').addEventListener('click', function(){ if (!revealBlob) return; const a=document.createElement('a'); a.href=URL.createObjectURL(revealBlob); a.download=revealName; a.click(); });
$('btnRevCopy').addEventListener('click', function(){ const v=$('revText').value; if (!v) return; if (navigator.clipboard){ navigator.clipboard.writeText(v).then(function(){ toast('Copied!'); }).catch(function(){ toast('Copy failed'); }); } });

/* ---------- save / diff / reset ---------- */
function saveCurrentView(){ const t=document.createElement('canvas'); t.width=canvas.width; t.height=canvas.height; t.getContext('2d').drawImage(canvas,0,0); const a=document.createElement('a'); a.download='stego_'+activeTab+'_'+Date.now()+'.png'; a.href=t.toDataURL('image/png'); a.click(); toast('Saved!'); }
function saveImageData(data, name){ if (!data) return toast('Nothing to save'); const t=document.createElement('canvas'); t.width=canvas.width; t.height=canvas.height; t.getContext('2d').putImageData(data,0,0); const a=document.createElement('a'); a.download=name; a.href=t.toDataURL('image/png'); a.click(); toast('Saved!'); }
$('btnSaveBit').addEventListener('click', saveCurrentView);
$('btnOrigView').addEventListener('click', function(){ if (orig){ ctx.putImageData(orig,0,0); updateLabel(); } });
$('btnSaveRgb').addEventListener('click', saveCurrentView);
$('btnSaveCurrent').addEventListener('click', saveCurrentView);
$('btnSaveOrig').addEventListener('click', function(){ saveImageData(orig, lastFileName+'_original.png'); });
$('btnShowDiff').addEventListener('click', function(){ renderDiff(25); });
$('btnHideDiff').addEventListener('click', function(){ if (orig) updateCanvas(); });
$('btnReset').addEventListener('click', function(){
    if (!orig) return;
    stegoData=null; ctx.putImageData(orig,0,0); activeTab='bitplane'; updateLabel();
    $('hideText').value=''; $('hideStatus').textContent=''; $('btnSaveStego').disabled=true;
    secretFile=null; secretBytes=null; $('hideFileInfo').textContent=''; $('hidePreview').style.display='none'; $('hideFile').value='';
    $('revText').value=''; $('revStatus').textContent=''; $('revText').style.display='none'; $('revPreview').style.display='none'; $('btnRevDownload').style.display='none'; $('btnRevCopy').style.display='none';
    revealBlob=null;
    updateCompare(); runSteganalysis(); renderEntropy(); renderAnalysis(); updateCapacity();
    toast('Reset complete');
});

})();
