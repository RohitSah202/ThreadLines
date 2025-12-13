import React, { useState } from 'react';
import { auth } from '../firebase';
import { useData } from '../App';
import { Button, Input, Modal } from '../components/UI';
import { wipeUserData } from '../services/db';

const AccountPage: React.FC = () => {
  const { user, userProfile } = useData();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      await auth.currentUser.updateProfile({ displayName });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser || !newPassword) return;
    setIsLoading(true);
    try {
      await auth.currentUser.updatePassword(newPassword);
      setNewPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Requires recent login. Please re-login and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    try {
      const uid = auth.currentUser.uid;
      
      // Use shared service function to ensure correct query permissions
      await wipeUserData(uid);

      // Delete User
      await auth.currentUser.delete();
      // Redirect happens automatically via AuthContext
    } catch (e: any) {
      console.error(e);
      setMessage({ type: 'error', text: 'Please re-login to perform this sensitive action. ' + (e.message || '') });
      setDeleteModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <h1 className="text-3xl font-bold text-stone-800">Account Settings</h1>

      {message.text && (
        <div className={`p-4 rounded-2xl ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
        <h2 className="text-xl font-bold mb-6">Profile</h2>
        <div className="space-y-4">
          <Input 
            label="Display Name" 
            value={displayName} 
            onChange={e => setDisplayName(e.target.value)} 
          />
          <Input 
            label="Email" 
            value={user?.email || ''} 
            disabled 
            className="bg-stone-50 text-stone-400" 
          />
          <div className="pt-2">
            <Button onClick={handleUpdateProfile} isLoading={isLoading}>Save Changes</Button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
        <h2 className="text-xl font-bold mb-6">Security</h2>
        <div className="space-y-4">
          <Input 
            label="New Password" 
            type="password" 
            placeholder="Min 6 characters"
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
          />
          <div className="pt-2">
             <Button variant="secondary" onClick={handleChangePassword} disabled={!newPassword} isLoading={isLoading}>
               Update Password
             </Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
        <h2 className="text-xl font-bold text-red-800 mb-2">Danger Zone</h2>
        <p className="text-red-600 mb-6">
          Permanently delete your account and all your data. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Delete Account
        </Button>
      </section>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-xl text-red-800 text-sm">
            Warning: This will permanently erase all your items, collections, and account information immediately.
          </div>
          <p className="text-stone-600">
            Type <strong>DELETE</strong> to confirm.
          </p>
          <Input 
            placeholder="DELETE" 
            value={deleteConfirmation} 
            onChange={e => setDeleteConfirmation(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount} 
              disabled={deleteConfirmation !== 'DELETE'} 
              isLoading={isLoading}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AccountPage;