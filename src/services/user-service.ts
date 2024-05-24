import { Environment, Role } from "@enums";
import { UserRepository } from "data/repository";
import { Request } from "express";
import { AuthUser } from "hackthelab";

export const getEnvironmentsForRole = (role: Role): Environment[] => {
  switch (role) {
    case Role.Admin:
      return Object.values(Environment);
    case Role.Developer:
      return [Environment.Sandbox];
    case Role.Participant:
      return [Environment.Competition];
    default:
      return [];
  }
};

/**
 *
 * @param req The request object.
 * @returns The environments that the user is allowed to access.
 */
export const getEnvironmentsForRequest = (req: Request): Environment[] => {
  // By default, users will have their environment determined by their role.
  let environments = getEnvironmentsForRole(req.user.role);

  // Admin users are allowed to select a specific environment when requesting the list of mazes.
  const queryEnv = req.query.env as Environment;
  if (req.user.role == Role.Admin && queryEnv !== undefined) {
    environments = [queryEnv];
  }

  return environments;
};

/**
 * @returns The list of users in the competition.
 */
export const getParticipants = async (): Promise<AuthUser[]> => {
  return await UserRepository.getUsersOfRole(Role.Participant);
};
