import { Link, useForm } from '@inertiajs/react';
import {
    Camera,
    Car,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ImagePlus,
    Info,
    Phone,
    Sparkles,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PrivatePageHead } from '@/components/seo/seo-head';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatPrice } from '@/data/homepage';
import { cn } from '@/lib/utils';
import type {
    ListingFormDefaults,
    ListingFormOptions,
    VehicleListing,
} from '@/types/market';

export type ListingFormProps = {
    mode: 'create' | 'edit';
    defaults: ListingFormDefaults;
    options: ListingFormOptions;
    approvalMode: string;
    initialStep?: string;
    listing?: VehicleListing;
    successListing?: VehicleListing | null;
};

const STEPS = [
    { id: 1, title: 'Basics', hint: 'What are you selling?' },
    { id: 2, title: 'Details', hint: 'Specs & condition' },
    { id: 3, title: 'Photos', hint: 'Add great pictures' },
    { id: 4, title: 'Contact', hint: 'Review & save' },
] as const;

const STEP_SLUGS = ['basics', 'details', 'photos', 'contact'] as const;

function stepFromSlug(slug?: string | null): number {
    if (!slug || slug === 'basics') {
        return 1;
    }

    if (slug === 'success') {
        return 5;
    }

    const index = STEP_SLUGS.indexOf(slug as (typeof STEP_SLUGS)[number]);

    return index === -1 ? 1 : index + 1;
}

function slugFromStep(step: number): string {
    if (step >= 1 && step <= STEPS.length) {
        return STEP_SLUGS[step - 1];
    }

    return 'success';
}

function buildFormUrl(basePath: string, step: number): string {
    const slug = slugFromStep(step);

    if (slug === 'basics') {
        return basePath;
    }

    return `${basePath}?step=${slug}`;
}

function updateStepUrl(
    basePath: string,
    step: number,
    replace = false,
): void {
    const url = buildFormUrl(basePath, step);

    if (replace) {
        window.history.replaceState({ listingStep: step }, '', url);
    } else {
        window.history.pushState({ listingStep: step }, '', url);
    }
}

const POPULAR_MAKES = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'BMW',
    'Mercedes',
    'Nissan',
    'Hyundai',
];

const fieldClass =
    'border-input bg-background text-foreground focus-visible:border-[#1565C0] focus-visible:ring-[#1565C0]/30';
const selectClass = cn(
    'h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none',
    'border-input focus-visible:border-[#1565C0] focus-visible:ring-[#1565C0]/30 focus-visible:ring-[3px]',
);

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

function sanitizeVin(value: string): string {
    return value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .replace(/[IOQ]/g, '')
        .slice(0, 17);
}

function isValidVin(vin: string): boolean {
    return VIN_PATTERN.test(sanitizeVin(vin));
}

function getVinValidationMessage(vin: string): string | undefined {
    const normalized = sanitizeVin(vin);

    if (!normalized) {
        return undefined;
    }

    if (normalized.length < 17) {
        return `VIN must be 17 characters (${normalized.length}/17). No I, O, or Q.`;
    }

    if (!isValidVin(normalized)) {
        return 'VIN can only use letters and numbers (no I, O, or Q).';
    }

    return undefined;
}

function fieldToStep(field: string): number {
    const base = field.split('.')[0];

    if (
        ['year', 'make', 'model', 'trim', 'mileage', 'asking_price'].includes(
            base,
        )
    ) {
        return 1;
    }

    if (
        [
            'vin',
            'title_status',
            'condition',
            'exterior_color',
            'interior_color',
            'transmission',
            'fuel_type',
            'drivetrain',
            'seller_notes',
        ].includes(base)
    ) {
        return 2;
    }

    if (base === 'images') {
        return 3;
    }

    return 4;
}

function SelectField({
    id,
    label,
    name,
    options,
    value,
    onChange,
    required = true,
    error,
    hint,
}: {
    id: string;
    label: string;
    name: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
    hint?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium text-foreground">
                {label}
                {!required && (
                    <span className="ml-1 font-normal text-muted-foreground">
                        (optional)
                    </span>
                )}
            </Label>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <select
                id={id}
                name={name}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={selectClass}
            >
                <option value="" disabled>
                    Select {label.toLowerCase()}
                </option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}

function SearchableSelectField({
    id,
    label,
    name,
    options,
    value,
    onChange,
    required = true,
    error,
    hint,
    placeholder,
}: {
    id: string;
    label: string;
    name: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
    hint?: string;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    const filteredOptions = useMemo(() => {
        const trimmed = query.trim();

        if (!trimmed) {
            return options;
        }

        return options.filter((option) => option.includes(trimmed));
    }, [options, query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
                setQuery(value);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const selectOption = (option: string) => {
        onChange(option);
        setQuery(option);
        setOpen(false);
    };

    return (
        <div className="grid gap-2" ref={containerRef}>
            <Label htmlFor={id} className="font-medium text-foreground">
                {label}
                {!required && (
                    <span className="ml-1 font-normal text-muted-foreground">
                        (optional)
                    </span>
                )}
            </Label>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <div className="relative">
                <Input
                    id={id}
                    name={name}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={query}
                    placeholder={placeholder ?? `Search ${label.toLowerCase()}…`}
                    className={fieldClass}
                    onChange={(event) => {
                        const nextQuery = event.target.value;

                        setQuery(nextQuery);
                        setOpen(true);
                        onChange(
                            options.includes(nextQuery) ? nextQuery : '',
                        );
                    }}
                    onFocus={() => setOpen(true)}
                />
                {open && filteredOptions.length > 0 && (
                    <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-card py-1 shadow-md">
                        {filteredOptions.map((option) => (
                            <li key={option}>
                                <button
                                    type="button"
                                    className={cn(
                                        'w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted',
                                        value === option &&
                                            'bg-muted font-medium',
                                    )}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onClick={() => selectOption(option)}
                                >
                                    {option}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <InputError message={error} />
        </div>
    );
}

function TextField({
    id,
    label,
    name,
    value,
    onChange,
    type = 'text',
    required = true,
    error,
    hint,
    placeholder,
    maxLength,
    min,
    max,
}: {
    id: string;
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    placeholder?: string;
    maxLength?: number;
    min?: number;
    max?: number;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id} className="font-medium text-foreground">
                {label}
                {!required && (
                    <span className="ml-1 font-normal text-muted-foreground">
                        (optional)
                    </span>
                )}
            </Label>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <Input
                id={id}
                name={name}
                type={type}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                min={min}
                max={max}
                className={fieldClass}
            />
            <InputError message={error} />
        </div>
    );
}

function ListingSuccessStep({
    listing,
    approvalMode,
    mode,
}: {
    listing: VehicleListing;
    approvalMode: string;
    mode: 'create' | 'edit';
}) {
    const isLive = listing.status === 'approved';

    return (
        <section className="space-y-6 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                    {mode === 'edit'
                        ? 'Listing updated!'
                        : 'Listing submitted!'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {mode === 'edit'
                        ? 'Your changes have been saved successfully.'
                        : isLive
                          ? 'Your vehicle is now live on Web2Autos Market. Buyers can browse and contact you.'
                          : approvalMode === 'automatic'
                            ? 'Your listing is being processed and will appear shortly.'
                            : 'Your listing is pending review. We will notify you once it is approved.'}
                </p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3 text-left">
                <p className="font-semibold text-foreground">{listing.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {formatPrice(listing.asking_price)} · {listing.status_label}
                </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild variant="outline">
                    <Link href="/listings">My Listings</Link>
                </Button>
                <Button
                    asChild
                    className="bg-[#1565C0] hover:bg-[#0D47A1]"
                >
                    <Link href={`/market/${listing.slug}`}>View Listing</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            </div>
        </section>
    );
}

export function ListingForm({
    mode,
    defaults,
    options,
    approvalMode,
    initialStep = 'basics',
    listing,
    successListing = null,
}: ListingFormProps) {
    const isEditing = mode === 'edit' && !!listing;
    const basePath = isEditing
        ? `/listings/${listing!.id}/edit`
        : '/listings/create';

    const [step, setStep] = useState(() =>
        successListing ? 5 : stepFromSlug(initialStep),
    );
    const [previews, setPreviews] = useState<{ url: string; file: File }[]>(
        [],
    );
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
    const [dragOver, setDragOver] = useState(false);

    const keptExistingImages =
        listing?.images.filter(
            (image) => !removedImageIds.includes(image.id),
        ) ?? [];

    const years = useMemo(() => {
        const maxYear = new Date().getFullYear() + 1;

        return Array.from({ length: maxYear - 1900 + 1 }, (_, i) =>
            String(maxYear - i),
        );
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        year: listing ? String(listing.year) : '',
        make: listing?.make ?? '',
        model: listing?.model ?? '',
        trim: listing?.trim ?? '',
        mileage: listing ? String(listing.mileage) : '',
        vin: listing?.vin ?? '',
        title_status: listing?.title_status ?? '',
        condition: listing?.condition ?? '',
        exterior_color: listing?.exterior_color ?? '',
        interior_color: listing?.interior_color ?? '',
        transmission: listing?.transmission ?? '',
        fuel_type: listing?.fuel_type ?? '',
        drivetrain: listing?.drivetrain ?? '',
        body_type: listing?.body_type ?? '',
        city: listing?.city ?? '',
        state: listing?.state ?? '',
        zip_code: listing?.zip_code ?? '',
        asking_price: listing ? String(listing.asking_price) : '',
        seller_notes: listing?.seller_notes ?? '',
        contact_name: listing?.contact_name ?? defaults.contact_name,
        contact_email: listing?.contact_email ?? defaults.contact_email,
        contact_phone: listing?.contact_phone ?? '',
        images: [] as File[],
        remove_images: [] as number[],
        ...(isEditing ? { _method: 'put' as const } : {}),
    });

    const [decodingVin, setDecodingVin] = useState(false);

    const decodeVin = async () => {
        const vin = sanitizeVin(data.vin);

        if (vin.length !== 17) {
            toast.error('Enter a valid 17-character VIN first.');
            return;
        }

        setDecodingVin(true);

        try {
            const response = await fetch(`/vin-decode/${vin}`, {
                headers: { Accept: 'application/json' },
            });
            const payload = await response.json();

            if (!response.ok) {
                toast.error(payload.message ?? 'Could not decode VIN.');
                return;
            }

            const decoded = payload.data as Record<string, string | number | null>;

            if (decoded.year) {
                setData('year', String(decoded.year));
            }
            if (decoded.make) {
                setData('make', String(decoded.make));
            }
            if (decoded.model) {
                setData('model', String(decoded.model));
            }
            if (decoded.trim) {
                setData('trim', String(decoded.trim));
            }
            if (decoded.body_type) {
                setData('body_type', String(decoded.body_type));
            }
            if (decoded.fuel_type) {
                setData('fuel_type', String(decoded.fuel_type));
            }
            if (decoded.transmission) {
                setData('transmission', String(decoded.transmission));
            }
            if (decoded.drivetrain) {
                setData('drivetrain', String(decoded.drivetrain));
            }

            toast.success('VIN decoded — review the auto-filled fields.');
        } catch {
            toast.error('Could not decode VIN.');
        } finally {
            setDecodingVin(false);
        }
    };

    const listingTitle =
        data.year && data.make && data.model
            ? `${data.year} ${data.make} ${data.model}${data.trim ? ` ${data.trim}` : ''}`
            : 'Your vehicle listing';

    const syncImages = useCallback(
        (items: { url: string; file: File }[]) => {
            setPreviews(items);
            setData(
                'images',
                items.map((item) => item.file),
            );
        },
        [setData],
    );

    const addImages = useCallback(
        (files: FileList | File[]) => {
            const selected = Array.from(files).filter((file) =>
                file.type.startsWith('image/'),
            );
            if (selected.length === 0) {
                return;
            }

            const total =
                keptExistingImages.length + previews.length + selected.length;

            if (total > 20) {
                toast.error('You can have at most 20 photos per listing.');
                return;
            }

            const next = [
                ...previews,
                ...selected.map((file) => ({
                    url: URL.createObjectURL(file),
                    file,
                })),
            ];

            syncImages(next);
        },
        [keptExistingImages.length, previews, syncImages],
    );

    const toggleRemoveExistingImage = (imageId: number) => {
        setRemovedImageIds((current) => {
            const next = current.includes(imageId)
                ? current.filter((id) => id !== imageId)
                : [...current, imageId];

            setData('remove_images', next);
            return next;
        });
    };

    const totalPhotoCount = keptExistingImages.length + previews.length;

    const removeImage = (index: number) => {
        const next = previews.filter((_, i) => i !== index);
        URL.revokeObjectURL(previews[index].url);
        syncImages(next);
    };

    const stepFields: Record<number, (keyof typeof data)[]> = {
        1: ['year', 'make', 'model', 'mileage', 'asking_price'],
        2: [
            'vin',
            'title_status',
            'condition',
            'exterior_color',
            'interior_color',
            'transmission',
            'fuel_type',
            'drivetrain',
            'body_type',
        ],
        3: ['images'],
        4: [
            'contact_name',
            'contact_email',
            'contact_phone',
            'city',
            'state',
            'zip_code',
        ],
    };

    const canContinue = (forStep = step) => {
        const fields = stepFields[forStep];

        return fields.every((field) => {
            if (field === 'images') {
                return totalPhotoCount > 0;
            }

            const value = data[field];

            if (field === 'trim' || field === 'seller_notes') {
                return true;
            }

            if (field === 'vin') {
                return isValidVin(String(value));
            }

            return String(value).trim() !== '';
        });
    };

    useEffect(() => {
        if (successListing) {
            setStep(5);
            updateStepUrl(basePath, 5, true);
            return;
        }

        const urlStep = stepFromSlug(
            new URLSearchParams(window.location.search).get('step') ??
                initialStep,
        );

        if (urlStep === 5) {
            setStep(1);
            updateStepUrl(basePath, 1, true);
            return;
        }

        let allowedStep = urlStep;

        if (!isEditing) {
            for (let s = 1; s < urlStep; s += 1) {
                if (!canContinue(s)) {
                    allowedStep = s;
                    break;
                }
            }
        }

        setStep(allowedStep);
        updateStepUrl(basePath, allowedStep, true);
        // Only sync from the URL when the page first loads or after submit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [successListing, initialStep, basePath, isEditing]);

    useEffect(() => {
        const handlePopState = () => {
            const urlStep = stepFromSlug(
                new URLSearchParams(window.location.search).get('step'),
            );

            if (urlStep === 5) {
                if (successListing) {
                    setStep(5);
                } else {
                    setStep(1);
                    updateStepUrl(basePath, 1, true);
                }
                return;
            }

            setStep(urlStep);
        };

        window.addEventListener('popstate', handlePopState);

        return () => window.removeEventListener('popstate', handlePopState);
    }, [successListing, basePath]);

    const validateBeforeSave = (): boolean => {
        for (let s = 1; s <= STEPS.length; s += 1) {
            if (!canContinue(s)) {
                setStep(s);
                if (s === 2 && data.vin && !isValidVin(data.vin)) {
                    toast.error(
                        'VIN must be exactly 17 characters (letters and numbers only, no I, O, or Q).',
                    );
                } else if (s === 3 && totalPhotoCount === 0) {
                    toast.error('Please keep or upload at least one vehicle photo.');
                } else {
                    toast.error(
                        'Please complete all required fields before saving.',
                    );
                }
                return false;
            }
        }

        return true;
    };

    const goNext = () => {
        if (step < STEPS.length && canContinue()) {
            const nextStep = step + 1;
            setStep(nextStep);
            updateStepUrl(basePath, nextStep);
            return;
        }

        if (step === 2) {
            if (!data.vin.trim()) {
                toast.error('Please enter the vehicle VIN.');
            } else if (!isValidVin(data.vin)) {
                toast.error(
                    getVinValidationMessage(data.vin) ??
                        'VIN must be exactly 17 characters (no I, O, or Q).',
                );
            } else {
                toast.error('Please complete all required fields on this step.');
            }
            return;
        }

        toast.error('Please complete all required fields before continuing.');
    };

    const goBack = () => {
        if (step > 1 && step <= STEPS.length) {
            const previousStep = step - 1;
            setStep(previousStep);
            updateStepUrl(basePath, previousStep);
        }
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateBeforeSave()) {
            return;
        }

        const submitUrl = isEditing
            ? `/listings/${listing!.id}`
            : '/listings';

        post(submitUrl, {
            forceFormData: true,
            onError: (formErrors) => {
                const firstField = Object.keys(formErrors)[0];
                if (firstField) {
                    const errorStep = fieldToStep(firstField);
                    setStep(errorStep);
                    updateStepUrl(basePath, errorStep, true);
                }
                toast.error(
                    isEditing
                        ? 'Could not update your listing. Please fix the errors below.'
                        : 'Could not save your listing. Please fix the errors below.',
                );
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const errorMessages = Object.values(errors).filter(Boolean) as string[];

    const isSuccess = step === 5 && successListing;
    const coverPreviewUrl =
        previews[0]?.url ??
        keptExistingImages[0]?.url ??
        listing?.images[0]?.url;

    const pageTitle = isSuccess
        ? isEditing
            ? 'Listing Updated'
            : 'Listing Submitted'
        : isEditing
          ? 'Edit Listing'
          : 'List Your Vehicle';

    return (
        <>
            <PrivatePageHead title={pageTitle} />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-[#1565C0] dark:text-[#90caf9]">
                        Web2Autos Market
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isSuccess
                            ? 'All done!'
                            : isEditing
                              ? 'Edit your listing'
                              : 'List your vehicle'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isSuccess
                            ? isEditing
                                ? 'Your changes have been saved successfully.'
                                : 'Your classified ad has been saved successfully.'
                            : isEditing
                              ? 'Update your vehicle details step by step.'
                              : 'Takes about 5 minutes. You can review everything before saving.'}
                    </p>
                </div>

                {errorMessages.length > 0 && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    >
                        <p className="font-semibold">
                            Please fix the following before saving:
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                            {errorMessages.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {isSuccess && successListing && (
                    <ListingSuccessStep
                        listing={successListing}
                        approvalMode={approvalMode}
                        mode={mode}
                    />
                )}

                {/* Step progress */}
                {!isSuccess && (
                <nav aria-label="Listing steps">
                    <ol className="flex items-center gap-1 sm:gap-2">
                        {STEPS.map((s, index) => {
                            const done = step > s.id;
                            const active = step === s.id;
                            return (
                                <li
                                    key={s.id}
                                    className="flex min-w-0 flex-1 items-center"
                                >
                                    <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                                        <div
                                            className={cn(
                                                'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition',
                                                done &&
                                                    'bg-[#1565C0] text-white',
                                                active &&
                                                    'bg-[#1565C0] text-white ring-4 ring-[#1565C0]/20',
                                                !done &&
                                                    !active &&
                                                    'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {done ? (
                                                <Check className="size-4" />
                                            ) : (
                                                s.id
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                'hidden truncate text-center text-xs font-medium sm:block',
                                                active
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {s.title}
                                        </span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div
                                            className={cn(
                                                'mx-1 h-0.5 min-w-3 flex-1 rounded-full sm:mx-2',
                                                step > s.id
                                                    ? 'bg-[#1565C0]'
                                                    : 'bg-muted',
                                            )}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                    <p className="mt-3 text-center text-sm text-muted-foreground">
                        Step {step} of {STEPS.length} —{' '}
                        {STEPS[step - 1].hint}
                    </p>
                </nav>
                )}

                {/* Live preview card */}
                {!isSuccess && (data.year || data.make || data.asking_price) && (
                    <div className="flex items-center gap-4 rounded-xl border border-[#1565C0]/20 bg-[#1565C0]/5 px-4 py-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card shadow-sm">
                            <Car className="size-5 text-[#1565C0]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {listingTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {data.mileage
                                    ? `${Number(data.mileage).toLocaleString()} mi`
                                    : 'Mileage not set'}
                                {data.asking_price &&
                                    ` · ${formatPrice(Number(data.asking_price))}`}
                            </p>
                        </div>
                        {coverPreviewUrl && (
                            <img
                                src={coverPreviewUrl}
                                alt="Preview"
                                className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-border"
                            />
                        )}
                    </div>
                )}

                {!isSuccess && (
                <form onSubmit={submit} encType="multipart/form-data">
                    {/* Step 1 — Basics */}
                    {step === 1 && (
                        <section className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                                <Sparkles className="mt-0.5 size-4 shrink-0 text-[#1565C0]" />
                                <p className="text-sm text-muted-foreground">
                                    Start with the basics buyers search for
                                    first — year, make, model, mileage, and
                                    your asking price.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <SearchableSelectField
                                    id="year"
                                    label="Year"
                                    name="year"
                                    options={years}
                                    value={data.year}
                                    onChange={(v) => setData('year', v)}
                                    error={errors.year}
                                    placeholder="Type to search year…"
                                />
                                <TextField
                                    id="make"
                                    label="Make"
                                    name="make"
                                    value={data.make}
                                    onChange={(v) => setData('make', v)}
                                    placeholder="e.g. Honda"
                                    error={errors.make}
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Popular makes — tap to fill
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {POPULAR_MAKES.map((make) => (
                                        <button
                                            key={make}
                                            type="button"
                                            onClick={() =>
                                                setData('make', make)
                                            }
                                            className={cn(
                                                'rounded-full border px-3 py-1 text-xs font-medium transition',
                                                data.make === make
                                                    ? 'border-[#1565C0] bg-[#1565C0] text-white'
                                                    : 'border-border bg-card text-muted-foreground hover:border-[#1565C0]/40 hover:text-[#1565C0]',
                                            )}
                                        >
                                            {make}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    id="model"
                                    label="Model"
                                    name="model"
                                    value={data.model}
                                    onChange={(v) => setData('model', v)}
                                    placeholder="e.g. Accord"
                                    error={errors.model}
                                />
                                <TextField
                                    id="trim"
                                    label="Trim"
                                    name="trim"
                                    value={data.trim}
                                    onChange={(v) => setData('trim', v)}
                                    placeholder="e.g. EX, Sport, Limited"
                                    required={false}
                                    error={errors.trim}
                                />
                                <TextField
                                    id="mileage"
                                    label="Mileage"
                                    name="mileage"
                                    type="number"
                                    min={0}
                                    value={data.mileage}
                                    onChange={(v) => setData('mileage', v)}
                                    placeholder="e.g. 45000"
                                    hint="Current odometer reading"
                                    error={errors.mileage}
                                />
                                <TextField
                                    id="asking_price"
                                    label="Asking Price"
                                    name="asking_price"
                                    type="number"
                                    min={1}
                                    value={data.asking_price}
                                    onChange={(v) =>
                                        setData('asking_price', v)
                                    }
                                    placeholder="e.g. 21990"
                                    hint="What you'd like to receive ($)"
                                    error={errors.asking_price}
                                />
                            </div>
                        </section>
                    )}

                    {/* Step 2 — Details */}
                    {step === 2 && (
                        <section className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    id="vin"
                                    label="VIN"
                                    name="vin"
                                    value={data.vin}
                                    onChange={(v) =>
                                        setData('vin', sanitizeVin(v))
                                    }
                                    maxLength={17}
                                    placeholder="e.g. 1HGBH41JXMN109186"
                                    hint={`${sanitizeVin(data.vin).length}/17 characters — on dashboard or door jamb (no I, O, or Q)`}
                                    error={
                                        errors.vin ??
                                        getVinValidationMessage(data.vin)
                                    }
                                />
                                <div className="sm:col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={decodingVin}
                                        onClick={decodeVin}
                                    >
                                        {decodingVin
                                            ? 'Decoding VIN...'
                                            : 'Decode VIN (NHTSA)'}
                                    </Button>
                                </div>
                                <SelectField
                                    id="title_status"
                                    label="Title Status"
                                    name="title_status"
                                    options={options.titleStatuses}
                                    value={data.title_status}
                                    onChange={(v) =>
                                        setData('title_status', v)
                                    }
                                    error={errors.title_status}
                                />
                                <SelectField
                                    id="condition"
                                    label="Condition"
                                    name="condition"
                                    options={options.conditions}
                                    value={data.condition}
                                    onChange={(v) =>
                                        setData('condition', v)
                                    }
                                    error={errors.condition}
                                />
                                <SelectField
                                    id="transmission"
                                    label="Transmission"
                                    name="transmission"
                                    options={options.transmissions}
                                    value={data.transmission}
                                    onChange={(v) =>
                                        setData('transmission', v)
                                    }
                                    error={errors.transmission}
                                />
                                <SelectField
                                    id="fuel_type"
                                    label="Fuel Type"
                                    name="fuel_type"
                                    options={options.fuelTypes}
                                    value={data.fuel_type}
                                    onChange={(v) => setData('fuel_type', v)}
                                    error={errors.fuel_type}
                                />
                                <SelectField
                                    id="drivetrain"
                                    label="Drivetrain"
                                    name="drivetrain"
                                    options={options.drivetrains}
                                    value={data.drivetrain}
                                    onChange={(v) => setData('drivetrain', v)}
                                    error={errors.drivetrain}
                                />
                                <SelectField
                                    id="body_type"
                                    label="Body Type"
                                    name="body_type"
                                    options={options.bodyTypes}
                                    value={data.body_type}
                                    onChange={(v) => setData('body_type', v)}
                                    error={errors.body_type}
                                />
                                <TextField
                                    id="exterior_color"
                                    label="Exterior Color"
                                    name="exterior_color"
                                    value={data.exterior_color}
                                    onChange={(v) =>
                                        setData('exterior_color', v)
                                    }
                                    placeholder="e.g. Red"
                                    error={errors.exterior_color}
                                />
                                <TextField
                                    id="interior_color"
                                    label="Interior Color"
                                    name="interior_color"
                                    value={data.interior_color}
                                    onChange={(v) =>
                                        setData('interior_color', v)
                                    }
                                    placeholder="e.g. Black leather"
                                    error={errors.interior_color}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="seller_notes"
                                    className="font-medium text-foreground"
                                >
                                    Seller Notes{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Mention maintenance history, upgrades, or
                                    anything that helps buyers decide.
                                </p>
                                <textarea
                                    id="seller_notes"
                                    name="seller_notes"
                                    rows={4}
                                    value={data.seller_notes}
                                    onChange={(e) =>
                                        setData('seller_notes', e.target.value)
                                    }
                                    className={cn(
                                        'w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none',
                                        fieldClass,
                                        'focus-visible:ring-[3px]',
                                    )}
                                    placeholder="Well maintained, new tires, single owner, garage kept..."
                                />
                                <InputError message={errors.seller_notes} />
                            </div>
                        </section>
                    )}

                    {/* Step 3 — Photos */}
                    {step === 3 && (
                        <section className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 ring-1 ring-amber-100">
                                <Camera className="mt-0.5 size-4 shrink-0 text-amber-600" />
                                <div className="text-sm text-amber-900">
                                    <p className="font-medium">
                                        Photos sell cars
                                    </p>
                                    <p className="mt-1 text-amber-800/80">
                                        Listings with 5+ clear photos get more
                                        views. Include front, rear, interior,
                                        and any imperfections.
                                    </p>
                                </div>
                            </div>

                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                    addImages(e.dataTransfer.files);
                                }}
                                className={cn(
                                    'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition',
                                    dragOver
                                        ? 'border-[#1565C0] bg-[#1565C0]/5'
                                        : 'border-input bg-muted/50 hover:border-[#1565C0]/40',
                                )}
                            >
                                <ImagePlus className="size-10 text-muted-foreground" />
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    Drag & drop photos here
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    or click to browse — up to 20 images (JPEG,
                                    PNG, WebP, max 10 MB each)
                                </p>
                                <label className="mt-4">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        multiple
                                        className="sr-only"
                                        onChange={(e) => {
                                            addImages(e.target.files ?? []);
                                            e.target.value = '';
                                        }}
                                    />
                                    <span className="inline-flex h-9 cursor-pointer items-center rounded-md bg-[#1565C0] px-4 text-sm font-medium text-white hover:bg-[#0D47A1]">
                                        Choose Photos
                                    </span>
                                </label>
                            </div>
                            <InputError message={errors.images} />

                            {isEditing && listing.images.length > 0 && (
                                <div>
                                    <p className="mb-3 text-sm font-medium text-foreground">
                                        Current photos — tap to remove
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {listing.images.map((image) => {
                                            const marked =
                                                removedImageIds.includes(
                                                    image.id,
                                                );

                                            return (
                                                <button
                                                    key={image.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleRemoveExistingImage(
                                                            image.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        'group relative aspect-square overflow-hidden rounded-lg ring-2 transition',
                                                        marked
                                                            ? 'opacity-40 ring-red-400'
                                                            : 'ring-border hover:ring-[#1565C0]',
                                                    )}
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt=""
                                                        className="size-full object-cover"
                                                    />
                                                    {marked && (
                                                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                                                            Removed
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {previews.length > 0 && (
                                <div>
                                    <p className="mb-3 text-sm font-medium text-foreground">
                                        {previews.length} new photo
                                        {previews.length !== 1 ? 's' : ''}{' '}
                                        selected
                                        {previews[0] &&
                                            keptExistingImages.length ===
                                                0 && (
                                                <span className="ml-2 font-normal text-muted-foreground">
                                                    — first photo is the cover
                                                </span>
                                            )}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {previews.map((preview, index) => (
                                            <div
                                                key={preview.url}
                                                className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-border"
                                            >
                                                <img
                                                    src={preview.url}
                                                    alt={`Photo ${index + 1}`}
                                                    className="size-full object-cover"
                                                />
                                                {index === 0 && (
                                                    <span className="absolute top-2 left-2 rounded bg-[#1565C0] px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                                                        Cover
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeImage(index)
                                                    }
                                                    className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                                                    aria-label={`Remove photo ${index + 1}`}
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Step 4 — Contact & review */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Phone className="size-4 text-[#1565C0]" />
                                    <h2 className="font-semibold text-foreground">
                                        Contact Information
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Pre-filled from your account. Buyers will use
                                    this to reach you about your listing.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <TextField
                                        id="contact_name"
                                        label="Your Name"
                                        name="contact_name"
                                        value={data.contact_name}
                                        onChange={(v) =>
                                            setData('contact_name', v)
                                        }
                                        error={errors.contact_name}
                                    />
                                    <TextField
                                        id="contact_email"
                                        label="Email"
                                        name="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(v) =>
                                            setData('contact_email', v)
                                        }
                                        error={errors.contact_email}
                                    />
                                    <div className="sm:col-span-2">
                                        <TextField
                                            id="contact_phone"
                                            label="Phone"
                                            name="contact_phone"
                                            type="tel"
                                            value={data.contact_phone}
                                            onChange={(v) =>
                                                setData('contact_phone', v)
                                            }
                                            placeholder="(555) 123-4567"
                                            hint="Include area code — buyers prefer calling for quick questions"
                                            error={errors.contact_phone}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="font-semibold text-foreground">
                                    Vehicle Location
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Helps buyers find vehicles near them.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <TextField
                                        id="city"
                                        label="City"
                                        name="city"
                                        value={data.city}
                                        onChange={(v) => setData('city', v)}
                                        error={errors.city}
                                    />
                                    <TextField
                                        id="state"
                                        label="State"
                                        name="state"
                                        value={data.state}
                                        onChange={(v) =>
                                            setData(
                                                'state',
                                                v.toUpperCase().slice(0, 2),
                                            )
                                        }
                                        placeholder="CA"
                                        error={errors.state}
                                    />
                                    <TextField
                                        id="zip_code"
                                        label="ZIP Code"
                                        name="zip_code"
                                        value={data.zip_code}
                                        onChange={(v) =>
                                            setData('zip_code', v)
                                        }
                                        error={errors.zip_code}
                                    />
                                </div>
                            </section>

                            <section className="space-y-3 rounded-xl border border-border bg-muted/50 p-6">
                                <div className="flex items-center gap-2">
                                    <Info className="size-4 text-muted-foreground" />
                                    <h2 className="font-semibold text-foreground">
                                        Listing Summary
                                    </h2>
                                </div>
                                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Vehicle
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {listingTitle}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">Price</dt>
                                        <dd className="font-bold text-[#1565C0]">
                                            {data.asking_price
                                                ? formatPrice(
                                                      Number(
                                                          data.asking_price,
                                                      ),
                                                  )
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Mileage
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {data.mileage
                                                ? `${Number(data.mileage).toLocaleString()} mi`
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Photos
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {totalPhotoCount} total
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Condition
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {data.condition || '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Drivetrain
                                        </dt>
                                        <dd className="font-medium text-foreground">
                                            {data.drivetrain || '—'}
                                        </dd>
                                    </div>
                                </dl>
                                <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                                    {isEditing
                                        ? 'Saving updates your listing on My Listings and the marketplace.'
                                        : approvalMode === 'automatic'
                                          ? 'When you save, your listing appears on My Listings and the homepage.'
                                          : 'When you save, your listing appears on My Listings and goes live after admin approval.'}
                                </p>
                            </section>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-6 flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={goBack}
                            disabled={step === 1 || processing}
                            className="border-input"
                        >
                            <ChevronLeft />
                            Back
                        </Button>

                        {step < STEPS.length ? (
                            <Button
                                type="button"
                                onClick={goNext}
                                disabled={processing}
                                className="bg-[#1565C0] hover:bg-[#0D47A1] disabled:opacity-50"
                            >
                                Continue
                                <ChevronRight />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={processing || !canContinue()}
                                className="min-w-36 bg-[#1565C0] hover:bg-[#0D47A1]"
                            >
                                {processing && <Spinner />}
                                {isEditing ? 'Save Changes' : 'Save Listing'}
                            </Button>
                        )}
                    </div>
                </form>
                )}
            </div>
        </>
    );
}

type CreatePageProps = Omit<ListingFormProps, 'mode' | 'listing'> & {
    createdListing?: VehicleListing | null;
};

export default function CreateListing({
    createdListing = null,
    ...props
}: CreatePageProps) {
    return (
        <ListingForm
            mode="create"
            successListing={createdListing}
            {...props}
        />
    );
}

CreateListing.layout = {
    breadcrumbs: [{ title: 'List Vehicle', href: '/listings/create' }],
};
