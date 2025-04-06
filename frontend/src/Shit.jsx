import React, { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';

const API_KEY = 'YOUR_API_KEY_HERE'; // <-- Replace with your real Agromonitoring API key

const fetchGeoData = async () => {
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  const world = await res.json();
  const features = topojson.feature(world, world.objects.countries).features;

  const ndviScores = await Promise.all(
    features.map(async (country) => {
      const [lon, lat] = d3.geoCentroid(country);

      try {
        const apiRes = await fetch(
          `https://api.agromonitoring.com/agro/1.0/ndvi/history?lat=${lat}&lon=${lon}&start=1672531200&end=1675209600&appid=${e5620dac54da9fc4a5abaf7aebee5e49}`
        );
        const ndviData = await apiRes.json();

        // Get average NDVI from historical results
        const ndviList = ndviData.map((entry) => entry.data[0]?.value || 0);
        const avgNDVI = ndviList.reduce((a, b) => a + b, 0) / ndviList.length || 0;

        // Normalize from [-1, 1] to [0, 1] and invert for food_score
        const normalized = (avgNDVI + 1) / 2;
        const foodScore = 1 - normalized;

        return {
          ...country,
          properties: {
            ...country.properties,
            food_score: foodScore,
          },
        };
      } catch (err) {
        console.error(`Failed to fetch NDVI for ${country.properties.name}`, err);
        return {
          ...country,
          properties: {
            ...country.properties,
            food_score: 0.5,
          },
        };
      }
    })
  );

  return ndviScores;
};

const GlobeDots = ({ countries }) => {
  const group = React.useRef(null);

  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.001;
  });

  const convertCoords = (lon, lat) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);
    return [x, y, z];
  };

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color="#0e1111" wireframe opacity={0.2} transparent />
      </mesh>
      {countries.map((country, i) => {
        const centroid = d3.geoCentroid(country);
        const [x, y, z] = convertCoords(centroid[0], centroid[1]);
        const score = country.properties.food_score ?? 0.5;

        const color = new THREE.Color().lerpColors(
          new THREE.Color('#00ff00'),
          new THREE.Color('#ff0000'),
          score
        );

        return (
          <mesh key={i} position={[x * 2.02, y * 2.02, z * 2.02]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};

const AgStressGlobe = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchGeoData().then(setData);
  }, []);

  return (
    <div className="h-screen w-full bg-black relative">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Stars radius={50} depth={60} count={5000} factor={4} />
        <OrbitControls enableZoom={false} />
        {data.length > 0 && <GlobeDots countries={data} />}
      </Canvas>

      <div className="absolute top-5 left-5 bg-white/80 p-4 rounded-lg shadow-lg z-10">
        <h2 className="text-lg font-bold text-gray-800">🌾 Global Ag Stress Monitor</h2>
        <p className="text-sm text-gray-700 mt-1">
          Red = High agricultural stress (low NDVI)<br />
          Green = Healthy vegetation (high NDVI)<br />
          Powered by real-time satellite NDVI data
        </p>
      </div>
    </div>
  );
};

export default AgStressGlobe;
