import { useState, useEffect } from 'react';
import { userService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Pagination, Modal } from '../../components/common';
import { Shield, Plus, Search, UserCog, Trash2, ToggleLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  'Admin': 'error', 'Service Agent': 'info', 'Marketing Manager': 'brand',
  'Sales Manager': 'success', 'Customer': 'neutral'
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Customer' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ page, limit: 15, search });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);
  useEffect(() => { const t = setTimeout(fetchUsers, 400); return () => clearTimeout(t); }, [search]);

  const createUser = async () => {
    if (!form.firstName || !form.email || !form.password) { toast.error('Name, email and password required'); return; }
    setCreating(true);
    try {
      await userService.createUser(form);
      toast.success('User created');
      setShowCreate(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'Customer' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
    finally { setCreating(false); }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await userService.updateStatus(user._id, newStatus);
      toast.success(`User ${newStatus.toLowerCase()}`);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  };

  const deleteUser = async (id) => {
    try {
      await userService.deleteUser(id);
      toast.success('User deleted');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete user'); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage all users and their roles across the organization"
        actions={<Button icon={Plus} onClick={() => setShowCreate(true)}>New User</Button>}
      />

      <Card>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
        </div>
      </Card>

      <Card>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : users.length === 0 ? (
          <EmptyState icon={Shield} title="No users found" />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-medium text-white">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="text-slate-400">{u.email}</td>
                    <td><Badge label={u.role?.name || 'N/A'} variant={ROLE_COLORS[u.role?.name] || 'neutral'} /></td>
                    <td><Badge label={u.status} variant={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'error' : 'neutral'} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStatus(u)}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title={u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          <ToggleLeft size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(u)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onChange={setPage} />
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New User">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">First Name *</label><input type="text" className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div><label className="form-label">Last Name</label><input type="text" className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div><label className="form-label">Email *</label><input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="form-label">Password *</label><input type="password" className="form-input" placeholder="Min 8 chars, uppercase, number, special char" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
          <div>
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {['Customer', 'Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button loading={creating} onClick={createUser} className="flex-1">Create User</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User" size="sm">
        <p className="text-slate-300 mb-6">Are you sure you want to delete <span className="font-bold text-white">{deleteConfirm?.firstName} {deleteConfirm?.lastName}</span>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => deleteUser(deleteConfirm?._id)} className="flex-1">Delete User</Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
