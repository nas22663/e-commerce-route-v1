import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  UPDATE_USER: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN, systemRoles.USER],
};
