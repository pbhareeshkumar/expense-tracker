# Expense Tracker

A personal full-stack expense tracking web app built with Flask and PostgreSQL, 
deployed on Render and Netlify.

## What it does

- Add expenses with amount, category, date, and note
- Quick-add amount buttons (+5, +10, +20, +50, +100, +500) for faster entry
- Quick-add default category buttons (customizable, saved in browser local storage)
- Edit and delete expenses with confirmation
- View total spent and category-wise breakdown
- Set a monthly budget with a live progress bar (green → orange → red)
- All data persists in a PostgreSQL database hosted on Render

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| Database | PostgreSQL (hosted on Render) |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Render (backend), Netlify (frontend) |

## How to run locally

```bash
# Clone the repo
git clone https://github.com/pbhareeshkumar/expense-tracker.git
cd expense-tracker

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set your database URL as an environment variable
export DATABASE_URL="your_postgresql_url_here"

# Copy the example config and add your backend URL
cp config-example.js config.js
# Then edit config.js with your actual backend URL


# Run the backend
python3 app.py
```

Then open `index.html` via a local server:
```bash
python3 -m http.server 5500
```

Visit `http://localhost:5500/index.html`

## What I learned

- Building a REST API with Flask (GET, POST, PUT, DELETE endpoints)
- Connecting a backend to a PostgreSQL database
- How browsers and servers communicate (fetch, JSON, CORS)
- Deploying a full-stack app with separate frontend and backend services
- Debugging real issues: CORS errors, host/port binding, data persistence

## Notes

This is a personal expense tracker — the live deployment is for personal use 
only and is not publicly shared to protect financial data.

##
Author - PB
