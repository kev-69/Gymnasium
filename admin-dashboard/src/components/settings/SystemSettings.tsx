import { useState } from 'react';

interface SystemSettingsProps {
  onSave: (data: SystemSettingsData) => void;
}

export interface SystemSettingsData {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  autoBackup: boolean;
  systemLogs: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'error' | 'warning' | 'info' | 'debug';
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiry: number;
    twoFactorAuth: boolean;
  };
}

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  user?: string;
}

export function SystemSettings({ onSave }: SystemSettingsProps) {
  const [config, setConfig] = useState<SystemSettingsData>({
    maintenanceMode: false,
    maintenanceMessage: 'System is currently under maintenance. We will be back shortly.',
    backupSchedule: 'daily',
    backupTime: '02:00',
    autoBackup: true,
    systemLogs: {
      enabled: true,
      retentionDays: 30,
      logLevel: 'info',
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      twoFactorAuth: false,
    },
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: '2024-10-15 10:30:25',
      level: 'info',
      message: 'User login successful',
      user: 'admin@ug-gym.edu.gh',
    },
    {
      id: 2,
      timestamp: '2024-10-15 10:25:18',
      level: 'success',
      message: 'Database backup completed successfully',
    },
    {
      id: 3,
      timestamp: '2024-10-15 10:15:42',
      level: 'warning',
      message: 'High memory usage detected - 85%',
    },
    {
      id: 4,
      timestamp: '2024-10-15 09:58:33',
      level: 'error',
      message: 'Failed to send email notification',
      user: 'system',
    },
    {
      id: 5,
      timestamp: '2024-10-15 09:45:12',
      level: 'info',
      message: 'Payment processed successfully - GH₵150.00',
    },
  ]);

  const [backingUp, setBackingUp] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);

  const handleInputChange = (field: keyof SystemSettingsData, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSystemLogsChange = (field: keyof typeof config.systemLogs, value: any) => {
    setConfig((prev) => ({
      ...prev,
      systemLogs: {
        ...prev.systemLogs,
        [field]: value,
      },
    }));
  };

  const handleSecurityChange = (field: keyof typeof config.security, value: any) => {
    setConfig((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value,
      },
    }));
  };

  const triggerBackup = async () => {
    setBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      setBackingUp(false);
      alert('Database backup completed successfully!');
      // Add log entry
      const newLog: LogEntry = {
        id: logs.length + 1,
        timestamp: new Date().toLocaleString(),
        level: 'success',
        message: 'Manual database backup completed',
        user: 'admin',
      };
      setLogs([newLog, ...logs]);
    }, 3000);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all system logs?')) {
      setClearingLogs(true);
      setTimeout(() => {
        setLogs([]);
        setClearingLogs(false);
        alert('System logs cleared successfully!');
      }, 1000);
    }
  };

  const exportLogs = () => {
    const logData = logs.map((log) => `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Maintenance Mode */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">Enable maintenance mode to restrict access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <div className="p-6">
          {config.maintenanceMode && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">⚠️ Maintenance mode is active</p>
                    <p>Users will not be able to access the system</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maintenance Message</label>
                <textarea
                  value={config.maintenanceMessage}
                  onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message to display to users..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Database Backup */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Database Backup</h3>
          <p className="text-sm text-gray-600">Configure automatic database backups</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.autoBackup}
                onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable Automatic Backups</span>
            </label>
          </div>

          {config.autoBackup && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Backup Schedule</label>
                <select
                  value={config.backupSchedule}
                  onChange={(e) =>
                    handleInputChange('backupSchedule', e.target.value as SystemSettingsData['backupSchedule'])
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Backup Time</label>
                <input
                  type="time"
                  value={config.backupTime}
                  onChange={(e) => handleInputChange('backupTime', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={triggerBackup}
              disabled={backingUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {backingUp ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Backup...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Trigger Manual Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* System Logs Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
          <p className="text-sm text-gray-600">Configure system logging settings</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.systemLogs.enabled}
                onChange={(e) => handleSystemLogsChange('enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable System Logging</span>
            </label>
          </div>

          {config.systemLogs.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Log Level</label>
                <select
                  value={config.systemLogs.logLevel}
                  onChange={(e) =>
                    handleSystemLogsChange('logLevel', e.target.value)
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="error">Error Only</option>
                  <option value="warning">Warning & Above</option>
                  <option value="info">Info & Above</option>
                  <option value="debug">Debug (All)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Retention Period (Days)</label>
                <input
                  type="number"
                  value={config.systemLogs.retentionDays}
                  onChange={(e) => handleSystemLogsChange('retentionDays', parseInt(e.target.value))}
                  min="1"
                  max="365"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          <p className="text-sm text-gray-600">Configure security and authentication settings</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
              <input
                type="number"
                value={config.security.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="120"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
              <input
                type="number"
                value={config.security.maxLoginAttempts}
                onChange={(e) => handleSecurityChange('maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password Expiry (days)</label>
              <input
                type="number"
                value={config.security.passwordExpiry}
                onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                min="30"
                max="365"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.security.twoFactorAuth}
                  onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Logs Viewer */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Logs Viewer</h3>
            <p className="text-sm text-gray-600">View recent system activity and events</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportLogs}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
            <button
              type="button"
              onClick={clearLogs}
              disabled={clearingLogs}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
            >
              {clearingLogs ? 'Clearing...' : 'Clear Logs'}
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogBadgeColor(
                      log.level
                    )}`}
                  >
                    {log.level.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                      {log.user && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{log.user}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No system logs available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save System Settings
        </button>
      </div>
    </form>
  );
}
