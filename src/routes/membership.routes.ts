import { Router } from "express";
import { MembershipDTOIn, PartialMembershipDTOIn } from "@models/DTOs/membership.DTO";
import * as MembershipController from "@controllers/membership.controller";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router({ mergeParams: true });

router.get("/", validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION), MembershipController.listMembers);
router.post("/", validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(MembershipDTOIn), MembershipController.inviteMember);
router.put("/:membershipID", validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["membershipID"]), validateBody(PartialMembershipDTOIn), MembershipController.updateMemberRole);
router.delete("/:membershipID", validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["membershipID"]), MembershipController.removeMember);

export default router;
