"""Main CLI application."""

import os
from pathlib import Path

import typer
from dotenv import load_dotenv
from rich.console import Console

from . import datasets

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

console = Console()

app = typer.Typer(
    name="mlops-cli",
    help="MLOps Hub Text Classification CLI",
    add_completion=False,
)

# Add subcommands
app.add_typer(datasets.app, name="dataset", help="Dataset management commands")


@app.command()
def version():
    """Show version information."""
    console.print("[green]MLOps Hub Text Classification CLI v0.1.0[/green]")




if __name__ == "__main__":
    app()

