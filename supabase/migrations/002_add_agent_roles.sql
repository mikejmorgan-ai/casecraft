-- Migration: Add new agent roles for multi-agent legal analysis system
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Add new roles to the agent_role enum
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'law_clerk';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'county_recorder';
ALTER TYPE agent_role ADD VALUE IF NOT EXISTS 'dogm_agent';

-- Verify the enum values
SELECT unnest(enum_range(NULL::agent_role)) AS agent_roles;
