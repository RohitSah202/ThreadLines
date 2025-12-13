import React, { useState } from 'react';
import { auth } from '../firebase';
import { Button, Input } from '../components/UI';
import { motion } from 'framer-motion';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        if (name && cred.user) {
          await cred.user.updateProfile({ displayName: name });
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Authentication is not set up. Please go to Firebase Console > Authentication and click "Get Started".');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is disabled. Enable it in Firebase Console > Authentication > Sign-in method.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-50 animate-pulse delay-700" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
            🧵
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Threadlines</h1>
          <p className="text-stone-500">
            {isLogin ? 'Welcome back! Ready to capture ideas?' : 'Create your space for everything.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input 
              label="Display Name" 
              placeholder="Rosy" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          )}
          <Input 
            label="Email" 
            type="email" 
            placeholder="hello@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required 
          />

          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center font-medium border border-red-100">{error}</p>}

          <Button type="submit" className="w-full mt-4" isLoading={loading}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          {isLogin ? "New here? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary-600 font-semibold hover:underline"
          >
            {isLogin ? 'Create Account' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;