import { UserRole } from "@global/definitions";
import { getCurrentContext } from "@global/requestContext";
import { Membership } from "@models/database/membership.model";
import { MembershipDTOOut } from "@models/DTOs/membership.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { Request, Response } from "express";

const membershipPopulate = [
  { path: "user", select: "id name email" },
  { path: "businessUnit", select: "id name" },
];

export const inviteMember = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //CROSS-BU GUARD
    if (req.params.businessUnitID !== ctx.businessUnitID) {
      ErrorResponse.FORBIDDEN(res, "BusinessUnit scope mismatch");
      return;
    }

    //GET BODY (VALIDATED BY MIDDLEWARE)
    const { user, role, status } = req.body;

    //VERIFY TARGET USER EXISTS
    const targetUser = await repositoryHub.userRepository.findById(user);
    if (targetUser == null) {
      ErrorResponse.NOT_FOUND(res, "User");
      return;
    }

    //DUPLICATE CHECK (SCOPED REPO INJECTS businessUnit FILTER)
    const existingMembership = await repositoryHub.membershipRepository.findOne({ user });
    if (existingMembership != null) {
      ErrorResponse.DUPLICATE_FIELD(res, "membership");
      return;
    }

    //FORMAT MEMBERSHIP
    const membership = new Membership({
      user,
      businessUnit: ctx.businessUnitID!,
      role,
      status: status ?? true,
    });

    //CREATE MEMBERSHIP
    const newMembership = await repositoryHub.membershipRepository.create(
      membership,
      membershipPopulate
    );

    //MAP ENTITY
    const membershipDTO = mapperHub.membershipMapper.toDTO(newMembership);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, membershipDTO);
  } catch (ex: any) {
    console.log("❌ Error in inviteMember:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const listMembers = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //CROSS-BU GUARD
    if (req.params.businessUnitID !== ctx.businessUnitID) {
      ErrorResponse.FORBIDDEN(res, "BusinessUnit scope mismatch");
      return;
    }

    //GET PAGINATION PARAMS
    const { invalid, page, limit } = getPaginationParams(req);

    //VALIDATE PAGINATION
    if (invalid) {
      ErrorResponse.INVALID_FIELD(
        res,
        "page and limit",
        "The paginations params must be a positive value"
      );
      return;
    }

    //GET MEMBERSHIP LIST (SCOPED REPO HANDLES BU FILTER)
    const { data, total, totalPages } =
      await repositoryHub.membershipRepository.findAllPaginated(
        page,
        limit,
        membershipPopulate
      );

    //MAP THE LIST DATA
    const membershipDTOList = mapperHub.membershipMapper.toDTOList(data);

    //PAGINATE DATA
    const pagination: Pagination<MembershipDTOOut[]> = {
      data: membershipDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in listMembers:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //CROSS-BU GUARD
    if (req.params.businessUnitID !== ctx.businessUnitID) {
      ErrorResponse.FORBIDDEN(res, "BusinessUnit scope mismatch");
      return;
    }

    //GET PARAMS
    const { membershipID } = req.params;

    //FIND TARGET MEMBERSHIP (SCOPED FILTER AUTO-RESTRICTS TO CURRENT BU)
    const targetMembership = await repositoryHub.membershipRepository.findById(membershipID);
    if (targetMembership == null) {
      ErrorResponse.NOT_FOUND(res, "Membership");
      return;
    }

    //GET BODY (VALIDATED BY MIDDLEWARE)
    const { role, status } = req.body;

    //LAST-ADMIN GUARD
    const currentRole = targetMembership.role;
    const currentStatus = targetMembership.status;
    const nextRole = role !== undefined ? role : currentRole;
    const nextStatus = status !== undefined ? status : currentStatus;

    const wouldDemote =
      currentRole === UserRole.ADMIN &&
      currentStatus === true &&
      (nextRole !== UserRole.ADMIN || nextStatus === false);

    if (wouldDemote) {
      const remainingAdmins = await Membership.countDocuments({
        businessUnit: ctx.businessUnitID,
        role: UserRole.ADMIN,
        status: true,
        _id: { $ne: membershipID },
      });

      if (remainingAdmins === 0) {
        ErrorResponse.FORBIDDEN(res, "Cannot demote the last active admin of the business unit");
        return;
      }
    }

    //UPDATE MEMBERSHIP
    const updatedMembership = await repositoryHub.membershipRepository.updateById(
      membershipID,
      req.body,
      membershipPopulate
    );

    //MAP DTO
    const membershipDTO = mapperHub.membershipMapper.toDTO(updatedMembership!!);

    //RETURN THE RESPONSE
    SuccessResponse.UPDATE(res, membershipDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateMemberRole:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //CROSS-BU GUARD
    if (req.params.businessUnitID !== ctx.businessUnitID) {
      ErrorResponse.FORBIDDEN(res, "BusinessUnit scope mismatch");
      return;
    }

    //GET PARAMS
    const { membershipID } = req.params;

    //FIND TARGET MEMBERSHIP (SCOPED FILTER AUTO-RESTRICTS TO CURRENT BU)
    const targetMembership = await repositoryHub.membershipRepository.findById(membershipID);
    if (targetMembership == null) {
      ErrorResponse.NOT_FOUND(res, "Membership");
      return;
    }

    //LAST-ADMIN GUARD
    const isActiveAdmin =
      targetMembership.role === UserRole.ADMIN && targetMembership.status === true;

    if (isActiveAdmin) {
      const remainingAdmins = await Membership.countDocuments({
        businessUnit: ctx.businessUnitID,
        role: UserRole.ADMIN,
        status: true,
        _id: { $ne: membershipID },
      });

      if (remainingAdmins === 0) {
        ErrorResponse.FORBIDDEN(res, "Cannot remove the last active admin of the business unit");
        return;
      }
    }

    //DELETE MEMBERSHIP
    await repositoryHub.membershipRepository.deleteById(membershipID);

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in removeMember:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
