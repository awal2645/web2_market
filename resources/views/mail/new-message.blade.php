<x-mail::message>
# New message from {{ $senderName }}

{{ $preview }}

<x-mail::button :url="$conversationUrl">
Open conversation
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
