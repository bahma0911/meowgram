import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import localAuthRouter from "./local-auth";
import postsRouter from "./posts";
import uploadsRouter from "./uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/local-auth", localAuthRouter);
router.use(postsRouter);
router.use(uploadsRouter);

export default router;
