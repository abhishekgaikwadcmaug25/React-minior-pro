const express = require('express');
const PropertyController = require('../controllers/propertyController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', PropertyController.getProperties);
router.get('/:id', PropertyController.getProperty);
router.post('/', auth, authorize('owner', 'admin'), PropertyController.createProperty);
router.put('/:id', auth, authorize('owner', 'admin'), PropertyController.updateProperty);
router.delete('/:id', auth, authorize('owner', 'admin'), PropertyController.deleteProperty);
router.get('/user/my-properties', auth, authorize('owner', 'admin'), PropertyController.getUserProperties);

module.exports = router;