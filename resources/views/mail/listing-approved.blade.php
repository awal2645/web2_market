<x-mail::message>
# Your listing is live

**{{ $listingTitle }}** has been approved and is now visible to buyers on Web2Autos Market.

<x-mail::button :url="$listingUrl">
View listing
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
