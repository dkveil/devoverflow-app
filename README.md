# DevOverflow - Advanced Q&A Platform for Developers

## Overview

DevOverflow is an advanced collaborative platform that empowers developers to share knowledge, ask technical questions, and receive intelligent answers. Built with the latest technologies, it offers a seamless experience for both asking questions and providing solutions to the developer community.

This project was created with a focus on learning and demonstrating modern Next.js approaches, including the App Router, Server Components, Server Actions, and the latest React features. It serves as both a functional application and a showcase of contemporary web development practices.

## Overview

DevOverflow is an advanced collaborative platform that empowers developers to share knowledge, ask technical questions, and receive intelligent answers. Built with the latest technologies, it offers a seamless experience for both asking questions and providing solutions to the developer community.

## Key Features

### **AI-Powered Assistance**

- **GPT-4 Integration**: Generate intelligent answers using OpenAI's GPT-4 Turbo model
- **Smart Answer Enhancement**: AI can improve existing user answers or create comprehensive responses from scratch
- **Context-Aware**: AI considers question content, existing answers, and user input for personalized responses

### **Advanced Authentication System**

- **Multiple Auth Providers**: Support for GitHub, Google, and traditional email/password
- **Secure Session Management**: Built with NextAuth.js v5 beta
- **Social Login Integration**: Seamless OAuth integration with popular developer platforms

### **Rich Content Management**

- **Advanced MDX Editor**: Full-featured markdown editor with live preview
- **Code Syntax Highlighting**: Support for 100+ programming languages and technologies
- **Rich Text Formatting**: Complete markdown support with embedded media

### **Community Features**

- **Voting System**: Upvote/downvote questions and answers
- **Reputation System**: Earn reputation points based on community engagement
- **User Profiles**: Comprehensive profiles with social links, portfolio, and bio
- **Collections**: Save and organize favorite questions for later reference

### **Powerful Search & Discovery**

- **Global Search**: Search across questions, answers, users, and tags
- **Advanced Filtering**: Filter by newest, oldest, popular, and custom criteria
- **Tag System**: Organize content with a comprehensive tagging system
- **Smart Recommendations**: Discover relevant content based on user interests

### **Additional Features**

- **Jobs Board**: Browse and discover developer job opportunities
- **Community Hub**: Connect with other developers and explore profiles
- **Dark/Light Mode**: Full theme support with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live updates for votes, answers, and interactions

## Technology Stack

### **Frontend**

- **Next.js 15.2.3**
- **React 19.0.0**
- **TypeScript**
- **TailwindCSS 4**
- **Radix UI**
- **Lucide React**

### **Backend & Database**

- **MongoDB**
- **NextAuth.js 5.0**
- **Server Actions**
- **Edge Runtime**

### **AI & External Services**

- **OpenAI GPT-4 Turbo**
- **Vercel AI SDK**

### **Development Tools**

- **ESLint**
- **Husky**
- **PNPM**
- **Turbopack**

## Database Schema

The application uses a comprehensive MongoDB schema with the following models:

- **User**: User profiles, reputation, social links
- **Question**: Questions with content, tags, voting, and metadata
- **Answer**: Answers linked to questions with voting system
- **Vote**: Separate voting records for questions and answers
- **Tag**: Technology tags with descriptions and usage stats
- **Collection**: User-saved questions and favorites
- **Account**: Authentication provider accounts
- **Interaction**: User activity tracking and analytics

## Live Demo

Experience the full application at: **[devoverflow-app.vercel.app](https://devoverflow-app.vercel.app/)**

## Local Development

### Prerequisites

- Node.js 20.x
- PNPM 10
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dkveil/devoverflow-app.git
   cd devoverflow-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:

   ```env
   # Database
   DATABASE_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3137

   # OAuth Providers
   AUTH_GITHUB_ID=your_github_oauth_id
   AUTH_GITHUB_SECRET=your_github_oauth_secret
   AUTH_GOOGLE_ID=your_google_oauth_id
   AUTH_GOOGLE_SECRET=your_google_oauth_secret

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3137`

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically

## Deployment

The application is optimized for deployment on **Vercel** with the following configuration:

- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Node.js Version**: 20.x

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Author

**Damian Kądziela (dkveil)**

- Location: Kraków, Poland
- GitHub: [@dkveil](https://github.com/dkveil)
- Role: Web Developer

## Acknowledgments

- Inspired by StackOverflow's community-driven approach
- Built with modern web technologies and best practices
- Powered by OpenAI for intelligent assistance
- UI components from Radix UI and Shadcn/ui

---

**DevOverflow** - Empowering developers with intelligent Q&A platform
