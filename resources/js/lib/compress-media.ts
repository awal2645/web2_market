const MAX_IMAGE_EDGE = 2048;
const JPEG_QUALITY = 0.88;
const WEBP_QUALITY = 0.9;
const SKIP_IMAGE_BYTES = 350_000;
const VOICE_BITRATE = 72_000;

function readImageSize(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not read image.'));
        };

        image.src = url;
    });
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality?: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Image compression failed.'));
                }
            },
            type,
            quality,
        );
    });
}

export async function compressImageFile(file: File): Promise<File> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
        return file;
    }

    const { width, height } = await readImageSize(file);
    const longestEdge = Math.max(width, height);
    const scale = Math.min(1, MAX_IMAGE_EDGE / longestEdge);

    if (file.size <= SKIP_IMAGE_BYTES && scale >= 1) {
        return file;
    }

    const bitmap = await createImageBitmap(file);
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');

    if (!context) {
        bitmap.close();
        return file;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const useWebp = file.type === 'image/png' || file.type === 'image/webp';
    const outputType = useWebp ? 'image/webp' : 'image/jpeg';
    const quality = useWebp ? WEBP_QUALITY : JPEG_QUALITY;
    const compressed = await canvasToBlob(canvas, outputType, quality);

    if (compressed.size >= file.size && scale >= 1) {
        return file;
    }

    const extension = useWebp ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';

    return new File([compressed], `${baseName}.${extension}`, {
        type: outputType,
        lastModified: Date.now(),
    });
}

function pickVoiceMimeType(): string {
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
    ];

    return (
        candidates.find((type) => MediaRecorder.isTypeSupported(type)) ??
        'audio/webm'
    );
}

export function voiceRecorderOptions(): MediaRecorderOptions {
    return {
        mimeType: pickVoiceMimeType(),
        audioBitsPerSecond: VOICE_BITRATE,
    };
}

export async function compressVoiceBlob(blob: Blob): Promise<File> {
    if (blob.size <= 120_000) {
        return new File([blob], `voice-${Date.now()}.webm`, {
            type: blob.type || 'audio/webm',
        });
    }

    const audioContext = new AudioContext();

    try {
        const decoded = await audioContext.decodeAudioData(
            await blob.arrayBuffer(),
        );
        const destination = audioContext.createMediaStreamDestination();
        const source = audioContext.createBufferSource();
        source.buffer = decoded;
        source.connect(destination);

        const mimeType = pickVoiceMimeType();
        const recorder = new MediaRecorder(destination.stream, {
            mimeType,
            audioBitsPerSecond: VOICE_BITRATE,
        });

        const chunks: Blob[] = [];

        const compressed = await new Promise<Blob>((resolve, reject) => {
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onerror = () => reject(new Error('Voice compression failed.'));

            recorder.onstop = () => {
                resolve(new Blob(chunks, { type: mimeType }));
            };

            source.onended = () => {
                if (recorder.state !== 'inactive') {
                    recorder.stop();
                }
            };

            recorder.start();
            source.start(0);
        });

        const output =
            compressed.size < blob.size && compressed.size > 0
                ? compressed
                : blob;

        const extension = output.type.includes('mp4') ? 'm4a' : 'webm';

        return new File([output], `voice-${Date.now()}.${extension}`, {
            type: output.type || 'audio/webm',
        });
    } catch {
        return new File([blob], `voice-${Date.now()}.webm`, {
            type: blob.type || 'audio/webm',
        });
    } finally {
        await audioContext.close();
    }
}

export async function prepareMessageAttachment(
    file: File,
): Promise<File> {
    if (file.type.startsWith('image/')) {
        return compressImageFile(file);
    }

    if (file.type.startsWith('audio/') || file.type.startsWith('video/webm')) {
        return compressVoiceBlob(file);
    }

    return file;
}
