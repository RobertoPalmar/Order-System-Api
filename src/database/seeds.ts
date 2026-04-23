import { BusinessUnit } from "@models/database/businessUnit.model";
import { Category } from "@models/database/category.model";
import { Currency } from "@models/database/currency.model";
import { Product } from "@models/database/product.model";
import { ProductionArea } from "@models/database/productionArea.model";
import { User } from "@models/database/user.model";
import { ComponentType, OrderStatus, OrderType, UserRole } from "@global/definitions";
import EncryptUtils from "@utils/encrypt.utils";
import { repositoryHub } from "src/repositories/repositoryHub";
import { Component } from "@models/database/component.model";
import { separator } from "@global/logs";
import { Customer } from "@models/database/customer.model";
import { Order } from "@models/database/order.model";
import { Membership } from "@models/database/membership.model";

const createCategorySeed = async () => {
  try {
    //VALIDATE CATEGORIES
    const existCategories = (await Category.estimatedDocumentCount()) > 0;

    if (!existCategories) {
      const businessUnit = await BusinessUnit.findOne();

      const templateCategories = await Promise.all([
        new Category({
          name: "Main Dishes",
          description: "Primary meal options",
          businessUnit: businessUnit?._id,
        }).save(),

        new Category({
          name: "Appetizers",
          description: "Starters and small plates",
          businessUnit: businessUnit?._id,
        }).save(),

        new Category({
          name: "Beverages",
          description: "Drinks and refreshments",
          businessUnit: businessUnit?._id,
        }).save(),

        new Category({
          name: "Desserts",
          description: "Sweet treats and desserts",
          businessUnit: businessUnit?._id,
        }).save(),
      ]);

      console.log("Categories created successfully");
      console.log(templateCategories);
    }
  } catch (ex) {
    console.log("Error creating categories:", ex);
  }
};

const createCurrencySeed = async () => {
  try {
    //VALIDATE CURRENCIES
    const existCurrencies = (await Currency.estimatedDocumentCount()) > 0;

    if (!existCurrencies) {
      const businessUnit = await BusinessUnit.findOne();

      const templateCurrencies = await Promise.all([
        new Currency({
          name: "US Dollar",
          ISO: "USD",
          symbol: "$",
          exchangeRate: 1,
          main: true,
          businessUnit: businessUnit?._id,
        }).save(),

        new Currency({
          name: "Euro",
          ISO: "EUR",
          symbol: "€",
          exchangeRate: 0.92,
          main: false,
          businessUnit: businessUnit?._id,
        }).save(),

        new Currency({
          name: "British Pound",
          ISO: "GBP",
          symbol: "£",
          exchangeRate: 0.79,
          main: false,
          businessUnit: businessUnit?._id,
        }).save(),
      ]);

      console.log("Currencies created successfully");
      console.log(templateCurrencies);
    }
  } catch (ex) {
    console.log("Error creating currencies:", ex);
  }
};

const createProductSeed = async () => {
  //VALIDATE PRODUCTS
  const existProducts = (await Product.estimatedDocumentCount()) > 0;

  if (!existProducts) {
    const businessUnit = await BusinessUnit.findOne();
    const category = await Category.findOne();
    const currency = await Currency.findOne();
    const productArea = await ProductionArea.findOne();

    const cheese = await Component.findOne({name:"Extra Cheese"});
    const bacon = await Component.findOne({name:"Bacon"});

    const templateProducts = await repositoryHub.productRepository.createRange([
      new Product({
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, and cheese",
        image: "burger.jpg",
        category: category?._id,
        components: [cheese, bacon],
        price: 12.99,
        cost: 5.5,
        currency: currency?._id,
        status: true,
        productArea: productArea?._id,
        businessUnit: businessUnit?._id,
      }),
      new Product({
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella, and basil",
        image: "pizza.jpg",
        category: category?._id,
        components: [],
        price: 15.99,
        cost: 6.75,
        currency: currency?._id,
        status: true,
        productArea: productArea?._id,
        businessUnit: businessUnit?._id,
      }),
      new Product({
        name: "Caesar Salad",
        description: "Romaine lettuce, croutons, parmesan cheese",
        image: "salad.jpg",
        category: category?._id,
        components: [],
        price: 8.99,
        cost: 3.25,
        currency: currency?._id,
        status: true,
        productArea: productArea?._id,
        businessUnit: businessUnit?._id,
      }),
      new Product({
        name: "Chicken Wings",
        description: "Spicy buffalo wings with blue cheese dip",
        image: "wings.jpg",
        category: category?._id,
        components: [],
        price: 10.99,
        cost: 4.5,
        currency: currency?._id,
        status: true,
        productArea: productArea?._id,
        businessUnit: businessUnit?._id,
      }),
      new Product({
        name: "Fish & Chips",
        description: "Battered cod with french fries",
        image: "fish.jpg",
        category: category?._id,
        components: [],
        price: 13.99,
        cost: 5.75,
        currency: currency?._id,
        status: true,
        productArea: productArea?._id,
        businessUnit: businessUnit?._id,
      }),
    ]);

    console.log("Products created successfully");
    console.log(templateProducts);
  }
};

const createUserSeed = async () => {
  try {
    const existUsers = (await User.estimatedDocumentCount()) > 0;
    if (!existUsers) {
      const templateUsers = await Promise.all([
        new User({
          name: "Admin Restaurant",
          email: "admin.restaurant@demo.com",
          password: await EncryptUtils.encryptString("admin123"),
          status: true,
        }).save(),

        new User({
          name: "Admin Coffee",
          email: "admin.coffee@demo.com",
          password: await EncryptUtils.encryptString("admin123"),
          status: true,
        }).save(),
      ]);

      console.log("Users created successfully");
      console.log(templateUsers);
    }
  } catch (ex) {
    console.log("Error creating users:", ex);
  }
};

const createBusinessUnitSeed = async () => {
  try {
    const existBusinessUnit = (await BusinessUnit.estimatedDocumentCount()) > 0;
    if (!existBusinessUnit) {
      const adminRestaurant = await User.findOne({
        email: "admin.restaurant@demo.com",
      });
      const adminCoffee = await User.findOne({
        email: "admin.coffee@demo.com",
      });

      const templateBusinessUnit = await Promise.all([
        new BusinessUnit({
          name: "Restaurant Demo",
          description: "Main restaurant business unit",
          owner: adminRestaurant?._id,
        }).save(),

        new BusinessUnit({
          name: "Coffee Shop Demo",
          description: "Coffee shop subsidiary",
          owner: adminCoffee?._id,
        }).save(),
      ]);

      console.log("Business Units created successfully");
      console.log(templateBusinessUnit);
    }
  } catch (ex) {
    console.log("Error creating business units:", ex);
  }
};

const cleanupDatabase = async () => {
  try {
    await Promise.all([
      User.deleteMany({}),
      BusinessUnit.deleteMany({}),
      Category.deleteMany({}),
      Currency.deleteMany({}),
      Product.deleteMany({}),
      ProductionArea.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      Membership.deleteMany({}),
    ]);
    console.log(separator);
    console.log("Database cleaned successfully");
  } catch (ex) {
    console.log("Error cleaning database:", ex);
  }
};

const createMembershipSeed = async () => {
  try {
    const pairs: { email: string; businessUnitName: string }[] = [
      { email: "admin.restaurant@demo.com", businessUnitName: "Restaurant Demo" },
      { email: "admin.coffee@demo.com", businessUnitName: "Coffee Shop Demo" },
    ];

    const created: any[] = [];

    for (const pair of pairs) {
      const user = await User.findOne({ email: pair.email });
      const businessUnit = await BusinessUnit.findOne({ name: pair.businessUnitName });

      if (!user || !businessUnit) continue;

      //IDEMPOTENT: SKIP IF MEMBERSHIP ALREADY EXISTS
      const existing = await Membership.findOne({
        user: user._id,
        businessUnit: businessUnit._id,
      });
      if (existing) continue;

      const membership = await new Membership({
        user: user._id,
        businessUnit: businessUnit._id,
        role: UserRole.ADMIN,
        status: true,
      }).save();

      created.push(membership);
    }

    if (created.length > 0) {
      console.log("Memberships created successfully");
      console.log(created);
    }
  } catch (ex) {
    console.log("Error creating memberships:", ex);
  }
};

const createComponentSeed = async () => {
  try {
    const existComponents = (await Component.estimatedDocumentCount()) > 0;

    if (!existComponents) {
      const businessUnit = await BusinessUnit.findOne();
      const currency = await Currency.findOne();

      const templateComponents = await Promise.all([
        new Component({
          name: "Extra Cheese",
          description: "Additional cheese portion",
          image: "cheese.jpg",
          type: ComponentType.EXTRA,
          status: true,
          businessUnit: businessUnit?._id,
          priceAsExtra: 1.50,
          currency: currency?._id
        }).save(),
        new Component({
          name: "Bacon",
          description: "Crispy bacon strips",
          image: "bacon.jpg",
          type: ComponentType.EXTRA,
          status: true,
          businessUnit: businessUnit?._id,
          priceAsExtra: 2.00,
          currency: currency?._id
        }).save(),
      ]);

      console.log("Components created successfully");
      console.log(templateComponents);
      return templateComponents;
    }
    return await Component.find();
  } catch (ex) {
    console.log("Error creating components:", ex);
    return [];
  }
};

const createProductionAreaSeed = async () => {
  try {
    const existProductionAreas = (await ProductionArea.estimatedDocumentCount()) > 0;

    if (!existProductionAreas) {
      const businessUnit = await BusinessUnit.findOne();
      const mainDishCategory = await Category.findOne({ name: "Main Dishes" });
      const beveragesCategory = await Category.findOne({ name: "Beverages" });
      const dessertsCategory = await Category.findOne({ name: "Desserts" });
      const defaultCategory = await Category.findOne();

      const templateProductionAreas = await Promise.all([
        new ProductionArea({
          name: "Kitchen",
          description: "Main kitchen area for food preparation",
          status: true,
          businessUnit: businessUnit?._id,
          preferredCategory: mainDishCategory?._id || defaultCategory?._id,
          priority: 1
        }).save(),
        new ProductionArea({
          name: "Bar",
          description: "Bar area for drinks and beverages",
          status: true,
          businessUnit: businessUnit?._id,
          preferredCategory: beveragesCategory?._id || defaultCategory?._id,
          priority: 2
        }).save(),
        new ProductionArea({
          name: "Dessert Station",
          description: "Area for preparing desserts and sweets",
          status: true,
          businessUnit: businessUnit?._id,
          preferredCategory: dessertsCategory?._id || defaultCategory?._id,
          priority: 3
        }).save(),
      ]);

      console.log("Production Areas created successfully");
      console.log(templateProductionAreas);
      return templateProductionAreas;
    }
    return await ProductionArea.find();
  } catch (ex) {
    console.log("Error creating production areas:", ex);
    return [];
  }
};

const createCustomerSeed = async () => {
  try {
    const existCustomers = (await Customer.estimatedDocumentCount()) > 0;

    if (!existCustomers) {
      const businessUnit = await BusinessUnit.findOne();

      const templateCustomers = await Promise.all([
        new Customer({
          firstName: "John",
          lastName: "Doe",
          documentID: "123456789",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          businessUnit: businessUnit?._id,
        }).save(),

        new Customer({
          firstName: "Jane",
          lastName: "Smith",
          documentID: "987654321",
          email: "jane.smith@example.com",
          phone: "555-987-6543",
          businessUnit: businessUnit?._id,
        }).save(),

        new Customer({
          firstName: "Robert",
          lastName: "Johnson",
          documentID: "456789123",
          email: "robert.johnson@example.com",
          phone: "555-456-7890",
          businessUnit: businessUnit?._id,
        }).save(),
      ]);

      console.log("Customers created successfully");
      console.log(templateCustomers);
      return templateCustomers;
    }
    return await Customer.find();
  } catch (ex) {
    console.log("Error creating customers:", ex);
    return [];
  }
};

const createOrderSeed = async () => {
  try {
    const existOrders = (await Order.estimatedDocumentCount()) > 0;

    if (!existOrders) {
      const businessUnit = await BusinessUnit.findOne();
      const currency = await Currency.findOne();
      const customers = await Customer.find().limit(3);
      const admin = await User.findOne({ email: "admin.restaurant@demo.com" });
      const products = await Product.find().limit(5);
      const components = await Component.find();

      if (customers.length === 0 || !admin || products.length === 0 || !businessUnit || !currency) {
        console.log("Missing required data for order seed");
        return [];
      }

      // Create order details for the first order
      const orderDetails1 = [
        {
          product: products[0],
          quantity: 2,
          unitPrice: products[0].price,
          totalPrice: products[0].price * 2,
          extras: [components[0]],
          removed: [components[1]],
        },
        {
          product: products[1],
          quantity: 1,
          unitPrice: products[1].price,
          totalPrice: products[1].price,
          extras: [],
          removed: [],
        },
      ];

      // Create order details for the second order
      const orderDetails2 = [
        {
          product: products[2],
          quantity: 1,
          unitPrice: products[2].price,
          totalPrice: products[2].price,
          extras: [],
          removed: [],
        },
        {
          product: products[3],
          quantity: 3,
          unitPrice: products[3].price,
          totalPrice: products[3].price * 3,
          extras: [],
          removed: [],
        },
      ];

      // Calculate total amount for each order
      const totalAmount1 = orderDetails1.reduce((sum, detail) => sum + detail.totalPrice, 0);
      const totalAmount2 = orderDetails2.reduce((sum, detail) => sum + detail.totalPrice, 0);

      const templateOrders = await Promise.all([
        new Order({
          code: "ORD-001",
          description: "Dine-in order for table 5",
          status: OrderStatus.COMPLETED, // OrderStatus.COMPLETED
          type: OrderType.DINE_IN, // OrderType.DINE_IN
          businessUnit: businessUnit._id,
          customer: customers[0],
          owner: admin,
          amount: totalAmount1,
          currency: currency,
          details: orderDetails1,
        }).save(),

        new Order({
          code: "ORD-002",
          description: "Take-away order",
          status: 2, // OrderStatus.IN_PROGRESS
          type: 1, // OrderType.TAKE_AWAY
          businessUnit: businessUnit._id,
          customer: customers[1],
          owner: admin,
          amount: totalAmount2,
          currency: currency,
          details: orderDetails2,
        }).save(),
      ]);

      console.log("Orders created successfully");
      console.log(templateOrders);
      return templateOrders;
    }
    return await Order.find();
  } catch (ex) {
    console.log("Error creating orders:", ex);
    return [];
  }
};

export const createDataSeed = async () => {
  try {
    await cleanupDatabase();
    await createUserSeed();
    await createBusinessUnitSeed();
    await createMembershipSeed();
    await createCategorySeed();
    await createCurrencySeed();
    await createProductionAreaSeed();
    await createComponentSeed();
    await createProductSeed();
    await createCustomerSeed();
    await createOrderSeed();
    console.log(separator);
  } catch (ex) {
    console.log("Error seeding the data:", ex);
  }
};
