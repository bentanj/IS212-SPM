import { Autocomplete, TextField } from '@mui/material';
import { User } from '@/types';
import { allUsers } from '@/mocks/allUsers';
import { getAvailableUsers, handleAssignedUsersChange } from '@/utils/TaskCreateModelFunctions';
import renderAssignedUserTags from './renderAssignedUserTags';
import { canEditTaskAssignees } from '@/utils/Permissions';

interface AssignedUsersAutocompleteProps {
    assignedUsers: User[];
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    isEditMode: boolean;
    existingAssignees: User[];
    currentUser: User;
    error?: boolean;
    helperText?: string;
    canAddMoreUsers: boolean;
}

export const AssignedUsersAutocomplete: React.FC<AssignedUsersAutocompleteProps> = ({
    assignedUsers,
    setFormData,
    isEditMode,
    existingAssignees,
    currentUser,
    error = false,
    helperText = '',
    canAddMoreUsers,
}) => {
    const availableUsers = getAvailableUsers(allUsers, assignedUsers);
    const canDelete = canEditTaskAssignees(currentUser);

    return (
        <Autocomplete
            multiple
            options={availableUsers}
            getOptionLabel={(user) => user.name}
            value={assignedUsers}
            onChange={(event, value) =>
                handleAssignedUsersChange(value, isEditMode, canDelete, existingAssignees, setFormData)
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
                    helperText={helperText || "Note: Maximum of 5 users can be assigned"}
                />
            )}
            renderValue={(users, getTagProps) =>
                renderAssignedUserTags(users, getTagProps, currentUser, isEditMode, canDelete, existingAssignees)
            }
            filterSelectedOptions
            getOptionDisabled={() => !canAddMoreUsers}
        />
    )
}