import React, { useState, useEffect, useRef } from 'react';
import { TranslationKey } from '../utils/translations';
import { SpinnerIcon, ChevronLeftIcon, VolumeUpIcon, PlusIcon, MinusIcon } from './icons';
import { DialogueLine } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";

interface DialogueViewProps {
  title: string;
  dialogue: DialogueLine[] | null;
  isLoading: boolean;
  onBackToDeck: () => void;
  t: (key: TranslationKey) => string;
}

// --- Audio Decoding Utilities ---
// These functions are necessary to process the raw audio data from the Gemini API.

/** Decodes a base64 string into a Uint8Array. */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/** Decodes raw PCM audio data into an AudioBuffer for playback. */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const DialogueView: React.FC<DialogueViewProps> = ({ title, dialogue, isLoading, onBackToDeck, t }) => {
  const [speechRate, setSpeechRate] = useState(1.0);
  const [audioState, setAudioState] = useState<{ index: number | null, status: 'idle' | 'loading' | 'playing' }>({ index: null, status: 'idle' });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup function to stop audio when the component unmounts
    return () => {
      stopCurrentAudio();
    };
  }, []);
  
  const stopCurrentAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setAudioState({ index: null, status: 'idle' });
  };

  const speak = async (text: string, index: number) => {
    // Lazily initialize AudioContext on first user interaction
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      } else {
        console.error("Web Audio API is not supported in this browser.");
        alert("Sorry, your browser does not support audio playback.");
        return;
      }
    }
    
    // Stop any currently playing audio before starting a new one
    stopCurrentAudio();
    setAudioState({ index, status: 'loading' });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Using a high-quality voice
            },
          },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data received from API.");
      }
      
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = speechRate;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        // Only update UI if this was the source that just finished
        if (sourceRef.current === source) {
            setAudioState({ index: null, status: 'idle' });
            sourceRef.current = null;
        }
      };
      
      source.start();
      sourceRef.current = source;
      setAudioState({ index, status: 'playing' });

    } catch (error) {
      console.error("Error generating or playing speech:", error);
      alert(t('errorGenerating'));
      setAudioState({ index: null, status: 'idle' });
    }
  };
  
  const changeSpeed = (delta: number) => {
    setSpeechRate(prev => {
      const newRate = Math.max(0.5, Math.min(2.0, prev + delta));
      return parseFloat(newRate.toFixed(1));
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <SpinnerIcon className="w-8 h-8"/>
            <span className="text-lg mt-4">{t('generatingMessage')}</span>
        </div>
      );
    }

    if (!dialogue || dialogue.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                <p>{t('errorGenerating')}</p>
            </div>
        );
    }
    
    return (
      <div className="space-y-6">
        {dialogue.map((line, index) => (
          <div key={index} className="grid grid-cols-[auto,1fr] gap-x-4 items-baseline">
            <div className="font-bold text-slate-800 text-lg">{line.character}:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold text-slate-900">{line.text}</p>
                <button 
                  onClick={() => speak(line.text, index)} 
                  disabled={audioState.status === 'loading'}
                  className="text-slate-500 hover:text-blue-600 transition-colors p-1 disabled:opacity-50 disabled:cursor-wait"
                  title="Listen"
                >
                  {audioState.index === index ? (
                     audioState.status === 'loading' ? <SpinnerIcon className="w-6 h-6"/> : <VolumeUpIcon className="w-6 h-6 text-blue-600"/>
                  ) : <VolumeUpIcon className="w-6 h-6"/>}
                </button>
              </div>
              {line.transcription && <p className="text-md text-slate-500 italic">[{line.transcription}]</p>}
              <p className="text-md text-slate-700 pt-1">{line.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-6">
        <button
          onClick={onBackToDeck}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-slate-700 border border-slate-300 font-semibold hover:bg-slate-50"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          {t('backToDeck')}
        </button>
      </div>
       <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-lg shadow-sm">
        <h3 className="text-3xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200">{isLoading ? t('aiDialogueTitle') : title}</h3>
        
        {!isLoading && dialogue && dialogue.length > 0 && (
          <div className="flex items-center justify-center gap-4 mb-8 p-3 bg-slate-100 rounded-lg">
            <span className="text-sm font-medium text-slate-600">{t('playbackSpeed')}</span>
            <button onClick={() => changeSpeed(-0.1)} disabled={speechRate <= 0.5} className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50" title={t('slowerTooltip')}>
              <MinusIcon className="w-5 h-5" />
            </button>
            <span className="font-mono font-bold text-slate-800 w-12 text-center text-lg">{speechRate.toFixed(1)}x</span>
            <button onClick={() => changeSpeed(0.1)} disabled={speechRate >= 2.0} className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50" title={t('fasterTooltip')}>
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {renderContent()}
      </div>
    </div>
  );
};

export default DialogueView;