"""Dataset management commands for CLI."""

import os
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any

import requests
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
import typer

# Note: .env file loading is handled in auth.py module

console = Console()

app = typer.Typer(help="Dataset management commands")


def _get_dataset_file_info(
    session: requests.Session, backend_url: str, dataset_id: int
) -> Tuple[int, int]:
    """
    Get file count and total size for a dataset from its latest version.
    
    Args:
        session: Authenticated requests session
        backend_url: Backend API base URL
        dataset_id: Dataset ID
        
    Returns:
        Tuple of (file_count, total_size_in_bytes)
    """
    file_count = 0
    total_size = 0
    
    try:
        detail_response = session.get(f"{backend_url}/api/datasets/{dataset_id}")
        if detail_response.status_code == 200:
            dataset_detail = detail_response.json()
            versions = dataset_detail.get("versions", [])
            if versions:
                latest_version = versions[-1]  # Assuming versions are ordered
                version_id = latest_version.get("versionId")
                if version_id:
                    files_response = session.get(
                        f"{backend_url}/api/datasets/{dataset_id}/versions/{version_id}/files"
                    )
                    if files_response.status_code == 200:
                        files = files_response.json()
                        if files:
                            file_count = len(files)
                            total_size = sum(f.get("fileSize", 0) or 0 for f in files)
    except Exception:
        # If we can't fetch details, return defaults
        pass
    
    return file_count, total_size


def _format_size(size_bytes: int) -> str:
    """Format size in bytes to human-readable MB string."""
    if size_bytes and size_bytes > 0:
        return f"{size_bytes / 1024 / 1024:.2f} MB"
    return "N/A"


def _build_datasets_table(datasets: List[Dict[str, Any]], session: requests.Session, backend_url: str) -> Table:
    """Build and populate the datasets table."""
    table = Table(title="Available Datasets")
    table.add_column("ID", style="cyan")
    table.add_column("Name", style="green")
    table.add_column("Description", style="white")
    table.add_column("File Format", style="yellow")
    table.add_column("Total Size", style="magenta")
    table.add_column("Files", style="blue")

    for dataset in datasets:
        dataset_id = dataset.get("id")
        total_size = dataset.get("totalSize") or dataset.get("fileSize", 0)
        
        # Get file count and calculate size if needed
        file_count, calculated_size = _get_dataset_file_info(session, backend_url, dataset_id)
        if not total_size or total_size == 0:
            total_size = calculated_size
        
        total_size_str = _format_size(total_size)
        file_format = dataset.get("fileFormat") or dataset.get("fileType", "") or "N/A"
        
        table.add_row(
            str(dataset_id),
            dataset.get("name", ""),
            dataset.get("description", "") or "",
            file_format,
            total_size_str,
            str(file_count) if file_count > 0 else "N/A",
        )
    
    return table


def _get_files_for_download(
    session: requests.Session,
    backend_url: str,
    dataset_id: int,
    dataset: Dict[str, Any],
    version_id: Optional[str],
    file_id: Optional[str],
) -> List[Tuple[str, str, Dict[str, Any]]]:
    """
    Determine which files to download based on provided parameters.
    
    Returns:
        List of tuples: (version_id, file_id, file_info)
    """
    if version_id and file_id:
        # Download specific file from specific version
        files_response = session.get(
            f"{backend_url}/api/datasets/{dataset_id}/versions/{version_id}/files"
        )
        if files_response.status_code != 200:
            console.print(f"[red]Could not get files for version {version_id}[/red]")
            raise typer.Exit(1)
        
        files = files_response.json()
        file_info = next((f for f in files if f.get("fileId") == file_id), None)
        if not file_info:
            console.print(f"[red]File {file_id} not found in version {version_id}[/red]")
            raise typer.Exit(1)
        
        return [(version_id, file_id, file_info)]
    
    elif version_id:
        # Download all files from specified version
        files_response = session.get(
            f"{backend_url}/api/datasets/{dataset_id}/versions/{version_id}/files"
        )
        if files_response.status_code != 200:
            console.print(f"[red]Could not get files for version {version_id}[/red]")
            raise typer.Exit(1)
        
        files = files_response.json()
        if not files:
            console.print(f"[red]No files found in version {version_id}[/red]")
            raise typer.Exit(1)
        
        return [(version_id, f.get("fileId"), f) for f in files]
    
    else:
        # Download all files from latest version
        versions = dataset.get("versions", [])
        if not versions:
            console.print("[red]No versions found for this dataset[/red]")
            raise typer.Exit(1)
        
        latest_version = versions[-1]  # Assuming versions are ordered
        latest_version_id = latest_version.get("versionId")
        console.print(f"[yellow]Downloading files from latest version: {latest_version_id}[/yellow]")
        
        files_response = session.get(
            f"{backend_url}/api/datasets/{dataset_id}/versions/{latest_version_id}/files"
        )
        if files_response.status_code != 200:
            console.print("[red]Could not get files for latest version[/red]")
            raise typer.Exit(1)
        
        files = files_response.json()
        if not files:
            console.print("[red]No files found in latest version[/red]")
            raise typer.Exit(1)
        
        return [(latest_version_id, f.get("fileId"), f) for f in files]


def _extract_filename(content_disposition: str, default_name: str) -> str:
    """Extract filename from Content-Disposition header or use default."""
    if "filename=" in content_disposition:
        return content_disposition.split("filename=")[1].strip('"')
    return default_name


def _download_single_file(
    session: requests.Session,
    backend_url: str,
    dataset_id: int,
    version_id: str,
    file_id: str,
    file_info: Dict[str, Any],
    output_path: Path,
) -> Tuple[str, float]:
    """
    Download a single file and save it to the output directory.
    
    Returns:
        Tuple of (filename, size_in_mb)
    """
    file_name = file_info.get("fileName", f"file_{file_id}")
    download_url = (
        f"{backend_url}/api/datasets/{dataset_id}/versions/"
        f"{version_id}/files/{file_id}/download"
    )
    
    console.print(f"[cyan]Downloading:[/cyan] {file_name}")
    
    # Start download
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task(f"Downloading {file_name}...", total=None)
        response = session.get(download_url, stream=True)
        response.raise_for_status()
        progress.update(task, completed=True)

    # Extract filename
    content_disposition = response.headers.get("Content-Disposition", "")
    filename = _extract_filename(content_disposition, file_name)

    # Save file
    file_path = output_path / filename
    total_size = int(response.headers.get("Content-Length", 0))

    with Progress(console=console) as progress:
        task = progress.add_task(
            f"Downloading {filename}...", total=total_size if total_size > 0 else None
        )

        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    if total_size > 0:
                        progress.update(task, advance=len(chunk))

    file_size_mb = file_path.stat().st_size / 1024 / 1024
    console.print(f"[green]✓[/green] Downloaded: {file_path} ({file_size_mb:.2f} MB)")
    
    return filename, file_size_mb


def _print_download_summary(downloaded_files: List[Tuple[str, float]]) -> None:
    """Print summary of downloaded files."""
    console.print(f"\n[green]✓[/green] Successfully downloaded {len(downloaded_files)} file(s):")
    for filename, size_mb in downloaded_files:
        console.print(f"  - {filename} ({size_mb:.2f} MB)")


@app.command("list")
def list_datasets(
    backend_url: str = typer.Option(
        os.getenv("BACKEND_URL", "http://localhost:8080"), help="Backend API base URL"
    ),
    keycloak_url: str = typer.Option(
        os.getenv("AUTH_URL", "http://localhost:8081"), help="Authentication server URL"
    ),
    realm: str = typer.Option(
        os.getenv("AUTH_REALM", "mlops-hub"), help="Authentication realm"
    ),
    client_id: str = typer.Option(
        os.getenv("AUTH_CLIENT_ID", "mlops-cli"), help="Client ID"
    ),
    client_secret: str = typer.Option(
        os.getenv("AUTH_CLIENT_SECRET", ""), help="Client secret"
    ),
):
    """List all available datasets."""
    from .auth import get_authenticated_session

    session = get_authenticated_session(
        backend_url=backend_url,
        keycloak_url=keycloak_url,
        realm=realm,
        client_id=client_id,
        client_secret=client_secret,
    )

    if not session:
        raise typer.Exit(1)

    try:
        response = session.get(f"{backend_url}/api/datasets")
        response.raise_for_status()
        datasets = response.json()

        if not datasets:
            console.print("[yellow]No datasets found[/yellow]")
            return

        table = _build_datasets_table(datasets, session, backend_url)
        console.print(table)
    except requests.exceptions.RequestException as e:
        console.print(f"[red]Failed to list datasets: {e}[/red]")
        raise typer.Exit(1)


@app.command("download")
def download_dataset(
    dataset_id: int = typer.Argument(..., help="Dataset ID to download"),
    output_dir: str = typer.Option(
        "./datasets", help="Output directory for downloaded files"
    ),
    backend_url: str = typer.Option(
        os.getenv("BACKEND_URL", "http://localhost:8080"), help="Backend API base URL"
    ),
    keycloak_url: str = typer.Option(
        os.getenv("AUTH_URL", "http://localhost:8081"), help="Authentication server URL"
    ),
    realm: str = typer.Option(
        os.getenv("AUTH_REALM", "mlops-hub"), help="Authentication realm"
    ),
    client_id: str = typer.Option(
        os.getenv("AUTH_CLIENT_ID", "mlops-cli"), help="Client ID"
    ),
    client_secret: str = typer.Option(
        os.getenv("AUTH_CLIENT_SECRET", ""), help="Client secret"
    ),
    version_id: Optional[str] = typer.Option(
        None, help="Specific version ID (defaults to latest)"
    ),
    file_id: Optional[str] = typer.Option(
        None, help="Specific file ID (defaults to all files)"
    ),
):
    """
    Download a dataset from the backend service.

    Downloads the dataset and saves it to the specified output directory.
    """
    from .auth import get_authenticated_session

    session = get_authenticated_session(
        backend_url=backend_url,
        keycloak_url=keycloak_url,
        realm=realm,
        client_id=client_id,
        client_secret=client_secret,
    )

    if not session:
        raise typer.Exit(1)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    try:
        # Get dataset info first
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Fetching dataset information...", total=None)
            response = session.get(f"{backend_url}/api/datasets/{dataset_id}")
            response.raise_for_status()
            dataset = response.json()
            progress.update(task, completed=True)

        dataset_name = dataset.get("name", f"dataset_{dataset_id}")
        console.print(f"[green]Dataset:[/green] {dataset_name}")

        # Determine which files to download
        files_to_download = _get_files_for_download(
            session, backend_url, dataset_id, dataset, version_id, file_id
        )

        # Download all files
        downloaded_files = []
        for ver_id, file_id_val, file_info in files_to_download:
            filename, size_mb = _download_single_file(
                session, backend_url, dataset_id, ver_id, file_id_val, file_info, output_path
            )
            downloaded_files.append((filename, size_mb))

        # Print summary
        _print_download_summary(downloaded_files)

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            console.print(f"[red]Dataset {dataset_id} not found[/red]")
        else:
            console.print(f"[red]HTTP error: {e}[/red]")
        raise typer.Exit(1)
    except requests.exceptions.RequestException as e:
        console.print(f"[red]Failed to download dataset: {e}[/red]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[red]Unexpected error: {e}[/red]")
        raise typer.Exit(1)

