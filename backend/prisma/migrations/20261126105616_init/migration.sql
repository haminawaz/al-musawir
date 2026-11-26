-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('created', 'updated', 'deleted');

-- CreateTable
CREATE TABLE "admin" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "header_label" TEXT NOT NULL,
    "whatsapp_display" TEXT NOT NULL,
    "whatsapp_number" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "seo_title" TEXT NOT NULL,
    "seo_description" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_links" (
    "href" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "nav_links_pkey" PRIMARY KEY ("href")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_steps" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_specs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "survey_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "society" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "plot_no" TEXT NOT NULL,
    "floors" TEXT NOT NULL,
    "drawing_no" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plot_width" DOUBLE PRECISION NOT NULL,
    "plot_depth" DOUBLE PRECISION NOT NULL,
    "road_width" DOUBLE PRECISION NOT NULL,
    "setback_front" DOUBLE PRECISION NOT NULL,
    "setback_rear" DOUBLE PRECISION NOT NULL,
    "setback_left" DOUBLE PRECISION NOT NULL,
    "setback_right" DOUBLE PRECISION NOT NULL,
    "rooms" JSON NOT NULL,
    "openings" JSON NOT NULL,
    "covered_area" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_contents" (
    "key" TEXT NOT NULL,
    "content" JSON NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_contents_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_name" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "target" TEXT NOT NULL,
    "href" TEXT,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE INDEX "nav_links_position_idx" ON "nav_links"("position");

-- CreateIndex
CREATE INDEX "services_position_idx" ON "services"("position");

-- CreateIndex
CREATE INDEX "process_steps_position_idx" ON "process_steps"("position");

-- CreateIndex
CREATE INDEX "survey_specs_position_idx" ON "survey_specs"("position");

-- CreateIndex
CREATE INDEX "categories_position_idx" ON "categories"("position");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_position_idx" ON "projects"("position");

-- CreateIndex
CREATE INDEX "projects_category_id_position_idx" ON "projects"("category_id", "position");

-- CreateIndex
CREATE INDEX "activity_log_created_at_idx" ON "activity_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_log_href_idx" ON "activity_log"("href");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Only one admin and one site settings row can exist. Prisma's schema cannot express CHECK
-- constraints, so they are added here by hand.
ALTER TABLE "admin" ADD CONSTRAINT "admin_single_row" CHECK ("id" = 1);
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_single_row" CHECK ("id" = 1);
