CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`segment` varchar(160) NOT NULL,
	`products` text NOT NULL,
	`services` text NOT NULL,
	`targetAudience` text NOT NULL,
	`voiceTone` varchar(120) NOT NULL,
	`brandColors` text NOT NULL,
	`links` text NOT NULL,
	`logoUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`contentType` enum('reel','carrossel','story') NOT NULL DEFAULT 'reel',
	`format` varchar(32) NOT NULL,
	`duration` varchar(32) NOT NULL,
	`briefing` text NOT NULL,
	`script` text NOT NULL,
	`scenes` text NOT NULL,
	`voice` varchar(160) NOT NULL,
	`track` varchar(160) NOT NULL,
	`caption` text NOT NULL,
	`plannedAt` timestamp,
	`status` enum('draft','pending_approval','approved','scheduled','published','failed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `companies` ADD CONSTRAINT `companies_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contents` ADD CONSTRAINT `contents_companyId_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE cascade ON UPDATE no action;