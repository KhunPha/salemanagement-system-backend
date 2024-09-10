import axios from 'axios';

// Replace with your actual Cloudinary cloud name and credentials
const cloudName = 'duuux4gv5';
const apiKey = '888183622229848';
const apiSecret = 'UiLLFq6WzB4xzVm-vACJjmpuSoc';

const getStorageUsage = async () => {
    try {
        // Fetch storage usage data from Cloudinary
        const response = await axios.get(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
            auth: {
                username: apiKey,
                password: apiSecret
            }
        });

        // Check if response contains storage data
        if (!response.data.storage) {
            throw new Error('Storage data not found in response');
        }

        // Assuming `response.data.storage` has `usage` field
        const usedStorage = response.data.storage.usage; // in bytes

        // Log usage data
        const bytesToMB = (bytes: any) => bytes / (1024 * 1024);

        return `Used Storage: ${bytesToMB(usedStorage).toFixed(2)} MB`
    } catch (error) {
        console.error('Error fetching usage data:', error);
    }
};

export default getStorageUsage;
