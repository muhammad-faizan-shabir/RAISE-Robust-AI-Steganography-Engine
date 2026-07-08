# RAISE Backend

**Robust AI Steganography Engine** - Backend API built with FastAPI, PostgreSQL, Redis, and Celery.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL 14
- **Message Broker**: Redis
- **Task Queue**: Celery
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Steganography**: SteganoGAN
- **Python Version**: 3.7 (required for SteganoGAN compatibility)

## Project Structure

```
raise-backend/
├── app/
│   ├── api/              # API endpoints
│   │   └── v1/          # API version 1
│   ├── celery_app/      # Celery worker and tasks
│   ├── core/            # Core configuration
│   ├── models/          # Database models
│   ├── schemas/         # Pydantic schemas
│   └── services/        # Business logic
├── alembic/             # Database migrations
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker services
└── requirements.txt     # Python dependencies
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RAISE-Robust-AI-Steganography-Engine/raise-backend.git
   cd raise-backend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values:
   - Set secure passwords for `DB_PASSWORD`
   - Generate a secure `SECRET_KEY` (use `openssl rand -hex 32`)
   - Update Supabase credentials (when ready)

3. **Build and start services**
   ```bash
   docker-compose up --build
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec api alembic upgrade head
   ```

5. **Install Stable Diffusion dependencies (first time only)**
   ```bash
   docker-compose exec api pip install httpx==0.23.3 aiofiles==0.8.0
   docker-compose exec worker pip install httpx==0.23.3 aiofiles==0.8.0
   docker-compose restart api worker
   ```
   
6. **Configure AI Horde API Key (optional)**
   Add to `.env` file:
   ```
   AI_HORDE_API_KEY=your_api_key_here
   ```
   Get a free API key at: https://stablehorde.net/register
   
7. **Access the API**
   - API: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc
   
   See [STABLE_DIFFUSION_SETUP.md](STABLE_DIFFUSION_SETUP.md) for detailed usage examples.

## Development

### Running the Application

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f worker

# Stop services
docker-compose down
```

### Database Migrations

```bash
# Create a new migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec api alembic upgrade head

# Rollback last migration
docker-compose exec api alembic downgrade -1
```

### Accessing Containers

```bash
# Access API container
docker-compose exec api bash

# Access database
docker-compose exec db psql -U raise_user -d raise_db

# Access Redis CLI
docker-compose exec redis redis-cli
```

## API Endpoints

### Authentication (Stub)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user

### Users (Stub)
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user

### Steganography
- `POST /api/v1/stego/generate` - Generate steganography-optimized cover image (AI Horde)
- `POST /api/v1/stego/embed` - Embed message in image
- `POST /api/v1/stego/extract` - Extract message from image
- `GET /api/v1/stego/jobs/{job_id}` - Get job status
- `GET /api/v1/stego/download/{job_id}` - Download result image

### Notifications (Stub)
- `GET /api/v1/notifications/` - Get user notifications

## Database Schema

### Tables

- **users**: User information and authentication
- **sessions**: User session tokens
- **activity_logs**: User activity tracking
- **notifications**: User notifications

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables

- `DATABASE_URL`: PostgreSQL connection string
- `CELERY_BROKER_URL`: Redis broker URL
- `SECRET_KEY`: JWT secret key
- `SUPABASE_URL`: Supabase project URL (future)
- `SUPABASE_KEY`: Supabase API key (future)

## Features

### ✅ Completed
- **SteganoGAN Integration**: Embed and extract secret messages in images
- **Stable Diffusion Integration**: Generate steganography-optimized cover images via AI Horde API
- **Async Job Processing**: Celery-based task queue for long-running operations
- **Job Status Tracking**: Real-time progress updates for generation and steganography tasks

### 🚧 Next Steps

1. **Implement Authentication**: Integrate Supabase JWT authentication
2. **File Management**: Implement permanent file storage (currently using temp directories)
3. **Notifications**: Implement real-time notifications
4. **Testing**: Add unit and integration tests
5. **Documentation**: Expand API documentation
6. **Image Quality Metrics**: Add PSNR/SSIM scoring for steganography quality assessment

## Important Notes

### Dependency Resolution

The `requirements.txt` is carefully structured to avoid dependency conflicts:

1. **SteganoGAN is listed first** (v0.1.3) - This ensures its dependencies, particularly `pydantic`, are installed with the correct versions
2. **No explicit pydantic version** - SteganoGAN controls the pydantic version to avoid conflicts
3. **Version ranges used** - Most packages use version ranges (e.g., `>=1.4.0,<1.5.0`) instead of fixed versions for better compatibility
4. **No pydantic-settings** - In pydantic v1.x (used by SteganoGAN), `BaseSettings` is part of the main pydantic package

If you encounter dependency conflicts during installation, ensure you're installing packages in the order listed in `requirements.txt`.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps

# View database logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up --build
```

### Celery Worker Not Starting

```bash
# Check worker logs
docker-compose logs worker

# Restart worker
docker-compose restart worker
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

