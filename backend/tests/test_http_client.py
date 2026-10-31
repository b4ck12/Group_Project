import pytest
from app.core.http_client import init_http_client, close_http_client, get_http_client

@pytest.mark.asyncio
async def test_http_client_singleton_lifecycle():
    await init_http_client()
    client1 = get_http_client()
    client2 = get_http_client()
    assert client1 is client2
    assert not client1.is_closed

    await close_http_client()
    assert client1.is_closed
