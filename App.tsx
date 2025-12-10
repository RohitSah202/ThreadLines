import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { auth, db } from './firebase';
import { UserProfile, Snippet, Folder } from './types';
import { Layout } from './components/Layout';
import AuthPage from './pages/Auth';
import HomePage from './pages/Home';
import SnippetDetail from './pages/SnippetDetail';
import AccountPage from './pages/Account';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Simple Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('App Error:', error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-cream gap-4">
        <div className="w-16 h-16 bg-red-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
          ⚠️
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-stone-800 mb-2">Something went wrong</h2>
          <p className="text-stone-600 mb-4">Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-200 text-primary-900 rounded-xl hover:bg-primary-300 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// --- Context ---
interface DataContextType {
  user: firebase.User | null;
  userProfile: UserProfile | null;
  snippets: Snippet[];
  folders: Folder[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  user: null,
  userProfile: null,
  snippets: [],
  folders: [],
  loading: true,
});

export const useData = () => useContext(DataContext);

// --- App Component ---
const App: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setSnippets([]);
        setFolders([]);
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // 1. Listen to Profile
    setUserProfile({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: Date.now(),
    });

    // 2. Listen to Snippets
    const unsubSnippets = db.collection('snippets')
      .where('userId', '==', user.uid)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Snippet));
        data.sort((a, b) => b.updatedAt - a.updatedAt); 
        setSnippets(data);
      }, (error) => {
        console.error("Error fetching snippets:", error);
      });

    // 3. Listen to Folders
    const unsubFolders = db.collection('folders')
      .where('userId', '==', user.uid)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
        data.sort((a, b) => b.createdAt - a.createdAt);
        setFolders(data);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching folders:", error);
        setLoading(false);
      });

    return () => {
      unsubSnippets();
      unsubFolders();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-cream gap-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-primary-200 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
        >
           <motion.span
             animate={{ rotate: [0, 10, -10, 0] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           >
             🧵
           </motion.span>
        </motion.div>
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-stone-500"
        >
           <Loader2 className="animate-spin" size={16} />
           <span className="text-sm font-medium">Loading Threadlines...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DataContext.Provider value={{ user, userProfile, snippets, folders, loading }}>
        <Router>
          <Routes>
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
            
            <Route path="/*" element={
               user ? (
                 <Layout>
                   <Routes>
                      <Route path="/" element={<HomePage filter="all" />} />
                      <Route path="/favorites" element={<HomePage filter="favorites" />} />
                      <Route path="/folder/:folderId" element={<HomePage filter="folder" />} />
                      <Route path="/snippet/:snippetId" element={<SnippetDetail />} />
                      <Route path="/account" element={<AccountPage />} />
                   </Routes>
                 </Layout>
               ) : (
                 <Navigate to="/auth" />
               )
            } />
          </Routes>
        </Router>
      </DataContext.Provider>
    </ErrorBoundary>
  );
};

export default App;