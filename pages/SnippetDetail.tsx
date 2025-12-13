import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Tag, Folder, Star, Trash2, Edit2, Check, Copy, Clock, Type 
} from 'lucide-react';
import { useData } from '../App';
import { Button, Chip, Modal, Input, TextArea } from '../components/UI';
import { deleteSnippet, updateSnippet } from '../services/db';
import { Snippet, CATEGORIES, COLORS } from '../types';

const SnippetDetail: React.FC = () => {
  const { snippetId } = useParams<{ snippetId: string }>();
  const navigate = useNavigate();
  const { snippets, folders } = useData();
  
  const snippet = snippets.find(s => s.id === snippetId);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit State
  const [editForm, setEditForm] = useState<Partial<Snippet>>({});

  useEffect(() => {
    if (snippet) {
      setEditForm({ ...snippet });
    }
  }, [snippet]);

  if (!snippet) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-stone-500 mb-4">Item not found.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const folderName = folders.find(f => f.id === snippet.folderId)?.name;

  // Stats
  const wordCount = snippet.content.split(/\s+/).filter(Boolean).length;
  const charCount = snippet.content.length;
  const readTime = Math.ceil(wordCount / 200); // approx 200 words per minute

  const handleToggleFavorite = async () => {
    await updateSnippet(snippet.id, { favorite: !snippet.favorite });
  };

  const handleDelete = async () => {
    await deleteSnippet(snippet.id);
    navigate('/');
  };

  const handleSaveEdit = async () => {
    await updateSnippet(snippet.id, editForm);
    setIsEditing(false);
  };

  const handleUpdateTags = (str: string) => {
    setEditForm(prev => ({ ...prev, tags: str.split(',').map(t => t.trim()).filter(Boolean) }));
  };

  const handleCopyContent = () => {
      navigator.clipboard.writeText(snippet.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // Basic formatter for code blocks in content
  const formatContent = (text: string) => {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
              // Strip backticks
              const code = part.slice(3, -3);
              return (
                  <pre key={index} className="bg-stone-900 text-stone-50 p-4 rounded-xl overflow-x-auto my-4 text-sm font-mono shadow-sm">
                      <code>{code.trim()}</code>
                  </pre>
              );
          }
          return <span key={index}>{part}</span>;
      });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-stone-500 hover:text-stone-800 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <div className="flex gap-4 text-xs text-stone-400 font-medium">
             <span className="flex items-center gap-1"><Type size={12}/> {wordCount} words</span>
             <span className="flex items-center gap-1"><Clock size={12}/> {readTime}m read</span>
        </div>
      </div>

      <div className={`rounded-3xl p-8 md:p-12 shadow-sm transition-all ${snippet.color || 'bg-white'}`}>
         
         <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Chip label={snippet.category} color="white" />
                    {folderName && (
                        <span className="flex items-center gap-1 text-xs font-medium bg-white/50 px-3 py-1 rounded-full text-stone-600 border border-transparent">
                        <Folder size={12} /> {folderName}
                        </span>
                    )}
                </div>
                 <h1 className="text-3xl md:text-5xl font-bold text-stone-800 leading-tight">
                    {snippet.title}
                </h1>
            </div>
            
            <div className="flex gap-2 self-start">
               <button 
                  onClick={handleCopyContent}
                  className="p-3 rounded-2xl bg-white/50 text-stone-600 hover:bg-white transition-colors"
                  title="Copy content"
               >
                   {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20} />}
               </button>
               <button 
                 onClick={handleToggleFavorite} 
                 className={`p-3 rounded-2xl transition-colors ${snippet.favorite ? 'bg-yellow-100 text-yellow-500' : 'bg-white/50 text-stone-400 hover:bg-white'}`}
               >
                  <Star size={20} fill={snippet.favorite ? "currentColor" : "none"} />
               </button>
               <button onClick={() => setIsEditing(true)} className="p-3 rounded-2xl bg-white/50 text-stone-600 hover:bg-white transition-colors">
                  <Edit2 size={20} />
               </button>
               <button onClick={() => setDeleteModalOpen(true)} className="p-3 rounded-2xl bg-white/50 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
               </button>
            </div>
         </div>

         <div className="prose prose-stone prose-lg max-w-none whitespace-pre-wrap text-stone-700 mb-8 leading-relaxed">
           {formatContent(snippet.content)}
         </div>

         <div className="flex flex-wrap gap-2 pt-6 border-t border-black/5">
            {snippet.tags.map(tag => (
              <span key={tag} className="flex items-center text-sm text-stone-500 bg-black/5 px-3 py-1 rounded-full">
                <Tag size={12} className="mr-1" /> {tag}
              </span>
            ))}
            <span className="flex items-center text-sm text-stone-400 ml-auto">
              <Calendar size={12} className="mr-1" />
              Created {new Date(snippet.createdAt).toLocaleDateString()}
            </span>
         </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Item">
        <p className="text-stone-600 mb-6">Are you sure you want to delete this snippet? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
           <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
           <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Item" width="lg">
         <div className="space-y-6">
            <Input 
              value={editForm.title} 
              onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              className="font-bold text-lg"
            />
             <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <Chip 
                    key={cat} label={cat} active={editForm.category === cat} 
                    onClick={() => setEditForm(prev => ({ ...prev, category: cat }))}
                    color="secondary"
                  />
                ))}
            </div>
            <TextArea 
               rows={15} 
               value={editForm.content} 
               onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
               className="font-mono text-sm"
            />
            <Input 
               label="Tags" 
               value={editForm.tags?.join(', ')} 
               onChange={e => handleUpdateTags(e.target.value)}
            />
            <div className="flex gap-2">
                {COLORS.slice(0, 8).map(c => (
                  <button 
                    key={c}
                    onClick={() => setEditForm(prev => ({ ...prev, color: c }))}
                    className={`w-8 h-8 rounded-full border border-stone-100 ${c} ${editForm.color === c ? 'ring-2 ring-stone-400 scale-110' : ''}`}
                  />
                ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
               <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
               <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};

export default SnippetDetail;