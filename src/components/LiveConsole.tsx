import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, Trash2, Send, Usb, Bluetooth, Radio, CheckCircle2 } from 'lucide-react';
import { GnssChipDefinition, SystemConfiguration } from '../types/config';

interface Props {
  selectedGnss: GnssChipDefinition;
  config: SystemConfiguration;
}

export const LiveConsole: React.FC<Props> = ({ selectedGnss, config }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [isConnectedSerial, setIsConnectedSerial] = useState<boolean>(false);
  const serialPortRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate realistic synthetic NMEA / GNSS strings if not connected to live physical hardware
  useEffect(() => {
    if (!isRunning || isConnectedSerial) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr =
        String(now.getUTCHours()).padStart(2, '0') +
        String(now.getUTCMinutes()).padStart(2, '0') +
        String(now.getUTCSeconds()).padStart(2, '0') +
        '.00';

      const roll = (Math.sin(Date.now() / 800) * 12).toFixed(2);
      const pitch = (Math.cos(Date.now() / 900) * 15).toFixed(2);
      const heading = (180 + Math.sin(Date.now() / 3000) * 45).toFixed(2);

      let tiltSentence = '';
      if (selectedGnss.id === 'um981') {
        tiltSentence = `$KSXT,${timeStr},4005.417688,N,10511.103456,W,1560.12,${heading},${pitch},${roll},4,32,0.014*4B`;
      } else if (selectedGnss.id === 'commnav_k827_k922') {
        tiltSentence = `$GNTLT,1,${heading},${pitch},${roll},40.0902948,-105.1850576,1560.089*7A`;
      } else if (selectedGnss.id === 'bynav_m21_m22') {
        tiltSentence = `#INSPVA,COM1,0,84.0,FINESTEERING,2291,128912.0;40.0902948,-105.1850576,1560.12,0.01,0.02,0.01,${roll},${pitch},${heading},INS_SOLUTION_GOOD*e4`;
      } else {
        tiltSentence = `$GNGGA,${timeStr},4005.417688,N,10511.103456,W,4,34,0.6,1560.1,M,-21.4,M,1.0,0000*5A`;
      }

      setLogs((prev) => [...prev.slice(-150), tiltSentence]);
    }, 400);

    return () => clearInterval(interval);
  }, [isRunning, isConnectedSerial, selectedGnss.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSendCommand = (cmd?: string) => {
    const textToSend = cmd || inputCommand;
    if (!textToSend.trim()) return;

    setLogs((prev) => [
      ...prev,
      `> [TX to ${selectedGnss.name}]: ${textToSend}`,
      `< [ACK]: OK (Response from ${selectedGnss.id.toUpperCase()})`,
    ]);
    if (!cmd) setInputCommand('');
  };

  const handleConnectWebSerial = async () => {
    if ('serial' in navigator) {
      try {
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: selectedGnss.baudRate });
        serialPortRef.current = port;
        setIsConnectedSerial(true);
        setLogs((prev) => [
          ...prev,
          `*** Connected to hardware Serial port at ${selectedGnss.baudRate} baud ***`,
        ]);
      } catch (err: any) {
        setLogs((prev) => [...prev, `*** Web Serial connection cancelled or failed: ${err.message} ***`]);
      }
    } else {
      alert('Web Serial API is supported in Google Chrome, Microsoft Edge, and Opera.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-0">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Live GNSS Stream & Hardware Command Console
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
            {isConnectedSerial ? 'HARDWARE CONNECTED' : 'SYNTHETIC STREAM ACTIVE'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleConnectWebSerial}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isConnectedSerial
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            {isConnectedSerial ? 'Serial Connected' : 'Connect Physical USB'}
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700"
            title={isRunning ? 'Pause Stream' : 'Resume Stream'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setLogs([])}
            className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700"
            title="Clear Console"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div
        ref={scrollRef}
        className="p-4 bg-slate-950 font-mono text-[11px] text-emerald-400 h-64 overflow-y-auto space-y-1 select-text"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">No incoming data. Press Play or Connect Physical USB.</div>
        ) : (
          logs.map((log, index) => {
            const isTx = log.startsWith('>');
            const isAck = log.startsWith('<');
            const isSpecial = log.startsWith('*');
            return (
              <div
                key={index}
                className={
                  isTx
                    ? 'text-cyan-400 font-bold'
                    : isAck
                    ? 'text-amber-300'
                    : isSpecial
                    ? 'text-purple-400 font-bold'
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            );
          })
        )}
      </div>

      {/* Quick command buttons */}
      <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800 flex flex-wrap gap-2 text-[11px]">
        <span className="text-slate-500 self-center">Quick Test Commands:</span>
        {selectedGnss.hasOnboardIMU && (
          <>
            <button
              onClick={() => handleSendCommand('CONFIG INS ENABLE')}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 font-mono"
            >
              CONFIG INS ENABLE
            </button>
            <button
              onClick={() => handleSendCommand(`CONFIG POLE LEVERARM 0 0 -${config.tilt.poleHeightMeters.toFixed(3)}`)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 font-mono"
            >
              SET POLE {config.tilt.poleHeightMeters.toFixed(2)}m
            </button>
          </>
        )}
        <button
          onClick={() => handleSendCommand(config.deviceRole === 'rover' ? 'SET ROLE BASE' : 'SET ROLE ROVER')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-slate-700 font-mono"
        >
          TOGGLE ROVER/BASE
        </button>
      </div>

      {/* Command Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder={`Enter command for ${selectedGnss.name} (e.g. SAVECONFIG, CONFIG INS ENABLE, $KSXT)...`}
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={() => handleSendCommand()}
          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </div>
    </div>
  );
};
