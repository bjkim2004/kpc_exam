# AI Assessment Platform - 생성형 AI 활용 역량평가 시스템

Full-stack application for assessing AI competency with Next.js, FastAPI, PostgreSQL, and real AI API integration.

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **Supabase (PostgreSQL)** - Database
- **OpenAI API** - ChatGPT integration
- **Anthropic API** - Claude integration
- **Google Gemini API** - Gemini integration (Default)
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client

## Features

- 🔐 **Authentication System** - JWT-based login/registration
- 📝 **8 Question Types** - Multiple choice, prompt design, fact-checking, ethical review, etc.
- 🤖 **AI Integration** - Real-time ChatGPT, Claude, and Gemini API calls with usage limits
- ⏱️ **Timer Management** - 120-minute exam timer with auto-save
- 📊 **Admin Dashboard** - User management, exam grading, analytics
- 💾 **Auto-save** - Answers automatically saved every few seconds
- 🎨 **Professional UI** - Korean government/enterprise-style design system

## Quick Start (Windows)

### Prerequisites

- **Python 3.11+** - [Download](https://www.python.org/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- Google Gemini API Key (recommended, default AI provider)
- OpenAI API Key (optional, for ChatGPT features)
- Anthropic API Key (optional, for Claude features)

### Setup

1. **Initial Setup**

Run the setup script to install dependencies:
```cmd
setup.bat
```

This will:
- Check system requirements
- Install backend dependencies (Python packages)
- Install frontend dependencies (npm packages)
- Create environment configuration files

2. **Configure Supabase Database**

Edit `backend\.env` file:

```env
# Supabase Database URL
DATABASE_URL=postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# AI API Keys
GEMINI_API_KEY=AIzaSy-your-gemini-api-key  # Default provider
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Default AI Provider (gemini, openai, anthropic)
DEFAULT_AI_PROVIDER=gemini

# Security (generate a secure key for production)
SECRET_KEY=your-secret-key-change-in-production
```

**Note**: Get your Supabase connection string from:
- Supabase Dashboard → Settings → Database → Connection String (Transaction mode)

3. **Run the Application**

```cmd
# Start both backend and frontend servers
start_all.bat

# Or start individually:
start_backend.bat  # FastAPI on port 8000
start_frontend.bat # Next.js on port 3000
```

4. **Access the application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Stop the Application

```cmd
stop_all.bat
```

### Initial Setup

1. **Register a new account**
   - Go to http://localhost:3000/register
   - Enter email, exam number (e.g., 2024001), and password
   - Login with your credentials

2. **Start the exam**
   - Click "시험 시작하기"
   - Navigate through 8 questions
   - Use AI tools (if API keys are configured)
   - Submit when complete

### Admin Access

To create an admin user, run this SQL query in Supabase SQL Editor:

```sql
UPDATE kpc_users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then access admin dashboard at: http://localhost:3000/admin

## Development

### Backend Development

```cmd
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations (Supabase)
alembic upgrade head

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Or simply run**: `start_backend.bat`

### Frontend Development

```cmd
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Or simply run**: `start_frontend.bat`

## Project Structure

```
kpc/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── core/          # Configuration, security
│   ├── alembic/           # Database migrations
│   ├── requirements.txt   # Python dependencies
│   ├── env.example        # Environment template
│   └── seed_questions.py  # Initial data seeding
├── frontend/              # Next.js frontend
│   ├── app/              # Pages and routes
│   ├── components/       # React components
│   ├── lib/             # Utilities, stores, API client
│   └── package.json     # Node dependencies
├── start_backend.bat    # Start backend server
├── start_frontend.bat   # Start frontend server
├── start_all.bat        # Start both servers
├── stop_all.bat         # Stop all servers
└── setup.bat            # Initial setup script
```

## Question Types

1. **Multiple Choice** - Basic AI concept understanding
2. **Comprehension** - AI model explanations
3. **Prompt Design** - Few-shot learning prompt creation
4. **Application** - Real-world scenario application
5. **Fact Checking** - Verify AI-generated content
6. **Critical Analysis** - Analyze AI response limitations
7. **Ethical Review** - Identify ethical issues
8. **Case Study** - Comprehensive ethical judgment

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Exams
- `POST /api/exams/start` - Start exam
- `GET /api/exams/{id}` - Get exam details
- `PATCH /api/exams/{id}/timer` - Update timer
- `POST /api/exams/{id}/submit` - Submit exam

### Questions
- `GET /api/questions` - List all questions
- `GET /api/questions/{id}` - Get question details

### Answers
- `POST /api/answers` - Save answer
- `GET /api/answers/{exam_id}/{question_id}` - Get answer

### AI Integration
- `POST /api/ai/chatgpt` - ChatGPT request
- `POST /api/ai/claude` - Claude request
- `POST /api/ai/verify` - Fact checking

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/exams` - List exams
- `POST /api/admin/grade/{exam_id}` - Grade exam

## Database Schema (Supabase)

- **kpc_users** - User accounts
- **kpc_exams** - Exam sessions
- **kpc_questions** - Question bank
- **kpc_question_content** - Question details
- **kpc_answers** - User answers
- **kpc_ai_usage** - AI tool usage logs
- **kpc_admin_users** - Admin accounts

**Note**: All tables use `kpc_` prefix to avoid conflicts with other Supabase projects.

## Configuration

### AI Usage Limits
- Default: 10 AI requests per question
- Configurable in `backend/app/core/config.py`

### Exam Duration
- Default: 120 minutes (7200 seconds)
- Configurable in exam creation

### Security
- JWT tokens expire after 15 minutes
- Refresh tokens last 7 days
- Passwords hashed with bcrypt

## Deployment

### Production Considerations

1. **Security**
   - Change SECRET_KEY to a strong random value
   - Use HTTPS
   - Configure CORS properly
   - Enable Supabase Row Level Security (RLS)

2. **Database (Supabase)**
   - Already managed and backed up
   - Connection pooling included
   - Monitor database usage in Supabase dashboard
   - Consider upgrading to a paid plan for production

3. **AI APIs**
   - Monitor usage and costs
   - Implement rate limiting
   - Handle API errors gracefully
   - Set spending limits in OpenAI/Anthropic dashboards

4. **Frontend**
   - Build for production: `npm run build`
   - Deploy to Vercel, Netlify, or similar
   - Use CDN for static assets
   - Enable caching

5. **Backend**
   - Deploy to Heroku, Railway, or similar
   - Set environment variables securely
   - Enable logging and monitoring

## License

Proprietary - Korean Information and Communication Technology Association

## Support

For issues and questions, please contact the development team.


