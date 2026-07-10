-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" TEXT,
    "distance_km" DOUBLE PRECISION,
    "elevation_gain_m" DOUBLE PRECISION,
    "elevation_loss_m" DOUBLE PRECISION,
    "gpx_file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation_m" DOUBLE PRECISION,

    CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segments" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segment_surfaces" (
    "id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "surface_type" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "segment_surfaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_elevation_samples" (
    "route_id" TEXT NOT NULL,
    "sample_index" INTEGER NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,
    "elevation_m" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "route_elevation_samples_pkey" PRIMARY KEY ("route_id","sample_index")
);

-- CreateTable
CREATE TABLE "route_tags" (
    "route_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "route_tags_pkey" PRIMARY KEY ("route_id","tag")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_route_id_order_index_key" ON "checkpoints"("route_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "segments_route_id_order_index_key" ON "segments"("route_id", "order_index");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_surfaces" ADD CONSTRAINT "segment_surfaces_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_elevation_samples" ADD CONSTRAINT "route_elevation_samples_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_tags" ADD CONSTRAINT "route_tags_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
