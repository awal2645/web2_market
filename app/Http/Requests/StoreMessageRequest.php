<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'body' => ['nullable', 'string', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:10240'],
            'reply_to_message_id' => ['nullable', 'integer', 'exists:messages,id'],
            'recipient_id' => ['sometimes', 'required', 'string', 'exists:customer_users,id'],
            'vehicle_listing_id' => ['sometimes', 'nullable', 'integer', 'exists:vehicle_listings,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $hasBody = trim((string) $this->input('body', '')) !== '';
            $hasAttachment = $this->hasFile('attachment');

            if (! $hasBody && ! $hasAttachment) {
                $validator->errors()->add('body', 'Please enter a message or attach a file.');
            }

            if ($hasAttachment) {
                $file = $this->file('attachment');

                if (! $file || ! $file->isValid()) {
                    $validator->errors()->add('attachment', 'The uploaded file is invalid.');

                    return;
                }

                $mime = (string) $file->getMimeType();
                $extension = strtolower((string) $file->getClientOriginalExtension());

                $isImage = str_starts_with($mime, 'image/')
                    || in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true);

                $isAudio = str_starts_with($mime, 'audio/')
                    || str_starts_with($mime, 'video/webm')
                    || in_array($extension, ['webm', 'mp3', 'wav', 'ogg', 'm4a', 'mp4', 'mpeg'], true);

                if (! $isImage && ! $isAudio) {
                    $validator->errors()->add('attachment', 'Please upload an image or audio recording.');
                }
            }
        });
    }
}
