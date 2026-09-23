"""Unit tests for SOCForge Typer CLI commands."""

from socforge_cli.main import app
from typer.testing import CliRunner

runner = CliRunner()


def test_cli_help():
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "SOCForge CLI" in result.stdout
    assert "alerts" in result.stdout
    assert "detections" in result.stdout
    assert "investigations" in result.stdout
    assert "demo" in result.stdout


def test_cli_alerts_help():
    result = runner.invoke(app, ["alerts", "--help"])
    assert result.exit_code == 0
    assert "Query and inspect security alerts" in result.stdout


def test_cli_detections_help():
    result = runner.invoke(app, ["detections", "--help"])
    assert result.exit_code == 0
    assert "Manage and validate detection rules" in result.stdout


def test_cli_investigations_help():
    result = runner.invoke(app, ["investigations", "--help"])
    assert result.exit_code == 0
    assert "Manage investigations and evidence findings" in result.stdout
