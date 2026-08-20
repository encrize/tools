(function(){
        var input=document.getElementById('md-input'),prev=document.getElementById('md-prev');
        var sample='# Welcome to the Markdown Editor\n\nType on the **left**, preview on the *right*.\n\n## Features\n\n- Live preview as you type\n- Headings, **bold**, *italic*, ~~strike~~\n- `inline code` and fenced blocks\n- Lists, quotes, links & images\n\n> Everything runs locally in your browser.\n\n```js\nconsole.log("Hello, EncrizeLab!");\n```\n\n| Tool | Private |\n| --- | --- |\n| Markdown Editor | Yes |\n\n[Back to EncrizeLab](../index.html)';

        function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
        function mdRender(src){
            src=src.replace(/\r\n?/g,"\n");
            var cb=[];
            src=src.replace(/```([^\n`]*)\n([\s\S]*?)```/g,function(m,lang,code){cb.push(code.replace(/\n$/,""));return "\u0000CB"+(cb.length-1)+"\u0000";});
            function inlineFmt(t){
                var codes=[];
                t=t.replace(/`([^`]+)`/g,function(m,c){codes.push(c);return "\u0001IC"+(codes.length-1)+"\u0001";});
                t=esc(t);
                t=t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,'<img src="$2" alt="$1">');
                t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
                t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
                t=t.replace(/__([^_]+)__/g,"<strong>$1</strong>");
                t=t.replace(/\*([^*]+)\*/g,"<em>$1</em>");
                t=t.replace(/~~([^~]+)~~/g,"<del>$1</del>");
                t=t.replace(/\u0001IC(\d+)\u0001/g,function(m,i){return "<code>"+esc(codes[+i])+"</code>";});
                return t;
            }
            var lines=src.split("\n"),out=[],i=0,para=[];
            function flush(){if(para.length){out.push("<p>"+inlineFmt(para.join(" "))+"</p>");para=[];}}
            while(i<lines.length){
                var line=lines[i];
                if(/^\u0000CB\d+\u0000$/.test(line.trim())){flush();var idx=+line.trim().match(/\d+/)[0];out.push('<pre><code>'+esc(cb[idx])+'</code></pre>');i++;continue;}
                if(/^\s*$/.test(line)){flush();i++;continue;}
                var h=line.match(/^(#{1,6})\s+(.*)$/);
                if(h){flush();var lv=h[1].length;out.push("<h"+lv+">"+inlineFmt(h[2])+"</h"+lv+">");i++;continue;}
                if(/^\s*(---|\*\*\*|___)\s*$/.test(line)){flush();out.push("<hr>");i++;continue;}
                if(/^\s*>/.test(line)){flush();var bq=[];while(i<lines.length&&/^\s*>/.test(lines[i])){bq.push(lines[i].replace(/^\s*>\s?/,""));i++;}out.push("<blockquote>"+inlineFmt(bq.join(" "))+"</blockquote>");continue;}
                if(/^\s*[-*+]\s+/.test(line)){flush();var it=[];while(i<lines.length&&/^\s*[-*+]\s+/.test(lines[i])){it.push("<li>"+inlineFmt(lines[i].replace(/^\s*[-*+]\s+/,""))+"</li>");i++;}out.push("<ul>"+it.join("")+"</ul>");continue;}
                if(/^\s*\d+\.\s+/.test(line)){flush();var io=[];while(i<lines.length&&/^\s*\d+\.\s+/.test(lines[i])){io.push("<li>"+inlineFmt(lines[i].replace(/^\s*\d+\.\s+/,""))+"</li>");i++;}out.push("<ol>"+io.join("")+"</ol>");continue;}
                if(line.indexOf("|")>-1 && i+1<lines.length && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i+1])){
                    flush();
                    var cells=function(r){return r.replace(/^\s*\|/,"").replace(/\|\s*$/,"").split("|").map(function(c){return c.trim();});};
                    var head=cells(line);i+=2;var rows=[];
                    while(i<lines.length&&lines[i].indexOf("|")>-1&&lines[i].trim()!==""){rows.push(cells(lines[i]));i++;}
                    var th="<tr>"+head.map(function(c){return "<th>"+inlineFmt(c)+"</th>";}).join("")+"</tr>";
                    var tb=rows.map(function(r){return "<tr>"+r.map(function(c){return "<td>"+inlineFmt(c)+"</td>";}).join("")+"</tr>";}).join("");
                    out.push('<table class="md-table">'+th+tb+"</table>");continue;
                }
                para.push(line);i++;
            }
            flush();
            return out.join("\n");
        }
        function update(){
            prev.innerHTML=mdRender(input.value);
            var text=input.value.trim();
            var words=text?text.split(/\s+/).length:0;
            document.getElementById('md-words').textContent=words;
            document.getElementById('md-chars').textContent=input.value.length;
            document.getElementById('md-lines').textContent=input.value?input.value.split("\n").length:0;
            document.getElementById('md-read').textContent=Math.max(1,Math.round(words/200))+' min';
        }
        function surround(before,after){
            var s=input.selectionStart,e=input.selectionEnd,v=input.value;
            var sel=v.slice(s,e)||'text';
            input.value=v.slice(0,s)+before+sel+after+v.slice(e);
            input.focus();input.selectionStart=s+before.length;input.selectionEnd=s+before.length+sel.length;
            update();
        }
        function linePrefix(pfx){
            var s=input.selectionStart,v=input.value;
            var ls=v.lastIndexOf("\n",s-1)+1;
            input.value=v.slice(0,ls)+pfx+v.slice(ls);
            input.focus();update();
        }
        var actions={
            bold:function(){surround('**','**');},
            italic:function(){surround('*','*');},
            strike:function(){surround('~~','~~');},
            code:function(){surround('`','`');},
            h1:function(){linePrefix('# ');},
            h2:function(){linePrefix('## ');},
            ul:function(){linePrefix('- ');},
            ol:function(){linePrefix('1. ');},
            quote:function(){linePrefix('> ');},
            link:function(){surround('[','](https://)');},
            img:function(){surround('![',' ](https://)');},
            hr:function(){var s=input.selectionStart,v=input.value;input.value=v.slice(0,s)+'\n\n---\n\n'+v.slice(s);input.focus();update();}
        };
        document.querySelectorAll('.md-toolbar button').forEach(function(b){b.addEventListener('click',function(){actions[b.dataset.md]&&actions[b.dataset.md]();});});
        input.addEventListener('input',update);
        document.getElementById('md-copy-html').addEventListener('click',function(){window.EncrizeLab.copy(mdRender(input.value),'HTML copied!');});
        document.getElementById('md-copy-md').addEventListener('click',function(){window.EncrizeLab.copy(input.value,'Markdown copied!');});
        function dl(content,name,type){var blob=new Blob([content],{type:type});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);}
        document.getElementById('md-dl-md').addEventListener('click',function(){dl(input.value,'document.md','text/markdown');});
        document.getElementById('md-dl-html').addEventListener('click',function(){var doc='<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>Document</title></head>\n<body>\n'+mdRender(input.value)+'\n</body></html>';dl(doc,'document.html','text/html');});
        document.getElementById('md-clear').addEventListener('click',function(){input.value='';update();input.focus();});
        input.value=sample;update();
    })();
