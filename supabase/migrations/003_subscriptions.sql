-- CaseCraft Subscriptions & Usage Tracking
-- Migration 003: Billing infrastructure for monetization

-- ENUMS
CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);

CREATE TYPE plan_tier AS ENUM (
  'free', 'solo', 'team', 'enterprise'
);

CREATE TYPE metric_type AS ENUM (
  'chat_messages', 'turbo_simulations', 'full_simulations',
  'hearings', 'tts_minutes', 'documents_embedded'
);

-- TABLES

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100) UNIQUE,
  stripe_subscription_id VARCHAR(100) UNIQUE,
  plan_tier plan_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'trialing',
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage records table
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type metric_type NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  period_start DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plan limits configuration table
CREATE TABLE plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier plan_tier NOT NULL UNIQUE,
  max_cases INTEGER NOT NULL,
  max_messages_per_month INTEGER NOT NULL,
  max_simulations_per_month INTEGER NOT NULL,
  max_hearings_per_month INTEGER NOT NULL,
  max_documents_per_case INTEGER NOT NULL,
  max_tts_minutes_per_month INTEGER NOT NULL,
  max_seats INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_usage_records_user_period ON usage_records(user_id, period_start);
CREATE INDEX idx_usage_records_metric ON usage_records(metric_type, period_start);

-- ROW LEVEL SECURITY
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage subscriptions (webhooks)
CREATE POLICY "Service role manages subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for usage_records
CREATE POLICY "Users can view own usage" ON usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages usage" ON usage_records
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for plan_limits (public read)
CREATE POLICY "Anyone can view plan limits" ON plan_limits
  FOR SELECT USING (true);

CREATE POLICY "Service role manages plan limits" ON plan_limits
  FOR ALL USING (auth.role() = 'service_role');

-- TRIGGERS
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_plan_limits_updated_at
  BEFORE UPDATE ON plan_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- SEED DATA: Plan limits
INSERT INTO plan_limits (plan_tier, max_cases, max_messages_per_month, max_simulations_per_month, max_hearings_per_month, max_documents_per_case, max_tts_minutes_per_month, max_seats, features) VALUES
  ('free', 1, 10, 1, 0, 3, 0, 1, '{"trial_days": 14}'),
  ('solo', 5, 500, 20, 5, 25, 30, 1, '{"priority_support": false, "custom_agents": true}'),
  ('team', 25, 2500, 100, 25, 100, 120, 3, '{"priority_support": true, "custom_agents": true, "analytics": true}'),
  ('enterprise', -1, -1, -1, -1, -1, -1, -1, '{"priority_support": true, "custom_agents": true, "analytics": true, "api_access": true, "sso": true}');

-- FUNCTIONS

-- Get user's current usage for a metric
CREATE OR REPLACE FUNCTION get_user_usage(
  p_user_id UUID,
  p_metric_type metric_type,
  p_period_start DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_usage INTEGER;
BEGIN
  SELECT COALESCE(SUM(quantity), 0) INTO total_usage
  FROM usage_records
  WHERE user_id = p_user_id
    AND metric_type = p_metric_type
    AND period_start = p_period_start;

  RETURN total_usage;
END;
$$;

-- Record usage
CREATE OR REPLACE FUNCTION record_usage(
  p_user_id UUID,
  p_metric_type metric_type,
  p_quantity INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO usage_records (user_id, metric_type, quantity, period_start)
  VALUES (p_user_id, p_metric_type, p_quantity, date_trunc('month', CURRENT_DATE)::DATE);
END;
$$;

-- Check if user has exceeded limit
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_metric_type metric_type
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier plan_tier;
  current_usage INTEGER;
  tier_limit INTEGER;
BEGIN
  -- Get user's plan tier
  SELECT COALESCE(s.plan_tier, 'free') INTO user_tier
  FROM subscriptions s
  WHERE s.user_id = p_user_id;

  IF user_tier IS NULL THEN
    user_tier := 'free';
  END IF;

  -- Get current usage
  SELECT get_user_usage(p_user_id, p_metric_type) INTO current_usage;

  -- Get tier limit based on metric type
  SELECT
    CASE p_metric_type
      WHEN 'chat_messages' THEN max_messages_per_month
      WHEN 'turbo_simulations' THEN max_simulations_per_month
      WHEN 'full_simulations' THEN max_simulations_per_month
      WHEN 'hearings' THEN max_hearings_per_month
      WHEN 'tts_minutes' THEN max_tts_minutes_per_month
      WHEN 'documents_embedded' THEN max_documents_per_case
      ELSE 0
    END INTO tier_limit
  FROM plan_limits
  WHERE plan_tier = user_tier;

  -- -1 means unlimited
  IF tier_limit = -1 THEN
    RETURN false;
  END IF;

  RETURN current_usage >= tier_limit;
END;
$$;

-- Get user's subscription with limits
CREATE OR REPLACE FUNCTION get_user_subscription_with_limits(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_tier plan_tier,
  status subscription_status,
  current_period_end TIMESTAMPTZ,
  max_cases INTEGER,
  max_messages INTEGER,
  max_simulations INTEGER,
  max_hearings INTEGER,
  current_messages INTEGER,
  current_simulations INTEGER,
  current_hearings INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as subscription_id,
    COALESCE(s.plan_tier, 'free'::plan_tier) as plan_tier,
    COALESCE(s.status, 'trialing'::subscription_status) as status,
    s.current_period_end,
    pl.max_cases,
    pl.max_messages_per_month as max_messages,
    pl.max_simulations_per_month as max_simulations,
    pl.max_hearings_per_month as max_hearings,
    get_user_usage(p_user_id, 'chat_messages'::metric_type) as current_messages,
    get_user_usage(p_user_id, 'turbo_simulations'::metric_type) as current_simulations,
    get_user_usage(p_user_id, 'hearings'::metric_type) as current_hearings
  FROM subscriptions s
  RIGHT JOIN plan_limits pl ON pl.plan_tier = COALESCE(s.plan_tier, 'free'::plan_tier)
  WHERE s.user_id = p_user_id OR (s.user_id IS NULL AND pl.plan_tier = 'free');
END;
$$;
