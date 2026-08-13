import React, { useState, useRef, useMemo } from 'react';
import { 
  Clapperboard, Play, Pause, RotateCcw, 
  Upload, Download, Trash2, Plus, 
  FileText, Wand2, Palette, ShieldCheck, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CopyButton from '../CopyButton';
import { trackToolAction } from '../../lib/traffic';

export interface SubtitleLine {
  id: string;
  start: string; // HH:MM:SS,mmm
  end: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

// Convert seconds (e.g. 74.25) to SRT timestamp "00:01:14,250"
export function secondsToTimestamp(sec: number, format: 'srt' | 'vtt' = 'srt'): string {
  if (isNaN(sec) || sec < 0) sec = 0;
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = Math.floor(sec % 60);
  const milliseconds = Math.floor((sec % 1) * 1000);

  const pad = (n: number, z = 2) => ('000' + n).slice(-z);
  const separator = format === 'srt' ? ',' : '.';
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${pad(milliseconds, 3)}`;
}

// Convert timestamp "00:01:14,250" to seconds
export function timestampToSeconds(timestamp: string): number {
  if (!timestamp) return 0;
  const cleaned = timestamp.trim().replace(',', '.');
  const parts = cleaned.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return parseFloat(cleaned) || 0;
}

export default function VideoSubtitleStudio() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'naskah' | 'style' | 'export'>('editor');

  // Subtitle styling
  const [fontSize, setFontSize] = useState<number>(22);
  const [textColor, setTextColor] = useState<string>('#facc15'); // Yellow
  const [bgColor, setBgColor] = useState<string>('rgba(0,0,0,0.8)');
  const [subPosition, setSubPosition] = useState<'bottom' | 'center' | 'top'>('bottom');

  // Subtitle lines
  const [subFormat, setSubFormat] = useState<'srt' | 'vtt'>('srt');
  const [sublines, setSublines] = useState<SubtitleLine[]>([
    {
      id: '1',
      start: '00:00:00,500',
      end: '00:00:03,500',
      startSeconds: 0.5,
      endSeconds: 3.5,
      text: 'Halo! Selamat datang di editor subtitle Alat Ajaib.'
    },
    {
      id: '2',
      start: '00:00:03,800',
      end: '00:00:07,500',
      startSeconds: 3.8,
      endSeconds: 7.5,
      text: 'Unggah video Anda dan atur teks sesuai detik pemutaran video.'
    },
    {
      id: '3',
      start: '00:00:08,000',
      end: '00:00:12,000',
      startSeconds: 8.0,
      endSeconds: 12.0,
      text: 'Hasil subtitle dapat diunduh dalam format .SRT atau .VTT siap pakai.'
    }
  ]);

  const [rawScriptText, setRawScriptText] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(sec, duration || 9999));
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setIsPlaying(false);
    }
  };

  // Current active subtitle line on video
  const activeSubtitle = useMemo(() => {
    return sublines.find((line) => {
      return currentTime >= line.startSeconds && currentTime <= line.endSeconds;
    });
  }, [sublines, currentTime]);

  // Split Script into timed subtitles
  const handleAutoSplitScript = () => {
    if (!rawScriptText.trim()) {
      alert('Silakan tempel teks naskah Anda terlebih dahulu.');
      return;
    }

    const sentences = rawScriptText
      .replace(/([.?!])\s+/g, '$1\n')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) return;

    const totalDur = duration > 0 ? duration : (sentences.length * 3.5);
    const durPerSent = Math.max(2, totalDur / sentences.length);

    const generated: SubtitleLine[] = sentences.map((sentence, idx) => {
      const startSec = idx * durPerSent;
      const endSec = Math.min(totalDur, (idx + 1) * durPerSent - 0.2);

      return {
        id: Math.random().toString(),
        start: secondsToTimestamp(startSec, subFormat),
        end: secondsToTimestamp(endSec, subFormat),
        startSeconds: startSec,
        endSeconds: endSec,
        text: sentence
      };
    });

    setSublines(generated);
    setActiveTab('editor');
  };

  // Add line
  const handleAddLine = () => {
    const last = sublines[sublines.length - 1];
    const newStartSec = last ? last.endSeconds + 0.2 : currentTime;
    const newEndSec = newStartSec + 3;

    const newLine: SubtitleLine = {
      id: Math.random().toString(),
      start: secondsToTimestamp(newStartSec, subFormat),
      end: secondsToTimestamp(newEndSec, subFormat),
      startSeconds: newStartSec,
      endSeconds: newEndSec,
      text: 'Tulis kalimat subtitle...'
    };

    setSublines(prev => [...prev, newLine]);
  };

  // Update line
  const handleUpdateLine = (id: string, field: 'start' | 'end' | 'text', val: string) => {
    setSublines(prev => prev.map(line => {
      if (line.id !== id) return line;

      if (field === 'start') {
        const sec = timestampToSeconds(val);
        return { ...line, start: val, startSeconds: sec };
      } else if (field === 'end') {
        const sec = timestampToSeconds(val);
        return { ...line, end: val, endSeconds: sec };
      } else {
        return { ...line, text: val };
      }
    }));
  };

  // Delete line
  const handleDeleteLine = (id: string) => {
    setSublines(prev => prev.filter(line => line.id !== id));
  };

  // Sync with current video player time
  const setLineTimeToCurrent = (id: string, type: 'start' | 'end') => {
    setSublines(prev => prev.map(line => {
      if (line.id !== id) return line;
      const formatted = secondsToTimestamp(currentTime, subFormat);
      if (type === 'start') {
        return {
          ...line,
          start: formatted,
          startSeconds: currentTime,
          end: line.endSeconds <= currentTime ? secondsToTimestamp(currentTime + 2.5, subFormat) : line.end,
          endSeconds: line.endSeconds <= currentTime ? currentTime + 2.5 : line.endSeconds
        };
      } else {
        return {
          ...line,
          end: formatted,
          endSeconds: currentTime
        };
      }
    }));
  };

  // Generate output file
  const generateSubtitleFileContent = (format: 'srt' | 'vtt'): string => {
    if (format === 'srt') {
      return sublines.map((line, idx) => {
        const start = secondsToTimestamp(line.startSeconds, 'srt');
        const end = secondsToTimestamp(line.endSeconds, 'srt');
        return `${idx + 1}\n${start} --> ${end}\n${line.text}`;
      }).join('\n\n') + '\n\n';
    } else {
      return 'WEBVTT\n\n' + sublines.map((line, idx) => {
        const start = secondsToTimestamp(line.startSeconds, 'vtt');
        const end = secondsToTimestamp(line.endSeconds, 'vtt');
        return `${idx + 1}\n${start} --> ${end}\n${line.text}`;
      }).join('\n\n') + '\n\n';
    }
  };

  const handleDownloadSubtitle = (format: 'srt' | 'vtt') => {
    const content = generateSubtitleFileContent(format);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = videoFile ? videoFile.name.replace(/\.[^/.]+$/, '') : 'Subtitle';
    link.download = `${baseName}.${format}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    confetti({ particleCount: 30, spread: 60 });
    trackToolAction('subtitle-generator');
  };

  // Import SRT / VTT file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content) return;

        const lines = content.split(/\r?\n/);
        const parsed: SubtitleLine[] = [];
        let currentStart = '';
        let currentEnd = '';
        let textLines: string[] = [];

        const timeRegex = /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/;

        lines.forEach(line => {
          const trimmed = line.trim();
          const match = trimmed.match(timeRegex);

          if (match) {
            if (currentStart && textLines.length > 0) {
              const startSec = timestampToSeconds(currentStart);
              const endSec = timestampToSeconds(currentEnd);
              parsed.push({
                id: Math.random().toString(),
                start: currentStart,
                end: currentEnd,
                startSeconds: startSec,
                endSeconds: endSec,
                text: textLines.join(' ')
              });
              textLines = [];
            }
            currentStart = match[1];
            currentEnd = match[2];
          } else if (trimmed === '' || /^\d+$/.test(trimmed)) {
            if (currentStart && textLines.length > 0) {
              const startSec = timestampToSeconds(currentStart);
              const endSec = timestampToSeconds(currentEnd);
              parsed.push({
                id: Math.random().toString(),
                start: currentStart,
                end: currentEnd,
                startSeconds: startSec,
                endSeconds: endSec,
                text: textLines.join(' ')
              });
              currentStart = '';
              currentEnd = '';
              textLines = [];
            }
          } else if (currentStart) {
            textLines.push(trimmed);
          }
        });

        if (currentStart && textLines.length > 0) {
          const startSec = timestampToSeconds(currentStart);
          const endSec = timestampToSeconds(currentEnd);
          parsed.push({
            id: Math.random().toString(),
            start: currentStart,
            end: currentEnd,
            startSeconds: startSec,
            endSeconds: endSec,
            text: textLines.join(' ')
          });
        }

        if (parsed.length > 0) {
          setSublines(parsed);
        } else {
          alert('Format file tidak dikenali. Gunakan berkas .srt atau .vtt standar.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT: VIDEO PLAYER WITH LIVE SUBTITLE */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white space-y-3">
            
            {/* VIDEO FRAME */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                  playsInline
                />
              ) : (
                <div className="text-center p-4 space-y-2">
                  <Clapperboard className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Unggah video (.mp4, .webm, .mov)</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Pilih Video
                  </button>
                </div>
              )}

              {/* LIVE SUBTITLE OVERLAY */}
              {activeSubtitle && (
                <div 
                  className={`absolute left-0 right-0 px-4 pointer-events-none flex justify-center ${
                    subPosition === 'bottom' ? 'bottom-4' :
                    subPosition === 'top' ? 'top-4' : 'top-1/2 -translate-y-1/2'
                  }`}
                >
                  <div 
                    className="px-3 py-1 rounded-lg text-center max-w-[90%] font-bold leading-snug shadow-md"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      fontSize: `${fontSize}px`,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                    }}
                  >
                    {activeSubtitle.text}
                  </div>
                </div>
              )}
            </div>

            {/* CONTROLS */}
            <div className="space-y-2 bg-slate-900/80 p-2.5 rounded-xl">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg accent-emerald-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-3xs font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">{secondsToTimestamp(currentTime, subFormat)}</span>
                <span>{secondsToTimestamp(duration, subFormat)}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={togglePlay}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                  </button>

                  <button
                    onClick={() => seekTo(0)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title="Ulangi"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-3xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> Ganti Video
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={handleVideoUpload} 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: SUBTITLE EDITOR */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* TAB BUTTONS */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'editor' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Baris ({sublines.length})
            </button>
            <button
              onClick={() => setActiveTab('naskah')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'naskah' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Naskah
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'style' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Gaya
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                activeTab === 'export' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Unduh
            </button>
          </div>

          {/* TAB 1: LIST */}
          {activeTab === 'editor' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl space-y-2.5">
              
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleAddLine}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baris
                </button>
                <label className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-3xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Impor SRT
                  <input type="file" accept=".srt,.vtt,.txt" className="hidden" onChange={handleImportFile} />
                </label>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {sublines.map((line, idx) => {
                  const isCurrent = currentTime >= line.startSeconds && currentTime <= line.endSeconds;
                  return (
                    <div 
                      key={line.id} 
                      className={`p-2 rounded-xl border text-xs space-y-1.5 ${
                        isCurrent 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-3xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => seekTo(line.startSeconds)}
                            className="p-1 bg-emerald-600 text-white rounded font-bold"
                            title="Putar dari detik ini"
                          >
                            <Play className="w-2.5 h-2.5 fill-white" />
                          </button>
                          <span className="font-bold text-slate-400">#{idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1 font-mono">
                          <input
                            type="text"
                            value={line.start}
                            onChange={(e) => handleUpdateLine(line.id, 'start', e.target.value)}
                            className="w-18 px-1 py-0.5 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded text-center text-3xs"
                          />
                          <span>→</span>
                          <input
                            type="text"
                            value={line.end}
                            onChange={(e) => handleUpdateLine(line.id, 'end', e.target.value)}
                            className="w-18 px-1 py-0.5 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded text-center text-3xs"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteLine(line.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={line.text}
                        onChange={(e) => handleUpdateLine(line.id, 'text', e.target.value)}
                        className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      />

                      <div className="flex items-center gap-1.5 text-3xs">
                        <button
                          onClick={() => setLineTimeToCurrent(line.id, 'start')}
                          className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 font-bold rounded"
                        >
                          Mulai = Waktu Video
                        </button>
                        <button
                          onClick={() => setLineTimeToCurrent(line.id, 'end')}
                          className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 font-bold rounded"
                        >
                          Selesai = Waktu Video
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: NASKAH SPLIT */}
          {activeTab === 'naskah' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl space-y-2.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Tempel Teks Naskah</label>
              <textarea
                rows={6}
                value={rawScriptText}
                onChange={(e) => setRawScriptText(e.target.value)}
                placeholder="Tempel naskah atau lirik di sini untuk dibagi menjadi baris subtitle otomatis..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
              />
              <button
                onClick={handleAutoSplitScript}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Bagi Jadi Baris Subtitle
              </button>
            </div>
          )}

          {/* TAB 3: STYLE */}
          {activeTab === 'style' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400 text-3xs">
                  <span>Ukuran Huruf</span>
                  <span>{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="36"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Warna Teks</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>

                <div>
                  <label className="text-3xs font-bold text-slate-500 uppercase block mb-1">Posisi Layar</label>
                  <select
                    value={subPosition}
                    onChange={(e) => setSubPosition(e.target.value as any)}
                    className="w-full p-1.5 bg-slate-100 dark:bg-slate-800 border rounded-lg text-xs"
                  >
                    <option value="bottom">Bawah</option>
                    <option value="center">Tengah</option>
                    <option value="top">Atas</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT */}
          {activeTab === 'export' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl space-y-2.5">
              <button
                onClick={() => handleDownloadSubtitle('srt')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Download Berkas .SRT
              </button>

              <button
                onClick={() => handleDownloadSubtitle('vtt')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border"
              >
                <Download className="w-4 h-4" /> Download Berkas .VTT
              </button>

              <div className="pt-1">
                <CopyButton
                  textToCopy={generateSubtitleFileContent('srt')}
                  label="Salin Teks SRT"
                  size="sm"
                  variant="secondary"
                />
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
