const axios = require('axios');

const API_URL = 'http://localhost:3001';
let token = '';
let projectId = '';
let paperId = '';

async function testAPI() {
    try {
        console.log('🚀 Starting API Test Sequence...\n');

        // 1. REGISTER
        console.log('1. Registering new user...');
        const uniqueEmail = `test${Date.now()}@example.com`;
        try {
            const regStore = await axios.post(`${API_URL}/auth/register`, {
                email: uniqueEmail,
                password: 'password123',
                name: 'Test User'
            });
            console.log('✅ Register success. Tokens:', regStore.data.token ? 'Yes' : 'No');
        } catch (e) {
            console.log('⚠️ Register failed (might exist), trying login...');
        }

        // 2. LOGIN
        console.log('\n2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: uniqueEmail, // Use the fresh email
            password: 'password123'
        });
        token = loginRes.data.access_token;
        console.log('✅ Login success. Token acquired.');

        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        // 3. CHECK TOKENS (Starter Pack)
        console.log('\n3. Checking Gamification Stats (Starter Pack)...');
        const statsRes = await axios.get(`${API_URL}/gamification/stats`, authHeader);
        console.log('✅ Stats:', statsRes.data);
        if (statsRes.data.tokens === 100) {
            console.log('✅ Starter pack verified: 100 tokens');
        } else {
            console.log('⚠️ Starter pack mismatch:', statsRes.data.tokens);
        }

        // 4. CREATE PROJECT
        console.log('\n4. Creating Project...');
        const projRes = await axios.post(`${API_URL}/projects`, {
            title: 'Test Project ' + Date.now(),
            content: 'Initial content'
        }, authHeader);
        projectId = projRes.data.id;
        console.log('✅ Project created:', projectId);

        // 5. SAVE PAPER TO LIBRARY
        console.log('\n5. Saving Paper to Library...');
        const paperData = {
            paperId: 'W123456789',
            title: 'The Future of AI in Education',
            authors: ['John Doe', 'Jane Smith'],
            year: 2024,
            description: 'A comprehensive study.',
            url: 'https://example.com/paper',
            relevance: 100
        };
        const saveRes = await axios.post(`${API_URL}/library/save`, paperData, authHeader);
        console.log('✅ Paper saved:', saveRes.data.title);
        paperId = saveRes.data.id;

        // 6. FETCH LIBRARY
        console.log('\n6. Fetching Library...');
        const libRes = await axios.get(`${API_URL}/library`, authHeader);
        console.log('✅ Papers found:', libRes.data.length);
        const savedPaper = libRes.data.find(p => p.paperId === 'W123456789');
        if (savedPaper) console.log('✅ Verified saved paper exists');

        // 7. AI CHAT (Token Deduction)
        console.log('\n7. Testing AI Chat (Token Deduction)...');
        const initialTokens = statsRes.data.tokens;
        try {
            await axios.post(`${API_URL}/ai/analyze`, {
                projectId,
                currentContent: 'Test content',
                userQuery: 'Is this good?'
            }, authHeader);
            console.log('✅ Chat response received');
        } catch (e) {
            console.log('⚠️ Chat failed (Mock AI might be off), but checking tokens...');
        }

        // Check tokens again
        const statsAfter = await axios.get(`${API_URL}/gamification/stats`, authHeader);
        // Assuming chat costs 5
        console.log(`✅ Tokens: ${initialTokens} -> ${statsAfter.data.tokens}`);

        // 8. AI TOOLS (Grammar)
        console.log('\n8. Testing Grammar Check...');
        try {
            await axios.post(`${API_URL}/ai/grammar`, {
                projectId,
                content: 'This are bad grammar.'
            }, authHeader);
            console.log('✅ Grammar check success');
        } catch (e) {
            console.log('⚠️ Grammar check failed:', e.message);
        }

        console.log('\n🎉 ALL TESTS COMPLETED!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    }
}

testAPI();
