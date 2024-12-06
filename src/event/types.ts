export type Message = {
  eventId: number;
  userId: number;
  timestamp: string;
};

export interface Block {
  id: string;
  type: BlockType;
  content: ContentType;
  children?: Block[];
  createdAt: string;
  updatedAt: string;
}

export type ContentType = {
  text: string;
};

export type BlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'bulleted_list'
  | 'numbered_list'
  | 'to_do'
  | 'toggle'
  | 'code'
  | 'image'
  | 'quote'
  | 'divider'
  | 'table'
  | 'callout'
  | 'auto-checkbox'
  | 'cta-button';
