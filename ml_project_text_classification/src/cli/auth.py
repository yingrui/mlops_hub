"""Authentication helper for backend API."""

import os
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from rich.console import Console

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

console = Console()

# In-memory token cache
_token_cache: Optional[str] = None


def get_keycloak_token_with_client_credentials(
    keycloak_url: str = "http://localhost:8081",
    realm: str = "mlops-hub",
    client_id: str = "mlops-cli",
    client_secret: str = "",
) -> Optional[str]:
    """
    Get access token from Keycloak using client credentials grant.

    Args:
        keycloak_url: Keycloak server URL
        realm: Keycloak realm name
        client_id: Client ID
        client_secret: Client secret

    Returns:
        Access token string or None if authentication fails
    """
    token_url = f"{keycloak_url}/realms/{realm}/protocol/openid-connect/token"

    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    try:
        response = requests.post(token_url, data=data, headers=headers, timeout=10)
        response.raise_for_status()

        token_data = response.json()
        return token_data.get("access_token")
    except requests.exceptions.RequestException as e:
        console.print(f"[red]Failed to authenticate with client credentials: {e}[/red]")
        return None


def get_token_from_env() -> Optional[str]:
    """
    Get access token from environment variable.

    Returns:
        Access token string or None if not set
    """
    return os.getenv("MLOPS_ACCESS_TOKEN")


def get_cached_token() -> Optional[str]:
    """
    Get cached access token from memory.

    Returns:
        Cached access token string or None if not cached
    """
    global _token_cache
    return _token_cache


def set_cached_token(token: Optional[str]) -> None:
    """
    Cache access token in memory.

    Args:
        token: Access token to cache, or None to clear cache
    """
    global _token_cache
    _token_cache = token


def clear_cached_token() -> None:
    """Clear the cached access token from memory."""
    global _token_cache
    _token_cache = None


def get_authenticated_session(
    token: Optional[str] = None,
    backend_url: Optional[str] = None,
    keycloak_url: Optional[str] = None,
    realm: Optional[str] = None,
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
) -> Optional[requests.Session]:
    """
    Create an authenticated requests session.

    Args:
        token: Optional access token (if provided, will be used directly)
        backend_url: Backend API base URL (defaults to BACKEND_URL env var)
        keycloak_url: Authentication server URL (defaults to AUTH_URL env var)
        realm: Authentication realm name (defaults to AUTH_REALM env var)
        client_id: Client ID for authentication (defaults to AUTH_CLIENT_ID env var)
        client_secret: Client secret for authentication (defaults to AUTH_CLIENT_SECRET env var)

    Returns:
        Authenticated requests.Session or None if authentication fails
    """
    # Load defaults from environment variables
    backend_url = backend_url or os.getenv("BACKEND_URL", "http://localhost:8080")
    keycloak_url = keycloak_url or os.getenv("AUTH_URL", "http://localhost:8081")
    realm = realm or os.getenv("AUTH_REALM", "mlops-hub")
    client_id = client_id or os.getenv("AUTH_CLIENT_ID", "mlops-cli")
    client_secret = client_secret or os.getenv(
        "AUTH_CLIENT_SECRET", "mlops-cli-secret"
    )

    # Try to get token in this order:
    # 1. Explicitly provided token
    # 2. Environment variable
    # 3. Cached token in memory
    # 4. Automatically authenticate with client credentials from .env
    
    if not token:
        token = get_token_from_env()
    
    if not token:
        token = get_cached_token()
    
    # If no token available, automatically authenticate with client credentials
    if not token:
        console.print("[yellow]Authenticating with Keycloak (client credentials)...[/yellow]")
        token = get_keycloak_token_with_client_credentials(
            keycloak_url, realm, client_id, client_secret
        )
        # Cache the token in memory
        if token:
            set_cached_token(token)
            console.print("[green]✓ Token obtained and cached[/green]")

    if not token:
        console.print(
            "[red]Failed to obtain authentication token. "
            "Please check your AUTH_CLIENT_ID and AUTH_CLIENT_SECRET in .env file[/red]"
        )
        return None

    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}"})
    session.base_url = backend_url

    return session

