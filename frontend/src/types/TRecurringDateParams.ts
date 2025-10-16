import { EVENT_FREQUENCY } from "@/constants/RecurringRule";

export interface TRecurringDateParams {
    startDate: Date;
    endDate: Date;
    frequency: keyof typeof EVENT_FREQUENCY;
    frequencyInterval: number;
};