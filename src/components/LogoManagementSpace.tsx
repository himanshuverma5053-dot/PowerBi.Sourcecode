import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Image as ImageIcon, Trash2, RefreshCw, CheckCircle2, ShieldCheck,
  Download, Sparkles, Eye, AlertCircle, FileCheck, Sliders, RotateCcw,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlignCenter, AlignLeft, AlignRight,
  ZoomIn, ZoomOut, Move, Maximize2
} from 'lucide-react';
import {
  getOfficialLogoSettings, saveOfficialLogo, saveOfficialLogoSettings,
  resetOfficialLogoDisplaySettings, deleteOfficialLogo, isCustomLogoSet,
  DEFAULT_LOGO_URL, LogoDisplaySettings, DEFAULT_LOGO_SETTINGS
} from '../utils/logoStorage';
import { MagadhSparshLogo } from './MagadhSparshLogo';

interface LogoManagementSpaceProps {
  showToast?: (msg: string) => void;
}

export const LogoManagementSpace: React.FC<LogoManagementSpaceProps> = ({ showToast }) => {
  const [settings, setSettings] = useState<LogoDisplaySettings>(() => getOfficialLogoSettings());
  const [isCustom, setIsCustom] = useState<boolean>(() => isCustomLogoSet());
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'grid'>('light');
  const [imageSpecs, setImageSpecs] = useState<{ width: number; height: number; sizeKb?: number; format?: string }>({
    width: 0,
    height: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load logo specs whenever logo URL changes
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      let sizeKb: number | undefined;
      let format = 'SVG / Image';

      const logoUrl = settings.url;
      if (logoUrl.startsWith('data:')) {
        const mimeMatch = logoUrl.match(/^data:(image\/[a-zA-Z0-9+-]+);base64,/);
        if (mimeMatch) {
          format = mimeMatch[1].replace('image/', '').toUpperCase();
        }
        const stringLength = logoUrl.length - (logoUrl.indexOf(',') + 1);
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896418618744;
        sizeKb = Math.round((sizeInBytes / 1024) * 10) / 10;
      } else {
        format = logoUrl.endsWith('.svg') ? 'SVG' : 'Image';
      }

      setImageSpecs({
        width: img.naturalWidth || 440,
        height: img.naturalHeight || 80,
        sizeKb,
        format,
      });
    };
    img.src = settings.url;
  }, [settings.url]);

  // Handle setting updates and persist
  const updateSetting = <K extends keyof LogoDisplaySettings>(key: K, value: LogoDisplaySettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveOfficialLogoSettings({ [key]: value });
  };

  const handleFileChange = (file: File) => {
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (SVG, PNG, JPEG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image file is too large. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const success = saveOfficialLogo(result);
        if (success) {
          const newSettings = getOfficialLogoSettings();
          setSettings(newSettings);
          setIsCustom(true);
          if (showToast) showToast('Official website logo updated! The original asset is stored untouched.');
        } else {
          setUploadError('Failed to save logo asset. Storage space might be full.');
        }
      }
    };
    reader.onerror = () => {
      setUploadError('Error reading uploaded file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleResetDisplay = () => {
    resetOfficialLogoDisplaySettings();
    const updated = getOfficialLogoSettings();
    setSettings(updated);
    if (showToast) showToast('Display size and position reset to default.');
  };

  const handleDeleteLogo = () => {
    if (window.confirm('Are you sure you want to delete the uploaded custom logo and restore the default system logo?')) {
      deleteOfficialLogo();
      const updated = getOfficialLogoSettings();
      setSettings(updated);
      setIsCustom(false);
      setUploadError(null);
      if (showToast) showToast('Custom logo deleted. Default system logo restored.');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = settings.url;
    link.download = `official-logo-${Date.now()}.${imageSpecs.format?.toLowerCase() || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nudge = (dx: number, dy: number) => {
    const newX = Math.min(100, Math.max(-100, (settings.offsetX || 0) + dx));
    const newY = Math.min(100, Math.max(-100, (settings.offsetY || 0) + dy));
    updateSetting('offsetX', newX);
    updateSetting('offsetY', newY);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Administrator Control Panel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display flex items-center gap-2">
            Website Logo Asset & Display Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Upload, replace, resize, and reposition the website logo without modifying the original asset file. All changes apply across the entire site instantly in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isCustom && (
            <button
              onClick={handleDeleteLogo}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Logo</span>
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-200 hover:shadow-purple-300"
          >
            <Upload className="w-4 h-4" />
            <span>{isCustom ? 'Replace Logo Asset' : 'Upload New Logo'}</span>
          </button>
        </div>
      </div>

      {/* Upload Drag & Drop Dropzone */}
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileInputChange}
        />

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
            isDragging
              ? 'border-purple-600 bg-purple-50/90 scale-[1.01]'
              : 'border-purple-200 bg-slate-50/70 hover:bg-purple-50/40 hover:border-purple-400'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 border border-purple-200/80 flex items-center justify-center text-purple-700 shadow-sm">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              <span className="text-purple-600 underline decoration-purple-300 underline-offset-2">Click to browse</span> or drag & drop logo file here
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Original file is preserved without AI modifications or quality loss (SVG, PNG, JPEG, WEBP)
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Resize & Reposition Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 border border-purple-100 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2 text-slate-900">
              <Sliders className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-black font-display">Display Size & Placement</h3>
            </div>
            <button
              onClick={handleResetDisplay}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Reset size and offsets to default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Controls</span>
            </button>
          </div>

          {/* 1. Resize Controls: Zoom Scale */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <ZoomIn className="w-4 h-4 text-purple-600" />
                <span>Display Scale (Zoom)</span>
              </label>
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                {Math.round((settings.scale || 1) * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={settings.scale || 1.0}
              onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((preset) => (
                <button
                  key={preset}
                  onClick={() => updateSetting('scale', preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    settings.scale === preset
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* 2. Base Height Cap */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-purple-600" />
                <span>Base Display Height</span>
              </label>
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                {settings.maxHeight || 36} px
              </span>
            </div>

            <input
              type="range"
              min="16"
              max="100"
              step="2"
              value={settings.maxHeight || 36}
              onChange={(e) => updateSetting('maxHeight', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[24, 32, 36, 48, 64, 80].map((h) => (
                <button
                  key={h}
                  onClick={() => updateSetting('maxHeight', h)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    settings.maxHeight === h
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {h}px
                </button>
              ))}
            </div>
          </div>

          {/* 3. Repositioning: X & Y Offsets */}
          <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Move className="w-4 h-4 text-purple-600" />
                <span>Position Offsets</span>
              </label>
              <button
                onClick={() => { updateSetting('offsetX', 0); updateSetting('offsetY', 0); }}
                className="text-[11px] text-purple-600 hover:underline font-bold"
              >
                Center Position (0,0)
              </button>
            </div>

            {/* Horizontal Offset X */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span>Horizontal (X):</span>
                <span className="font-mono font-bold text-slate-900">{settings.offsetX || 0} px</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={settings.offsetX || 0}
                onChange={(e) => updateSetting('offsetX', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Vertical Offset Y */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span>Vertical (Y):</span>
                <span className="font-mono font-bold text-slate-900">{settings.offsetY || 0} px</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={settings.offsetY || 0}
                onChange={(e) => updateSetting('offsetY', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Precision Nudge Pad */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Fine Precision Pad:</span>
              <div className="inline-flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => nudge(-2, 0)}
                  className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-700"
                  title="Nudge Left (-2px)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => nudge(0, -2)}
                  className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-700"
                  title="Nudge Up (-2px)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => nudge(0, 2)}
                  className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-700"
                  title="Nudge Down (+2px)"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => nudge(2, 0)}
                  className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-700"
                  title="Nudge Right (+2px)"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Alignment Placement */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <label className="text-xs font-bold text-slate-800 block">
              Horizontal Layout Alignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSetting('alignment', 'left')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  settings.alignment === 'left'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Left</span>
              </button>

              <button
                onClick={() => updateSetting('alignment', 'center')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  settings.alignment === 'center'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span>Center</span>
              </button>

              <button
                onClick={() => updateSetting('alignment', 'right')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  settings.alignment === 'right'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
                <span>Right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview Stage (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* Main Stage Canvas Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300">
                  Live Stage Preview
                </h3>
              </div>

              {/* Background Style Switcher */}
              <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs font-medium space-x-1">
                <button
                  onClick={() => setPreviewBg('light')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewBg === 'light' ? 'bg-white text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setPreviewBg('dark')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewBg === 'dark' ? 'bg-purple-950 text-white font-bold border border-purple-700 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setPreviewBg('grid')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewBg === 'grid' ? 'bg-slate-700 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Checker
                </button>
              </div>
            </div>

            {/* Realtime Canvas Display Box */}
            <div
              className={`min-h-[220px] rounded-2xl p-8 flex items-center transition-all duration-300 relative border overflow-hidden ${
                previewBg === 'light'
                  ? 'bg-white border-slate-200'
                  : previewBg === 'dark'
                  ? 'bg-purple-950/90 border-purple-800/60'
                  : 'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-800 border-slate-700'
              }`}
            >
              <div className="w-full flex" style={{ justifyContent: settings.alignment === 'left' ? 'flex-start' : settings.alignment === 'right' ? 'flex-end' : 'center' }}>
                <MagadhSparshLogo size="md" />
              </div>

              {/* Live Overlay Badge showing current position stats */}
              <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-[10px] font-mono text-amber-300 flex items-center gap-2">
                <span>Scale: {Math.round((settings.scale || 1) * 100)}%</span>
                <span>•</span>
                <span>Off: ({settings.offsetX || 0}px, {settings.offsetY || 0}px)</span>
                <span>•</span>
                <span>Height: {settings.maxHeight || 36}px</span>
              </div>
            </div>

            {/* Asset Metadata & Download */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Asset Type: <strong className="text-white">{isCustom ? 'Custom Uploaded Image' : 'System Default Vector'}</strong> ({imageSpecs.width}×{imageSpecs.height} px)
                </span>
              </div>

              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 font-bold transition-all border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </button>
            </div>
          </div>

          {/* Website Context Live Previews */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Real-Time Website Context Previews</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Context 1: Header Navbar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">Top Navbar Header</span>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                  <MagadhSparshLogo size="md" />
                  <div className="flex gap-1.5">
                    <div className="w-12 h-6 bg-slate-100 rounded-md" />
                    <div className="w-10 h-6 bg-purple-600 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Context 2: Dark Footer */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">Website Footer Bar</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex items-center justify-between text-white">
                  <MagadhSparshLogo size="md" />
                  <span className="text-[10px] text-slate-400">© 2026 magadh Sparsh</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
