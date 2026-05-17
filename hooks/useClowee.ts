'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useClowee({ onEscrowTrigger, openNotepad, delegateTask }: { 
  onEscrowTrigger?: (params: any) => void;
  openNotepad?: (content?: string) => Promise<void>;
  delegateTask?: (params: {agent: string, task: string}) => void;
} = {}) {
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const addLog = (msg: string) => {
    setSystemLogs(prev => [`[LOG] ${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 19)]);
  };

  const webResearch = async (url: string) => {
    addLog(`Initiating web reconnaissance on: ${url}...`);
    try {
      const res = await fetch(`http://localhost:8000/native/browser?url=${encodeURIComponent(url)}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addLog(`Reconnaissance complete: ${data.title}`);
        return `WEB RESEARCH DATA for ${url}:\nTITLE: ${data.title}\nCONTENT: ${data.content}`;
      }
      return `Failed to reach site: ${data.error}`;
    } catch (err) {
      return `Bridge error during research: ${err}`;
    }
  };

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState<{role: 'user' | 'clowee', text: string}[]>(() => {
    if (typeof window !== 'undefined') {
      const activeEmail = localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai';
      const saved = localStorage.getItem(`clowee_transcript_${activeEmail}`);
      if (saved) return JSON.parse(saved);
    }
    return [
      { role: 'clowee', text: "Hello. I'm Clowee. It's a pleasure to be working with you." }
    ];
  });

  // Persist transcript
  useEffect(() => {
    const activeEmail = localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai';
    localStorage.setItem(`clowee_transcript_${activeEmail}`, JSON.stringify(transcript));
  }, [transcript]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // We need to store this in a ref so `onended` can access the latest function
  const startListeningRef = useRef<() => void>(() => {});

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      const url = `/api/voice?text=${encodeURIComponent(text)}`;
      
      if (audioRef.current) {
        audioRef.current.src = url;
        
        audioRef.current.play().catch(e => {
          console.error('Audio playback blocked by browser:', e);
          setIsSpeaking(false);
          startListeningRef.current();
        });

        audioRef.current.onerror = () => {
          console.warn('ElevenLabs stream failed.');
          setIsSpeaking(false);
          startListeningRef.current();
        };
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          startListeningRef.current();
        };
      }
    } catch (error) {
      console.error('Voice API Error:', error);
      setIsSpeaking(false);
      startListeningRef.current();
    }
  };

  const getCloweeResponse = async (userText: string, attachedFiles: {name: string, content: string}[] = []) => {
    try {
      setIsThinking(true);
      
      // Check if we need to append file context to the text (or we can just pass it via context)
      const newMessages = [...transcript, { role: 'user' as const, text: userText }];
      setTranscript(newMessages);

      const activeEmail = typeof window !== 'undefined' ? localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai' : 'anonymous@clowee.ai';
      const historySummary = typeof window !== 'undefined' ? localStorage.getItem(`clowee_history_summary_${activeEmail}`) || "First session" : "First session";
      const interactionCount = typeof window !== 'undefined' ? localStorage.getItem(`clowee_interaction_count_${activeEmail}`) || "0" : "0";
      const userName = typeof window !== 'undefined' ? localStorage.getItem(`clowee_user_name_${activeEmail}`) || localStorage.getItem('clowee_user_name') || "Partner" : "Partner";
      const activeJobs = typeof window !== 'undefined' ? localStorage.getItem(`clowee_active_jobs_${activeEmail}`) || "[]" : "[]";

      // Sliding Context Window: Only send the last 8 messages to keep responses fast and prevent memory breakage
      const limitedMessages = newMessages.slice(-8);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: limitedMessages.map(m => ({ role: m.role === 'clowee' ? 'assistant' : 'user', content: m.text })),
          context: {
            userName,
            interactionCount,
            activeJobs: JSON.parse(activeJobs),
            attachedFiles
          }
        }),
      });

      const data = await response.json();
      setIsThinking(false);
      
      if (data.text) {
        // Scrub all internal tags [TAG: ...] from the visible UI transcript
        const scrubbedText = data.text.replace(/\[[A-Z0-9_]+:.*?\]/g, '').trim();
        setTranscript(prev => [...prev, { role: 'clowee', text: scrubbedText }]);
        
        // Check for name discovery
        if (data.text.includes('[SET_NAME:')) {
          const nameMatch = data.text.match(/\[SET_NAME: (.*?)\]/);
          if (nameMatch) {
            const discoveredName = nameMatch[1].replace(/['"]/g, '');
            console.log('Discovered name:', discoveredName);
            const activeEmail = localStorage.getItem('clowee_active_email') || 'anonymous@clowee.ai';
            localStorage.setItem(`clowee_user_name_${activeEmail}`, discoveredName);
            localStorage.setItem('clowee_user_name', discoveredName);
          }
        }
 
        // Check for notepad triggers
        if (data.text.includes('[OPEN_NOTEPAD:')) {
          const match = data.text.match(/\[OPEN_NOTEPAD:\s*([\s\S]*?)\]/);
          if (match && openNotepad) {
            addLog(`Opening native Notepad for documentation...`);
            openNotepad(match[1]);
          }
        }

        // Check for web research triggers
        if (data.text.includes('[WEB_RESEARCH:')) {
          const match = data.text.match(/\[WEB_RESEARCH: (.*?)\]/);
          if (match) {
            const researchData = await webResearch(match[1]);
            // Re-prompt Clowee with the new data
            await getCloweeResponse(`Here is the data from the web research on ${match[1]}:\n\n${researchData}\n\nPlease analyze this and update your plan.`);
            return;
          }
        }

        // Check for delegation triggers
        if (data.text.includes('[DELEGATE_TASK:')) {
          const match = data.text.match(/\[DELEGATE_TASK:\s*([\s\S]*?)\]/);
          if (match && delegateTask) {
            try {
              const params = JSON.parse(match[1]);
              delegateTask(params);
            } catch (e) {
              console.error('Failed to parse delegation params');
            }
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
    speak,
    systemLogs,
    addLog,
    resetChat: () => setTranscript([{ role: 'clowee', text: "Chat history cleared." }])
  };
}
