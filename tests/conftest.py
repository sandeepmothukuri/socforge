"""Root pytest conftest configuring python path for monorepo testing."""

import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
api_dir = root_dir / "apps" / "api"
cli_dir = root_dir / "apps" / "cli"

for path in [api_dir, cli_dir, root_dir]:
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)
