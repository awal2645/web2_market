import { router } from '@inertiajs/react';
import { ImagePlus, Loader2, Mic, Send, Square, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MessageReplyBar } from '@/components/messages/message-reply-bar';
import { ImagePreviewLightbox } from '@/components/messages/image-preview-lightbox';
import { VoiceWaveform } from '@/components/messages/voice-waveform';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { compressImageFile, prepareMessageAttachment } from '@/lib/compress-media';
import type { Message } from '@/types/messages';

type Props = {
    conversationId: string;
    replyTo?: Message | null;
    onCancelReply?: () => void;
};

export function MessageComposer({
    conversationId,
    replyTo = null,
    onCancelReply,
}: Props) {
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const {
        isRecording,
        recordingBlob,
        waveform,
        startRecording,
        stopRecording,
        clearRecording,
        getRecordingFile,
    } = useVoiceRecorder();

    const recordingPreviewUrl = useMemo(
        () => (recordingBlob ? URL.createObjectURL(recordingBlob) : null),
        [recordingBlob],
    );

    useEffect(() => {
        return () => {
            if (recordingPreviewUrl) {
                URL.revokeObjectURL(recordingPreviewUrl);
            }
        };
    }, [recordingPreviewUrl]);

    const voiceFile = recordingBlob ? getRecordingFile() : null;

    const canSend =
        !sending &&
        !compressing &&
        !isRecording &&
        (body.trim().length > 0 || imageFile !== null || voiceFile !== null);

    const clearImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const handleImageSelect = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        clearRecording();
        clearImage();
        setCompressing(true);

        try {
            const compressed = await compressImageFile(file);
            setImageFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));

            if (compressed.size < file.size) {
                const savedKb = Math.round((file.size - compressed.size) / 1024);
                toast.success(`Image optimized (saved ${savedKb} KB)`);
            }
        } catch {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            toast.error('Could not optimize image. Sending original.');
        } finally {
            setCompressing(false);
        }
    };

    const resetComposer = () => {
        setBody('');
        clearImage();
        clearRecording();
        onCancelReply?.();
    };

    const showSendError = (errors: Record<string, string>) => {
        const message =
            errors.attachment ||
            errors.body ||
            Object.values(errors)[0] ||
            'Could not send message. Please try again.';

        toast.error(message);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!canSend || sending || compressing) {
            return;
        }

        const trimmedBody = body.trim();
        const rawAttachment = imageFile ?? getRecordingFile();
        const url = `/messages/${conversationId}/messages`;

        setSending(true);

        let attachment: File | null = rawAttachment;

        if (rawAttachment) {
            setCompressing(true);

            try {
                attachment = await prepareMessageAttachment(rawAttachment);
            } catch {
                attachment = rawAttachment;
            } finally {
                setCompressing(false);
            }
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => resetComposer(),
            onError: showSendError,
            onFinish: () => setSending(false),
        };

        if (attachment) {
            const formData = new FormData();

            if (trimmedBody) {
                formData.append('body', trimmedBody);
            }

            formData.append('attachment', attachment);

            if (replyTo) {
                formData.append(
                    'reply_to_message_id',
                    replyTo.id.toString(),
                );
            }

            router.post(url, formData, {
                ...options,
                forceFormData: true,
            });

            return;
        }

        router.post(
            url,
            {
                body: trimmedBody,
                ...(replyTo ? { reply_to_message_id: replyTo.id } : {}),
            },
            options,
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-2 border-t border-border pt-4"
        >
            {replyTo && onCancelReply && (
                <MessageReplyBar message={replyTo} onCancel={onCancelReply} />
            )}

            {imagePreview && (
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                            Image preview
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={clearImage}
                            disabled={compressing}
                        >
                            Remove
                        </Button>
                    </div>
                    <div className="relative inline-block max-w-full">
                        <button
                            type="button"
                            onClick={() => setImagePreviewOpen(true)}
                            className="block overflow-hidden rounded-lg border border-border"
                            aria-label="View full image preview"
                        >
                            <img
                                src={imagePreview}
                                alt="Attachment preview"
                                className="max-h-48 max-w-full cursor-zoom-in object-contain sm:max-h-56"
                            />
                        </button>
                        {compressing && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
                                <Loader2 className="size-5 animate-spin text-[#1565C0]" />
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute -top-2 -right-2 size-6 rounded-full"
                            onClick={clearImage}
                            disabled={compressing}
                        >
                            <X className="size-3" />
                        </Button>
                    </div>
                    <ImagePreviewLightbox
                        src={imagePreview}
                        alt="Attachment preview"
                        open={imagePreviewOpen}
                        onOpenChange={setImagePreviewOpen}
                    />
                </div>
            )}

            {recordingBlob && !isRecording && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                    <VoiceWaveform levels={waveform} className="max-w-[120px]" />
                    <span className="shrink-0 text-sm text-muted-foreground">
                        Voice ready
                    </span>
                    {recordingPreviewUrl && (
                        <audio
                            controls
                            preload="metadata"
                            className="max-w-[180px] flex-1"
                            src={recordingPreviewUrl}
                        />
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={clearRecording}
                        disabled={sending || compressing}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            )}

            {isRecording && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/40">
                    <span className="size-2 shrink-0 animate-pulse rounded-full bg-red-500" />
                    <VoiceWaveform levels={waveform} active />
                    <span className="shrink-0 text-sm font-medium text-red-700 dark:text-red-300">
                        Recording… tap stop, then send
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={sending || compressing || isRecording}
                    onClick={() => imageInputRef.current?.click()}
                    aria-label="Attach image"
                >
                    <ImagePlus className="size-4" />
                </Button>

                <Button
                    type="button"
                    variant={isRecording ? 'destructive' : 'ghost'}
                    size="icon"
                    disabled={sending || compressing}
                    onClick={() => {
                        clearImage();

                        if (isRecording) {
                            stopRecording();
                        } else {
                            startRecording();
                        }
                    }}
                    aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
                >
                    {isRecording ? (
                        <Square className="size-4" />
                    ) : (
                        <Mic className="size-4" />
                    )}
                </Button>

                <Input
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Type a message..."
                    disabled={sending || compressing || isRecording}
                    autoComplete="off"
                    className="flex-1"
                />

                <Button
                    type="submit"
                    disabled={!canSend}
                    className="shrink-0 bg-[#1565C0] hover:bg-[#0D47A1]"
                >
                    {sending || compressing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </form>
    );
}
