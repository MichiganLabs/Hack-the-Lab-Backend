import { Role } from "@enums";
import { Interceptor } from "express";

const roleHierarchy: Role[] = [Role.Participant, Role.Developer, Role.Admin];

export const hasRole = (requiredRole: Role): Interceptor => {
  return async (req, res, next) => {
    if (req.user == null) {
      res.sendStatus(403);
      return;
    }

    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    const userRoleIndex = roleHierarchy.indexOf(req.user.role);

    if (userRoleIndex < requiredRoleIndex) {
      res.sendStatus(403);
      return;
    }

    next();
  };
};
