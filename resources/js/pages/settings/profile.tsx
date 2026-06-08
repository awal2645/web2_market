import { FormEvent, useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import {
    FieldLabel,
    RequiredFieldsNote,
} from '@/components/field-label';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { formatPhoneForInput, isValidPhoneInput } from '@/lib/phone';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

const ALLOWED_AVATAR_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
] as const;

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        auth.user.avatar ?? null,
    );
    const [avatarClientError, setAvatarClientError] = useState<string | null>(
        null,
    );

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: formatPhoneForInput((auth.user.phone as string) ?? ''),
        avatar: null as File | null,
        _method: 'patch',
    });

    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setAvatarClientError(null);

        if (!file) {
            return;
        }

        if (
            !ALLOWED_AVATAR_TYPES.includes(
                file.type as (typeof ALLOWED_AVATAR_TYPES)[number],
            )
        ) {
            setAvatarClientError(
                'Profile pictures must be a JPEG, PNG, or WebP image.',
            );
            event.target.value = '';
            return;
        }

        if (file.size > MAX_AVATAR_SIZE_BYTES) {
            setAvatarClientError('Profile pictures may not be larger than 2 MB.');
            event.target.value = '';
            return;
        }

        if (avatarPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }

        setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!isValidPhoneInput(data.phone)) {
            return;
        }

        post(ProfileController.update.url(), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your profile picture, contact details, and email address"
                />

                <form onSubmit={submit} className="space-y-6">
                    <RequiredFieldsNote />

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="avatar">Profile picture</FieldLabel>

                        <div className="flex items-center gap-4">
                            <Avatar className="size-20 overflow-hidden rounded-full ring-2 ring-border">
                                <AvatarImage
                                    src={avatarPreview ?? undefined}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-neutral-200 text-lg text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="grid gap-2">
                                <input
                                    ref={fileInputRef}
                                    id="avatar"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={handleAvatarChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Camera className="size-4" />
                                    Upload photo
                                </Button>
                                <p
                                    id="avatar-help"
                                    className="text-xs text-muted-foreground"
                                >
                                    JPEG, PNG, or WebP. Minimum 100×100 px, up
                                    to 2 MB.
                                </p>
                            </div>
                        </div>

                        <InputError
                            message={avatarClientError ?? errors.avatar}
                        />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="name" required>
                            Name
                        </FieldLabel>

                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />

                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="phone" required>
                            Mobile number
                        </FieldLabel>

                        <Input
                            id="phone"
                            type="tel"
                            inputMode="tel"
                            className="mt-1 block w-full"
                            value={data.phone}
                            onChange={(event) =>
                                setData('phone', event.target.value)
                            }
                            required
                            autoComplete="tel"
                            placeholder="(555) 123-4567"
                            aria-describedby="phone-help"
                        />

                        <p
                            id="phone-help"
                            className="text-xs text-muted-foreground"
                        >
                            US numbers can be entered with or without the country
                            code.
                        </p>

                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <FieldLabel htmlFor="email" required>
                            Email address
                        </FieldLabel>

                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            required
                            autoComplete="username"
                            placeholder="Email address"
                        />

                        <InputError message={errors.email} />
                    </div>

                    {mustVerifyEmail &&
                        auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to re-send the verification
                                        email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to
                                        your email address.
                                    </div>
                                )}
                            </div>
                        )}

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            data-test="update-profile-button"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
