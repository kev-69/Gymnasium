import { useState } from 'react';

interface NotificationSettingsProps {
  onSave: (data: NotificationSettingsData) => void;
}

export interface NotificationSettingsData {
  expiryReminders: {
    enabled: boolean;
    days: number[];
  };
  emailNotifications: {
    newSubscription: boolean;
    paymentReceived: boolean;
    subscriptionExpiring: boolean;
    subscriptionExpired: boolean;
    subscriptionCancelled: boolean;
    paymentFailed: boolean;
    lowBalance: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    senderId: string;
    templates: {
      expiryReminder: boolean;
      paymentConfirmation: boolean;
      subscriptionExpired: boolean;
    };
  };
  pushNotifications: {
    enabled: boolean;
    webPush: boolean;
    mobilePush: boolean;
  };
}

export function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const [config, setConfig] = useState<NotificationSettingsData>({
    expiryReminders: {
      enabled: true,
      days: [7, 3, 1],
    },
    emailNotifications: {
      newSubscription: true,
      paymentReceived: true,
      subscriptionExpiring: true,
      subscriptionExpired: true,
      subscriptionCancelled: true,
      paymentFailed: true,
      lowBalance: false,
    },
    smsNotifications: {
      enabled: false,
      provider: 'twilio',
      apiKey: '',
      senderId: 'UG-GYM',
      templates: {
        expiryReminder: true,
        paymentConfirmation: false,
        subscriptionExpired: true,
      },
    },
    pushNotifications: {
      enabled: false,
      webPush: false,
      mobilePush: false,
    },
  });

  const [showSmsApiKey, setShowSmsApiKey] = useState(false);

  const handleExpiryDaysChange = (day: number, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      expiryReminders: {
        ...prev.expiryReminders,
        days: checked
          ? [...prev.expiryReminders.days, day].sort((a, b) => b - a)
          : prev.expiryReminders.days.filter((d) => d !== day),
      },
    }));
  };

  const handleEmailNotificationChange = (
    key: keyof typeof config.emailNotifications,
    value: boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: value,
      },
    }));
  };

  const handleSmsChange = (field: keyof typeof config.smsNotifications, value: string | boolean) => {
    setConfig((prev) => ({
      ...prev,
      smsNotifications: {
        ...prev.smsNotifications,
        [field]: value,
      },
    }));
  };

  const handleSmsTemplateChange = (
    template: keyof typeof config.smsNotifications.templates,
    value: boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      smsNotifications: {
        ...prev.smsNotifications,
        templates: {
          ...prev.smsNotifications.templates,
          [template]: value,
        },
      },
    }));
  };

  const handlePushChange = (field: keyof typeof config.pushNotifications, value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Expiry Reminder Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subscription Expiry Reminders</h3>
              <p className="text-sm text-gray-600">Configure when to send expiry reminder notifications</p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.expiryReminders.enabled}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    expiryReminders: {
                      ...prev.expiryReminders,
                      enabled: e.target.checked,
                    },
                  }))
                }
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>
        </div>
        <div className="p-6">
          {config.expiryReminders.enabled ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Send reminders before expiry:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[7, 5, 3, 2, 1].map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={config.expiryReminders.days.includes(day)}
                        onChange={(e) => handleExpiryDaysChange(day, e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {day} {day === 1 ? 'day' : 'days'} before
                        </div>
                        <div className="text-sm text-gray-600">Send reminder notification</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Selected reminder schedule:</p>
                    <p>
                      {config.expiryReminders.days.length > 0
                        ? `Reminders will be sent ${config.expiryReminders.days.join(', ')} days before expiry`
                        : 'No reminder days selected'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Expiry reminders are currently disabled</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
          <p className="text-sm text-gray-600">Choose which events trigger email notifications</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">New Subscription</div>
                <div className="text-sm text-gray-600">Send email when a new subscription is created</div>
              </div>
              <input
                type="checkbox"
                checked={config.emailNotifications.newSubscription}
                onChange={(e) => handleEmailNotificationChange('newSubscription', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Payment Received</div>
                <div className="text-sm text-gray-600">Send confirmation email after successful payment</div>
              </div>
              <input
                type="checkbox"
                checked={config.emailNotifications.paymentReceived}
                onChange={(e) => handleEmailNotificationChange('paymentReceived', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Subscription Expiring Soon</div>
                <div className="text-sm text-gray-600">Send reminders before subscription expires</div>
              </div>
              <input
                type="checkbox"
                checked={config.emailNotifications.subscriptionExpiring}
                onChange={(e) => handleEmailNotificationChange('subscriptionExpiring', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Subscription Expired</div>
                <div className="text-sm text-gray-600">Send notification when subscription expires</div>
              </div>
              <input
                type="checkbox"
                checked={config.emailNotifications.subscriptionExpired}
                onChange={(e) => handleEmailNotificationChange('subscriptionExpired', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Subscription Cancelled</div>
                <div className="text-sm text-gray-600">Send notification when subscription is cancelled</div>
              </div>
              <input
                type="checkbox"
                checked={config.emailNotifications.subscriptionCancelled}
                onChange={(e) => handleEmailNotificationChange('subscriptionCancelled', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Payment Failed</div>
                <div className="text-sm text-gray-600">Send notification when payment fails</div>
              </div>
              <input
                type="checkbox"
                checked={config.emailNotifications.paymentFailed}
                onChange={(e) => handleEmailNotificationChange('paymentFailed', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Low Balance Alert (Admin)</div>
                <div className="text-sm text-gray-600">Send alert to admin when account balance is low</div>
              </div>
              <input
                type="checkbox"
                checked={config.emailNotifications.lowBalance}
                onChange={(e) => handleEmailNotificationChange('lowBalance', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-600">Configure SMS alerts via your SMS provider</p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.smsNotifications.enabled}
                onChange={(e) => handleSmsChange('enabled', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>
        </div>
        <div className="p-6">
          {config.smsNotifications.enabled ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMS Provider</label>
                <select
                  value={config.smsNotifications.provider}
                  onChange={(e) => handleSmsChange('provider', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="twilio">Twilio</option>
                  <option value="africastalking">Africa's Talking</option>
                  <option value="hubtel">Hubtel</option>
                  <option value="arkesel">Arkesel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <div className="relative mt-1">
                  <input
                    type={showSmsApiKey ? 'text' : 'password'}
                    value={config.smsNotifications.apiKey}
                    onChange={(e) => handleSmsChange('apiKey', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSmsApiKey ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sender ID</label>
                <input
                  type="text"
                  value={config.smsNotifications.senderId}
                  onChange={(e) => handleSmsChange('senderId', e.target.value)}
                  maxLength={11}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UG-GYM"
                />
                <p className="mt-1 text-sm text-gray-500">Maximum 11 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">SMS Templates</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.smsNotifications.templates.expiryReminder}
                      onChange={(e) => handleSmsTemplateChange('expiryReminder', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Expiry Reminder SMS</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.smsNotifications.templates.paymentConfirmation}
                      onChange={(e) => handleSmsTemplateChange('paymentConfirmation', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Payment Confirmation SMS</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.smsNotifications.templates.subscriptionExpired}
                      onChange={(e) => handleSmsTemplateChange('subscriptionExpired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Subscription Expired SMS</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>SMS notifications are currently disabled</p>
            </div>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">Enable browser and mobile push notifications</p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.pushNotifications.enabled}
                onChange={(e) => handlePushChange('enabled', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enabled</span>
            </label>
          </div>
        </div>
        <div className="p-6">
          {config.pushNotifications.enabled ? (
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushNotifications.webPush}
                  onChange={(e) => handlePushChange('webPush', e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Web Push Notifications</div>
                  <div className="text-sm text-gray-600">Send notifications to web browsers</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pushNotifications.mobilePush}
                  onChange={(e) => handlePushChange('mobilePush', e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Mobile Push Notifications</div>
                  <div className="text-sm text-gray-600">Send notifications to mobile apps</div>
                </div>
              </label>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Push notifications are currently disabled</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Notification Settings
        </button>
      </div>
    </form>
  );
}
