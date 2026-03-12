import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, postsTable, usersTable, ratingsTable, likesTable, commentsTable } from "@workspace/db";
import { eq, desc, avg, count, sql, and, inArray } from "drizzle-orm";
import {
  GetPostsQueryParams,
  GetPostsResponse,
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  GetPostResponse,
  DeletePostResponse,
  RatePostBody,
  RatePostResponse,
  ToggleLikeResponse,
  GetCommentsResponse,
  AddCommentBody,
  GetUserProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const uploadDir = "/tmp/meowgram-uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

function basePostQuery() {
  return db
    .select({
      id: postsTable.id,
      userId: postsTable.userId,
      username: sql<string>`coalesce(${usersTable.firstName}, '') || coalesce(' ' || ${usersTable.lastName}, '')`,
      userAvatar: usersTable.profileImageUrl,
      imageUrl: postsTable.imageUrl,
      caption: postsTable.caption,
      mediaType: postsTable.mediaType,
      createdAt: postsTable.createdAt,
      averageRating: avg(ratingsTable.score),
      ratingCount: count(ratingsTable.id),
      likeCount: sql<number>`count(distinct ${likesTable.id})`,
      commentCount: sql<number>`count(distinct ${commentsTable.id})`,
    })
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .leftJoin(ratingsTable, eq(ratingsTable.postId, postsTable.id))
    .leftJoin(likesTable, eq(likesTable.postId, postsTable.id))
    .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
    .groupBy(
      postsTable.id,
      usersTable.id,
      usersTable.firstName,
      usersTable.lastName,
      usersTable.profileImageUrl
    );
}

async function enrichPostsWithUserData(posts: any[], currentUserId?: string) {
  const base = posts.map(p => ({
    ...p,
    username: p.username?.trim() || "Unknown",
    averageRating: p.averageRating ? parseFloat(String(p.averageRating)) : null,
    ratingCount: Number(p.ratingCount) || 0,
    likeCount: Number(p.likeCount) || 0,
    commentCount: Number(p.commentCount) || 0,
    userRating: null as number | null,
    userLiked: false,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  }));

  if (!currentUserId || posts.length === 0) {
    return base;
  }

  const postIds = posts.map(p => p.id);

  const [userRatings, userLikes] = await Promise.all([
    db.select().from(ratingsTable).where(
      and(
        eq(ratingsTable.userId, currentUserId),
        inArray(ratingsTable.postId, postIds)
      )
    ),
    db.select().from(likesTable).where(
      and(
        eq(likesTable.userId, currentUserId),
        inArray(likesTable.postId, postIds)
      )
    ),
  ]);

  const ratingMap = new Map(userRatings.map(r => [r.postId, r.score]));
  const likedSet = new Set(userLikes.map(l => l.postId));

  return base.map(p => ({
    ...p,
    userRating: ratingMap.get(p.id) ?? null,
    userLiked: likedSet.has(p.id),
  }));
}

router.get("/posts", async (req: Request, res: Response) => {
  const query = GetPostsQueryParams.parse({
    sort: req.query.sort || "new",
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
  });

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;

  let posts;
  if (query.sort === "top") {
    posts = await basePostQuery()
      .orderBy(desc(sql`avg(${ratingsTable.score})`))
      .limit(limit)
      .offset(offset);
  } else if (query.sort === "trending") {
    posts = await basePostQuery()
      .orderBy(desc(sql`count(distinct ${likesTable.id})`), desc(sql`count(${ratingsTable.id})`))
      .limit(limit)
      .offset(offset);
  } else {
    posts = await basePostQuery()
      .orderBy(desc(postsTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  const currentUserId = req.isAuthenticated() ? req.user.id : undefined;
  const enriched = await enrichPostsWithUserData(posts, currentUserId);

  const [{ total }] = await db.select({ total: count(postsTable.id) }).from(postsTable);

  res.json(GetPostsResponse.parse({ posts: enriched, total: Number(total) }));
});

router.get("/posts/leaderboard", async (req: Request, res: Response) => {
  const query = GetLeaderboardQueryParams.parse({ limit: req.query.limit ? Number(req.query.limit) : 10 });
  const limit = query.limit ?? 10;

  const posts = await basePostQuery()
    .orderBy(desc(sql`avg(${ratingsTable.score})`), desc(sql`count(${ratingsTable.id})`))
    .limit(limit);

  const currentUserId = req.isAuthenticated() ? req.user.id : undefined;
  const enriched = await enrichPostsWithUserData(posts, currentUserId);

  res.json(GetLeaderboardResponse.parse({ posts: enriched, total: enriched.length }));
});

router.get("/posts/:postId", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  const [post] = await basePostQuery().where(eq(postsTable.id, postId));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const currentUserId = req.isAuthenticated() ? req.user.id : undefined;
  const [enriched] = await enrichPostsWithUserData([post], currentUserId);

  res.json(GetPostResponse.parse(enriched));
});

router.post("/posts", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const isVideo = /\.(mp4|mov|webm)$/i.test(req.file.originalname);
  const imageUrl = `/api/uploads/${req.file.filename}`;

  const [post] = await db
    .insert(postsTable)
    .values({
      userId: req.user.id,
      imageUrl,
      caption: req.body.caption || null,
      mediaType: isVideo ? "video" : "image",
    })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));

  res.status(201).json({
    id: post.id,
    userId: post.userId,
    username: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown",
    userAvatar: user?.profileImageUrl ?? null,
    imageUrl: post.imageUrl,
    caption: post.caption,
    mediaType: post.mediaType,
    averageRating: null,
    ratingCount: 0,
    likeCount: 0,
    commentCount: 0,
    userRating: null,
    userLiked: false,
    createdAt: post.createdAt.toISOString(),
  });
});

router.delete("/posts/:postId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.userId !== req.user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(postsTable).where(eq(postsTable.id, postId));
  res.json(DeletePostResponse.parse({ success: true }));
});

router.post("/posts/:postId/rate", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const postId = parseInt(req.params.postId);
  const parsed = RatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Score must be between 1 and 10" });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.userId === req.user.id) {
    res.status(400).json({ error: "Cannot rate your own post" });
    return;
  }

  await db
    .insert(ratingsTable)
    .values({ postId, userId: req.user.id, score: parsed.data.score })
    .onConflictDoUpdate({
      target: [ratingsTable.postId, ratingsTable.userId],
      set: { score: parsed.data.score },
    });

  const [{ avgRating, totalRatings }] = await db
    .select({
      avgRating: avg(ratingsTable.score),
      totalRatings: count(ratingsTable.id),
    })
    .from(ratingsTable)
    .where(eq(ratingsTable.postId, postId));

  res.json(RatePostResponse.parse({
    averageRating: avgRating ? parseFloat(avgRating) : null,
    ratingCount: Number(totalRatings),
    userRating: parsed.data.score,
  }));
});

router.post("/posts/:postId/like", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const postId = parseInt(req.params.postId);

  const [existing] = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.postId, postId), eq(likesTable.userId, req.user.id)));

  let liked: boolean;
  if (existing) {
    await db.delete(likesTable).where(and(eq(likesTable.postId, postId), eq(likesTable.userId, req.user.id)));
    liked = false;
  } else {
    await db.insert(likesTable).values({ postId, userId: req.user.id });
    liked = true;
  }

  const [{ total }] = await db
    .select({ total: count(likesTable.id) })
    .from(likesTable)
    .where(eq(likesTable.postId, postId));

  res.json(ToggleLikeResponse.parse({ liked, likeCount: Number(total) }));
});

router.get("/posts/:postId/comments", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);

  const comments = await db
    .select({
      id: commentsTable.id,
      postId: commentsTable.postId,
      userId: commentsTable.userId,
      username: sql<string>`coalesce(${usersTable.firstName}, '') || coalesce(' ' || ${usersTable.lastName}, '')`,
      userAvatar: usersTable.profileImageUrl,
      text: commentsTable.text,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.postId, postId))
    .orderBy(desc(commentsTable.createdAt));

  const formatted = comments.map(c => ({
    ...c,
    username: c.username?.trim() || "Unknown",
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  }));

  res.json(GetCommentsResponse.parse({ comments: formatted }));
});

router.post("/posts/:postId/comments", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const postId = parseInt(req.params.postId);
  const parsed = AddCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Comment text required" });
    return;
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({ postId, userId: req.user.id, text: parsed.data.text })
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));

  res.status(201).json({
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    username: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown",
    userAvatar: user?.profileImageUrl ?? null,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  });
});

router.get("/users/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const posts = await basePostQuery()
    .where(eq(postsTable.userId, userId))
    .orderBy(desc(postsTable.createdAt));

  const currentUserId = req.isAuthenticated() ? req.user.id : undefined;
  const enriched = await enrichPostsWithUserData(posts, currentUserId);

  res.json(GetUserProfileResponse.parse({
    user: {
      id: user.id,
      username: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
      profileImage: user.profileImageUrl ?? null,
      createdAt: user.createdAt.toISOString(),
    },
    posts: enriched,
    totalPosts: enriched.length,
  }));
});

export default router;
