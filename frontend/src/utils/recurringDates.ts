import { Frequency, RRule } from 'rrule';
import { EVENT_FREQUENCY } from '@/constants/RecurringRule';
import { TRecurringDateParams } from '@/types';

/*
RRule Documentation: https://www.npmjs.com/package/rrule
RRule Demo App: https://jkbrzt.github.io/rrule/

dates = new RRule({
  freq: RRule.DAILY,
  dtstart: new Date(Date.UTC(2025, 5, 6, 0, 0, 0)),     // 6 June 2025
  until: new Date(Date.UTC(2025, 5, 12, 0, 0, 0)),      // 12 June 2025
  interval: 2
})

Common Methods:
dates.all()     = [
                    2025-06-06T00:00:00.000Z,
                    2025-06-08T00:00:00.000Z,
                    2025-06-10T00:00:00.000Z,
                    2025-06-12T00:00:00.000Z
                    ]
                    // Array of dates based on given rule conditions
dates.toText()  = every 2 years until June 12, 2025
*/

// Return dates object
export function recurringDates(
    { startDate, endDate, frequency, frequencyInterval }: TRecurringDateParams) {

    let dates: RRule;

    const baseConfig = {
        dtstart: startDate,
        until: endDate,
        interval: frequencyInterval
    }

    dates = new RRule({
        ...baseConfig,
        freq: EVENT_FREQUENCY[frequency] as Frequency,
    })

    return dates
}

export function lastRecurringDate(
    { startDate, endDate, frequency, frequencyInterval }: TRecurringDateParams) {

    try {
        const dates = recurringDates({ startDate, endDate, frequency, frequencyInterval })
        const resultDates: Date[] = dates.all();

        // Ensure the start date is included in the result
        if (!resultDates.some(date => date.getTime() === startDate.getTime())) {
            resultDates.unshift(startDate);
        }
        return {
            "recurringDatesHasStartDate": resultDates.length == dates.all().length,
            "recurringResult": dates.toText(),
            "count": resultDates.length,
            "firstRecurringDate": resultDates.at(0)?.toDateString(),
            "lastRecurringDate": resultDates.at(-1)?.toDateString(),
        }
    }
    catch (error) {
        return { recurringResult: "Invalid Recurrence Rule", lastRecurringDate: null };
    }
}