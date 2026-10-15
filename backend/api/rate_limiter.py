import time
from collections import defaultdict, deque
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class InMemoryRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-memory IP-based sliding window rate limiter for MCP endpoints.
    """

    def __init__(
        self,
        app,
        prefix: str = "/mcp",
        limit_per_minute: int = 10,
    ):
        super().__init__(app)
        self.prefix = prefix
        self.limit_per_minute = limit_per_minute
        self.window_seconds = 60.0
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only rate limit paths under the MCP prefix
        if not request.url.path.startswith(self.prefix):
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        now = time.time()
        window_start = now - self.window_seconds

        ip_timestamps = self._requests[client_ip]

        # Evict timestamps outside the sliding window
        while ip_timestamps and ip_timestamps[0] <= window_start:
            ip_timestamps.popleft()

        if len(ip_timestamps) >= self.limit_per_minute:
            oldest = ip_timestamps[0]
            retry_after = max(1, int(self.window_seconds - (now - oldest)))
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded: maximum {self.limit_per_minute} requests per minute allowed."
                },
                headers={"Retry-After": str(retry_after)},
            )

        ip_timestamps.append(now)
        return await call_next(request)

