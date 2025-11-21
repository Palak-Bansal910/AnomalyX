module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**File: .gitignore**
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.env
.venv

# Database
*.db
*.sqlite3
satellite_demo.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Node / Next.js
dashboard/node_modules/
dashboard/.next/
dashboard/out/
dashboard/.env.local
dashboard/.env.development.local
dashboard/.env.test.local
dashboard/.env.production.local
dashboard/.vercel

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db
```

**File: backend/requirements.txt**
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
python-dotenv==1.0.0
requests==2.31.0
```

**File: backend/.env.example**
```
# Database
DB_URL=sqlite:///./satellite_demo.db

# Alert Channels (Optional)
SLACK_WEBHOOK_URL=
ALERT_EMAIL_HOST=
ALERT_EMAIL_PORT=587
ALERT_EMAIL_USER=
ALERT_EMAIL_PASS=
ALERT_EMAIL_TO=

# NASA Data
NASA_DATA_FILE=./data/nasa_telemetry.json