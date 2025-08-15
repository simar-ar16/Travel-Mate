# 🌍 TravelMate

**TravelMate** is a full-stack travel planning platform where travelers can discover destinations, book local guides, create trip plans, and stay organized — all in one place.  
The app includes role-based authentication (Traveler, Guide, Admin) using **JWT authentication**.

**🔗 Live Demo:** [Click here](https://travelmate-ymm9.onrender.com)  

---

## ✨ Features
### 🧳 For Travelers
- Destination Discovery – Search and filter destinations with images, descriptions, and must-visit places.

- Trip Planner – Create and manage itineraries, budgets, packing lists, and trip countdowns.

- Guide Booking – Book verified guides based on destination and trip dates.

- Traveler–Guide Chat – Communicate directly after booking confirmation.

- Post-trip Reviews – Share your feedback about guides.

### 👨‍💼 For Guides
- Profile Management – Add bio, expertise, availability, price/hour, and languages.

- Booking Requests – Accept or decline traveler requests.

- Manage Bookings – View upcoming trips and traveler details.

### 🛠 For Admins
- Guide Verification – Approve or reject guide accounts before public listing.

- Destination Management – Add, update, or remove destinations.

- Blog Management – Create and manage travel-related blogs.

### 🔑 Authentication & Roles
- Secure signup/login with **JWT authentication**.
- Role-based access: Traveler, Guide, and Admin dashboards.
- OTP verification.

---

## 🛠 Tech Stack

### **Frontend**
- EJS (Embedded JavaScript Templates)
- Bootstrap 5
- Custom CSS (Glassmorphism + black-yellow theme)

### **Backend**
- Node.js
- Express.js
- JWT Authentication
- bcrypt 

### **Database**
- MongoDB 

### **Other**
- Multer for file uploads
- Brevo (for OTP email verification)
- Render for deployment
- MongoDB Atlas for cloud database

---

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/simar-ar16/Travel-Mate.git 
   cd Travel-Mate
   
2. **Install dependencies**
   ```bash
   npm install

3. **Create a .env file in the root folder and add:**
   ```bash
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your_email
    EMAIL_PASS=your_email_password

4. **Run the application**
   ```bash
   npm start

## 🚀 Usage

- Visit http://localhost:3000 in your browser.

- Sign up as a Traveler, Guide, or Admin.

- Explore destinations, create trip plans, and book guides.

- Admin can log in to manage platform data.

- Enjoy your travel planning experience!