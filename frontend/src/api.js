import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://indore-metro.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function getStations() {
  const res = await API.get("/stations");
  return res.data;
}

export async function createStation(name) {
  const res = await API.post("/stations", { name });
  return res.data;
}

export async function connectStations({ firstStation, secondStation, distance, cost }) {
  const res = await API.post("/stations/connect", {
    firstStation,
    secondStation,
    distance,
    cost,
  });
  return res.data;
}

export async function getShortestPath(from, to) {
  const res = await API.get("/shortest-path", {
    params: { from, to }
  });
  return res.data;
}

export default API;
