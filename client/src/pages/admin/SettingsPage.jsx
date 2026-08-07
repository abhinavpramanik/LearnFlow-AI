import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { Card, PageHeader, Button, Spinner, EmptyState, Alert, AnimatedPage, AnimatedList, AnimatedListItem } from '../../components/common';
import { Settings, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/input';

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
    <AnimatedPage className="space-y-6 max-w-3xl mx-auto pb-10">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure application-wide settings and thresholds" 
        actions={
          <Button variant="outline" icon={RefreshCw} onClick={fetchSettings} className="hidden sm:flex">Refresh</Button>
        }
      />

      <Alert type="info" message="Changes to AI thresholds take effect immediately. Use caution when modifying production settings." />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : settings.length === 0 ? (
        <Card className="py-12 bg-muted/20 border-dashed border-2">
          <EmptyState icon={Settings} title="No settings found" description="Run the database seed to initialize default settings" />
        </Card>
      ) : (
        <AnimatedList className="space-y-6">
          {categories.map(category => (
            <AnimatedListItem key={category}>
              <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-5 border-b border-border bg-muted/20">
                  <h3 className="font-semibold text-foreground capitalize flex items-center gap-2.5 text-lg">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <Settings size={18} />
                    </div>
                    {category} Settings
                  </h3>
                </div>
                <div className="divide-y divide-border bg-card">
                  {settings.filter(s => s.category === category).map(setting => {
                    const currentValue = edits[setting.key] !== undefined ? edits[setting.key] : String(setting.value);
                    const isDirty = edits[setting.key] !== undefined;
                    return (
                      <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-muted/10 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <code className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-semibold">{setting.key}</code>
                          </div>
                          {setting.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{setting.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Input
                            type="text"
                            value={currentValue}
                            onChange={e => handleEdit(setting.key, e.target.value)}
                            className={`w-full sm:w-48 text-right font-mono text-sm transition-colors ${isDirty ? 'border-amber-500/50 bg-amber-500/5 focus-visible:ring-amber-500/20' : ''}`}
                          />
                          {isDirty && (
                            <Button
                              size="sm"
                              icon={Save}
                              loading={saving[setting.key]}
                              onClick={() => saveSetting(setting.key)}
                              className="shrink-0"
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
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}

      <div className="flex justify-end sm:hidden">
        <Button variant="outline" icon={RefreshCw} onClick={fetchSettings} className="w-full">Refresh Settings</Button>
      </div>
    </AnimatedPage>
  );
};

export default SettingsPage;
