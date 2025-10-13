import { Autocomplete, TextField } from '@mui/material';
import { User } from '@/types';
import renderAssignedUserTags from '../../_functions/renderAssignedUserTags';
import { handleAssignedUsersChange } from '../../_functions/TaskCreateModelFunctions';

interface AssignedUsersAutocompleteProps {
    availableUsers: User[];
    assignedUsers: User[];
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    isEditMode: boolean;
    existingAssignees: User[];
    currentUser: User;
    currentUserObj?: User;
    error?: boolean;
    helperText?: string;
    canAddMoreUsers: boolean;
}

export const AssignedUsersAutocomplete: React.FC<AssignedUsersAutocompleteProps> = ({
    availableUsers,
    assignedUsers,
    setFormData,
    isEditMode,
    existingAssignees,
    currentUser,
    currentUserObj,
    error = false,
    helperText = '',
    canAddMoreUsers,
}) => {

    return (
        <Autocomplete
            multiple
            options={availableUsers}
            getOptionLabel={(user) => user.name}
            value={assignedUsers}
            onChange={(event, value) =>
                handleAssignedUsersChange(event, value, isEditMode, existingAssignees, currentUser, currentUserObj, setFormData)
            }
            noOptionsText={
                !canAddMoreUsers
                    ? 'Maximum 5 users reached. Remove a user to add more.'
                    : availableUsers.length === 0
                        ? 'No more users available'
                        : 'No options'
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Assigned Users"
                    required
                    margin="normal"
                    error={error}
                    helperText={helperText || (isEditMode ? "Note: Existing assignees cannot be removed, but you can add new ones" : "")}
                />
            )}
            renderTags={(users, getTagProps) =>
                renderAssignedUserTags(users, getTagProps, currentUser, isEditMode, existingAssignees)
            }
            filterSelectedOptions
            getOptionDisabled={() => !canAddMoreUsers}
        />
    )
}