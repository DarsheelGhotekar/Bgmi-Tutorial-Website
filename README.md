# Interactive BGMI Guide & Performance Optimizer

A premium gaming-themed landing page and utility hub for **Battlegrounds Mobile India**. 

🚀 **[LIVE DEMO]** once you enable GitHub Pages (see below), your website is viewable directly at:
**`https://<your-username>.github.io/<your-repository-name>/`**

---

## Key Features
1. **Device Settings Optimizer**: Input your hardware specs (RAM and Processor Tier) to receive immediate recommended graphics levels, target FPS frames, gyroscope sensitivity mappings, and thermal control tips.
2. **Dynamic Tip Filtering**: Categorized pro tips (Combat, Performance, Settings) loaded dynamically from backend APIs, featuring interactive tabs.
3. **Active Redeem Codes Portal**: A list of codes synced from the server, featuring a one-click copy helper that changes state visually on success.
4. **Download Redirection & Analytics**: Logs download requests to database tables or in-memory stores and updates hits tickers in real-time.
5. **Interactive Feedback Desk**: A contact portal with form checks that transmits support queries directly to server logs.
6. **Robust Offline Fallback**: If no backend is currently running, the application gracefully flags the offline state and resolves everything client-side. You can double-click `public/index.html` to run it directly!

---

## Directory Structure

```
"New Project"/
├── public/                  # Static Frontend Files (Shared)
│   ├── index.html           # Main markup structure (ARIA-annotated, responsive)
│   ├── style.css            # Cybernetic gaming styling sheets & animations
│   └── app.js               # Event-listeners, fetch requests, & offline fallbacks
├── server.js                # Node.js Express server logic (Port: 5000)
├── package.json             # Node.js project configuration & dependencies
├── database.json            # Local JSON database for Node.js (seed records)
└── java-backend/            # Java Spring Boot backend project (Port: 8080)
    ├── pom.xml              # Maven dependencies configuration
    └── src/main/
        ├── java/com/bgmi/guide/
        │   ├── BgmiGuideApplication.java     # Entry application initializer
        │   ├── controller/
        │   │   └── BgmiApiController.java    # REST API Controllers (CORS enabled)
        │   ├── model/                        # Java Model classes (Tip, Feedback, etc.)
        │   └── service/
        │       └── OptimizationService.java  # Hardware calculator logic
        └── resources/
            └── application.properties        # Server options (points resources to "../public")
```

---

## Option 1: Node.js (Express) Server (Port 5000)

The Node.js server uses a portable file-based JSON database (`database.json`) to persist feedback logs and download hit logs without requiring external database setups.

### Setup & Run
1. If not already installed, download and install [Node.js](https://nodejs.org/).
2. Open terminal in the project directory and install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *Alternative production script:* `npm start`
4. Access the application in your browser at:
   ```text
   http://localhost:5000
   ```

---

## Option 2: Java (Spring Boot) Server (Port 8080)

The Java backend provides a robust microservice architecture using Spring Boot. It uses an in-memory runtime store for logs. It is configured to automatically serve the frontend files from the shared `../public` folder.

### Setup & Run
1. If not already installed, install **Java JDK 17 or higher** and **Apache Maven**.
2. Open terminal inside the `java-backend` subdirectory:
   ```bash
   cd java-backend
   ```
3. Start the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
4. Access the application in your browser at:
   ```text
   http://localhost:8080
   ```

---

## REST API Specification

Both backend architectures support identical endpoints:

| Method | Endpoint | Description | Payload / Query |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tips` | Fetch expert tips | Query: `?category=combat` (or `settings`, `performance`, `all`) |
| **GET** | `/api/codes` | Fetch active redeem codes | None |
| **POST** | `/api/optimize` | Compute hardware configs | Body: `{ "ram": "8", "soc": "high" }` |
| **POST** | `/api/feedback` | Post contact support request | Body: `{ "name": "...", "email": "...", "message": "..." }` |
| **GET** | `/api/downloads` | Retrieve click counters | None |
| **POST** | `/api/downloads/:type` | Log hit & redirect | Path: `playstore` or `apk` |

---

## Customizing Resources
To change default tips or redeem codes:
- **For Node.js**: Simply edit the values inside the local `database.json` file.
- **For Java**: Modify the seed initializers inside `java-backend/src/main/java/com/bgmi/guide/controller/BgmiApiController.java`.
- **For Offline Client-Side Mode**: Adjust the values of the `FALLBACK_TIPS` and `FALLBACK_CODES` constants in the top lines of `public/app.js`.
