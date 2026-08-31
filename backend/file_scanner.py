"""
File malware scanner for upload endpoints.

Scans uploaded files for common malicious patterns:
- CSV formula injection
- Suspicious Excel content
- File structure validation
"""
import io
import re
import logging

logger = logging.getLogger(__name__)

# Suspicious patterns that could indicate malicious content
SUSPICIOUS_PATTERNS = [
    re.compile(r'^\s*[=+\-@]\s*', re.IGNORECASE),  # Formula injection at start of cell
    re.compile(r'<\s*script', re.IGNORECASE),  # Script tags
    re.compile(r'javascript:', re.IGNORECASE),  # JavaScript protocol
    re.compile(r'\bon\w+\s*=\s*["\']', re.IGNORECASE),  # Event handlers with quotes
    re.compile(r'\.exe\b', re.IGNORECASE),  # Executable references
    re.compile(r'\.bat\b', re.IGNORECASE),  # Batch files
    re.compile(r'\.cmd\b', re.IGNORECASE),  # Command files
    re.compile(r'\.ps1\b', re.IGNORECASE),  # PowerShell scripts
    re.compile(r'\.vbs\b', re.IGNORECASE),  # VBScript files
    re.compile(r'\.js\b', re.IGNORECASE),  # JavaScript files
    re.compile(r'\.dll\b', re.IGNORECASE),  # DLL files
]

MAX_SUSPICIOUS_HITS = 3


def scan_csv_content(content: bytes) -> tuple[bool, str]:
    """
    Scan CSV content for malicious patterns.
    Returns (is_safe, error_message).
    """
    try:
        text = content.decode('utf-8', errors='ignore')
    except Exception:
        text = content.decode('latin-1', errors='ignore')

    for line in text.splitlines():
        for cell in line.split(','):
            cell = cell.strip()
            if not cell:
                continue

            if re.match(r'^\s*[=+\-@]', cell):
                logger.warning("CSV formula injection detected: %s", cell[:50])
                return False, "File contains formula injection. Please remove formulas starting with =, +, -, @."

            if re.search(r'<\s*script', cell, re.IGNORECASE):
                logger.warning("CSV contains script tag: %s", cell[:50])
                return False, "File contains script tags. Please upload a clean file."

            if re.search(r'javascript:', cell, re.IGNORECASE):
                logger.warning("CSV contains javascript protocol: %s", cell[:50])
                return False, "File contains JavaScript protocol. Please upload a clean file."

            if re.search(r'\bon\w+\s*=\s*["\']', cell, re.IGNORECASE):
                logger.warning("CSV contains event handler: %s", cell[:50])
                return False, "File contains event handlers. Please upload a clean file."

    return True, ""


def scan_excel_content(content: bytes) -> tuple[bool, str]:
    """
    Basic Excel file structure validation.
    Checks for valid OOXML/BIFF structure and suspicious embedded objects.
    """
    if content.startswith(b'PK\x03\x04'):
        # ZIP-based OOXML (xlsx)
        import zipfile
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                namelist = zf.namelist()
                required_files = ['[Content_Types].xml', 'xl/workbook.xml']
                for req in required_files:
                    if req not in namelist:
                        return False, f"Invalid Excel file: missing {req}"

                for name in namelist:
                    if 'macro' in name.lower() or '.vba' in name.lower() or 'vba' in name.lower():
                        logger.warning("Excel file contains macros: %s", name)
                        return False, "Excel file contains macros. Please upload a macro-free file."

                    if name.endswith('.xml') or name.endswith('.rels'):
                        try:
                            with zf.open(name) as f:
                                snippet = f.read(8192)
                                for pattern in SUSPICIOUS_PATTERNS:
                                    if pattern.search(snippet.decode('utf-8', errors='ignore')):
                                        logger.warning("Suspicious content in Excel file %s: %s", name, pattern.pattern)
                                        return False, "Excel file contains suspicious content. Please upload a clean file."
                        except Exception:
                            pass
        except zipfile.BadZipFile:
            return False, "Invalid Excel file format."
    elif content.startswith(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'):
        # BIFF format (xls) - skip deep inspection for now
        pass
    else:
        return False, "Unrecognized file format."

    return True, ""


def scan_uploaded_file(filename: str, content_type: str, content: bytes) -> tuple[bool, str]:
    """
    Main entry point for file scanning.
    Returns (is_safe, error_message).
    """
    if not content:
        return False, "Empty file uploaded."

    if content_type in ["text/csv", "application/csv"] or filename.endswith('.csv'):
        return scan_csv_content(content)
    elif content_type in [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ]:
        return scan_excel_content(content)
    else:
        return True, "File type not subject to content scanning."
