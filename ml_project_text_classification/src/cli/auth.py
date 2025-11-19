"""Authentication helper for backend API."""

import os
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from rich.console import Console

# Load environment variables from .env file in current working directory ONLY
# This allows users to have different .env files for different projects/contexts
# IMPORTANT: We explicitly check current directory and do NOT search parent directories
import os as os_module
current_dir = Path(os_module.getcwd())
env_path = current_dir / ".env"
# Only load .env if it exists in current directory AND auth variables aren't already set
# We use override=False to not overwrite existing env vars, and don't search parent dirs
if env_path.exists() and not os_module.getenv("AUTH_CLIENT_SECRET"):
    # Explicitly load only from current directory, don't search parents
    load_dotenv(dotenv_path=env_path, override=False)

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
        backend_url: Backend API base URL (required via BACKEND_URL env var if not provided)
        keycloak_url: Authentication server URL (required via AUTH_URL env var if not provided)
        realm: Authentication realm name (required via AUTH_REALM env var if not provided)
        client_id: Client ID for authentication (required via AUTH_CLIENT_ID env var if not provided)
        client_secret: Client secret for authentication (required via AUTH_CLIENT_SECRET env var if not provided)

    Returns:
        Authenticated requests.Session or None if authentication fails
    """
    # Load configuration from environment variables
    # Note: .env file is automatically loaded by load_dotenv() at module import
    # All configuration values must be explicitly provided - no defaults
    backend_url = backend_url or os.getenv("BACKEND_URL")
    keycloak_url = keycloak_url or os.getenv("AUTH_URL")
    realm = realm or os.getenv("AUTH_REALM")
    client_id = client_id or os.getenv("AUTH_CLIENT_ID")
    client_secret = client_secret or os.getenv("AUTH_CLIENT_SECRET")

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
        # Validate all required configuration is provided
        missing_config = []
        if not backend_url:
            missing_config.append("BACKEND_URL")
        if not keycloak_url:
            missing_config.append("AUTH_URL")
        if not realm:
            missing_config.append("AUTH_REALM")
        if not client_id:
            missing_config.append("AUTH_CLIENT_ID")
        if not client_secret:
            missing_config.append("AUTH_CLIENT_SECRET")
        
        if missing_config:
            console.print(
                "[red]Error: Missing required configuration. "
                "Please set the following in your .env file or as environment variables:[/red]"
            )
            for config in missing_config:
                console.print(f"[red]  - {config}[/red]")
            console.print(
                "[yellow]Tip: Create a .env file in the current directory with:\n"
                "  BACKEND_URL=http://localhost:8080\n"
                "  AUTH_URL=http://localhost:8081\n"
                "  AUTH_REALM=mlops-hub\n"
                "  AUTH_CLIENT_ID=mlops-cli\n"
                "  AUTH_CLIENT_SECRET=your-client-secret[/yellow]"
            )
            return None
        
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

