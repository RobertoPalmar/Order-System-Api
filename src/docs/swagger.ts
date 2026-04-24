import { Options as SwaggerJsdocOptions } from "swagger-jsdoc";
import pkg from "../../package.json";

//----------------------------------------------------------------------//
//            OPENAPI 3.0 DEFINITION - COMMANDER / ORDER SYSTEM          //
//----------------------------------------------------------------------//
// Central OpenAPI 3.0.0 spec used by swagger-jsdoc. Path/operation
// annotations live in src/docs/openapi-routes.ts so route files stay
// clean. Entity and DTO schemas are fully declared below; changes to the
// DTO classes in src/models/DTOs/* must be reflected here.
//----------------------------------------------------------------------//

const definition = {
  openapi: "3.0.0",
  info: {
    title: "Commander System API (Sistema de Comandas)",
    version: (pkg as { version: string }).version,
    description:
      "Multi-tenant Order Management REST API for restaurants. JWT auth with " +
      "two token types: user token (from /Auth/signIn) and business token " +
      "(from /Auth/signInBussinesUnit/:businessUnitID). Most per-business " +
      "routes require a business token. All responses follow a consistent " +
      "envelope: { success, code, message, data?, metadata:{timestamp, path} }.",
    contact: {
      name: (pkg as { author?: string }).author ?? "rpalmar",
    },
  },
  servers: [
    { url: "/v1", description: "current server" },
  ],
  tags: [
    { name: "Auth", description: "Sign up, sign in and business-scoped login" },
    { name: "BusinessUnit", description: "Business unit (tenant) management" },
    { name: "Memberships", description: "Members of a given business unit" },
    { name: "Users", description: "User read/delete (registration via /Auth/signUp)" },
    { name: "Products", description: "Products offered by a business unit" },
    { name: "Categories", description: "Product categories" },
    { name: "Currencies", description: "Currencies supported by a business unit" },
    { name: "Components", description: "Product components / extras" },
    { name: "Customers", description: "Customer records" },
    { name: "ProductionAreas", description: "Production areas (kitchen stations)" },
    { name: "Orders", description: "Orders / tickets" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "User token for /Auth/signInBussinesUnit and /BusinessUnit reads. " +
          "Business token (from /Auth/signInBussinesUnit/:businessUnitID) for " +
          "all per-business-unit routes.",
      },
    },
    parameters: {
      PageParam: {
        name: "page",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, default: 1 },
        description: "Page number (1-based). Used by paginated list endpoints.",
      },
      LimitParam: {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", minimum: 1, default: 10 },
        description: "Page size for paginated list endpoints.",
      },
      SortByParam: {
        name: "sortBy",
        in: "query",
        required: false,
        schema: { type: "string" },
        description: "Field name to sort by.",
      },
      SortOrderParam: {
        name: "sortOrder",
        in: "query",
        required: false,
        schema: { type: "string", enum: ["asc", "desc"] },
        description: "Sort direction.",
      },
    },
    schemas: {
      //----------------- ENUMS -----------------//
      UserRole: {
        type: "integer",
        enum: [0, 1, 2, 3],
        description: "0=ADMIN, 1=ANFITRION, 2=WAITER, 3=PREP_COOK",
      },
      ComponentType: {
        type: "integer",
        enum: [0, 1, 2],
        description: "0=COMPONENT, 1=EXTRA, 2=COMPONENT_AND_EXTRA",
      },
      OrderStatus: {
        type: "integer",
        enum: [0, 1, 2, 3, 4],
        description:
          "0=PENDING, 1=CREATED, 2=IN_PROGRESS, 3=COMPLETED, 4=CANCELLED",
      },
      OrderType: {
        type: "integer",
        enum: [0, 1, 2],
        description: "0=DINE_IN, 1=TAKE_AWAY, 2=DELIVERY",
      },
      TokenType: {
        type: "integer",
        enum: [0, 1],
        description: "0=USER_TOKEN, 1=BUSINESS_TOKEN",
      },

      //----------------- RESPONSE ENVELOPE -----------------//
      ApiMetadata: {
        type: "object",
        properties: {
          timestamp: { type: "string", format: "date-time" },
          path: { type: "string" },
        },
      },
      ApiSuccess: {
        type: "object",
        required: ["success", "code", "message"],
        properties: {
          success: { type: "boolean", example: true },
          code: {
            type: "integer",
            description:
              "App-level code. 1000=INFO, 1001=CREATION, 1002=UPDATE, 1003=DELETE, 1004=GET",
          },
          message: { type: "string" },
          data: {},
          metadata: { $ref: "#/components/schemas/ApiMetadata" },
        },
      },
      ApiError: {
        type: "object",
        required: ["success", "code", "message"],
        properties: {
          success: { type: "boolean", example: false },
          code: {
            type: "integer",
            description:
              "App-level error code. Common values: 4001 UNAUTHORIZED, 4002 REQUIRED_FIELD, 4003 INVALID_FIELD, 4004 INVALID_FORMAT, 4005 DUPLICATE_FIELD, 4006 NOT_FOUND, 4010 MISSING_TOKEN, 4011 INVALID_TOKEN, 4012 EXPIRED_TOKEN, 4013 INVALID_TOKEN_TYPE, 4014 VALIDATION_ERROR, 4015 INVALID_USER_REQUEST, 4016 USER_EXCEEDS_THE_BUSINESS_UNIT_VALID, 4017 PRODUCT_CODE_INVALID_IN_ORDER_DETAIL, 4030 FORBIDDEN, 4031 NOT_MEMBER_OF_BUSINESS, 4290 RATE_LIMIT_EXCEEDED, 5000 UNEXPECTED_ERROR",
          },
          message: { type: "string" },
          data: {},
          metadata: { $ref: "#/components/schemas/ApiMetadata" },
        },
      },
      ValidationErrorItem: {
        type: "object",
        properties: {
          property: { type: "string" },
          constraints: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },

      //----------------- OUTPUT DTOs -----------------//
      UserDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          status: { type: "boolean" },
          validBusinessUnit: { type: "integer" },
        },
      },
      BusinessUnitDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          owner: { $ref: "#/components/schemas/UserDTOOut" },
        },
      },
      MembershipDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          user: { $ref: "#/components/schemas/UserDTOOut" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
          role: { $ref: "#/components/schemas/UserRole" },
          status: { type: "boolean" },
        },
      },
      CategoryDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
        },
      },
      CurrencyDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          ISO: { type: "string" },
          symbol: { type: "string" },
          exchangeRate: { type: "number" },
          main: { type: "boolean" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
        },
      },
      ComponentDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          type: { $ref: "#/components/schemas/ComponentType" },
          status: { type: "boolean" },
          priceAsExtra: { type: "number" },
          currency: { $ref: "#/components/schemas/CurrencyDTOOut" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
        },
      },
      ProductDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          category: { $ref: "#/components/schemas/CategoryDTOOut" },
          components: {
            type: "array",
            items: { $ref: "#/components/schemas/ComponentDTOOut" },
          },
          price: { type: "number" },
          cost: { type: "number" },
          currency: { $ref: "#/components/schemas/CurrencyDTOOut" },
          status: { type: "boolean" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
        },
      },
      ProductionAreaDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "boolean" },
          preferredCategory: {
            type: "array",
            items: { $ref: "#/components/schemas/CategoryDTOOut" },
          },
          priority: { type: "integer" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
        },
      },
      CustomerDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          documentID: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
        },
      },
      OrderDetailDTOOut: {
        type: "object",
        properties: {
          product: { $ref: "#/components/schemas/ProductDTOOut" },
          quantity: { type: "integer" },
          unitPrice: { type: "number" },
          totalPrice: { type: "number" },
          extras: {
            type: "array",
            items: { $ref: "#/components/schemas/ComponentDTOOut" },
          },
          removed: {
            type: "array",
            items: { $ref: "#/components/schemas/ComponentDTOOut" },
          },
        },
      },
      OrderDTOOut: {
        type: "object",
        properties: {
          id: { type: "string" },
          code: { type: "string" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          type: { $ref: "#/components/schemas/OrderType" },
          businessUnit: { $ref: "#/components/schemas/BusinessUnitDTOOut" },
          customer: { $ref: "#/components/schemas/CustomerDTOOut" },
          owner: { $ref: "#/components/schemas/UserDTOOut" },
          amount: { type: "number" },
          currency: { $ref: "#/components/schemas/CurrencyDTOOut" },
          details: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderDetailDTOOut" },
          },
        },
      },

      //----------------- INPUT DTOs -----------------//
      SignInDTOIn: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      AuthTokenData: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/UserDTOOut" },
        },
      },
      RefreshTokenRequestDTOIn: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      LogoutRequestDTOIn: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      UserDTOIn: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
          status: { type: "boolean", default: true },
          validBusinessUnit: { type: "integer", minimum: 0, default: 0 },
        },
      },
      PartialUserDTOIn: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
          status: { type: "boolean" },
          validBusinessUnit: { type: "integer", minimum: 0 },
        },
      },
      BusinessUnitDTOIn: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
        },
      },
      PartialBusinessUnitDTOIn: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
        },
      },
      MembershipDTOIn: {
        type: "object",
        required: ["user", "role"],
        properties: {
          user: { type: "string", description: "User id to invite" },
          role: { $ref: "#/components/schemas/UserRole" },
          status: { type: "boolean" },
        },
      },
      PartialMembershipDTOIn: {
        type: "object",
        properties: {
          user: { type: "string" },
          role: { $ref: "#/components/schemas/UserRole" },
          status: { type: "boolean" },
        },
      },
      CategoryDTOIn: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
        },
      },
      PartialCategoryDTOIn: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
        },
      },
      CurrencyDTOIn: {
        type: "object",
        required: ["name", "ISO", "symbol", "exchangeRate"],
        properties: {
          name: { type: "string" },
          ISO: { type: "string" },
          symbol: { type: "string" },
          exchangeRate: { type: "number", minimum: 0 },
          main: { type: "boolean", default: false },
        },
      },
      PartialCurrencyDTOIn: {
        type: "object",
        properties: {
          name: { type: "string" },
          ISO: { type: "string" },
          symbol: { type: "string" },
          exchangeRate: { type: "number", minimum: 0 },
          main: { type: "boolean" },
        },
      },
      ComponentDTOIn: {
        type: "object",
        required: [
          "name",
          "description",
          "image",
          "type",
          "priceAsExtra",
          "currency",
        ],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          type: { $ref: "#/components/schemas/ComponentType" },
          status: { type: "boolean", default: true },
          priceAsExtra: { type: "number", minimum: 0 },
          currency: { type: "string", description: "Currency id" },
        },
      },
      PartialComponentDTOIn: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          type: { $ref: "#/components/schemas/ComponentType" },
          status: { type: "boolean" },
          priceAsExtra: { type: "number", minimum: 0 },
          currency: { type: "string" },
        },
      },
      ProductDTOIn: {
        type: "object",
        required: ["name", "category", "components", "currency"],
        properties: {
          name: { type: "string" },
          description: { type: "string", default: "" },
          image: { type: "string", default: "" },
          category: { type: "string", description: "Category id" },
          components: {
            type: "array",
            items: { type: "string", description: "Component id" },
          },
          price: { type: "number", minimum: 0, default: 0 },
          cost: { type: "number", minimum: 0, default: 0 },
          currency: { type: "string", description: "Currency id" },
          status: { type: "boolean", default: true },
          productArea: { type: "string", description: "Production area id" },
        },
      },
      PartialProductDTOIn: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          image: { type: "string" },
          category: { type: "string" },
          components: { type: "array", items: { type: "string" } },
          price: { type: "number", minimum: 0 },
          cost: { type: "number", minimum: 0 },
          currency: { type: "string" },
          status: { type: "boolean" },
          productArea: { type: "string" },
        },
      },
      ProductionAreaDTOIn: {
        type: "object",
        required: ["name", "description", "status", "priority"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "boolean" },
          preferredCategory: {
            type: "array",
            items: { type: "string", description: "Category id" },
          },
          priority: { type: "integer", minimum: 0 },
        },
      },
      PartialProductionAreaDTOIn: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          status: { type: "boolean" },
          preferredCategory: { type: "array", items: { type: "string" } },
          priority: { type: "integer", minimum: 0 },
        },
      },
      CustomerDTOIn: {
        type: "object",
        required: ["firstName", "lastName", "documentID", "email", "phone"],
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          documentID: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
        },
      },
      PartialCustomerDTOIn: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          documentID: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
        },
      },
      OrderDetailDTOIn: {
        type: "object",
        required: ["product", "quantity"],
        properties: {
          product: { type: "string", description: "Product id" },
          quantity: { type: "integer", minimum: 1 },
          extras: { type: "array", items: { type: "string" } },
          removed: { type: "array", items: { type: "string" } },
        },
      },
      OrderDTOIn: {
        type: "object",
        required: [
          "code",
          "description",
          "status",
          "type",
          "customer",
          "owner",
          "amount",
          "currency",
          "details",
        ],
        properties: {
          code: { type: "string" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          type: { $ref: "#/components/schemas/OrderType" },
          customer: { type: "string", description: "Customer id" },
          owner: { type: "string", description: "User id (owner)" },
          amount: { type: "number" },
          currency: { type: "string", description: "Currency id" },
          details: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderDetailDTOIn" },
          },
        },
      },
      PartialOrderDTOIn: {
        type: "object",
        properties: {
          code: { type: "string" },
          description: { type: "string" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          type: { $ref: "#/components/schemas/OrderType" },
          customer: { type: "string" },
          owner: { type: "string" },
          amount: { type: "number" },
          currency: { type: "string" },
          details: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderDetailDTOIn" },
          },
        },
      },

      //----------------- ORDER LIFECYCLE INPUT DTOs -----------------//
      ItemStatus: {
        type: "integer",
        enum: [0, 1, 2, 3, 4],
        description: "0=PENDING, 1=IN_PREP, 2=READY, 3=DELIVERED, 4=CANCELLED",
      },
      PaymentMethod: {
        type: "string",
        enum: ["cash", "card", "transfer"],
        description: "cash | card | transfer",
      },
      ChangeOrderStatusDTOIn: {
        type: "object",
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/OrderStatus" },
        },
      },
      AddOrderItemDTOIn: {
        type: "object",
        required: ["productID", "quantity"],
        properties: {
          productID: { type: "string", description: "Product Mongo ID" },
          quantity: { type: "integer", minimum: 1 },
          extras: { type: "array", items: { type: "string" }, description: "Component IDs to add as extras" },
          removed: { type: "array", items: { type: "string" }, description: "Component IDs to remove" },
          notes: { type: "string" },
          productionArea: { type: "string", description: "Production area ID" },
        },
      },
      UpdateItemStatusDTOIn: {
        type: "object",
        required: ["status"],
        properties: {
          status: { $ref: "#/components/schemas/ItemStatus" },
        },
      },
      ApplyDiscountDTOIn: {
        type: "object",
        required: ["discountAmount"],
        properties: {
          discountAmount: { type: "number", minimum: 0 },
          reason: { type: "string" },
        },
      },
      CloseOrderDTOIn: {
        type: "object",
        required: ["paymentMethod"],
        properties: {
          paymentMethod: { $ref: "#/components/schemas/PaymentMethod" },
          tipAmount: { type: "number", minimum: 0 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing / invalid / expired token, or wrong token type.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      Forbidden: {
        description: "Authenticated but not allowed (role / membership).",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      NotFound: {
        description: "Entity not found.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      ValidationError: {
        description: "Body failed class-validator checks.",
        content: {
          "application/json": {
            schema: {
              allOf: [
                { $ref: "#/components/schemas/ApiError" },
                {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ValidationErrorItem" },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      RateLimitExceeded: {
        description: "Too many requests.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      UnexpectedError: {
        description: "Unhandled server error.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export const swaggerOptions: SwaggerJsdocOptions = {
  definition,
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
    "./src/docs/*.ts",
  ],
};

export default swaggerOptions;
