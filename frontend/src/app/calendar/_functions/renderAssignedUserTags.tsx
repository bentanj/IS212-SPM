import { User } from '@/mocks/staff/taskMockData';
import Chip from '@mui/material/Chip';
import LockIcon from '@mui/icons-material/Lock';
import { canEditTaskAssignees } from '@/utils/Permissions';

// Custom render for assigned user tags
const renderAssignedUserTags = (
    users: User[],
    getTagProps: any,
    currentUser: User,
    isEditMode: boolean,
    existingAssignees: User[]
) => {
    return users.map((user, index) => {
        const isCurrentUser = user.userId === currentUser.userId;
        const isExistingAssignee = isEditMode && existingAssignees.some(existing => existing.userId === user.userId);
        const canDelete = canEditTaskAssignees(currentUser);
        const { key, ...tagPropsWithoutKey } = getTagProps({ index });

        return (
            <Chip
                key={user.userId}
                {...tagPropsWithoutKey}
                icon={!canDelete ? <LockIcon fontSize="small" /> : undefined}
                label={`${user.name}${isCurrentUser ? ' (You)' : ''}${isExistingAssignee ? ' (Existing)' : ''}`}
                size="small"
                color={isCurrentUser ? 'primary' : isExistingAssignee ? 'secondary' : 'default'}
                variant={isCurrentUser || isExistingAssignee ? 'filled' : 'outlined'}
                onDelete={canDelete ? tagPropsWithoutKey.onDelete : undefined}
            />
        );
    });
};

export default renderAssignedUserTags;