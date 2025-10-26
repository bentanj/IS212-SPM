import { Stack, TextField } from "@mui/material";
import { FormData, RecurrenceFrequency } from "@/types";
import { RecurrenceFreqOptions } from "@/constants/DefaultFormData";
import { DropDownMenu } from "./DropDownMenu";

interface RecurringParamsProps {
    formData: FormData | Omit<FormData, 'taskId'>
    setFormData: React.Dispatch<React.SetStateAction<FormData | Omit<FormData, 'taskId'>>>
    errors: Record<string, string>
}

export const RecurringParams: React.FC<RecurringParamsProps> = ({
    formData, setFormData, errors
}) => {
    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <DropDownMenu
                label="Recurrence Frequency"
                value={formData!.recurrenceFrequency}
                onChange={(val) => setFormData((prev) => ({
                    ...prev,
                    recurrenceFrequency: val as RecurrenceFrequency ?? "One-Off",
                    recurrenceInterval: null // Reset recurrence interval when frequency changes
                }))}
                options={RecurrenceFreqOptions}
                required
            />

            {formData.recurrenceFrequency != "One-Off" &&
                <TextField label="Recurrence Interval"
                    type="number" fullWidth
                    value={formData?.recurrenceInterval ?? ""}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            recurrenceInterval: e.target.value === '' ? null : parseInt(e.target.value),
                        }))}
                    error={!!errors.recurrenceInterval}
                    helperText={errors.recurrenceInterval} />
            }
        </Stack>
    )
}