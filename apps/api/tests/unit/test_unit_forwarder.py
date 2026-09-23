"""Root unit test suite runner."""

from tests.conftest import *  # noqa: F403

from socforge.detection.compiler import DetectionCompiler
from socforge.normalization.engine import NormalizationEngine
from socforge.policies.containment import FourEyesPolicyEngine


def test_root_unit_suite_imports():
    """Verify that root test runner can discover all core SOCForge modules."""
    engine = NormalizationEngine()
    assert len(engine.normalizers) >= 3

    policy = FourEyesPolicyEngine()
    assert policy.APPROVAL_TIMEOUT_SECONDS > 0

    compiler = DetectionCompiler()
    assert compiler is not None
