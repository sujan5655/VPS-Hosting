import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { Post } from "../models/Post";
import { hasPermission } from "./rbac";

export const authorizePost = (action: "update" | "delete") => {
  return async (req: any, res: any, next: any) => {
    try {
      const user = req.user;
      const postId = req.params.id;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // 🔥 FULL permission (update:post)
      if (hasPermission(user, `${action}:post`) || hasPermission(user, `manage:post`)) {
        return next();
      }

      // 🔥 OWN permission
      if (hasPermission(user, `${action}:own-post`)) {
        const post = await Post.findByPk(postId);

        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }

        if (post.userId === user.id) {
          return next();
        }

        return res.status(403).json({
          error: "You can only modify your own post",
        });
      }

      return res.status(403).json({
        error: "Permission denied",
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };
};
