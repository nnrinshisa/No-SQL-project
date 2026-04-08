const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =======================
// MongoDB LOCAL CONNECT
// =======================
mongoose.connect('mongodb://127.0.0.1:27017/foodDB')
.then(() => console.log('✅ Connected to MongoDB (Local)'))
.catch(err => console.error('❌ MongoDB error:', err));

// =======================
// Schema (FULL VERSION)
// =======================
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    priceRange: {
        min: Number,
        max: Number
    },
    preparationTime: Number,
    moods: [String],
    description: String,
    ingredients: [String],
    spicy: Boolean,
    vegetarian: Boolean,
    createdAt: { type: Date, default: Date.now }
});

const userHistorySchema = new mongoose.Schema({
    userId: String,
    mood: String,
    budget: Number,
    timeAvailable: Number,
    recommendedFood: {
        foodId: mongoose.Schema.Types.ObjectId,
        foodName: String,
        confidence: Number
    },
    userAccepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Food = mongoose.model('Food', foodSchema);
const UserHistory = mongoose.model('UserHistory', userHistorySchema);

// =======================
// CRUD
// =======================

// CREATE
app.post('/api/foods', async (req, res) => {
    try {
        const food = new Food(req.body);
        await food.save();
        res.json(food);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// READ ALL
app.get('/api/foods', async (req, res) => {
    const foods = await Food.find();
    res.json(foods);
});

// READ ONE (🔥 FIX: editFood ใช้)
app.get('/api/foods/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) return res.status(404).json({ error: 'Not found' });
        res.json(food);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE
app.put('/api/foods/:id', async (req, res) => {
    try {
        const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(food);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE
app.delete('/api/foods/:id', async (req, res) => {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// =======================
// Recommendation (FIX + smarter)
// =======================
app.post('/api/recommend', async (req, res) => {
    try {
        const { mood, budget, timeAvailable, userId } = req.body;

        console.log('Request:', { mood, budget, timeAvailable, userId });

        // More flexible search
        const foods = await Food.find({
            moods: mood,
            $or: [
                { 'priceRange.min': { $lte: budget } },
                { 'priceRange.max': { $gte: budget } }
            ],
            preparationTime: { $lte: timeAvailable }
        });

        console.log('Found foods:', foods.length);

        if (foods.length === 0) {
            return res.json({ recommendation: null, alternatives: [] });
        }

        // scoring
        const scored = foods.map(f => {
            let score = 0.5;

            if (f.priceRange.max <= budget * 0.8) score += 0.2;
            if (f.preparationTime <= timeAvailable * 0.5) score += 0.2;
            if (f.moods.length > 1) score += 0.1;

            return { ...f.toObject(), confidence: Math.min(score, 1) };
        });

        scored.sort((a, b) => b.confidence - a.confidence);
        const top = scored[0];

        console.log('Top recommendation:', top.name);

        // save history
        if (userId && top) {
            await UserHistory.create({
                userId,
                mood,
                budget,
                timeAvailable,
                recommendedFood: {
                    foodId: top._id,
                    foodName: top.name,
                    confidence: top.confidence
                }
            });
        }

        res.json({
            recommendation: top,
            alternatives: scored.slice(1, 4)
        });

    } catch (err) {
        console.error('Recommendation error:', err);
        res.status(400).json({ error: err.message });
    }
});

// =======================
// HISTORY (FIX: frontend ใช้)
// =======================
app.get('/api/history/:userId', async (req, res) => {
    const data = await UserHistory.find({ userId: req.params.userId })
        .sort({ createdAt: -1 });

    res.json(data);
});

// =======================
// ANALYTICS (FULL)
// =======================
app.get('/api/analytics', async (req, res) => {
    const moodStats = await UserHistory.aggregate([
        { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]);

    const popularFoods = await UserHistory.aggregate([
        { $group: { _id: "$recommendedFood.foodName", count: { $sum: 1 } } }
    ]);

    const total = await UserHistory.countDocuments();

    res.json({
        moodStats,
        popularFoods,
        total
    });
});

// =======================
// FRONTEND
// =======================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =======================
// RUN SERVER
// =======================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});