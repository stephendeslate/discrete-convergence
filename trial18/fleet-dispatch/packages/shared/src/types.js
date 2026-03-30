"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteStatus = exports.DispatchStatus = exports.DriverStatus = exports.VehicleStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["VIEWER"] = "viewer";
    UserRole["DISPATCHER"] = "dispatcher";
})(UserRole || (exports.UserRole = UserRole = {}));
var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["AVAILABLE"] = "available";
    VehicleStatus["IN_USE"] = "in_use";
    VehicleStatus["MAINTENANCE"] = "maintenance";
    VehicleStatus["RETIRED"] = "retired";
})(VehicleStatus || (exports.VehicleStatus = VehicleStatus = {}));
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["ACTIVE"] = "active";
    DriverStatus["INACTIVE"] = "inactive";
    DriverStatus["ON_LEAVE"] = "on_leave";
    DriverStatus["SUSPENDED"] = "suspended";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
var DispatchStatus;
(function (DispatchStatus) {
    DispatchStatus["PENDING"] = "pending";
    DispatchStatus["ASSIGNED"] = "assigned";
    DispatchStatus["IN_PROGRESS"] = "in_progress";
    DispatchStatus["COMPLETED"] = "completed";
    DispatchStatus["CANCELLED"] = "cancelled";
})(DispatchStatus || (exports.DispatchStatus = DispatchStatus = {}));
var RouteStatus;
(function (RouteStatus) {
    RouteStatus["DRAFT"] = "draft";
    RouteStatus["ACTIVE"] = "active";
    RouteStatus["COMPLETED"] = "completed";
    RouteStatus["CANCELLED"] = "cancelled";
})(RouteStatus || (exports.RouteStatus = RouteStatus = {}));
//# sourceMappingURL=types.js.map