const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const CLARIFAI_API_KEY = "c74e79d837364c028103ab7d998a86a0";
const MODEL_ID = "food-item-recognition";
const MODEL_VERSION_ID = "1d5fd481e0cf4826aa72ec3ff049e044";

// Proxy route to handle Clarifai API requests
app.post("/clarifai", async (req, res) => {
    try {
        const response = await fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Key ${CLARIFAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching Clarifai API:", error);
        res.status(500).json({ error: "Failed to fetch Clarifai API" });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
