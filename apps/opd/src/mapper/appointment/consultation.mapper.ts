import { consultationNotesService } from "@/services/master/consultationNotes.service.js";
import {
  ConsultationDTO,
  ConsultationResponse,
  NotesDetails,
} from "@/types/appointment/consultation.js";
import { customOmit } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";

export const toConsultationDTO = async (
  input: ConsultationResponse,
): Promise<ConsultationDTO> => {
  const omittedInput = customOmit<
    ConsultationResponse,
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "deletedAt"
    | "createdAt"
    | "updatedAt"
    | "appointmentId"
    | "patientId"
  >(input, [
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
    "createdAt",
    "updatedAt",
    "appointmentId",
    "patientId",
  ]);
  const appointment = input.appointment
    ? toAppointmentDetailsDto(input.appointment)
    : null;

  const notes = input.consultationNotes as Record<string, string>;
  const notesDetails: NotesDetails[] = [];
  for (const [key, value] of Object.entries(notes)) {
    const note = await consultationNotesService.getConsultationNotesById(
      Number(key),
      true,
    );
    if (note) {
      // notes[note.consultationName] = notes[key];
      // delete notes[key];
      notesDetails.push({
        id: note.id,
        notesName: note.consultationName,
        note: value,
      });
    }
  }

  return {
    ...omittedInput.rest,
    consultationNotes: notesDetails,
    appointment,
  };
};
