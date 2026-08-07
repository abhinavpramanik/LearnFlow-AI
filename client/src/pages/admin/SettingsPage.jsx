import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { Card, PageHeader, Button, Spinner, EmptyState, Alert } from '../../components/common';
import { Settings, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getSettings();
      setSettings(res.data.data || []);
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleEdit = (key, value) => setEdits(e => ({ ...e, [key]: value }));

  const saveSetting = async (key) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      const value = edits[key];
      const parsedValue = !isNaN(value) && value !== '' ? Number(value) : value;
      await settingsService.updateSetting(key, parsedValue);
      toast.success(`Setting "${key}" saved`);
      setEdits(e => { const n = { ...e }; delete n[key]; return n; });
      fetchSettings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save setting'); }
    finally { setSaving(s => ({ ...s, [key]: false })); }
  };

  const categories = [...new Set(settings.map(s => s.category))];

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <PageHeader title="System Settings" subtitle="Configure application-wide settings and thresholds" />

      <Alert type="info" message="Changes to AI thresholds take effect immediately. Use caution when modifying production settings." />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : settings.length === 0 ? (
        <EmptyState icon={Settings} title="No settings found" description="Run the database seed to initialize default settings" />
      ) : (
        categories.map(category => (
          <Card key={category}>
            <h3 className="font-semibold text-white mb-4 capitalize flex items-center gap-2">
              <Settings size={16} className="text-indigo-400" />
              {category} Settings
            </h3>
            <div className="space-y-4">
              {settings.filter(s => s.category === category).map(setting => {
                const currentValue = edits[setting.key] !== undefined ? edits[setting.key] : String(setting.value);
                const isDirty = edits[setting.key] !== undefined;
                return (
                  <div key={setting.key} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-indigo-400 text-xs">{setting.key}</code>
                      </div>
                      {setting.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{setting.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentValue}
                        onChange={e => handleEdit(setting.key, e.target.value)}
                        className={`form-input w-40 text-right ${isDirty ? 'border-amber-500' : ''}`}
                      />
                      {isDirty && (
                        <Button
                          size="sm"
                          icon={Save}
                          loading={saving[setting.key]}
                          onClick={() => saveSetting(setting.key)}
                        >
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}

      <div className="flex justify-end">
        <Button variant="ghost" icon={RefreshCw} onClick={fetchSettings}>Refresh</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
