(function(){
        var pass=document.getElementById('ps-pass'),bar=document.getElementById('ps-bar'),label=document.getElementById('ps-label');
        var common=['password','123456','123456789','12345678','12345','qwerty','111111','1234567','abc123','password1','iloveyou','admin','welcome','monkey','dragon','letmein','football','000000','qwerty123','sunshine','princess','login','master','hello','freedom','whatever','qazwsx','trustno1'];
        var COLORS=['#d11','#e8590c','#f08c00','#18a558','#0b8043'];
        var LABELS=['Very weak','Weak','Fair','Strong','Very strong'];
        function fmtTime(sec){
            if(sec<1)return 'instantly';
            var u=[['second',60],['minute',60],['hour',24],['day',365],['year',1e9]];
            var v=sec;
            for(var i=0;i<u.length;i++){if(v<u[i][1]||i===u.length-1){var n=Math.round(v);return n.toLocaleString()+' '+u[i][0]+(n!==1?'s':'');}v=v/u[i][1];}
            return 'centuries';
        }
        function analyze(p){
            var pool=0;
            if(/[a-z]/.test(p))pool+=26;
            if(/[A-Z]/.test(p))pool+=26;
            if(/[0-9]/.test(p))pool+=10;
            if(/[^A-Za-z0-9]/.test(p))pool+=33;
            var perChar=Math.log2(pool||1);
            var lp=p.toLowerCase();
            var walks=['qwertyuiop','asdfghjkl','zxcvbnm','1234567890','abcdefghijklmnopqrstuvwxyz'];
            var seqs=[];
            walks.forEach(function(w){seqs.push(w);seqs.push(w.split('').reverse().join(''));});
            function inRun(sub){
                if(sub.length<3)return false;
                for(var k=0;k<seqs.length;k++){if(seqs[k].indexOf(sub)>-1)return true;}
                return false;
            }
            var entropy=0,i=0,n=p.length,seqFound=false;
            while(i<n){
                var bestLen=0;
                for(var len=Math.min(n-i,12);len>=3;len--){if(inRun(lp.substr(i,len))){bestLen=len;break;}}
                var rep=1;while(i+rep<n&&lp.charAt(i+rep)===lp.charAt(i))rep++;
                if(bestLen>=3&&bestLen>=rep){entropy+=Math.log2(seqs.length)+Math.log2(bestLen);i+=bestLen;seqFound=true;}
                else if(rep>=3){entropy+=Math.log2(26)+Math.log2(rep);i+=rep;seqFound=true;}
                else{entropy+=perChar;i+=1;}
            }
            entropy=Math.round(entropy);
            var isCommon=common.indexOf(lp)>-1;
            if(isCommon)entropy=Math.min(entropy,10);
            var seq=seqFound;
            var guesses=Math.pow(2,entropy);
            var crack=guesses/2/1e10; // 10 billion guesses/sec offline
            var score;
            if(entropy<28)score=0;else if(entropy<40)score=1;else if(entropy<60)score=2;else if(entropy<90)score=3;else score=4;
            return {pool:pool,entropy:entropy,crack:crack,score:score,isCommon:isCommon,seq:seq};
        }
        function check(ok,txtOk,txtNo){return '<li><i class="fas '+(ok?'fa-circle-check ps-ok':'fa-circle ps-no')+'"></i> '+(ok?txtOk:txtNo)+'</li>';}
        function update(){
            var p=pass.value,a=analyze(p);
            document.getElementById('ps-entropy').textContent=a.entropy;
            document.getElementById('ps-len').textContent=p.length;
            document.getElementById('ps-crack').textContent=p?fmtTime(a.crack):'—';
            bar.style.width=p?((a.score+1)*20)+'%':'0';
            bar.style.background=COLORS[a.score];
            label.textContent=p?LABELS[a.score]:'Awaiting input';
            label.style.color=p?COLORS[a.score]:'var(--clr-muted)';
            var c=document.getElementById('ps-checks');
            c.innerHTML=check(p.length>=12,'At least 12 characters','Use 12+ characters')+
                check(/[a-z]/.test(p)&&/[A-Z]/.test(p),'Mixed upper & lower case','Mix upper & lower case')+
                check(/[0-9]/.test(p),'Contains numbers','Add some numbers')+
                check(/[^A-Za-z0-9]/.test(p),'Contains symbols','Add symbols (!@#$…)')+
                check(p.length>0&&!a.isCommon,'Not a common password','This is a very common password')+
                check(p.length>0&&!a.seq,'No obvious sequences','Avoid sequences like 1234 / aaaa');
            var tips=[];
            if(p&&p.length<12)tips.push('Make it longer — length beats complexity.');
            if(p&&!/[^A-Za-z0-9]/.test(p))tips.push('Add symbols to widen the character set.');
            if(a.isCommon)tips.push('Never use a password from common lists.');
            if(a.seq)tips.push('Avoid repeated characters and keyboard sequences.');
            if(p&&a.score>=4)tips.push('Great password! Consider a password manager to store it.');
            var tipsEl=document.getElementById('ps-tips'),list=document.getElementById('ps-tip-list');
            if(tips.length&&p){tipsEl.hidden=false;list.innerHTML=tips.map(function(t){return '<li>'+t+'</li>';}).join('');}else{tipsEl.hidden=true;}
        }
        pass.addEventListener('input',update);
        document.getElementById('ps-toggle').addEventListener('click',function(){
            var t=this.querySelector('i');
            if(pass.type==='password'){pass.type='text';t.className='fas fa-eye-slash';this.setAttribute('aria-label','Hide password');}
            else{pass.type='password';t.className='fas fa-eye';this.setAttribute('aria-label','Show password');}
        });
        update();
    })();
