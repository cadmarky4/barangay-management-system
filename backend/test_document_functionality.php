<?php

require_once 'vendor/autoload.php';

use App\Models\Document;
use App\Models\Resident;

// Test basic document functionality and relationships
echo "Testing Document functionality...\n\n";

try {
    // Test 1: Check if we can get documents with residents loaded
    echo "1. Testing document with resident relationship:\n";
    $documents = Document::with('resident:id,first_name,last_name,complete_address')->limit(3)->get();
    
    foreach ($documents as $document) {
        echo "   Document #{$document->document_number} - {$document->document_type}\n";
        if ($document->resident) {
            echo "   Resident: {$document->resident->first_name} {$document->resident->last_name}\n";
            echo "   Address: {$document->resident->complete_address}\n";
        } else {
            echo "   No resident linked\n";
        }
        echo "   Status: {$document->status}\n";
        echo "   Created: {$document->created_at}\n\n";
    }

    // Test 2: Check search functionality
    echo "2. Testing document search functionality:\n";
    $searchTerm = "test";
    $searchQuery = Document::with('resident:id,first_name,last_name')
        ->where(function ($q) use ($searchTerm) {
            $q->where('document_number', 'LIKE', "%{$searchTerm}%")
              ->orWhere('serial_number', 'LIKE', "%{$searchTerm}%")
              ->orWhere('applicant_name', 'LIKE', "%{$searchTerm}%")
              ->orWhereHas('resident', function ($subQuery) use ($searchTerm) {
                  $subQuery->where('first_name', 'LIKE', "%{$searchTerm}%")
                           ->orWhere('last_name', 'LIKE', "%{$searchTerm}%");
              });
        });
    
    $searchResults = $searchQuery->limit(5)->get();
    echo "   Found " . $searchResults->count() . " documents matching '{$searchTerm}'\n";
    
    foreach ($searchResults as $doc) {
        echo "   - {$doc->applicant_name} ({$doc->document_type})\n";
    }

    // Test 3: Check status filtering
    echo "\n3. Testing status filtering:\n";
    $statuses = ['pending', 'processing', 'approved', 'released'];
    foreach ($statuses as $status) {
        $count = Document::where('status', $status)->count();
        echo "   {$status}: {$count} documents\n";
    }

    // Test 4: Check document types
    echo "\n4. Testing document types:\n";
    $types = Document::selectRaw('document_type, COUNT(*) as count')
        ->groupBy('document_type')
        ->get();
    
    foreach ($types as $type) {
        echo "   {$type->document_type}: {$type->count} documents\n";
    }

    // Test 5: Check residents search
    echo "\n5. Testing resident search:\n";
    $residentSearchTerm = "john";
    $residents = Resident::where('first_name', 'LIKE', "%{$residentSearchTerm}%")
        ->orWhere('last_name', 'LIKE', "%{$residentSearchTerm}%")
        ->limit(3)
        ->get();
    
    echo "   Found " . $residents->count() . " residents matching '{$residentSearchTerm}'\n";
    foreach ($residents as $resident) {
        echo "   - {$resident->first_name} {$resident->last_name} (ID: {$resident->id})\n";
    }

    echo "\n✅ All tests completed successfully!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
