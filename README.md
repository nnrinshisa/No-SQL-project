# Smart Food Decision System

A NoSQL-based food recommendation system that suggests meals based on mood, budget, and time constraints using MongoDB and Node.js.

## Features

### Core Functionality
- **Mood-based Recommendations**: Select your current mood (happy, sad, stressed, hungry, lazy, excited) to get personalized food suggestions
- **Budget & Time Filtering**: Set your budget and available time to get suitable recommendations
- **Confidence Scoring**: System calculates confidence scores based on how well food matches your criteria
- **Alternative Options**: Get multiple food options with confidence rankings

### CRUD Operations
- **Create**: Add new foods to the database with detailed information
- **Read**: View all foods in the database with filtering and search
- **Update**: Edit existing food information and properties
- **Delete**: Remove foods from the database
- **Reporting**: Comprehensive analytics and user history tracking

### Analytics & Reporting
- User recommendation history
- Mood statistics and trends
- Budget analysis
- Popular foods tracking
- Acceptance rate metrics

## NoSQL Database Design

### Food Collection Schema
```javascript
{
  name: String (required),
  category: String (required),
  priceRange: {
    min: Number (required),
    max: Number (required)
  },
  preparationTime: Number (required),
  moods: [String],
  description: String,
  ingredients: [String],
  spicy: Boolean,
  vegetarian: Boolean,
  createdAt: Date
}
```

### User History Collection Schema
```javascript
{
  userId: String (required),
  mood: String (required),
  budget: Number (required),
  timeAvailable: Number (required),
  recommendedFood: {
    foodId: ObjectId (ref: 'Food'),
    foodName: String,
    confidence: Number
  },
  userAccepted: Boolean,
  timestamp: Date
}
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-food-decision-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/smart-food-decision-system
   ```

4. **Seed the database with sample data**
   ```bash
   node seed.js
   ```

5. **Start the application**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:3000` in your browser

## API Endpoints

### Food Management
- `GET /api/foods` - Get all foods
- `POST /api/foods` - Add new food
- `PUT /api/foods/:id` - Update food
- `DELETE /api/foods/:id` - Delete food

### Recommendations
- `POST /api/recommend` - Get food recommendation based on mood, budget, and time

### User History
- `GET /api/history/:userId` - Get user's recommendation history
- `PUT /api/history/:id/accept` - Mark recommendation as accepted

### Analytics
- `GET /api/analytics` - Get system analytics and statistics

## Usage Examples

### Getting a Recommendation
```javascript
// POST /api/recommend
{
  "userId": "user123",
  "mood": "happy",
  "budget": 15,
  "timeAvailable": 30
}
```

### Adding a New Food
```javascript
// POST /api/foods
{
  "name": "Pad Thai",
  "category": "thai",
  "priceRange": { "min": 8, "max": 12 },
  "preparationTime": 20,
  "moods": ["happy", "excited"],
  "description": "Classic Thai stir-fried noodles",
  "ingredients": ["rice noodles", "shrimp", "peanuts"],
  "spicy": true,
  "vegetarian": false
}
```

## NoSQL Concepts Demonstrated

### 1. Flexible Schema Design
- Documents can have varying structures
- Arrays for mood associations (many-to-many relationships)
- Nested objects for complex data (priceRange, recommendedFood)

### 2. Aggregation Pipeline
- Complex analytics queries using MongoDB aggregation
- Grouping, sorting, and data transformation
- Statistical calculations (averages, counts)

### 3. Document References
- Population of referenced documents
- Relationships between collections without joins

### 4. Query Flexibility
- Dynamic querying based on multiple criteria
- Array containment queries ($in, $all)
- Range queries for budget and time

### 5. Scalability Features
- Horizontal scaling capability
- Document-based storage for better performance
- Index-friendly query patterns

## Project Structure

```
smart-food-decision-system/
├── server.js              # Main application server
├── app.js                 # Frontend JavaScript
├── index.html             # Main HTML page
├── style.css              # Custom styles
├── package.json           # Dependencies and scripts
├── seed.js               # Database seeding script
├── .env                  # Environment variables
└── README.md             # This file
```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Icons**: Font Awesome
- **Development**: Nodemon

## Features Demonstration

### CRUD Operations
1. **Create**: Use the "Manage Foods" tab to add new food items
2. **Read**: View all foods in the database with search and filtering
3. **Update**: Click "Edit" on any food item to modify its details
4. **Delete**: Remove unwanted foods from the database

### Recommendation System
1. Select your mood from the interactive mood buttons
2. Set your budget and time constraints
3. Get personalized recommendations with confidence scores
4. View alternative options if needed

### Analytics Dashboard
1. Track user behavior patterns
2. Analyze mood trends
3. Monitor budget statistics
4. View popular food choices

## Future Enhancements

1. **Machine Learning Integration**: Implement ML algorithms for better recommendations
2. **User Profiles**: Create personalized user profiles with preferences
3. **Location-based Recommendations**: Add geographic filtering
4. **Image Upload**: Allow food images for better visualization
5. **Mobile App**: Develop native mobile applications
6. **Social Features**: Add sharing and community features
7. **Nutritional Information**: Include detailed nutritional data
8. **Allergy Filtering**: Add allergy and dietary restriction filters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For any questions or issues, please contact the development team.
