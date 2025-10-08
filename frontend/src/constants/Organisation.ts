type Organisation = {
    [division: string]: string[];
};

export const ORGANISATION: Organisation = {
    "Sales Division": ["Sales Manager", "Account Managers"],
    "Sales Manager": ["Account Managers"],
    "Account Managers": [],
    "Consultancy Division": ["Consultant"],
    "Consultant": [],
    "System Solutioning Division": ["Developers", "Support Team"],
    "Developers": [],
    "Support Team": [],
    "Engineering Operation Division": ["Senior Engineers", "Junior Engineers", "Call Center", "Operation Planning Team"],
    "Senior Engineers": [],
    "Junior Engineers": [],
    "Call Center": [],
    "Operation Planning Team": [],
    "HR/Admin Division": ["HR Team", "L&D Team", "Admin Team"],
    "HR Team": [],
    "L&D Team": [],
    "Admin Team": [],
    "Finance Division": ["Finance Manager", "Finance Executive"],
    "Finance Manager": ["Finance Executive"],
    "Finance Executive": [],
    "IT Division": ["IT Team"],
    "IT Team": []
}

export const ALL_DEPARTMENTS = Object.keys(ORGANISATION).sort()