# InfluencerConnect

InfluencerConnect is a full-stack web application that connects influencers with brands for collaboration opportunities. The platform features real-time messaging, user authentication, and a modern UI built with React and Firebase.

## Features

- **Firebase Authentication**: Secure login and signup with email and password
- **Firestore Database**: Store users, messages, and chat data in Firestore
- **Real-time Messaging**: Chat with other users in real-time using Firestore
- **User Search**: Find users by username to start conversations
- **Profile Management**: Update your bio, interests, and social media links
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and Framer Motion for animations

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Firebase SDK for authentication and database
- Context API for state management

### Backend
- Firebase Authentication for user management
- Firestore for data storage
- Firebase Cloud Storage for assets/images
- Firebase hosting (optional)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/influencer-connect.git
cd influencer-connect
```

2. Install dependencies
```
npm install
```

3. Create a Firebase project
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up Authentication with Email/Password
   - Set up Firestore Database
   - Get your Firebase configuration

4. Update Firebase configuration
   - Open `src/firebase.js`
   - Replace the Firebase configuration with your own:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. Start the application
```
npm start
```

## How to Use

1. **Sign Up**: Create a new account with email and password
2. **Log In**: Use your credentials to log in
3. **Dashboard**: View your user information and quick links
4. **Chat**: Search for users by username and start chatting
5. **Profile**: Update your personal information and social media links

## Project Structure

```
influencer-connect/
├── public/               # Public assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React context for state management
│   │   └── AuthContext.js # Authentication context
│   ├── pages/            # Page components
│   │   ├── Home.js       # Landing page
│   │   ├── Login.js      # Login page
│   │   ├── Signup.js     # Signup page
│   │   ├── Dashboard.js  # User dashboard
│   │   ├── Chat.js       # Chat interface
│   │   └── Profile.js    # Profile management
│   ├── services/         # Firebase service functions
│   │   └── chatService.js # Chat-related functions
│   ├── App.js            # Main application component
│   ├── firebase.js       # Firebase configuration
│   └── index.js          # Application entry point
└── package.json          # Project dependencies
```

## Firebase Setup Details

### Authentication
- Enable Email/Password authentication in Firebase console
- Create test users or let users register through the app

### Firestore Database
- Set up the following collections:
  - `users`: Store user profiles
  - `chats`: Store chat sessions between users
  - `chats/{chatId}/messages`: Subcollection for chat messages

### Security Rules
Recommended Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid in resource.data.users;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
                             get(/databases/$(database)/documents/chats/$(chatId)).data.users[request.auth.uid] != null;
      }
    }
  }
}
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Framer Motion](https://www.framer.com/motion/) 