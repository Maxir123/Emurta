// lib/data.js

export const vehicleData = [
  {
    id: 1,
    name: "Toyota Corolla",
    price: 4500000,
    mileage: 85000,
    fuel: "Petrol",
    type: "car",
    state: "Lagos",
    image: "/images/cars/corolla.jpg",
    condition: "foreign",
    year: 2019,
    transmission: "automatic",
    color: "blue",
    verified: true
  },
  {
    id: 2,
    name: "Honda Accord",
    price: 5200000,
    mileage: 60000,
    fuel: "Petrol",
    type: "car",
    state: "Abuja",
    image: "/images/cars/accord.jpg",
    condition: "foreign",
    year: 2018,
    transmission: "cvt",
    color: "black",
    verified: false
  },
  {
    id: 3,
    name: "Toyota Hilux",
    price: 12500000,
    mileage: 40000,
    fuel: "Diesel",
    type: "truck",
    state: "Rivers",
    image: "/images/cars/hilux.jpg",
    condition: "local",
    year: 2020,
    transmission: "manual",
    color: "gray",
    verified: true
  },
  {
    id: 4,
    name: "Lexus RX 350",
    price: 19500000,
    mileage: 30000,
    fuel: "Petrol",
    type: "car",
    state: "Lagos",
    image: "/images/cars/lexus.jpg",
    condition: "new",
    year: 2022,
    transmission: "automatic",
    color: "beige",
    verified: true
  },
  {
    id: 5,
    name: "Ford Transit",
    price: 7500000,
    mileage: 120000,
    fuel: "Diesel",
    type: "van",
    state: "Kano",
    image: "/images/cars/transit.jpg",
    condition: "local",
    year: 2017,
    transmission: "manual",
    color: "white",
    verified: false
  },
  {
    id: 6,
    name: "Mercedes Sprinter",
    price: 18500000,
    mileage: 80000,
    fuel: "Diesel",
    type: "bus",
    state: "Abuja",
    image: "/images/cars/sprinter.jpg",
    condition: "foreign",
    year: 2020,
    transmission: "automatic",
    color: "silver",
    verified: true
  },
];

export const fuelTypes = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Electric",
];

export const states = [
  "Lagos",
  "Abuja",
  "Rivers",
  "Oyo",
  "Kano",
  "Kaduna",
  "Delta",
  "Enugu",
  "Plateau",
  "Sokoto"
];

export const conditions = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'Brand New' },
  { value: 'foreign', label: 'Foreign Used' },
  { value: 'local', label: 'Local Used' },
];

export const transmissions = [
  { value: 'all', label: 'All' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'SEMI_AUTOMATIC', label: 'SEMI_AUTOMATIC' },
];

export const colors = [
  { value: 'all', label: 'All', color: '#9ca3af' },
  { value: 'white', label: 'White', color: '#ffffff' },
  { value: 'silver', label: 'Silver', color: '#c0c0c0' },
  { value: 'gray', label: 'Gray', color: '#6b7280' },
  { value: 'beige', label: 'Beige', color: '#d1b48c' },
  { value: 'black', label: 'Black', color: '#000000' },
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'red', label: 'Red', color: '#ef4444' },
  { value: 'green', label: 'Green', color: '#22c55e' },
];