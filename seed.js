const mongoose = require('mongoose');
require('dotenv').config();

// Use LOCAL MongoDB ONLY (fix ECONNREFUSED Atlas issue)
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodDB';

// Food Schema
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    priceRange: { 
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    preparationTime: { type: Number, required: true },
    moods: [String],
    description: String,
    ingredients: [String],
    spicy: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Food = mongoose.model('Food', foodSchema);

// Sample Data
const sampleFoods = [
    {
        name: "Pad Thai",
        category: "thai",
        priceRange: { min: 8, max: 12 },
        preparationTime: 20,
        moods: ["happy", "excited"],
        description: "Classic Thai stir-fried noodles",
        ingredients: ["rice noodles", "shrimp", "tofu"],
        spicy: true
    },
    {
        name: "Tom Yum Soup",
        category: "thai",
        priceRange: { min: 6, max: 10 },
        preparationTime: 15,
        moods: ["sad", "stressed"],
        description: "Hot and sour soup",
        ingredients: ["shrimp", "mushrooms"],
        spicy: true
    },
    {
        name: "Pizza",
        category: "international",
        priceRange: { min: 10, max: 15 },
        preparationTime: 25,
        moods: ["happy", "excited"],
        vegetarian: true
    },
    {
        name: "Salad",
        category: "healthy",
        priceRange: { min: 5, max: 9 },
        preparationTime: 10,
        moods: ["lazy", "stressed"],
        vegetarian: true
    },
    {
        name: "Ramen",
        category: "international",
        priceRange: { min: 5, max: 9 },
        preparationTime: 15,
        moods: ["hungry", "sad"],
        spicy: true
    },
    {
        name: "Chocolate Cake",
        category: "dessert",
        priceRange: { min: 4, max: 7 },
        preparationTime: 5,
        moods: ["sad", "happy"],
        vegetarian: true
    }
];

// Seed Function
async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        
        await mongoose.connect(MONGO_URI);

        console.log('Connected to MongoDB');

        // Clear old data
        await Food.deleteMany({});
        console.log('Old data cleared');

        // Insert new data
        await Food.insertMany(sampleFoods);
        console.log(`Inserted ${sampleFoods.length} foods`);

        console.log('Seeding SUCCESS');

        await mongoose.disconnect();
        console.log('Disconnected');

    } catch (error) {
        console.error('SEED ERROR:', error.message);
        process.exit(1);
    }
}

// Run
seedDatabase();