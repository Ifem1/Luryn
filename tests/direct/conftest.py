"""Windows workaround for gltest's fd-0 temporary-file handoff.

The runner unlinks the active file descriptor; Windows holds it open until the
descriptor is restored. Ignoring that cleanup-only PermissionError lets the
official direct VM execute the contract; OS temp cleanup handles the file later.
"""
import os
_unlink = os.unlink

def _windows_safe_unlink(path):
    try:
        _unlink(path)
    except PermissionError:
        pass

os.unlink = _windows_safe_unlink
