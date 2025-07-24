<?php

/**
 * Simple test script to verify Help Desk API endpoints work correctly
 * Run with: php test_help_desk_api.php
 */

require_once 'vendor/autoload.php';

// Test configuration
$baseUrl = 'http://localhost:8000/api';
$testData = [
    'appointments' => [
        'fullName' => 'Juan Dela Cruz',
        'contactNumber' => '09123456789',
        'email' => 'juan@email.com',
        'serviceType' => 'Barangay Clearance',
        'appointmentDate' => '2025-06-20',
        'appointmentTime' => '10:00',
        'purpose' => 'Need clearance for employment',
        'additionalNotes' => 'Urgent request'
    ],
    'complaints' => [
        'fullName' => 'Maria Santos',
        'contactNumber' => '09987654321',
        'email' => 'maria@email.com',
        'complaintType' => 'Infrastructure',
        'subject' => 'Damaged Road',
        'description' => 'The road in our area has big potholes that need repair',
        'location' => 'Purok 1, Barangay Sample',
        'urgencyLevel' => 'high'
    ],
    'suggestions' => [
        'fullName' => 'Pedro Garcia',
        'contactNumber' => '09111222333',
        'email' => 'pedro@email.com',
        'category' => 'Infrastructure',
        'title' => 'Install CCTV Cameras',
        'description' => 'Install CCTV cameras in main streets for security',
        'implementation' => 'Partner with security companies',
        'benefits' => 'Improved security and crime prevention'
    ],
    'blotter' => [
        'complainantName' => 'Ana Reyes',
        'complainantAddress' => '123 Main Street, Barangay Sample',
        'complainantContact' => '09444555666',
        'complainantEmail' => 'ana@email.com',
        'incidentType' => 'Noise Complaint',
        'incidentDate' => '2025-06-18',
        'incidentTime' => '22:30',
        'incidentLocation' => 'Next door neighbor',
        'incidentDescription' => 'Loud music disturbing the peace',
        'respondentName' => 'John Doe',
        'respondentAddress' => '125 Main Street, Barangay Sample',
        'respondentContact' => '09777888999',
        'witnesses' => 'Other neighbors witnessed the noise',
        'evidence' => 'Video recording of the incident'
    ]
];

echo "=== Help Desk API Validation Test ===\n\n";

/**
 * Test API endpoint
 */
function testEndpoint($endpoint, $method = 'GET', $data = null) {
    global $baseUrl;
    
    $url = $baseUrl . $endpoint;
    echo "Testing: $method $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ CURL Error: $error\n";
        return false;
    }
    
    $data = json_decode($response, true);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        echo "✅ Success (HTTP $httpCode)\n";
        if (isset($data['success']) && $data['success']) {
            echo "✅ API Response: success = true\n";
        }
        return true;
    } else {
        echo "❌ Failed (HTTP $httpCode)\n";
        if ($data && isset($data['message'])) {
            echo "   Message: " . $data['message'] . "\n";
        }
        if ($data && isset($data['errors'])) {
            echo "   Errors: " . json_encode($data['errors'], JSON_PRETTY_PRINT) . "\n";
        }
        return false;
    }
}

// Test each module
$modules = ['appointments', 'complaints', 'suggestions', 'blotter-cases'];

foreach ($modules as $module) {
    echo "\n--- Testing $module ---\n";
    
    // Test GET (index)
    testEndpoint("/$module");
    
    // Test POST (store) - use different data key for blotter-cases
    $dataKey = $module === 'blotter-cases' ? 'blotter' : $module;
    if (isset($testData[$dataKey])) {
        testEndpoint("/$module", 'POST', $testData[$dataKey]);
    }
    
    // Test statistics endpoint
    testEndpoint("/$module/statistics");
    
    echo "\n";
}

echo "=== Test Complete ===\n";
echo "Note: This test requires the Laravel development server to be running.\n";
echo "Start it with: php artisan serve\n";
