-- Seed data for `pnpm dev:local`. Only ever runs against the local Docker
-- Postgres that scripts/dev-local.sh starts.
--
-- Sign in at http://localhost:3000 with:
--   email:    dev@coderscreen.test
--   password: localdev-password
-- (dev-local.sh creates that user through the sign-up endpoint before this runs.)
--
-- Billing rows are inserted directly so nothing calls Stripe. Times are
-- relative to when the seed runs; `pnpm dev:local --reset` reseeds.

\set ON_ERROR_STOP on

update "user" set email_verified = true, is_onboarded = true where email = 'dev@coderscreen.test';

insert into plans (id, created_at, name, stripe_price_id, price, interval, "group", is_active, limits)
values ('free', now(), 'Free', 'price_local_free', 0, 'monthly', 'free', true,
        '{"live_interview":1000,"assessment_invite":1000,"team_members":1000}');

insert into organization (id, name, created_at) values ('org_local', 'Local Dev Org', now());
insert into member (id, organization_id, user_id, role, created_at)
select 'mem_local', 'org_local', id, 'owner', now() from "user" where email = 'dev@coderscreen.test';
insert into customers (organization_id, created_at, stripe_customer_id, email)
values ('org_local', now(), 'cus_local', 'dev@coderscreen.test');
insert into subscriptions (id, created_at, updated_at, plan_id, stripe_customer_id, stripe_subscription_id,
  stripe_subscription_item_id, status, current_period_start, current_period_end)
values ('sub_local', now(), now(), 'free', 'cus_local', 'stripe_sub_local', 'stripe_si_local', 'active',
  now() - interval '1 day', now() + interval '10 years');

-- An assessment with one candidate in each state the submissions list shows.
insert into assessments (id, organization_id, created_by_user_id, title, status, time_limit_seconds)
select 'as_local', 'org_local', id, 'Backend Screen', 'active', 3600
from "user" where email = 'dev@coderscreen.test';

insert into question_library (id, created_at, updated_at, organization_id, title, description, function_name, return_type)
values ('ql_two', now(), now(), 'org_local', 'Two Sum', '{}', 'twoSum', 'int[]'),
       ('ql_paren', now(), now(), 'org_local', 'Valid Parentheses', '{}', 'isValid', 'bool');
insert into assessment_questions (id, created_at, updated_at, assessment_id, organization_id, question_id, position, points)
values ('aq_two', now(), now(), 'as_local', 'org_local', 'ql_two', 0, 100),
       ('aq_paren', now(), now(), 'as_local', 'org_local', 'ql_paren', 1, 100);

-- Publishing (and reopening) requires a test case on every question.
insert into question_library_test_cases (id, created_at, updated_at, question_id, label, args, expected_return, is_hidden, position) values
  ('qltc_two_1', now(), now(), 'ql_two', 'Basic', '[[2, 7, 11, 15], 9]', '[0, 1]', false, 0),
  ('qltc_two_2', now(), now(), 'ql_two', 'Negatives', '[[-3, 4, 3, 90], 0]', '[0, 2]', true, 1),
  ('qltc_paren_1', now(), now(), 'ql_paren', 'Simple', '["()"]', 'true', false, 0),
  ('qltc_paren_2', now(), now(), 'ql_paren', 'Unclosed', '["(("]', 'false', true, 1);

insert into candidates (id, created_at, updated_at, organization_id, name, email) values
  ('cand_ada', now(), now(), 'org_local', 'Ada Park', 'ada@candidate.test'),
  ('cand_ben', now(), now(), 'org_local', 'Ben Ortiz', 'ben@candidate.test'),
  ('cand_cy', now(), now(), 'org_local', 'Cy Liu', 'cy@candidate.test'),
  ('cand_dee', now(), now(), 'org_local', 'Dee Shah', 'dee@candidate.test'),
  ('cand_eli', now(), now(), 'org_local', 'Eli Brooks', 'eli@candidate.test'),
  ('cand_fay', now(), now(), 'org_local', 'Fay Kim', 'fay@candidate.test');

insert into assessment_submissions (id, created_at, updated_at, assessment_id, organization_id, candidate_id,
  status, selected_language, started_at, submitted_at, expires_at, total_score, max_score, access_token,
  grading_notes, decision, reviewed_at)
values
  -- Submitted, waiting for review
  ('asub_ada', now() - interval '3 hours', now(), 'as_local', 'org_local', 'cand_ada', 'submitted', 'python',
     now() - interval '3 hours', now() - interval '2 hours 18 minutes', now() - interval '2 hours',
     175, 200, 'tok_local_ada', '', null, null),
  ('asub_ben', now() - interval '2 days', now(), 'as_local', 'org_local', 'cand_ben', 'submitted', 'python',
     now() - interval '2 days', now() - interval '2 days' + interval '51 minutes', now() - interval '1 day 23 hours',
     100, 200, 'tok_local_ben', '', null, null),
  -- Still working (its timer is relative to seed time)
  ('asub_cy', now() - interval '20 minutes', now(), 'as_local', 'org_local', 'cand_cy', 'in_progress', 'python',
     now() - interval '20 minutes', null, now() + interval '40 minutes', null, null, 'tok_local_cy', '', null, null),
  -- Invited, hasn't started. Open /take/asub_dee?token=tok_local_dee to take it as the candidate.
  ('asub_dee', now() - interval '1 day', now(), 'as_local', 'org_local', 'cand_dee', 'not_started', null,
     null, null, null, null, null, 'tok_local_dee', '', null, null),
  -- Ran out of time but still marked in progress: the first page load or cron run expires it.
  ('asub_eli', now() - interval '80 minutes', now(), 'as_local', 'org_local', 'cand_eli', 'in_progress', 'python',
     now() - interval '80 minutes', null, now() - interval '20 minutes', null, null, 'tok_local_eli', '', null, null),
  -- Already reviewed
  ('asub_fay', now() - interval '5 days', now(), 'as_local', 'org_local', 'cand_fay', 'submitted', 'python',
     now() - interval '5 days', now() - interval '5 days' + interval '33 minutes', now() - interval '5 days' + interval '1 hour',
     200, 200, 'tok_local_fay', 'Clean and fast.', 'advance', now() - interval '4 days');

insert into question_submissions (id, created_at, updated_at, submission_id, question_id, organization_id, code, language, score, max_score, is_draft) values
  ('qs_ada_two_1', now() - interval '2 hours 40 minutes', now(), 'asub_ada', 'aq_two', 'org_local',
   E'def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n', 'python', 3, 4, false),
  ('qs_ada_two_2', now() - interval '2 hours 30 minutes', now(), 'asub_ada', 'aq_two', 'org_local',
   E'def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n', 'python', 4, 4, false),
  ('qs_ada_paren', now() - interval '2 hours 20 minutes', now(), 'asub_ada', 'aq_paren', 'org_local',
   E'def isValid(s):\n    stack = []\n    pairs = {")": "(", "]": "[", "}": "{"}\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n        else:\n            stack.append(c)\n    return True\n', 'python', 3, 4, false),
  ('qs_ben_two', now() - interval '2 days', now(), 'asub_ben', 'aq_two', 'org_local',
   E'def twoSum(nums, target):\n    return [0, 1]\n', 'python', 2, 4, false),
  ('qs_eli_two', now() - interval '60 minutes', now(), 'asub_eli', 'aq_two', 'org_local',
   E'def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n', 'python', 4, 4, false),
  ('qs_fay_two', now() - interval '5 days', now(), 'asub_fay', 'aq_two', 'org_local',
   E'def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n', 'python', 4, 4, false),
  ('qs_fay_paren', now() - interval '5 days', now(), 'asub_fay', 'aq_paren', 'org_local',
   E'def isValid(s):\n    stack = []\n    pairs = {")": "(", "]": "[", "}": "{"}\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop() != pairs[c]:\n                return False\n        else:\n            stack.append(c)\n    return not stack\n', 'python', 4, 4, false);

insert into test_case_results (id, organization_id, question_submission_id, passed, failure_reason, actual_output, label, args, expected_return, is_hidden, position) values
  ('tcr_ada_1', 'org_local', 'qs_ada_paren', true, 'passed', 'true', 'Simple', '["()"]', 'true', false, 0),
  ('tcr_ada_2', 'org_local', 'qs_ada_paren', true, 'passed', 'true', 'Mixed', '["()[]{}"]', 'true', false, 1),
  ('tcr_ada_3', 'org_local', 'qs_ada_paren', true, 'passed', 'false', 'Mismatch', '["(]"]', 'false', false, 2),
  ('tcr_ada_4', 'org_local', 'qs_ada_paren', false, 'wrong_output', 'true', 'Unclosed', '["(("]', 'false', true, 3);
