(function(ns) {
  'use strict';
  // Separación relativa a la palma: acercar la mano a la cámara no equivale a zoom.
  class GestureZoom {
    constructor(){this.reset();}
    reset(){this.active=false;this.since=null;this.previous=null;this.center=null;this.lastTime=null;this.requested=false;this.rotateSince=null;this.rotateX=null;this.rotateY=null;}
    take(){this.reset();this.requested=true;}
    update(hands, aspect, time) {
      if(hands.length!==1){this.reset();return {message:hands.length?'Mostrá una sola mano.':'Buscando una mano…',delta:0};}
      const p=hands[0];
      if(p.length!==21||p.some(v=>!Number.isFinite(v.x)||!Number.isFinite(v.y))){this.reset();return {message:'Mostrá la mano completa.',delta:0};}
      const dist=(a,b)=>Math.hypot((p[a].x-p[b].x)*aspect,p[a].y-p[b].y);
      const palm=dist(0,9);
      if(p.length!==21||!Number.isFinite(palm)||palm<0.04){this.reset();return {message:'Mostrá la mano completa.',delta:0};}
      const center={x:p[9].x*aspect,y:p[9].y};
      if(this.lastTime!==null&&(time-this.lastTime>2000||Math.hypot(center.x-this.center.x,center.y-this.center.y)>palm*1.2))this.reset();
      this.lastTime=time;this.center=center;
      const fist=[8,12,16,20].every(i=>dist(0,i)<dist(0,i-2)*1.12);
      if(fist){this.reset();return {message:'Mano cerrada · control suelto.',delta:0};}
      const aperture=dist(4,8)/palm;
      if(!this.active){
        if(this.requested){this.active=true;this.previous=aperture;this.requested=false;}
        else if(aperture<0.48){
          if(this.since===null)this.since=time;
          if(time-this.since>=150){this.active=true;this.previous=aperture;}
        }else this.since=null;
        if(this.active){this.rotateSince=null;this.rotateX=null;this.rotateY=null;return {message:'Zoom tomado · separá los dedos.',delta:0};}
        const open=aperture>0.65&&[8,12,16,20].every(i=>dist(0,i)>dist(0,i-2)*1.15);
        if(open){
          if(this.rotateSince===null){this.rotateSince=time;this.rotateX=p[9].x;this.rotateY=p[9].y;}
          if(time-this.rotateSince>=200){
            const dx=p[9].x-this.rotateX, dy=p[9].y-this.rotateY;
            // Cámara en espejo: sigue el desplazamiento visible, igual que arrastrar con mouse.
            const rotation=Math.abs(dx)>0.006?Math.max(-6,Math.min(6,dx*180)):0;
            const rotationY=Math.abs(dy)>0.006?Math.max(-6,Math.min(6,dy*180)):0;
            if(rotation)this.rotateX=p[9].x;
            if(rotationY)this.rotateY=p[9].y;
            return {message:'Giro libre · mové la mano arriba, abajo o a los lados.',delta:0,rotation,rotationY};
          }
          this.rotateX=p[9].x;this.rotateY=p[9].y;
          return {message:'Mano abierta · mantenela un instante para girar.',delta:0};
        }
        this.rotateSince=null;this.rotateX=null;this.rotateY=null;
        return {message:'Abrí la mano para girar o juntá pulgar e índice para zoom.',delta:0};
      }
      const change=aperture-this.previous;
      // Zona muerta acumulativa y límite por fotograma para evitar temblores y saltos.
      const delta=Math.abs(change)>0.025?Math.max(-0.09,Math.min(0.09,change*0.65)):0;
      if(delta)this.previous=aperture;
      return {message:'Zoom tomado · cerrá la mano para soltar.',delta};
    }
  }
  ns.GestureZoom=GestureZoom;
  ns.initGestures=function(app){
    const $=id=>document.getElementById(id), button=$('gestures-toggle'), video=$('gesture-video'), state=$('gesture-state');
    const control=new GestureZoom();
    const overlay=$('gesture-overlay'), pen=overlay.getContext('2d');
    function draw(hands){pen.clearRect(0,0,overlay.width,overlay.height);for(const hand of hands){pen.fillStyle='#d4ff85';for(const p of hand){pen.beginPath();pen.arc(p.x*overlay.width,p.y*overlay.height,4,0,Math.PI*2);pen.fill();}pen.strokeStyle='#d4ff85';pen.lineWidth=3;pen.beginPath();pen.moveTo(hand[4].x*overlay.width,hand[4].y*overlay.height);pen.lineTo(hand[8].x*overlay.width,hand[8].y*overlay.height);pen.stroke();}}
    let generation=0,stream=null,worker=null,raf=0,timer=0,busy=false,enabled=false,last=0,lastVideo=-1;
    const tell=text=>{if(state.textContent!==text)state.textContent=text;};
    function stop(message='Gestos desactivados · cámara apagada.'){
      generation++;enabled=false;cancelAnimationFrame(raf);clearTimeout(timer);
      worker?.terminate();worker=null;stream?.getTracks().forEach(t=>t.stop());stream=null;
      video.pause();video.srcObject=null;control.reset();busy=false;draw([]);$('gesture-take').disabled=true;
      $('gesture-panel').querySelector('details').open=false;
      button.textContent='Activar gestos';button.setAttribute('aria-pressed','false');tell(message);
    }
    async function start(){
      if(!app.globe){tell('El globo no está disponible.');return;}
      $('gesture-panel').hidden=false;$('gesture-panel').querySelector('details').open=true;
      if(location.protocol==='file:'||!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){tell('Abrí INICIAR-CON-VOZ.cmd para usar la cámara en el servidor local.');return;}
      enabled=true;const token=++generation;last=0;lastVideo=-1;
      button.textContent='Detener gestos';button.setAttribute('aria-pressed','true');tell('Permití la cámara para usar gestos.');
      try{
        const media=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480},facingMode:'user'},audio:false});
        if(token!==generation){media.getTracks().forEach(t=>t.stop());return;}
        stream=media;stream.getVideoTracks().forEach(t=>t.addEventListener('ended',()=>{if(token===generation)stop('La cámara se desconectó. Volvé a activar gestos.');}));
        video.srcObject=stream;await video.play();if(token!==generation)return;
        tell('Cargando detector local de manos…');
        worker=new Worker(new URL('js/gestos-worker.js',document.baseURI));
        timer=setTimeout(()=>{if(token===generation)stop('El detector tardó demasiado. Volvé a activar gestos.');},45000);
        worker.onerror=()=>{if(token===generation)stop('No se pudo cargar el detector. Revisá que extrajiste toda la carpeta y usá el iniciador local.');};
        worker.onmessage=({data})=>{
          if(token!==generation)return;
          if(data.type==='error'){stop('No se pudo procesar la cámara. Probá reiniciar gestos en Chrome o Edge.');return;}
          if(data.type==='ready'){clearTimeout(timer);tell('Buscando una mano…');raf=requestAnimationFrame(frame);}
          if(data.type==='result'){
            draw(data.landmarks);$('gesture-take').disabled=data.landmarks.length!==1;
            clearTimeout(timer);busy=false;const result=control.update(data.landmarks,data.aspect,data.time);tell(result.message);
            if(result.delta)app.globe?.zoomGesture(result.delta);
            if(result.rotation||result.rotationY)app.globe?.rotate(result.rotation||0,result.rotationY||0);
          }
        };
        worker.postMessage({type:'init'});
        async function frame(time){
          if(token!==generation)return;
          raf=requestAnimationFrame(frame);
          if(busy||time-last<85||video.readyState<2||video.currentTime===lastVideo)return;
          busy=true;last=time;lastVideo=video.currentTime;
          try{
            const bitmap=await createImageBitmap(video);
            if(token!==generation){bitmap.close();return;}
            worker.postMessage({type:'frame',bitmap,time,aspect:video.videoWidth/video.videoHeight},[bitmap]);
            timer=setTimeout(()=>{if(token===generation)stop('El detector dejó de responder. Volvé a activar gestos.');},10000);
          }catch(error){if(token===generation)stop('No se pudo leer la cámara. Volvé a activar gestos.');}
        }
      }catch(error){if(token===generation)stop(error.name==='NotAllowedError'?'Permiso de cámara denegado. Podés habilitarlo en el navegador y volver a activar gestos.':error.name==='NotFoundError'?'No se encontró una cámara.':'No se pudo abrir la cámara. Revisá si otra aplicación la está usando.');}
    }
    button.addEventListener('click',()=>enabled?stop():start());
    $('gesture-take').addEventListener('click',()=>{control.take();tell('Mostrá pulgar e índice separados: se tomará esa apertura como inicio.');});
    $('gesture-stop').addEventListener('click',()=>stop());
    document.addEventListener('keydown',e=>{if(e.key==='Escape')stop();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&enabled)stop('Gestos pausados al salir de la pestaña · cámara apagada.');});
    window.addEventListener('pagehide',()=>stop());
    // Mouse, teclado y comandos conservan prioridad; se vuelve a tomar con una pinza.
    ['pointerdown','wheel','keydown'].forEach(event=>document.addEventListener(event,()=>control.reset(),{passive:true}));
    return {start,stop,release:()=>control.reset(),get enabled(){return enabled;}};
  };
})(window.GH=window.GH||{});
