// ============================================================================
// hooks/residents/use-duplicate-check.ts - Duplicate checking hook
// ============================================================================

import { useState } from 'react';
import { residentsService } from '@/services/residents/residents.service';
import { type Resident } from '@/services/residents/residents.types';

interface CheckDuplicatesParams {
  firstName: string;
  lastName: string;
  birthDate: string;
}

interface UseCheckDuplicatesProps {
  onDuplicatesFound?: (duplicates: Resident[]) => void;
}

export function useCheckDuplicates({ onDuplicatesFound }: UseCheckDuplicatesProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [duplicates, setDuplicates] = useState<Resident[]>([]);

  const checkDuplicates = async ({ firstName, lastName, birthDate }: CheckDuplicatesParams) => {
    setIsChecking(true);
    try {
      const result = await residentsService.checkDuplicate(firstName, lastName, birthDate);
      setDuplicates(result);
      onDuplicatesFound?.(result);
      return result;
    } catch (error) {
      console.error('Failed to check duplicates:', error);
      return [];
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkDuplicates,
    isChecking,
    duplicates,
  };
}
