# Gym Fee Tracker Pro

Enterprise-grade Gym Membership Management System built with Django 5, React 19, and PostgreSQL.

## Features

- **Member Management** - Add, edit, suspend, activate, and track members with auto-generated IDs
- **Membership Plans** - Monthly, Quarterly, Half-Yearly, Yearly plans with benefits
- **Monthly Fee Tracking** - Core module for tracking paid/pending/overdue fees with auto-calculation
- **Payment History** - Complete audit trail with export to CSV/Excel
- **Dashboard** - Real-time stats, revenue charts, membership growth, payment distribution
- **Reports** - Monthly/yearly revenue, pending collections, membership reports with export
- **Role-Based Access** - Admin, Owner, Receptionist roles with granular permissions
- **JWT Authentication** - Secure login with refresh tokens and password reset
- **Dark/Light Mode** - Modern glassmorphism UI with dark theme
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

### Backend
- Python 3.13 / Django 5.1
- Django REST Framework + SimpleJWT
- PostgreSQL 16
- drf-spectacular (Swagger/OpenAPI)
- Gunicorn + WhiteNoise

### Frontend
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 3
- TanStack Query
- Recharts
- Framer Motion
- React Router 7
- React Hook Form

### Infrastructure
- Docker + Docker Compose
- Nginx reverse proxy
- GitHub Actions ready

## Project Structure

```
gym-fee-tracker/
├── backend/
│   ├── core/                    # Django project settings
│   ├── apps/
│   │   ├── accounts/            # Auth, users, JWT
│   │   ├── common/              # Base models, mixins, paginators
│   │   ├── members/             # Member CRUD, filters, export
│   │   ├── plans/               # Membership plans
│   │   ├── payments/            # Fee tracking, payment history
│   │   ├── dashboard/           # Dashboard analytics
│   │   ├── reports/             # Reports engine
│   │   ├── notifications/       # Reminders & notifications
│   │   └── settings/            # Gym settings, audit logs
│   ├── media/                   # Uploaded files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # DataTable, Skeletons
│   │   │   └── layout/          # Sidebar, Navbar
│   │   ├── pages/               # Page components
│   │   │   ├── auth/            # Login, Register, Profile
│   │   │   ├── dashboard/       # Dashboard with charts
│   │   │   ├── members/         # Member management
│   │   │   ├── plans/           # Membership plans
│   │   │   ├── payments/        # Payment tracking
│   │   │   ├── reports/         # Reports & analytics
│   │   │   └── settings/        # Gym configuration
│   │   ├── services/            # API service layer
│   │   ├── context/             # Auth, Theme contexts
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Helpers
│   │   └── types/               # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── docker/
│   └── nginx.conf
├── docker-compose.yml
├── Dockerfile
└── Makefile
```

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 20+
- PostgreSQL 16 (or Docker)
- Docker & Docker Compose (optional)

### 1. Clone & Setup

```bash
git clone <repo-url>
cd gym-fee-tracker
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1/
- Admin Panel: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# View logs
docker-compose logs -f
```

## API Endpoints

### Authentication
```
POST /api/v1/accounts/auth/register/   # Register new user
POST /api/v1/accounts/auth/login/      # Login
POST /api/v1/accounts/auth/logout/     # Logout
POST /api/v1/accounts/auth/refresh/    # Refresh token
GET  /api/v1/accounts/auth/profile/    # Get profile
PATCH /api/v1/accounts/auth/update_profile/  # Update profile
POST /api/v1/accounts/auth/change_password/  # Change password
POST /api/v1/accounts/auth/forgot_password/  # Forgot password
POST /api/v1/accounts/auth/reset_password/   # Reset password
```

### Members
```
GET    /api/v1/members/          # List members (paginated)
POST   /api/v1/members/          # Create member
GET    /api/v1/members/{id}/     # Get member detail
PATCH  /api/v1/members/{id}/     # Update member
DELETE /api/v1/members/{id}/     # Soft delete member
POST   /api/v1/members/{id}/suspend/   # Suspend member
POST   /api/v1/members/{id}/activate/  # Activate member
POST   /api/v1/members/{id}/renew/     # Renew membership
GET    /api/v1/members/stats/    # Member statistics
GET    /api/v1/members/export/   # Export to CSV/Excel
```

### Membership Plans
```
GET    /api/v1/plans/           # List plans
POST   /api/v1/plans/           # Create plan
PATCH  /api/v1/plans/{id}/      # Update plan
DELETE /api/v1/plans/{id}/      # Delete plan
GET    /api/v1/plans/active/    # List active plans
POST   /api/v1/plans/{id}/toggle_status/  # Toggle active status
```

### Payments
```
GET    /api/v1/payments/          # List payments
POST   /api/v1/payments/          # Create payment
PATCH  /api/v1/payments/{id}/     # Update payment
GET    /api/v1/payments/summary/  # Payment summary
POST   /api/v1/payments/bulk_create/  # Bulk generate payments
POST   /api/v1/payments/{id}/update_status/  # Update status
GET    /api/v1/payments/{id}/history/  # Payment history
GET    /api/v1/payments/overdue/  # Mark overdue payments
```

### Dashboard
```
GET /api/v1/dashboard/overview/              # Dashboard stats
GET /api/v1/dashboard/revenue_chart/         # Monthly revenue data
GET /api/v1/dashboard/recent_payments/       # Recent 10 payments
GET /api/v1/dashboard/membership_growth/     # Membership growth data
GET /api/v1/dashboard/payment_method_distribution/  # Payment methods
GET /api/v1/dashboard/upcoming_renewals/     # Upcoming renewals
```

### Reports
```
GET /api/v1/reports/monthly_revenue/    # Monthly revenue report
GET /api/v1/reports/yearly_revenue/     # Yearly revenue report
GET /api/v1/reports/pending_report/     # Pending payments report
GET /api/v1/reports/membership_report/  # Membership analysis
GET /api/v1/reports/expired_members/    # Expired members report
GET /api/v1/reports/collection_report/  # Collection report
GET /api/v1/reports/export/             # Export to CSV/Excel
```

## Response Format

All APIs follow a consistent response format:

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {},
    "errors": []
}
```

Paginated responses include:
```json
{
    "success": true,
    "count": 100,
    "total_pages": 5,
    "current_page": 1,
    "next": "http://...",
    "previous": null,
    "data": [],
    "errors": []
}
```

## Database Schema

### Users
- UUID primary key, email-based authentication
- Roles: admin, owner, receptionist
- Profile photo, phone, verification status

### Members
- Auto-generated member ID (GYM-1001, GYM-1002,...)
- Full profile with address, emergency contact
- Membership plan FK with start/end dates
- Monthly fee with discount support
- Status tracking: active, inactive, suspended, expired
- Soft delete support

### MembershipPlans
- Monthly/Quarterly/Half-Yearly/Yearly durations
- Price with discounted price option
- JSON benefits list
- Sort order and popular flag

### Payments
- Auto-generated receipt number (RCP-1001)
- Member + Month/Year unique constraint
- Amount, late fee, discount, total calculation
- Partial payment support with balance tracking
- Status: paid, pending, overdue, cancelled, refunded
- Full audit history via PaymentHistory model

### Notifications
- Types: payment_due, payment_overdue, payment_received, membership_expiry
- Channels: email, SMS, WhatsApp, in_app
- Status tracking with error logging

### Settings
- Singleton GymSettings with all configuration
- AuditLog for all system activities

## Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## Security

- JWT authentication with refresh token rotation
- Role-based permissions (Admin, Owner, Receptionist)
- Password hashing with Django's PBKDF2
- Rate limiting on API endpoints
- CORS configuration for frontend origin
- SQL injection protection via ORM
- XSS protection via template escaping
- CSRF protection on session-based views
- Environment variables for secrets
- Soft delete for data safety

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SECRET_KEY | Django secret key | (required) |
| DEBUG | Debug mode | False |
| DB_NAME | PostgreSQL database name | gym_fee_tracker |
| DB_USER | Database user | gym_user |
| DB_PASSWORD | Database password | gym_password |
| DB_HOST | Database host | db |
| DB_PORT | Database port | 5432 |
| JWT_SECRET_KEY | JWT signing key | (same as SECRET_KEY) |
| CORS_ALLOWED_ORIGINS | Frontend URLs | http://localhost:5173 |
| FRONTEND_URL | Frontend URL | http://localhost:5173 |
| DEFAULT_CURRENCY | Currency code | INR |
| DEFAULT_TIMEZONE | Timezone | Asia/Kolkata |
| USE_SQLITE | Use SQLite for local dev | False |

## License

MIT
