<x-mail::message>
# New car listing submitted

A new vehicle was just listed on {{ config('app.name') }}.

**{{ $listingTitle }}**
- Status: {{ $status }}
- Asking price: ${{ $askingPrice }}
@if ($location)
- Location: {{ $location }}
@endif
- Seller: {{ $sellerName }}
@if ($sellerEmail)
- Seller email: {{ $sellerEmail }}
@endif

@if ($listingUrl)
<x-mail::button :url="$listingUrl">
View listing
</x-mail::button>
@endif

<x-mail::button :url="$adminUrl">
Review in admin
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
