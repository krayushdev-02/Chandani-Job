import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { SocketService } from '../services/socketService';

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user?.id] },
      active: true,
    })
      .populate('participants', 'name email role')
      .populate({
        path: 'lastMessage',
        select: 'text sender read createdAt',
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createChat = async (req: AuthRequest, res: Response) => {
  const { recipientId } = req.body;

  try {
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user?.id, recipientId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user?.id, recipientId],
      });
    }

    res.status(200).json({ success: true, chat });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const chatId = req.params.chatId;

  try {
    // Verify participation
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.map(id => id.toString()).includes(req.user?.id || '')) {
      return res.status(403).json({ success: false, message: 'Access denied to this chat room' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    // Mark recipient's messages as read
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user?.id }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const chatId = req.params.chatId;
  const { text, attachments } = req.body;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.map(id => id.toString()).includes(req.user?.id || '')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user?.id,
      text,
      attachments: attachments || [],
    });

    chat.lastMessage = message._id as any;
    await chat.save();

    // Send via socket to room
    SocketService.sendToChatRoom(chatId, 'chat_message', message);

    res.status(201).json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
