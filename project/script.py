import ee
import numpy as np
import tensorflow as tf
import requests
import json

# Authenticate Google Earth Engine
ee.Authenticate()
ee.Initialize()

# Function to Load Satellite Imagery (Sentinel-2)
def get_satellite_image(lat, lon):
    point = ee.Geometry.Point([lon, lat])
    image = (ee.ImageCollection('COPERNICUS/S2')
             .filterBounds(point)
             .filterDate('2023-01-01', '2023-12-31')
             .sort('CLOUDY_PIXEL_PERCENTAGE')
             .first())
    return image

# Extract NDVI (Vegetation Index)
def extract_ndvi(image):
    ndvi = image.normalizedDifference(['B8', 'B4'])  # (NIR - Red) / (NIR + Red)
    return ndvi.reduceRegion(ee.Reducer.mean(), image.geometry()).getInfo()

# Get Census Data (Income, Car Access, Population)
def get_census_data(county):
    url = f"https://api.census.gov/data/2022/acs/acs5?get=B19013_001E,B25044_003E,B01001_001E&for=county:{county}&in=state:06"
    response = requests.get(url)
    data = json.loads(response.text)[1]
    return {'income': int(data[0]), 'no_car': int(data[1]), 'population': int(data[2])}

# Load AI Model for Prediction
model = tf.keras.models.load_model("food_desert_model.h5")

# Predict Food Deserts
def predict_food_desert(lat, lon, county):
    image = get_satellite_image(lat, lon)
    ndvi_value = extract_ndvi(image)
    census_data = get_census_data(county)
    
    input_data = np.array([ndvi_value, census_data['income'], census_data['no_car'], census_data['population']]).reshape(1, -1)
    prediction = model.predict(input_data)
    return "Food Desert" if prediction[0] > 0.5 else "Not a Food Desert"

# Example for Los Angeles County
print(predict_food_desert(34.05, -118.25, "037"))
