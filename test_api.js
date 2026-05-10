// Testing script using global fetch (Node.js 18+)

async function runTests() {
    console.log('🚀 Starting Automated Tests for LK Smart Wash...');

    const API_URL = 'http://localhost:5000/api';
    const TEST_BOOKING = {
        name: "Automated Tester",
        phone: "0000000000",
        email: "test@example.com",
        serviceType: "laundry",
        address: "Test Location",
        notes: "Automated test runs at " + new Date().toISOString()
    };

    try {
        // 1. Test POST /api/bookings
        console.log('--- Testing Booking API ---');
        const postRes = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_BOOKING)
        });

        if (postRes.ok) {
            console.log('✅ Booking submission SUCCESS');
        } else {
            console.error('❌ Booking submission FAILED:', postRes.status);
            process.exit(1);
        }

        // 2. Test Login API (Admin)
        console.log('--- Testing Admin Login ---');
        const loginRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: '0000' })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.token) {
            console.log('✅ Admin login SUCCESS');
            const token = loginData.token;

            // 3. Test GET /api/bookings (Protected)
            console.log('--- Testing Protected Bookings List ---');
            const getRes = await fetch(`${API_URL}/bookings`, {
                headers: { 'authorization': token }
            });
            const bookings = await getRes.json();

            if (getRes.ok && Array.isArray(bookings)) {
                console.log(`✅ Bookings retrieval SUCCESS (Found ${bookings.length} bookings)`);
                const found = bookings.some(b => b.name === TEST_BOOKING.name);
                if (found) {
                    console.log('✅ Verified: Automated test booking exists in database');
                } else {
                    console.error('❌ Verification FAILED: Test booking not found in list');
                }
            } else {
                console.error('❌ Bookings retrieval FAILED');
            }
        } else {
            console.error('❌ Admin login FAILED');
        }

    } catch (error) {
        console.error('❌ Test execution ERROR:', error.message);
    }

    console.log('🏁 Tests completed.');
}

runTests();
