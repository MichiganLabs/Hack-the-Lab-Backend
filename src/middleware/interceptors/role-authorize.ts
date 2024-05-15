import { Role } from "@enums";
import { Interceptor } from "express";
import { asyncHandler, createError } from "utils";

const roleHierarchy: Role[] = [Role.Participant, Role.Developer, Role.Admin];

export const hasRole = (requiredRole: Role): Interceptor => {
  return asyncHandler(async (req, res, next) => {
    if (req.user == null) {
      throw createError(403, "User is not authorized!");
    }

    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    const userRoleIndex = roleHierarchy.indexOf(req.user.role);

    if (userRoleIndex < requiredRoleIndex) {
      throw createError(403, "User is not authorized to access this resource.");
    }

    next();
  });
};
