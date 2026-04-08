// Global state
let selectedMood = null;
let currentEditingFood = null;

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadFoods();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {

    // Mood button selection
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedMood = this.dataset.mood;
        });
    });

    // Recommendation form submit
    document.getElementById('recommendationForm').addEventListener('submit', function (e) {
        e.preventDefault();
        getRecommendation();
    });

    // Add/Edit food form
    document.getElementById('addFoodForm').addEventListener('submit', handleFoodFormSubmit);
}

// Handle form submit (Add or Update)
function handleFoodFormSubmit(e) {
    e.preventDefault();

    if (currentEditingFood) {
        updateFood();
    } else {
        addFood();
    }
}

// =======================
// Recommendation
// =======================

async function getRecommendation() {

    const userId = document.getElementById('userId').value;
    const budget = parseFloat(document.getElementById('budget').value);
    const timeAvailable = parseInt(document.getElementById('timeAvailable').value);

    if (!selectedMood) {
        showAlert('Please select mood', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, mood: selectedMood, budget, timeAvailable })
        });

        const data = await response.json();

        if (response.ok) {
            displayRecommendation(data);
        } else {
            showAlert('Recommendation failed', 'danger');
        }

    } catch {
        showAlert('Server error', 'danger');
    }
}

// Display recommendation results
function displayRecommendation(data) {
    const placeholder = document.getElementById('recommendationPlaceholder');
    const result = document.getElementById('recommendationResult');
    const topDiv = document.getElementById('topRecommendation');
    const altDiv = document.getElementById('alternativeRecommendations');

    placeholder.classList.add('d-none');
    result.classList.remove('d-none');

    if (!data.recommendation) {
        topDiv.innerHTML = '<div class="alert alert-warning">No foods found matching your criteria</div>';
        altDiv.innerHTML = '';
        return;
    }

    // Display top recommendation
    const topFood = data.recommendation;
    topDiv.innerHTML = createFoodCard(topFood, true);

    // Display alternatives
    if (data.alternatives && data.alternatives.length > 0) {
        altDiv.innerHTML = '<h5 class="mt-4">Alternatives:</h5>' + 
            data.alternatives.map(food => createFoodCard(food, false)).join('');
    } else {
        altDiv.innerHTML = '';
    }
}

// Create food card HTML
function createFoodCard(food, isTopRecommendation = false) {
    const confidencePercent = Math.round((food.confidence || 0.5) * 100);
    const badges = [];
    
    if (food.spicy) badges.push('<span class="badge bg-danger">🌶️ Spicy</span>');
    if (food.vegetarian) badges.push('<span class="badge bg-success">🥬 Vegetarian</span>');
    if (isTopRecommendation) badges.push(`<span class="badge bg-primary">🎯 ${confidencePercent}% Match</span>`);
    
    food.moods.forEach(mood => badges.push(`<span class="badge bg-secondary">${mood}</span>`));

    return `
        <div class="card food-card ${isTopRecommendation ? 'border-primary' : ''}">
            <div class="card-body">
                <h5 class="card-title">${food.name}</h5>
                <p class="text-muted">${food.category} • ${food.preparationTime} min • $${food.priceRange.min}-${food.priceRange.max}</p>
                <p class="small">${food.description || ''}</p>
                <div class="mb-2">${badges.join(' ')}</div>
                ${food.ingredients ? `<p class="small text-muted">Ingredients: ${food.ingredients.join(', ')}</p>` : ''}
            </div>
        </div>
    `;
}

// =======================
// Load foods
// =======================

async function loadFoods() {
    try {
        const res = await fetch('/api/foods');
        const data = await res.json();
        displayFoodList(data);
    } catch (error) {
        console.error('Load error:', error);
        showAlert('Failed to load foods', 'danger');
    }
}

// Display food list
function displayFoodList(foods) {
    const foodList = document.getElementById('foodList');
    
    if (foods.length === 0) {
        foodList.innerHTML = '<p class="text-muted">No foods in database yet. Add some foods to get started!</p>';
        return;
    }

    const html = foods.map(food => `
        <div class="card food-card">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">${food.name}</h5>
                        <p class="text-muted">${food.category} • ${food.preparationTime} min • $${food.priceRange.min}-${food.priceRange.max}</p>
                        <p class="small">${food.description || ''}</p>
                        <div>
                            ${food.moods.map(mood => `<span class="badge bg-secondary me-1">${mood}</span>`).join('')}
                            ${food.spicy ? '<span class="badge bg-danger me-1">🌶️ Spicy</span>' : ''}
                            ${food.vegetarian ? '<span class="badge bg-success me-1">🥬 Vegetarian</span>' : ''}
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editFood('${food._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteFood('${food._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    foodList.innerHTML = html;
}

// =======================
// CRUD
// =======================

// ADD
async function addFood() {
    const food = collectFoodForm();

    const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food)
    });

    if (res.ok) {
        showAlert('Food added successfully!', 'success');
        resetForm();
        loadFoods();
    } else {
        showAlert('Failed to add food', 'danger');
    }
}

// UPDATE
async function updateFood() {
    const food = collectFoodForm();

    const res = await fetch(`/api/foods/${currentEditingFood}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food)
    });

    if (res.ok) {
        showAlert('Food updated successfully!', 'success');
        resetForm();
        currentEditingFood = null;
        loadFoods();
    } else {
        showAlert('Failed to update food', 'danger');
    }
}

// DELETE
async function deleteFood(id) {
    if (!confirm('Are you sure you want to delete this food?')) return;

    const res = await fetch(`/api/foods/${id}`, { method: 'DELETE' });

    if (res.ok) {
        showAlert('Food deleted successfully!', 'success');
        loadFoods();
    } else {
        showAlert('Failed to delete food', 'danger');
    }
}

// EDIT (load data into form)
async function editFood(id) {
    try {
        const res = await fetch(`/api/foods/${id}`);
        const food = await res.json();

        document.getElementById('foodName').value = food.name;
        document.getElementById('foodCategory').value = food.category;
        document.getElementById('minPrice').value = food.priceRange.min;
        document.getElementById('maxPrice').value = food.priceRange.max;
        document.getElementById('prepTime').value = food.preparationTime;

        currentEditingFood = id;
        
        // Change button text to indicate edit mode
        const submitBtn = document.querySelector('#addFoodForm button[type="submit"]');
        submitBtn.textContent = 'Update Food';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning');
        
    } catch (error) {
        showAlert('Failed to load food data', 'danger');
    }
}

// =======================
// History
// =======================

async function loadHistory() {
    const userId = document.getElementById('historyUserId').value;
    
    if (!userId) {
        showAlert('Please enter User ID', 'warning');
        return;
    }

    try {
        const res = await fetch(`/api/history/${userId}`);
        const data = await res.json();
        displayHistory(data);
    } catch (error) {
        showAlert('Failed to load history', 'danger');
    }
}

function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-muted">No history found for this user.</p>';
        return;
    }

    const html = history.map(item => `
        <div class="history-item">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6>${item.recommendedFood.foodName}</h6>
                    <p class="small text-muted mb-1">
                        Mood: ${item.mood} • Budget: $${item.budget} • Time: ${item.timeAvailable}min
                    </p>
                    <p class="small text-muted">
                        Confidence: ${Math.round(item.recommendedFood.confidence * 100)}% • 
                        ${item.userAccepted ? '✅ Accepted' : '❌ Not accepted'}
                    </p>
                </div>
                <small class="text-muted">${new Date(item.createdAt).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');

    historyList.innerHTML = html;
}

// =======================
// Analytics
// =======================

async function loadAnalytics() {
    try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        displayAnalytics(data);
    } catch (error) {
        showAlert('Failed to load analytics', 'danger');
    }
}

function displayAnalytics(analytics) {
    const analyticsContent = document.getElementById('analyticsContent');
    
    const html = `
        <div class="row">
            <div class="col-md-4">
                <div class="stats-card">
                    <h5>Total Recommendations</h5>
                    <h2>${analytics.total || 0}</h2>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5>Mood Distribution</h5>
                        ${analytics.moodStats && analytics.moodStats.length > 0 ? 
                            analytics.moodStats.map(stat => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${stat._id}</span>
                                    <div>
                                        <div class="progress" style="width: 150px; height: 20px;">
                                            <div class="progress-bar" style="width: ${stat.count}%">
                                                ${stat.count}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('') : 
                            '<p class="text-muted">No mood data available</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5>Popular Foods</h5>
                        ${analytics.popularFoods && analytics.popularFoods.length > 0 ?
                            analytics.popularFoods.map(food => `
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>${food._id}</span>
                                    <span class="badge bg-primary">${food.count} times</span>
                                </div>
                            `).join('') :
                            '<p class="text-muted">No popular food data available</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `;

    analyticsContent.innerHTML = html;
}

// =======================
// Helper
// =======================

// Collect form data
function collectFoodForm() {
    const moods = [];
    document.querySelectorAll('input[id^="mood_"]:checked')
        .forEach(c => moods.push(c.value));

    return {
        name: document.getElementById('foodName').value,
        category: document.getElementById('foodCategory').value,
        priceRange: {
            min: parseFloat(document.getElementById('minPrice').value),
            max: parseFloat(document.getElementById('maxPrice').value)
        },
        preparationTime: parseInt(document.getElementById('prepTime').value),
        moods: moods.length > 0 ? moods : ['happy'] // default mood if none selected
    };
}

// Reset form
function resetForm() {
    document.getElementById('addFoodForm').reset();
    currentEditingFood = null;
    
    // Reset button
    const submitBtn = document.querySelector('#addFoodForm button[type="submit"]');
    submitBtn.textContent = 'Add Food';
    submitBtn.classList.remove('btn-warning');
    submitBtn.classList.add('btn-primary');
}

// Alert UI
function showAlert(msg, type) {
    // Create a simple alert (you can enhance this with Bootstrap alerts)
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the container
    const container = document.querySelector('.main-container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}
