import { Head, useForm } from '@inertiajs/react';
import {
    Camera,
    Car,
    Check,
    ChevronLeft,
    ChevronRight,
    ImagePlus,
    Info,
    Phone,
    Sparkles,
    X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatPrice } from '@/data/homepage';
import { cn } from '@/lib/utils';
import type {
    ListingFormDefaults,
    ListingFormOptions,
} from '@/types/market';

type Props = {
    defaults: ListingFormDefaults;
    options: ListingFormOptions;
    approvalMode: string;
};


const STEPS = [
    { id: 1, title: 'Basics', hint: 'What are you selling?' },
    { id: 2, title: 'Details', hint: 'Specs & condition' },
    { id: 3, title: 'Photos', hint: 'Add great pictures' },
    { id: 4, title: 'Contact', hint: 'Review & save' },
] as const;

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
    'border-gray-300 focus-visible:border-[#1565C0] focus-visible:ring-[#1565C0]/30';
const selectClass = cn(
    'h-10 w-full rounded-md border bg-white px-3 text-sm shadow-xs outline-none',
    'border-gray-300 focus-visible:border-[#1565C0] focus-visible:ring-[#1565C0]/30 focus-visible:ring-[3px]',
);

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

function isValidVin(vin: string): boolean {
    return VIN_PATTERN.test(vin.trim());
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
            <Label htmlFor={id} className="font-medium text-gray-700">
                {label}
                {!required && (
                    <span className="ml-1 font-normal text-gray-400">
                        (optional)
                    </span>
                )}
            </Label>
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
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
            <Label htmlFor={id} className="font-medium text-gray-700">
                {label}
                {!required && (
                    <span className="ml-1 font-normal text-gray-400">
                        (optional)
                    </span>
                )}
            </Label>
            {hint && <p className="text-xs text-gray-500">{hint}</p>}
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

export default function CreateListing({
    defaults,
    options,
    approvalMode,
}: Props) {
    const [step, setStep] = useState(1);
    const [previews, setPreviews] = useState<{ url: string; file: File }[]>(
        [],
    );
    const [dragOver, setDragOver] = useState(false);

    const years = useMemo(
        () =>
            Array.from({ length: 36 }, (_, i) =>
                String(new Date().getFullYear() + 1 - i),
            ),
        [],
    );

    const { data, setData, post, processing, errors } = useForm({
        year: '',
        make: '',
        model: '',
        trim: '',
        mileage: '',
        vin: '',
        title_status: '',
        condition: '',
        exterior_color: '',
        interior_color: '',
        transmission: '',
        fuel_type: '',
        drivetrain: '',
        asking_price: '',
        seller_notes: '',
        contact_name: defaults.contact_name,
        contact_email: defaults.contact_email,
        contact_phone: '',
        images: [] as File[],
    });

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

            const next = [
                ...previews,
                ...selected.map((file) => ({
                    url: URL.createObjectURL(file),
                    file,
                })),
            ].slice(0, 20);

            syncImages(next);
        },
        [previews, syncImages],
    );

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
        ],
        3: ['images'],
        4: ['contact_name', 'contact_email', 'contact_phone'],
    };

    const canContinue = (forStep = step) => {
        const fields = stepFields[forStep];

        return fields.every((field) => {
            if (field === 'images') {
                return data.images.length > 0;
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

    const validateBeforeSave = (): boolean => {
        for (let s = 1; s <= STEPS.length; s += 1) {
            if (!canContinue(s)) {
                setStep(s);
                if (s === 2 && data.vin && !isValidVin(data.vin)) {
                    toast.error(
                        'VIN must be exactly 17 characters (letters and numbers only, no I, O, or Q).',
                    );
                } else if (s === 3 && data.images.length === 0) {
                    toast.error('Please upload at least one vehicle photo.');
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
            setStep((s) => s + 1);
        }
    };

    const goBack = () => {
        if (step > 1) {
            setStep((s) => s - 1);
        }
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateBeforeSave()) {
            return;
        }

        post('/listings', {
            forceFormData: true,
            onError: (formErrors) => {
                const firstField = Object.keys(formErrors)[0];
                if (firstField) {
                    setStep(fieldToStep(firstField));
                }
                toast.error(
                    'Could not save your listing. Please fix the errors below.',
                );
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const errorMessages = Object.values(errors).filter(Boolean) as string[];

    return (
        <>
            <Head title="List Your Vehicle" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-24 md:pb-8">
                {/* Header */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-[#1565C0]">
                        Web2Autos Market
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        List your vehicle
                    </h1>
                    <p className="text-sm text-gray-500">
                        Takes about 5 minutes. You can review everything before
                        saving.
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

                {/* Step progress */}
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
                                                    'bg-gray-100 text-gray-400',
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
                                                    ? 'text-gray-900'
                                                    : 'text-gray-400',
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
                                                    : 'bg-gray-200',
                                            )}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                    <p className="mt-3 text-center text-sm text-gray-500">
                        Step {step} of {STEPS.length} —{' '}
                        {STEPS[step - 1].hint}
                    </p>
                </nav>

                {/* Live preview card */}
                {(data.year || data.make || data.asking_price) && (
                    <div className="flex items-center gap-4 rounded-xl border border-[#1565C0]/20 bg-[#1565C0]/5 px-4 py-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Car className="size-5 text-[#1565C0]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {listingTitle}
                            </p>
                            <p className="text-xs text-gray-500">
                                {data.mileage
                                    ? `${Number(data.mileage).toLocaleString()} mi`
                                    : 'Mileage not set'}
                                {data.asking_price &&
                                    ` · ${formatPrice(Number(data.asking_price))}`}
                            </p>
                        </div>
                        {previews[0] && (
                            <img
                                src={previews[0].url}
                                alt="Preview"
                                className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
                            />
                        )}
                    </div>
                )}

                <form onSubmit={submit} encType="multipart/form-data">
                    {/* Step 1 — Basics */}
                    {step === 1 && (
                        <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                                <Sparkles className="mt-0.5 size-4 shrink-0 text-[#1565C0]" />
                                <p className="text-sm text-gray-600">
                                    Start with the basics buyers search for
                                    first — year, make, model, mileage, and
                                    your asking price.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="year"
                                    label="Year"
                                    name="year"
                                    options={years}
                                    value={data.year}
                                    onChange={(v) => setData('year', v)}
                                    error={errors.year}
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
                                <p className="mb-2 text-xs font-medium text-gray-500">
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
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#1565C0]/40 hover:text-[#1565C0]',
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
                        <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    id="vin"
                                    label="VIN"
                                    name="vin"
                                    value={data.vin}
                                    onChange={(v) =>
                                        setData('vin', v.toUpperCase())
                                    }
                                    maxLength={17}
                                    placeholder="17-character VIN"
                                    hint="Exactly 17 characters — found on dashboard or door jamb (no I, O, or Q)"
                                    error={errors.vin}
                                />
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
                                    className="font-medium text-gray-700"
                                >
                                    Seller Notes{' '}
                                    <span className="font-normal text-gray-400">
                                        (optional)
                                    </span>
                                </Label>
                                <p className="text-xs text-gray-500">
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
                        <section className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
                                        : 'border-gray-300 bg-gray-50 hover:border-[#1565C0]/40',
                                )}
                            >
                                <ImagePlus className="size-10 text-gray-400" />
                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    Drag & drop photos here
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
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

                            {previews.length > 0 && (
                                <div>
                                    <p className="mb-3 text-sm font-medium text-gray-700">
                                        {previews.length} photo
                                        {previews.length !== 1 ? 's' : ''}{' '}
                                        selected
                                        {previews[0] && (
                                            <span className="ml-2 font-normal text-gray-500">
                                                — first photo is the cover
                                            </span>
                                        )}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {previews.map((preview, index) => (
                                            <div
                                                key={preview.url}
                                                className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-gray-200"
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
                            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Phone className="size-4 text-[#1565C0]" />
                                    <h2 className="font-semibold text-gray-900">
                                        Contact Information
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-500">
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

                            <section className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-6">
                                <div className="flex items-center gap-2">
                                    <Info className="size-4 text-gray-500" />
                                    <h2 className="font-semibold text-gray-900">
                                        Listing Summary
                                    </h2>
                                </div>
                                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                                    <div>
                                        <dt className="text-gray-500">
                                            Vehicle
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {listingTitle}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Price</dt>
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
                                        <dt className="text-gray-500">
                                            Mileage
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {data.mileage
                                                ? `${Number(data.mileage).toLocaleString()} mi`
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">
                                            Photos
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {previews.length} uploaded
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">
                                            Condition
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {data.condition || '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">
                                            Drivetrain
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {data.drivetrain || '—'}
                                        </dd>
                                    </div>
                                </dl>
                                <p className="border-t border-gray-200 pt-3 text-xs text-gray-500">
                                    {approvalMode === 'automatic'
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
                            className="border-gray-300"
                        >
                            <ChevronLeft />
                            Back
                        </Button>

                        {step < STEPS.length ? (
                            <Button
                                type="button"
                                onClick={goNext}
                                disabled={!canContinue() || processing}
                                className="bg-[#1565C0] hover:bg-[#0D47A1]"
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
                                Save Listing
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}

CreateListing.layout = {
    breadcrumbs: [{ title: 'List Vehicle', href: '/listings/create' }],
};
