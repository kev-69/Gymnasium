import { Request, Response } from 'express';
import { SubscriptionPlanModel, UserSubscriptionModel, PaymentTransactionModel } from '@/models/Subscription';
import { PublicUserModel, UniversityUserModel } from '@/models/User';
import { CreateSubscriptionRequest, AuthTokenPayload, UniversityUser, PublicUser } from '@/types';
import { PaystackService } from '@/services/paymentService';

export class SubscriptionController {
  // Get all subscription plans
  static async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await SubscriptionPlanModel.findAll();
      
      res.json({
        success: true,
        message: 'Subscription plans retrieved successfully',
        data: plans
      });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription plans'
      });
    }
  }

  // Get subscription plans for a specific user type
  static async getPlansByUserType(req: Request, res: Response): Promise<void> {
    try {
      const { userType } = req.params;
      
      if (!['student', 'staff', 'public'].includes(userType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user type. Must be student, staff, or public'
        });
        return;
      }

      const plans = await SubscriptionPlanModel.findByUserType(userType as 'student' | 'staff' | 'public');
      
      res.json({
        success: true,
        message: `${userType} subscription plans retrieved successfully`,
        data: plans
      });
    } catch (error) {
      console.error('Error fetching subscription plans by user type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription plans'
      });
    }
  }

  // Get user's subscription history
  static async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
    //   const user = (req as any).user as AuthTokenPayload;
      const user = (req as any).user as PublicUser | UniversityUser;
      const subscriptions = await UserSubscriptionModel.findByUserId(user.id);
      
      res.json({
        success: true,
        message: 'User subscriptions retrieved successfully',
        data: subscriptions
      });
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user subscriptions'
      });
    }
  }

  // Get user's active subscription
  static async getActiveSubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user as PublicUser | UniversityUser;
      const activeSubscription = await UserSubscriptionModel.findActiveByUserId(user.id);

      if (!activeSubscription) {
        res.json({
          success: true,
          message: 'No active subscription found',
          data: null
        });
        return;
      }

      res.json({
        success: true,
        message: 'Active subscription retrieved successfully',
        data: activeSubscription
      });
    } catch (error) {
      console.error('Error fetching active subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active subscription'
      });
    }
  }

  // Create a new subscription (initialize payment)
  static async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user as PublicUser | UniversityUser;
      const { planId, autoRenew = false }: CreateSubscriptionRequest = req.body;

      // Get the subscription plan
      const plan = await SubscriptionPlanModel.findById(planId);
      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
        return;
      }

      // Validate user type matches plan
      if (plan.userType !== user.userType) {
        res.status(400).json({
          success: false,
          message: `This plan is only available for ${plan.userType} users`
        });
        return;
      }

      // Check if user already has an active subscription
      const activeSubscription = await UserSubscriptionModel.findActiveByUserId(user.id);
      if (activeSubscription) {
        res.status(409).json({
          success: false,
          message: 'You already have an active subscription'
        });
        return;
      }

      // Generate payment reference
      const paymentReference = PaystackService.generateReference('GYM');

      // Create subscription record
      const subscription = await UserSubscriptionModel.create({
        userId: user.id,
        subscriptionPlanId: planId,
        status: 'pending',
        paymentStatus: 'pending',
        paymentReference,
        amountPaid: plan.priceCedis,
        currency: 'GHS',
        autoRenew
      });

      // For walk-in payments, handle differently (no online payment needed)
      if (plan.durationType === 'walk-in') {
        res.json({
          success: true,
          message: 'Walk-in subscription created. Please proceed to payment at the gym reception.',
          data: {
            subscription,
            plan,
            paymentReference,
            amount: plan.priceCedis,
            currency: 'GHS',
            paymentType: 'walk-in'
          }
        });
        return;
      }

      // For online payments, initialize Paystack payment
      try {
        const paymentData = await PaystackService.initializePayment({
          amount: plan.priceCedis,
          email: user.email,
          reference: paymentReference,
          currency: 'GHS',
          callbackUrl: `${process.env.CLIENT_URL}/subscription/payment-callback`,
          metadata: {
            subscriptionId: subscription.id,
            planId: plan.id,
            planName: plan.name,
            userType: user.userType,
            userId: user.id
          }
        });

        // Create payment transaction record
        await PaymentTransactionModel.create({
          userSubscriptionId: subscription.id,
          paymentReference,
          amount: plan.priceCedis,
          currency: 'GHS',
          status: 'pending'
        });

        res.json({
          success: true,
          message: 'Subscription created successfully. Please complete payment.',
          data: {
            subscription,
            plan,
            payment: {
              paymentReference,
              amount: plan.priceCedis,
              currency: 'GHS',
              paymentUrl: paymentData.data.authorization_url,
              accessCode: paymentData.data.access_code
            }
          }
        });

      } catch (paymentError: any) {
        console.error('Payment initialization failed:', paymentError);
        
        // Update subscription status to failed
        await UserSubscriptionModel.updateStatus(subscription.id, 'cancelled', 'failed');
        
        res.status(500).json({
          success: false,
          message: 'Failed to initialize payment. Please try again.',
          error: paymentError.message
        });
      }

    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription'
      });
    }
  }

  // Verify payment with Paystack
  static async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentReference } = req.params;

      // Find the subscription
      const subscription = await UserSubscriptionModel.findByPaymentReference(paymentReference);
      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
        return;
      }

      // Check if already verified
      if (subscription.status === 'active') {
        res.json({
          success: true,
          message: 'Payment already verified and subscription is active',
          data: { subscription }
        });
        return;
      }

      // Get the plan details
      const plan = await SubscriptionPlanModel.findById(subscription.subscriptionPlanId);
      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
        return;
      }

      // For walk-in payments, manual verification (could be done by admin)
      if (plan.durationType === 'walk-in') {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        // Activate the subscription
        const activatedSubscription = await UserSubscriptionModel.activateSubscription(
          subscription.id,
          startDate,
          endDate
        );

        // Create payment transaction record
        await PaymentTransactionModel.create({
          userSubscriptionId: subscription.id,
          paymentReference,
          amount: plan.priceCedis,
          currency: 'GHS',
          status: 'success',
          paymentMethod: 'walk-in',
          paidAt: new Date()
        });

        res.json({
          success: true,
          message: 'Walk-in payment verified and subscription activated successfully',
          data: {
            subscription: activatedSubscription,
            plan
          }
        });
        return;
      }

      // For online payments, verify with Paystack
      try {
        const paymentVerification = await PaystackService.verifyPayment(paymentReference);

        if (paymentVerification.data.status !== 'success') {
          res.status(400).json({
            success: false,
            message: `Payment verification failed. Status: ${paymentVerification.data.status}`,
            data: {
              status: paymentVerification.data.status,
              reference: paymentReference
            }
          });
          return;
        }

        // Verify amount matches
        const paidAmount = PaystackService.pesewasToCredis(paymentVerification.data.amount);
        if (Math.abs(paidAmount - plan.priceCedis) > 0.01) {
          res.status(400).json({
            success: false,
            message: 'Payment amount mismatch',
            data: {
              expected: plan.priceCedis,
              paid: paidAmount
            }
          });
          return;
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        // Activate the subscription
        const activatedSubscription = await UserSubscriptionModel.activateSubscription(
          subscription.id,
          startDate,
          endDate
        );

        // Update payment transaction record
        await PaymentTransactionModel.updateStatus(
          paymentReference,
          'success',
          JSON.stringify(paymentVerification.data),
          paymentVerification.data.paid_at ? new Date(paymentVerification.data.paid_at) : new Date()
        );

        res.json({
          success: true,
          message: 'Payment verified and subscription activated successfully',
          data: {
            subscription: activatedSubscription,
            plan,
            payment: {
              amount: paidAmount,
              currency: paymentVerification.data.currency,
              paidAt: paymentVerification.data.paid_at,
              channel: paymentVerification.data.channel
            }
          }
        });

      } catch (paymentError: any) {
        console.error('Paystack verification failed:', paymentError);
        
        // Update subscription and transaction status to failed
        await UserSubscriptionModel.updateStatus(subscription.id, 'cancelled', 'failed');
        await PaymentTransactionModel.updateStatus(paymentReference, 'failed', paymentError.message);

        res.status(400).json({
          success: false,
          message: 'Payment verification failed',
          error: paymentError.message
        });
      }

    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    }
  }

  // Paystack webhook handler
  static async handlePaystackWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const payload = req.body;

      // Validate webhook signature
      if (!PaystackService.validateWebhookSignature(JSON.stringify(payload), signature)) {
        res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
        return;
      }

      // Handle the webhook event
      if (payload.event === 'charge.success') {
        const { reference, status, amount, paid_at, channel } = payload.data;

        // Find the subscription
        const subscription = await UserSubscriptionModel.findByPaymentReference(reference);
        if (!subscription) {
          console.log(`Webhook: Subscription not found for reference ${reference}`);
          res.status(404).json({
            success: false,
            message: 'Subscription not found'
          });
          return;
        }

        // Check if already processed
        if (subscription.status === 'active') {
          res.json({
            success: true,
            message: 'Webhook received - subscription already active'
          });
          return;
        }

        // Get the plan details
        const plan = await SubscriptionPlanModel.findById(subscription.subscriptionPlanId);
        if (!plan) {
          res.status(404).json({
            success: false,
            message: 'Subscription plan not found'
          });
          return;
        }

        // Verify amount
        const paidAmount = PaystackService.pesewasToCredis(amount);
        if (Math.abs(paidAmount - plan.priceCedis) > 0.01) {
          console.error(`Webhook: Amount mismatch for ${reference}. Expected: ${plan.priceCedis}, Paid: ${paidAmount}`);
          res.status(400).json({
            success: false,
            message: 'Payment amount mismatch'
          });
          return;
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);

        // Activate the subscription
        await UserSubscriptionModel.activateSubscription(
          subscription.id,
          startDate,
          endDate
        );

        // Update payment transaction
        await PaymentTransactionModel.updateStatus(
          reference,
          'success',
          JSON.stringify(payload.data),
          paid_at ? new Date(paid_at) : new Date()
        );

        console.log(`Webhook: Successfully activated subscription ${subscription.id} for reference ${reference}`);

        // TODO: Send confirmation email to user

        res.json({
          success: true,
          message: 'Webhook processed successfully'
        });

      } else {
        // Handle other webhook events if needed
        console.log(`Webhook: Unhandled event type: ${payload.event}`);
        res.json({
          success: true,
          message: 'Webhook received but not processed'
        });
      }

    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook'
      });
    }
  }
}