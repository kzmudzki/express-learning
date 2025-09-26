# Express.js Learning Project with TypeScript

A comprehensive Express.js API built with TypeScript, featuring database integration, web interface, and modern development practices. Perfect for learning backend development fundamentals.

## 🚀 Features

- **Modern Express.js API** with TypeScript
- **Database Integration** using Prisma ORM + SQLite
- **Web Interface** with EJS templating
- **Robust Architecture** with controllers, services, and middleware
- **Request Validation** using Joi
- **Comprehensive Error Handling** with custom error classes
- **Security Middleware** (Helmet, CORS)
- **Development Tools** with hot-reloading and database visualization

## 🛠️ Technologies Used

- **Backend**: Express.js, TypeScript
- **Database**: SQLite with Prisma ORM
- **Templating**: EJS (Embedded JavaScript)
- **Validation**: Joi
- **Security**: Helmet, CORS
- **Development**: ts-node-dev, Prisma Studio
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd express-learning-simple
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file (already exists)
   DATABASE_URL="file:./prisma/dev.db"
   NODE_ENV="development"
   PORT=3000
   ```

4. **Initialize the database**

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Development Server

- **API Server**: http://localhost:3000
- **Web Interface**: http://localhost:3000/web
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

### Available Scripts

```bash
npm run dev          # Start development server with hot-reloading
npm run build        # Build for production
npm start            # Start production server
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database and re-seed
```

## 🌐 API Endpoints

### JSON API (REST)

- `GET /api/v1/health` - Health check
- `GET /api/v1/health/detailed` - Detailed health information
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Web Interface (HTML)

- `GET /web` - Home page
- `GET /web/users` - Users management page
- `GET /web/users/:id` - User detail/edit page
- `GET /web/health` - System health page
- `POST /web/users/create` - Create user (form)
- `POST /web/users/:id/update` - Update user (form)
- `POST /web/users/:id/delete` - Delete user (form)

## 📁 Project Structure

```
express-learning-simple/
├── src/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Custom middleware
│   ├── routes/          # API and web routes
│   ├── services/        # Database operations
│   ├── utils/           # Validation and utilities
│   ├── lib/             # External library configurations
│   ├── types/           # TypeScript type definitions
│   ├── config/          # Environment configuration
│   └── index.ts         # Application entry point
├── views/               # EJS templates
├── prisma/              # Database schema and migrations
├── docs/                # Learning documentation
└── dist/                # Compiled JavaScript (production)
```

## 🎓 Learning Resources

This project includes comprehensive documentation for learning:

- **[Express Learning Guide](EXPRESS_LEARNING_GUIDE.md)** - Core concepts and architecture
- **[Database Learning Guide](DATABASE_LEARNING_GUIDE.md)** - Prisma, SQLite, and database patterns
- **[Hands-on Exercises](HANDS_ON_EXERCISES.md)** - Practical coding challenges
- **[API Overview](API_OVERVIEW.md)** - Complete API documentation
- **[Documentation Index](DOCUMENTATION_INDEX.md)** - Learning path guide

## 🔧 Development Workflow

1. **Make changes** to your code
2. **Server auto-restarts** thanks to ts-node-dev
3. **Test endpoints** using:
   - Web interface at `/web`
   - API endpoints at `/api/v1/`
   - Prisma Studio for database visualization
4. **View logs** in terminal for debugging

## 🧪 Testing the API

### Using curl (Command Line)

```bash
# Get all users
curl http://localhost:3000/api/v1/users

# Create a new user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Get user by ID
curl http://localhost:3000/api/v1/users/1
```

### Using the Web Interface

Visit http://localhost:3000/web for a user-friendly interface to:

- View all users
- Create new users
- Edit existing users
- Delete users
- Check system health

## 🐛 Common Issues

### Database Issues

```bash
# Reset database if corrupted
npm run db:reset

# Check database with Prisma Studio
npx prisma studio
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Port Already in Use

```bash
# Kill process using port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

## 🤝 Contributing

This is a learning project, but feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📚 What You'll Learn

- Express.js fundamentals and middleware
- TypeScript in backend development
- Database modeling with Prisma
- RESTful API design
- Error handling and validation
- Security best practices
- MVC architecture patterns
- Environment-based configuration

## 📄 License

This project is for educational purposes. Feel free to use it for learning and personal projects.

---

**Happy Learning! 🎉**

For questions or issues, check the documentation files or create an issue in the repository.
