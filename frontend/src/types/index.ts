import { StringLiteral } from "typescript";

export interface Task {
    id: number;
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
    created_at: string;    
    completed_at: string | null;
    filters: {
        start_date?: string;
        end_date?: string;
        hashtags?: string[];
        platforms?: string[];
    }
}

export interface Post {
    id: number;
    source: string;
    post_id: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    hashtags: string[];
    conten_type: string;
}

export interface Analytics {
    total_posts: number;
    total_engagement: number;
    hashtag_counts: Record<string, number>;
}

