
# Project Overview: Streamtape Video Source Scraper with PHP and Node.js Integration

## Project Structure

This project is structured to integrate PHP (running on Hostinger) and Node.js with Puppeteer (hosted on Glitch). Given Hostinger’s limitation of only supporting PHP and HTML, this approach allows you to use Puppeteer for scraping video `src` data by hosting a Node.js API separately.

### Workflow Overview

1. **PHP Site on Hostinger**:
   - The PHP script on Hostinger sends a request to the Glitch-hosted API with the Streamtape video URL as a query parameter.
   
2. **Glitch API (Node.js with Puppeteer)**:
   - The Node.js script on Glitch receives the request, uses Puppeteer to open the Streamtape URL, extracts the `src` attribute from the video element, and returns it.
   
3. **PHP Response Handling**:
   - The PHP script receives the response (video `src` URL) from Glitch and can then display it or use it to embed the video on the Hostinger-hosted site.

---

## 1. PHP Script (Hostinger)

The PHP code below is designed to call the Glitch-hosted Node.js API, passing the Streamtape URL as a parameter and retrieving the `src` attribute from the video.

### PHP Code

```php
<?php
// Video URL to scrape
$get_movie_token = "https://streamtape.com/v/7zeY3yGXYzfA1rz";

// Glitch API endpoint with the video URL as a query parameter
$apiUrl = "https://your-glitch-project-url.glitch.me/api?url=" . urlencode($get_movie_token);

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the request and get the response
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    echo "Error fetching video source URL: " . curl_error($ch);
} else {
    // Display the video source URL (the `src` data)
    echo "Video Source URL: " . $response;
}

// Close the cURL session
curl_close($ch);
?>
```

### Explanation of PHP Code

1. **Constructs the API URL**: Uses `$get_movie_token` to define the video URL and sends it to the Glitch API as a parameter.
2. **Sends Request with cURL**: Calls the API and retrieves the video `src` data.
3. **Handles Response**: Displays the `src` URL or displays an error if the API call fails.

---

## 2. Node.js Script (Glitch)

This is the `index.js` file that runs on Glitch, handling the API request and using Puppeteer to extract the video `src` data.

### Node.js Code

```javascript
const express = require("express");
const app = express();
const puppeteer = require("puppeteer");

app.get("/", (req, res) => {
  res.send("Welcome! Use /api with a Streamtape URL to fetch the video source URL.");
});

app.get("/api", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send("Please provide a video URL as a parameter.");
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(videoUrl, { waitUntil: "networkidle2" });

    // Wait for the video element with id 'mainvideo' to load
    await page.waitForSelector("video#mainvideo", { timeout: 10000 });

    // Extract the 'src' attribute from the video element
    const videoSrc = await page.evaluate(() => {
      const videoElement = document.querySelector("video#mainvideo");
      return videoElement ? videoElement.getAttribute("src") : null;
    });

    await browser.close();

    if (videoSrc) {
      res.send(videoSrc);
    } else {
      res.status(404).send("Video element not found or src attribute missing.");
    }
  } catch (err) {
    console.error("Error fetching video source URL:", err);
    res.status(500).send("Error fetching video source URL.");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
```

### Explanation of Node.js Code

1. **Receives URL**: Gets the video URL from the `url` query parameter.
2. **Launches Puppeteer**: Opens a headless browser, navigates to the Streamtape URL, and waits for the video element to load.
3. **Extracts Video Source**: Fetches the `src` attribute from the video element and sends it back as the response.

---

## Summary of How It Works

1. **PHP Script on Hostinger** calls the **Glitch API** (`index.js`) with the Streamtape video URL.
2. **Node.js API on Glitch** scrapes the `src` data of the video using Puppeteer and returns it.
3. **PHP Script** receives the response and uses the `src` URL in your Hostinger-hosted site.

---

This setup allows you to handle complex scraping with Puppeteer on Glitch while easily integrating the results in your PHP environment on Hostinger.
