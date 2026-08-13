<?php

use App\Models\Image;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('playroom_games', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description_es');
            $table->text('description_en');
            $table->string('category_es');
            $table->string('category_en');
            $table->foreignIdFor(Image::class, 'image_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->integer('order');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playroom_games');
    }
};
