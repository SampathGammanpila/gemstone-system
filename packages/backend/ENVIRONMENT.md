# Environment Variables Documentation

This document provides a comprehensive guide to the environment variables used throughout the Enhanced Gemstone System.

## Environment Files

The application uses the following environment files:

- `.env.development` - Development environment variables
- `.env.test` - Testing environment variables
- `.env.production` - Production environment variables

## Backend Environment Variables

### Core Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `NODE_ENV`     | Environment mode (development/test/production) | `development`     | Yes      |
| `PORT`         | Port number for the server                  | `3000`              | No       |
| `API_VERSION`  | API version for route prefixing             | `v1`                | No       |

### Database Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `DATABASE_URL` | PostgreSQL connection string                | `postgres://postgres:postgres@localhost:5432/gemstone_dev` | Yes |
| `DATABASE_POOL_MIN` | Minimum database connection pool size  | `2`                 | No       |
| `DATABASE_POOL_MAX` | Maximum database connection pool size  | `10`                | No       |

### Security Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `JWT_SECRET`   | Secret key for JWT token generation         | N/A                 | Yes      |
| `JWT_EXPIRY`   | JWT token expiry time                       | `24h`               | No       |
| `BCRYPT_SALT_ROUNDS` | Number of salt rounds for password hashing | `10`          | No       |
| `CORS_ORIGIN`  | Allowed origins for CORS (comma-separated)  | `http://localhost:5173` | No   |

### File Storage Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `UPLOAD_DIR`   | Directory for file uploads                  | `./public/uploads`  | No       |
| `MAX_FILE_SIZE` | Maximum file size in bytes                 | `5242880` (5MB)     | No       |

### Email Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `EMAIL_HOST`   | SMTP host                                   | N/A                 | Yes (for production) |
| `EMAIL_PORT`   | SMTP port                                   | `587`               | No       |
| `EMAIL_USER`   | SMTP user                                   | N/A                 | Yes (for production) |
| `EMAIL_PASS`   | SMTP password                               | N/A                 | Yes (for production) |
| `EMAIL_FROM`   | Default sender email address                | `noreply@gemstone-system.com` | No |
| `EMAIL_SECURE` | Whether to use secure connection (TLS)      | `false`             | No       |

### Logging Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `LOG_LEVEL`    | Minimum log level (error/warn/info/http/debug) | `info`          | No       |
| `ENABLE_LOG_FILES` | Whether to enable log file writing      | `false`             | No       |

### Cloud Storage Configuration (Optional)

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `CLOUD_STORAGE_PROVIDER` | Cloud storage provider (aws/gcp/azure) | N/A          | No       |
| `CLOUD_STORAGE_API_KEY` | Cloud storage API key              | N/A                 | No       |
| `CLOUD_STORAGE_API_SECRET` | Cloud storage API secret        | N/A                 | No       |
| `CLOUD_STORAGE_BUCKET` | Cloud storage bucket name           | N/A                 | No       |

### Admin Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `ADMIN_EMAIL`  | Default admin email                         | `admin@example.com` | No       |
| `ADMIN_PASSWORD` | Default admin password (for seeding)      | N/A                 | Yes (if seeding) |

## Frontend Environment Variables

### Core Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `VITE_NODE_ENV` | Environment mode                           | `development`       | No       |

### API Configuration

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `VITE_API_URL` | Backend API URL                             | `http://localhost:3000/api` | Yes |
| `VITE_API_TIMEOUT` | API request timeout in milliseconds     | `30000`             | No       |

### Feature Flags

| Variable       | Description                                 | Default Value       | Required |
|----------------|---------------------------------------------|---------------------|----------|
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking          | `false`             | No       |
| `VITE_ENABLE_BLOCKCHAIN` | Enable blockchain features        | `false`             | No       |

## Example Environment Files

### `.env.development` Example

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gemstone_dev
JWT_SECRET=dev_secret_key
JWT_EXPIRY=24h
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./public/uploads
LOG_LEVEL=debug
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### `.env.test` Example

```
NODE_ENV=test
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gemstone_test
JWT_SECRET=test_secret_key
JWT_EXPIRY=24h
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./public/uploads/test
LOG_LEVEL=debug
```

### `.env.production` Example

```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://dbuser:dbpassword@db.example.com:5432/gemstone_prod
JWT_SECRET=<secure-random-string>
JWT_EXPIRY=12h
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=https://your-production-domain.com
UPLOAD_DIR=/var/uploads
LOG_LEVEL=info
ENABLE_LOG_FILES=true
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=notifications@example.com
EMAIL_PASS=<email-password>
EMAIL_FROM=noreply@example.com
EMAIL_SECURE=true
ADMIN_EMAIL=admin@example.com
```

## Frontend `.env` Files

### `.env.development` Example (Frontend)

```
VITE_NODE_ENV=development
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_BLOCKCHAIN=false
```

### `.env.production` Example (Frontend)

```
VITE_NODE_ENV=production
VITE_API_URL=https://api.example.com/api
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_BLOCKCHAIN=true
```

## Managing Environment Variables

### Local Development

1. Copy the appropriate example file (e.g., `.env.development.example`) to the correct filename (e.g., `.env.development`)
2. Modify the values as needed for your local environment
3. Never commit `.env` files to the repository

### CI/CD Pipeline

In the CI/CD pipeline, environment variables should be set using secrets or environment variables provided by your CI/CD platform:

- GitHub Actions: Use repository secrets
- GitLab CI: Use CI/CD variables
- Jenkins: Use credential bindings

### Production Deployment

For production environments, consider using:

- Environment variables set at the infrastructure level
- Secrets management services (AWS Secrets Manager, HashiCorp Vault, etc.)
- Configuration files mounted as volumes (for containerized deployments)

## Security Considerations

- Never commit sensitive information (passwords, API keys) to version control
- Rotate secrets regularly
- Use different secrets for different environments
- Consider using a secrets management service for production environments