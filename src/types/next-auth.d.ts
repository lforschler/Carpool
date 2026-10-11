import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      familyId: string | null;
      groupId: string | null;
    };
  }

  interface User {
    familyId?: string | null;
    groupId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    familyId?: string | null;
    groupId?: string | null;
  }
}
