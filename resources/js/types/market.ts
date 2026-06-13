export type VehicleListingImage = {
    id: number;
    url: string;
};

export type VehicleListing = {
    id: number;
    slug: string;
    title: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    mileage: number;
    vin: string;
    title_status: string;
    condition: string;
    exterior_color: string;
    interior_color: string;
    transmission: string;
    fuel_type: string;
    drivetrain: string;
    body_type: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    location_label: string | null;
    asking_price: number;
    seller_notes: string | null;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    status: string;
    status_label: string;
    view_count?: number;
    is_saved?: boolean;
    saved_price?: number | null;
    price_alerts_enabled?: boolean;
    images: VehicleListingImage[];
    created_at: string | null;
    seller_id?: string;
    seller_name?: string;
    seller_avatar?: string | null;
};

export type ListingFormOptions = {
    titleStatuses: string[];
    conditions: string[];
    transmissions: string[];
    fuelTypes: string[];
    drivetrains: string[];
    bodyTypes: string[];
};

export type ListingFormDefaults = {
    contact_name: string;
    contact_email: string;
};
