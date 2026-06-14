import React, { useState, useEffect } from 'react';

// Swap this URL with your live Render backend URL once deployed!
const API_BASE_URL = 'http://localhost:8080/api/users';

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Automatically fetches user list when the component loads
  useEffect(() => {
    fetchUsers();
  }, []);

  // READ (Find All)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // READ (Find By ID)
  const handleFindById = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    setSearchLoading(true);
    setSearchedUser(null);
    try {
      // Will take 4 seconds on first hit, instant on cached hits!
      const response = await fetch(`${API_BASE_URL}/${searchId}`);
      if (response.ok) {
        const data = await response.json();
        setSearchedUser(data);
      } else {
        alert("User not found or invalid ID!");
      }
    } catch (error) {
      console.error("Error searching user:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // CREATE and UPDATE (Handles page refresh via state reload)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email };

    try {
      if (editingId) {
        // UPDATE Method
        await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setEditingId(null);
      } else {
        // CREATE Method
        await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // Clear inputs
      setName('');
      setEmail('');

      // REFRESH PAGE DATA
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // DELETE (Handles page refresh via state reload)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      // REFRESH PAGE DATA
      fetchUsers();
      // Clear search display if the deleted user was pulled up
      if (searchedUser && searchedUser.id === id) {
        setSearchedUser(null);
        setSearchId('');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Pre-fill fields for Editing
  const startEdit = (user) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">User Management System (Java 17 Records & Caffeine Cache)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section A: Create / Edit Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              {editingId ? "Update User Details" : "Create New User"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md focus:outline-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full p-2 text-white font-semibold rounded-md ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {editingId ? "Update & Refresh" : "Save & Refresh"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setName(''); setEmail(''); }}
                  className="w-full p-2 bg-gray-300 text-gray-700 font-semibold rounded-md mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Section B: Find User By ID (Cache Tester) */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-purple-600">Find User By ID</h2>
              <p className="text-xs text-gray-500 mb-4">Note: First hit takes 4s due to Thread.sleep(). Consecutive hits are instant thanks to Caffeine Cache!</p>
              <form onSubmit={handleFindById} className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter User ID (e.g. 1)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-purple-500"
                  required
                />
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                  Search
                </button>
              </form>
            </div>

            <div className="mt-4 p-4 border border-dashed rounded-md bg-gray-50 min-h-[100px] flex items-center justify-center">
              {searchLoading && <p className="text-purple-600 animate-pulse font-medium">Loading Database (4-second delay sequence)...</p>}
              {!searchLoading && !searchedUser && <p className="text-gray-400 text-sm">Search results will view here.</p>}
              {!searchLoading && searchedUser && (
                <div className="w-full">
                  <p className="text-sm font-bold text-gray-700">User Verified (Fetched instantly if cached):</p>
                  <p className="text-gray-600">ID: {searchedUser.id}</p>
                  <p className="text-gray-600">Name: {searchedUser.name}</p>
                  <p className="text-gray-600">Email: {searchedUser.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section C: Find All Display */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">All Database Records</h2>
            <button onClick={fetchUsers} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded">
              Force Reload List
            </button>
          </div>

          {loading ? (
            <p className="text-center py-4 text-gray-500">Loading active directory...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No records found inside MongoDB Atlas collection.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-sm font-semibold text-gray-600">Auto ID</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-mono text-sm text-gray-700">{user.id}</td>
                      <td className="p-3 text-gray-800">{user.name}</td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3 flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-3 py-1 text-xs font-medium rounded"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 text-xs font-medium rounded"
                        >
                          Delete & Refresh
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}