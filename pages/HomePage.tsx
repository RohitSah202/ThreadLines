import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Pin, FolderOpen, Settings, Edit, Trash2, Copy, Check, LayoutGrid, List as ListIcon, ArrowDownUp } from 'lucide-react';
import { useData } from '../App';
import { EmptyState, Chip, Button, Modal, Input } from '../components/UI';
import { CATEGORIES, Snippet, SortOption, ViewMode } from '../types';
import { motion } from 'framer-motion';
import { deleteFolder, updateFolder } from '../services/db';

interface HomeProps {
  filter: 'all' | 'favorites' | 'folder';
}

const SnippetCard: React.FC<{ 
    snippet: Snippet; 
    onClick: (id: string) => void;
    viewMode: ViewMode; 
}> = ({ snippet, onClick, viewMode }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(snippet.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isList = viewMode === 'list';

    // Simple code block detection for preview
    const hasCode = snippet.content.includes('```');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onClick(snippet.id)}
            className={`
                group relative rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-lg border border-transparent hover:border-primary-100
                ${snippet.color || 'bg-white'} shadow-sm flex ${isList ? 'flex-row items-center p-4 gap-4' : 'flex-col p-5 h-64'}
            `}
        >
            <div className={`flex justify-between items-start ${isList ? 'w-48 shrink-0' : 'mb-3 w-full'}`}>
                <div className="flex gap-2 items-center">
                    <Chip label={snippet.category} color="white" />
                    {snippet.pinned && <Pin size={16} className="text-primary-400 rotate-45 fill-primary-400" />}
                </div>
                {!isList && (
                    <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/50 hover:bg-white rounded-full transition-all text-stone-500">
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                )}
            </div>
            
            <div className={`flex-1 min-w-0 ${isList ? 'flex items-center gap-6' : ''}`}>
                <h3 className={`font-bold text-stone-800 ${isList ? 'text-base truncate w-1/3' : 'text-lg mb-2 line-clamp-2'}`}>
                    {snippet.title}
                </h3>
                
                <p className={`text-stone-500 text-sm whitespace-pre-wrap ${isList ? 'truncate flex-1' : 'line-clamp-4 flex-1'}`}>
                    {hasCode ? <span className="font-mono text-xs bg-black/5 px-1 rounded">Code Snippet...</span> : snippet.content}
                </p>
            </div>

            <div className={`${isList ? 'flex items-center gap-3 shrink-0' : 'mt-4 flex flex-wrap gap-1'}`}>
                {isList && (
                     <button onClick={handleCopy} className="p-2 hover:bg-black/5 rounded-full transition-all text-stone-400 hover:text-stone-600">
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                )}
                {!isList && snippet.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-black/5 px-2 py-0.5 rounded-full text-stone-600">
                    #{tag}
                    </span>
                ))}
                {isList && (
                    <span className="text-xs text-stone-400">
                        {new Date(snippet.updatedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

const HomePage: React.FC<HomeProps> = ({ filter }) => {
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId?: string }>();
  const { snippets, folders } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // View & Sort State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Folder Management State
  const [isFolderSettingsOpen, setFolderSettingsOpen] = useState(false);
  const [folderRename, setFolderRename] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derive data
  const currentFolder = folders.find(f => f.id === folderId);
  const folderName = filter === 'folder' ? currentFolder?.name || 'Unknown Collection' : 
                     filter === 'favorites' ? 'Favorites' : 'All Items';

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    snippets.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [snippets]);

  // Filtering & Sorting Logic
  const filteredSnippets = useMemo(() => {
    let result = snippets.filter(s => {
      // 1. Route Filter
      if (filter === 'favorites' && !s.favorite) return false;
      if (filter === 'folder' && s.folderId !== folderId) return false;
      // 2. Search
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        if (!s.title.toLowerCase().includes(lower) && !s.content.toLowerCase().includes(lower)) return false;
      }
      // 3. Category
      if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
      // 4. Tag
      if (selectedTag && !s.tags?.includes(selectedTag)) return false;
      
      return true;
    });

    // 5. Sorting
    return result.sort((a, b) => {
        switch (sortBy) {
            case 'newest': return b.createdAt - a.createdAt;
            case 'oldest': return a.createdAt - b.createdAt;
            case 'az': return a.title.localeCompare(b.title);
            case 'za': return b.title.localeCompare(a.title);
            default: return 0;
        }
    });
  }, [snippets, filter, folderId, searchTerm, selectedCategory, selectedTag, sortBy]);

  const pinnedSnippets = filteredSnippets.filter(s => s.pinned);
  const otherSnippets = filteredSnippets.filter(s => !s.pinned);

  // Handlers
  const openFolderSettings = () => {
    if (currentFolder) {
      setFolderRename(currentFolder.name);
      setFolderSettingsOpen(true);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdateFolder = async () => {
    if (!currentFolder || !folderRename.trim()) return;
    setIsSaving(true);
    try {
      await updateFolder(currentFolder.id, folderRename);
      setFolderSettingsOpen(false);
    } catch(e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFolder = async () => {
     if (!currentFolder) return;
     setIsSaving(true);
     try {
       await deleteFolder(currentFolder.id);
       navigate('/');
       setFolderSettingsOpen(false);
     } catch (e) {
       console.error(e);
     } finally {
       setIsSaving(false);
     }
  };

  return (
    <div className="space-y-8 pb-20 w-full">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-3 group">
             <h1 className="text-3xl font-bold text-stone-800 break-words">{folderName}</h1>
             {filter === 'folder' && currentFolder && (
               <button 
                 onClick={openFolderSettings}
                 className="opacity-50 group-hover:opacity-100 p-2 hover:bg-stone-100 rounded-full transition-all text-stone-500"
                 title="Collection Settings"
               >
                 <Settings size={20} />
               </button>
             )}
           </div>
           
           <div className="flex items-center gap-2 w-full md:w-auto">
             {/* View Toggles */}
             <div className="bg-white p-1 rounded-xl border border-stone-100 flex items-center shrink-0">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    <ListIcon size={18} />
                </button>
             </div>

             {/* Sort Dropdown */}
             <div className="relative group shrink-0">
                 <button className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-stone-100 text-stone-600 hover:border-primary-200 transition-colors">
                     <ArrowDownUp size={16} />
                     <span className="text-sm font-medium hidden sm:inline">Sort</span>
                 </button>
                 <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-stone-100 p-1 hidden group-hover:block z-20">
                     <button onClick={() => setSortBy('newest')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === 'newest' ? 'bg-primary-50 text-primary-700' : 'hover:bg-stone-50'}`}>Newest First</button>
                     <button onClick={() => setSortBy('oldest')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === 'oldest' ? 'bg-primary-50 text-primary-700' : 'hover:bg-stone-50'}`}>Oldest First</button>
                     <button onClick={() => setSortBy('az')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === 'az' ? 'bg-primary-50 text-primary-700' : 'hover:bg-stone-50'}`}>Title A-Z</button>
                     <button onClick={() => setSortBy('za')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === 'za' ? 'bg-primary-50 text-primary-700' : 'hover:bg-stone-50'}`}>Title Z-A</button>
                 </div>
             </div>

             {/* Search Bar */}
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-stone-100 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
           </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold uppercase text-stone-400 mr-2">Category:</span>
            <Chip 
              label="All" 
              active={selectedCategory === 'All'} 
              onClick={() => setSelectedCategory('All')} 
              color="stone"
            />
            {CATEGORIES.slice(0, 5).map(cat => (
              <Chip 
                key={cat} 
                label={cat} 
                active={selectedCategory === cat} 
                onClick={() => setSelectedCategory(cat)} 
                color="stone"
              />
            ))}
          </div>
          
          {allTags.length > 0 && (
             <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase text-stone-400 mr-2">Tags:</span>
                {allTags.map(tag => (
                   <Chip 
                     key={tag} 
                     label={`#${tag}`} 
                     active={selectedTag === tag}
                     onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                     color="secondary"
                   />
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {filteredSnippets.length === 0 ? (
        <EmptyState 
          title="No items found" 
          description={filter === 'all' && !searchTerm ? "Create your first snippet to get started!" : "Try adjusting your filters or search terms."} 
          icon={<FolderOpen size={40} />}
        />
      ) : (
        <div className="space-y-8">
           {pinnedSnippets.length > 0 && (
             <div>
               <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Pin size={14} /> Pinned
               </h2>
               <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                 {pinnedSnippets.map(s => (
                   <SnippetCard key={s.id} snippet={s} onClick={(id) => navigate(`/snippet/${id}`)} viewMode={viewMode} />
                 ))}
               </div>
             </div>
           )}

           <div>
              {pinnedSnippets.length > 0 && <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4 mt-8">Others</h2>}
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                 {otherSnippets.map(s => (
                   <SnippetCard key={s.id} snippet={s} onClick={(id) => navigate(`/snippet/${id}`)} viewMode={viewMode} />
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Folder Settings Modal */}
      <Modal isOpen={isFolderSettingsOpen} onClose={() => setFolderSettingsOpen(false)} title="Collection Settings" width="sm">
        {!showDeleteConfirm ? (
          <div className="space-y-4">
             <Input 
               label="Rename Collection"
               value={folderRename}
               onChange={e => setFolderRename(e.target.value)}
             />
             <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleUpdateFolder} isLoading={isSaving}>Save Changes</Button>
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Collection
                </Button>
             </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="bg-red-50 p-3 rounded-xl text-red-700 text-sm">
                Are you sure? Items in this collection will be kept but marked as unorganized.
             </div>
             <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteFolder} isLoading={isSaving}>Yes, Delete</Button>
             </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default HomePage;