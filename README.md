# 🧠 MedAI — Full-Stack Medical AI Platform

A full-stack AI-powered chest X-ray diagnostic platform built with **FastAPI + React**. Features federated learning, GradCAM explainability, a RAG-powered medical chatbot, and a polished clinical dashboard.

---

## 🗂️ Project Structure

```
project/
├── backend/
│   ├── main.py               # FastAPI app — all routes
│   ├── utils/
│   │   ├── auth.py           # JWT creation & verification
│   │   ├── db.py             # MongoDB connection (pymongo)
│   │   ├── gradcam.py        # GradCAM heatmap generation
│   │   └── rag.py            # LangChain + Pinecone RAG pipeline
│   └── model/
│       └── federated_model.keras
│
└── frontend/
    └── src/
        ├── App.js                    # Routes + auth guards
        ├── styles/
        │   └── global.css            # Design tokens, fonts, animations
        ├── context/
        │   └── AuthContext.js        # Auth state, login/signup/logout
        ├── components/
        │   └── Layout.js             # Sidebar + page shell
        └── pages/
            ├── DashboardPage.js      # Stats overview + recent scans
            ├── XrayPage.js           # Upload, predict, GradCAM viewer
            ├── ChatPage.js           # RAG chatbot (ChatGPT-style)
            ├── HistoryPage.js        # Past scans with search & filter
            ├── FederatedPage.js      # Federated learning visualization
            ├── LoginPage.js          # Auth — sign in
            └── SignupPage.js         # Auth — create account
```

---

## ⚙️ Backend Setup

### Requirements

```bash
pip install fastapi uvicorn tensorflow opencv-python numpy \
            python-jose passlib pymongo python-dotenv \
            langchain langchain-openai langchain-pinecone \
            sentence-transformers pinecone-client
```

### Environment Variables

Create a `.env` file in the backend root:

```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
MONGO_URI=mongodb://localhost:27017
PINECONE_API_KEY=your-pinecone-key
OPENAI_API_KEY=your-openai-key
```

### Add `/auth/me` Endpoint

The frontend verifies the stored JWT on page refresh by calling `/auth/me`. Add this to `main.py`:

```python
@app.get("/auth/me")
def get_me(user = Depends(get_current_user)):
    return {"email": user["sub"]}
```

### Run the Backend

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API docs available at: `http://127.0.0.1:8000/docs`

### API Endpoints

| Method | Endpoint    | Auth | Description                          |
|--------|-------------|------|--------------------------------------|
| POST   | `/signup`   | ✗    | Register with email + password       |
| POST   | `/login`    | ✗    | Login, returns JWT access token      |
| GET    | `/auth/me`  | ✓    | Returns current user info            |
| POST   | `/predict`  | ✓    | Upload X-ray → prediction + GradCAM  |
| POST   | `/chat`     | ✓    | Ask RAG chatbot a medical question   |

---

## 🎨 Frontend Setup

### Requirements

```bash
npm install react-router-dom
```

> No other extra dependencies. All styling uses inline style objects with CSS variables — no Tailwind, no styled-components.

### Install & Run

```bash
cd frontend
npm install
npm start
```

App runs at: `http://localhost:3000`

### Important: index.js

Your `index.js` must wrap `<App />` in `<BrowserRouter>`. Do **not** add another `<BrowserRouter>` inside `App.js` (already handled):

```jsx
// index.js
import { BrowserRouter } from 'react-router-dom';

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

---

## 🖥️ Pages Overview

### `/` — Dashboard
- Greeting with time of day
- 4 stat cards: Total Scans, Abnormal, Normal, Detection Rate
- Quick-action links to all pages
- Recent scans table (last 5)
- Data sourced from `localStorage` (written by XrayPage after each prediction)

### `/xray` — X-Ray Analysis
- Drag-and-drop or click-to-browse file upload
- Calls `POST /predict` with the image
- Displays GradCAM heatmap overlay with toggle between Original / GradCAM views
- Saves result to `localStorage` for Dashboard and History pages
- Animated scan line during processing

### `/chat` — AI Chatbot
- ChatGPT-style message interface
- Calls `POST /chat` with the user's question
- RAG pipeline retrieves relevant medical documents from Pinecone
- Press **Enter** to send, **Shift+Enter** for a new line
- Typing indicator while waiting for response

### `/history` — Scan History
- Reads past scans from `localStorage`
- Search by filename
- Filter by: All / Normal / Abnormal
- Mini confidence bar per row
- Delete individual records or clear all

### `/federated` — Federated Learning
- Visual architecture diagram: Global Server ↔ 3 Hospitals
- Animated simulation mode (click "Run Simulation")
- 5-round training results with clickable AUC bar chart
- Differential privacy badges per hospital (ε values)
- Static visualization — no backend required

### `/login` & `/signup`
- Email + password authentication
- Tokens stored in `localStorage`
- Auto-redirects to Dashboard if already logged in
- Password show/hide toggle on login

---

## 🔐 Authentication Flow

```
User visits any protected route
        ↓
AuthContext reads token from localStorage
        ↓
Calls GET /auth/me to validate token
        ↓
Valid → set user state, allow access
Invalid → clear token, redirect to /login
```

All API calls include the token automatically:
```js
headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
```

---

## 🎨 Design System

All design tokens are defined in `src/styles/global.css` as CSS variables:

| Variable         | Value       | Usage                      |
|------------------|-------------|----------------------------|
| `--bg`           | `#070a0f`   | Page background            |
| `--card`         | `#0f1520`   | Card/panel background      |
| `--accent`       | `#00d4ff`   | Primary cyan accent        |
| `--green`        | `#00e5a0`   | Normal / success           |
| `--red`          | `#ff4d6a`   | Abnormal / error           |
| `--orange`       | `#ff8c42`   | Warning / detection rate   |
| `--font-head`    | Syne        | Headings, labels, buttons  |
| `--font-body`    | DM Sans     | Body text, inputs          |
| `--font-mono`    | JetBrains Mono | Stats, badges, code     |

Fonts are loaded from Google Fonts in `global.css`.

---

## 🧠 ML Model

- **Architecture**: DenseNet121 (transfer learning from ImageNet)
- **Classes**: No Finding, Effusion, Atelectasis, Cardiomegaly, Pneumothorax
- **Explainability**: GradCAM via `conv5_block16_concat` layer
- **Input**: 224×224 RGB image, normalized to [0, 1]
- **Output**: Class label + confidence score + base64 GradCAM overlay

Model file expected at: `model/federated_model.keras`

---

## 💬 RAG Chatbot

- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (HuggingFace)
- **Vector DB**: Pinecone (index name: `medical-chatbot`)
- **LLM**: GPT-4o via LangChain
- **Retrieval**: Top 3 most similar document chunks (cosine similarity)
- **Prompt**: Medical assistant — concise answers, max 3 sentences

---

## 🔗 Federated Learning

The federated page is a **frontend-only visualization** of the training process. It shows:

- 3 participating hospitals training locally with differential privacy
- FedAvg aggregation on a central server
- AUC improvement across 5 rounds: **0.71 → 0.86**
- No raw patient data is shared — only model gradients

To connect real federated training metrics, replace the `ROUNDS` constant in `FederatedPage.js` with an API call to a `/federated/stats` endpoint.

---

## 🚀 Deployment Notes

- Set `CORS` origins in `main.py` to your production frontend URL (currently allows `*`)
- Store `SECRET_KEY` as an environment variable, never hardcode it
- Consider adding a `/history` backend endpoint (SQLite or MongoDB) to persist scan history server-side instead of `localStorage`
- The model loads on startup — use 1 Uvicorn worker to avoid loading it multiple times

---

## 📦 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | FastAPI, Uvicorn, Python 3.10+                  |
| ML         | TensorFlow / Keras, OpenCV, NumPy               |
| Auth       | JWT (python-jose), bcrypt (passlib)             |
| Database   | MongoDB (pymongo)                               |
| RAG        | LangChain, Pinecone, HuggingFace, OpenAI GPT-4o |
| Frontend   | React 18, React Router v6                       |
| Styling    | CSS Variables + inline style objects            |
| Fonts      | Syne, DM Sans, JetBrains Mono (Google Fonts)    |
