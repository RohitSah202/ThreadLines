import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Folder, Star, Settings, LogOut, Menu, Plus, 
  Search, Heart, User, ChevronLeft 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { auth } from '../firebase';
import { useData } from '../App';
import { Button, Modal, Chip, Input, TextArea } from './UI';
import { CATEGORIES, COLORS } from '../types';
import { createSnippet, createFolder } from '../services/db';

const PricingPopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pricing Plan" width="sm">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
           <Heart size={40} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Forever Free</h2>
        <p className="text-stone-600 mb-6 leading-relaxed">
          Knowledge should have no walls. Threadlines is free for everyone—students, creators, and dreamers.
        </p>
        <p className="text-sm text-stone-400 italic mb-8">
          Learning & educational stuff shouldn't be with paywalls.
        </p>
        <Button onClick={onClose} variant="primary" className="w-full">
          That's awesome!
        </Button>
      </div>
    </Modal>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, folders } = useData();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPricingOpen, setPricingOpen] = useState(false);
  const [isNewSnippetOpen, setNewSnippetOpen] = useState(false);
  const [isNewFolderOpen, setNewFolderOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // New Snippet State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newTags, setNewTags] = useState('');
  const [newFolderId, setNewFolderId] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  // New Folder State
  const [newFolderName, setNewFolderName] = useState('');

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  const handleCreateSnippet = async () => {
    if (!newTitle.trim()) return;
    setIsSaving(true);
    try {
      await createSnippet({
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        folderId: newFolderId || null,
        pinned: isPinned,
        color: selectedColor
      });
      setNewSnippetOpen(false);
      resetSnippetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsSaving(true);
    try {
      await createFolder(newFolderName);
      setNewFolderOpen(false);
      setNewFolderName('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSnippetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewCategory(CATEGORIES[0]);
    setNewTags('');
    setNewFolderId('');
    setIsPinned(false);
    setSelectedColor(COLORS[0]);
  };

  const navLinkClass = (isActive: boolean) => 
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
      isActive 
        ? 'bg-primary-100 text-primary-900 font-medium' 
        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-stone-100 flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-200 flex items-center justify-center">
              <span className="text-lg">🧵</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-800">Threadlines</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-stone-400">
            <ChevronLeft />
          </button>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          <Button onClick={() => setNewSnippetOpen(true)} className="w-full mb-6 justify-start shadow-md bg-stone-900 text-white hover:bg-stone-800">
            <Plus size={18} />
            <span>New Item</span>
          </Button>

          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 mt-2">Library</p>
            <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)} onClick={() => setSidebarOpen(false)}>
              <Home size={18} /> Home
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => navLinkClass(isActive)} onClick={() => setSidebarOpen(false)}>
              <Star size={18} /> Favorites
            </NavLink>
          </div>

          <div className="mt-6 space-y-1">
            <div className="flex items-center justify-between px-4 mb-2 mt-2">
               <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Collections</p>
               <button onClick={() => setNewFolderOpen(true)} className="text-stone-400 hover:text-stone-600">
                 <Plus size={14} />
               </button>
            </div>
            {folders.map(folder => (
              <NavLink key={folder.id} to={`/folder/${folder.id}`} className={({ isActive }) => navLinkClass(isActive)} onClick={() => setSidebarOpen(false)}>
                <Folder size={18} /> {folder.name}
              </NavLink>
            ))}
            {folders.length === 0 && (
                <div className="px-4 py-2 text-sm text-stone-400 italic">No collections yet</div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-stone-50 space-y-1">
          <NavLink to="/account" className={({ isActive }) => navLinkClass(isActive)} onClick={() => setSidebarOpen(false)}>
            <div className="w-6 h-6 rounded-full bg-secondary-200 flex items-center justify-center text-xs font-bold text-secondary-900">
              {userProfile?.displayName?.[0] || 'U'}
            </div>
            <span className="truncate">{userProfile?.displayName || 'Account'}</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 px-4 lg:px-8 border-b border-stone-100 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-xl">
               <Menu size={20} />
             </button>
          </div>
          
          {/* Network Status */}
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Offline
            </div>
          )}
        </header>

        {/* Page Content with Transition */}
        <SplashTransition>
          {children}
        </SplashTransition>
        
        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 py-4 px-4 lg:px-8 border-t border-stone-100 bg-white/80 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between text-stone-400 text-sm">
          <div className="flex items-center gap-1">
            Made by Rosy with <Heart size={12} className="text-red-400 fill-red-400" />
          </div>
          <button onClick={() => setPricingOpen(true)} className="mt-2 md:mt-0 hover:text-stone-600 transition-colors">
            Pricing
          </button>
        </footer>
      </main>

      {/* --- Modals --- */}
      <PricingPopup isOpen={isPricingOpen} onClose={() => setPricingOpen(false)} />

      {/* New Folder Modal */}
      <Modal isOpen={isNewFolderOpen} onClose={() => setNewFolderOpen(false)} title="New Collection" width="sm">
         <div className="space-y-4">
            <Input 
              label="Collection Name" 
              placeholder="e.g., Recipes, Project X" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder} isLoading={isSaving} disabled={!newFolderName.trim()}>Create</Button>
            </div>
         </div>
      </Modal>

      {/* New Snippet Modal */}
      <Modal isOpen={isNewSnippetOpen} onClose={() => setNewSnippetOpen(false)} title="Create New Item" width="lg">
        <div className="space-y-6">
          <Input 
            placeholder="Title" 
            className="text-lg font-semibold border-stone-200"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            autoFocus
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-stone-500 mb-1 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <Chip 
                    key={cat} 
                    label={cat} 
                    active={newCategory === cat} 
                    onClick={() => setNewCategory(cat)}
                    color="secondary"
                  />
                ))}
              </div>
            </div>
            
            <div>
               <label className="text-sm font-medium text-stone-500 mb-1 block">Collection</label>
               <select 
                 className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                 value={newFolderId}
                 onChange={(e) => setNewFolderId(e.target.value)}
               >
                 <option value="">No Collection</option>
                 {folders.map(f => (
                   <option key={f.id} value={f.id}>{f.name}</option>
                 ))}
               </select>
            </div>
          </div>

          <TextArea 
            placeholder="Write your note, idea, or paste a link..." 
            rows={8}
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-500">Tags (comma separated)</label>
            <Input 
              placeholder="tech, easy, urgent..." 
              value={newTags} 
              onChange={e => setNewTags(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-stone-50">
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">Color:</span>
                  <div className="flex gap-1">
                    {COLORS.slice(0, 5).map(c => (
                      <button 
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-6 h-6 rounded-full border border-stone-100 ${c} ${selectedColor === c ? 'ring-2 ring-stone-400' : ''}`}
                      />
                    ))}
                  </div>
               </div>
               <label className="flex items-center gap-2 cursor-pointer select-none">
                 <input 
                   type="checkbox" 
                   checked={isPinned} 
                   onChange={e => setIsPinned(e.target.checked)}
                   className="rounded text-primary-500 focus:ring-primary-200"
                 />
                 <span className="text-sm text-stone-600">Pin to top</span>
               </label>
             </div>
             <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setNewSnippetOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSnippet} isLoading={isSaving} disabled={!newTitle.trim()}>Save Item</Button>
             </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

// Advanced Splash Transition with proper timing
const SplashTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Start transition on route change
    setIsVisible(true);
    setShowContent(false);
    
    // Hide content during transition
    const hideTimer = setTimeout(() => {
      setShowContent(true);
    }, 400); // Content appears when splash is fully covering

    // End transition
    const showTimer = setTimeout(() => {
      setIsVisible(false);
    }, 800); // Total transition duration

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
            {/* Primary splash layer */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: "0%", transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } }}
              exit={{ y: "-100%", transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } }}
              className="fixed inset-0 bg-primary-200 z-50 flex items-center justify-center"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.2 } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                className="text-6xl"
              >
                🧵
              </motion.div>
            </motion.div>
            
            {/* Secondary decorative layer */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: "0%", transition: { duration: 0.4, delay: 0.05, ease: [0.76, 0, 0.24, 1] } }}
              exit={{ y: "-100%", transition: { duration: 0.4, delay: 0.05, ease: [0.76, 0, 0.24, 1] } }}
              className="fixed inset-0 bg-secondary-200 z-40"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content wrapper with fade */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-y-auto relative p-4 lg:p-8 custom-scrollbar"
      >
        <div className="max-w-7xl mx-auto w-full">
          {showContent && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </div>
        

      </motion.div>
    </>
  );
};