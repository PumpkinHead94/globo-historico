param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'instancia-local.ps1')
Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
public class GloboLocalServer {
    TcpListener listener;
    string root;
    Thread serverThread;
    public int Port { get; private set; }
    volatile bool running = true;
    public GloboLocalServer(string directory) {
        root = Path.GetFullPath(directory).TrimEnd(Path.DirectorySeparatorChar);
        listener = new TcpListener(IPAddress.Loopback, 8765);
        try { listener.Start(); }
        catch(SocketException e) {
            if(e.SocketErrorCode != SocketError.AddressAlreadyInUse) throw;
            listener.Stop();
            listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
        }
        Port = ((IPEndPoint)listener.LocalEndpoint).Port;
    }
    public void Start() {
        serverThread = new Thread(Run);
        serverThread.IsBackground = true;
        serverThread.Start();
    }
    public void Wait() { serverThread.Join(); }
    public void Run() {
        try {
            while(running) {
                if(!listener.Pending()) { Thread.Sleep(100); continue; }
                var client=listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(_ => Handle(client));
            }
        } finally { listener.Stop(); }
    }
    void Reply(NetworkStream stream, int code, string mime, byte[] body, bool head=false) {
        var header=Encoding.ASCII.GetBytes("HTTP/1.1 "+code+" "+(code==200?"OK":"Error")+"\r\nContent-Type: "+mime+"\r\nContent-Length: "+body.Length+"\r\nCache-Control: no-cache\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n");
        stream.Write(header,0,header.Length);
        if(!head)stream.Write(body,0,body.Length);
    }
    void Handle(TcpClient client) {
        using(client) {
            try {
                client.ReceiveTimeout=5000;client.SendTimeout=30000;
                using(var stream=client.GetStream()) {
                    var buffer=new MemoryStream();int current;
                    while(buffer.Length<8192 && (current=stream.ReadByte())!=-1) {
                        buffer.WriteByte((byte)current);
                        if(current==10 && buffer.Length>=4) {
                            var b=buffer.GetBuffer();int n=(int)buffer.Length;
                            if(b[n-4]==13&&b[n-3]==10&&b[n-2]==13)break;
                        }
                    }
                    string request=Encoding.ASCII.GetString(buffer.ToArray());
                    string[] lines=request.Split(new[]{"\r\n"},StringSplitOptions.None);
                    string[] first=lines[0].Split(' ');
                    if(first.Length<3)return;
                    bool host=false,localHeader=false;
                    foreach(var line in lines) {
                        if(line.Equals("Host: 127.0.0.1:"+Port,StringComparison.OrdinalIgnoreCase)||line.Equals("Host: localhost:"+Port,StringComparison.OrdinalIgnoreCase))host=true;
                        if(line.Equals("X-Globo-Local: 1",StringComparison.OrdinalIgnoreCase))localHeader=true;
                    }
                    if(!host){Reply(stream,403,"text/plain",new byte[0]);return;}
                    string route=Uri.UnescapeDataString(first[1].Split('?')[0]);
                    if(route=="/_stop"&&first[0]=="POST"&&localHeader){Reply(stream,200,"text/plain",Encoding.UTF8.GetBytes("Cerrado"));running=false;return;}
                    if(first[0]!="GET"&&first[0]!="HEAD"){Reply(stream,405,"text/plain",new byte[0]);return;}
                    bool head=first[0]=="HEAD";
                    if(route=="/_status"){Reply(stream,200,"text/plain; charset=utf-8",Encoding.UTF8.GetBytes("GloboHistorico-local|"+root),head);return;}
                    if(route=="/")route="/index.html";
                    string file=Path.GetFullPath(Path.Combine(root,route.TrimStart('/').Replace('/',Path.DirectorySeparatorChar)));
                    if(!file.StartsWith(root+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)||!File.Exists(file)){Reply(stream,404,"text/plain",new byte[0]);return;}
                    string ext=Path.GetExtension(file).ToLowerInvariant(),mime;
                    switch(ext){case ".html":mime="text/html; charset=utf-8";break;case ".mjs":case ".js":mime="application/javascript; charset=utf-8";break;case ".css":mime="text/css; charset=utf-8";break;case ".wasm":mime="application/wasm";break;case ".task":mime="application/octet-stream";break;case ".gz":mime="application/gzip";break;case ".ico":mime="image/x-icon";break;case ".txt":case ".md":mime="text/plain; charset=utf-8";break;default:Reply(stream,403,"text/plain",new byte[0]);return;}
                    Reply(stream,200,mime,File.ReadAllBytes(file),head);
                }
            } catch(IOException) {} catch(Exception) {}
        }
    }
}
'@
try {
    $mutexGlobo = New-Object Threading.Mutex($false, ('Local\GloboHistorico-' + $keyGlobo))
    $lockedGlobo = $false
    try {
        try { $lockedGlobo = $mutexGlobo.WaitOne(15000) } catch [Threading.AbandonedMutexException] { $lockedGlobo = $true }
        if (-not $lockedGlobo) { throw 'Otra apertura sigue en curso. Intenta nuevamente en unos segundos.' }
        $portGlobo = Get-GloboPort
        if ($portGlobo) {
            $urlGlobo = "http://127.0.0.1:$portGlobo/"
            if (-not $NoBrowser) { Start-Process $urlGlobo }
            return
        }
        $serverGlobo = New-Object GloboLocalServer($rootGlobo)
        $serverGlobo.Start()
        $urlGlobo = "http://127.0.0.1:$($serverGlobo.Port)/"
        New-Item -ItemType Directory -Path $stateDirectoryGlobo -Force | Out-Null
        @{port=$serverGlobo.Port;root=$rootGlobo} | ConvertTo-Json | Set-Content -LiteralPath $stateFileGlobo -Encoding UTF8
    } finally {
        if ($lockedGlobo) { $mutexGlobo.ReleaseMutex() }
        $mutexGlobo.Dispose()
    }
    if (-not $NoBrowser) { Start-Process $urlGlobo }
    $serverGlobo.Wait()
} catch {
    if ($NoBrowser) { throw }
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show('No se pudo iniciar Globo Historico.' + [Environment]::NewLine + $_.Exception.Message, 'Globo Historico') | Out-Null
}
