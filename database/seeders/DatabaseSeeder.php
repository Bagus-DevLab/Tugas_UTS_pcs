<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default users with different roles
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@mapan.test',
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        User::factory()->create([
            'name' => 'Admin Sistem',
            'email' => 'admin@mapan.test',
            'role' => User::ROLE_ADMIN,
        ]);

        User::factory()->create([
            'name' => 'Pakar Pertanian',
            'email' => 'pakar@mapan.test',
            'role' => User::ROLE_PAKAR,
        ]);

        User::factory()->create([
            'name' => 'User',
            'email' => 'user@mapan.test',
            'role' => User::ROLE_USER,
        ]);

        $this->call([
            DiseaseSeeder::class,
            SymptomSeeder::class,
            DiseaseSymptomSeeder::class,
            TreatmentSeeder::class,
        ]);
    }
}
