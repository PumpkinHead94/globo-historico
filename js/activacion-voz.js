(function(ns){
  class VoiceGate {
    constructor(){this.reset();}
    reset(){this.until=0;}
    accept(text,wake=true,conversation=true,now=Date.now()){
      const normalized=ns.commands.normalize(text);
      const match=normalized.match(/^(?:hola |oye |hey )?(?:globo|lobo)(?:\s+|$)(.*)$/);
      if(!wake)return {command:match?match[1]:text};
      if(match&&!match[1]){this.until=now+20000;return {waiting:true};}
      if(!match&&now>=this.until)return {ignored:true};
      const command=match?match[1]:text;
      const parsed=ns.commands.parse(command);
      if(['unknown','empty','ambiguous'].includes(parsed.type))return {command};
      this.until=conversation?now+20000:0;
      return {command};
    }
  }
  ns.VoiceGate=VoiceGate;
})(window.GH=window.GH||{});
