const express = require("express");
const validate = require("../../middlewares/validate");
const meValidation = require("../../validations/me.validation");
const meController = require("../../controllers/me.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(auth(), meController.getMe)
  .patch(auth(), validate(meValidation.updateMe), meController.updateMe);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Me
 *   description: Current user profile management
 */

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *   patch:
 *     summary: Update current user profile
 *     description: Only name and mobile can be updated
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               mobile:
 *                 type: string
 *             example:
 *               name: "John Doe"
 *               mobile: "+8801610111111"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
