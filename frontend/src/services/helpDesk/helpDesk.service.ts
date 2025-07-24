import { BaseApiService } from "../__shared/api";
import { ApiResponseSchema, PaginatedResponseSchema, type PaginatedResponse } from "../__shared/types";
import { BaseTicketSchema, HelpDeskStatisticsSchema, HelpDeskTicketParamsSchema, type BaseTicket, type HelpDeskStatistics, type HelpDeskTicketParams } from "./helpDesk.type";
import { z } from 'zod';

export class HelpDeskService extends BaseApiService {
    async getTickets(params: HelpDeskTicketParams = {}): Promise<PaginatedResponse<BaseTicket>> {
        const validatedParams = HelpDeskTicketParamsSchema.parse(params);

        const searchParams = new URLSearchParams();
        Object.entries(validatedParams).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
              searchParams.append(key, value.toString());
            }
        });
        const paginatedSchema = PaginatedResponseSchema(BaseTicketSchema);

        return this.request(
            `/help-desk?${searchParams.toString()}`,
            paginatedSchema,
            { method: 'GET' }
        );
    }

    async getStatistics(): Promise<HelpDeskStatistics> {
        const responseSchema = ApiResponseSchema(HelpDeskStatisticsSchema);

        try {
            const response = await this.request(
            '/help-desk/statistics',
            responseSchema,
            { method: 'GET' },
            )

            if (!response.data) throw new Error('Failed to get statistics');
            

            return response.data;
        } catch(error) {
            throw new Error('Failed to fetch help desk statistics');
        }
    }

    async deleteTicket(id: string): Promise<void> {
        if (!id) {
            throw new Error('Invalid ticket ID');
        }

        const responseSchema = ApiResponseSchema(z.any());

        await this.request(
            `/help-desk/${id}`,
            responseSchema,
            { method: 'DELETE' }
        )
    }
}