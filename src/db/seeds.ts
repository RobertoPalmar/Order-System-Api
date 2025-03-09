import { BussinesUnit } from "@models/Database/bussinesUnit.model";
import { Category } from "@models/Database/category.model";
import { Currency } from "@models/Database/currency.model";
import { Product } from "@models/Database/product.model";
import { ProductionArea } from "@models/Database/productionArea.model";
import { User } from "@models/Database/user.model";
import { UserRole } from "@global/definitions";
import EncryptUtils from "@utils/encrypt.utils";

const createCategorySeed = async () => {
  try {
    //VALIDATE CATEGORIES
    const existCategories = await Category.estimatedDocumentCount() > 0;

    if (!existCategories) {
      const bussinesUnit = await BussinesUnit.findOne();

      const templateCategories = await Promise.all([
        new Category({
          name: "Main Dishes",
          description: "Primary meal options",
          bussinesUnit: bussinesUnit?._id
        }).save(),

        new Category({
          name: "Appetizers",
          description: "Starters and small plates",
          bussinesUnit: bussinesUnit?._id
        }).save(),

        new Category({
          name: "Beverages",
          description: "Drinks and refreshments",
          bussinesUnit: bussinesUnit?._id
        }).save(),

        new Category({
          name: "Desserts",
          description: "Sweet treats and desserts",
          bussinesUnit: bussinesUnit?._id
        }).save()
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
    const existCurrencies = await Currency.estimatedDocumentCount() > 0;

    if (!existCurrencies) {
      const bussinesUnit = await BussinesUnit.findOne();

      const templateCurrencies = await Promise.all([
        new Currency({
          name: "US Dollar",
          ISO: "USD",
          symbol: "$",
          ExchangeRate: 1,
          Main: true,
          BussinesUnit: bussinesUnit?._id
        }).save(),

        new Currency({
          name: "Euro",
          ISO: "EUR",
          symbol: "€",
          ExchangeRate: 0.92,
          Main: false,
          BussinesUnit: bussinesUnit?._id
        }).save(),

        new Currency({
          name: "British Pound",
          ISO: "GBP",
          symbol: "£",
          ExchangeRate: 0.79,
          Main: false,
          BussinesUnit: bussinesUnit?._id
        }).save()
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
    const bussinesUnit = await BussinesUnit.findOne();
    const category = await Category.findOne();
    const currency = await Currency.findOne();
    const productArea = await ProductionArea.findOne();

    const templateProducts = await Promise.all([
      new Product({
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, and cheese",
        image: "burger.jpg",
        category: category?._id,
        components: [],
        price: 12.99,
        cost: 5.5,
        currency: currency?._id,
        status: true,
        productArea: productArea?._id,
        bussinesUnit: bussinesUnit?._id,
      }).save(),

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
        bussinesUnit: bussinesUnit?._id,
      }).save(),

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
        bussinesUnit: bussinesUnit?._id,
      }).save(),

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
        bussinesUnit: bussinesUnit?._id,
      }).save(),

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
        bussinesUnit: bussinesUnit?._id,
      }).save(),
    ]);

    console.log("Products created successfully");
    console.log(templateProducts);
  }
};

const createUserSeed = async () => {
  try {
    const existUsers = await User.estimatedDocumentCount() > 0;
    if (!existUsers) {
      const templateUsers = await Promise.all([
        new User({
          name: "Admin Restaurant",
          email: "admin.restaurant@demo.com",
          password: await EncryptUtils.encryptString("admin123"),
          role: UserRole.ADMIN,
          status: true
        }).save(),

        new User({
          name: "Admin Coffee",
          email: "admin.coffee@demo.com",
          password: await EncryptUtils.encryptString("admin123"),
          role: UserRole.ADMIN,
          status: true
        }).save()
      ]);

      console.log("Users created successfully");
      console.log(templateUsers);
    }
  } catch (ex) {
    console.log("Error creating users:", ex);
  }
};

const createBussinesUnitSeed = async () => {
  try {
    const existBussinesUnit = await BussinesUnit.estimatedDocumentCount() > 0;
    if (!existBussinesUnit) {
      const adminRestaurant = await User.findOne({ email: "admin.restaurant@demo.com" });
      const adminCoffee = await User.findOne({ email: "admin.coffee@demo.com" });

      const templateBussinesUnit = await Promise.all([
        new BussinesUnit({
          name: "Restaurant Demo",
          description: "Main restaurant business unit",
          owner: adminRestaurant?._id
        }).save(),

        new BussinesUnit({
          name: "Coffee Shop Demo",
          description: "Coffee shop subsidiary",
          owner: adminCoffee?._id
        }).save()
      ]);

      console.log("Business Units created successfully");
      console.log(templateBussinesUnit);
    }
  } catch (ex) {
    console.log("Error creating business units:", ex);
  }
};

const cleanupDatabase = async () => {
  try {
    await Promise.all([
      User.deleteMany({}),
      BussinesUnit.deleteMany({}),
      Category.deleteMany({}),
      Currency.deleteMany({}),
      Product.deleteMany({}),
      ProductionArea.deleteMany({})
    ]);
    console.log("Database cleaned successfully");
  } catch (ex) {
    console.log("Error cleaning database:", ex);
  }
};

export const createDataSeed = async () => {
  try {
    // await cleanupDatabase();
    await createUserSeed();
    await createBussinesUnitSeed();
    await createCategorySeed();
    await createCurrencySeed();
    await createProductSeed();
  } catch (ex) {
    console.log("Error seeding the data:", ex);
  }
};
