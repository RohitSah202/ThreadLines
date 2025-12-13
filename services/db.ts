import firebase from '../firebase';
import { db, auth } from '../firebase';
import { Snippet, Folder } from '../types';

// Snippets
export const createSnippet = async (data: Partial<Snippet>) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const snippetData = {
    ...data,
    userId: auth.currentUser.uid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pinned: data.pinned || false,
    favorite: data.favorite || false,
    tags: data.tags || [],
    category: data.category || 'General',
  };

  return await db.collection('snippets').add(snippetData);
};

export const updateSnippet = async (id: string, data: Partial<Snippet>) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  await db.collection('snippets').doc(id).update({
    ...data,
    updatedAt: Date.now(),
  });
};

export const deleteSnippet = async (id: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  await db.collection('snippets').doc(id).delete();
};

// Folders
export const createFolder = async (name: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  
  const folderData = {
    userId: auth.currentUser.uid,
    name,
    createdAt: Date.now(),
  };

  return await db.collection('folders').add(folderData);
};

export const updateFolder = async (id: string, name: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  await db.collection('folders').doc(id).update({ name });
};

export const deleteFolder = async (id: string) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    
    const batch = db.batch();
    
    // 1. Find snippets in this folder
    // FIX: Must filter by userId to satisfy Firestore Security Rules
    const snippetsSnap = await db.collection('snippets')
        .where('folderId', '==', id)
        .where('userId', '==', auth.currentUser.uid)
        .get();
    
    snippetsSnap.forEach((doc) => {
        batch.update(doc.ref, { folderId: null });
    });

    // 2. Delete Folder
    const folderRef = db.collection('folders').doc(id);
    batch.delete(folderRef);

    await batch.commit();
};

// Account Deletion
export const wipeUserData = async (uid: string) => {
    // 1. Delete all snippets
    const snippetsSnap = await db.collection('snippets').where('userId', '==', uid).get();
    const foldersSnap = await db.collection('folders').where('userId', '==', uid).get();
    
    const batch = db.batch();
    snippetsSnap.forEach(doc => batch.delete(doc.ref));
    foldersSnap.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    return true;
}