const tf = require("@tensorflow/tfjs-node");

// Step 1: Define California county data
const counties = [
    { county: "Alameda", population: 1671329, foodInsecurity: 8.4, povertyRate: 9.3 },
    { county: "Alpine", population: 1129, foodInsecurity: 12.1, povertyRate: 11.5 },
    { county: "Amador", population: 40097, foodInsecurity: 10.3, povertyRate: 9.8 },
    { county: "Butte", population: 211632, foodInsecurity: 13.2, povertyRate: 16.5 },
    { county: "Calaveras", population: 46286, foodInsecurity: 9.7, povertyRate: 10.1 },
    { county: "Colusa", population: 21441, foodInsecurity: 11.5, povertyRate: 13.2 },
    { county: "Contra Costa", population: 1163837, foodInsecurity: 7.9, povertyRate: 8.4 },
    { county: "Del Norte", population: 27112, foodInsecurity: 14.6, povertyRate: 17.8 },
    { county: "El Dorado", population: 192843, foodInsecurity: 7.2, povertyRate: 7.5 },
    { county: "Fresno", population: 1017681, foodInsecurity: 14.3, povertyRate: 20.2 },
    { county: "Los Angeles", population: 10039107, foodInsecurity: 12.3, povertyRate: 13.4 },
    { county: "San Diego", population: 3338330, foodInsecurity: 10.1, povertyRate: 9.8 },
    { county: "San Francisco", population: 870044, foodInsecurity: 9.2, povertyRate: 8.1 },
    { county: "San Joaquin", population: 762148, foodInsecurity: 13.1, povertyRate: 14.5 },
    { county: "San Mateo", population: 769545, foodInsecurity: 7.0, povertyRate: 6.8 },
    { county: "Santa Clara", population: 1927852, foodInsecurity: 7.8, povertyRate: 8.3 },
    { county: "Sacramento", population: 1552058, foodInsecurity: 11.5, povertyRate: 10.2 },
];

// Step 2: Convert data to TensorFlow tensors
const inputs = counties.map(c => [c.population / 1e6, c.foodInsecurity / 100, c.povertyRate / 100]);
const labels = counties.map(c => [(c.foodInsecurity * 0.6 + c.povertyRate * 0.4) / 20]); // Normalize priority score

const xs = tf.tensor2d(inputs);
const ys = tf.tensor2d(labels);

// Step 3: Build a simple AI model
const model = tf.sequential();
model.add(tf.layers.dense({ units: 8, activation: "relu", inputShape: [3] }));
model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

model.compile({ optimizer: "adam", loss: "meanSquaredError" });

// Step 4: Train the model
(async function trainModel() {
    await model.fit(xs, ys, { epochs: 100 });

    console.log("✅ Model training complete.");
    
    // Step 5: Predict priority for a sample county
    const sampleInput = tf.tensor2d([[0.9, 0.14, 0.15]]); // Example: Kern County
    const prediction = model.predict(sampleInput);
    
    prediction.data().then(data => {
        console.log(`🔹 Predicted priority score: ${data[0].toFixed(3)}`);
    });
})();
