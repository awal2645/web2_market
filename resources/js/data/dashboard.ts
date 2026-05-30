import { formatPrice } from '@/data/homepage';

export const dashboardStats = [
    {
        label: 'Active Listings',
        value: '2',
        change: '+1 this month',
        trend: 'up' as const,
        icon: 'car' as const,
    },
    {
        label: 'Total Views',
        value: '1,284',
        change: '+18% vs last month',
        trend: 'up' as const,
        icon: 'eye' as const,
    },
    {
        label: 'Saved Vehicles',
        value: '6',
        change: '2 price drops',
        trend: 'neutral' as const,
        icon: 'heart' as const,
    },
    {
        label: 'Buyer Inquiries',
        value: '14',
        change: '3 unread',
        trend: 'up' as const,
        icon: 'message' as const,
    },
];

export const myListings = [
    {
        id: 1,
        title: '2021 Honda Accord EX',
        price: 21990,
        status: 'live' as const,
        views: 842,
        inquiries: 9,
        image: '/images/demo-vehicles/car-3.jpg',
        listedAt: 'Mar 12, 2026',
    },
    {
        id: 2,
        title: '2018 Ford F-150 XLT',
        price: 26400,
        status: 'pending' as const,
        views: 0,
        inquiries: 0,
        image: '/images/demo-vehicles/car-4.jpg',
        listedAt: 'May 27, 2026',
    },
];

export const savedVehicles = [
    {
        id: 'saved-1',
        title: '2023 Toyota Camry SE',
        price: 24500,
        mileage: 18000,
        image: '/images/demo-vehicles/car-2.jpg',
        priceDrop: true,
    },
    {
        id: 'saved-2',
        title: '2019 BMW 330i Sport',
        price: 31500,
        mileage: 52000,
        image: '/images/demo-vehicles/car-5.jpg',
        priceDrop: false,
    },
    {
        id: 'saved-3',
        title: '2022 Chevrolet Silverado LT',
        price: 38900,
        mileage: 32000,
        image: '/images/demo-vehicles/car-4.jpg',
        priceDrop: true,
    },
];

export const recentActivity = [
    {
        id: 1,
        type: 'inquiry' as const,
        message: 'New inquiry on your 2021 Honda Accord EX',
        time: '2 hours ago',
    },
    {
        id: 2,
        type: 'view' as const,
        message: 'Your listing received 24 views today',
        time: '5 hours ago',
    },
    {
        id: 3,
        type: 'saved' as const,
        message: '2023 Toyota Camry SE dropped to $24,500',
        time: 'Yesterday',
    },
    {
        id: 4,
        type: 'approval' as const,
        message: '2018 Ford F-150 XLT is pending admin review',
        time: '2 days ago',
    },
    {
        id: 5,
        type: 'finance' as const,
        message: 'Pre-approval estimate updated — $389/mo',
        time: '3 days ago',
    },
];

export const loanSnapshot = {
    status: 'Pre-qualified',
    monthly: 389,
    apr: 4.9,
    term: 72,
    maxAmount: 42000,
};

export { formatPrice };
