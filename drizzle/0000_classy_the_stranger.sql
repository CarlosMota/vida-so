CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceType` enum('chef','cleaning','shopping') NOT NULL,
	`providerId` int,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`scheduledAt` timestamp NOT NULL,
	`notes` text,
	`totalPrice` float,
	`address` text,
	`serviceSubtype` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(150) NOT NULL,
	`bio` text,
	`photoUrl` text,
	`specialties` json DEFAULT ('[]'),
	`cuisineTypes` json DEFAULT ('[]'),
	`pricePerPerson` float NOT NULL,
	`city` varchar(100),
	`rating` float DEFAULT 0,
	`totalReviews` int DEFAULT 0,
	`experience` int DEFAULT 0,
	`isAvailable` boolean DEFAULT true,
	`portfolioImages` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cleaners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(150) NOT NULL,
	`bio` text,
	`photoUrl` text,
	`serviceTypes` json DEFAULT ('[]'),
	`priceBasic` float DEFAULT 150,
	`priceDeep` float DEFAULT 250,
	`priceWeekly` float DEFAULT 400,
	`city` varchar(100),
	`rating` float DEFAULT 0,
	`totalReviews` int DEFAULT 0,
	`isAvailable` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cleaners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookingId` int NOT NULL,
	`providerType` enum('chef','cleaner') NOT NULL,
	`providerId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopping_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`quantity` varchar(50) DEFAULT '1',
	`unit` varchar(30),
	`estimatedPrice` float,
	`category` varchar(50),
	`checked` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shopping_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopping_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(150) NOT NULL,
	`status` enum('draft','ordered','delivered','cancelled') NOT NULL DEFAULT 'draft',
	`deliveryAt` timestamp,
	`deliveryAddress` text,
	`totalEstimate` float DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopping_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cuisineTypes` json DEFAULT ('[]'),
	`dietaryRestrictions` json DEFAULT ('[]'),
	`allergies` json DEFAULT ('[]'),
	`monthlyBudget` float DEFAULT 0,
	`preferredDeliveryTime` varchar(10),
	`onboardingCompleted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','provider') NOT NULL DEFAULT 'user',
	`avatarUrl` text,
	`phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
