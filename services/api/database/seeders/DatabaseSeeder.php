<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('DEFAULT_ADMIN_EMAIL', 'admin@smknngadirojo.sch.id')],
            ['name' => env('DEFAULT_ADMIN_NAME', 'Super Admin'), 'password' => env('DEFAULT_ADMIN_PASSWORD', 'password'), 'role' => User::ROLE_SUPER_ADMIN, 'active' => true]
        );
        foreach ([
            ['name' => 'Kepala Sekolah', 'department' => 'Manajemen', 'position' => 'Kepala Sekolah'],
            ['name' => 'Petugas Tata Usaha', 'department' => 'Tata Usaha', 'position' => 'Staf'],
            ['name' => 'Guru Piket', 'department' => 'Akademik', 'position' => 'Guru'],
        ] as $employee) {
            Employee::query()->firstOrCreate(['name' => $employee['name']], $employee + ['active' => true]);
        }
    }
}
