// ============================================================================
// utils/psgc-processor.ts - PSGC data processing utility
// ============================================================================

/**
 * Utility functions to process PSGC data from various sources
 * Run this script in Node.js to process your PSGC data
 */

const fs = require('fs');
const path = require('path');

/**
 * Process PSGC data from PSA format to our required format
 */
function processPSGCData(rawData) {
  const processedData = [];

  rawData.forEach(entry => {
    // Handle different possible field names from different PSGC sources
    const code = String(entry.code || entry.psgc_code || entry.geographic_code || '');
    const name = String(entry.name || entry.geographic_name || entry.area_name || '');
    
    // Determine level based on code length and patterns
    let level = '';
    if (typeof entry.level === 'string') {
      level = entry.level;
    } else if (typeof entry.geographic_level === 'string') {
      level = entry.geographic_level;
    } else {
      // Infer level from code pattern
      level = inferLevelFromCode(code);
    }

    if (code && name && level) {
      processedData.push({
        code: code.toString(),
        name: name.toString(),
        level: level,
        parent: typeof entry.parent === 'string' ? entry.parent : undefined
      });
    }
  });

  return processedData;
}

/**
 * Infer the administrative level from PSGC code patterns
 */
function inferLevelFromCode(code) {
  if (!code || code.length !== 9) return '';

  const codeNum = code.toString();
  
  // Region: XX0000000
  if (codeNum.endsWith('0000000')) {
    return 'Reg';
  }
  
  // Province: XXXX00000
  if (codeNum.endsWith('00000') && !codeNum.endsWith('0000000')) {
    return 'Prov';
  }
  
  // City/Municipality: XXXXXX000
  if (codeNum.endsWith('000') && !codeNum.endsWith('00000')) {
    // Distinguish between City and Municipality based on code patterns
    // This is a simplified approach - you might need to adjust based on your data
    const cityIndicators = ['137', '138', '139', '147', '148']; // Common NCR city prefixes
    if (cityIndicators.some(indicator => codeNum.startsWith(indicator))) {
      return 'City';
    }
    return 'Mun';
  }
  
  // Barangay: XXXXXXXXX (9 digits, not ending in 000)
  if (!codeNum.endsWith('000')) {
    return 'Bgy';
  }

  return '';
}

/**
 * Optimize PSGC data by removing unnecessary fields and sorting
 */
function optimizePSGCData(data) {
  return data
    .filter(entry => entry.code && entry.name && entry.level)
    .map(entry => ({
      code: entry.code,
      name: entry.name.trim(),
      level: entry.level
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Create separate files for each administrative level (optional optimization)
 */
function createSeparateFiles(data, outputDir) {
  const separated = {
    regions: data.filter(entry => entry.level === 'Reg'),
    provinces: data.filter(entry => entry.level === 'Prov'),
    cities: data.filter(entry => entry.level === 'City'),
    municipalities: data.filter(entry => entry.level === 'Mun'),
    barangays: data.filter(entry => entry.level === 'Bgy')
  };

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write separate files
  Object.entries(separated).forEach(([key, values]) => {
    const filePath = path.join(outputDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(values, null, 2));
    console.log(`Created ${filePath} with ${values.length} entries`);
  });

  // Write combined file
  const combinedPath = path.join(outputDir, 'psgc.json');
  fs.writeFileSync(combinedPath, JSON.stringify(data, null, 2));
  console.log(`Created ${combinedPath} with ${data.length} total entries`);
}

/**
 * Validate PSGC data integrity
 */
function validatePSGCData(data) {
  const errors = [];
  const stats = {
    regions: 0,
    provinces: 0,
    cities: 0,
    municipalities: 0,
    barangays: 0
  };

  data.forEach((entry, index) => {
    // Check required fields
    if (!entry.code) {
      errors.push(`Entry ${index}: Missing code`);
    }
    if (!entry.name) {
      errors.push(`Entry ${index}: Missing name`);
    }
    if (!entry.level) {
      errors.push(`Entry ${index}: Missing level`);
    }

    // Check code format
    if (entry.code && entry.code.length !== 9) {
      errors.push(`Entry ${index}: Invalid code length: ${entry.code}`);
    }

    // Count by level
    switch (entry.level) {
      case 'Reg':
        stats.regions++;
        break;
      case 'Prov':
        stats.provinces++;
        break;
      case 'City':
        stats.cities++;
        break;
      case 'Mun':
        stats.municipalities++;
        break;
      case 'Bgy':
        stats.barangays++;
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    stats
  };
}


// save as scripts/process-psgc.js and run with: node scripts/process-psgc.js

async function main() {
  try {
    // Read raw PSGC data (adjust path as needed)
    const rawDataPath = './psgc.json';
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    
    console.log(`Processing ${rawData.length} raw entries...`);
    
    // Process the data
    const processedData = processPSGCData(rawData);
    console.log(`Processed ${processedData.length} entries`);
    
    // Optimize the data
    const optimizedData = optimizePSGCData(processedData);
    console.log(`Optimized to ${optimizedData.length} entries`);
    
    // Validate the data
    const validation = validatePSGCData(optimizedData);
    console.log('Validation results:', validation.stats);
    
    if (!validation.isValid) {
      console.warn('Validation errors:', validation.errors.slice(0, 10)); // Show first 10 errors
    }
    
    // Create output files
    const outputDir = './public/data';
    createSeparateFiles(optimizedData, outputDir);
    
    console.log('PSGC data processing completed!');
    
  } catch (error) {
    console.error('Error processing PSGC data:', error);
  }
}

main();