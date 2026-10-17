/* Detector local: ningún fotograma sale del navegador. */
let detector;
self.onmessage = async ({data}) => {
  try {
    if (data.type === 'init') {
      const {FilesetResolver, HandLandmarker} = await import('../vendor/mediapipe/vision_bundle.mjs');
      const files = await FilesetResolver.forVisionTasks(new URL('../vendor/mediapipe/wasm', self.location.href).href);
      detector = await HandLandmarker.createFromOptions(files, {
        baseOptions: {modelAssetPath: new URL('../gestos/hand_landmarker.task', self.location.href).href, delegate:'CPU'},
        runningMode:'VIDEO', numHands:2, minHandDetectionConfidence:0.65,
        minHandPresenceConfidence:0.65, minTrackingConfidence:0.65
      });
      self.postMessage({type:'ready'});
    } else if (data.type === 'frame') {
      try {
        const result = detector.detectForVideo(data.bitmap, data.time);
        self.postMessage({type:'result', landmarks:result.landmarks, aspect:data.aspect, time:data.time});
      } finally { data.bitmap.close(); }
    }
  } catch (error) { self.postMessage({type:'error', message:String(error.message || error)}); }
};
