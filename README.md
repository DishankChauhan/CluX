# AI Clip Curator

<img width="2808" height="1760" alt="clux landing page" src="https://github.com/user-attachments/assets/edd32655-3150-41b3-9d54-83c8c2ff502a" />

🎬 AI-powered video clip curator for personal videos with transcription, semantic search, and auto-generated highlights.


## ✨ Features

### Phase 1: Foundation & Core Infrastructure ✅
- **Modern UI**: Clean, responsive interface built with Next.js 14 and Tailwind CSS
- **User Authentication**: Secure login/signup with NextAuth.js
- **Video Upload**: Drag-and-drop video upload with progress tracking
- **Database**: PostgreSQL with Prisma ORM for data management
- **File Storage**: Local file system with planned cloud storage support

### Phase 2: AI Video Processing 🚀 (Current)
- **Smart Transcription**: AI-powered speech-to-text using OpenAI Whisper
- **Auto Highlights**: AI automatically identifies key moments and decisions
- **Background Processing**: Scalable job queue system with Redis and Bull
- **Video Analysis**: Metadata extraction, thumbnail generation, and optimization
- **Search Ready**: Text-based search with semantic search foundations

### Phase 3: Advanced Features 🔮 (Planned)
- **Semantic Search**: Vector-based similarity search across video content
- **Speaker Diarization**: Identify and separate different speakers
- **Real-time Sync**: Live transcript highlighting during video playback
- **Advanced Analytics**: Content insights and viewing patterns
- **API Access**: RESTful API for third-party integrations

## 🚀 Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with pgvector for embeddings
- **AI**: OpenAI Whisper, GPT-4, Embeddings API
- **Queue**: Redis + Bull for background job processing
- **Video Processing**: FFmpeg, Video.js
- **Infrastructure**: Docker, Docker Compose

## 🎯 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- OpenAI API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DishankChauhan/CluX
   cd ai-clip-curator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the services**
   ```bash
   # Start database and Redis
   docker-compose up postgres redis -d
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

6. **Test Phase 2 setup**
   ```bash
   npm run test:phase2
   ```

7. **Start the application**
   ```bash
   # Terminal 1: Start the main app
   npm run dev
   
   # Terminal 2: Start the AI worker (for Phase 2)
   npm run worker:dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Development

### Project Structure

```
src/
├── app/                 # Next.js 14 app directory
│   ├── dashboard/       # Dashboard pages
│   ├── api/            # API routes
│   └── auth/           # Authentication pages
├── components/         # Reusable components
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

### Database Schema

The application uses Prisma with PostgreSQL and includes:

- **Users**: Authentication and preferences
- **Videos**: Video metadata and processing status
- **Transcripts**: AI-generated transcriptions with segments
- **Highlights**: Auto-generated and user-created highlights
- **Bookmarks**: User bookmarks with timestamps
- **Embeddings**: Vector embeddings for semantic search

### API Endpoints

- `POST /api/upload` - Upload video files
- `POST /api/auth/*` - NextAuth.js authentication
- `GET /api/videos` - List user videos
- `POST /api/search` - Semantic search across videos

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_clip_curator"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI Services
OPENAI_API_KEY="your-openai-api-key"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="500000000"  # 500MB
```

### Supported Video Formats

- MP4
- AVI  
- MOV
- WMV
- WebM

Maximum file size: 500MB (configurable)

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Roadmap

- [x] Basic video upload and storage
- [x] User authentication
- [x] Dashboard UI
- [ ] AI transcription integration
- [ ] Semantic search implementation
- [ ] Highlight detection
- [ ] Video player with transcript sync
- [ ] Mobile app support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support, please open an issue in the GitHub repository.
