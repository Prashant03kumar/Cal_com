"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slotsController_1 = require("../controllers/slotsController");
const router = (0, express_1.Router)();
router.get('/:slug', slotsController_1.getSlots);
exports.default = router;
