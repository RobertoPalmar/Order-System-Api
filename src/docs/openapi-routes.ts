//----------------------------------------------------------------------//
//                        OPENAPI ROUTE ANNOTATIONS                      //
//----------------------------------------------------------------------//
// Centralized JSDoc @swagger blocks for every route mounted in app.ts.
// swagger-jsdoc scans this file (see swaggerOptions.apis) and merges the
// operations into the base spec from src/docs/swagger.ts.
//
// DO NOT add runtime code here - only annotations. If you add a new route,
// add a matching @swagger block below and tag it appropriately.
//----------------------------------------------------------------------//

export {};

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Auth]
 *     summary: API info / health
 *     description: Returns the package name, author, description and version.
 *     security: []
 *     responses:
 *       201:
 *         description: API info payload
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 */

/* ============================= AUTH ============================= */

/**
 * @swagger
 * /Auth/signUp:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     description: Public endpoint. Creates a user (platform-level, not yet a business member).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserDTOIn' }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/UserDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       429: { $ref: '#/components/responses/RateLimitExceeded' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Auth/signIn:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in and obtain a USER_TOKEN
 *     description: >
 *       Authenticates email+password and returns a user-level JWT. Use this
 *       token to call GET /Auth/signInBussinesUnit/:businessUnitID to obtain a
 *       BUSINESS_TOKEN for a specific tenant.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SignInDTOIn' }
 *     responses:
 *       201:
 *         description: USER_TOKEN issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/AuthTokenData' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       429: { $ref: '#/components/responses/RateLimitExceeded' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Auth/signInBussinesUnit/{businessUnitID}:
 *   get:
 *     tags: [Auth]
 *     summary: Exchange USER_TOKEN for a BUSINESS_TOKEN
 *     description: >
 *       Requires a USER_TOKEN. Returns a BUSINESS_TOKEN scoped to the given
 *       business unit if the user is an active member.
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: BUSINESS_TOKEN issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/AuthTokenData' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/RateLimitExceeded' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate tokens using a refresh token
 *     description: Public endpoint. Exchanges a valid refresh token for a new access/refresh pair.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RefreshTokenRequestDTOIn' }
 *     responses:
 *       201:
 *         description: Rotated tokens
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       429: { $ref: '#/components/responses/RateLimitExceeded' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate a refresh token
 *     description: Public endpoint. Revokes the provided refresh token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LogoutRequestDTOIn' }
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       429: { $ref: '#/components/responses/RateLimitExceeded' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* ========================== BUSINESS UNIT ========================= */

/**
 * @swagger
 * /BusinessUnit/getAllBusinessUnit:
 *   get:
 *     tags: [BusinessUnit]
 *     summary: List business units (paginated)
 *     description: Requires a USER_TOKEN (not a business token). Returns BUs visible to the caller.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Paginated list of business units
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/BusinessUnitDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /BusinessUnit/getBusinessUnitByID/{businessUnitID}:
 *   get:
 *     tags: [BusinessUnit]
 *     summary: Get a business unit by id
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Business unit
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/BusinessUnitDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /BusinessUnit/getBusinessUnitsBy:
 *   get:
 *     tags: [BusinessUnit]
 *     summary: Filter business units by field
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: description
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered business units
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /BusinessUnit/createBusinessUnit:
 *   post:
 *     tags: [BusinessUnit]
 *     summary: Create a new business unit
 *     description: Requires a USER_TOKEN. The calling user becomes the owner.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/BusinessUnitDTOIn' }
 *     responses:
 *       201:
 *         description: Created business unit
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/BusinessUnitDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /BusinessUnit/updateBusinessUnit/{businessUnitID}:
 *   put:
 *     tags: [BusinessUnit]
 *     summary: Update a business unit
 *     description: Requires a BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialBusinessUnitDTOIn' }
 *     responses:
 *       200:
 *         description: Updated business unit
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /BusinessUnit/deleteBusinessUnit/{businessUnitID}:
 *   delete:
 *     tags: [BusinessUnit]
 *     summary: Delete a business unit
 *     description: Requires a BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* ========================= MEMBERSHIPS ========================= */

/**
 * @swagger
 * /BusinessUnit/{businessUnitID}/members:
 *   get:
 *     tags: [Memberships]
 *     summary: List members of a business unit
 *     description: Requires BUSINESS_TOKEN. Roles ADMIN or ANFITRION.
 *     x-role-matrix: [ADMIN, ANFITRION]
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Memberships list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/MembershipDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 *   post:
 *     tags: [Memberships]
 *     summary: Invite a user as a member
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MembershipDTOIn' }
 *     responses:
 *       201:
 *         description: Member invited
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/MembershipDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /BusinessUnit/{businessUnitID}/members/{membershipID}:
 *   put:
 *     tags: [Memberships]
 *     summary: Update a membership (role / status)
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: membershipID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialMembershipDTOIn' }
 *     responses:
 *       200:
 *         description: Membership updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 *   delete:
 *     tags: [Memberships]
 *     summary: Remove a member
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: businessUnitID
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: membershipID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member removed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* ============================== USERS ============================== */

/**
 * @swagger
 * /Users/getAllUsers:
 *   get:
 *     tags: [Users]
 *     summary: List users (paginated)
 *     description: Requires a USER_TOKEN (any authenticated user).
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Paginated users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/UserDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Users/getUserByID/{userID}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by id
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/UserDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Users/getUsersBy:
 *   get:
 *     tags: [Users]
 *     summary: Filter users
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: boolean }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered users
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Users/deleteUser/{userID}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     description: Requires a BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* ============================ PRODUCTS ============================ */

/**
 * @swagger
 * /Products/getAllProducts:
 *   get:
 *     tags: [Products]
 *     summary: List products (paginated) for the current business unit
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Paginated products
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/ProductDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Products/getProductByID/{productID}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by id
 *     parameters:
 *       - in: path
 *         name: productID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/ProductDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Products/getProductsBy:
 *   get:
 *     tags: [Products]
 *     summary: Filter products
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: boolean }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered products
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Products/createProduct:
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductDTOIn' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/ProductDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Products/updateProduct/{productID}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: productID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialProductDTOIn' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Products/deleteProduct/{productID}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: productID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* =========================== CATEGORIES =========================== */

/**
 * @swagger
 * /Categories/getAllCategories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories (paginated)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated categories
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/CategoryDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Categories/getCategoryByID/{categoryID}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by id
 *     parameters:
 *       - in: path
 *         name: categoryID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CategoryDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Categories/getCategoriesBy:
 *   get:
 *     tags: [Categories]
 *     summary: Filter categories
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered categories
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Categories/createCategory:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CategoryDTOIn' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CategoryDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Categories/updateCategory/{categoryID}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: categoryID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialCategoryDTOIn' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Categories/deleteCategory/{categoryID}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: categoryID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* =========================== CURRENCIES =========================== */

/**
 * @swagger
 * /Currencies/getAllCurrencies:
 *   get:
 *     tags: [Currencies]
 *     summary: List currencies (paginated)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated currencies
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/CurrencyDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Currencies/getCurrencyByID/{currencyID}:
 *   get:
 *     tags: [Currencies]
 *     summary: Get a currency by id
 *     parameters:
 *       - in: path
 *         name: currencyID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Currency
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CurrencyDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Currencies/getCurrenciesBy:
 *   get:
 *     tags: [Currencies]
 *     summary: Filter currencies
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: ISO
 *         schema: { type: string }
 *       - in: query
 *         name: main
 *         schema: { type: boolean }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered currencies
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Currencies/createCurrency:
 *   post:
 *     tags: [Currencies]
 *     summary: Create a currency
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CurrencyDTOIn' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CurrencyDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Currencies/updateCurrency/{currencyID}:
 *   put:
 *     tags: [Currencies]
 *     summary: Update a currency
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: currencyID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialCurrencyDTOIn' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Currencies/deleteCurrency/{currencyID}:
 *   delete:
 *     tags: [Currencies]
 *     summary: Delete a currency
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: currencyID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* =========================== COMPONENTS =========================== */

/**
 * @swagger
 * /Components/getAllComponents:
 *   get:
 *     tags: [Components]
 *     summary: List components (paginated)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated components
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/ComponentDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Components/getComponentByID/{componentID}:
 *   get:
 *     tags: [Components]
 *     summary: Get a component by id
 *     parameters:
 *       - in: path
 *         name: componentID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Component
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/ComponentDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Components/getComponentsBy:
 *   get:
 *     tags: [Components]
 *     summary: Filter components
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { $ref: '#/components/schemas/ComponentType' }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered components
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Components/createComponent:
 *   post:
 *     tags: [Components]
 *     summary: Create a component
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ComponentDTOIn' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/ComponentDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Components/updateComponent/{componentID}:
 *   put:
 *     tags: [Components]
 *     summary: Update a component
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: componentID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialComponentDTOIn' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Components/deleteComponent/{componentID}:
 *   delete:
 *     tags: [Components]
 *     summary: Delete a component
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: componentID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* ============================ CUSTOMERS ============================ */

/**
 * @swagger
 * /Customers/getAllCustomers:
 *   get:
 *     tags: [Customers]
 *     summary: List customers (paginated)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated customers
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/CustomerDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Customers/getCustomerByID/{customerID}:
 *   get:
 *     tags: [Customers]
 *     summary: Get a customer by id
 *     parameters:
 *       - in: path
 *         name: customerID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Customer
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CustomerDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Customers/getCustomersBy:
 *   get:
 *     tags: [Customers]
 *     summary: Filter customers
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema: { type: string }
 *       - in: query
 *         name: lastName
 *         schema: { type: string }
 *       - in: query
 *         name: documentID
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered customers
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Customers/createCustomer:
 *   post:
 *     tags: [Customers]
 *     summary: Create a customer
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CustomerDTOIn' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/CustomerDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Customers/updateCustomer/{customerID}:
 *   put:
 *     tags: [Customers]
 *     summary: Update a customer
 *     description: Requires BUSINESS_TOKEN. Roles ADMIN or ANFITRION.
 *     x-role-matrix: [ADMIN, ANFITRION]
 *     parameters:
 *       - in: path
 *         name: customerID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialCustomerDTOIn' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Customers/deleteCustomer/{customerID}:
 *   delete:
 *     tags: [Customers]
 *     summary: Delete a customer
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: customerID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* ======================= PRODUCTION AREAS ======================= */

/**
 * @swagger
 * /ProductionAreas/getAllProductionAreas:
 *   get:
 *     tags: [ProductionAreas]
 *     summary: List production areas (paginated)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Paginated production areas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/ProductionAreaDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /ProductionAreas/getProductionAreaByID/{productionAreaID}:
 *   get:
 *     tags: [ProductionAreas]
 *     summary: Get a production area by id
 *     parameters:
 *       - in: path
 *         name: productionAreaID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Production area
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/ProductionAreaDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /ProductionAreas/getProductionAreasBy:
 *   get:
 *     tags: [ProductionAreas]
 *     summary: Filter production areas
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: boolean }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered production areas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /ProductionAreas/createProductionArea:
 *   post:
 *     tags: [ProductionAreas]
 *     summary: Create a production area
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductionAreaDTOIn' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/ProductionAreaDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /ProductionAreas/updateProductionArea/{productionAreaID}:
 *   put:
 *     tags: [ProductionAreas]
 *     summary: Update a production area
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: productionAreaID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialProductionAreaDTOIn' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /ProductionAreas/deleteProductionArea/{productionAreaID}:
 *   delete:
 *     tags: [ProductionAreas]
 *     summary: Delete a production area
 *     description: Requires BUSINESS_TOKEN. ADMIN role only.
 *     x-role-matrix: [ADMIN]
 *     parameters:
 *       - in: path
 *         name: productionAreaID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/* ============================= ORDERS ============================= */

/**
 * @swagger
 * /Orders/getAllOrders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders (paginated)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Paginated orders
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/OrderDTOOut' }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Orders/getOrderByID/{orderID}:
 *   get:
 *     tags: [Orders]
 *     summary: Get an order by id
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/OrderDTOOut' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Orders/getOrdersBy:
 *   get:
 *     tags: [Orders]
 *     summary: Filter orders
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/OrderStatus' }
 *       - in: query
 *         name: type
 *         schema: { $ref: '#/components/schemas/OrderType' }
 *       - in: query
 *         name: customer
 *         schema: { type: string }
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Filtered orders
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Orders/createOrder:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order
 *     description: Requires BUSINESS_TOKEN. Roles ADMIN, ANFITRION, or WAITER.
 *     x-role-matrix: [ADMIN, ANFITRION, WAITER]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderDTOIn' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/OrderDTOOut' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Orders/updateOrder/{orderID}:
 *   put:
 *     tags: [Orders]
 *     summary: Update an order
 *     description: Requires BUSINESS_TOKEN. Roles ADMIN, ANFITRION, or WAITER.
 *     x-role-matrix: [ADMIN, ANFITRION, WAITER]
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PartialOrderDTOIn' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */

/**
 * @swagger
 * /Orders/deleteOrder/{orderID}:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete an order
 *     description: Requires BUSINESS_TOKEN. Roles ADMIN or ANFITRION.
 *     x-role-matrix: [ADMIN, ANFITRION]
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiSuccess' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/UnexpectedError' }
 */
