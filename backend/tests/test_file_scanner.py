"""
Tests for file_scanner module.
Run: pytest tests/test_file_scanner.py -v
"""
import pytest
from file_scanner import scan_uploaded_file


class TestFileScanner:
    def test_csv_formula_injection_detected(self):
        csv_content = b"date,description,amount\n2024-01-01,=1+1,100\n"
        is_safe, error = scan_uploaded_file("test.csv", "text/csv", csv_content)
        assert is_safe is False
        assert "formula" in error.lower()

    def test_csv_xss_detected(self):
        csv_content = b"date,description,amount\n2024-01-01,<script>alert(1)</script>,100\n"
        is_safe, error = scan_uploaded_file("test.csv", "text/csv", csv_content)
        assert is_safe is False
        assert "script" in error.lower()

    def test_clean_csv_passes(self):
        csv_content = b"date,description,amount\n2024-01-01,Test payment,100\n"
        is_safe, error = scan_uploaded_file("test.csv", "text/csv", csv_content)
        assert is_safe is True
        assert error == ""

    def test_excel_with_macros_rejected(self):
        import zipfile
        from io import BytesIO

        buffer = BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zf:
            zf.writestr('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>')
            zf.writestr('xl/workbook.xml', '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"></workbook>')
            zf.writestr('xl/vbaProject.bin', b'fake_vba_content')

        content = buffer.getvalue()
        is_safe, error = scan_uploaded_file("test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", content)
        assert is_safe is False
        assert "macro" in error.lower()

    def test_clean_excel_passes(self):
        from openpyxl import Workbook
        from io import BytesIO

        wb = Workbook()
        ws = wb.active
        ws.append(["Date", "Description", "Amount"])
        ws.append(["2024-01-01", "Test", 100])
        excel_buffer = BytesIO()
        wb.save(excel_buffer)
        content = excel_buffer.getvalue()

        is_safe, error = scan_uploaded_file("test.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", content)
        assert is_safe is True
        assert error == ""
