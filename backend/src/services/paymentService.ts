import axios from 'axios';
import { PaystackInitializeResponse } from '@/types';

interface PaystackInitializeRequest {
  amount: number; // in kobo (Ghana pesewas)
  email: string;
  reference: string;
  currency?: string;
  callback_url?: string;
  metadata?: any;
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
    currency: string;
    channel: string;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string | null;
    };
    metadata: any;
  };
}

export class PaystackService {
  private static readonly baseURL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
  private static readonly secretKey = process.env.PAYSTACK_SECRET_KEY;

  private static getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Initialize a payment transaction
   */
  static async initializePayment(params: {
    amount: number; // Amount in cedis
    email: string;
    reference: string;
    currency?: string;
    callbackUrl?: string;
    metadata?: any;
  }): Promise<PaystackInitializeResponse> {
    try {
      // Convert amount from cedis to pesewas (multiply by 100)
      const amountInPesewas = Math.round(params.amount * 100);

      const payload: PaystackInitializeRequest = {
        amount: amountInPesewas,
        email: params.email,
        reference: params.reference,
        currency: params.currency || 'GHS',
        callback_url: params.callbackUrl,
        metadata: params.metadata
      };

      console.log('Initializing Paystack payment:', {
        ...payload,
        amount: `${params.amount} GHS (${amountInPesewas} pesewas)`
      });

      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        payload,
        { headers: this.getHeaders() }
      );

      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to initialize payment');
      }

      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to initialize payment with Paystack'
      );
    }
  }

  /**
   * Verify a payment transaction
   */
  static async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      console.log('Verifying Paystack payment:', reference);

      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        { headers: this.getHeaders() }
      );

      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to verify payment');
      }

      return response.data;
    } catch (error: any) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to verify payment with Paystack'
      );
    }
  }

  /**
   * Convert amount from pesewas to cedis
   */
  static pesewasToCredis(pesewas: number): number {
    return pesewas / 100;
  }

  /**
   * Convert amount from cedis to pesewas
   */
  static cedisToPesewas(cedis: number): number {
    return Math.round(cedis * 100);
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency = 'GHS'): string {
    return `${amount.toFixed(2)} ${currency}`;
  }

  /**
   * Generate unique payment reference
   */
  static generateReference(prefix = 'GYM'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Validate webhook signature (for webhook endpoints)
   */
  static validateWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
}