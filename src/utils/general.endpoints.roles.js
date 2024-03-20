import { systemRoles } from "./system-roles.js";

export const endPointsRoles = {
  GENERAL: [systemRoles.USER, systemRoles.ADMIN],
  ADMIN: [systemRoles.ADMIN],
  USER: [systemRoles.USER],
};
