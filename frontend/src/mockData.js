// Mock data for LK Smart Wash website
export const businessInfo = {
    name: "LK Smart Wash",
    tagline: "Smart Dry Cleaning for Smart People",
    phone: "09030347111",
    phone2: "09030346111",
    whatsapp: "919030347111",
    email: "lk.smartwashpithapuram@gmail.com",
    address: {
        street: "Church Centre, One Way Road",
        area: "Veeraraghavapuram",
        city: "Pithapuram",
        state: "Andhra Pradesh",
        pincode: "533450",
        country: "India"
    },
    hours: "Open till 8 PM",
    rating: 5.0,
    reviewCount: 6,
    coordinates: {
        lat: 17.1189,
        lng: 82.2553
    },
    plusCode: "4794+H4 Pithapuram, Andhra Pradesh",
    socials: {
        instagram: "smartwash_pithapuram",
        youtube: "Smartwashlaundryexperts",
        facebook: "LKSmartWashPithapuram"
    },
    upiId: "lksmartwash@okaxis", // UPI ID for the payment model
    catalogUrl: "/PRICE_LIST_NEW.pdf"
};

export const services = [
    {
        id: "laundry",
        title: "Laundry (Wash & Fold)",
        category: "General Care",
        description: "General Clothes, White & White, Bed sheets, Blankets. Professional washing and drying.",
        icon: "shirt",
        price: "Professional Care",
        basePrice: 50,
        subItems: [
            { name: "General Clothes", price: 50 },
            { name: "White & White", price: 100 },
            { name: "Bed sheets", price: 80 },
            { name: "Blankets (Single)", price: 150 },
            { name: "Blankets (Double)", price: 250 }
        ]
    },
    {
        id: "ironing",
        title: "Steam Ironing",
        category: "Finishing",
        description: "Flat Ironing, Hard Ironing, Saree Rolling. Crisp and wrinkle-free finishing for all garments.",
        icon: "zap",
        price: "Premium Finishing",
        basePrice: 20,
        subItems: [
            { name: "Shirt/Trouser Ironing", price: 20 },
            { name: "Hard Ironing", price: 40 },
            { name: "Saree Steam Iron", price: 100 },
            { name: "Saree Rolling", price: 150 },
            { name: "Saree Polishing", price: 200 }
        ]
    },
    {
        id: "dryclean",
        title: "Dry Wash (Chemical Cleaning)",
        category: "Premium Care",
        description: "Ethnic Wear, Fancy Wear, Woolen Wear, Stain Removal. Expert care for delicate fabrics.",
        icon: "sparkles",
        price: "Specialized Cleaning",
        basePrice: 150,
        subItems: [
            { name: "Silk Saree Dry Wash", price: 300 },
            { name: "Designer Gown", price: 500 },
            { name: "Men's Suit (2pc)", price: 400 },
            { name: "Men's Suit (3pc)", price: 550 },
            { name: "Blazer", price: 250 },
            { name: "Sherwani", price: 600 }
        ]
    },
    {
        id: "shoes",
        title: "Shoe & Bag Care",
        category: "Specialized",
        description: "Professional cleaning for Sneakers, Canvas, Sports shoes, and Boots.",
        icon: "package",
        price: "Expert Restoration",
        basePrice: 200,
        subItems: [
            { name: "Sports Shoes", price: 200 },
            { name: "Sneakers (Suede/Leather)", price: 350 },
            { name: "Canvas Shoes", price: 250 },
            { name: "Handbags/Purses", price: 400 },
            { name: "School Bags", price: 150 }
        ]
    },
    {
        id: "home",
        title: "Home & Decor",
        category: "Bulk",
        description: "Curtain Washing, Carpet Cleaning, and Sofa restoration.",
        icon: "home",
        price: "Deep Cleaning",
        basePrice: 100,
        subItems: [
            { name: "Curtains (per sqft)", price: 30 },
            { name: "Carpet (per sqft)", price: 50 },
            { name: "Sofa Cleaning (per seat)", price: 250 },
            { name: "Soft Toys", price: 100 }
        ]
    }
];

export const priceList = {
    womanWare: [
        { item: "Saree", general: 100, soft: 150, starch: 200, fabric: 250, solvent: 300, dry: 350, premium: 400 },
        { item: "Blous", general: 30, soft: 50, starch: 80, fabric: 100, solvent: 150, dry: 200, premium: 300 },
        { item: "Kurta", general: 50, soft: 80, starch: 100, fabric: 100, solvent: 150, dry: 150, premium: 200 },
        { item: "Gown/Anarkali", general: 100, soft: 150, starch: 200, fabric: 250, solvent: 300, dry: 400, premium: 600 }
    ],
    mensWare: [
        { item: "White & White", general: 50, soft: 50, starch: 100, fabric: 100, solvent: 150, dry: 150, premium: 200 },
        { item: "Shirts/T-Shirts", general: 30, soft: 50, starch: 80, fabric: 100, solvent: 150, dry: 200, premium: 300 },
        { item: "Trouser/Jeans", general: 30, soft: 50, starch: 80, fabric: 100, solvent: 150, dry: 200, premium: 300 }
    ],
    shoeCare: [
        { item: "Sports", regular: 200, foam: 250, premium: 300 },
        { item: "Sneakers", regular: 200, foam: 350, premium: 500 }
    ]
};

export const testimonials = [
    {
        id: 1,
        name: "Ramesh Kumar",
        rating: 5,
        text: "Excellent service! My suits came back perfectly cleaned and pressed. The pickup and delivery service is very convenient.",
        date: "2 weeks ago"
    },
    {
        id: 2,
        name: "Priya Reddy",
        rating: 5,
        text: "Best laundry service in Pithapuram! They handled my silk sarees with great care. Highly recommended.",
        date: "1 month ago"
    },
    {
        id: 3,
        name: "Suresh Babu",
        rating: 5,
        text: "Very professional and punctual. The express service saved me when I needed my clothes cleaned urgently.",
        date: "3 weeks ago"
    },
    {
        id: 4,
        name: "Lakshmi Devi",
        rating: 5,
        text: "Professional services and excellent quality. My carpets and curtains look brand new after their deep cleaning service.",
        date: "1 week ago"
    }
];

export const galleryImages = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800",
        alt: "Professional laundry service",
        category: "service"
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
        alt: "Clean folded clothes",
        category: "results"
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800",
        alt: "Dry cleaning service",
        category: "service"
    },
    {
        id: 4,
        url: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=800",
        alt: "Fresh laundry",
        category: "results"
    },
    {
        id: 5,
        url: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800",
        alt: "Professional ironing",
        category: "service"
    },
    {
        id: 6,
        url: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800",
        alt: "Clean white shirts",
        category: "results"
    }
];

export const mockBookings = [];

export const addMockBooking = (booking) => {
    const newBooking = {
        id: Date.now(),
        ...booking,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    mockBookings.push(newBooking);
    return newBooking;
};
