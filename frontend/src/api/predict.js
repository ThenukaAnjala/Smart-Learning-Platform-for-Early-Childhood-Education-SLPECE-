import axios from 'axios';

export const predict = async (input) => {
    try {
        const response = await axios.post('http://127.0.0.1:4000/predict', { input });
        return response.data.result;
    } catch (error) {
        console.error('Error calling API:', error.message);
        return null;
    }
};
