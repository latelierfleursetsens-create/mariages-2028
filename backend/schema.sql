PRAGMA foreign_keys=ON;
CREATE TABLE `notification_emails` (
	`id` text PRIMARY KEY NOT NULL,
	`registration_id` text NOT NULL,
	`kind` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_attempt_at` text,
	`sent_at` text,
	`error` text,
	FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `notification_unique` ON `notification_emails` (`registration_id`,`kind`);
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires_at` text NOT NULL
);

CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`wedding_date` text NOT NULL,
	`city` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`consent_at` text NOT NULL,
	`consent_version` text NOT NULL
);

CREATE UNIQUE INDEX `registration_email_date` ON `registrations` (`email`,`wedding_date`);
CREATE INDEX `registration_created` ON `registrations` (`created_at`);