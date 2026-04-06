import { Router } from 'express';
import { protect } from '../../../shared/middleware/auth.middleware.js';
import { savedPropertiesController } from '../controllers/saved-properties.controller.js';

const router = Router();

router.get('/my/ids', protect, savedPropertiesController.getMySavedPropertyIds.bind(savedPropertiesController));
router.get('/my', protect, savedPropertiesController.getMySavedProperties.bind(savedPropertiesController));
router.post('/:propertyId', protect, savedPropertiesController.saveProperty.bind(savedPropertiesController));
router.delete('/:propertyId', protect, savedPropertiesController.removeSavedProperty.bind(savedPropertiesController));
router.delete('/my', protect, savedPropertiesController.clearSavedProperties.bind(savedPropertiesController));

export default router;
