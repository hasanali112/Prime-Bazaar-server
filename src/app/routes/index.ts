import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AdminRoutes } from "../modules/admin/admin.routes";

const middleWareRouter = Router();

const router = [
  {
    path: "/users",
    router: UserRoutes,
  },
  {
    path: "/admin",
    router: AdminRoutes,
  },
];

router.forEach((route) => {
  middleWareRouter.use(route.path, route.router);
});

export default middleWareRouter;
