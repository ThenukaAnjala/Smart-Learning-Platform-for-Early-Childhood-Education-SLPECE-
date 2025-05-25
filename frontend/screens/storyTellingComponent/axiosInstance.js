// apiInstances.js
import axios from "axios";

export const api4010 = axios.create({
  baseURL: "http://192.168.1.46:4010",
  headers: { "Content-Type": "application/json" },
});

export const api5000 = axios.create({
  baseURL: "http://192.168.1.46:5000",
  headers: { "Content-Type": "application/json" },
});
