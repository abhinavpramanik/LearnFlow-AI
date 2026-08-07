import { useState, useEffect } from 'react';
import { userService } from '../../services';
import { Card, PageHeader, Button, Spinner, Badge, EmptyState, Pagination, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { Shield, Plus, Search, Trash2, ToggleLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

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
    <AnimatedPage className="space-y-6 pb-10">
      <PageHeader
        title="User Management"
        subtitle="Manage all users and their roles across the organization"
        actions={<Button icon={Plus} onClick={() => setShowCreate(true)}>New User</Button>}
      />

      <Card className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : users.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Shield} title="No users found" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-semibold text-foreground">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4"><Badge label={u.role?.name || 'N/A'} variant={ROLE_COLORS[u.role?.name] || 'neutral'} /></td>
                    <td className="px-6 py-4"><Badge label={u.status} variant={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'error' : 'neutral'} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`p-2 rounded-lg transition-colors ${u.status === 'Active' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                          title={u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          <ToggleLeft size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(u)}
                          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-border">
          <Pagination pagination={pagination} onChange={setPage} />
        </div>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" placeholder="Min 8 chars, uppercase, number, special char" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {['Customer', 'Service Agent', 'Marketing Manager', 'Sales Manager', 'Admin'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button loading={creating} onClick={createUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">Are you sure you want to delete <span className="font-bold text-foreground">{deleteConfirm?.firstName} {deleteConfirm?.lastName}</span>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => deleteUser(deleteConfirm?._id)}>Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default UsersPage;
