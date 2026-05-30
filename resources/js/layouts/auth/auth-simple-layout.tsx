import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col bg-gradient-to-br from-blue-50 via-white to-white">
            {/* Red top accent bar */}
            <div className="h-1.5 w-full bg-[#1565C0]" />

            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <Link
                            href={home()}
                            className="inline-block transition hover:opacity-90"
                        >
                            <img
                                src="/images/web2autos-logo.png"
                                alt="Web2Autos.com"
                                className="h-12 w-auto sm:h-14"
                            />
                        </Link>
                        <p className="mt-3 text-xs font-medium tracking-widest text-[#1565C0] uppercase">
                            Where Buyers &amp; Sellers Meet
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-lg shadow-blue-100/50">
                        <div className="mb-6 space-y-1 text-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-gray-500">
                                    {description}
                                </p>
                            )}
                        </div>
                        {children}
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} Web2Autos.com
                    </p>
                </div>
            </div>
        </div>
    );
}
