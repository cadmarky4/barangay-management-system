<?php

namespace App\Console\Commands;

use App\Models\Schemas\ResidentSchema;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateMigrationFromSchema extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schema:generate-migration {model} {--fresh}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate migration from model schema definition';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $model = $this->argument('model');
        $fresh = $this->option('fresh');
        
        if ($model === 'Resident') {
            $this->generateResidentMigration($fresh);
        } else {
            $this->error("Schema not found for model: {$model}");
            return 1;
        }
    }
    
    private function generateResidentMigration($fresh = false)
    {
        $fields = ResidentSchema::getFields();
        
        $migrationContent = $this->buildMigrationContent($fields, $fresh);
        
        $timestamp = date('Y_m_d_His');
        $fileName = $fresh 
            ? "{$timestamp}_create_residents_table_from_schema.php"
            : "{$timestamp}_update_residents_table_from_schema.php";
            
        $path = database_path("migrations/{$fileName}");
        
        File::put($path, $migrationContent);
        
        $this->info("Migration created: {$fileName}");
    }
    
    private function buildMigrationContent($fields, $fresh = false)
    {
        $className = $fresh ? 'CreateResidentsTableFromSchema' : 'UpdateResidentsTableFromSchema';
        $method = $fresh ? 'create' : 'table';
        
        $up = $fresh 
            ? "Schema::create('residents', function (Blueprint \$table) {"
            : "Schema::table('residents', function (Blueprint \$table) {";
            
        $down = $fresh
            ? "Schema::dropIfExists('residents');"
            : "// Add down logic here based on what was added in up()";
        
        $fieldDefinitions = [];
        
        if ($fresh) {
            $fieldDefinitions[] = "\$table->id();";
        }
        
        foreach ($fields as $field => $config) {
            if (in_array($field, ['created_by', 'updated_by'])) {
                continue; // Skip these for now
            }
            
            $line = $this->buildFieldDefinition($field, $config, $fresh);
            if ($line) {
                $fieldDefinitions[] = $line;
            }
        }
        
        if ($fresh) {
            $fieldDefinitions[] = "\$table->timestamps();";
        }
        
        $fieldDefinitionsStr = implode("\n            ", $fieldDefinitions);
        
        return "<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        {$up}
            {$fieldDefinitionsStr}
        });
    }

    public function down(): void
    {
        {$down}
    }
};";
    }
    
    private function buildFieldDefinition($field, $config, $fresh = false)
    {
        $definition = "\$table->";
        
        switch ($config['type']) {
            case 'string':
                $max = $config['max'] ?? 255;
                $definition .= "string('{$field}', {$max})";
                break;
                
            case 'email':
                $max = $config['max'] ?? 255;
                $definition .= "string('{$field}', {$max})";
                break;
                
            case 'text':
                $definition .= "text('{$field}')";
                break;
                
            case 'date':
                $definition .= "date('{$field}')";
                break;
                
            case 'boolean':
                $default = $config['default'] ?? false;
                $definition .= "boolean('{$field}')->default({$this->boolToString($default)})";
                break;
                
            case 'decimal':
                $precision = $config['precision'] ?? 8;
                $scale = $config['scale'] ?? 2;
                $definition .= "decimal('{$field}', {$precision}, {$scale})";
                break;
                
            case 'enum':
                $values = "'" . implode("', '", $config['values']) . "'";
                $definition .= "enum('{$field}', [{$values}])";
                break;
                
            case 'foreignId':
                if (!$fresh) {
                    return null; // Skip foreign keys in updates for now
                }
                $definition .= "foreignId('{$field}')";
                if (isset($config['references'])) {
                    [$table, $column] = explode('.', $config['references']);
                    $definition .= "->constrained('{$table}')";
                }
                break;
                
            default:
                return null;
        }
        
        if (isset($config['nullable']) && $config['nullable']) {
            $definition .= "->nullable()";
        }
        
        if (isset($config['default']) && $config['type'] !== 'boolean') {
            $default = is_string($config['default']) ? "'{$config['default']}'" : $config['default'];
            $definition .= "->default({$default})";
        }
        
        return $definition . ";";
    }
    
    private function boolToString($bool)
    {
        return $bool ? 'true' : 'false';
    }
}
