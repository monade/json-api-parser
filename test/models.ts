import { Attr, JSONAPI, Model, Rel } from "../src";

export const DateParser = (data: any) => new Date(data);

@JSONAPI("posts")
export class Post extends Model {
  @Attr() name!: string;
  @Attr("description") content!: string;
  @Attr("created_at", { parser: DateParser }) createdAt!: Date;
  @Attr("active", { default: true }) enabled!: boolean;
  @Attr() missing!: boolean;

  @Rel("user") author!: User;
  @Rel() reviewer!: User | null;
}

@JSONAPI("users")
class User extends Model {
  @Attr() firstName!: string;
  @Attr() lastName!: string;
  @Attr("created_at", { parser: DateParser }) createdAt!: Date;

  @Rel() favouritePost!: Post;
}
