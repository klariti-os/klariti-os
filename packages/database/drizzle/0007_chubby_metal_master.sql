CREATE TABLE "ktags" (
	"embedded_id" varchar(255) PRIMARY KEY NOT NULL,
	"payload" varchar(512) NOT NULL,
	"user_id" text NOT NULL,
	"label" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ktags" ADD CONSTRAINT "ktags_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ktags_user_id_idx" ON "ktags" USING btree ("user_id");