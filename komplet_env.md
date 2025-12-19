# Root Environment Variables (used by Docker Compose)

# PostgreSQL Configuration (used by Docker Compose)
POSTGRES_USER=sportbuddy
POSTGRES_PASSWORD=sportbuddy123
POSTGRES_DB=sportbuddy

# Database URL (used by Backend/Prisma)
DATABASE_URL="postgresql://sportbuddy:sportbuddy123@postgres:5432/sportbuddy?schema=public"

# Better Auth Configuration
# Generate a random 32+ character secret for production: openssl rand -base64 32
BETTER_AUTH_SECRET="change-this-to-a-random-secret-in-production-min-32-chars"

# Backend URL (used for Better Auth callbacks)
BETTER_AUTH_URL="http://localhost:3001"

# Frontend Configuration
# Frontend URL (used for password reset emails and external links)
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"

# API URL for frontend to communicate with backend
# Use http://localhost:3001 - Frontend is client-side, runs in browser
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Google Maps API Key (for location picker)
# Get API key from: https://console.cloud.google.com/google/maps-apis
# Enable: Places API, Maps JavaScript API, Geocoding API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyCOpU_MXJ3ZBec9yqiNsJQnGIGYo6i76Mk"

# Brevo Email Service (for password reset emails)
# Get API key from: https://app.brevo.com/settings/keys/api
# Leave empty for development mode (emails logged to console)
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL="j48876120@gmail.com"
# OAuth Providers (Optional - configure only if you want to enable OAuth)
# Google OAuth: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth: https://developers.facebook.com/apps/
# Create an app, go to Settings > Basic, copy App ID and App Secret
# Add OAuth redirect URI: http://localhost:3001/api/auth/callback/facebook (dev)
# For production: https://yourdomain.com/api/auth/callback/facebook
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Apple OAuth: https://developer.apple.com/account/resources/identifiers/list/serviceId
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""

# Ollama AI Configuration (Local AI - FREE!)
# Ollama runs locally on your machine - no API key needed
# Use host.docker.internal to access Ollama from Docker containers
OLLAMA_BASE_URL="http://host.docker.internal:11434/v1"
OLLAMA_MODEL="llama3.2"
GEMINI_API_KEY="AIzaSyAF8EGs8S06L9YHk-lFJdK03BWXHGIe-h4"

# Optional: Custom timezone (default: Europe/Bratislava)
TZ="Europe/Bratislava"

# Web Push VAPID Keys (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY="BAsUFsZehWk0Sfh6z5HySDwY3izp-soYxQXzec_tFr4sFCxd5xZ-_wx5gFYcOKo9Fnc24xfmQV1LbAL489IxTlA"
VAPID_PRIVATE_KEY="1PrGAHyRz5_4c-nu9e8BL-J3AYxzAl4bnl54kOMXCpw"
VAPID_SUBJECT="mailto:malinovsky.jan03@gmail.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BAsUFsZehWk0Sfh6z5HySDwY3izp-soYxQXzec_tFr4sFCxd5xZ-_wx5gFYcOKo9Fnc24xfmQV1LbAL489IxTlA"