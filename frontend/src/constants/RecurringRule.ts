import { RRule } from 'rrule';

export const EVENT_FREQUENCY = {
    "One-off": "",
    "Daily": RRule.DAILY,
    "Weekly": RRule.WEEKLY,
    "Monthly": RRule.MONTHLY,
    "Yearly": RRule.YEARLY,
}