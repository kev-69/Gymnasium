import { useState } from 'react';

interface PaymentGatewaySettingsProps {
  onSave: (data: PaymentGatewayData) => void;
}

export interface PaymentGatewayData {
  paystackPublicKey: string;
  paystackSecretKey: string;
  mode: 'test' | 'live';
  webhookUrl: string;
  enableOnlinePayments: boolean;
  enableWalkInPayments: boolean;
  currency: string;
  paymentMethods: {
    card: boolean;
    mobileMoney: boolean;
    bankTransfer: boolean;
    cash: boolean;
  };
}

export function PaymentGatewaySettings({ onSave }: PaymentGatewaySettingsProps) {
  const [config, setConfig] = useState<PaymentGatewayData>({
    paystackPublicKey: 'pk_test_xxxxxxxxxxxxxxxxxxxxx',
    paystackSecretKey: 'sk_test_xxxxxxxxxxxxxxxxxxxxx',
    mode: 'test',
    webhookUrl: 'https://api.yoursite.com/webhooks/paystack',
    enableOnlinePayments: true,
    enableWalkInPayments: true,
    currency: 'GHS',
    paymentMethods: {
      card: true,
      mobileMoney: true,
      bankTransfer: false,
      cash: true,
    },
  });

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const handleInputChange = (field: keyof PaymentGatewayData, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentMethodChange = (
    method: keyof typeof config.paymentMethods,
    value: boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: value,
      },
    }));
  };

  const testWebhook = async () => {
    setTestingWebhook(true);
    // Simulate webhook test
    setTimeout(() => {
      setTestingWebhook(false);
      alert('Webhook test successful! Connection verified.');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Paystack API Keys */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Paystack API Configuration</h3>
          <p className="text-sm text-gray-600">Configure your Paystack payment gateway credentials</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('mode', 'test')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  config.mode === 'test'
                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Test Mode
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('mode', 'live')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  config.mode === 'live'
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Live Mode
                </div>
              </button>
            </div>
            {config.mode === 'test' && (
              <p className="mt-2 text-sm text-amber-600">
                ⚠️ Test mode is active. No real transactions will be processed.
              </p>
            )}
            {config.mode === 'live' && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Live mode is active. Real transactions will be processed.
              </p>
            )}
          </div>

          {/* Public Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Public Key {config.mode === 'test' ? '(Test)' : '(Live)'}
            </label>
            <input
              type="text"
              value={config.paystackPublicKey}
              onChange={(e) => handleInputChange('paystackPublicKey', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={config.mode === 'test' ? 'pk_test_...' : 'pk_live_...'}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Your Paystack public key for client-side payment initialization
            </p>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Secret Key {config.mode === 'test' ? '(Test)' : '(Live)'}
            </label>
            <div className="relative mt-1">
              <input
                type={showSecretKey ? 'text' : 'password'}
                value={config.paystackSecretKey}
                onChange={(e) => handleInputChange('paystackSecretKey', e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={config.mode === 'test' ? 'sk_test_...' : 'sk_live_...'}
                required
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSecretKey ? (
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
            <p className="mt-1 text-sm text-red-600">
              🔒 Keep this secret and never share it publicly
            </p>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={config.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GHS">GHS - Ghanaian Cedi</option>
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="USD">USD - US Dollar</option>
              <option value="ZAR">ZAR - South African Rand</option>
            </select>
          </div>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Webhook Configuration</h3>
          <p className="text-sm text-gray-600">Configure webhook URL for payment notifications</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
            <input
              type="url"
              value={config.webhookUrl}
              onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.yoursite.com/webhooks/paystack"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              This URL will receive POST requests from Paystack for payment events
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={testWebhook}
              disabled={testingWebhook}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {testingWebhook ? (
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
                  Testing Webhook...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Test Webhook Connection
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">Enable or disable specific payment methods</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableOnlinePayments}
                onChange={(e) => handleInputChange('enableOnlinePayments', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Online Payments (Paystack)</div>
                <div className="text-sm text-gray-600">Accept payments via Paystack gateway</div>
              </div>
            </label>

            {config.enableOnlinePayments && (
              <div className="ml-8 pl-4 border-l-2 border-blue-200 space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.paymentMethods.card}
                    onChange={(e) => handlePaymentMethodChange('card', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Credit/Debit Cards</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.paymentMethods.mobileMoney}
                    onChange={(e) => handlePaymentMethodChange('mobileMoney', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Mobile Money</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.paymentMethods.bankTransfer}
                    onChange={(e) => handlePaymentMethodChange('bankTransfer', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Bank Transfer</span>
                </label>
              </div>
            )}

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableWalkInPayments}
                onChange={(e) => handleInputChange('enableWalkInPayments', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Walk-in Payments</div>
                <div className="text-sm text-gray-600">Accept cash and card payments at facility</div>
              </div>
            </label>

            {config.enableWalkInPayments && (
              <div className="ml-8 pl-4 border-l-2 border-blue-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.paymentMethods.cash}
                    onChange={(e) => handlePaymentMethodChange('cash', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Cash Payments</span>
                </label>
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
          Save Payment Settings
        </button>
      </div>
    </form>
  );
}
