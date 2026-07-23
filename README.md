# How to Start Tremble

To start the Tremble application, you will need to open **two separate terminal windows** (one for the backend and one for the frontend). 

Here is the step-by-step process:

### Step 1: Start your Database Server
Before running any code, make sure your MySQL database is active.
- Open **XAMPP Control Panel**.
- Click **Start** next to the **MySQL** module.

### Step 2: Initialize the Database (One-time setup / Resets)
*Note: You only need to run this command if you are setting up the project on a new computer, or if you want to wipe the database clean and recreate the tables.*
- Open a terminal and navigate to the backend folder:
  ```bash
  cd C:\tremble\backend
  ```
- Run the initialization script:
  ```bash
  python init_db.py
  ```

### Step 3: Start the Python Backend
The backend needs to be running so your frontend can fetch songs, users, and trending data.
- In your terminal, navigate to the backend folder (if you aren't already there):
  ```bash
  cd C:\tremble\backend
  ```
- Start the FastAPI server using Uvicorn:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
  ```
- *Keep this terminal window open and running!*

### Step 4: Start the Next.js Frontend
Now you need to start the actual website UI.
- Open a **new, second terminal window**.
- Navigate to the frontend folder:
  ```bash
  cd C:\tremble\frontend
  ```
- Start the Next.js development server:
  ```bash
  npm run dev
  ```
- *Keep this terminal window open and running!*

### Step 5: Open the Website
Once both the backend and frontend are running, open your web browser and go to:
👉 **http://localhost:3000**