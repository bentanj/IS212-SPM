// @ts-nocheck

import { canAddMoreUsers, canRemoveUser } from '../../TaskCreateModelFunctions';

describe('canAddMoreUsers', () => {
    it('returns true if less than 5 users assigned', () => {
        expect(canAddMoreUsers([{ userId: '1' }, { userId: '2' }])).toBe(true);
    });

    it('returns false if 5 users assigned', () => {
        const users = [
            { userId: '1' },
            { userId: '2' },
            { userId: '3' },
            { userId: '4' },
            { userId: '5' },
        ];
        expect(canAddMoreUsers(users)).toBe(false);
    });

    it('returns false if more than 5 users assigned', () => {
        const users = [
            { userId: '1' },
            { userId: '2' },
            { userId: '3' },
            { userId: '4' },
            { userId: '5' },
            { userId: '6' },
        ];
        expect(canAddMoreUsers(users)).toBe(false);
    });
});

describe('canRemoveUser', () => {
    const userA = { userId: 'A' };
    const userB = { userId: 'B' };
    const userC = { userId: 'C' };
    const existingAssignees = [userA, userB];

    it('returns true if not in edit mode and user is not current user', () => {
        expect(canRemoveUser(userA, false, userC, existingAssignees)).toBe(true);
    });

    it('returns false if not in edit mode and user is current user', () => {
        expect(canRemoveUser(userA, false, userA, existingAssignees)).toBe(false);
    });

    it('returns false if in edit mode and user is in existingAssignees', () => {
        expect(canRemoveUser(userA, true, userC, existingAssignees)).toBe(false);
    });

    it('returns true if in edit mode and user is NOT in existingAssignees', () => {
        expect(canRemoveUser(userC, true, userB, existingAssignees)).toBe(true);
    });
});
