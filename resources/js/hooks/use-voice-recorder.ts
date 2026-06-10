import { useCallback, useEffect, useRef, useState } from 'react';
import { voiceRecorderOptions } from '@/lib/compress-media';

const BAR_COUNT = 24;

function sampleWaveform(analyser: AnalyserNode): number[] {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    const step = Math.max(1, Math.floor(data.length / BAR_COUNT));

    return Array.from({ length: BAR_COUNT }, (_, index) => {
        const start = index * step;
        const slice = data.slice(start, start + step);
        const average =
            slice.reduce((total, value) => total + value, 0) / slice.length;

        return Math.max(0.08, average / 255);
    });
}

export function useVoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const [waveform, setWaveform] = useState<number[]>(
        Array.from({ length: BAR_COUNT }, () => 0.08),
    );
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);

    const stopAnalyser = useCallback((resetWaveform = true) => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        analyserRef.current = null;

        if (audioContextRef.current) {
            void audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (resetWaveform) {
            setWaveform(Array.from({ length: BAR_COUNT }, () => 0.08));
        }
    }, []);

    const stopStream = useCallback(
        (resetWaveform = true) => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            stopAnalyser(resetWaveform);
        },
        [stopAnalyser],
    );

    const startAnalyser = useCallback((stream: MediaStream) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const tick = () => {
            if (!analyserRef.current) {
                return;
            }

            setWaveform(sampleWaveform(analyserRef.current));
            animationRef.current = requestAnimationFrame(tick);
        };

        tick();
    }, []);

    const startRecording = useCallback(async () => {
        if (isRecording) {
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;
            chunksRef.current = [];
            startAnalyser(stream);

            const mediaRecorder = new MediaRecorder(
                stream,
                voiceRecorderOptions(),
            );
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: mediaRecorder.mimeType || 'audio/webm',
                });
                setRecordingBlob(blob);
                stopStream(false);
            };

            mediaRecorder.start(250);
            setIsRecording(true);
            setRecordingBlob(null);
            setWaveform(Array.from({ length: BAR_COUNT }, () => 0.08));
        } catch {
            stopStream();
            setIsRecording(false);
        }
    }, [isRecording, startAnalyser, stopStream]);

    const stopRecording = useCallback(() => {
        if (!isRecording || !mediaRecorderRef.current) {
            return;
        }

        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
        setIsRecording(false);
    }, [isRecording]);

    const clearRecording = useCallback(() => {
        setRecordingBlob(null);
        chunksRef.current = [];
        setWaveform(Array.from({ length: BAR_COUNT }, () => 0.08));
    }, []);

    const getRecordingFile = useCallback((): File | null => {
        if (!recordingBlob) {
            return null;
        }

        return new File([recordingBlob], `voice-${Date.now()}.webm`, {
            type: recordingBlob.type || 'audio/webm',
        });
    }, [recordingBlob]);

    useEffect(() => {
        return () => {
            stopStream();
        };
    }, [stopStream]);

    return {
        isRecording,
        recordingBlob,
        waveform,
        startRecording,
        stopRecording,
        clearRecording,
        getRecordingFile,
    };
}
