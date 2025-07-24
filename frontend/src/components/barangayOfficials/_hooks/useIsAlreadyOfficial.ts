import { barangayOfficialsService } from "@/services/officials/barangayOfficials.service";
import { useState } from "react"

export const useIsAlreadyRegisteredAsOfficial = () => {
    const [isChecking, setIsChecking] = useState(false);
    

    const getOfficialRegistrationStatus = async (residentId: string) => {
        setIsChecking(true);
        try {
            // toString() muna para di magloko 😭
            const result = await barangayOfficialsService.isAlreadyOfficial(residentId);
            return {
                successMessage: "Successfully checked resident's official status",
                result: result,
                errorMessage: ""
            };

        } catch (error) {
            console.error('Failed to check if resident is already a registered official:', error);
            return {
                successMessage: "",
                result: -1,
                errorMessage: "Failed to check if resident is already a registered official"
            };
        } finally {
            setIsChecking(false);
        }
    }

    return {
        getOfficialRegistrationStatus,
        isChecking,
    };
};