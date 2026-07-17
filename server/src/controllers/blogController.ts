import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Blog from '../models/Blog';

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBlogDetails = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name')
      .populate('comments.user', 'name');

    if (!blog) return res.status(404).json({ success: false, message: 'Blog article not found' });

    blog.views += 1;
    await blog.save();

    res.status(200).json({ success: true, blog });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createBlog = async (req: AuthRequest, res: Response) => {
  const { title, content, category, tags, coverImage, isPublished } = req.body;

  try {
    const blog = await Blog.create({
      title,
      content,
      category,
      tags: tags || [],
      coverImage,
      isPublished: isPublished ?? true,
      author: req.user?.id,
    });

    res.status(201).json({ success: true, message: 'Blog post created successfully', blog });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  const { text } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    blog.comments.push({
      user: req.user?.id as any,
      text,
      date: new Date(),
    });

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id).populate('comments.user', 'name');

    res.status(201).json({ success: true, message: 'Comment added', blog: updatedBlog });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
