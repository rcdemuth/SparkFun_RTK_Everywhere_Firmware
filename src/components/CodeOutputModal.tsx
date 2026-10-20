import React, { useState } from 'react';
import { Code, Copy, Check, Download, FileText, Terminal, Layers, Cloud, Sparkles } from 'lucide-react';
import { BoardDefinition, GnssChipDefinition, SystemConfiguration } from '../types/config';
import {
  generateBoardConfigJson,
  generateCppHeader,
  generatePlatformIoIni,
} from '../utils/codeGenerator';

interface Props {
  selectedBoard: BoardDefinition;
  selectedGnss: GnssChipDefinition;
  config: SystemConfiguration;
  onOpenCloudCompiler?: () => void;
}

export const CodeOutputModal: React.FC<Props> = ({
  selectedBoard,
  selectedGnss,
  config,
  onOpenCloudCompiler,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'header' | 'platformio' | 'arduino'>('json');
  const [copied, setCopied] = useState<boolean>(false);

  const jsonCode = generateBoardConfigJson(config, selectedBoard, selectedGnss);
  const headerCode = generateCppHeader(config, selectedBoard, selectedGnss);
  const pioCode = generatePlatformIoIni(selectedBoard, selectedGnss, config);

  const isC3 = selectedBoard.family === 'esp32-c3';
  const isC6 = selectedBoard.family === 'esp32-c6';
  const isS3 = selectedBoard.family === 'esp32-s3';
  const isPico = selectedBoard.family === 'rp2040';

  const fqbn = isC3
    ? 'esp32:esp32:esp32c3'
    : isC6
    ? 'esp32:esp32:esp32c6'
    : isS3
    ? 'esp32:esp32:esp32s3'
    : isPico
    ? 'rp2040:rp2040:rpipico'
    : 'esp32:esp32:esp32';

  const arduinoCliCommand = `# Arduino CLI compilation command for ${selectedBoard.name}
arduino-cli compile --fqbn ${fqbn} \\
  --build-property "compiler.cpp.extra_flags=-DBOARD_${selectedBoard.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}=1 -DGNSS_${selectedGnss.id.toUpperCase()}=1 ${
    isC3 || isC6 ? '-DCOMPILE_BLE_ONLY=1' : ''
  }" \\
  Firmware/RTK_Everywhere/RTK_Everywhere.ino
`;

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'json':
        return jsonCode;
      case 'header':
        return headerCode;
      case 'platformio':
        return pioCode;
      case 'arduino':
        return arduinoCliCommand;
    }
  };

  const getFileName = () => {
    switch (activeTab) {
      case 'json':
        return `${selectedBoard.id}_${selectedGnss.id}_config.json`;
      case 'header':
        return 'config_modular.h';
      case 'platformio':
        return 'platformio.ini';
      case 'arduino':
        return 'build_command.sh';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([getCurrentCode()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = getFileName();
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-0">
      {/* Live Compilation Notice Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 px-4 py-2.5 border-b border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-200">
            <strong className="text-emerald-300">Zero Local Toolchain:</strong> You can compile and package this exact firmware configuration in the cloud via GitHub Actions.
          </span>
        </div>
        {onOpenCloudCompiler && (
          <button
            onClick={onOpenCloudCompiler}
            className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Cloud Compiler</span>
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            Exported Code & Firmware Specifications
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 rounded font-mono font-medium transition ${
                activeTab === 'json'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              board_config.json
            </button>
            <button
              onClick={() => setActiveTab('header')}
              className={`px-3 py-1 rounded font-mono font-medium transition ${
                activeTab === 'header'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              config_modular.h
            </button>
            <button
              onClick={() => setActiveTab('platformio')}
              className={`px-3 py-1 rounded font-mono font-medium transition ${
                activeTab === 'platformio'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              platformio.ini
            </button>
            <button
              onClick={() => setActiveTab('arduino')}
              className={`px-3 py-1 rounded font-mono font-medium transition ${
                activeTab === 'arduino'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CLI Build Script
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="relative">
        <pre className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[460px] leading-relaxed select-text">
          {getCurrentCode()}
        </pre>
      </div>
    </div>
  );
};
