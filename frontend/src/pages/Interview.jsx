import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import VoiceOrb from '../components/VoiceOrb';
import Button from '../components/Button';
import { Video, Mic, ShieldAlert, Sparkles, Check, Play, Pause, RotateCcw, AlertTriangle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidLoader from '../components/LiquidLoader';
import { saveAudioLocal } from '../utils/indexedDB';

export const Interview = () => {
  const { user, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Interview mode from URL params
  const interviewMode = searchParams.get('mode') || 'basic'; // 'basic' | 'conversation'
  const interviewRole = searchParams.get('role') || 'Software Engineer';
  const interviewPersona = searchParams.get('persona') || 'mentor';

  // State: 'lobby' | 'live' | 'submitting'
  const [phase, setPhase] = useState('lobby');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Audio / Mic Level State
  const [micStream, setMicStream] = useState(null);
  const [micLevel, setMicLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null); // Oscilloscope waveform canvas ref

  // Breathing & Countdown States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingText, setBreathingText] = useState("Inhale...");
  const [countdownVal, setCountdownVal] = useState(null); // null, 3, 2, 1, 'GO!'

  // Video State
  const [videoStream, setVideoStream] = useState(null);
  const lobbyVideoRef = useRef(null);
  const liveVideoRef = useRef(null);
  const proctorVideoRef = useRef(null);

  // Live Interview State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [orbState, setOrbState] = useState('idle'); // 'idle' | 'listening' | 'speaking' | 'thinking'
  const [transcript, setTranscript] = useState('');
  const [hintMessage, setHintMessage] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [interviewId, setInterviewId] = useState(null);
  const [answersList, setAnswersList] = useState([]);

  // One-on-One Conversation Mode State
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentAIMessage, setCurrentAIMessage] = useState('');
  const [exchangeCount, setExchangeCount] = useState(0);
  const [isConvDone, setIsConvDone] = useState(false);

  // Media Recording & Speech Recognition
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const speakingStartTimeRef = useRef(null); // Tracks the start time of the speech round for WPM calculation

  // Proctoring Metrics
  const [isFaceMeshLoaded, setIsFaceMeshLoaded] = useState(false);
  const [lookAwayCount, setLookAwayCount] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [lookAwayFrames, setLookAwayFrames] = useState(0);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadConfigAndSetupLobby();

    return () => {
      stopStreams();
      stopTimer();
      stopProctoring();
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [user]);

  // Global keydown event listener for power user keyboard shortcuts during live practice phase
  useEffect(() => {
    if (phase !== 'live') return;

    const handleKeyDown = (e) => {
      // Ignore key shortcuts if user is typing inside input boxes (though none exist here, good practice)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'spacebar') {
        e.preventDefault();
        handleTryAgain();
        showToast("Answer restarted via keyboard shortcut 🔄", "info");
      } else if (key === 'n') {
        if (orbState !== 'thinking') {
          handleNextQuestion();
          showToast("Moving to next question...", "info");
        }
      } else if (key === 'h') {
        handleShowHint();
        showToast("AI Hint activated 💡", "info");
      } else if (key === 'escape') {
        e.preventDefault();
        if (window.confirm("Are you sure you want to end this interview practice early?")) {
          handleFinishInterview();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentIdx, questions, orbState]);

  // Effect for Breathing Exercise 4-7-8
  useEffect(() => {
    if (!breathingActive || countdownVal !== null) return;
    
    let isMounted = true;
    
    const runBreathingCycle = async () => {
      if (!isMounted) return;
      setBreathingText("Inhale for 4s...");
      await new Promise(r => setTimeout(r, 4000));
      
      if (!isMounted) return;
      setBreathingText("Hold for 7s...");
      await new Promise(r => setTimeout(r, 7000));
      
      if (!isMounted) return;
      setBreathingText("Exhale for 8s...");
      await new Promise(r => setTimeout(r, 8000));
      
      if (!isMounted) return;
      startLaunchSequence();
    };

    runBreathingCycle();
    
    return () => {
      isMounted = false;
    };
  }, [breathingActive, countdownVal]);

  const startLaunchSequence = () => {
    setCountdownVal(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownVal(count);
      } else if (count === 0) {
        setCountdownVal('GO!');
      } else {
        clearInterval(interval);
        setBreathingActive(false);
        setCountdownVal(null);
        handleBegin();
      }
    }, 1000);
  };

  const loadConfigAndSetupLobby = async () => {
    try {
      const configRes = await api.getSettings(user.user_id);
      if (!configRes.error && configRes.data) {
        setSettings(configRes.data);
        setSecondsLeft(configRes.data.time_limit || 60);
      }
      
      // Request mic and camera access for lobby testing
      await startLobbyStreams();
    } catch (err) {
      console.error("Lobby setup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startLobbyStreams = async () => {
    try {
      // 1. Mic audio context stream
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(audioStream);

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(audioStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const drawWaveform = () => {
        if (!analyserRef.current) return;
        animationFrameRef.current = requestAnimationFrame(drawWaveform);
        
        // Compute volume level
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((average / 128) * 100)));

        // Draw oscilloscope line if canvas is mounted
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          const w = canvas.width;
          const h = canvas.height;
          
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          ctx.fillStyle = "rgba(17, 24, 39, 0.9)"; // Zinc 900
          ctx.fillRect(0, 0, w, h);
          
          // Draw subtle grid lines
          ctx.strokeStyle = "rgba(31, 41, 55, 0.3)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();

          ctx.strokeStyle = "rgba(99, 102, 241, 0.85)"; // Indigo 500
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          const sliceWidth = w * 1.0 / bufferLength;
          let x = 0;
          
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * h / 2;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
          }
          
          ctx.lineTo(w, h / 2);
          ctx.stroke();
        }
      };
      
      drawWaveform();

      // 2. Camera stream
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(camStream);
      if (lobbyVideoRef.current) {
        lobbyVideoRef.current.srcObject = camStream;
      }
    } catch (err) {
      console.warn("Media devices not fully accessible in lobby:", err);
    }
  };

  // Re-attach video stream when the lobby video ref becomes available
  // (fixes timing: stream is captured during loading, but ref mounts after loading=false)
  useEffect(() => {
    if (videoStream && lobbyVideoRef.current && !lobbyVideoRef.current.srcObject) {
      lobbyVideoRef.current.srcObject = videoStream;
    }
  });

  const stopStreams = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (micStream) micStream.getTracks().forEach((track) => track.stop());
    if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
  };

  // Dynamically load script helpers
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  };

  // Start Gaze Proctoring (MediaPipe Face Mesh)
  const initFaceMesh = async () => {
    if (!settings?.camera_proctoring) return;
    
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
      setIsFaceMeshLoaded(true);

      if (window.FaceMesh && window.Camera && liveVideoRef.current) {
        const faceMesh = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        let consecutiveLookAwayFrames = 0;
        let lastLookAwayTime = 0;

        faceMesh.onResults((results) => {
          setTotalFrames((prev) => prev + 1);

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const nose = landmarks[1];
            const leftFace = landmarks[234];
            const rightFace = landmarks[454];

            const xLeft = Math.abs(nose.x - leftFace.x);
            const xRight = Math.abs(rightFace.x - nose.x);
            const yawRatio = xLeft / (xRight || 0.001);

            // Gaze Yaw check: threshold for looking left or right
            const lookingAway = yawRatio < 0.35 || yawRatio > 2.6;

            if (lookingAway) {
              consecutiveLookAwayFrames++;
              setLookAwayFrames((prev) => prev + 1);

              if (consecutiveLookAwayFrames > 12) {
                setIsLookingAway(true);
                const now = Date.now();
                if (now - lastLookAwayTime > 4000) {
                  showToast('Maintain eye contact with the screen! 🎤', 'warning');
                  setLookAwayCount((prev) => prev + 1);
                  lastLookAwayTime = now;
                }
              }
            } else {
              consecutiveLookAwayFrames = 0;
              setIsLookingAway(false);
            }
          } else {
            // Face missing from webcam frame
            consecutiveLookAwayFrames++;
            setIsLookingAway(true);
          }
        });

        faceMeshRef.current = faceMesh;

        const camera = new window.Camera(liveVideoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current) {
              await faceMeshRef.current.send({ image: liveVideoRef.current });
            }
          },
          width: 320,
          height: 240
        });
        camera.start();
        cameraRef.current = camera;
      }
    } catch (err) {
      console.warn("Failed to start MediaPipe face proctoring:", err);
    }
  };

  const stopProctoring = () => {
    if (cameraRef.current) cameraRef.current.stop();
    faceMeshRef.current = null;
  };

  // Launch Live Mock Interview
  const handleBegin = async () => {
    // Stop Lobby device streams
    stopStreams();
    window.dispatchEvent(new CustomEvent('interviewStateChange', { detail: { isLive: true } }));

    // Enter Fullscreen Mode
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (fsErr) {
      console.warn("Fullscreen mode request blocked or unsupported:", fsErr);
    }

    setPhase('live');
    setLoading(true);

    try {
      const resumeId = localStorage.getItem("resume_id") || null;
      const startRes = await api.startInterview(user.user_id, resumeId, interviewMode, interviewRole, interviewPersona);

      if (startRes.error || !startRes.data) {
        showToast(startRes.error || "Failed to start mock session", "error");
        window.dispatchEvent(new CustomEvent('interviewStateChange', { detail: { isLive: false } }));
        setPhase('lobby');
        startLobbyStreams();
        return;
      }

      setInterviewId(startRes.data.interview_id);
      setCurrentIdx(0);

      // Start device streams for live session
      const liveCamStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(liveCamStream);
      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = liveCamStream;
        }
        if (proctorVideoRef.current) {
          proctorVideoRef.current.srcObject = liveCamStream;
        }
        initFaceMesh();
      }, 500);

      if (interviewMode === 'conversation') {
        // One-on-One mode: set opening question from AI
        const openingQ = startRes.data.opening_question;
        setCurrentAIMessage(openingQ);
        setConversationHistory([{ role: 'interviewer', content: openingQ }]);
        setTimeout(() => {
          speakText(openingQ, () => startRecording());
        }, 800);
      } else {
        // Basic Mock mode
        setQuestions(startRes.data.questions || []);
        setTimeout(() => {
          startQuestionRound(0, startRes.data.questions);
        }, 800);
      }

    } catch (err) {
      showToast("Cannot initialize session streams", "error");
      setPhase('lobby');
    } finally {
      setLoading(false);
    }
  };

  const startQuestionRound = (idx, activeQuestions) => {
    if (idx >= activeQuestions.length) {
      handleFinishInterview();
      return;
    }

    setCurrentIdx(idx);
    setTranscript('');
    setHintMessage('');
    setSecondsLeft(settings?.time_limit || 60);

    // Speak question out loud using speech synthesis
    const speech = new SpeechSynthesisUtterance(activeQuestions[idx].text);
    utteranceRef.current = speech;
    speech.onend = () => {
      startRecording();
    };
    setOrbState('speaking');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);

    startTimer();
  };

  // Generic TTS helper for conversation mode
  const speakText = (text, onDone) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    utteranceRef.current = speech;
    speech.onend = () => { if (onDone) onDone(); };
    setOrbState('speaking');
    window.speechSynthesis.speak(speech);
  };

  // Submit answer in One-on-One conversation mode
  const handleConversationTurn = async () => {
    if (!transcript.trim()) {
      showToast("Please speak your answer before submitting.", "warning");
      return;
    }
    stopTimer();
    stopRecordingAndTranscribing();
    setOrbState('thinking');

    const userAnswer = transcript.trim();
    const updatedHistory = [...conversationHistory, { role: 'candidate', content: userAnswer }];

    try {
      const { data, error } = await api.conversationTurn(interviewId, conversationHistory, userAnswer, exchangeCount);

      if (error || !data) {
        showToast(error || "AI response failed", "error");
        setOrbState('idle');
        return;
      }

      const newHistory = [...updatedHistory, { role: 'interviewer', content: data.response_text }];
      setConversationHistory(newHistory);
      setCurrentAIMessage(data.response_text);
      setExchangeCount(data.exchange_count || exchangeCount + 1);
      setTranscript('');

      if (data.is_done) {
        setIsConvDone(true);
        speakText(data.response_text, () => {
          showToast("Interview complete! Preparing your results... 🎉", "success");
          setTimeout(() => handleFinishInterview(), 1500);
        });
      } else {
        speakText(data.response_text, () => {
          setOrbState('idle');
          setTimeout(() => startRecording(), 300);
        });
      }
    } catch (err) {
      console.error("Conversation turn error:", err);
      showToast("Failed to process your answer", "error");
      setOrbState('idle');
    }
  };

  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Start Mic media recording & Web Speech transcript
  const startRecording = async () => {
    speakingStartTimeRef.current = Date.now();
    setOrbState('listening');
    audioChunksRef.current = [];

    try {
      const recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(recStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250);

      // Web Speech recognition setup
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (e) => {
          let finalTranscript = '';
          let interimTranscript = '';
          for (let i = 0; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
              finalTranscript += e.results[i][0].transcript;
            } else {
              interimTranscript += e.results[i][0].transcript;
            }
          }
          setTranscript(finalTranscript + interimTranscript);
        };

        recognition.onend = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            try {
              recognition.start();
            } catch (err) {
              console.warn("Failed to restart speech recognition onend:", err);
            }
          }
        };

        recognition.onerror = (e) => {
          console.error("Speech recognition error:", e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn("Could not start active microphone listeners:", err);
    }
  };

  const stopRecordingAndTranscribing = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Try answer again reset
  const handleTryAgain = () => {
    stopRecordingAndTranscribing();
    setTranscript('');
    setTimeout(() => {
      startRecording();
    }, 500);
  };

  // Trigger hint
  const handleShowHint = () => {
    const categoriesHints = {
      Technical: "Define the core concept briefly, explain why you implement it, and give a quick real-world example from your projects.",
      Behavioral: "Use the STAR method: explain the Situation, the specific Task, the Action you performed, and the Result.",
      "Problem Solving": "Explain how you analyzed the bottleneck, what choices you compared, and the exact metric improvements.",
      "Future Goals": "Align your target role with your actual skills and highlight your excitement about learning newer systems."
    };
    const currentCat = questions[currentIdx]?.category || "Technical";
    setHintMessage(categoriesHints[currentCat] || "Provide structured and metrics-supported responses.");
  };

  // Next / Submit Question
  const handleNextQuestion = async () => {
    stopTimer();
    stopRecordingAndTranscribing();
    setOrbState('thinking');

    // Calculate elapsed speaking duration
    const durationSeconds = speakingStartTimeRef.current 
      ? Math.max(1, Math.round((Date.now() - speakingStartTimeRef.current) / 1000))
      : 0;

    // Wait a brief moment to capture final audio chunks
    setTimeout(async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const currentQuestion = questions[currentIdx];

      const formData = new FormData();
      formData.append('interview_id', interviewId);
      formData.append('question_index', currentIdx);
      formData.append('question_text', currentQuestion.text);
      formData.append('category', currentQuestion.category);
      formData.append('answer_text', transcript || "No spoken answer response recorded.");
      formData.append('duration_seconds', durationSeconds);
      if (audioChunksRef.current.length > 0) {
        formData.append('audio', audioBlob, 'answer.webm');
        // Save locally to IndexedDB for zero-latency instant playback
        saveAudioLocal(interviewId, currentIdx, audioBlob).catch(err => console.warn("IndexedDB local save error:", err));
      }

      let targetQuestions = questions;

      try {
        const { data, error } = await api.saveAnswer(formData);

        if (error) {
          showToast(error, 'error');
        } else if (data?.followUpQuestion && settings?.conversational_mode) {
          // Splice conversational follow-up question directly into active queue
          const followUp = {
            category: currentQuestion.category,
            text: data.followUpQuestion,
            isFollowUp: true
          };
          const updatedQs = [...questions];
          updatedQs.splice(currentIdx + 1, 0, followUp);
          setQuestions(updatedQs);
          targetQuestions = updatedQs;
          showToast("AI is asking a follow-up question! 💬", "success");
        }
      } catch (err) {
        console.error("Save answer error:", err);
      }

      // Progress to next question
      setOrbState('idle');
      startQuestionRound(currentIdx + 1, targetQuestions);
    }, 600);
  };

  const handleFinishInterview = async () => {
    stopTimer();
    stopStreams();
    stopProctoring();
    window.dispatchEvent(new CustomEvent('interviewStateChange', { detail: { isLive: false } }));
    
    // Exit Fullscreen Mode
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (fsErr) {
      console.warn("Could not exit fullscreen mode:", fsErr);
    }

    setPhase('submitting');

    // Calculate final proctoring score: 100 minus % looking away
    let attentionScore = 100;
    if (totalFrames > 0) {
      attentionScore = Math.max(10, Math.round(100 - (lookAwayFrames / totalFrames) * 100));
    }

    try {
      const { data, error } = await api.finishInterview(interviewId, attentionScore, lookAwayCount);
      if (error) {
        showToast(error, 'error');
        navigate('/dashboard');
        return;
      }
      showToast("Evaluation report ready! 🎉", "success");
      navigate(`/result?id=${interviewId}`);
    } catch (err) {
      showToast("Cannot complete mock evaluation.", "error");
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Mascot pose="neutral" size={80} className="animate-bounce" />
        <span className="text-sm font-bold text-text-secondary ml-3">Setting up environment...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col justify-center relative z-10 text-left">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: LOBBY ROOM */}
        {phase === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-10 w-full max-w-3xl mx-auto text-center"
          >
            {/* Hero Greeting */}
            <div className="flex flex-col items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent via-indigo-500 to-purple-500 mt-2">
                Ready to begin, {user?.name?.split(' ')[0] || 'Candidate'}?
              </h1>
              <p className="text-text-secondary text-sm font-medium mt-2 max-w-md">
                Ensure your camera is framed correctly and your microphone is picking up audio.
              </p>
            </div>

            {/* Config floating capsule chips */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <div className="bg-surface border border-surface-border rounded-full px-4 py-2 text-xs font-bold text-text-primary shadow-sm flex items-center gap-2">
                🎭 <span className="capitalize">{settings?.interviewer_persona || 'Friendly'} Coach</span>
              </div>
              <div className="bg-surface border border-surface-border rounded-full px-4 py-2 text-xs font-bold text-text-primary shadow-sm flex items-center gap-2">
                ⏱ {settings?.time_limit || 60}s limit
              </div>
              <div className="bg-surface border border-surface-border rounded-full px-4 py-2 text-xs font-bold text-text-primary shadow-sm flex items-center gap-2">
                👁 Proctoring {settings?.camera_proctoring ? <span className="text-success">ON</span> : <span className="text-text-muted">OFF</span>}
              </div>
              <div className="bg-surface border border-surface-border rounded-full px-4 py-2 text-xs font-bold text-text-primary shadow-sm flex items-center gap-2">
                💬 Follow-ups {settings?.conversational_mode ? <span className="text-success">ON</span> : <span className="text-text-muted">OFF</span>}
              </div>
            </div>

            {/* Center-stage webcam & audio preview */}
            <Card className="w-full p-2 bg-black/50 backdrop-blur-xl border border-gray-800 shadow-2xl relative overflow-hidden rounded-[2rem]">
              <div className="aspect-video w-full relative rounded-t-[1.5rem] overflow-hidden bg-gray-900">
                <video ref={lobbyVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-white flex items-center gap-2 shadow-sm border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  Camera Active ✓
                </div>
              </div>
              
              {/* Waveform Canvas */}
              <div className="h-16 w-full bg-black relative border-t border-gray-800 rounded-b-[1.5rem] overflow-hidden flex items-center px-4">
                 <Mic size={16} className="text-indigo-500 absolute left-4 z-10" />
                 <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" width={1000} height={64} />
                 <div className="absolute right-4 text-[10px] font-bold text-indigo-400 z-10 uppercase tracking-widest bg-black/60 px-2 py-1 rounded">Live Audio</div>
              </div>
            </Card>

            {/* Animated Readiness Checklist */}
            <div className="flex justify-center gap-8 text-xs font-bold w-full border-t border-surface-border pt-6 mt-2">
              <div className="flex items-center gap-2 text-text-secondary">
                <div className={`w-2.5 h-2.5 rounded-full ${videoStream ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-warning animate-pulse'}`}></div>
                Camera Connected
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <div className={`w-2.5 h-2.5 rounded-full ${micStream ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-warning animate-pulse'}`}></div>
                Mic Connected
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                Network Stable
              </div>
            </div>

            {/* Giant glowing CTA */}
            <div className="w-full max-w-sm mt-4">
              <Button 
                onClick={async () => {
                  try {
                    if (document.documentElement.requestFullscreen) {
                      await document.documentElement.requestFullscreen();
                    }
                  } catch (e) {}
                  
                  if (settings?.breathing_exercise) {
                    setBreathingActive(true);
                  } else {
                    startLaunchSequence();
                  }
                }} 
                size="lg" 
                className="w-full h-14 text-lg shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.7)] animate-pulse transition-all duration-300"
              >
                Begin Interview →
              </Button>
            </div>
            
            {/* Pre-interview breathing & 3-2-1 sequence overlay */}
            <AnimatePresence>
              {breathingActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
                >
                  {countdownVal === null ? (
                    <motion.div 
                      key="breathing"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-12"
                    >
                      <h2 className="text-2xl font-extrabold text-white tracking-widest uppercase">Center Yourself</h2>
                      
                      <div className="relative flex items-center justify-center w-64 h-64">
                        <motion.div 
                          animate={{ 
                            scale: [1, 2, 2, 1],
                            opacity: [0.3, 0.1, 0.1, 0.3] 
                          }}
                          transition={{ 
                            duration: 19, // 4-7-8 total
                            repeat: 1,
                            times: [0, 4/19, 11/19, 1] 
                          }}
                          className="absolute w-full h-full rounded-full bg-indigo-500"
                        />
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.5, 1.5, 1] 
                          }}
                          transition={{ 
                            duration: 19, 
                            repeat: 1,
                            times: [0, 4/19, 11/19, 1] 
                          }}
                          className="absolute w-3/4 h-3/4 rounded-full bg-indigo-400 opacity-20"
                        />
                        <div className="absolute w-1/2 h-1/2 rounded-full bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.8)] z-10 flex items-center justify-center">
                           <span className="text-white font-bold text-xl tracking-widest">Breathe</span>
                        </div>
                      </div>
                      
                      <div className="text-xl font-medium text-indigo-200">
                        {breathingText}
                      </div>

                      <Button 
                        variant="ghost" 
                        className="text-white/50 hover:text-white mt-10"
                        onClick={startLaunchSequence}
                      >
                        Skip & Start Now
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="countdown"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[150px] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
                    >
                      {countdownVal}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* PHASE 2: LIVE INTERVIEW */}
        {phase === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 w-full"
          >
            {/* ==================== ONE-ON-ONE CONVERSATION MODE ==================== */}
            {interviewMode === 'conversation' ? (
              <>
                {/* Conversation Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-violet-500 bg-violet-100 dark:bg-violet-900/30 px-2.5 py-1 rounded-full">
                      🧠 One-on-One Deep Dive
                    </span>
                    <span className="text-[10px] text-text-muted font-medium">
                      {interviewRole} · {interviewPersona === 'mentor' ? '👔 Friendly' : interviewPersona === 'engineer' ? '🧑‍💻 Technical' : '😤 Stress'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">
                    Exchange {exchangeCount} / 12
                  </span>
                </div>

                {/* Conversation Chat Thread */}
                <div className="surface border rounded-3xl p-5 flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-thin">
                  {conversationHistory.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'candidate' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        msg.role === 'interviewer' ? 'bg-violet-600 text-white' : 'bg-indigo-600 text-white'
                      }`}>
                        {msg.role === 'interviewer' ? 'AI' : 'Me'}
                      </div>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'interviewer'
                          ? 'bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-white rounded-tl-none'
                          : 'bg-indigo-600 text-white rounded-tr-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {orbState === 'thinking' && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0">AI</div>
                      <div className="bg-slate-100 dark:bg-white/[0.06] px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Current AI message highlight */}
                {currentAIMessage && orbState !== 'thinking' && (
                  <div className="surface border border-violet-200 dark:border-violet-800/50 rounded-3xl p-6 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md shadow-violet-500/30">AI</div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-violet-500 block mb-1">Interviewer</span>
                      <p className="font-bold text-sm text-text-primary leading-relaxed">{currentAIMessage}</p>
                    </div>
                    {orbState === 'speaking' && (
                      <div className="ml-auto flex items-center gap-1 self-start">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-1 bg-violet-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]"
                            style={{ height: `${12 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Voice Orb */}
                <div className="my-4 flex justify-center w-full">
                  <VoiceOrb state={orbState} />
                </div>

                {/* Live Transcript */}
                <div className="surface border rounded-3xl p-6 flex flex-col gap-3 min-h-[120px] text-left">
                  <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--color-surface-border)' }}>
                    <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Your Response</span>
                    {orbState === 'listening' && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary leading-loose font-medium italic">
                    {transcript || (orbState === 'speaking' ? 'Interviewer is speaking...' : orbState === 'thinking' ? 'Processing your answer...' : 'Speak your answer...')}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-t pt-5" style={{ borderColor: 'var(--color-surface-border)' }}>
                  <Button variant="ghost" onClick={handleTryAgain} className="flex items-center gap-1.5 px-4 py-2 text-xs" disabled={orbState === 'thinking' || orbState === 'speaking'}>
                    <RotateCcw size={12} /> Restart Answer
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleFinishInterview} className="px-4 py-2 text-xs text-text-muted hover:text-accent">
                      End Early
                    </Button>
                    <Button
                      onClick={handleConversationTurn}
                      disabled={orbState === 'thinking' || orbState === 'speaking' || !transcript.trim() || isConvDone}
                      className="px-6 py-2 bg-violet-600 hover:bg-violet-700"
                    >
                      <span>{isConvDone ? 'Wrapping up...' : 'Send Answer →'}</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* ==================== BASIC MOCK MODE (Existing) ==================== */
              <>
                {/* Header: Progress tag and Timer */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-accent">
                    Question {currentIdx + 1} of {questions.length} {questions[currentIdx]?.isFollowUp && '• Follow-Up'}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Pacing Timer</span>
                    <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${secondsLeft < 15 ? 'badge-warning' : 'bg-accent-soft text-accent'}`}>
                      {secondsLeft}s
                    </span>
                  </div>
                </div>

                {/* Question Bubble */}
                <div className="surface border rounded-[32px] p-8 sm:p-10 shadow-sm flex items-start gap-6">
                  <div className="text-left flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent bg-accent-soft px-3 py-1 rounded-full w-fit">Interviewer</span>
                    <h3 className="font-extrabold text-base sm:text-lg text-text-primary tracking-tight mt-1 leading-relaxed">
                      {questions[currentIdx]?.text || 'Loading mock question...'}
                    </h3>
                  </div>
                </div>

                {/* Centerpiece Voice Orb visualizer */}
                <div className="my-8 flex justify-center w-full">
                  <VoiceOrb state={orbState} />
                </div>

                {/* Transcript preview panel */}
                <div className="surface border rounded-[32px] p-8 flex flex-col gap-4 min-h-[200px] text-left">
                  <div className="flex justify-between items-center border-b pb-3.5" style={{ borderColor: 'var(--color-surface-border)' }}>
                    <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">Live Transcript</span>
                    {orbState === 'listening' && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-text-secondary leading-loose font-medium italic">
                    {transcript || 'Start speaking to record response...'}
                  </p>
                </div>

                {/* Hint Box (if triggered) */}
                {hintMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert-warning rounded-2xl p-4 text-xs font-bold leading-relaxed"
                  >
                    💡 Hint: {hintMessage}
                  </motion.div>
                )}

                {/* Control Row actions */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-t pt-5" style={{ borderColor: 'var(--color-surface-border)' }}>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleShowHint} className="flex items-center gap-1.5 px-4 py-2">
                      <span>Show Hint</span>
                    </Button>
                    <Button variant="ghost" onClick={handleTryAgain} className="flex items-center gap-1.5 px-4 py-2 text-xs">
                      <RotateCcw size={12} />
                      <span>Restart Answer</span>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleFinishInterview} className="px-4 py-2 text-xs text-text-muted hover:text-accent">
                      End Practice Early
                    </Button>
                    <Button onClick={handleNextQuestion} disabled={orbState === 'thinking'} className="px-5 py-2">
                      <span>{currentIdx === questions.length - 1 ? 'Finish Interview' : 'Next Question'}</span>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Hidden Video element for MediaPipe feed */}
            <video ref={liveVideoRef} autoPlay playsInline muted className="hidden" />

            {/* Floating Proctoring Camera preview overlay */}
            {settings?.camera_proctoring && (
              <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none">
                {isLookingAway && (
                  <div className="badge-warning font-bold text-[10px] px-3 py-1 rounded-full shadow-md animate-bounce pointer-events-auto">
                    ⚠️ Keep eyes centered!
                  </div>
                )}
                
                <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 overflow-hidden shadow-lg bg-black relative flex items-center justify-center pointer-events-auto transition-all ${
                  isLookingAway ? 'border-amber-400 scale-[1.05]' : 'border-white'
                }`}>
                  <video ref={proctorVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                  <div className="absolute bottom-1 bg-black/60 px-2 py-0.5 rounded-full text-[8px] font-bold text-white">
                    Proctor Active
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* PHASE 3: SUBMITTING / EVALUATION */}
        {phase === 'submitting' && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <LiquidLoader />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
export default Interview;
