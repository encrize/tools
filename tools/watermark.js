(function(){
        var drop=document.getElementById('wm-drop'),file=document.getElementById('wm-file'),
            editor=document.getElementById('wm-editor'),canvas=document.getElementById('wm-canvas'),
            ctx=canvas.getContext('2d');
        var baseImg=null,pos='br';
        var el=function(id){return document.getElementById(id);};
        function load(f){
            if(!f||!/^image\//.test(f.type)){window.EncrizeLab.toast('Please choose an image file.','error');return;}
            var r=new FileReader();
            r.onload=function(e){var im=new Image();im.onload=function(){baseImg=im;canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;editor.hidden=false;draw();window.EncrizeLab.toast('Image loaded — customise your watermark.','success');};im.src=e.target.result;};
            r.readAsDataURL(f);
        }
        function draw(){
            if(!baseImg)return;
            var w=canvas.width,h=canvas.height;
            ctx.clearRect(0,0,w,h);
            ctx.drawImage(baseImg,0,0,w,h);
            var text=el('wm-text').value||'';
            if(!text)return;
            var fontPx=Math.max(8,Math.round(w*(+el('wm-size').value)/100));
            ctx.font='bold '+fontPx+'px '+el('wm-font').value;
            ctx.fillStyle=el('wm-color').value;
            ctx.globalAlpha=(+el('wm-op').value)/100;
            ctx.textBaseline='middle';
            var rot=(+el('wm-rot').value)*Math.PI/180;
            var lineW=Math.max(1,fontPx/14);
            function stamp(cx,cy,align){
                ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.textAlign=align;
                if(el('wm-stroke').checked){ctx.lineWidth=lineW;ctx.strokeStyle='rgba(0,0,0,0.55)';ctx.strokeText(text,0,0);}
                ctx.fillText(text,0,0);ctx.restore();
            }
            if(el('wm-tile').checked){
                var tw=ctx.measureText(text).width+fontPx*1.5;var th=fontPx*2.6;
                for(var y=th/2;y<h+th;y+=th){for(var x=0;x<w+tw;x+=tw){stamp(x,y,'left');}}
            }else{
                var m=fontPx*0.8;var tw2=ctx.measureText(text).width;
                var x,y,align='center';
                var left=m+tw2/2,cxm=w/2,right=w-m-tw2/2;
                var top=m+fontPx/2,cym=h/2,bot=h-m-fontPx/2;
                var map={tl:[left,top],tc:[cxm,top],tr:[right,top],ml:[left,cym],c:[cxm,cym],mr:[right,cym],bl:[left,bot],bc:[cxm,bot],br:[right,bot]};
                x=map[pos][0];y=map[pos][1];stamp(x,y,align);
            }
            ctx.globalAlpha=1;
        }
        function download(type,ext,q){
            if(!baseImg)return;
            var url=canvas.toDataURL(type,q);
            var a=document.createElement('a');a.href=url;a.download='watermarked.'+ext;document.body.appendChild(a);a.click();a.remove();
        }
        drop.addEventListener('click',function(){file.click();});
        drop.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();file.click();}});
        file.addEventListener('change',function(e){load(e.target.files[0]);});
        ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('dragover');});});
        ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('dragover');});});
        drop.addEventListener('drop',function(e){if(e.dataTransfer.files.length)load(e.dataTransfer.files[0]);});
        ['wm-text','wm-font','wm-size','wm-op','wm-rot','wm-color','wm-stroke','wm-tile'].forEach(function(id){el(id).addEventListener('input',draw);});
        el('wm-size').addEventListener('input',function(){el('wm-size-val').textContent=el('wm-size').value+'%';});
        el('wm-op').addEventListener('input',function(){el('wm-op-val').textContent=el('wm-op').value+'%';});
        el('wm-rot').addEventListener('input',function(){el('wm-rot-val').textContent=el('wm-rot').value+'°';});
        document.querySelectorAll('.wm-pos').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('.wm-pos').forEach(function(x){x.classList.remove('active');});b.classList.add('active');pos=b.dataset.pos;draw();});});
        el('wm-dl-png').addEventListener('click',function(){download('image/png','png');});
        el('wm-dl-jpg').addEventListener('click',function(){download('image/jpeg','jpg',0.92);});
        el('wm-reset').addEventListener('click',function(){editor.hidden=true;file.value='';baseImg=null;});
    })();
