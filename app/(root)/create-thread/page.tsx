import PostThread from "@/components/forms/PostThread";
import { fetchUSer } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUSer(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <>
      <div className="head-text">create thread</div>
      <PostThread userId={userInfo._id}/>
    </>
  );
}
