import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
  ADD_COUPON: [systemRoles.SUPER_ADMIN, systemRoles.ADMIN],
};
