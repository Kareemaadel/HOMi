import { User } from '../../auth/models/User.js';
import { Property, PropertyStatus } from '../../properties/models/Property.js';
import { PropertyOwnershipDoc } from '../../properties/models/PropertyOwnershipDoc.js';
import { PropertyImage } from '../../properties/models/PropertyImage.js';
import { PropertyReport, PropertyReportStatus } from '../../properties/models/PropertyReport.js';
import { Contract, ContractStatus } from '../../contracts/models/Contract.js';
import { Profile } from '../../auth/models/Profile.js';
import type { AdminStatsResponse, AdminListingReport } from '../interfaces/admin.interfaces.js';
import type { PropertyResponse } from '../../properties/interfaces/property.interfaces.js';
import { propertyService } from '../../properties/services/property.service.js';

export class AdminError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code: string = 'ADMIN_ERROR'
    ) {
        super(message);
        this.name = 'AdminError';
    }
}

class AdminService {
    /**
     * Get dashboard stats
     */
    async getDashboardStats(): Promise<AdminStatsResponse> {
        const [totalUsers, totalProperties, rentedProperties, activeContracts] = await Promise.all([
            User.count(),
            Property.count(),
            Property.count({ where: { status: PropertyStatus.RENTED } }),
            Contract.count({ where: { status: ContractStatus.ACTIVE } }),
        ]);

        return {
            totalUsers,
            totalProperties,
            rentedProperties,
            activeContracts,
        };
    }

    /**
     * Get pending properties with landlord and doc details
     */
    async getPendingProperties() {
        const properties = await Property.findAll({
            where: { status: PropertyStatus.PENDING_APPROVAL },
            include: [
                {
                    model: User,
                    as: 'landlord',
                    attributes: ['id', 'email'],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: ['first_name', 'last_name', 'phone_number'],
                        },
                    ],
                },
                {
                    model: PropertyImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'is_main'],
                },
                {
                    model: PropertyOwnershipDoc,
                    as: 'ownershipDocs',
                    attributes: ['id', 'document_url'],
                },
            ],
            order: [['created_at', 'ASC']],
        });

        // We can just format and return them directly rather than mapping DTOs,
        // or we reuse propertyService formatting
        const formatted = properties.map((property) => ({
            // Prefer the explicit main image, otherwise fallback to first uploaded image.
            thumbnailUrl:
                (property as any).images?.find((img: any) => img.is_main)?.image_url ||
                (property as any).images?.[0]?.image_url ||
                null,
            id: property.id,
            title: property.title,
            description: property.description,
            monthlyPrice: Number(property.monthly_price ?? 0),
            address: property.address,
            type: property.type,
            furnishing: property.furnishing,
            status: property.status,
            createdAt: property.created_at,
            landlord: property.landlord ? {
                id: property.landlord.id,
                email: property.landlord.email,
                firstName: property.landlord.profile?.first_name,
                lastName: property.landlord.profile?.last_name,
                phone: property.landlord.profile?.phone_number,
            } : null,
            ownershipDocs: (property as any).ownershipDocs?.map((doc: any) => ({
                id: doc.id,
                documentUrl: doc.document_url,
            })) || [],
        }));

        return formatted;
    }

    /**
     * Verify property
     */
    async verifyProperty(propertyId: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string): Promise<PropertyResponse> {
        const property = await Property.findByPk(propertyId);

        if (!property) {
            throw new AdminError('Property not found', 404, 'PROPERTY_NOT_FOUND');
        }

        if (property.status !== PropertyStatus.PENDING_APPROVAL) {
            throw new AdminError('Property is not pending approval', 400, 'INVALID_STATUS');
        }

        if (action === 'APPROVE') {
            await property.update({ status: PropertyStatus.AVAILABLE, rejection_reason: null });
        } else if (action === 'REJECT') {
            await property.update({ status: PropertyStatus.REJECTED, rejection_reason: rejectionReason || 'Rejected by administration.' });
        }

        // Return updated property using standard format
        return propertyService.getPropertyById(propertyId);
    }

    async getListingReports(): Promise<AdminListingReport[]> {
        const reports = await PropertyReport.findAll({
            include: [
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title', 'address', 'monthly_price', 'landlord_id'],
                    include: [
                        {
                            model: PropertyImage,
                            as: 'images',
                            attributes: ['image_url', 'is_main'],
                        },
                        {
                            model: User,
                            as: 'landlord',
                            attributes: ['id', 'email'],
                            include: [
                                {
                                    model: Profile,
                                    as: 'profile',
                                    attributes: ['first_name', 'last_name'],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'email'],
                    include: [
                        {
                            model: Profile,
                            as: 'profile',
                            attributes: ['first_name', 'last_name'],
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        return reports
            .filter((report) => Boolean((report as any).property))
            .map((report) => {
                const property = (report as any).property;
                const mainImage = property.images?.find((img: any) => img.is_main)?.image_url;
                const fallbackImage = property.images?.[0]?.image_url ?? null;
                return {
                    id: report.id,
                    reason: report.reason,
                    details: report.details,
                    status: report.status as 'OPEN' | 'REVIEWED' | 'ACTIONED',
                    createdAt: report.created_at,
                    property: {
                        id: property.id,
                        title: property.title,
                        address: property.address,
                        monthlyPrice: Number(property.monthly_price ?? 0),
                        thumbnailUrl: mainImage || fallbackImage,
                        landlord: property.landlord
                            ? {
                                id: property.landlord.id,
                                email: property.landlord.email,
                                firstName: property.landlord.profile?.first_name,
                                lastName: property.landlord.profile?.last_name,
                            }
                            : null,
                    },
                    reporter: (report as any).reporter
                        ? {
                            id: (report as any).reporter.id,
                            email: (report as any).reporter.email,
                            firstName: (report as any).reporter.profile?.first_name,
                            lastName: (report as any).reporter.profile?.last_name,
                        }
                        : null,
                };
            });
    }

    async removeListingFromReport(reportId: string, adminId: string): Promise<{ reportId: string; propertyId: string }> {
        const report = await PropertyReport.findByPk(reportId, {
            include: [{ model: Property, as: 'property' }],
        });

        if (!report || !(report as any).property) {
            throw new AdminError('Report not found', 404, 'REPORT_NOT_FOUND');
        }

        const property = (report as any).property as Property;
        const propertyId = property.id;
        await property.destroy();

        await PropertyReport.update(
            {
                status: PropertyReportStatus.ACTIONED,
                reviewed_by_admin_id: adminId,
                reviewed_at: new Date(),
            },
            {
                where: { property_id: propertyId },
            }
        );

        return { reportId: report.id, propertyId };
    }
}

export const adminService = new AdminService();
export default adminService;
