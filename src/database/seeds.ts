import { BusinessUnit } from "@models/database/businessUnit.model";
import { Category } from "@models/database/category.model";
import { Currency } from "@models/database/currency.model";
import { Product } from "@models/database/product.model";
import { ProductionArea } from "@models/database/productionArea.model";
import { User } from "@models/database/user.model";
import { ComponentType, UserRole } from "@global/definitions";
import EncryptUtils from "@utils/encrypt.utils";
import { repositoryHub } from "src/repositories/repositoryHub";
import { Component } from "@models/database/component.model";
import { separator } from "@global/logs";

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
          role: UserRole.ADMIN,
          status: true,
        }).save(),

        new User({
          name: "Admin Coffee",
          email: "admin.coffee@demo.com",
          password: await EncryptUtils.encryptString("admin123"),
          role: UserRole.ADMIN,
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
    ]);
    console.log(separator);
    console.log("Database cleaned successfully");
  } catch (ex) {
    console.log("Error cleaning database:", ex);
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

export const createDataSeed = async () => {
  try {
    // await cleanupDatabase();
    await createUserSeed();
    await createBusinessUnitSeed();
    await createCategorySeed();
    await createCurrencySeed();
    await createComponentSeed();
    await createProductSeed(); 
    console.log(separator);
  } catch (ex) {
    console.log("Error seeding the data:", ex);
  }
};
