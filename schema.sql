-- CreateTable
CREATE TABLE "Marketplace" (
    "id" UUID NOT NULL,
    "experienceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "takeRate" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItem" (
    "id" UUID NOT NULL,
    "postedBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "marketplaceId" UUID NOT NULL,

    CONSTRAINT "MarketplaceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItemImage" (
    "id" UUID NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "marketplaceItemId" UUID NOT NULL,

    CONSTRAINT "MarketplaceItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItemVideo" (
    "id" UUID NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "marketplaceItemId" UUID NOT NULL,

    CONSTRAINT "MarketplaceItemVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItemChat" (
    "id" UUID NOT NULL,
    "inquirerId" TEXT NOT NULL,
    "lastMessagePreview" TEXT NOT NULL,
    "lastMessageTimestamp" TIMESTAMP(3) NOT NULL,
    "lastMessageAuthorId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "marketplaceItemId" UUID NOT NULL,

    CONSTRAINT "MarketplaceItemChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItemChatMessage" (
    "id" UUID NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "marketplaceItemChatId" UUID NOT NULL,

    CONSTRAINT "MarketplaceItemChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItemPurchase" (
    "id" UUID NOT NULL,
    "purchasedBy" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marketplaceItemId" UUID NOT NULL,

    CONSTRAINT "MarketplaceItemPurchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarketplaceItem" ADD CONSTRAINT "MarketplaceItem_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "Marketplace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceItemImage" ADD CONSTRAINT "MarketplaceItemImage_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES "MarketplaceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceItemVideo" ADD CONSTRAINT "MarketplaceItemVideo_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES "MarketplaceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceItemChat" ADD CONSTRAINT "MarketplaceItemChat_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES "MarketplaceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceItemChatMessage" ADD CONSTRAINT "MarketplaceItemChatMessage_marketplaceItemChatId_fkey" FOREIGN KEY ("marketplaceItemChatId") REFERENCES "MarketplaceItemChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceItemPurchase" ADD CONSTRAINT "MarketplaceItemPurchase_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES "MarketplaceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

