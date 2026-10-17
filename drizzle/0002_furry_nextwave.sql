CREATE INDEX `companies_owner_idx` ON `companies` (`ownerId`);--> statement-breakpoint
CREATE INDEX `contents_company_idx` ON `contents` (`companyId`);