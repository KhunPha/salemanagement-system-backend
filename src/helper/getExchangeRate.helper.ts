import axios from "axios"
const { JSDOM } = require('jsdom');

export const getNBCExchangeRate = async (url: string): Promise<number> => {
    try {
        // Fetch the page content with a User-Agent header
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Check if response.data is available
        if (!response.data) {
            throw new Error('No data received from the server');
        }

        // Parse the HTML content using jsdom
        const { document } = (new JSDOM(response.data)).window;

        // Example: Log the HTML to ensure jsdom is parsing it correctly
        // console.log(document.documentElement.outerHTML);

        // Example: Extract exchange rate from a specific HTML element
        // You'll need to replace 'selector-for-rate' with the actual selector
        const rateElement = document.querySelector('.index-content-right .section-container .section-data table tr:nth-child(2)'); // Replace with correct selector
        const rateText = rateElement ? rateElement.textContent : '';

        if (!rateText) {
            throw new Error('Failed to extract exchange rate from the page');
        }

        // Clean and parse the rate value
        const cleanedRateText = rateText.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
        const exchangeRate = parseFloat(cleanedRateText);

        if (isNaN(exchangeRate)) {
            throw new Error('Failed to parse exchange rate');
        }

        // console.log(`Exchange Rate: ${exchangeRate}`);

        return exchangeRate;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        throw new Error('Failed to fetch exchange rate');
    }
};