export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `API error ${status}`);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

export class ApiClient {
  private readonly fetchFn: typeof fetch;
  private readonly headers: Record<string, string>;

  constructor(private readonly options: ApiClientOptions) {
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.headers = options.headers ?? {};
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchFn(`${this.options.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...init?.headers,
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(response.status, body);
    }

    return body as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }
}
