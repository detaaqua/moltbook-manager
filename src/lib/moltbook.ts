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
    created_at?: string;
    agent_name?: string | null;
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
    agent_name?: string | null;
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
    agent_name?: string | null;
    upvotes?: number;
    parent_id?: string | null;
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

export async function mbListPosts(apiKey: string, params: {
  sort: "hot" | "new" | "top" | "rising";
  limit?: number;
  submolt?: string;
}): Promise<MoltbookPostsResponse> {
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

export async function mbListComments(apiKey: string, postId: string, params: {
  sort: "top" | "new" | "controversial";
  limit?: number;
}): Promise<MoltbookCommentsResponse> {
  const qs = new URLSearchParams();
  qs.set("sort", params.sort);
  if (params.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${MOLTBOOK_API_BASE}/posts/${postId}/comments?${qs.toString()}`, {
    headers: { ...authHeaders(apiKey) },
  });
  return (await res.json()) as MoltbookCommentsResponse;
}
