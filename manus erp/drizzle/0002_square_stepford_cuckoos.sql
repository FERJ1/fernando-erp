CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`bankName` varchar(100),
	`accountNumber` varchar(50),
	`agency` varchar(20),
	`accountType` enum('checking','savings','investment') DEFAULT 'checking',
	`initialBalance` decimal(12,2) DEFAULT '0',
	`currentBalance` decimal(12,2) DEFAULT '0',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bankAccountId` int NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`description` text,
	`amount` decimal(12,2) NOT NULL,
	`type` enum('credit','debit') NOT NULL,
	`balance` decimal(12,2),
	`externalId` varchar(100),
	`reconciled` boolean NOT NULL DEFAULT false,
	`reconciledTransactionId` int,
	`importBatchId` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bank_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dre_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('revenue','cost','expense','tax') NOT NULL,
	`parentId` int,
	`orderIndex` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dre_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`type` enum('markup','margin','fixed') NOT NULL DEFAULT 'markup',
	`value` decimal(10,4) NOT NULL,
	`categoryId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_rules_id` PRIMARY KEY(`id`)
);
