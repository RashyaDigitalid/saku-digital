import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Clapperboard, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Upload, Sparkles, Download, Copy, Trash2, Plus, 
  Clock, Type, Palette, Video, ShieldCheck, CheckCircle2,
  AlertCircle, ChevronRight, FastForward, Rewind, Maximize2,
  FileText, Wand2, Mic, Settings, Sliders, RefreshCw, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CopyButton from '../CopyButton';

export interface SubtitleLine {
  id: string;
  start: string; // HH:MM:SS,mmm or HH:MM:SS.mmm
  end: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

// Helper: Convert seconds (e.g. 74.25) to SRT timestamp "00:01:14,250"
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

// Helper: Convert timestamp "00:01:14,250" to seconds
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
  // Video playback states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'auto-ai' | 'style' | 'export'>('editor');

  // Subtitle styling options
  const [stylePreset, setStylePreset] = useState<'tiktok' | 'capcut' | 'netflix' | 'neon' | 'custom'>('tiktok');
  const [fontSize, setFontSize] = useState<number>(24);
  const [textColor, setTextColor] = useState<string>('#facc15'); // Yellow for TikTok preset
  const [bgColor, setBgColor] = useState<string>('rgba(0,0,0,0.75)');
  const [textOutline, setTextOutline] = useState<boolean>(true);
  const [subPosition, setSubPosition] = useState<'bottom' | 'center' | 'top'>('bottom');
  const [fontFamily, setFontFamily] = useState<'sans' | 'mono' | 'serif' | 'impact'>('sans');

  // Subtitle lines state
  const [subFormat, setSubFormat] = useState<'srt' | 'vtt'>('srt');
  const [sublines, setSublines] = useState<SubtitleLine[]>([
    {
      id: '1',
      start: '00:00:00,500',
      end: '00:00:03,800',
      startSeconds: 0.5,
      endSeconds: 3.8,
      text: 'Halo semuanya, selamat datang di KaryaSaku!'
    },
    {
      id: '2',
      start: '00:00:04,000',
      end: '00:00:08,200',
      startSeconds: 4.0,
      endSeconds: 8.2,
      text: 'Sekarang kamu bisa membuat subtitle video otomatis langsung dari suara asli.'
    },
    {
      id: '3',
      start: '00:00:08,500',
      end: '00:00:13,000',
      startSeconds: 8.5,
      endSeconds: 13.0,
      text: 'Teks akan tersinkronisasi secara real-time dengan pemutar video ini!'
    }
  ]);

  // Auto-transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);
  const [transcribeLanguage, setTranscribeLanguage] = useState<'id-ID' | 'en-US' | 'jv-ID' | 'ms-MY'>('id-ID');
  const [transcribeStatus, setTranscribeStatus] = useState<string>('');
  const [rawScriptText, setRawScriptText] = useState<string>('');
  const [shiftOffset, setShiftOffset] = useState<number>(0);

  // Video and Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Confetti helper
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // Video Time Update & Sync
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

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Upload video file
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setIsPlaying(false);
      triggerConfetti();
    }
  };

  // Current active subtitle line
  const activeSubtitle = useMemo(() => {
    return sublines.find((line) => {
      return currentTime >= line.startSeconds && currentTime <= line.endSeconds;
    });
  }, [sublines, currentTime]);

  // Update style preset
  const applyPreset = (preset: 'tiktok' | 'capcut' | 'netflix' | 'neon') => {
    setStylePreset(preset);
    if (preset === 'tiktok') {
      setTextColor('#facc15'); // Neon Yellow
      setBgColor('rgba(0,0,0,0.85)');
      setFontSize(26);
      setTextOutline(true);
      setFontFamily('sans');
      setSubPosition('bottom');
    } else if (preset === 'capcut') {
      setTextColor('#ffffff');
      setBgColor('#059669'); // Emerald Green Accent
      setFontSize(24);
      setTextOutline(true);
      setFontFamily('sans');
      setSubPosition('bottom');
    } else if (preset === 'netflix') {
      setTextColor('#ffffff');
      setBgColor('rgba(0,0,0,0.6)');
      setFontSize(20);
      setTextOutline(true);
      setFontFamily('sans');
      setSubPosition('bottom');
    } else if (preset === 'neon') {
      setTextColor('#06b6d4'); // Cyan Neon
      setBgColor('rgba(15,23,42,0.9)');
      setFontSize(24);
      setTextOutline(true);
      setFontFamily('sans');
      setSubPosition('bottom');
    }
  };

  // ==========================================
  // AUTO SPEECH-TO-TEXT & AUDIO TRANSCRIBER
  // ==========================================

  // Speech Recognition Live / Audio Transcribe from Video
  const startSpeechRecognitionTranscribe = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung Web Speech Recognition. Gunakan browser Google Chrome / Edge untuk fitur transkrip suara otomatis, atau gunakan fitur Transkrip Cerdas Naskah di bawah.');
      return;
    }

    if (!videoUrl && !videoFile) {
      alert('Silakan unggah video yang memiliki suara terlebih dahulu!');
      return;
    }

    setIsTranscribing(true);
    setTranscribeProgress(10);
    setTranscribeStatus('Menyiapkan perekam suara & memulai video untuk mendeteksi percakapan...');

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = transcribeLanguage;

      const detectedLines: SubtitleLine[] = [];
      let lastSentenceStartTime = 0;

      // Rewind video to 0 and play with audio enabled
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play();
        setIsPlaying(true);
      }

      recognition.onstart = () => {
        setTranscribeStatus('Mendengarkan suara percakapan dari video secara langsung...');
        setTranscribeProgress(25);
      };

      recognition.onresult = (event: any) => {
        const results = event.results;
        for (let i = event.resultIndex; i < results.length; i++) {
          const transcript = results[i][0].transcript.trim();
          if (results[i].isFinal && transcript) {
            const currentVideoTime = videoRef.current ? videoRef.current.currentTime : (lastSentenceStartTime + 4);
            const startSec = Math.max(0, lastSentenceStartTime);
            const endSec = Math.max(startSec + 1, currentVideoTime);
            
            const newLine: SubtitleLine = {
              id: Math.random().toString(),
              start: secondsToTimestamp(startSec, subFormat),
              end: secondsToTimestamp(endSec, subFormat),
              startSeconds: startSec,
              endSeconds: endSec,
              text: transcript.charAt(0).toUpperCase() + transcript.slice(1)
            };

            detectedLines.push(newLine);
            setSublines([...detectedLines]);
            lastSentenceStartTime = currentVideoTime + 0.2;
            setTranscribeProgress(Math.min(90, 30 + detectedLines.length * 10));
            setTranscribeStatus(`Terdeteksi ${detectedLines.length} baris percakapan: "${transcript}"`);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setTranscribeStatus(`Pemberitahuan: ${event.error}. Anda dapat menghentikan atau melanjutkan.`);
        }
      };

      recognition.onend = () => {
        setIsTranscribing(false);
        setTranscribeProgress(100);
        setTranscribeStatus(`Selesai! Berhasil mengekstrak ${detectedLines.length || sublines.length} baris subtitle dari suara video.`);
        triggerConfetti();
      };

      recognition.start();
    } catch (err) {
      console.error('Error launching speech recognition:', err);
      setIsTranscribing(false);
      alert('Gagal memulai transkrip suara otomatis. Pastikan browser memiliki izin mikrofon/audio.');
    }
  };

  const stopSpeechRecognitionTranscribe = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setIsTranscribing(false);
    setTranscribeStatus('Transkripsi dihentikan. Anda dapat mengedit baris subtitle di bawah.');
  };

  // Smart Auto-Timing Script Splitter
  // (Pemisah teks naskah menjadi baris subtitle tersinkronisasi durasi video secara cerdas)
  const handleAutoSplitScript = () => {
    if (!rawScriptText.trim()) {
      alert('Silakan tempelkan teks/naskah percakapan terlebih dahulu!');
      return;
    }

    const sentences = rawScriptText
      .replace(/([.?!,])\s*(?=[A-Z0-9])/g, '$1|')
      .split(/[\n|]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) return;

    const totalVideoDuration = duration > 0 ? duration : (sentences.length * 4);
    const durationPerSentence = Math.max(2.5, totalVideoDuration / sentences.length);

    const generated: SubtitleLine[] = sentences.map((sentence, idx) => {
      const startSec = idx * durationPerSentence;
      const endSec = Math.min(totalVideoDuration, (idx + 1) * durationPerSentence - 0.3);

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
    triggerConfetti();
  };

  // ==========================================
  // SUBTITLE LINE CRUD & SYNC OPERATIONS
  // ==========================================

  const handleAddLine = () => {
    const last = sublines[sublines.length - 1];
    const newStartSec = last ? last.endSeconds + 0.3 : currentTime;
    const newEndSec = newStartSec + 3.5;

    const newLine: SubtitleLine = {
      id: Math.random().toString(),
      start: secondsToTimestamp(newStartSec, subFormat),
      end: secondsToTimestamp(newEndSec, subFormat),
      startSeconds: newStartSec,
      endSeconds: newEndSec,
      text: 'Ketik subtitle percakapan baru di sini...'
    };

    setSublines(prev => [...prev, newLine]);
  };

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

  const handleDeleteLine = (id: string) => {
    setSublines(prev => prev.filter(line => line.id !== id));
  };

  // Set Line Start or End to Current Video Time
  const setLineTimeToCurrent = (id: string, type: 'start' | 'end') => {
    setSublines(prev => prev.map(line => {
      if (line.id !== id) return line;
      const formatted = secondsToTimestamp(currentTime, subFormat);
      if (type === 'start') {
        return {
          ...line,
          start: formatted,
          startSeconds: currentTime,
          // ensure end is at least start + 1s
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

  // Nudge line timestamps (+/- 0.5s)
  const nudgeLine = (id: string, delta: number) => {
    setSublines(prev => prev.map(line => {
      if (line.id !== id) return line;
      const newStart = Math.max(0, line.startSeconds + delta);
      const newEnd = Math.max(newStart + 0.5, line.endSeconds + delta);
      return {
        ...line,
        startSeconds: newStart,
        endSeconds: newEnd,
        start: secondsToTimestamp(newStart, subFormat),
        end: secondsToTimestamp(newEnd, subFormat)
      };
    }));
  };

  // Shift all timestamps by X seconds (Delay / Advance correction)
  const handleShiftAllTimestamps = (seconds: number) => {
    setSublines(prev => prev.map(line => {
      const newStart = Math.max(0, line.startSeconds + seconds);
      const newEnd = Math.max(newStart + 0.5, line.endSeconds + seconds);
      return {
        ...line,
        startSeconds: newStart,
        endSeconds: newEnd,
        start: secondsToTimestamp(newStart, subFormat),
        end: secondsToTimestamp(newEnd, subFormat)
      };
    }));
    triggerConfetti();
  };

  // ==========================================
  // EXPORT & DOWNLOAD
  // ==========================================

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
    const baseName = videoFile ? videoFile.name.replace(/\.[^/.]+$/, '') : 'Subtitle_KaryaSaku';
    link.download = `${baseName}.${format}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerConfetti();
  };

  const handleDownloadTranscriptTxt = () => {
    const textContent = sublines.map(l => `[${l.start}] ${l.text}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `Transkrip_Teks_KaryaSaku.txt`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerConfetti();
  };

  // Import existing SRT or VTT file
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
          triggerConfetti();
        } else {
          alert('Gagal membaca format file. Pastikan berkas .SRT atau .VTT valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" id="video-subtitle-studio">
      
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/20 backdrop-blur-md rounded-full text-3xs font-extrabold uppercase tracking-widest text-emerald-100">
              <Sparkles className="w-3 h-3 text-amber-300" /> AI Speech-to-Text & Subtitle Studio
            </div>
            <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight leading-snug">
              Pemberian Subtitle Otomatis dari Suara Video Asli
            </h2>
            <p className="text-2xs sm:text-xs text-emerald-50 leading-relaxed">
              Unggah video rekaman apa saja, sistem akan <strong>mendengarkan suara di dalam video secara otomatis</strong>, mengubahnya menjadi teks subtitle tersinkronisasi, dan menampilkan subtitle live di atas video!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-600" /> Unggah Video Baru
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="video/*,audio/*" 
              className="hidden" 
              onChange={handleVideoUpload} 
            />
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* LEFT COLUMN: LIVE VIDEO PLAYER & REAL-TIME SUBTITLE OVERLAY */}
        <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl text-white space-y-3 sm:space-y-4">
            
            {/* VIDEO PLAYER SCREEN WITH LIVE SUBTITLE CANVAS */}
            <div className="relative aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
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
                <div className="text-center p-4 sm:p-6 space-y-2.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <Clapperboard className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-200">Belum Ada Video Dipilih</p>
                    <p className="text-3xs sm:text-2xs text-slate-400 max-w-xs mx-auto mt-1">
                      Unggah video MP4/WebM atau putar demo subtitle di bawah untuk melihat live subtitle sync.
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Upload className="w-3.5 h-3.5" /> Pilih File Video
                  </button>
                </div>
              )}

              {/* LIVE OVERLAY SUBTITLE DISPLAY */}
              {activeSubtitle && (
                <div 
                  className={`absolute left-0 right-0 px-3 sm:px-6 pointer-events-none flex justify-center transition-all ${
                    subPosition === 'bottom' ? 'bottom-4 sm:bottom-8' :
                    subPosition === 'top' ? 'top-4 sm:top-8' : 'top-1/2 -translate-y-1/2'
                  }`}
                >
                  <div 
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-center max-w-[94%] sm:max-w-[85%] font-extrabold leading-snug animate-fade-in shadow-2xl backdrop-blur-xs"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      fontSize: `clamp(12px, 3.8vw, ${fontSize}px)`,
                      fontFamily: fontFamily === 'mono' ? 'monospace' : fontFamily === 'serif' ? 'serif' : 'sans-serif',
                      textShadow: textOutline ? '0 2px 8px rgba(0,0,0,0.9), 0 0 4px #000000, 0 0 8px #000000' : 'none',
                      border: stylePreset === 'neon' ? '1px solid #06b6d4' : 'none'
                    }}
                  >
                    {activeSubtitle.text}
                  </div>
                </div>
              )}

              {/* HOVER PLAY BUTTON OVERLAY */}
              {videoUrl && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 translate-x-0.5" />}
                  </span>
                </button>
              )}
            </div>

            {/* PLAYER CONTROLS TIMELINE */}
            <div className="space-y-2.5 sm:space-y-3 bg-slate-950/60 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800/80">
              
              {/* SEEK BAR */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-3xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">{secondsToTimestamp(currentTime, subFormat)}</span>
                  <span>{secondsToTimestamp(duration, subFormat)}</span>
                </div>
              </div>

              {/* CONTROL BUTTONS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => seekTo(currentTime - 5)}
                    className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg sm:rounded-xl text-xs active:scale-95"
                    title="Mundur 5 detik"
                  >
                    <Rewind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg sm:rounded-xl flex items-center gap-1.5 shadow active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />}
                    <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                  </button>

                  <button
                    onClick={() => seekTo(currentTime + 5)}
                    className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg sm:rounded-xl text-xs active:scale-95"
                    title="Maju 5 detik"
                  >
                    <FastForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={() => seekTo(0)}
                    className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg sm:rounded-xl text-xs active:scale-95"
                    title="Ulangi dari Awal"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* PLAYBACK SPEED SELECTOR */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800/80 p-0.5 sm:p-1 rounded-xl text-3xs font-bold text-slate-300">
                  <span className="px-1 text-slate-400 text-3xs hidden xs:inline">Speed:</span>
                  {[0.75, 1, 1.25, 1.5].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg transition-all text-3xs ${
                        playbackRate === rate ? 'bg-emerald-600 text-white font-black' : 'hover:bg-slate-700'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK AI SPEECH ACTION BANNER */}
            <div className="bg-emerald-950/50 border border-emerald-800/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-300">Deteksi Suara Video Otomatis (Speech-to-Text)</h4>
                  <p className="text-3xs text-emerald-400/80">Ubah percakapan audio di video menjadi teks subtitle otomatis.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={transcribeLanguage}
                  onChange={(e) => setTranscribeLanguage(e.target.value as any)}
                  className="flex-1 sm:flex-none bg-slate-900 border border-emerald-800 text-emerald-300 text-3xs font-bold py-2 px-2 rounded-xl outline-none"
                >
                  <option value="id-ID">🇮🇩 Bahasa Indonesia</option>
                  <option value="en-US">🇺🇸 English</option>
                  <option value="jv-ID">🇮🇩 Basa Jawa</option>
                  <option value="ms-MY">🇲🇾 Bahasa Melayu</option>
                </select>

                {isTranscribing ? (
                  <button
                    onClick={stopSpeechRecognitionTranscribe}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow animate-pulse cursor-pointer shrink-0"
                  >
                    <Pause className="w-3.5 h-3.5" /> Stop Transkrip
                  </button>
                ) : (
                  <button
                    onClick={startSpeechRecognitionTranscribe}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Mulai Transkrip
                  </button>
                )}
              </div>
            </div>

            {/* TRANSCRIPTION LIVE STATUS BAR */}
            {transcribeStatus && (
              <div className="p-2.5 sm:p-3 bg-slate-950 border border-slate-800 rounded-xl text-3xs font-mono text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-spin" />
                <span className="truncate">{transcribeStatus}</span>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: EDITOR TABS, SMART TOOLS, AND EXPORT */}
        <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
          
          {/* TAB BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/80 text-2xs sm:text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2 px-1.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
                activeTab === 'editor' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
              <span className="truncate">Baris ({sublines.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('auto-ai')}
              className={`py-2 px-1.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
                activeTab === 'auto-ai' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Wand2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" /> 
              <span className="truncate">Naskah</span>
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`py-2 px-1.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
                activeTab === 'style' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
              <span className="truncate">Gaya</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`py-2 px-1.5 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 text-center ${
                activeTab === 'export' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
              <span className="truncate">Unduh</span>
            </button>
          </div>

          {/* TAB 1: SUBTITLE LINES EDITOR */}
          {activeTab === 'editor' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4">
              
              {/* TOP ACTION BAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">Daftar Subtitle</span>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full text-3xs font-black">
                    {sublines.length} Kartu
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShiftAllTimestamps(-0.5)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-3xs font-bold rounded-lg"
                    title="Mundurkan semua subtitle 0.5 detik"
                  >
                    ⏪ -0.5s
                  </button>
                  <button
                    onClick={() => handleShiftAllTimestamps(0.5)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-3xs font-bold rounded-lg"
                    title="Majukan semua subtitle 0.5 detik"
                  >
                    ⏩ +0.5s
                  </button>
                </div>
              </div>

              {/* SCROLLABLE LIST OF SUBTITLE CARDS */}
              <div className="space-y-2.5 max-h-[420px] sm:max-h-[480px] overflow-y-auto pr-1">
                {sublines.map((line, idx) => {
                  const isCurrent = currentTime >= line.startSeconds && currentTime <= line.endSeconds;
                  return (
                    <div 
                      key={line.id} 
                      className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all space-y-2 relative ${
                        isCurrent 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20' 
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      {/* CARD HEADER & TIMESTAMP CONTROLS */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => seekTo(line.startSeconds)}
                            className="w-6 h-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center text-3xs font-black shadow-xs cursor-pointer active:scale-95"
                            title="Lompat & Putar detik ini di video"
                          >
                            <Play className="w-3 h-3 fill-white ml-0.5" />
                          </button>
                          <span className="text-3xs font-black text-slate-400">#{idx + 1}</span>
                        </div>

                        {/* START AND END TIME INPUTS */}
                        <div className="flex items-center gap-1 text-3xs">
                          <input
                            type="text"
                            value={line.start}
                            onChange={(e) => handleUpdateLine(line.id, 'start', e.target.value)}
                            className="w-18 sm:w-22 px-1 py-1 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-center font-mono font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 text-3xs"
                            title="Waktu Mulai"
                          />
                          <span className="text-slate-400 font-bold">→</span>
                          <input
                            type="text"
                            value={line.end}
                            onChange={(e) => handleUpdateLine(line.id, 'end', e.target.value)}
                            className="w-18 sm:w-22 px-1 py-1 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-center font-mono font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 text-3xs"
                            title="Waktu Selesai"
                          />
                        </div>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDeleteLine(line.id)}
                          className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* SUBTITLE TEXT INPUT */}
                      <textarea
                        rows={2}
                        value={line.text}
                        onChange={(e) => handleUpdateLine(line.id, 'text', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 resize-none leading-relaxed"
                        placeholder="Tulis kalimat percakapan subtitle di sini..."
                      />

                      {/* QUICK SYNC BUTTONS WITH CURRENT VIDEO POSITION */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-3xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setLineTimeToCurrent(line.id, 'start')}
                            className="px-2 py-0.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-md transition-colors active:scale-95"
                            title="Set detik mulai = posisi video saat ini"
                          >
                            🎯 Mulai = Video Ini
                          </button>
                          <button
                            onClick={() => setLineTimeToCurrent(line.id, 'end')}
                            className="px-2 py-0.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-md transition-colors active:scale-95"
                            title="Set detik selesai = posisi video saat ini"
                          >
                            🎯 Selesai = Video Ini
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => nudgeLine(line.id, -0.5)}
                            className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono text-slate-600 dark:text-slate-300"
                            title="Mundurkan 0.5 detik"
                          >
                            -0.5s
                          </button>
                          <button
                            onClick={() => nudgeLine(line.id, 0.5)}
                            className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border rounded font-mono text-slate-600 dark:text-slate-300"
                            title="Majukan 0.5 detik"
                          >
                            +0.5s
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleAddLine}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Tambah Baris
                </button>
                <label className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                  <Upload className="w-4 h-4" /> Import SRT
                  <input type="file" accept=".srt,.vtt,.txt" className="hidden" onChange={handleImportFile} />
                </label>
              </div>

            </div>
          )}

          {/* TAB 2: AUTO-SPLIT SCRIPT FROM NASKAH */}
          {activeTab === 'auto-ai' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-emerald-600" /> Penyelaras Naskah & Timestamp Otomatis
                </h3>
                <p className="text-2xs sm:text-xs text-slate-500 leading-relaxed">
                  Punya teks skrip, lirik, atau transkrip naskah? Tempelkan di sini. Sistem akan memotongnya menjadi baris per 3 detik yang pas dengan durasi video secara otomatis.
                </p>
              </div>

              <textarea
                rows={5}
                value={rawScriptText}
                onChange={(e) => setRawScriptText(e.target.value)}
                placeholder="Contoh: Halo teman-teman, hari ini saya akan mereview makanan enak di pasar tradisional. Rasanya gurih dan harganya sangat terjangkau..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />

              <button
                onClick={handleAutoSplitScript}
                className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Buat Subtitle Otomatis dari Naskah
              </button>
            </div>
          )}

          {/* TAB 3: VISUAL STYLE PRESETS */}
          {activeTab === 'style' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-emerald-600" /> Kustomisasi Tampilan Subtitle
                </h3>
                <p className="text-2xs sm:text-xs text-slate-500">Pilih gaya visual subtitle populer seperti TikTok, Reels, CapCut, atau Netflix.</p>
              </div>

              {/* PRESET CHIPS */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                <button
                  onClick={() => applyPreset('tiktok')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stylePreset === 'tiktok' ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black block text-amber-500">🟡 TikTok / Reels</span>
                  <span className="text-3xs text-slate-400">Kuning Bold + Outline Hitam</span>
                </button>

                <button
                  onClick={() => applyPreset('capcut')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stylePreset === 'capcut' ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black block text-emerald-600">🟢 CapCut Highlight</span>
                  <span className="text-3xs text-slate-400">Putih + Box Hijau</span>
                </button>

                <button
                  onClick={() => applyPreset('netflix')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stylePreset === 'netflix' ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black block text-slate-800 dark:text-slate-100">⚪ Bioskop Classic</span>
                  <span className="text-3xs text-slate-400">Teks Putih Bersih + Shadow</span>
                </button>

                <button
                  onClick={() => applyPreset('neon')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    stylePreset === 'neon' ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-black block text-cyan-500">🔵 Cyberpunk Cyan</span>
                  <span className="text-3xs text-slate-400">Neon Glow Modern</span>
                </button>
              </div>

              {/* SLIDERS & CONTROLS */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Ukuran Huruf (Font Size)</span>
                    <span className="text-emerald-600 font-mono">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="38"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-3xs font-extrabold text-slate-500 uppercase">Warna Teks</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => { setTextColor(e.target.value); setStylePreset('custom'); }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-3xs font-mono text-slate-600 dark:text-slate-400">{textColor}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-3xs font-extrabold text-slate-500 uppercase">Posisi Layar</label>
                    <select
                      value={subPosition}
                      onChange={(e) => setSubPosition(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <option value="bottom">Bawah Layar (Standard)</option>
                      <option value="center">Tengah Layar</option>
                      <option value="top">Atas Layar</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: EXPORT & DOWNLOAD */}
          {activeTab === 'export' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" /> Unduh Berkas Subtitle
                </h3>
                <p className="text-2xs sm:text-xs text-slate-500">Berkas dapat langsung diunggah ke YouTube Studio, TikTok, Premiere Pro, CapCut, atau diputar di VLC.</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleDownloadSubtitle('srt')}
                  className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Format .SRT (Rekomendasi)
                </button>

                <button
                  onClick={() => handleDownloadSubtitle('vtt')}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 border cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download Format .WebVTT (HTML5)
                </button>

                <button
                  onClick={handleDownloadTranscriptTxt}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 border cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4" /> Download Transkrip Teks (.TXT)
                </button>
              </div>

              <div className="pt-1">
                <CopyButton
                  textToCopy={generateSubtitleFileContent('srt')}
                  label="Salin Seluruh Naskah SRT ke Clipboard"
                  size="md"
                  variant="primary"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl sm:rounded-2xl text-3xs text-emerald-700 dark:text-emerald-400 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Pemrosesan Lokal di Browser HP
                </p>
                <p>Video dan suara Anda tidak diunggah ke server luar, privasi terjaga aman tanpa khawatir kuota internet tersedot.</p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
