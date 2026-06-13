<x-mail::message>
# Price drop alert

A vehicle on your watchlist dropped in price.

**{{ $listingTitle }}**

**${{ $previousPrice }}** → **${{ $newPrice }}**

<x-mail::button :url="$listingUrl">
View listing
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
