(function(){
        var drop=document.getElementById('ib-drop'),
            file=document.getElementById('ib-file'),
            result=document.getElementById('ib-result'),
            img=document.getElementById('ib-img'),
            metaEl=document.getElementById('ib-meta'),
            out=document.getElementById('ib-out'),
            tabs=document.querySelectorAll('.gl-tab');
        var state={dataUri:'',mime:'',name:'',bytes:0};
        var fmt='datauri';

        function fmtBytes(n){
            if(n<1024) return n+' B';
            if(n<1048576) return (n/1024).toFixed(1)+' KB';
            return (n/1048576).toFixed(2)+' MB';
        }
        function render(){
            var raw=state.dataUri.split(',')[1]||'';
            if(fmt==='datauri') out.value=state.dataUri;
            else if(fmt==='raw') out.value=raw;
            else if(fmt==='css') out.value='background-image: url("'+state.dataUri+'");';
            else out.value='<img src="'+state.dataUri+'" alt="">';
        }
        function load(f){
            if(!f){return;}
            if(!/^image\//.test(f.type)){window.EncrizeLab.toast('Please choose an image file.','error');return;}
            var r=new FileReader();
            r.onload=function(e){
                state.dataUri=e.target.result;
                state.mime=f.type||'image/*';
                state.name=f.name||'image';
                state.bytes=f.size||0;
                img.src=state.dataUri;
                var b64=(state.dataUri.split(',')[1]||'').length;
                img.onload=function(){
                    metaEl.innerHTML='';
                    var rows=[['File name',state.name],['Type',state.mime],['Dimensions',img.naturalWidth+' x '+img.naturalHeight+' px'],['Original size',fmtBytes(state.bytes)],['Base64 size',fmtBytes(b64)]];
                    rows.forEach(function(row){var li=document.createElement('li');li.innerHTML='<span>'+row[0]+'</span><strong>'+row[1]+'</strong>';metaEl.appendChild(li);});
                };
                result.hidden=false;
                render();
                window.EncrizeLab.toast('Image encoded!','success');
            };
            r.onerror=function(){window.EncrizeLab.toast('Could not read that file.','error');};
            r.readAsDataURL(f);
        }
        drop.addEventListener('click',function(){file.click();});
        drop.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();file.click();}});
        file.addEventListener('change',function(e){load(e.target.files[0]);});
        ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('dragover');});});
        ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('dragover');});});
        drop.addEventListener('drop',function(e){if(e.dataTransfer.files.length)load(e.dataTransfer.files[0]);});
        document.addEventListener('paste',function(e){var items=e.clipboardData&&e.clipboardData.files;if(items&&items.length)load(items[0]);});
        tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(x){x.classList.remove('active');});t.classList.add('active');fmt=t.dataset.fmt;render();});});
        document.getElementById('ib-copy').addEventListener('click',function(){if(!out.value){return;}window.EncrizeLab.copy(out.value,'Copied to clipboard!');});
        document.getElementById('ib-dl').addEventListener('click',function(){
            if(!out.value)return;
            var blob=new Blob([out.value],{type:'text/plain'});
            var a=document.createElement('a');a.href=URL.createObjectURL(blob);
            a.download=(state.name.replace(/\.[^.]+$/,'')||'image')+'-base64.txt';
            document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);
        });
        document.getElementById('ib-reset').addEventListener('click',function(){result.hidden=true;file.value='';state={dataUri:'',mime:'',name:'',bytes:0};});
    })();
