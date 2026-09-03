const $ = (sel)=>document.querySelector(sel);
    const dropzone = $('#dropzone');
    const fileInput = $('#fileInput');
    const chooseBtn = $('#chooseBtn');
    const filesList = $('#filesList');
    const messages = $('#messages');
    const input = $('#input');
    const sendBtn = $('#sendBtn');
    const attachBtn = $('#attachBtn');
    const clearBtn = $('#clearBtn');

    const queuedFiles = [];

    function renderFiles(){
      filesList.innerHTML='';
      queuedFiles.forEach((f, idx)=>{
        const el = document.createElement('div'); el.className='file-item';
        el.innerHTML = `
          <div style="flex:1;min-width:0">
            <div style="display:flex;gap:8px;align-items:center">
              <strong style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.file.name}</strong>
              <span class="small">(${formatBytes(f.file.size)})</span>
            </div>
            <div class="progress"><i style="width:${f.progress||0}%"></i></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            <button class="btn" data-idx="${idx}">上传</button>
            <button class="btn" data-rem="${idx}">移除</button>
          </div>
        `;
        filesList.appendChild(el);
      });
    }

    ['dragenter','dragover'].forEach(ev=>{
      dropzone.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();dropzone.classList.add('dragover')});
    });
    ['dragleave','drop'].forEach(ev=>{
      dropzone.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();dropzone.classList.remove('dragover')});
    });
    dropzone.addEventListener('drop',e=>{
      const dt = e.dataTransfer; if(!dt) return;
      const files = Array.from(dt.files || []);
      addFiles(files);
    });

    chooseBtn.addEventListener('click',()=>fileInput.click());
    fileInput.addEventListener('change',e=>{
      const files = Array.from(e.target.files || []);
      addFiles(files);
      fileInput.value = '';
    });

    function addFiles(files){
      files.forEach(f=>{ queuedFiles.push({file:f,progress:0,status:'idle'}); });
      renderFiles();
    }

    filesList.addEventListener('click',e=>{
      const btn = e.target.closest('button'); if(!btn) return;
      if(btn.hasAttribute('data-idx')){
        const idx = Number(btn.getAttribute('data-idx'));
        fakeUpload(idx);
      }else if(btn.hasAttribute('data-rem')){
        const idx = Number(btn.getAttribute('data-rem'));
        queuedFiles.splice(idx,1); renderFiles();
      }
    });

    clearBtn.addEventListener('click',()=>{queuedFiles.length=0;renderFiles();});

    function fakeUpload(idx){
      const item = queuedFiles[idx]; if(!item) return;
      if(item.status==='uploading'||item.status==='done') return;
      item.status='uploading';
      let progress=0;
      const iv = setInterval(()=>{
        progress+=20;
        if(progress>=100){
          progress=100; clearInterval(iv);
          item.status='done';
          addMessage('ai', `个案数据文件 ${item.file.name} 上传成功，正在对比数据库分析中…`);
          showAnalysisProgress();
        }
        item.progress=progress; renderFiles();
      },300);
    }

    attachBtn.addEventListener('click', ()=>{
      if(queuedFiles.length===0){ addMessage('system','当前没有排队文件'); return; }
      queuedFiles.forEach((_,i)=>fakeUpload(i));
    });

    sendBtn.addEventListener('click', sendMessageFromInput);
    input.addEventListener('keydown', e=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessageFromInput(); }
    });

    function sendMessageFromInput(){
      const text=input.value.trim(); if(!text) return; input.value=''; addMessage('user', text); simulateAiReply(text);
    }

    function simulateAiReply(userText){
      const reply=`模拟回复：收到您的消息（长度 ${userText.length} 字符）。`;
      addMessage('ai', reply);
    }

    function addMessage(type, text){
      const el=document.createElement('div');
      el.className='msg '+(type==='user'?'user':type==='ai'?'ai':'');
      const bubble=document.createElement('div');
      bubble.className='bubble';
      bubble.textContent=text;
      el.appendChild(bubble);
      messages.appendChild(el);
      messages.scrollTop=messages.scrollHeight;
      return el;
    }

    function addCardMessage(){
      const el=document.createElement('div');
      el.className='msg ai';
      const card=document.createElement('div');
      card.className='card';
      card.innerHTML='<p>分析报告已生成，点击查看</p>';
      card.addEventListener('click',()=>{
        window.location.href='report.html';
      });
      el.appendChild(card);
      messages.appendChild(el);
      messages.scrollTop=messages.scrollHeight;
    }

    function showAnalysisProgress(){
      const el=document.createElement('div');
      el.className='msg ai';
      const bar=document.createElement('div');
      bar.className='loading-bar';
      const inner=document.createElement('i');
      bar.appendChild(inner);
      el.appendChild(bar);
      messages.appendChild(el);
      messages.scrollTop=messages.scrollHeight;

      let progress=0;
      const iv=setInterval(()=>{
        progress+=10;
        inner.style.width=progress+'%';
        if(progress>=100){ clearInterval(iv); setTimeout(()=>{ addCardMessage(); },500); }
      },300);
    }

    function formatBytes(bytes){ if(bytes===0) return '0 B'; const k=1024; const sizes=['B','KB','MB','GB','TB']; const i=Math.floor(Math.log(bytes)/Math.log(k)); return parseFloat((bytes/Math.pow(k,i)).toFixed(2))+' '+sizes[i]; }

    addMessage('ai','你好！这是一个演示的 AI 聊天界面。你可以拖拽文件到左侧区域，点击上传，会显示假上传效果，并提示“个案数据文件上传成功，正在对比数据库分析中”，随后显示分析进度条，3秒后出现一个“分析报告已生成，点击查看”的卡片。');
  