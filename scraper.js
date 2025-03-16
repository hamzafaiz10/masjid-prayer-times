const fs = require('fs');
const https = require('https');
const { JSDOM } = require('jsdom');

// URL of the Moonode page
const MOONODE_URL = 'https://moonode.tv/glassy/DINSCREEN-496636-MONTREAL-CANADA-H7X2B6';

// Function to fetch the HTML content
async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to extract prayer times from HTML
function extractPrayerTimes(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // This is where you'll need to inspect the HTML structure and adjust selectors
  // These are placeholder selectors - you'll need to update them based on actual HTML
  const prayerContainers = document.querySelectorAll('.prayer-container');
  
  // Default values in case scraping fails
  const prayerTimes = {
    fajr: { adhan: "05:42", iqama: "05:57" },
    dhuhr: { adhan: "13:04", iqama: "13:30" },
    asr: { adhan: "16:22", iqama: "16:32" },
    maghrib: { adhan: "19:03", iqama: "19:08" },
    isha: { adhan: "20:25", iqama: "20:30" },
    jumuah: [
      { time: "12:20", language: "Français" },
      { time: "13:30", language: "العربية" }
    ],
    lastUpdated: new Date().toISOString()
  };
  
  try {
    // Example of how you might extract data
    // You'll need to adjust this based on the actual HTML structure
    prayerContainers.forEach(container => {
      const prayerName = container.querySelector('.prayer-name')?.textContent.toLowerCase().trim();
      const adhanTime = container.querySelector('.adhan-time')?.textContent.trim();
      const iqamaTime = container.querySelector('.iqama-time')?.textContent.trim();
      
      if (prayerName && adhanTime && iqamaTime) {
        if (prayerName.includes('fajr')) {
          prayerTimes.fajr = { adhan: adhanTime, iqama: iqamaTime };
        } else if (prayerName.includes('dhuhr')) {
          prayerTimes.dhuhr = { adhan: adhanTime, iqama: iqamaTime };
        } else if (prayerName.includes('asr')) {
          prayerTimes.asr = { adhan: adhanTime, iqama: iqamaTime };
        } else if (prayerName.includes('maghrib')) {
          prayerTimes.maghrib = { adhan: adhanTime, iqama: iqamaTime };
        } else if (prayerName.includes('isha')) {
          prayerTimes.isha = { adhan: adhanTime, iqama: iqamaTime };
        }
      }
    });
    
    // Extract Jumuah times
    const jumuahContainers = document.querySelectorAll('.jumuah-container');
    if (jumuahContainers.length > 0) {
      prayerTimes.jumuah = [];
      jumuahContainers.forEach(container => {
        const time = container.querySelector('.time')?.textContent.trim();
        const language = container.querySelector('.language')?.textContent.trim();
        if (time && language) {
          prayerTimes.jumuah.push({ time, language });
        }
      });
    }
    
    console.log('Successfully extracted prayer times');
  } catch (error) {
    console.error('Error extracting prayer times:', error);
    console.log('Using default values');
  }
  
  return prayerTimes;
}

// Main function
async function main() {
  try {
    console.log('Fetching HTML from Moonode...');
    const html = await fetchHTML(MOONODE_URL);
    
    console.log('Extracting prayer times...');
    const prayerTimes = extractPrayerTimes(html);
    
    console.log('Writing prayer times to file...');
    fs.writeFileSync('prayer-times.json', JSON.stringify(prayerTimes, null, 2));
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
