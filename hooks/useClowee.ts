'use client';

import { useState, useRef, useCallback } from 'react';

export function useClowee({ onEscrowTrigger }: { onEscrowTrigger?: (params: any) => void } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState<{role: 'user' | 'clowee', text: string}[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clowee_transcript');
      if (saved) return JSON.parse(saved);
    }
    return [
      { role: 'clowee', text: "Hello. I'm Clowee. It's a pleasure to be working with you." }
    ];
  });

  // Persist transcript
  useEffect(() => {
    localStorage.setItem('clowee_transcript', JSON.stringify(transcript));
  }, [transcript]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // We need to store this in a ref so `onended` can access the latest function
  const startListeningRef = useRef<() => void>(() => {});

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to fetch voice');

      const blob = await response.blob();
      if (blob.size === 0) {
        console.log('Voice Mock Mode: Skipping audio playback');
        setIsSpeaking(false);
        startListeningRef.current();
        return;
      }
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => {
          console.error('Audio playback blocked by browser:', e);
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          // If browser blocked audio, still turn mic back on
          startListeningRef.current();
        });
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          // Auto-restart listening after she finishes speaking
          startListeningRef.current();
        };
      }
    } catch (error) {
      console.error('Speak error:', error);
      setIsSpeaking(false);
      // Restart listening even on error so it doesn't get stuck
      startListeningRef.current();
    }
  };

  const getCloweeResponse = async (userText: string) => {
    try {
      setIsThinking(true);
      const newMessages = [...transcript, { role: 'user' as const, text: userText }];
      setTranscript(newMessages);

      const historySummary = typeof window !== 'undefined' ? localStorage.getItem('clowee_history_summary') || "First session" : "First session";
      const interactionCount = typeof window !== 'undefined' ? localStorage.getItem('clowee_interaction_count') || "0" : "0";
      const userName = typeof window !== 'undefined' ? localStorage.getItem('clowee_user_name') || "Partner" : "Partner";
      const activeJobs = typeof window !== 'undefined' ? localStorage.getItem('clowee_active_jobs') || "[]" : "[]";

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role === 'clowee' ? 'assistant' : 'user', content: m.text })),
          context: {
            userName,
            interactionCount,
            historySummary,
            activeJobs: JSON.parse(activeJobs)
          }
        }),
      });

      const data = await response.json();
      setIsThinking(false);
      
      if (data.text) {
        setTranscript(prev => [...prev, { role: 'clowee', text: data.text }]);
        
        // Check for name discovery
        if (data.text.includes('[SET_NAME:')) {
          const nameMatch = data.text.match(/\[SET_NAME: (.*?)\]/);
          if (nameMatch) {
            const discoveredName = nameMatch[1].replace(/['"]/g, '');
            console.log('Discovered name:', discoveredName);
            localStorage.setItem('clowee_user_name', discoveredName);
            // Optionally reload or state update here
          }
        }

        // Check for escrow triggers
        if (data.text.includes('[CREATE_ESCROW')) {
          const match = data.text.match(/\[CREATE_ESCROW: (.*?)\]/);
          if (match) {
            try {
              const params = JSON.parse(match[1]);
              console.log('Detected escrow trigger:', params);
              if (onEscrowTrigger) onEscrowTrigger(params);
            } catch (e) {
              console.error('Failed to parse escrow params');
            }
          }
        }

        // Remove all tags [TAG: ...] before speaking
        const speechText = data.text.replace(/\[[A-Z0-9_]+:.*?\]/g, '').trim();
        
        await speak(speechText);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setIsThinking(false);
    }
  };

  const startListening = useCallback(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      
      // If it ends unexpectedly, we shouldn't necessarily force it back on unless it's a dedicated continuous mode,
      // but we do update the state.
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        if (result.isFinal) {
          const text = result[0].transcript;
          // Stop listening while processing to avoid hearing itself or user interruption
          stopListening();
          getCloweeResponse(text);
        }
      };

      try {
        recognitionRef.current.start();
      } catch (e) {
        // Prevent errors if already started
      }
    } else {
      alert('Speech Recognition not supported in this browser.');
    }
  }, [transcript]);

  // Keep the ref updated with the latest callback
  startListeningRef.current = startListening;

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    isSpeaking,
    isThinking,
    transcript,
    startListening,
    stopListening,
    sendMessage: getCloweeResponse,
    audioRef,
    speak // EXPORTED SO DASHBOARD CAN USE IT
  };
}
