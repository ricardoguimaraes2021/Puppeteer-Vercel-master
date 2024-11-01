const express = require("express");
const app = express();
const puppeteer = require("puppeteer");

app.get("/", (req, res) => {
  res.send("Welcome! Use /api with a Streamtape URL to fetch the video source URL.");
});

app.get("/api", async (req, res) => {
  // Retrieve the URL from the 'url' query parameter
  const videoUrl = req.query.url || "https://streamtape.com/v/7zeY3yGXYzfA1rz";
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]  // Required for Glitch environment
    });
    const page = await browser.newPage();
    
    // Navigate to the provided video URL
    await page.goto(videoUrl, { waitUntil: "networkidle2" });

    // Wait for the video element with ID 'mainvideo' to load
    await page.waitForSelector("video#mainvideo", { timeout: 10000 });

    // Extract the 'src' attribute of the video element
    const videoSrc = await page.evaluate(() => {
      const videoElement = document.querySelector("video#mainvideo");
      return videoElement ? videoElement.getAttribute("src") : null;
    });

    await browser.close();

    if (videoSrc) {
      res.send(`Video source URL: ${videoSrc}`);
    } else {
      res.status(404).send("Video element not found or src attribute missing.");
    }
  } catch (err) {
    console.error("Error fetching video source URL:", err);
    res.status(500).send("Error fetching video source URL. Please check the URL or try again later.");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
