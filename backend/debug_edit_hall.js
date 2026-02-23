const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000/api';

async function testUpdate() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com', // Assuming default admin
            password: 'adminpassword'   // Assuming default password
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token:', token ? 'Recieved' : 'Missing');

        console.log('2. Fetching Halls...');
        const hallsRes = await axios.get(`${API_URL}/admin/halls`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const halls = hallsRes.data;
        console.log(`Found ${halls.length} halls.`);

        if (halls.length === 0) {
            console.log('No halls to update.');
            return;
        }

        const hallToUpdate = halls[0];
        console.log('3. Updating Hall:', hallToUpdate.hallName);
        console.log('Current Capacity:', hallToUpdate.capacity);

        const newCapacity = hallToUpdate.capacity + 1;
        const updateRes = await axios.put(`${API_URL}/admin/halls/${hallToUpdate._id}`, {
            hallName: hallToUpdate.hallName,
            building: hallToUpdate.building,
            capacity: newCapacity
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Update Response Status:', updateRes.status);
        console.log('Updated Hall:', updateRes.data);

        if (updateRes.data.capacity === newCapacity) {
            console.log('SUCCESS: Hall capacity updated correctly.');
        } else {
            console.log('FAILURE: Hall capacity did not change.');
        }

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

testUpdate();
