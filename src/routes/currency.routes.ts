import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as CurrencyController from "@controllers/currency.controller" 
import { validateBody } from "src/middlewares/validation.middleware";
import { CurrencyDTOIn, PartialCurrencyDTOIn } from "@models/DTOs/currency.DTO";

const router = Router();

router.get('/getAllCurrencies', validateBusinessAuth, CurrencyController.getAllCurrencies);
router.get('/getCurrencyByID/:currencyID', validateBusinessAuth, CurrencyController.getCurrencyByID);
router.get('/getCurrenciesBy', validateBusinessAuth, CurrencyController.getCurrencyBy);
router.post('/createCurrency', validateBusinessAuth, validateBody(CurrencyDTOIn), CurrencyController.createCurrency);
router.put('/updateCurrency/:currencyID', validateBusinessAuth,  validateBody(PartialCurrencyDTOIn), CurrencyController.updateCurrency);
router.delete('/deleteCurrency/:currencyID', validateBusinessAuth, CurrencyController.deleteCurrency);

export default router;