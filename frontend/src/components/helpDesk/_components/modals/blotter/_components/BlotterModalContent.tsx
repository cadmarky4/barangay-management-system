import React from "react";
import { type ViewBlotter } from "@/services/helpDesk/blotters/blotters.types";
import { BlotterTicketInformationSection } from "./BlotterTicketInformationSection";
import { BlotterComplainantInformationSection } from "./BlotterComplainantInformationSection";
import { BlotterIncidentDetailsSection } from "./BlotterIncidentDetailsSection";
import { BlotterOtherPeopleSection } from "./BlotterOtherPeopleSection";
import { BlotterSupportingDocumentsSection } from "./BlotterSupportingDocumentsSection";
import { BlotterTimestampsSection } from "./BlotterTimestampsSection";

interface BlotterModalContentProps {
  blotter: ViewBlotter;
  mode: "view" | "edit";
}

export const BlotterModalContent: React.FC<BlotterModalContentProps> = ({
  blotter,
  mode,
}) => {
  return (
    <div className="space-y-6">
      <BlotterTicketInformationSection blotter={blotter} mode={mode} />
      <BlotterComplainantInformationSection blotter={blotter} mode={mode} />
      <BlotterIncidentDetailsSection blotter={blotter} mode={mode} />
      <BlotterOtherPeopleSection blotter={blotter} mode={mode} />
      <BlotterSupportingDocumentsSection blotter={blotter} mode={mode} />
      <BlotterTimestampsSection blotter={blotter} />
    </div>
  );
};
