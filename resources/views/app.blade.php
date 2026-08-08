@php
    $seoMeta = \App\Support\SeoMeta::fromInertiaPage($page);
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Server-rendered for link previews / crawlers that do not execute JS --}}
        <title>{{ $seoMeta['documentTitle'] }}</title>
        <meta name="description" content="{{ $seoMeta['description'] }}">
        <link rel="canonical" href="{{ $seoMeta['url'] }}">
        <meta property="og:title" content="{{ $seoMeta['title'] }}">
        <meta property="og:description" content="{{ $seoMeta['description'] }}">
        <meta property="og:url" content="{{ $seoMeta['url'] }}">
        <meta property="og:type" content="{{ $seoMeta['type'] }}">
        <meta property="og:image" content="{{ $seoMeta['image'] }}">
        <meta property="og:image:width" content="{{ $seoMeta['imageWidth'] }}">
        <meta property="og:image:height" content="{{ $seoMeta['imageHeight'] }}">
        <meta property="og:site_name" content="{{ $seoMeta['siteName'] }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoMeta['title'] }}">
        <meta name="twitter:description" content="{{ $seoMeta['description'] }}">
        <meta name="twitter:image" content="{{ $seoMeta['image'] }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head />
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
