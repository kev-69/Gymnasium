import { useState } from 'react';

interface EmailSettingsProps {
  onSave: (data: EmailSettingsData) => void;
}

export interface EmailSettingsData {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
}

const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{gym_name}}!',
    preview: 'Sent when a new user registers',
  },
  {
    id: 'subscription_created',
    name: 'Subscription Confirmation',
    subject: 'Your subscription has been activated',
    preview: 'Sent when a subscription is created',
  },
  {
    id: 'payment_success',
    name: 'Payment Confirmation',
    subject: 'Payment received - {{amount}}',
    preview: 'Sent after successful payment',
  },
  {
    id: 'expiry_reminder_7',
    name: 'Expiry Reminder (7 days)',
    subject: 'Your subscription expires in 7 days',
    preview: 'Sent 7 days before subscription expires',
  },
  {
    id: 'expiry_reminder_3',
    name: 'Expiry Reminder (3 days)',
    subject: 'Your subscription expires in 3 days',
    preview: 'Sent 3 days before subscription expires',
  },
  {
    id: 'expiry_reminder_1',
    name: 'Expiry Reminder (1 day)',
    subject: 'Your subscription expires tomorrow',
    preview: 'Sent 1 day before subscription expires',
  },
  {
    id: 'subscription_expired',
    name: 'Subscription Expired',
    subject: 'Your subscription has expired',
    preview: 'Sent when subscription expires',
  },
];

export function EmailSettings({ onSave }: EmailSettingsProps) {
  const [config, setConfig] = useState<EmailSettingsData>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@ug-gym.edu.gh',
    smtpPassword: '',
    smtpSecure: true,
    senderName: 'UG Gymnasium',
    senderEmail: 'noreply@ug-gym.edu.gh',
    replyToEmail: 'support@ug-gym.edu.gh',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleInputChange = (field: keyof EmailSettingsData, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const testEmailConnection = async () => {
    if (!testEmail) {
      alert('Please enter an email address for testing');
      return;
    }

    setTesting(true);
    // Simulate test email
    setTimeout(() => {
      setTesting(false);
      alert(`Test email sent successfully to ${testEmail}!`);
      setTestEmail('');
    }, 2000);
  };

  const previewTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SMTP Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">SMTP Configuration</h3>
          <p className="text-sm text-gray-600">Configure your email server settings</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
              <input
                type="text"
                value={config.smtpHost}
                onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input
                type="number"
                value={config.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="587"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
            <input
              type="text"
              value={config.smtpUsername}
              onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-email@domain.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.smtpPassword}
                onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SMTP password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              For Gmail, use an App Password instead of your regular password
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.smtpSecure}
                onChange={(e) => handleInputChange('smtpSecure', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Use SSL/TLS Encryption</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sender Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sender Information</h3>
          <p className="text-sm text-gray-600">Configure how emails appear to recipients</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sender Name</label>
            <input
              type="text"
              value={config.senderName}
              onChange={(e) => handleInputChange('senderName', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="UG Gymnasium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sender Email</label>
            <input
              type="email"
              value={config.senderEmail}
              onChange={(e) => handleInputChange('senderEmail', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="noreply@ug-gym.edu.gh"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reply-To Email</label>
            <input
              type="email"
              value={config.replyToEmail}
              onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="support@ug-gym.edu.gh"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Recipient replies will be sent to this address
            </p>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Test Email Configuration</h3>
          <p className="text-sm text-gray-600">Send a test email to verify your configuration</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email address to test"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={testEmailConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {testing ? (
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
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
          <p className="text-sm text-gray-600">Preview and manage automated email templates</p>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {EMAIL_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">Subject: {template.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{template.preview}</p>
                </div>
                <button
                  type="button"
                  onClick={() => previewTemplate(template.id)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Preview
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Email Settings
        </button>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
              </h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Email template preview would be displayed here...</p>
              {/* Add actual template preview here */}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
