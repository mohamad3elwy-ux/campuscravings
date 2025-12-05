const express = require('express');
const router = express.Router();
const Truck = require('../models/Truck');
const { auth, isTruckOwner, isCustomer } = require('../middleware/auth');

// GET /api/v1/trucks/view - View all available trucks (Customer)
router.get('/view', async (req, res) => {
  try {
    const trucks = await Truck.find({ isApproved: true, isActive: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/trucks/myTruck - View my truck info (Truck Owner)
router.get('/myTruck', auth, isTruckOwner, async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user._id });
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/trucks/new - Create new truck (Truck Owner)
router.post('/new', auth, isTruckOwner, async (req, res) => {
  try {
    const { name, description, location, coverPicture, operatingHours } = req.body;

    const truck = new Truck({
      name,
      description,
      location,
      owner: req.user._id,
      coverPicture,
      operatingHours,
      isApproved: false,
      isActive: true
    });

    await truck.save();
    res.status(201).json({ message: 'Truck created, pending approval', truck });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/trucks/updateOrderStatus - Update truck availability (Truck Owner)
router.put('/updateOrderStatus', auth, isTruckOwner, async (req, res) => {
  try {
    const { truckId, isActive } = req.body;

    const truck = await Truck.findOne({ _id: truckId, owner: req.user._id });
    if (!truck) {
      return res.status(404).json({ error: 'Truck not found or access denied' });
    }

    truck.isActive = isActive;
    await truck.save();

    res.json({ message: 'Truck availability updated', truck });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/trucks/edit/:truckId - Edit truck (Truck Owner)
router.put('/edit/:truckId', auth, isTruckOwner, async (req, res) => {
  try {
    const truck = await Truck.findOne({ _id: req.params.truckId, owner: req.user._id });
    if (!truck) {
      return res.status(404).json({ error: 'Truck not found or access denied' });
    }

    const updates = req.body;
    Object.assign(truck, updates);
    await truck.save();

    res.json({ message: 'Truck updated', truck });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/trucks/delete/:truckId - Delete truck (Truck Owner)
router.delete('/delete/:truckId', auth, isTruckOwner, async (req, res) => {
  try {
    const truck = await Truck.findOne({ _id: req.params.truckId, owner: req.user._id });
    if (!truck) {
      return res.status(404).json({ error: 'Truck not found or access denied' });
    }

    await Truck.findByIdAndDelete(req.params.truckId);
    res.json({ message: 'Truck deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/trucks/:truckId - Get single truck details
router.get('/:truckId', async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.truckId).populate('owner', 'name');
    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    res.json(truck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
