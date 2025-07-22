// Google Sheets API service
import React, { useState, useEffect } from 'react';

const SHEET_ID = '18dg0WlMsG0TzYfHNRqj1BnRWSryMDYAYAe1vW8ywoLM';
const GID = '1760566905';

// Google Sheets API key - Add your API key here
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'AIzaSyAn00Si9mmRHinc4En7bmEw_7O-RobMUw8';

// Service Account credentials for write access
const SERVICE_ACCOUNT_EMAIL = import.meta.env.VITE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = import.meta.env.VITE_SERVICE_ACCOUNT_PRIVATE_KEY;

// Debug log to check if credentials are loaded
console.log('🔑 API Key loaded:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NO API KEY');
console.log('🔐 Service Account loaded:', SERVICE_ACCOUNT_EMAIL ? 'YES' : 'NO');

// Google Sheets API v4 endpoint for private sheets
// We need to specify the sheet name or use the range format
const SHEETS_API_V4_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:Z?key=${API_KEY}`;
const SHEETS_API_V4_URL_WITH_RANGE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:Z?key=${API_KEY}`;
const SHEETS_API_V4_URL_LAGER = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Lager!A:Z?key=${API_KEY}`;

// Google Sheets API write endpoint
const SHEETS_API_V4_UPDATE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Lager!`;

// Find the column index for Reserverad_av
let reservedColumnIndex = -1;

// Public Google Sheets API endpoint (no API key needed for public sheets)
const SHEETS_API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// Alternative JSON endpoint if the sheet is published to web
const SHEETS_JSON_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

/**
 * Parse CSV data to array of objects
 */
function parseCSVToObjects(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      data.push(obj);
    }
  }
  
  return data;
}

/**
 * Parse Google Sheets JSON response
 */
function parseGoogleSheetsJSON(response) {
  // Remove the callback wrapper and parse JSON
  const jsonString = response.substring(47).slice(0, -2);
  const data = JSON.parse(jsonString);
  
  if (!data.table || !data.table.rows) {
    return [];
  }
  
  const headers = data.table.cols.map(col => col.label || col.id);
  const rows = data.table.rows;
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      const cell = row.c[index];
      obj[header] = cell ? (cell.v || cell.f || '') : '';
    });
    return obj;
  });
}

/**
 * Parse Google Sheets API v4 response
 */
function parseGoogleSheetsAPIv4(data) {
  if (!data.values || data.values.length === 0) {
    return [];
  }
  
  const headers = data.values[0]; // First row contains headers
  const rows = data.values.slice(1); // Rest are data rows
  
  // Find the Reserverad_av column index
  reservedColumnIndex = headers.findIndex(header => header === 'Reserverad_av');
  console.log('Reserverad_av column found at index:', reservedColumnIndex);
  
  return rows.map((row, rowIndex) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    // Add row number for updating purposes (1-indexed, +2 because of header and 0-index)
    obj._rowNumber = rowIndex + 2;
    return obj;
  });
}

/**
 * Transform Google Sheets data to our printer format
 */
function transformToPrinterData(rawData) {
  console.log('🔄 Transforming raw data:', rawData);
  
  // Transform your Google Sheets data to printer format
  return rawData.map((row, index) => {
    console.log(`Row ${index}:`, row);
    
    // Skip empty rows - check if we have brand or model
    const brand = row['Märke'] || '';
    const model = row['Modell'] || '';
    
    if (!brand && !model) return null;
    
    // Map rekond status to our status format
    const rekondStatus = (row['Rekond'] || '').toLowerCase();
    let status = 'available';
    if (rekondStatus.includes('levererad')) status = 'delivered';
    if (rekondStatus.includes('inväntar')) status = 'pending';
    if (rekondStatus.includes('ej')) status = 'cancelled';
    
    // Determine type based on model
    const fullModel = `${brand} ${model}`.trim();
    let type = 'Skrivare';
    if (fullModel.includes('WF-')) type = 'Bläckstråleskrivare';
    if (fullModel.includes('IM') || fullModel.includes('MP') || fullModel.includes('Bizhub')) type = 'Multifunktion';
    if (fullModel.includes('Touchpanel')) type = 'Touchpanel';
    
    // Extract seller name from reservation/sold text
    const reservedText = row['Reserverad_av'] || '';
    let sellerName = '';
    let isSold = false;
    
    if (reservedText.includes('Reserverad av ')) {
      const match = reservedText.match(/Reserverad av (.+?) till/);
      if (match) {
        sellerName = match[1];
      }
    } else if (reservedText.includes('Såld av ')) {
      const match = reservedText.match(/Såld av (.+?)$/);
      if (match) {
        sellerName = match[1];
        isSold = true;
      }
    }

    // Determine if printer is new or used (column I)
    const conditionText = Object.keys(row)[8] ? row[Object.keys(row)[8]] : ''; // Column I (0-indexed = 8)
    let condition = 'used'; // default to used
    if (conditionText && conditionText.toLowerCase().includes('ny')) {
      condition = 'new';
    }

    // Extract customer name from column O (0-indexed = 14)
    const customerName = Object.keys(row)[14] ? row[Object.keys(row)[14]] : '';

    const result = {
      brand: brand || 'Unknown',
      model: model || 'Unknown',
      type: type,
      status: status,
      location: row['Senaste kunden'] || 'Okänd',
      quantity: 1,
      price: row['Värde'] || 'Se avtal',
      serialNumber: row['Serienummer'] || '-',
      condition: condition, // new or used
      lastUpdated: new Date().toISOString().split('T')[0],
      reservedBy: reservedText,
      sellerName: sellerName,
      customerName: customerName,
      isSold: isSold,
      _rowNumber: row._rowNumber, // Include row number for updates
    };
    
    console.log(`Transformed row ${index}:`, result);
    return result;
  }).filter(Boolean); // Remove null entries
}

/**
 * Fetch printer data from Google Sheets
 */
export async function fetchPrintersFromGoogleSheets() {
  try {
    // Try Service Account authentication first, then fallback to API key
    let accessToken;
    try {
      accessToken = await generateJWT();
      console.log('🔐 Using Service Account authentication');
    } catch (error) {
      console.log('⚠️ Service Account auth failed, falling back to API key');
      accessToken = null;
    }

    // First try Google Sheets API v4 with authentication
    try {
      const headers = {};
      let url;
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Lager!A:Z`;
      } else if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE') {
        url = SHEETS_API_V4_URL_LAGER;
      } else {
        throw new Error('No authentication method available');
      }

      console.log('🔍 Fetching data from Lager sheet:', url);
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const rawData = parseGoogleSheetsAPIv4(data);
        console.log('✅ Successfully fetched data from Lager sheet');
        console.log('📊 Raw data preview:', rawData.slice(0, 3));
        
        // Only return data if we have meaningful content
        if (rawData.length > 0) {
          return transformToPrinterData(rawData);
        }
      } else {
        console.log('❌ Failed to fetch from Lager sheet, Status:', response.status);
        const errorText = await response.text();
        console.log('❌ Error details:', errorText);
        
        // If 403, the sheet might not be accessible with this API key
        if (response.status === 403) {
          console.log('💡 Tip: Make sure the Google Sheet is shared with the Service Account email or is public');
        }
      }
    } catch (apiError) {
      console.log('❌ API v4 error:', apiError.message);
    }
    
    // Fallback to public JSON endpoint
    try {
      console.log('Trying public JSON endpoint...');
      console.log('JSON URL:', SHEETS_JSON_URL);
      const response = await fetch(SHEETS_JSON_URL);
      
      console.log('JSON response status:', response.status);
      console.log('JSON response ok:', response.ok);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('JSON response text:', responseText.substring(0, 200) + '...');
        const rawData = parseGoogleSheetsJSON(responseText);
        console.log('JSON parsed data:', rawData);
        console.log('Successfully fetched data via JSON endpoint');
        return transformToPrinterData(rawData);
      } else {
        const errorText = await response.text();
        console.log('JSON error response:', errorText);
      }
    } catch (jsonError) {
      console.log('JSON endpoint error:', jsonError.message);
    }
    
    // Final fallback to CSV format
    try {
      console.log('Trying CSV endpoint...');
      console.log('CSV URL:', SHEETS_API_URL);
      const csvResponse = await fetch(SHEETS_API_URL);
      
      console.log('CSV response status:', csvResponse.status);
      console.log('CSV response ok:', csvResponse.ok);
      
      if (csvResponse.ok) {
        const csvText = await csvResponse.text();
        console.log('CSV response text:', csvText.substring(0, 200) + '...');
        const rawData = parseCSVToObjects(csvText);
        console.log('CSV parsed data:', rawData);
        console.log('Successfully fetched data via CSV endpoint');
        return transformToPrinterData(rawData);
      } else {
        const errorText = await csvResponse.text();
        console.log('CSV error response:', errorText);
      }
    } catch (csvError) {
      console.log('CSV endpoint error:', csvError.message);
    }
    
    throw new Error('All API methods failed');
    
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    
    // Return fallback data if API fails
    return [
      {
        id: "ERROR",
        brand: "API Error",
        model: "Could not fetch data",
        type: "Error",
        status: "out_of_stock",
        location: "N/A",
        quantity: 0,
        price: "N/A",
        lastUpdated: new Date().toISOString().split('T')[0],
      }
    ];
  }
}

/**
 * Hook for using Google Sheets data in React components
 */
export function useGoogleSheetsData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    try {
      console.log('🔄 Fetching data from Google Sheets...');
      setLoading(true);
      setError(null);
      const printersData = await fetchPrintersFromGoogleSheets();
      console.log('📊 Fetched data:', printersData);
      setData(printersData);
    } catch (err) {
      console.error('❌ Error in useGoogleSheetsData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on mount
  useEffect(() => {
    console.log('🚀 useGoogleSheetsData mounted, fetching initial data...');
    fetchData();
  }, []);
  
  // Refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  return { data, loading, error, refetch: fetchData };
}

/**
 * Generate access token using Service Account credentials
 * Using Google's OAuth2 service account flow
 */
async function generateJWT() {
  if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
    throw new Error('Service Account credentials not configured');
  }

  try {
    console.log('🔐 Attempting Service Account authentication...');
    console.log('📧 Service Account Email:', SERVICE_ACCOUNT_EMAIL);
    
    // For browser-based applications, we'll use a simpler approach
    // In production, you'd typically handle this server-side
    const now = Math.floor(Date.now() / 1000);
    
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    console.log('🔑 Creating JWT assertion...');
    // Create JWT assertion manually (simplified for browser environment)
    const assertion = await createJWTAssertion(header, payload);
    console.log('✅ JWT assertion created successfully');
    
    console.log('🌐 Requesting access token...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: assertion
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token request failed:', errorData);
      throw new Error(`Failed to get access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Access token obtained successfully');
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ JWT generation error:', error);
    throw error;
  }
}

/**
 * Create JWT assertion using Web Crypto API
 */
async function createJWTAssertion(header, payload) {
  try {
    // Base64URL encode header and payload
    const base64UrlEncode = (obj) => {
      return btoa(JSON.stringify(obj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    const headerEncoded = base64UrlEncode(header);
    const payloadEncoded = base64UrlEncode(payload);
    const message = `${headerEncoded}.${payloadEncoded}`;

    // Import the private key
    const privateKeyPem = SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');
    const keyData = pemToArrayBuffer(privateKeyPem);
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    );

    // Sign the message
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(message)
    );

    // Convert signature to base64url
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${message}.${signatureBase64}`;
  } catch (error) {
    console.error('JWT signing error:', error);
    throw new Error('Failed to create JWT assertion');
  }
}

/**
 * Convert PEM private key to ArrayBuffer
 */
function pemToArrayBuffer(pem) {
  try {
    // Handle environment variable newlines (both \n and \\n)
    let cleanPem = pem;
    if (typeof cleanPem === 'string') {
      // Replace literal \n strings with actual newlines first
      cleanPem = cleanPem.replace(/\\n/g, '\n');
    }
    
    const pemContents = cleanPem
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\r/g, '')  // Remove carriage returns
      .replace(/\n/g, '')  // Remove newlines
      .replace(/\s+/g, '') // Remove any other whitespace
      .replace(/"/g, '');  // Remove any quotes
    
    console.log('Original PEM length:', pem.length);
    console.log('PEM contents length after cleaning:', pemContents.length);
    console.log('PEM contents preview:', pemContents.substring(0, 50) + '...');
    console.log('PEM contents end:', '...' + pemContents.substring(pemContents.length - 20));
    
    // Validate base64 format
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(pemContents)) {
      console.error('Invalid base64 characters found in PEM');
      throw new Error('PEM contains invalid base64 characters');
    }
    
    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('✅ Successfully converted PEM to ArrayBuffer');
    return bytes.buffer;
  } catch (error) {
    console.error('Error converting PEM to ArrayBuffer:', error);
    console.error('PEM input:', pem.substring(0, 100) + '...');
    throw new Error('Invalid PEM format: ' + error.message);
  }
}

/**
 * Update a cell in Google Sheets using Service Account
 */
export async function updateGoogleSheetCell(rowNumber, columnIndex, value) {
  if (reservedColumnIndex === -1) {
    console.error('Reserverad_av column not found');
    return false;
  }
  
  try {
    // Convert column index to letter (A=0, B=1, etc.)
    const columnLetter = String.fromCharCode(65 + columnIndex);
    const range = `Lager!${columnLetter}${rowNumber}`;
    
    // Try Service Account authentication first
    let accessToken;
    try {
      accessToken = await generateJWT();
    } catch (error) {
      console.log('Service Account auth failed, falling back to API key');
      accessToken = null;
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    let url;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW`;
    } else {
      url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW&key=${API_KEY}`;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        values: [[value]]
      })
    });
    
    if (response.ok) {
      console.log(`✅ Successfully updated cell ${range} with value: ${value}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to update Google Sheet:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating Google Sheet:', error);
    return false;
  }
}

/**
 * Reserve a printer by updating the Reserverad_av column
 */
export async function reservePrinterInSheet(printer, sellerName) {
  if (reservedColumnIndex === -1) {
    console.error('Reserverad_av column not found');
    return false;
  }
  
  const today = new Date();
  const twoWeeksLater = new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000));
  const expirationDate = twoWeeksLater.toISOString().split('T')[0];
  
  const reservationText = sellerName 
    ? `Reserverad av ${sellerName} till ${expirationDate}`
    : `Reserverad till ${expirationDate}`;
  
  return await updateGoogleSheetCell(printer._rowNumber, reservedColumnIndex, reservationText);
}

/**
 * Unreserve a printer by clearing the Reserverad_av column
 */
export async function unreservePrinterInSheet(printer) {
  if (reservedColumnIndex === -1) {
    console.error('Reserverad_av column not found');
    return false;
  }
  
  return await updateGoogleSheetCell(printer._rowNumber, reservedColumnIndex, '');
}

export default fetchPrintersFromGoogleSheets;