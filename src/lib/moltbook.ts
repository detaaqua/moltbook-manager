export const MOLTBOOK_API_BASE = "https://www.moltbook.com/api/v1";

export type MoltbookRegisterResponse = {
  agent?: {
    api_key: string;
    claim_url: string;
    verification_code: string;
  };
  success?: boolean;
  message?: string;
  error?: string;
};

export type MoltbookStatusResponse = {
  success?: boolean;
  status?: "pending_claim" | "claimed" | string;
  message?: string;
  agent?: { id: string; name: string; claimed_at?: string };
  error?: string;
};

export type MoltbookPostsResponse = {
  success?: boolean;
  posts?: Array<{
    id: string;
    title: string;
    content?: string | null;
    url?: string | null;
    upvotes?: number;
    downvotes?: number;
    comment_count?: number;
    created_at?: string;
    agent_name?: string | null; // legacy
    author?: { id: string; name: string; karma?: number; follower_count?: number } | null;
    submolt?: { name: string; display_name?: string } | null;
  }>;
  error?: string;
};

export type MoltbookPostResponse = {
  success?: boolean;
  post?: {
    id: string;
    title: string;
    content?: string | null;
    url?: string | null;
    created_at?: string;
    upvotes?: number;
    downvotes?: number;
    comment_count?: number;
    agent_name?: string | null; // legacy
    author?: { id: string; name: string; karma?: number; follower_count?: number } | null;
    submolt?: { name: string; display_name?: string } | null;
  };
  error?: string;
};

export type MoltbookCommentsResponse = {
  success?: boolean;
  comments?: Array<{
    id: string;
    content: string;
    created_at?: string;
    agent_name?: string | null; // legacy
    author?: { id: string; name: string; karma?: number } | null;
    upvotes?: number;
    parent_id?: string | null;
  }>;
  error?: string;
};

export type MoltbookSubmoltListResponse = {
  success?: boolean;
  submolts?: Array<{
    id: string;
    name: string;
    display_name?: string;
    description?: string | null;
    subscriber_count?: number;
    created_at?: string;
  }>;
  error?: string;
};

export type MoltbookSubmoltResponse = {
  success?: boolean;
  submolt?: {
    id: string;
    name: string;
    display_name?: string;
    description?: string | null;
    subscriber_count?: number;
    created_at?: string;
  };
  error?: string;
};

export type MoltbookAgentProfileResponse = {
  success?: boolean;
  agent?: {
    id: string;
    name: string;
    description?: string | null;
    karma?: number;
    created_at?: string;
    last_active?: string;
    is_active?: boolean;
    is_claimed?: boolean;
    follower_count?: number;
    following_count?: number;
    avatar_url?: string | null;
    owner?: {
      x_handle?: string;
      x_name?: string;
      x_avatar?: string;
      x_bio?: string;
      x_follower_count?: number;
      x_following_count?: number;
      x_verified?: boolean;
    } | null;
  };
  recentPosts?: Array<{
    id: string;
    title: string;
    content?: string | null;
    upvotes?: number;
    downvotes?: number;
    comment_count?: number;
    created_at?: string;
    submolt?: { name: string };
  }>;
  error?: string;
};

function authHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function mbRegisterAgent(params: {
  name: string;
  description: string;
}): Promise<MoltbookRegisterResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/agents/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: params.name, description: params.description }),
  });
  return (await res.json()) as MoltbookRegisterResponse;
}

export async function mbStatus(apiKey: string): Promise<MoltbookStatusResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/agents/status`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookStatusResponse;
}

export async function mbListSubmolts(apiKey: string): Promise<MoltbookSubmoltListResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/submolts`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookSubmoltListResponse;
}

export async function mbGetSubmolt(apiKey: string, name: string): Promise<MoltbookSubmoltResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/submolts/${encodeURIComponent(name)}`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookSubmoltResponse;
}

export async function mbGetAgentProfile(apiKey: string, name: string): Promise<MoltbookAgentProfileResponse> {
  const qs = new URLSearchParams();
  qs.set("name", name);
  const res = await fetch(`${MOLTBOOK_API_BASE}/agents/profile?${qs.toString()}`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookAgentProfileResponse;
}

export type MoltbookActionResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  [k: string]: unknown;
};

export async function mbCreatePost(
  apiKey: string,
  params: {
    submolt: string;
    title: string;
    content?: string;
    url?: string;
  }
): Promise<MoltbookActionResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/posts`, {
    method: "POST",
    headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return (await res.json()) as MoltbookActionResponse;
}

export async function mbListPosts(
  apiKey: string,
  params: {
    sort: "hot" | "new" | "top" | "rising";
    limit?: number;
    submolt?: string;
  }
): Promise<MoltbookPostsResponse> {
  const qs = new URLSearchParams();
  qs.set("sort", params.sort);
  qs.set("limit", String(params.limit ?? 10));
  if (params.submolt) qs.set("submolt", params.submolt);

  const res = await fetch(`${MOLTBOOK_API_BASE}/posts?${qs.toString()}`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookPostsResponse;
}

export async function mbGetPost(apiKey: string, postId: string): Promise<MoltbookPostResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/posts/${postId}`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookPostResponse;
}

export async function mbUpvotePost(apiKey: string, postId: string): Promise<MoltbookActionResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/posts/${postId}/upvote`, {
    method: "POST",
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookActionResponse;
}

export async function mbCreateComment(
  apiKey: string,
  postId: string,
  params: {
    content: string;
    parent_id?: string;
  }
): Promise<MoltbookActionResponse> {
  const res = await fetch(`${MOLTBOOK_API_BASE}/posts/${postId}/comments`, {
    method: "POST",
    headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return (await res.json()) as MoltbookActionResponse;
}

export async function mbListComments(
  apiKey: string,
  postId: string,
  params: {
    sort: "top" | "new" | "controversial";
    limit?: number;
  }
): Promise<MoltbookCommentsResponse> {
  const qs = new URLSearchParams();
  qs.set("sort", params.sort);
  if (params.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${MOLTBOOK_API_BASE}/posts/${postId}/comments?${qs.toString()}`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookCommentsResponse;
}
