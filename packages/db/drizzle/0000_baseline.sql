CREATE TABLE "apikey" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"created_by" text NOT NULL,
	"name" text,
	"prefix" text,
	"start" text,
	"key_hash" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"last_request" timestamp with time zone,
	"expires_at" timestamp with time zone,
	CONSTRAINT "apikey_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"mode" text DEFAULT 'independent' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"allowed_languages" jsonb DEFAULT '["python","javascript","typescript"]'::jsonb NOT NULL,
	"time_limit_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assessment_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"question_id" text NOT NULL,
	"position" integer NOT NULL,
	"points" integer DEFAULT 100 NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assessment_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assessment_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"candidate_id" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"selected_language" text,
	"started_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"total_score" integer,
	"max_score" integer,
	"grading_notes" text DEFAULT '' NOT NULL,
	"decision" text,
	"reviewed_at" timestamp with time zone,
	"access_token" text NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	CONSTRAINT "assessment_submissions_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"key" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "customers_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"stripe_price_id" text NOT NULL,
	"price" integer NOT NULL,
	"interval" text NOT NULL,
	"group" text DEFAULT 'free' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"limits" jsonb DEFAULT '{"live_interview":10,"assessment_invite":10,"team_members":10}'::jsonb NOT NULL,
	"live_mode" boolean DEFAULT false NOT NULL,
	CONSTRAINT "plans_stripe_price_id_unique" UNIQUE("stripe_price_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"plan_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"stripe_subscription_item_id" text NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id"),
	CONSTRAINT "subscriptions_stripe_subscription_item_id_unique" UNIQUE("stripe_subscription_item_id")
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "llm_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"room_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"success" boolean NOT NULL,
	"metadata" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_library" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text,
	"created_by_user_id" text,
	"title" text NOT NULL,
	"description" jsonb NOT NULL,
	"function_name" text DEFAULT '' NOT NULL,
	"parameters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"return_type" text DEFAULT 'null' NOT NULL,
	"starter_code" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"time_limit_seconds" integer,
	"is_public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_library_test_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"question_id" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"args" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expected_return" jsonb DEFAULT 'null'::jsonb NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submission_id" text NOT NULL,
	"question_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"language" text,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"score" integer,
	"max_score" integer,
	"is_draft" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"language" text NOT NULL,
	"status" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_contents" (
	"room_id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"code" jsonb NOT NULL,
	"language" text NOT NULL,
	"instructions" jsonb NOT NULL,
	"execution_history" jsonb NOT NULL,
	"tracked_users" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"raw_content" text NOT NULL,
	"raw_private_content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"instructions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_case_results" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"question_submission_id" text NOT NULL,
	"test_case_id" text,
	"organization_id" text NOT NULL,
	"passed" boolean NOT NULL,
	"failure_reason" text DEFAULT 'passed' NOT NULL,
	"actual_output" text DEFAULT '' NOT NULL,
	"stderr" text DEFAULT '' NOT NULL,
	"exit_code" integer DEFAULT 0 NOT NULL,
	"execution_time_ms" integer,
	"label" text,
	"args" jsonb,
	"expected_return" jsonb,
	"is_hidden" boolean,
	"position" integer
);
--> statement-breakpoint
CREATE TABLE "event_log" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"organization_id" text NOT NULL,
	"event_type" text NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"user_id" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "event_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"organization_id" text NOT NULL,
	"event_type" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"limit" integer NOT NULL,
	"cycle_start" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"is_onboarded" boolean NOT NULL,
	"persona" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_question_id_question_library_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_library"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_messages" ADD CONSTRAINT "llm_messages_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_messages" ADD CONSTRAINT "llm_messages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_library" ADD CONSTRAINT "question_library_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_library" ADD CONSTRAINT "question_library_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_library_test_cases" ADD CONSTRAINT "question_library_test_cases_question_id_question_library_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_library"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_submissions" ADD CONSTRAINT "question_submissions_submission_id_assessment_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."assessment_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_submissions" ADD CONSTRAINT "question_submissions_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_submissions" ADD CONSTRAINT "question_submissions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_contents" ADD CONSTRAINT "room_contents_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_contents" ADD CONSTRAINT "room_contents_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_contents" ADD CONSTRAINT "room_contents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_results" ADD CONSTRAINT "test_case_results_question_submission_id_question_submissions_id_fk" FOREIGN KEY ("question_submission_id") REFERENCES "public"."question_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_results" ADD CONSTRAINT "test_case_results_test_case_id_question_library_test_cases_id_fk" FOREIGN KEY ("test_case_id") REFERENCES "public"."question_library_test_cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_case_results" ADD CONSTRAINT "test_case_results_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_log" ADD CONSTRAINT "event_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_usage" ADD CONSTRAINT "event_usage_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_apikey_org" ON "apikey" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_assessment_org" ON "assessments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_assessment_question_assessment" ON "assessment_questions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "idx_assessment_question_question" ON "assessment_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_submission_assessment" ON "assessment_submissions" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "idx_submission_org" ON "assessment_submissions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_submission_candidate" ON "assessment_submissions" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "idx_submission_token" ON "assessment_submissions" USING btree ("access_token");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_candidate_org_email" ON "candidates" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "idx_question_library_org" ON "question_library" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_test_case_question" ON "question_library_test_cases" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_question_submission_submission_question" ON "question_submissions" USING btree ("submission_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_test_case_result_question_submission" ON "test_case_results" USING btree ("question_submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_usage_org_type_cycle" ON "event_usage" USING btree ("organization_id","event_type","cycle_start");