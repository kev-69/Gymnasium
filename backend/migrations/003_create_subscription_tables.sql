-- Migration for subscription system tables
-- File: 003_create_subscription_tables.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_subscriptions CASCADE;

DROP TABLE IF EXISTS subscription_plans CASCADE;

DROP TABLE IF EXISTS payment_transactions CASCADE;

-- Create subscription plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'staff', 'public')),
    duration_type VARCHAR(20) NOT NULL CHECK (duration_type IN ('walk-in', 'monthly', 'semester', 'half-year', 'yearly')),
    price_cedis DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- Unique constraint to prevent duplicate plans
UNIQUE(user_type, duration_type) );

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL,
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans (id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'active',
            'expired',
            'cancelled',
            'suspended'
        )
    ),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN (
            'pending',
            'completed',
            'failed',
            'refunded'
        )
    ),
    start_date TIMESTAMP
    WITH
        TIME ZONE,
        end_date TIMESTAMP
    WITH
        TIME ZONE,
        payment_reference VARCHAR(255),
        amount_paid DECIMAL(10, 2),
        currency VARCHAR(10) DEFAULT 'GHS',
        auto_renew BOOLEAN DEFAULT false,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_subscription_id UUID NOT NULL REFERENCES user_subscriptions (id),
    payment_reference VARCHAR(255) NOT NULL UNIQUE,
    paystack_reference VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GHS',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'success',
            'failed',
            'abandoned'
        )
    ),
    payment_method VARCHAR(50),
    gateway_response TEXT,
    paid_at TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_subscription_plans_user_type ON subscription_plans (user_type);

CREATE INDEX idx_subscription_plans_active ON subscription_plans (is_active);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions (user_id);

CREATE INDEX idx_user_subscriptions_status ON user_subscriptions (status);

CREATE INDEX idx_user_subscriptions_end_date ON user_subscriptions (end_date);

CREATE INDEX idx_payment_transactions_reference ON payment_transactions (payment_reference);

CREATE INDEX idx_payment_transactions_status ON payment_transactions (status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();