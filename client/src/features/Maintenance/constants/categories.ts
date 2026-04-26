export const MAINTENANCE_CATEGORIES = [
    'Plumbing',
    'Electrical',
    'Painting',
    'AC Service',
    'Gardening',
    'Flooring',
    'Other',
] as const;

export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];
