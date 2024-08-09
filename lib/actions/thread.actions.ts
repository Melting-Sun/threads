"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { model } from "mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function creatThread({ text, author, communityId, path }: Params) {
  try {
    await connectToDB();

    const creatThread = await Thread.create({
      text,
      author,
      community: null,
    });

    //update user model

    await User.findByIdAndUpdate(author, {
      $push: { threads: creatThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error while creating thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  await connectToDB();

  // calc the num of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // fetch posts that have no parents
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

    const totalPostsCount = await Thread.countDocuments({
        parentId: { $in: [null, undefined] },
      });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}


export async function fetchThreadById (id: string) {
    await connectToDB()

    try {
        const thread = await Thread.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    }
                }
            ]

        }).exec()
        
        return thread
    } catch (error: any) {
        throw new Error(`Error while fetching the thread ${error.message}`)
    }
}   