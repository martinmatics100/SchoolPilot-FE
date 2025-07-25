import React, { useEffect } from 'react';
import { useAuth } from '../context';

const ApiExampleComponent = () => {
    const { apiClient } = useAuth();

    // GET request
    const fetchData = async () => {
        try {
            const data = await apiClient.get('/api/data');
            console.log('GET result:', data);
        } catch (error) {
            console.error('GET error:', error);
        }
    };

    // POST request
    const createData = async () => {
        try {
            const newData = {
                name: 'New Item',
                description: 'A brand new item',
            };
            const result = await apiClient.post('/api/data', newData);
            console.log('POST result:', result);
        } catch (error) {
            console.error('POST error:', error);
        }
    };

    // PUT request
    const updateData = async () => {
        try {
            const updatedData = {
                name: 'Updated Name',
                description: 'Updated Description',
            };
            const result = await apiClient.put('/api/data/123', updatedData); // Assuming ID = 123
            console.log('PUT result:', result);
        } catch (error) {
            console.error('PUT error:', error);
        }
    };

    // DELETE request
    const deleteData = async () => {
        try {
            const result = await apiClient.delete('/api/data/123'); // Assuming ID = 123
            console.log('DELETE result:', result);
        } catch (error) {
            console.error('DELETE error:', error);
        }
    };

    useEffect(() => {
        fetchData();
        // Call others on demand e.g., via buttons
    }, []);

    return (
        <div>
            <h2>API Example</h2>
            <button onClick={createData}>Create</button>
            <button onClick={updateData}>Update</button>
            <button onClick={deleteData}>Delete</button>
            <button onClick={fetchData}>Get</button>
        </div>
    );
};

export default ApiExampleComponent;
