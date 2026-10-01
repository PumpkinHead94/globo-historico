/* Reconocimiento español local con Vosk/WASM. Sin Web Speech ni servicios externos. */
(function(ns){
  'use strict';
  let adapter=null,model=null,modelPromise=null,libraryPromise=null;
  let generation=0,stream=null,context=null,source=null,processor=null,recognizer=null;
  let state='idle',stateListener=()=>{};
  function change(next,message){state=next;stateListener(next,message);}
  function release(){
    if(processor){processor.onaudioprocess=null;processor.disconnect();processor=null;}
    if(source){source.disconnect();source=null;}
    if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;}
    if(recognizer){recognizer.remove();recognizer=null;}
    if(context){context.close().catch(()=>{});context=null;}
  }
  function loadLibrary(){
    if(window.Vosk)return Promise.resolve();
    if(!libraryPromise)libraryPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='vendor/vosk.js';
      script.onload=resolve;script.onerror=()=>{libraryPromise=null;script.remove();reject(new Error('Falta vendor/vosk.js. Extraé el paquete completo.'));};document.head.append(script);
    });
    return libraryPromise;
  }
  async function loadModel(){
    if(model?.ready)return model;
    if(!modelPromise)modelPromise=(async()=>{
      await loadLibrary();
      return new Promise((resolve,reject)=>{
        const candidate=new Vosk.Model(new URL('voz/modelo-es.tar.gz',location.href).href,-1);
        let settled=false;
        const timer=setTimeout(()=>fail('La carga del modelo demoró demasiado. Volvé a intentar.'),120000);
        function fail(message){if(settled)return;settled=true;clearTimeout(timer);candidate.worker.terminate();reject(new Error(message));}
        candidate.worker.addEventListener('error',()=>fail('No se pudo iniciar el motor de voz local. Cerrá y volvé a abrir la aplicación.'));
        candidate.on('error',()=>fail('No se pudo cargar el modelo español. Verificá voz/modelo-es.tar.gz.'));
        candidate.on('load',message=>{
          if(!message.result){fail('El modelo de voz no pudo iniciarse.');return;}
          if(settled)return;settled=true;clearTimeout(timer);model=candidate;resolve(model);
        });
      });
    })().catch(error=>{modelPromise=null;throw error;});
    return modelPromise;
  }
  function stop(){generation++;release();if(adapter)adapter.stop();change('idle','Voz detenida.');}
  async function start(onTranscript,onError=()=>{},onPartial=()=>{}){
    if(adapter){adapter.start(onTranscript,onError);return true;}
    if(state==='loading'||state==='listening')return false;
    if(location.protocol==='file:'){
      onError(new Error('Para usar voz, cerrá esta pestaña y abrí INICIAR-CON-VOZ.cmd en la carpeta del proyecto. El mapa por texto sigue disponible aquí.'));return false;
    }
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){onError(new Error('El micrófono requiere abrir la aplicación desde localhost en Edge o Chrome.'));return false;}
    const token=++generation;
    change('loading','Preparando voz local… La primera carga puede tardar.');
    try{
      context=new AudioContext();await context.resume();
      if(token!==generation)return false;
      const ready=await loadModel();if(token!==generation)return false;
      change('loading','Permití el micrófono cuando el navegador lo solicite.');
      const capture=await navigator.mediaDevices.getUserMedia({video:false,audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});
      if(token!==generation){capture.getTracks().forEach(track=>track.stop());return false;}
      stream=capture;
      recognizer=new ready.KaldiRecognizer(context.sampleRate);
      recognizer.on('result',message=>{const text=message.result?.text?.trim();if(token===generation&&state==='listening'&&text)onTranscript(text);});
      recognizer.on('partialresult',message=>{if(token===generation&&state==='listening')onPartial(message.result?.partial||'');});
      recognizer.on('error',()=>{if(token===generation){stop();onError(new Error('Se interrumpió el reconocimiento. Volvé a activar Hablar.'));}});
      processor=context.createScriptProcessor(4096,1,1);
      processor.onaudioprocess=event=>{
        if(token!==generation)return;
        try{recognizer.acceptWaveform(event.inputBuffer);}catch(error){stop();onError(error);}
        event.outputBuffer.getChannelData(0).fill(0);
      };
      source=context.createMediaStreamSource(stream);source.connect(processor);processor.connect(context.destination);
      stream.getAudioTracks()[0].addEventListener('ended',()=>{if(token===generation){stop();onError(new Error('El micrófono se desconectó.'));}});
      change('listening','Escuchando. Decí un comando y hacé una pausa.');return true;
    }catch(error){
      if(token!==generation)return false;
      release();change('idle','Voz inactiva.');
      const message=error.name==='NotAllowedError'?'No se habilitó el micrófono. Permitilo desde el navegador y volvé a pulsar Hablar.':error.name==='NotFoundError'?'No se encontró un micrófono conectado.':error.message||'No se pudo iniciar la voz local.';
      onError(new Error(message));return false;
    }
  }
  ns.voice={start,stop,loadModel,get state(){return state;},get available(){return !!adapter || (location.protocol!=='file:'&&!!navigator.mediaDevices?.getUserMedia);},
    onState(listener){stateListener=listener;},
    register(value){if(!value||typeof value.start!=='function'||typeof value.stop!=='function')throw new TypeError('El adaptador debe implementar start y stop.');stop();adapter=value;}
  };
  window.addEventListener('pagehide',()=>{stop();if(model)model.terminate();});
})(window.GH=window.GH||{});
