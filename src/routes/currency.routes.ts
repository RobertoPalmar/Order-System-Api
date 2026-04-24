import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as CurrencyController from "@controllers/currency.controller"
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { CurrencyDTOIn, PartialCurrencyDTOIn } from "@models/DTOs/currency.DTO";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router();

router.get('/getAllCurrencies', validateBusinessAuth, CurrencyController.getAllCurrencies);
router.get('/getCurrencyByID/:currencyID', validateBusinessAuth, validateObjectIdParams(["currencyID"]), CurrencyController.getCurrencyByID);
router.get('/getCurrenciesBy', validateBusinessAuth, CurrencyController.getCurrencyBy);
router.post('/createCurrency', validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(CurrencyDTOIn), CurrencyController.createCurrency);
router.put('/updateCurrency/:currencyID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["currencyID"]), validateBody(PartialCurrencyDTOIn), CurrencyController.updateCurrency);
router.delete('/deleteCurrency/:currencyID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["currencyID"]), CurrencyController.deleteCurrency);

export default router;
