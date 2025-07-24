<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Project;
use App\Models\BarangayOfficial;
use App\Models\BlotterCase;
use Carbon\Carbon;

class DashboardTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add sample residents with different ages
        $residents = [
            ['first_name' => 'Maria', 'last_name' => 'Santos', 'birth_date' => '1985-03-15', 'civil_status' => 'MARRIED', 'gender' => 'FEMALE'],
            ['first_name' => 'Jose', 'last_name' => 'Reyes', 'birth_date' => '1978-07-22', 'civil_status' => 'SINGLE', 'gender' => 'MALE'],
            ['first_name' => 'Ana', 'last_name' => 'Cruz', 'birth_date' => '2010-11-05', 'civil_status' => 'SINGLE', 'gender' => 'FEMALE'], // Child
            ['first_name' => 'Pedro', 'last_name' => 'Garcia', 'birth_date' => '1955-01-20', 'civil_status' => 'MARRIED', 'gender' => 'MALE'], // Senior
            ['first_name' => 'Rosa', 'last_name' => 'Mendoza', 'birth_date' => '1990-09-12', 'civil_status' => 'MARRIED', 'gender' => 'FEMALE'],
            ['first_name' => 'Carlos', 'last_name' => 'Torres', 'birth_date' => '2015-05-08', 'civil_status' => 'SINGLE', 'gender' => 'MALE'], // Child
            ['first_name' => 'Elena', 'last_name' => 'Morales', 'birth_date' => '1963-12-03', 'civil_status' => 'WIDOWED', 'gender' => 'FEMALE'], // Senior
            ['first_name' => 'Miguel', 'last_name' => 'Castillo', 'birth_date' => '1982-04-17', 'civil_status' => 'SINGLE', 'gender' => 'MALE'],
            ['first_name' => 'Carmen', 'last_name' => 'Flores', 'birth_date' => '2012-08-25', 'civil_status' => 'SINGLE', 'gender' => 'FEMALE'], // Child
            ['first_name' => 'Ricardo', 'last_name' => 'Navarro', 'birth_date' => '1970-06-14', 'civil_status' => 'MARRIED', 'gender' => 'MALE']
        ];

        foreach ($residents as $residentData) {
            Resident::create([
                'first_name' => $residentData['first_name'],
                'last_name' => $residentData['last_name'],
                'birth_date' => $residentData['birth_date'],
                'age' => Carbon::parse($residentData['birth_date'])->age,
                'birth_place' => 'Sample City',
                'civil_status' => $residentData['civil_status'],
                'gender' => $residentData['gender'],
                'nationality' => 'Filipino',
                'purok' => 'Purok ' . rand(1, 7),
                'barangay' => 'Sample Barangay',
                'municipality' => 'Sample Municipality',
                'province' => 'Sample Province',
                'complete_address' => rand(1, 999) . ' Sample Street, Purok ' . rand(1, 7),
                'occupation' => ['Teacher', 'Driver', 'Vendor', 'Farmer', 'Student', 'Retired'][array_rand(['Teacher', 'Driver', 'Vendor', 'Farmer', 'Student', 'Retired'])],
                'mobile_number' => '09' . rand(100000000, 999999999),
                'email_address' => strtolower($residentData['first_name'] . '.' . $residentData['last_name']) . '@email.com',
                'voter_status' => rand(0, 1) ? 'REGISTERED' : 'NOT_REGISTERED',
                'person_with_disability' => rand(0, 10) > 8,
                'senior_citizen' => Carbon::parse($residentData['birth_date'])->age >= 60,
                'indigenous_people' => rand(0, 10) > 8,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add sample households
        $households = [
            ['household_number' => 'HH-' . rand(1000, 9999), 'street' => 'Main Street', 'house_number' => '123'],
            ['household_number' => 'HH-' . rand(1000, 9999), 'street' => 'Secondary Road', 'house_number' => '456'],
            ['household_number' => 'HH-' . rand(1000, 9999), 'street' => 'Third Avenue', 'house_number' => '789'],
            ['household_number' => 'HH-' . rand(1000, 9999), 'street' => 'Fourth Street', 'house_number' => '321'],
            ['household_number' => 'HH-' . rand(1000, 9999), 'street' => 'Fifth Road', 'house_number' => '654']
        ];

        foreach ($households as $householdData) {
            Household::create([
                'household_number' => $householdData['household_number'],
                'household_type' => ['nuclear', 'extended', 'single', 'single-parent'][array_rand(['nuclear', 'extended', 'single', 'single-parent'])],
                'house_number' => $householdData['house_number'],
                'street_sitio' => $householdData['street'],
                'barangay' => 'Sample Barangay',
                'complete_address' => $householdData['house_number'] . ' ' . $householdData['street'] . ', Sample Barangay',
                'monthly_income' => ['below-10000', '10000-25000', '25000-50000'][array_rand(['below-10000', '10000-25000', '25000-50000'])],
                'primary_income_source' => ['Employment', 'Business', 'Farming', 'Others'][array_rand(['Employment', 'Business', 'Farming', 'Others'])],
                'four_ps_beneficiary' => rand(0, 10) > 7,
                'indigent_family' => rand(0, 10) > 8,
                'house_type' => ['concrete', 'semi-concrete', 'wood', 'mixed'][array_rand(['concrete', 'semi-concrete', 'wood', 'mixed'])],
                'ownership_status' => ['owned', 'rented'][array_rand(['owned', 'rented'])],
                'has_electricity' => rand(0, 10) > 2,
                'has_water_supply' => rand(0, 10) > 3,
                'has_internet_access' => rand(0, 10) > 5,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add sample projects
        $projects = [
            [
                'title' => 'Community Health Center Improvement',
                'category' => 'Health',
                'description' => 'Upgrading medical equipment and facilities at the local health center to provide better healthcare services.',
                'total_budget' => 750000,
                'status' => 'Active',
                'priority' => 'high',
                'start_date' => '2025-02-15',
                'progress_percentage' => 35
            ],
            [
                'title' => 'Youth Sports Development Program',
                'category' => 'Sports',
                'description' => 'Establishing sports facilities and organizing tournaments to promote youth engagement in sports activities.',
                'total_budget' => 300000,
                'status' => 'Active',
                'priority' => 'medium',
                'start_date' => '2025-01-10',
                'progress_percentage' => 60
            ],
            [
                'title' => 'Waste Management System Enhancement',
                'category' => 'Environment',
                'description' => 'Implementing a comprehensive waste segregation and recycling program for the entire barangay.',
                'total_budget' => 200000,
                'status' => 'Completed',
                'priority' => 'high',
                'start_date' => '2024-10-01',
                'actual_end_date' => '2025-01-15',
                'progress_percentage' => 100
            ],
            [
                'title' => 'Senior Citizens Welfare Program',
                'category' => 'Social Services',
                'description' => 'Providing regular health check-ups, recreational activities, and financial assistance for senior citizens.',
                'total_budget' => 150000,
                'status' => 'Active',
                'priority' => 'medium',
                'start_date' => '2025-03-01',
                'progress_percentage' => 20
            ],
            [
                'title' => 'Road Improvement and Maintenance',
                'category' => 'Infrastructure',
                'description' => 'Repairing and improving road conditions in various puroks to ensure better transportation.',
                'total_budget' => 500000,
                'status' => 'Pending',
                'priority' => 'high',
                'start_date' => '2025-07-01',
                'progress_percentage' => 0
            ]
        ];

        foreach ($projects as $projectData) {
            Project::create([
                'project_code' => 'PROJ-' . strtoupper(substr($projectData['category'], 0, 3)) . '-' . rand(1000, 9999),
                'title' => $projectData['title'],
                'category' => $projectData['category'],
                'description' => $projectData['description'],
                'total_budget' => $projectData['total_budget'],
                'allocated_budget' => $projectData['total_budget'],
                'utilized_budget' => $projectData['total_budget'] * ($projectData['progress_percentage'] / 100),
                'remaining_budget' => $projectData['total_budget'] * (1 - ($projectData['progress_percentage'] / 100)),
                'status' => $projectData['status'],
                'priority' => $projectData['priority'],
                'start_date' => $projectData['start_date'],
                'actual_end_date' => $projectData['actual_end_date'] ?? null,
                'progress_percentage' => $projectData['progress_percentage'],
                'target_beneficiaries' => rand(50, 500),
                'actual_beneficiaries' => $projectData['status'] === 'Completed' ? rand(50, 500) : 0,
                'location' => 'Purok ' . rand(1, 7),
                'funding_source' => ['Local Government', 'National Government', 'NGO', 'Private'][array_rand(['Local Government', 'National Government', 'NGO', 'Private'])],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add sample blotter cases
        $blotterTypes = ['Noise Complaint', 'Property Damage', 'Disturbance', 'Harassment', 'Domestic Dispute'];
        for ($i = 0; $i < 8; $i++) {
            BlotterCase::create([
                'case_number' => 'BLT-2025-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'case_title' => 'Case ' . ($i + 1) . ' - ' . $blotterTypes[array_rand($blotterTypes)],
                'case_description' => 'Sample case description for case ' . ($i + 1),
                'case_type' => ['CIVIL', 'COMPLAINT', 'DISPUTE'][array_rand(['CIVIL', 'COMPLAINT', 'DISPUTE'])],
                'complainant_name' => 'Complainant ' . ($i + 1),
                'complainant_address' => 'Purok ' . rand(1, 7) . ' Sample Address',
                'incident_type' => $blotterTypes[array_rand($blotterTypes)],
                'incident_description' => 'Sample incident description for case ' . ($i + 1),
                'incident_date' => Carbon::now()->subDays(rand(1, 30)),
                'incident_location' => 'Purok ' . rand(1, 7),
                'respondent_name' => 'Respondent ' . ($i + 1),
                'respondent_address' => 'Purok ' . rand(1, 7) . ' Sample Address',
                'status' => ['FILED', 'UNDER_INVESTIGATION', 'SETTLED'][array_rand(['FILED', 'UNDER_INVESTIGATION', 'SETTLED'])],
                'date_filed' => Carbon::now()->subDays(rand(1, 30)),
                'settlement_agreement' => $i % 3 === 0 ? 'Mediation successful, parties agreed to settlement' : null,
                'priority' => ['LOW', 'NORMAL', 'HIGH'][array_rand(['LOW', 'NORMAL', 'HIGH'])],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add sample barangay officials
        $barangayOfficials = [
            [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'position' => 'BARANGAY_CAPTAIN',
                'contact_number' => '+639123456789',
                'email_address' => 'juan.delacruz@barangay.gov.ph'
            ],
            [
                'first_name' => 'Maria',
                'last_name' => 'Clara',
                'position' => 'KAGAWAD',
                'contact_number' => '+639987654321',
                'email_address' => 'maria.clara@barangay.gov.ph'
            ],
            [
                'first_name' => 'Jose',
                'last_name' => 'Rizal',
                'position' => 'KAGAWAD',
                'contact_number' => '+639456789123',
                'email_address' => 'jose.rizal@barangay.gov.ph'
            ],
            [
                'first_name' => 'Andres',
                'last_name' => 'Bonifacio',
                'position' => 'BARANGAY_SECRETARY',
                'contact_number' => '+639654321987',
                'email_address' => 'andres.bonifacio@barangay.gov.ph'
            ],
            [
                'first_name' => 'Emilio',
                'last_name' => 'Aguinaldo',
                'position' => 'BARANGAY_TREASURER',
                'contact_number' => '+639789123456',
                'email_address' => 'emilio.aguinaldo@barangay.gov.ph'
            ]
        ];

        foreach ($barangayOfficials as $officialData) {
            BarangayOfficial::create([
                'first_name' => $officialData['first_name'],
                'last_name' => $officialData['last_name'],
                'position' => $officialData['position'],
                'contact_number' => $officialData['contact_number'],
                'email_address' => $officialData['email_address'],
                'gender' => ['MALE', 'FEMALE'][array_rand(['MALE', 'FEMALE'])],
                'birth_date' => Carbon::now()->subYears(rand(30, 60)),
                'complete_address' => 'Purok ' . rand(1, 7) . ', Sample Barangay',
                'civil_status' => ['Single', 'Married', 'Widowed'][array_rand(['Single', 'Married', 'Widowed'])],
                'term_start_date' => '2025-01-01',
                'term_end_date' => '2028-12-31',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add more sample barangay officials if there are less than 5
        $currentOfficialsCount = BarangayOfficial::count();
        if ($currentOfficialsCount < 5) {
            $additionalOfficials = [
                [
                    'first_name' => 'Rosa',
                    'last_name' => 'Martinez',
                    'position' => 'KAGAWAD',
                    'contact_number' => '+639456123789',
                    'email_address' => 'rosa.martinez@barangay.gov.ph'
                ],
                [
                    'first_name' => 'Carlos',
                    'last_name' => 'Mendoza',
                    'position' => 'KAGAWAD',
                    'contact_number' => '+639789456123',
                    'email_address' => null
                ],
                [
                    'first_name' => 'Ana',
                    'last_name' => 'Villanueva',
                    'position' => 'BARANGAY_TREASURER',
                    'contact_number' => '+639321654987',
                    'email_address' => 'ana.villanueva@barangay.gov.ph'
                ]
            ];

            foreach ($additionalOfficials as $officialData) {
                BarangayOfficial::create([
                    'first_name' => $officialData['first_name'],
                    'last_name' => $officialData['last_name'],
                    'position' => $officialData['position'],
                    'contact_number' => $officialData['contact_number'],
                    'email_address' => $officialData['email_address'],
                    'gender' => ['MALE', 'FEMALE'][array_rand(['MALE', 'FEMALE'])],
                    'birth_date' => Carbon::now()->subYears(rand(30, 60)),
                    'complete_address' => 'Purok ' . rand(1, 7) . ', Sample Barangay',
                    'civil_status' => ['Single', 'Married', 'Widowed'][array_rand(['Single', 'Married', 'Widowed'])],
                    'term_start_date' => '2025-01-01',
                    'term_end_date' => '2028-12-31',
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            echo "Added " . count($additionalOfficials) . " additional barangay officials\n";
        }

        echo "Sample data seeded successfully!\n";
        echo "Added:\n";
        echo "- 10 new residents\n";
        echo "- 5 new households\n";
        echo "- 5 new projects\n";
        echo "- 8 new blotter cases\n";
    }
}
