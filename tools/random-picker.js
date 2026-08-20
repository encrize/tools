(function(){
        function rnd(){if(window.crypto&&crypto.getRandomValues){var u=new Uint32Array(1);crypto.getRandomValues(u);return u[0]/4294967296;}return Math.random();}
        function randInt(min,max){return Math.floor(rnd()*(max-min+1))+min;}
        function shuffle(a){for(var i=a.length-1;i>0;i--){var j=randInt(0,i);var t=a[i];a[i]=a[j];a[j]=t;}return a;}
        var el=function(id){return document.getElementById(id);};

        // tabs
        document.querySelectorAll('.rp-tab').forEach(function(t){t.addEventListener('click',function(){
            document.querySelectorAll('.rp-tab').forEach(function(x){x.classList.remove('active');});
            document.querySelectorAll('.rp-panel').forEach(function(x){x.classList.remove('active');});
            t.classList.add('active');el('panel-'+t.dataset.tab).classList.add('active');
        });});

        // dice
        el('dice-roll').addEventListener('click',function(){
            var sides=+el('dice-type').value,count=Math.min(12,Math.max(1,+el('dice-count').value||1));
            var out=el('dice-out');out.innerHTML='';var sum=0;
            for(var i=0;i<count;i++){var v=randInt(1,sides);sum+=v;var d=document.createElement('div');d.className='rp-die spin';d.textContent=v;out.appendChild(d);}
            el('dice-sum').textContent=count>1?('Total: '+sum):'';
        });

        // coin
        var heads=0,tails=0;
        el('coin-flip').addEventListener('click',function(){
            var h=rnd()<0.5;if(h)heads++;else tails++;
            var icon=el('coin-icon');icon.className='rp-coin spin';
            icon.innerHTML=h?'<i class="fas fa-circle"></i>':'<i class="far fa-circle"></i>';
            el('coin-out').textContent=h?'HEADS':'TAILS';
            el('coin-tally').textContent='Heads: '+heads+' · Tails: '+tails;
            setTimeout(function(){icon.className='rp-coin';},500);
        });

        // name picker
        function names(){return el('rp-names').value.split('\n').map(function(s){return s.trim();}).filter(Boolean);}
        function showNames(arr,target){var o=el(target);o.innerHTML='';if(!arr.length){o.innerHTML='<span class="rp-sub">Nothing to show</span>';return;}arr.forEach(function(n){var c=document.createElement('span');c.className='rp-chip';c.textContent=n;o.appendChild(c);});}
        el('name-pick').addEventListener('click',function(){
            var list=names();if(!list.length){window.EncrizeLab.toast('Add some names first.','error');return;}
            var k=Math.max(1,+el('name-count').value||1);var res;
            if(el('name-unique').checked){res=shuffle(list.slice()).slice(0,Math.min(k,list.length));}
            else{res=[];for(var i=0;i<k;i++){res.push(list[randInt(0,list.length-1)]);}}
            showNames(res,'name-out');
        });
        el('name-shuffle').addEventListener('click',function(){var list=names();if(!list.length){window.EncrizeLab.toast('Add some names first.','error');return;}showNames(shuffle(list.slice()),'name-out');});

        // numbers
        var lastNums=[];
        el('num-gen').addEventListener('click',function(){
            var min=parseInt(el('num-min').value,10),max=parseInt(el('num-max').value,10),k=Math.max(1,+el('num-count').value||1);
            if(isNaN(min)||isNaN(max)){window.EncrizeLab.toast('Enter a valid range.','error');return;}
            if(min>max){var t=min;min=max;max=t;}
            var unique=el('num-unique').checked,res=[];
            if(unique){
                var range=max-min+1;if(k>range){window.EncrizeLab.toast('Range too small for that many unique numbers.','error');return;}
                var pool=[];for(var n=min;n<=max;n++)pool.push(n);res=shuffle(pool).slice(0,k);
            }else{for(var i=0;i<k;i++)res.push(randInt(min,max));}
            if(el('num-sort').checked)res.sort(function(a,b){return a-b;});
            lastNums=res;showNames(res.map(String),'num-out');el('num-copy').hidden=res.length<2;
        });
        el('num-copy').addEventListener('click',function(){window.EncrizeLab.copy(lastNums.join(', '),'Numbers copied!');});
    })();
