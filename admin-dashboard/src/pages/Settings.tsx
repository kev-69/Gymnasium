import { useState } from 'react';
import { GymConfiguration, type GymConfigData } from '../components/settings/GymConfiguration';
import { PaymentGatewaySettings, type PaymentGatewayData } from '../components/settings/PaymentGatewaySettings';
import { EmailSettings, type EmailSettingsData } from '../components/settings/EmailSettings';
import { NotificationSettings, type NotificationSettingsData } from '../components/settings/NotificationSettings';
import { AdminUserManagement } from '../components/settings/AdminUserManagement';
import { SystemSettings, type SystemSettingsData } from '../components/settings/SystemSettings';

type SettingsTab = 'gym' | 'payment' | 'email' | 'notifications' | 'admin' | 'system';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('gym');

  const handleGymConfigSave = (data: GymConfigData) => {
    console.log('Gym configuration saved:', data);
    alert('Gym configuration saved successfully!');
  };

  const handlePaymentSave = (data: PaymentGatewayData) => {
    console.log('Payment settings saved:', data);
    alert('Payment settings saved successfully!');
  };

  const handleEmailSave = (data: EmailSettingsData) => {
    console.log('Email settings saved:', data);
    alert('Email settings saved successfully!');
  };

  const handleNotificationSave = (data: NotificationSettingsData) => {
    console.log('Notification settings saved:', data);
    alert('Notification settings saved successfully!');
  };

  const handleAdminUsersSave = (users: any[]) => {
    console.log('Admin users saved:', users);
    alert('Admin users saved successfully!');
  };

  const handleSystemSave = (data: SystemSettingsData) => {
    console.log('System settings saved:', data);
    alert('System settings saved successfully!');
  };

  const tabs = [
    { id: 'gym' as const, name: 'Gym Configuration', icon: '🏋️' },
    { id: 'payment' as const, name: 'Payment Gateway', icon: '💳' },
    { id: 'email' as const, name: 'Email Settings', icon: '📧' },
    { id: 'notifications' as const, name: 'Notifications', icon: '🔔' },
    { id: 'admin' as const, name: 'Admin Users', icon: '👥' },
    { id: 'system' as const, name: 'System', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'gym' && <GymConfiguration onSave={handleGymConfigSave} />}
        {activeTab === 'payment' && <PaymentGatewaySettings onSave={handlePaymentSave} />}
        {activeTab === 'email' && <EmailSettings onSave={handleEmailSave} />}
        {activeTab === 'notifications' && <NotificationSettings onSave={handleNotificationSave} />}
        {activeTab === 'admin' && <AdminUserManagement onSave={handleAdminUsersSave} />}
        {activeTab === 'system' && <SystemSettings onSave={handleSystemSave} />}
      </div>
    </div>
  );
}