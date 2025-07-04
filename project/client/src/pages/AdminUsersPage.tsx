import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Pencil, Trash2, Save, X, User as UserIcon } from 'lucide-react';
import { adminService } from '../services/adminService';

type UserProfile = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const users = await adminService.getUsers();
      setUsers(users);
    } catch (err) {
      console.error('Error fetching user list:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === 'cusinhhh@gmail.com') { // Only admin is allowed to view
      fetchUsers();
    } else {
      setError('You do not have permission to access this page');
      setLoading(false);
    }
  }, [user]);

  // Start editing
  const startEditing = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditData({
      role: user.role,
      user_metadata: { ...user.user_metadata }
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingUserId(null);
    setEditData({});
  };

  // Save changes
  const saveChanges = async (userId: string) => {
    try {
      setError('');
      
      if (editData.role) {
        await adminService.updateUserRole(userId, editData.role);
        
        // Update UI
        setUsers(users.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                role: editData.role as 'admin' | 'user'
              } 
            : u
        ));
      }
      
      setEditingUserId(null);
      setEditData({});
      
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the user');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setIsDeleting(userId);
      
      await adminService.deleteUser(userId);
      
      // Remove from display list
      setUsers(users.filter(u => u.id !== userId));
      
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (user?.email !== 'cusinhhh@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          You do not have permission to access this page
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((userItem) => (
              <tr key={userItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {userItem.user_metadata?.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={userItem.user_metadata.avatar_url}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {userItem.user_metadata?.full_name || 'No name set'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userItem.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUserId === userItem.id ? (
                    <select
                      value={editData.role || 'user'}
                      onChange={(e) => 
                        setEditData({
                          ...editData,
                          role: e.target.value as 'admin' | 'user'
                        })
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userItem.role === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userItem.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(userItem.created_at).toLocaleDateString('en-US')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingUserId === userItem.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => saveChanges(userItem.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => startEditing(userItem)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        title="Edit"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      {userItem.id !== user?.id && (
                        <button
                          onClick={() => deleteUser(userItem.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isDeleting === userItem.id}
                          title="Delete"
                        >
                          {isDeleting === userItem.id ? (
                            <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
