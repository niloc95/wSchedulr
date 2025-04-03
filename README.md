## Installation

### Prerequisites

- Node.js 18+ and npm
- MySQL server (if using MySQL option)
- Modern web browser

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/webschedulr.git
   cd webschedulr

2. Install dependencies:
    npm install

3. Start the application:
    npm run start

4. Open your browser and navigate to: 
    http://localhost:5173/

# Success! Now Let's Move Forward with Your WebSchedulr App

Congratulations on getting the installation process working! This was a complex issue that required several fixes:

- Creating the minimal server that works specifically for installation
- Fixing ES Modules vs CommonJS conflicts (require vs import)
- Proper .env file handling with templates
- Fixing file system operations with fs/promises

## Next Steps for Your WebSchedulr Application

Here's a roadmap for continuing development:

### 1. Update Main Server Code
Apply what we learned to your main server:

- Add installation mode detection
- Proper error handling for database connections
- ES Module consistent usage

### 2. User Management Features
- User roles and permissions (admin vs staff)
- Profile management
- Password reset functionality

### 3. Calendar Implementation
- Multi-view calendar (day, week, month)
- Time slot blocking
- Resource allocation
- Recurring appointments

### 4. Client/Customer Management
- Customer database
- Appointment history
- Client notes and preferences
- Client portal for self-scheduling

### 5. Notifications System
- Email confirmations
- SMS reminders
- Cancellation notices

### 6. Admin Dashboard
- Statistics and reporting
- Staff management
- Business hours configuration
- Service management



# WebSchedulr - Modern Scheduling Application

WebSchedulr is a flexible, powerful scheduling and appointment management system built with React, TypeScript, and Node.js. It supports both MySQL and SQLite databases, making it suitable for various deployment environments.

## Features

- **Multi-database Support**: Works with MySQL or SQLite
- **Modern Interface**: Built with React 19 and Vite for a responsive UI
- **Calendar Management**: Interactive scheduling with FullCalendar integration
- **User Management**: Role-based access control system
- **Installation Wizard**: Easy setup process for new deployments


## Application Flow

### Installation Process

WebSchedulr features a complete installation wizard that helps you set up your scheduling system:

1. **First Visit**: System detects if installation is needed
2. **Database Setup**: Choose between MySQL or SQLite
3. **Admin Creation**: Set up your administrator account
4. **Company Details**: Add your business information

#### MySQL Installation

When using MySQL, the system:
- Creates a new database if specified
- Sets up all required tables
- Configures connection parameters in `.env`
- Creates the admin user with secure password hashing

#### SQLite Installation

For SQLite installations:
- Creates a local database file
- Sets up the same schema as MySQL
- Provides the same functionality with zero configuration
- Perfect for small deployments or testing

### Authentication System

WebSchedulr implements a secure authentication system:
- JWT (JSON Web Token) based authentication
- Secure password storage with bcrypt hashing
- Role-based authorization
- Session management with remember me functionality

### Development Mode

For developers working on WebSchedulr:

```bash
# Start development server
npm run dev

# Start backend API server
npm run server



    