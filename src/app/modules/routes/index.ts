import { Router } from "express";
import { UserRoutes } from "../user/user.routes";

const middleWareRouter = Router();

const router = [
  {
    path: "/users",
    router: UserRoutes,
  },
];

router.forEach((route) => {
  middleWareRouter.use(route.path, route.router);
});

export default middleWareRouter;
