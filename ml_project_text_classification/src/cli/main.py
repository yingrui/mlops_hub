"""Main CLI application."""

import typer
from rich.console import Console

from . import dataset_cli
# Note: .env file loading is handled in auth.py module

console = Console()

app = typer.Typer(
    name="mlops-cli",
    help="MLOps Hub Text Classification CLI",
    add_completion=False,
)

# Add subcommands
app.add_typer(dataset_cli.app, name="dataset", help="Dataset management commands")


@app.command()
def version():
    """Show version information."""
    console.print("[green]MLOps Hub Text Classification CLI v0.1.0[/green]")




if __name__ == "__main__":
    app()

