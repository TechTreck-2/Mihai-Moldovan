# Deployment Configuration

## GitHub Secrets Required

To deploy this application, you need to configure the following secrets in your GitHub repository:

### Go to: Settings → Secrets and variables → Actions → Repository secrets

1. **RAILWAY_TOKEN** - Your Railway authentication token
   - Get this from Railway Dashboard → Account Settings → Tokens

2. **JWT_SECRET** - Secret key for JWT token signing
   - Generate a strong random string (e.g., `openssl rand -base64 32`)
   - Example: `your-super-secret-jwt-key-here`

3. **DB_HOST** - Database host
   - Your PostgreSQL database host
   - Example: `aws-0-eu-central-1.pooler.supabase.com`

4. **DB_PORT** - Database port
   - Usually `5432` for PostgreSQL or `6543` for connection pooling

5. **DB_USERNAME** - Database username
   - Your PostgreSQL username
   - Example: `postgres.projectname`

6. **DB_PASSWORD** - Database password
   - Your PostgreSQL password

7. **DB_DATABASE** - Database name
   - Usually `postgres` for Supabase or your custom database name

## Repository Variables

Additionally, set this repository variable:

### Go to: Settings → Secrets and variables → Actions → Variables

1. **BACKEND_URL** - The URL where your backend will be deployed
   - Example: `https://your-app-name.railway.app`
   - This is used to configure the frontend

## Railway Configuration

Make sure your Railway project has the same environment variables configured:
- JWT_SECRET
- JWT_EXPIRES_IN (set to "24h")
- DB_TYPE (set to "postgres")
- DB_HOST
- DB_PORT
- DB_USERNAME
- DB_PASSWORD
- DB_DATABASE
- NODE_ENV (set to "production")

## Security Notes

- Never commit actual secrets to your repository
- Use strong, unique values for JWT_SECRET
- Ensure your database credentials are secure
- The `.env` file in the backend directory should not be committed to production repositories
