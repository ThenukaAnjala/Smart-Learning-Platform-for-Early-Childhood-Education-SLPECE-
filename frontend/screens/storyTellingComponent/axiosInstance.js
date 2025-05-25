// apiInstances.js
import axios from "axios";

export const api4010 = axios.create({
  baseURL: "http://192.168.53.47:4010",
  headers: { "Content-Type": "application/json" },
});

export const api5000 = axios.create({
  baseURL: "http://192.168.53.47:5002",
  headers: { "Content-Type": "application/json" },
});
