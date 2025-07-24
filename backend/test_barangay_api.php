<?php

// Simple test script for barangay officials API
require_once 'vendor/autoload.php';

use App\Models\BarangayOfficial;

try {
    // Test creating a barangay official
    $official = new BarangayOfficial([
        'prefix' => 'Hon.',
        'first_name' => 'Juan',
        'middle_name' => 'Cruz', 
        'last_name' => 'Dela Cruz',
        'gender' => 'Male',
        'birth_date' => '1980-01-15',
        'contact_number' => '+639123456789',
        'email_address' => 'juan.delacruz@example.com',
        'complete_address' => '123 Main St, Brgy. Sikatuna Village',
        'civil_status' => 'Married',
        'educational_background' => 'Bachelor of Public Administration',
        'position' => 'BARANGAY_CAPTAIN',
        'committee_assignment' => 'Health',
        'term_start' => '2022-05-01',
        'term_end' => '2025-04-30',
        'status' => 'ACTIVE',
        'is_active' => true
    ]);
    
    echo "Barangay Official model created successfully!\n";
    echo "Name: " . $official->full_name . "\n";
    echo "Position: " . $official->position . "\n";
    echo "Committee: " . $official->committee_assignment . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
