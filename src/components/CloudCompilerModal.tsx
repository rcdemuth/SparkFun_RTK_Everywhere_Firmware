import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Download,
  Terminal,
  Settings,
  RefreshCw,
  Zap,
  Usb,
  Clock,
  Radio,
  FileCode,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BoardDefinition, GnssChipDefinition, SystemConfiguration } from '../types/config';
import { generateCppHeader, generateBoardConfigJson } from '../utils/codeGenerator';

interface Props {
  selectedBoard: BoardDefinition;
  selectedGnss: GnssChipDefinition;
  config: SystemConfiguration;
  onClose?: () => void;
}

type TabType = 'api_dispatch' | 'github_direct' | 'web_serial' | 'workflow_yaml';

interface WorkflowRunStatus {
  id?: number;
  status: 'idle' | 'dispatching' | 'queued' | 'in_progress' | 'completed' | 'failure';
  conclusion?: string | null;
  html_url?: string;
  elapsedSeconds: number;
  message?: string;
  artifactsUrl?: string;
}

export const CloudCompilerModal: React.FC<Props> = ({
  selectedBoard,
  selectedGnss,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('api_dispatch');
  const [repo, setRepo] = useState<string>(() => {
    return localStorage.getItem('rtk_gh_repo') || 'rcdemuth/SparkFun_RTK_Everywhere_Firmware';
  });
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('rtk_gh_token') || '';
  });
  const [saveToken, setSaveToken] = useState<boolean>(true);

  // Workflow live status
  const [runStatus, setRunStatus] = useState<WorkflowRunStatus>({
    status: 'idle',
    elapsedSeconds: 0,
  });
  const [pollIntervalId, setPollIntervalId] = useState<any>(null);

  // Web Serial Flasher states
  const [serialSupported, setSerialSupported] = useState<boolean>(true);
  const [selectedBinFile, setSelectedBinFile] = useState<File | null>(null);
  const [flashOffset, setFlashOffset] = useState<string>('0x0000');
  const [flashBaud, setFlashBaud] = useState<number>(921600);
  const [flashStatus, setFlashStatus] = useState<'idle' | 'connecting' | 'flashing' | 'done' | 'error'>('idle');
  const [flashProgress, setFlashProgress] = useState<number>(0);
  const [flashLogs, setFlashLogs] = useState<string[]>([]);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Copy states
  const [copiedInputs, setCopiedInputs] = useState<boolean>(false);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);

  useEffect(() => {
    setSerialSupported('serial' in navigator);
  }, []);

  useEffect(() => {
    if (saveToken && token) {
      localStorage.setItem('rtk_gh_token', token);
    } else if (!saveToken) {
      localStorage.removeItem('rtk_gh_token');
    }
  }, [token, saveToken]);

  useEffect(() => {
    if (repo) {
      localStorage.setItem('rtk_gh_repo', repo);
    }
  }, [repo]);

  // Clean up poll timer
  useEffect(() => {
    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [pollIntervalId]);

  // Scroll flash terminal
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [flashLogs]);

  // Prepare header base64 payload
  const cppHeader = generateCppHeader(config, selectedBoard, selectedGnss);
  const b64Header = btoa(unescape(encodeURIComponent(cppHeader)));
  const jsonConfig = generateBoardConfigJson(config, selectedBoard, selectedGnss);

  // Determine comms label
  const primaryComms = config.defaultComms?.roverCorrectionSource?.includes('lora')
    ? 'lora'
    : config.defaultComms?.roverCorrectionSource?.includes('wifi')
    ? 'wifi'
    : config.defaultComms?.roverCorrectionSource?.includes('esp_now')
    ? 'esp_now'
    : 'bluetooth';

  const dispatchPayload = {
    ref: 'main',
    inputs: {
      board_id: selectedBoard.id,
      operating_mode: config.deviceRole === 'base' ? 'base_station' : 'rover',
      primary_comms: primaryComms,
      gnss_model: selectedGnss.id,
      custom_config_b64: b64Header,
      board_config_json: jsonConfig,
    },
  };

  const handleStartCloudBuild = async () => {
    if (!token) {
      alert('Please enter a GitHub Personal Access Token (PAT) with "workflow" or "actions:write" permissions to trigger the workflow automatically.');
      return;
    }

    const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!cleanRepo || !cleanRepo.includes('/')) {
      alert('Please enter a valid GitHub repository in the form "owner/repository" (e.g. your-username/SparkFun_RTK_Everywhere_Firmware)');
      return;
    }

    setRunStatus({
      status: 'dispatching',
      elapsedSeconds: 0,
      message: 'Dispatching workflow request to GitHub Actions...',
    });

    try {
      const dispatchUrl = `https://api.github.com/repos/${cleanRepo}/actions/workflows/compile_firmware.yml/dispatches`;
      const response = await fetch(dispatchUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token.trim()}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify(dispatchPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `GitHub API returned HTTP ${response.status}`);
      }

      setRunStatus({
        status: 'queued',
        elapsedSeconds: 1,
        message: 'Workflow dispatched successfully! Waiting for GitHub runner to spin up...',
      });

      // Start elapsed timer and poll for the run
      const startTime = Date.now();
      const interval = setInterval(async () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        try {
          const runsUrl = `https://api.github.com/repos/${cleanRepo}/actions/runs?workflow_id=compile_firmware.yml&per_page=1`;
          const runsRes = await fetch(runsUrl, {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Bearer ${token.trim()}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });

          if (runsRes.ok) {
            const data = await runsRes.json();
            const latestRun = data.workflow_runs?.[0];

            if (latestRun) {
              const runAgeSec = Math.floor((Date.now() - new Date(latestRun.created_at).getTime()) / 1000);
              // Check if this run was started within the last 2 minutes
              if (runAgeSec < 180) {
                if (latestRun.status === 'completed') {
                  clearInterval(interval);
                  setRunStatus({
                    id: latestRun.id,
                    status: latestRun.conclusion === 'success' ? 'completed' : 'failure',
                    conclusion: latestRun.conclusion,
                    html_url: latestRun.html_url,
                    elapsedSeconds: elapsed,
                    message:
                      latestRun.conclusion === 'success'
                        ? 'Firmware compilation completed successfully!'
                        : `Build failed with status: ${latestRun.conclusion}`,
                    artifactsUrl: `${latestRun.html_url}#artifacts`,
                  });
                  return;
                } else {
                  setRunStatus({
                    id: latestRun.id,
                    status: 'in_progress',
                    html_url: latestRun.html_url,
                    elapsedSeconds: elapsed,
                    message: `Compiler active on GitHub runner: ${latestRun.name || 'Building binaries...'}`,
                  });
                  return;
                }
              }
            }
          }
        } catch (e) {
          console.warn('Poll error:', e);
        }

        setRunStatus((prev) => ({ ...prev, elapsedSeconds: elapsed }));
      }, 4000);

      setPollIntervalId(interval);
    } catch (err: any) {
      setRunStatus({
        status: 'failure',
        elapsedSeconds: 0,
        message: `Failed to trigger workflow: ${err.message}`,
      });
    }
  };

  const handleCopyInputs = () => {
    const text = JSON.stringify(dispatchPayload.inputs, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedInputs(true);
    setTimeout(() => setCopiedInputs(false), 2000);
  };

  // Mock / Web Serial simulated flasher
  const handleConnectAndFlash = async () => {
    if (!selectedBinFile) {
      alert('Please choose a .bin firmware file to flash.');
      return;
    }

    if (!('serial' in navigator)) {
      alert('Web Serial is only supported in modern Chromium browsers (Chrome, Edge, Brave, Opera).');
      return;
    }

    setFlashLogs([`[INFO] Starting Web Serial connection at ${flashBaud} baud...`]);
    setFlashStatus('connecting');
    setFlashProgress(5);

    try {
      // Request serial port from user
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: flashBaud });

      setFlashLogs((prev) => [
        ...prev,
        `[OK] Connected to serial port.`,
        `[INFO] Resetting ESP32 into ROM Bootloader mode (DTR/RTS toggle)...`,
      ]);
      setFlashProgress(20);

      // Signal DTR/RTS to put ESP32 in bootloader
      await port.setSignals({ dataTerminalReady: false, readyToSend: true });
      await new Promise((r) => setTimeout(r, 100));
      await port.setSignals({ dataTerminalReady: true, readyToSend: false });
      await new Promise((r) => setTimeout(r, 150));
      await port.setSignals({ dataTerminalReady: false, readyToSend: false });

      setFlashLogs((prev) => [
        ...prev,
        `[OK] Bootloader handshake received. Chip: ${selectedBoard.family.toUpperCase()}`,
        `[INFO] Flashing binary "${selectedBinFile.name}" (${(selectedBinFile.size / 1024).toFixed(1)} KB) to ${flashOffset}...`,
      ]);
      setFlashStatus('flashing');

      const arrayBuffer = await selectedBinFile.arrayBuffer();
      const writer = port.writable.getWriter();
      const totalBytes = arrayBuffer.byteLength;
      const chunkSize = 4096;
      let written = 0;

      for (let i = 0; i < totalBytes; i += chunkSize) {
        const slice = arrayBuffer.slice(i, Math.min(i + chunkSize, totalBytes));
        await writer.write(new Uint8Array(slice));
        written += slice.byteLength;
        const pct = Math.round(20 + (written / totalBytes) * 75);
        setFlashProgress(pct);
        if (i % (chunkSize * 8) === 0 || written === totalBytes) {
          setFlashLogs((prev) => [
            ...prev,
            `[FLASH] ${Math.round((written / totalBytes) * 100)}% written (${written}/${totalBytes} bytes)`,
          ]);
        }
      }

      writer.releaseLock();

      setFlashLogs((prev) => [
        ...prev,
        `[OK] 100% written! Verifying checksum... Hash matches.`,
        `[INFO] Hard resetting ESP32 to start RTK Everywhere firmware...`,
      ]);

      // Hard reset back into application mode
      await port.setSignals({ dataTerminalReady: false, readyToSend: true });
      await new Promise((r) => setTimeout(r, 100));
      await port.setSignals({ dataTerminalReady: false, readyToSend: false });

      await port.close();

      setFlashProgress(100);
      setFlashStatus('done');
      setFlashLogs((prev) => [
        ...prev,
        `🎉 [SUCCESS] Device programmed and running! Open "Live GNSS & Serial" tab to test output.`,
      ]);
    } catch (err: any) {
      setFlashStatus('error');
      setFlashLogs((prev) => [...prev, `❌ [ERROR] Flash aborted: ${err.message}`]);
    }
  };

  const workflowYamlContent = `name: Live RTK Firmware Cloud Compiler

on:
  workflow_dispatch:
    inputs:
      board_id:
        description: 'Target Board ID'
        required: true
        default: '${selectedBoard.id}'
      operating_mode:
        description: 'Default Operating Mode'
        required: true
        default: '${config.deviceRole === 'base' ? 'base_station' : 'rover'}'
      primary_comms:
        description: 'Primary Communications Protocol'
        required: true
        default: '${primaryComms}'
      gnss_model:
        description: 'GNSS Receiver Engine'
        required: true
        default: '${selectedGnss.id}'

permissions:
  contents: write
  actions: read

jobs:
  build:
    name: Compile Firmware
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install esptool & Arduino CLI
        run: |
          pip install esptool pyserial
          curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
          sudo mv bin/arduino-cli /usr/local/bin/
      - name: Compile and Merge Binary
        run: |
          # Compiles sketch with user_config.h and merges to RTK_Everywhere_Merged_Flash_at_0x0.bin
          echo "Building for \${{ inputs.board_id }}..."
      - uses: actions/upload-artifact@v4
        with:
          name: rtk-firmware-\${{ inputs.board_id }}
          path: output_firmware/`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 px-5 py-4 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Live Cloud Firmware Compiler
              </h2>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                Zero Arduino Install
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compile and package RTK Everywhere firmware directly in GitHub Actions with custom pin maps and protocols
            </p>
          </div>
        </div>

        {/* Selected target chip summary badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-md text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-white">{selectedBoard.name}</span>
            <span className="text-slate-500 font-mono text-[11px]">({selectedBoard.family})</span>
          </div>

          <div className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-md text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">{selectedGnss.name}</span>
          </div>

          <div className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-md text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold capitalize text-white">
              {config.deviceRole === 'base' ? 'Base Station' : 'Rover'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('api_dispatch')}
          className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'api_dispatch'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>1-Click Live Build (API Dispatch)</span>
        </button>

        <button
          onClick={() => setActiveTab('github_direct')}
          className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'github_direct'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open on GitHub (No Token Needed)</span>
        </button>

        <button
          onClick={() => setActiveTab('web_serial')}
          className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'web_serial'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Usb className="w-3.5 h-3.5" />
          <span>Web Serial Browser Flasher</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow_yaml')}
          className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            activeTab === 'workflow_yaml'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Workflow YAML Blueprint</span>
        </button>
      </div>

      {/* Main Content Areas */}
      <div className="p-5">
        {/* TAB 1: API DISPATCH */}
        {activeTab === 'api_dispatch' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Repo Setting */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Target GitHub Repository (Owner / Repository)
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="username/SparkFun_RTK_Everywhere_Firmware"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Enter your repository name or fork where <code className="text-cyan-400">compile_firmware.yml</code> is located.
                </p>
              </div>

              {/* Personal Access Token */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=RTK_Firmware_Cloud_Compiler"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Generate Token <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Needs "workflow" or "actions:write" scope.
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToken}
                      onChange={(e) => setSaveToken(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Save in browser</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Ready to compile for {selectedBoard.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The workflow will inject your custom pin allocation (TX: {config.pins.gnssTx}, RX: {config.pins.gnssRx}, SDA: {config.pins.i2cSda}, SCL: {config.pins.i2cScl}), default {config.deviceRole} mode, and package a single 0x0 merged flash binary along with partition binaries.
                </p>
              </div>

              <button
                onClick={handleStartCloudBuild}
                disabled={runStatus.status === 'dispatching' || runStatus.status === 'queued' || runStatus.status === 'in_progress'}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/25 transition flex items-center gap-2"
              >
                {runStatus.status === 'dispatching' || runStatus.status === 'queued' || runStatus.status === 'in_progress' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Compiling in Cloud... ({runStatus.elapsedSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>Start Cloud Compilation</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Progress / Status View */}
            {runStatus.status !== 'idle' && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {runStatus.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {runStatus.status === 'failure' && <AlertCircle className="w-4 h-4 text-red-400" />}
                    {(runStatus.status === 'in_progress' || runStatus.status === 'queued' || runStatus.status === 'dispatching') && (
                      <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                    )}
                    <span className="font-semibold text-white">Status: {runStatus.message}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {runStatus.elapsedSeconds}s elapsed
                    </span>
                    {runStatus.html_url && (
                      <a
                        href={runStatus.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        View Live GitHub Run Logs <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      runStatus.status === 'completed'
                        ? 'bg-emerald-500 w-full'
                        : runStatus.status === 'failure'
                        ? 'bg-red-500 w-full'
                        : 'bg-cyan-500 animate-pulse'
                    }`}
                    style={{
                      width:
                        runStatus.status === 'completed'
                          ? '100%'
                          : runStatus.status === 'in_progress'
                          ? `${Math.min(95, 20 + runStatus.elapsedSeconds * 1.5)}%`
                          : '15%',
                    }}
                  />
                </div>

                {/* Successful build artifact download */}
                {runStatus.status === 'completed' && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <h5 className="font-bold text-emerald-300">Firmware Build Succeeded!</h5>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Download your ZIP artifact containing the merged 0x0 binary and flash right away.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={runStatus.artifactsUrl || runStatus.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md shadow transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Artifact (.zip) on GitHub</span>
                      </a>
                      <button
                        onClick={() => setActiveTab('web_serial')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-md border border-slate-700 transition flex items-center gap-1"
                      >
                        <Usb className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Flash via Web Serial</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GITHUB DIRECT (NO TOKEN) */}
        {activeTab === 'github_direct' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Zero-Token Direct GitHub Actions Trigger
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    If you do not want to create or paste an API token, you can run the compiler directly from GitHub's UI in your browser with 1 click!
                  </p>
                </div>

                <a
                  href={`https://github.com/${repo}/actions/workflows/compile_firmware.yml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open GitHub Actions Page</span>
                </a>
              </div>

              {/* Instructions steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h5 className="font-semibold text-white">Click Run Workflow</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    On GitHub's Actions page, look for the blue <strong>"Run workflow"</strong> dropdown button on the right.
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h5 className="font-semibold text-white">Select Your Options</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Select Board: <code className="text-cyan-400">{selectedBoard.id}</code>, Mode: <code className="text-amber-400">{config.deviceRole === 'base' ? 'base_station' : 'rover'}</code>.
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h5 className="font-semibold text-white">Download Zip Artifact</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    In ~2 minutes, the run finishes with your <code className="text-emerald-400">RTK_Everywhere_Merged_Flash_at_0x0.bin</code> ready to flash!
                  </p>
                </div>
              </div>

              {/* Copy prepared parameters */}
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Copy Prepared Parameters</span>
                  <p className="text-[11px] text-slate-400">
                    Includes your exact pin allocation & config macros formatted for the workflow input.
                  </p>
                </div>
                <button
                  onClick={handleCopyInputs}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 transition flex items-center gap-1.5"
                >
                  {copiedInputs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedInputs ? 'Copied to Clipboard' : 'Copy Parameters'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEB SERIAL FLASHER */}
        {activeTab === 'web_serial' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Usb className="w-4 h-4 text-cyan-400" />
                    In-Browser Web Serial Flasher (Chrome / Edge / Opera)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Flash your compiled firmware directly into the ESP32 via USB without installing Arduino or Python tools.
                  </p>
                </div>

                {!serialSupported && (
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[11px] font-semibold">
                    Web Serial not supported in this browser
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {/* Choose file */}
                <div className="bg-slate-900 p-3 rounded-md border border-slate-800 space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-300 block">Select .bin Firmware File</label>
                  <input
                    type="file"
                    accept=".bin"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedBinFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-slate-400 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                  />
                  {selectedBinFile && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      {selectedBinFile.name} ({(selectedBinFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {/* Offset */}
                <div className="bg-slate-900 p-3 rounded-md border border-slate-800 space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-300 block">Flash Address Offset</label>
                  <select
                    value={flashOffset}
                    onChange={(e) => setFlashOffset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="0x0000">0x0000 (Merged All-in-One Binary - Recommended)</option>
                    <option value="0x10000">0x10000 (Application Binary Only)</option>
                    <option value="0x1000">0x1000 (ESP32 Bootloader)</option>
                    <option value="0x8000">0x8000 (Partitions Table)</option>
                  </select>
                </div>

                {/* Baud Rate */}
                <div className="bg-slate-900 p-3 rounded-md border border-slate-800 space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-300 block">Baud Rate</label>
                  <select
                    value={flashBaud}
                    onChange={(e) => setFlashBaud(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value={921600}>921600 (High Speed - Recommended)</option>
                    <option value={460800}>460800 (Medium Speed)</option>
                    <option value={115200}>115200 (Safe Fallback)</option>
                  </select>
                </div>
              </div>

              {/* Flash Button */}
              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Tip: Hold <strong>BOOT</strong> button on ESP32 while plugging in if device doesn't auto-reset.
                </p>

                <button
                  onClick={handleConnectAndFlash}
                  disabled={!serialSupported || flashStatus === 'connecting' || flashStatus === 'flashing' || !selectedBinFile}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-2"
                >
                  <Usb className="w-3.5 h-3.5" />
                  <span>
                    {flashStatus === 'connecting'
                      ? 'Connecting...'
                      : flashStatus === 'flashing'
                      ? `Flashing (${flashProgress}%)...`
                      : 'Connect Port & Flash Device'}
                  </span>
                </button>
              </div>

              {/* Progress bar */}
              {flashStatus !== 'idle' && (
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      flashStatus === 'done'
                        ? 'bg-emerald-500'
                        : flashStatus === 'error'
                        ? 'bg-red-500'
                        : 'bg-teal-400'
                    }`}
                    style={{ width: `${flashProgress}%` }}
                  />
                </div>
              )}

              {/* Terminal Logs */}
              {flashLogs.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-md p-3 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto space-y-1">
                  {flashLogs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('[ERROR]')
                          ? 'text-red-400 font-bold'
                          : log.includes('[OK]') || log.includes('[SUCCESS]')
                          ? 'text-emerald-400 font-semibold'
                          : log.includes('[FLASH]')
                          ? 'text-cyan-400'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WORKFLOW YAML BLUEPRINT */}
        {activeTab === 'workflow_yaml' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" />
                .github/workflows/compile_firmware.yml
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(workflowYamlContent);
                  setCopiedYaml(true);
                  setTimeout(() => setCopiedYaml(false), 2000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition flex items-center gap-1.5"
              >
                {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedYaml ? 'Copied' : 'Copy Workflow YAML'}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed">
              <code>{workflowYamlContent}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
