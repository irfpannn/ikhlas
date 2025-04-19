# 🌟 Ikhlas – One-Stop Zakat & Donation Platform

**Ikhlas** is a comprehensive web-based application designed to facilitate transparent and Shariah-compliant zakat and donation management. The platform aims to simplify the process of calculating zakat, making donations, and managing charitable campaigns while ensuring ethical and accountable practices.

🌐 **Live Preview:** [Ikhlas Web App](https://ikhlas-um.netlify.app/)

📁 **Presentation Slide:** [Google Drive Link](https://drive.google.com/file/d/1E3ixrgAF4yPUkKMKcmjGaBJPf_jXIjUF/view?usp=sharing)

---

## 🔹 Features Overview

- **Zakat Calculator**: Supports multiple zakat types including income, savings, business, and saham (stocks), with accurate nisab and haul calculations.
- **Donation Gateway**: Allows users to donate towards verified causes through secure payment integrations.
- **Transparency Dashboard**: Displays real-time data on fund allocations and usage for maximum donor confidence.
- **User and Admin Panels**: Separate dashboards for general users and administrators to manage profiles, transactions, and campaigns.

---

## 📖 Project Directory Structure

```
ikhlas/
├── backend/                  # Python backend for ML-based APIs
│   ├── asnaf_eligibility_api.py    # API for eligibility assessment
│   ├── asnaf_housing_api.py        # API for housing condition analysis
│   ├── family_assistance_model.py  # ML model for family assistance
│   └── rural_classifier.h5         # Pre-trained housing classification model
│
└── client/
    └── src/
        ├── assets/              # Static assets (images, icons, fonts, etc.)
        ├── components/          # Reusable Vue components
        ├── lib/                 # External libraries or utility functions
        ├── router/              # Vue Router setup and route definitions
        ├── services/            # Services for API calls or external integrations
        ├── stores/              # State management (e.g., Vuex or Pinia stores)
        ├── views/               # Page-level Vue components (views/screens)
        ├── App.vue              # Root Vue component
        ├── firebase.config.js   # Firebase configuration file
        └── main.js              # Application entry point
```

---

## 🚀 Getting Started

### Requirements

- Node.js >= 18.x
- Python >= 3.8
- Firebase account for backend services
- A web browser and modern OS

### Frontend Installation

```bash
git clone https://github.com/irfpannn/ikhlas.git
cd ikhlas/client
npm install
npm run dev
```

Configure `firebase.config.js` with your Firebase project credentials.

### Backend Installation

The backend consists of two Flask APIs for eligibility assessment and housing condition analysis.

#### Setting up the Python environment

1. Create and activate a virtual environment:

```bash
cd ikhlas/backend
python -m venv venv

# For Windows
venv\Scripts\activate

# For Linux/MacOS
# source venv/bin/activate
```

2. Install the required dependencies:

```bash
pip install flask flask-cors pandas joblib tensorflow pillow numpy requests
```

#### Running the APIs

1. Start the Asnaf Eligibility API:

```bash
# Ensure you're in the backend directory
python asnaf_eligibility_api.py
```

The eligibility API will run on http://localhost:5000 by default.

2. Start the Asnaf Housing API (in a new terminal):

```bash
# Navigate to backend directory
cd ikhlas/backend

# Activate the virtual environment
venv\Scripts\activate

# Run the housing API
python asnaf_housing_api.py
```

The housing API will run on http://localhost:5001 by default.

> **Note:** Make sure both APIs are running simultaneously for full functionality of the platform.

---

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting / Netlify (configurable)
- **State Management**: Pinia (or Vuex if preferred)

---

## 📅 Roadmap (Planned Features)

- [ ] Multi-language Support (EN/MS/AR)
- [ ] Campaign Approval Workflow for Admins
- [ ] Donor Leaderboard and Impact Stories
- [ ] Notification System (Email + In-app)

---

## 💬 Contact

Developed with sincerity
Questions or feedback: **irfpann@gmail.com**

> "Give charity without delay, for it stands in the way of calamity." — Prophet Muhammad ﷲ ﷺ
