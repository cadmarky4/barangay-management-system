<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Household;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class HouseholdControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $user;
    private Resident $headResident;
    private Resident $memberResident1;
    private Resident $memberResident2;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create();
        
        // Create test residents for household members
        $this->headResident = Resident::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'age' => 45,
            'mobile_number' => '09123456789'
        ]);
        
        $this->memberResident1 = Resident::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'age' => 42,
            'mobile_number' => '09123456790'
        ]);
        
        $this->memberResident2 = Resident::factory()->create([
            'first_name' => 'Jimmy',
            'last_name' => 'Doe',
            'age' => 18,
            'mobile_number' => '09123456791'
        ]);
    }

    /**
     * Test creating a household with all frontend fields
     */
    public function test_create_household_with_all_fields()
    {
        $householdData = [
            'household_number' => 'HH-2025-001',
            'household_type' => 'nuclear',
            'barangay' => 'Barangay San Antonio',
            'street_sitio' => 'Purok 1, Street Name',
            'head_resident_id' => $this->headResident->id,
            'member_ids' => [
                [
                    'resident_id' => $this->memberResident1->id,
                    'relationship' => 'Spouse'
                ],
                [
                    'resident_id' => $this->memberResident2->id,
                    'relationship' => 'Child'
                ]
            ],
            // Household classification (frontend: householdClassification)
            'is_4ps_beneficiary' => true,
            'is_indigent_family' => false,
            'is_solo_parent' => false,
            'has_pwd_member' => false,
            'has_senior_citizen' => true,
            'has_ofw_member' => false,
            // Utilities access (frontend: utilitiesAccess)
            'has_electricity' => true,
            'has_water_supply' => true,
            'has_internet_access' => false,
            'has_cable_tv' => false,
            'notes' => 'Test household with complete information'
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/households', $householdData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'id',
                         'household_number',
                         'household_type',
                         'barangay',
                         'street_sitio',
                         'head_resident_id',
                         'is_4ps_beneficiary',
                         'is_indigent_family',
                         'is_solo_parent',
                         'has_pwd_member',
                         'has_senior_citizen',
                         'has_ofw_member',
                         'has_electricity',
                         'has_water_supply',
                         'has_internet_access',
                         'has_cable_tv',
                         'notes',
                         'created_at',
                         'updated_at',
                         'head_resident',
                         'members'
                     ]
                 ]);

        // Verify household was created with correct data
        $this->assertDatabaseHas('households', [
            'household_number' => 'HH-2025-001',
            'household_type' => 'nuclear',
            'barangay' => 'Barangay San Antonio',
            'street_sitio' => 'Purok 1, Street Name',
            'head_resident_id' => $this->headResident->id,
            'is_4ps_beneficiary' => true,
            'is_indigent_family' => false,
            'is_solo_parent' => false,
            'has_pwd_member' => false,
            'has_senior_citizen' => true,
            'has_ofw_member' => false,
            'has_electricity' => true,
            'has_water_supply' => true,
            'has_internet_access' => false,
            'has_cable_tv' => false,
            'notes' => 'Test household with complete information'
        ]);

        // Verify head resident relationship was updated
        $this->assertDatabaseHas('residents', [
            'id' => $this->headResident->id,
            'household_id' => $response->json('data.id'),
            'is_household_head' => true,
            'relationship_to_head' => 'Self'
        ]);

        // Verify member relationships were updated
        $this->assertDatabaseHas('residents', [
            'id' => $this->memberResident1->id,
            'household_id' => $response->json('data.id'),
            'is_household_head' => false,
            'relationship_to_head' => 'Spouse'
        ]);

        $this->assertDatabaseHas('residents', [
            'id' => $this->memberResident2->id,
            'household_id' => $response->json('data.id'),
            'is_household_head' => false,
            'relationship_to_head' => 'Child'
        ]);
    }

    /**
     * Test creating household without household number (should auto-generate)
     */
    public function test_create_household_auto_generates_number()
    {
        $householdData = [
            'household_type' => 'nuclear',
            'barangay' => 'Barangay Test',
            'street_sitio' => 'Test Street',
            'head_resident_id' => $this->headResident->id,
            'has_electricity' => true,
            'has_water_supply' => false
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/households', $householdData);

        $response->assertStatus(201);
        
        $householdNumber = $response->json('data.household_number');
        $this->assertNotNull($householdNumber);
        $this->assertStringStartsWith('HH-', $householdNumber);
    }

    /**
     * Test creating household with frontend mapping structure
     */
    public function test_create_household_with_frontend_structure()
    {
        // This simulates what the frontend actually sends
        $frontendData = [
            'householdNumber' => 'HH-FRONTEND-001',
            'householdType' => 'extended',
            'barangay' => 'Test Barangay',
            'streetSitio' => 'Test Street',
            'headResidentId' => $this->headResident->id,
            'members' => [
                [
                    'residentId' => $this->memberResident1->id,
                    'relationship' => 'Spouse'
                ]
            ],
            'householdClassification' => [
                'fourPs' => true,
                'indigent' => false,
                'soloParent' => false,
                'pwd' => false,
                'seniorCitizen' => true,
                'ofw' => false
            ],
            'utilitiesAccess' => [
                'electricity' => true,
                'water' => true,
                'internet' => false,
                'cable' => false
            ],
            'notes' => 'Frontend structure test'
        ];

        // Convert to backend expected format (this should be done by households service)
        $backendData = [
            'household_number' => $frontendData['householdNumber'],
            'household_type' => $frontendData['householdType'],
            'barangay' => $frontendData['barangay'],
            'street_sitio' => $frontendData['streetSitio'],
            'head_resident_id' => $frontendData['headResidentId'],
            'member_ids' => array_map(function($member) {
                return [
                    'resident_id' => $member['residentId'],
                    'relationship' => $member['relationship']
                ];
            }, $frontendData['members']),
            'is_4ps_beneficiary' => $frontendData['householdClassification']['fourPs'],
            'is_indigent_family' => $frontendData['householdClassification']['indigent'],
            'is_solo_parent' => $frontendData['householdClassification']['soloParent'],
            'has_pwd_member' => $frontendData['householdClassification']['pwd'],
            'has_senior_citizen' => $frontendData['householdClassification']['seniorCitizen'],
            'has_ofw_member' => $frontendData['householdClassification']['ofw'],
            'has_electricity' => $frontendData['utilitiesAccess']['electricity'],
            'has_water_supply' => $frontendData['utilitiesAccess']['water'],
            'has_internet_access' => $frontendData['utilitiesAccess']['internet'],
            'has_cable_tv' => $frontendData['utilitiesAccess']['cable'],
            'notes' => $frontendData['notes']
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/households', $backendData);

        $response->assertStatus(201);

        // Verify the mapping worked correctly
        $this->assertDatabaseHas('households', [
            'household_number' => 'HH-FRONTEND-001',
            'household_type' => 'extended',
            'barangay' => 'Test Barangay',
            'street_sitio' => 'Test Street',
            'head_resident_id' => $this->headResident->id,
            'is_4ps_beneficiary' => true,
            'is_indigent_family' => false,
            'is_solo_parent' => false,
            'has_pwd_member' => false,
            'has_senior_citizen' => true,
            'has_ofw_member' => false,
            'has_electricity' => true,
            'has_water_supply' => true,
            'has_internet_access' => false,
            'has_cable_tv' => false,
            'notes' => 'Frontend structure test'
        ]);
    }

    /**
     * Test validation errors for required fields
     */
    public function test_create_household_validation_errors()
    {
        $invalidData = [
            // Missing required fields
            'household_type' => '',
            'barangay' => '',
            'street_sitio' => ''
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->postJson('/api/households', $invalidData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'household_type',
                     'barangay',
                     'street_sitio'
                 ]);
    }

    /**
     * Test updating household with all fields
     */
    public function test_update_household_with_all_fields()
    {
        // Create initial household
        $household = Household::factory()->create([
            'head_resident_id' => $this->headResident->id,
            'household_type' => 'nuclear',
            'barangay' => 'Old Barangay',
            'is_4ps_beneficiary' => false,
            'has_electricity' => false
        ]);

        $updateData = [
            'household_type' => 'extended',
            'barangay' => 'New Barangay',
            'street_sitio' => 'Updated Street',
            'is_4ps_beneficiary' => true,
            'is_indigent_family' => true,
            'has_electricity' => true,
            'has_water_supply' => true,
            'has_internet_access' => true,
            'notes' => 'Updated household information'
        ];

        $response = $this->actingAs($this->user, 'sanctum')
                         ->putJson("/api/households/{$household->id}", $updateData);

        $response->assertStatus(200);

        // Verify all fields were updated
        $this->assertDatabaseHas('households', [
            'id' => $household->id,
            'household_type' => 'extended',
            'barangay' => 'New Barangay',
            'street_sitio' => 'Updated Street',
            'is_4ps_beneficiary' => true,
            'is_indigent_family' => true,
            'has_electricity' => true,
            'has_water_supply' => true,
            'has_internet_access' => true,
            'notes' => 'Updated household information'
        ]);
    }

    /**
     * Test retrieving household with all relationships
     */
    public function test_get_household_with_relationships()
    {
        $household = Household::factory()->create([
            'head_resident_id' => $this->headResident->id,
            'household_number' => 'HH-TEST-001',
            'household_type' => 'nuclear',
            'barangay' => 'Test Barangay',
            'street_sitio' => 'Test Street',
            'is_4ps_beneficiary' => true,
            'has_electricity' => true,
            'notes' => 'Test household for retrieval'
        ]);

        // Add members to household
        $this->memberResident1->update([
            'household_id' => $household->id,
            'is_household_head' => false,
            'relationship_to_head' => 'Spouse'
        ]);

        $this->headResident->update([
            'household_id' => $household->id,
            'is_household_head' => true,
            'relationship_to_head' => 'Self'
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson("/api/households/{$household->id}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         'id',
                         'household_number',
                         'household_type',
                         'barangay',
                         'street_sitio',
                         'head_resident_id',
                         'is_4ps_beneficiary',
                         'has_electricity',
                         'notes',
                         'head_resident' => [
                             'id',
                             'first_name',
                             'last_name'
                         ],
                         'members' => [
                             '*' => [
                                 'id',
                                 'first_name',
                                 'last_name',
                                 'relationship_to_head'
                             ]
                         ]
                     ]
                 ]);

        // Verify the response contains the correct data
        $responseData = $response->json('data');
        $this->assertEquals('HH-TEST-001', $responseData['household_number']);
        $this->assertEquals('Test Barangay', $responseData['barangay']);
        $this->assertTrue($responseData['is_4ps_beneficiary']);
        $this->assertTrue($responseData['has_electricity']);
        $this->assertEquals('Test household for retrieval', $responseData['notes']);
        
        // Verify head resident is included
        $this->assertEquals($this->headResident->id, $responseData['head_resident']['id']);
        
        // Verify members are included
        $this->assertCount(1, $responseData['members']);
        $this->assertEquals($this->memberResident1->id, $responseData['members'][0]['id']);
        $this->assertEquals('Spouse', $responseData['members'][0]['relationship_to_head']);
    }

    /**
     * Test household listing with search and filters
     */
    public function test_household_listing_with_filters()
    {
        // Create test households
        $household1 = Household::factory()->create([
            'household_number' => 'HH-SEARCH-001',
            'barangay' => 'Barangay A',
            'household_type' => 'nuclear',
            'is_4ps_beneficiary' => true
        ]);

        $household2 = Household::factory()->create([
            'household_number' => 'HH-SEARCH-002',
            'barangay' => 'Barangay B',
            'household_type' => 'extended',
            'is_4ps_beneficiary' => false
        ]);

        // Test search by household number
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/households?search=SEARCH-001');
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals('HH-SEARCH-001', $response->json('data.data.0.household_number'));

        // Test filter by barangay
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/households?barangay=Barangay A');
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals('Barangay A', $response->json('data.data.0.barangay'));

        // Test filter by household type
        $response = $this->actingAs($this->user, 'sanctum')
                         ->getJson('/api/households?household_type=nuclear');
        
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.data'));
        $this->assertEquals('nuclear', $response->json('data.data.0.household_type'));
    }

    /**
     * Test deleting household and updating member relationships
     */
    public function test_delete_household_updates_members()
    {
        $household = Household::factory()->create([
            'head_resident_id' => $this->headResident->id
        ]);

        // Set up household relationships
        $this->headResident->update([
            'household_id' => $household->id,
            'is_household_head' => true,
            'relationship_to_head' => 'Self'
        ]);

        $this->memberResident1->update([
            'household_id' => $household->id,
            'is_household_head' => false,
            'relationship_to_head' => 'Spouse'
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
                         ->deleteJson("/api/households/{$household->id}");

        $response->assertStatus(200);

        // Verify household was deleted
        $this->assertDatabaseMissing('households', ['id' => $household->id]);

        // Verify residents' household relationships were cleared
        $this->assertDatabaseHas('residents', [
            'id' => $this->headResident->id,
            'household_id' => null,
            'is_household_head' => false,
            'relationship_to_head' => null
        ]);

        $this->assertDatabaseHas('residents', [
            'id' => $this->memberResident1->id,
            'household_id' => null,
            'is_household_head' => false,
            'relationship_to_head' => null
        ]);
    }
}
