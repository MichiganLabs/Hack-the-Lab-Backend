import { Interceptor } from "express";
import { Role } from "@enums";

const roleHierarchy: Role[] = [Role.Participant, Role.Developer, Role.Admin];

export const hasRole = (requiredRole: Role): Interceptor => {
  return async (req, res, next) => {
    if (req.user == null) {
      res.sendStatus(403);
      return;
    }

    let requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    let userRoleIndex = roleHierarchy.indexOf(req.user.role);

    if (userRoleIndex < requiredRoleIndex) {
      res.sendStatus(403);
      return;
    }

    next();
  };
};
