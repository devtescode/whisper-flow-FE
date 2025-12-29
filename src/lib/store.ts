// Simple in-memory store for demo purposes
// In production, this would be replaced with a database

export interface AnonymousLink {
  id: string;
  nickname: string;
  publicId: string;
  inboxId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Message {
  id: string;
  linkId: string;
  content: string;
   nickname: string; 
  senderEmail?: string;
  senderPicture?: string;
  senderName?: string;
  senderIp?: string;
  userAgent?: string;
  createdAt: Date;
}

// Generate random IDs
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// In-memory storage (will reset on page refresh)
let links: AnonymousLink[] = [];
let messages: Message[] = [];

export const createLink = (nickname: string): AnonymousLink => {
  const link: AnonymousLink = {
    id: generateId(),
    nickname,
    publicId: generateId(),
    inboxId: generateId(),
    createdAt: new Date(),
    isActive: true,
  };
  links.push(link);
  return link;
};

export const getLinkByPublicId = (publicId: string): AnonymousLink | undefined => {
  return links.find(l => l.publicId === publicId && l.isActive);
};

export const getLinkByInboxId = (inboxId: string): AnonymousLink | undefined => {
  return links.find(l => l.inboxId === inboxId);
};

export const sendMessage = (linkId: string, content: string, senderEmail?: string, nickname?: string): Message => {
  const message: Message = {
    id: generateId(),
    linkId,
    content,
    nickname,
    senderEmail,
    senderIp: '127.0.0.1', // Would be captured server-side
    userAgent: navigator.userAgent,
    createdAt: new Date(),
  };
  messages.push(message);
  return message;
};

export const getMessagesByLinkId = (linkId: string): Message[] => {
  return messages.filter(m => m.linkId === linkId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getAllLinks = (): AnonymousLink[] => links;
export const getAllMessages = (): Message[] => messages;

export const deleteMessage = (messageId: string): void => {
  messages = messages.filter(m => m.id !== messageId);
};

export const toggleLinkStatus = (linkId: string): void => {
  const link = links.find(l => l.id === linkId);
  if (link) {
    link.isActive = !link.isActive;
  }
};
