# Setup Guide for NexaAI

This guide will help you set up the NexaAI project on your local machine.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/devvspark/NexaAi.git
   cd NexaAi
   ```

2. **Set up the backend**
   ```bash
   cd server2
   npm install
   # Create .env file (see Backend Environment Variables below)
   npm run server
   ```

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd client2
   npm install
   # Create .env file (see Frontend Environment Variables below)
   npm run dev
   ```

## Environment Variables Setup

### Backend Environment Variables (`server2/.env`)

Create a `.env` file in the `server2` directory with the following content:

```env
# Server Port
PORT=3000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=your_neon_database_connection_string

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI API Keys
GEMINI_API_KEY=your_google_gemini_api_key
CLIPDROP_API_KEY=your_clipdrop_api_key

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Frontend Environment Variables (`client2/.env`)

Create a `.env` file in the `client2` directory with the following content:

```env
# Backend API Base URL
VITE_BASE_URL=http://localhost:3000

# Clerk Authentication (Publishable Key)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Getting API Keys

### 1. Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up or log in
3. Create a new application
4. Navigate to **API Keys** section
5. Copy:
   - **Publishable Key** → Use in `client2/.env` as `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → Use in `server2/.env` as `CLERK_SECRET_KEY`

### 2. Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the API key
5. Use it in `server2/.env` as `GEMINI_API_KEY`

### 3. Cloudinary

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Sign up for a free account
3. After logging in, you'll see your dashboard
4. Copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### 4. Neon Database

1. Visit [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project
4. Go to **Connection Details**
5. Copy the connection string
6. Use it in `server2/.env` as `DATABASE_URL`

### 5. Clipdrop API

1. Visit [Clipdrop API](https://clipdrop.co/api)
2. Sign up for an account
3. Navigate to API keys section
4. Copy your API key
5. Use it in `server2/.env` as `CLIPDROP_API_KEY`

## Verification Steps

After setting up all environment variables:

1. **Verify Backend:**
   - Start the server: `cd server2 && npm run server`
   - You should see: "Server is running on port 3000"
   - Visit `http://localhost:3000` - should see "Server is live"

2. **Verify Frontend:**
   - Start the client: `cd client2 && npm run dev`
   - You should see the local development URL (usually `http://localhost:5173`)
   - Open the URL in your browser
   - You should see the NexaAI homepage

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the `PORT` in `server2/.env` to a different port (e.g., 3001)
   - Update `VITE_BASE_URL` in `client2/.env` accordingly

2. **CORS errors:**
   - Ensure the backend is running
   - Check that `VITE_BASE_URL` in frontend matches your backend URL

3. **Authentication errors:**
   - Verify Clerk keys are correct
   - Ensure both publishable and secret keys are from the same Clerk application

4. **Database connection errors:**
   - Verify your Neon database URL is correct
   - Check if your database is active in Neon console

5. **Image upload errors:**
   - Verify Cloudinary credentials
   - Check file size limits

## Next Steps

Once everything is set up:
1. Register a new account through the Clerk authentication
2. Explore the dashboard
3. Try generating content with the AI tools
4. Check out the community features

## Need Help?
Message at-7387899429

