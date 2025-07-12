Video Link = https://drive.google.com/file/d/1B1jNQLVU2Bs-k3W-3_JNNHSSjHZ5idW6/view?usp=sharing

# SkillSwap - Skill Exchange Platform
-------------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------------

Team-Details
-------------------------------------------------------------------------------------------------
Name-Hemant Yadav
Email=9610hemant@gmail.com
-------------------------------------------------------------------------------------------------
Name-Manmath Mohanty
Email=manmath.mohanty@adypu.edu.in
-------------------------------------------------------------------------------------------------
Name-Suvendu Kumar Sahoo
Email=suvendu.sahoo@adypu.edu.in

[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0.0-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-purple.svg)](https://vitejs.dev/)

A modern, full-stack web application that revolutionizes skill sharing and learning through peer-to-peer exchanges. Built with cutting-edge technologies, SkillSwap connects people who want to learn new skills with those who can teach them, creating a vibrant community of knowledge exchange.

## 🎯 Demo Credentials

### User Accounts (Ready to Use)
| Email | Password | Description |
|-------|----------|-------------|
| `akash@gupta.com` | `123456789` | Regular user account |
| `mark@gmail.com` | `jrg074dt` | Regular user account |
| `samay@raina.com` | `123456789` | Regular user account |

### Admin Access
| Username | Password | Access Level |
|----------|----------|-------------|
| `admin` | `admin123` | Full admin privileges |

> **Note**: You can also create your own profile using the sign-up page for a personalized experience.

## 🌟 Key Highlights

- **Real-time Collaboration**: Live notifications and instant updates
- **Secure Authentication**: Powered by Supabase Auth with role-based access
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: User preference with automatic theme switching
- **Admin Dashboard**: Comprehensive platform management tools
- **Skill Rating System**: Community-driven quality assurance
- **Modern UI/UX**: Beautiful, intuitive interface built with Tailwind CSS

## 🚀 Features

### User Features
- **User Authentication**: Secure signup/login with Supabase Auth
- **Profile Management**: Create and manage your profile with skills offered/wanted
- **Skill Exchange**: Send and receive swap requests with other users
- **Browse Users**: Discover people with skills you want to learn
- **Notifications**: Real-time notifications for swap requests and updates
- **Rating System**: Rate your swap experiences
- **Dark Mode**: Toggle between light and dark themes

### Admin Features
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **User Management**: View all users, ban/unban users
- **Content Moderation**: Review and approve/reject reported content
- **Swap Monitoring**: Monitor all swap requests and their status
- **Platform Messaging**: Send platform-wide announcements
- **Analytics & Reports**: Download user activity and swap statistics
- **Admin Login**: Secure admin access (demo: admin/admin123)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Build Tool**: Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/hk2166/Odoo_pr.git
cd Odoo_pr
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Project Credentials**
   - In your Supabase dashboard, go to Settings → API
   - Copy your Project URL and anon/public key

3. **Create Environment File**
   Create a `.env` file in the root directory:

```bash
touch .env
```

4. **Add Environment Variables**
   Add the following to your `.env` file:

```env
VITE_SUPABASE_URL=https://hlxsfzcehmhqbtyaievp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHNmemNlaG1ocWJ0eWFpZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDU4NjUsImV4cCI6MjA2Nzg4MTg2NX0.8Do7JymtyiNqf7VOAN41hPQdKuC0180zIV8qrF7X_zM
```

### 4. Set Up Database

The project includes Supabase migrations. Run them in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files from the `supabase/migrations/` folder in order:
   - `20250712051027_sweet_meadow.sql`
   - `20250712074035_plain_cake.sql`
   - `20250712074920_smooth_sound.sql`
   - `20250712080351_shy_lake.sql`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## 🎯 Usage

### For Regular Users

1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Complete Profile**: Add your skills (both offered and wanted)
3. **Browse Users**: Find people with skills you want to learn
4. **Send Swap Requests**: Request skill exchanges with other users
5. **Manage Requests**: Accept, decline, or complete swap requests
6. **Rate Experiences**: Rate your swap experiences to help the community

### For Administrators

1. **Admin Login**: Use the admin login button (demo: admin/admin123)
2. **Dashboard Overview**: View platform statistics and recent activity
3. **User Management**: Monitor users, ban/unban if necessary
4. **Content Moderation**: Review reported content and take action
5. **Platform Messaging**: Send announcements to all users
6. **Generate Reports**: Download analytics and user activity reports

## 📁 Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── AuthForm.tsx
│   │   ├── Browse.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Header.tsx
│   │   ├── Profile.tsx
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── AppContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useDarkMode.ts
│   │   ├── useLocalStorage.ts
│   │   └── useToast.ts
│   ├── lib/               # Utility functions and API calls
│   │   ├── supabase.ts
│   │   ├── users.ts
│   │   ├── skills.ts
│   │   └── ...
│   ├── types/             # TypeScript type definitions
│   │   ├── database.ts
│   │   └── index.ts
│   └── main.tsx           # Application entry point
├── supabase/
│   └── migrations/        # Database migration files
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

## 🔒 Security

- User authentication is handled by Supabase Auth
- Admin access is protected with demo credentials (admin/admin123)
- All sensitive data is stored securely in Supabase
- Environment variables are used for configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Supabase configuration in the `.env` file
3. Ensure all database migrations have been applied
4. Check that your Supabase project is active and accessible

## 🎨 Customization

### Styling
The project uses Tailwind CSS. You can customize the design by modifying:
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Global styles
- Component-specific classes in each component

### Features
To add new features:
1. Create new components in `src/components/`
2. Add corresponding types in `src/types/`
3. Update the routing logic in `src/App.tsx`
4. Add any necessary API calls in `src/lib/`

## 📊 Database Schema

The application uses the following main tables:
- `profiles` - User profiles and information
- `skills` - Available skills in the system
- `user_skills` - Skills offered/wanted by users
- `swap_requests` - Skill exchange requests
- `ratings` - User ratings and feedback

## 🔄 Real-time Features

The application includes real-time features powered by Supabase:
- Live notifications for swap requests
- Real-time updates for request status changes
- Instant messaging capabilities (planned)

---
