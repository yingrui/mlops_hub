"""Dataset management commands for CLI."""

import os
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
import typer

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

console = Console()

app = typer.Typer(help="Dataset management commands")


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

        table = Table(title="Available Datasets")
        table.add_column("ID", style="cyan")
        table.add_column("Name", style="green")
        table.add_column("Description", style="white")
        table.add_column("File Type", style="yellow")
        table.add_column("File Size", style="magenta")

        for dataset in datasets:
            file_size = dataset.get("fileSize", 0)
            file_size_str = f"{file_size / 1024 / 1024:.2f} MB" if file_size > 0 else "N/A"
            table.add_row(
                str(dataset.get("id", "")),
                dataset.get("name", ""),
                dataset.get("description", "") or "",
                dataset.get("fileType", "") or "",
                file_size_str,
            )

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

        # Determine download URL
        if version_id and file_id:
            # Download specific file from specific version
            download_url = (
                f"{backend_url}/api/datasets/{dataset_id}/versions/"
                f"{version_id}/files/{file_id}/download"
            )
            filename = None  # Will get from response headers
        elif version_id:
            # For now, download the first file from the specified version
            # In the future, we can enhance this to download all files
            console.print(
                f"[yellow]Note: Downloading first file from version {version_id}...[/yellow]"
            )
            # Get files for this version
            files_response = session.get(
                f"{backend_url}/api/datasets/{dataset_id}/versions/{version_id}/files"
            )
            if files_response.status_code == 200:
                files = files_response.json()
                if files:
                    file_id = files[0].get("fileId")
                    download_url = (
                        f"{backend_url}/api/datasets/{dataset_id}/versions/"
                        f"{version_id}/files/{file_id}/download"
                    )
                else:
                    console.print(
                        f"[red]No files found in version {version_id}[/red]"
                    )
                    raise typer.Exit(1)
            else:
                # Fallback to latest version download
                console.print(
                    f"[yellow]Could not get version files, downloading latest version...[/yellow]"
                )
                download_url = f"{backend_url}/api/datasets/{dataset_id}/download"
            filename = None
        else:
            # Download latest version
            download_url = f"{backend_url}/api/datasets/{dataset_id}/download"
            filename = None

        # Download the file
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Downloading dataset...", total=None)
            response = session.get(download_url, stream=True)
            response.raise_for_status()
            progress.update(task, completed=True)

        # Get filename from Content-Disposition header or use dataset name
        content_disposition = response.headers.get("Content-Disposition", "")
        if "filename=" in content_disposition:
            filename = content_disposition.split("filename=")[1].strip('"')
        elif not filename:
            # Try to get file extension from content type
            content_type = response.headers.get("Content-Type", "")
            extension = ""
            if "zip" in content_type:
                extension = ".zip"
            elif "json" in content_type:
                extension = ".json"
            elif "jsonl" in content_type:
                extension = ".jsonl"
            filename = f"{dataset_name}{extension}"

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

        console.print(f"[green]✓[/green] Dataset downloaded to: {file_path}")
        console.print(f"[green]File size:[/green] {file_path.stat().st_size / 1024 / 1024:.2f} MB")

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

