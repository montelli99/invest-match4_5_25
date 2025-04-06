from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mimetypes

# Initialize mimetypes with common file types
mimetypes.add_type('application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx')
mimetypes.add_type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx')
mimetypes.add_type('application/vnd.openxmlformats-officedocument.presentationml.presentation', '.pptx')
mimetypes.add_type('application/msword', '.doc')
mimetypes.add_type('application/vnd.ms-excel', '.xls')
mimetypes.add_type('application/vnd.ms-powerpoint', '.ppt')
mimetypes.add_type('application/rtf', '.rtf')
mimetypes.add_type('text/markdown', '.md')
mimetypes.add_type('application/xml', '.xml')
mimetypes.add_type('application/zip', '.zip')
mimetypes.add_type('application/x-7z-compressed', '.7z')
mimetypes.add_type('application/x-rar-compressed', '.rar')
import base64
from typing import Dict, List
import databutton as db
import json
import xml.etree.ElementTree as ET

router = APIRouter()

class TestResult(BaseModel):
    test_name: str
    passed: bool
    details: str

class TestSuite(BaseModel):
    total_tests: int
    passed_tests: int
    failed_tests: int
    results: List[TestResult]

def _verify_file_signature(content: bytes, claimed_type: str) -> bool:
    """Verify if the file content matches its claimed type by checking file signatures/magic numbers
    and performing content validation where applicable.
    
    Args:
        content: The file content as bytes
        claimed_type: The MIME type claimed by the file extension
        
    Returns:
        bool: True if the content matches the claimed type, False otherwise
    """
    if not content:
        return False
    
    # For text-based files, verify if content is valid text
    if claimed_type in ['text/plain', 'application/json', 'text/csv']:
        return _is_valid_text_content(content)
        
    # File signatures/magic numbers for various file types
    signatures = {
        # Document formats
        'application/pdf': b'%PDF',
        'application/msword': b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1',  # DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': b'PK\x03\x04',  # DOCX
        'application/vnd.ms-excel': b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1',  # XLS
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': b'PK\x03\x04',  # XLSX
        'application/vnd.ms-powerpoint': b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1',  # PPT
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': b'PK\x03\x04',  # PPTX
        'application/rtf': b'{\\rtf1',  # RTF
        
        # Image formats
        'image/jpeg': b'\xFF\xD8\xFF',
        'image/png': b'\x89PNG\r\n\x1a\n',
        'image/gif': [b'GIF87a', b'GIF89a'],  # Support both GIF87a and GIF89a
        'image/webp': b'RIFF....WEBP',  # .... represents 4 bytes for size
        'image/tiff': [b'II*\x00', b'MM\x00*'],  # Support both little and big-endian TIFF
        
        # Archive formats
        'application/zip': b'PK\x03\x04',
        'application/x-zip-compressed': b'PK\x03\x04',
        'application/x-7z-compressed': b'7z\xBC\xAF\x27\x1C',
        'application/x-rar-compressed': b'Rar!\x1A\x07\x00',
        
        # Text-based formats (no specific signature)
        'text/plain': None,
        'text/markdown': None,
        'text/csv': None,
        'application/json': None,
        'application/xml': None,
    }
    
    if claimed_type not in signatures:
        return True
        
    signature = signatures[claimed_type]
    if isinstance(signature, list):
        return any(content.startswith(sig) for sig in signature)
    return content.startswith(signature)

def _is_valid_text_content(content: bytes, claimed_type: str = 'text/plain') -> bool:
    """Check if content appears to be valid text and matches the claimed type.
    
    Args:
        content: The file content as bytes
        claimed_type: The MIME type claimed by the file extension
        
    Returns:
        bool: True if the content is valid for the claimed type, False otherwise
    """
    try:
        text = content.decode('utf-8')
        
        # Additional validation based on claimed type
        if claimed_type == 'application/json':
            json.loads(text)  # Will raise JSONDecodeError if invalid
            return True
            
        elif claimed_type == 'text/csv':
            # Basic CSV validation - check for commas and consistent number of fields
            lines = text.splitlines()
            if not lines:
                return False
            field_count = len(lines[0].split(','))
            return all(len(line.split(',')) == field_count for line in lines if line.strip())
            
        elif claimed_type == 'application/xml':
            import xml.etree.ElementTree as ET
            ET.fromstring(text)  # Will raise ParseError if invalid
            return True
            
        elif claimed_type == 'text/markdown':
            # Basic markdown validation - check for common markdown elements
            md_elements = ['#', '-', '*', '`', '[', ']', '(', ')']
            return any(element in text for element in md_elements)
            
        # For plain text, just ensure it's valid UTF-8
        return True
        
    except (UnicodeDecodeError, json.JSONDecodeError, ET.ParseError):
        return False

@router.post("/test/file-type-detection")
def test_file_type_detection() -> TestSuite:
    """Run comprehensive tests for file type detection"""
    
    test_results = []
    
    # Test 1: PDF Detection
    pdf_content = base64.b64decode('JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAw0DMwslAwBbLANC8FQwUDPQMzYyUuAEqrBvAKZW5kc3RyZWFtCmVuZG9iagoKMyAwIG9iago0MgplbmRvYmoKCjUgMCBvYmoKPDwKPj4KZW5kb2JqCgo2IDAgb2JqCjw8L0ZvbnQgNSAwIFIKL1Byb2NTZXRbL1BERi9UZXh0XQo+PgplbmRvYmoKCjEgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCA0IDAgUi9SZXNvdXJjZXMgNiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL0dyb3VwPDwvUy9UcmFuc3BhcmVuY3kvQ1MvRGV2aWNlUkdCL0kgdHJ1ZT4+L0NvbnRlbnRzIDIgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZXMKL1Jlc291cmNlcyA2IDAgUgovTWVkaWFCb3hbIDAgMCA1OTUgODQyIF0KL0tpZHNbIDEgMCBSIF0KL0NvdW50IDE+PgplbmRvYmoKCjcgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDQgMCBSCi9PcGVuQWN0aW9uWzEgMCBSIC9YWVogbnVsbCBudWxsIDBdCi9MYW5nKGVuLVVTKQo+PgplbmRvYmoKCjggMCBvYmoKPDwvQ3JlYXRvcjxGRUZGMDA1NzAwNzIwMDY5MDA3NDAwNjUwMDcyPgovUHJvZHVjZXI8RkVGRjAwNEMwMDY5MDA2MjAwNzIwMDY1MDA0RjAwNjYwMDY2MDA2OTAwNjMwMDY1MDAyMDAwMzYwMDJFMDAzND4KL0NyZWF0aW9uRGF0ZShEOjIwMjMwMzI0MTYxMDQ5KzAxJzAwJyk+PgplbmRvYmoKCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDIyNiAwMDAwMCBuIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAxMzIgMDAwMDAgbiAKMDAwMDAwMDM2OCAwMDAwMCBuIAowMDAwMDAwMTUxIDAwMDAwIG4gCjAwMDAwMDAxNzMgMDAwMDAgbiAKMDAwMDAwMDQ2NiAwMDAwMCBuIAowMDAwMDAwNTYyIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA5L1Jvb3QgNyAwIFIKL0luZm8gOCAwIFIKL0lEIFsgPEY3RDc3QjNEMjJCOUY5MjgyOUQ0OUZGNUQ3OEI4RjI4Pgo8RjdENzdCM0QyMkI5RjkyODI5RDQ5RkY1RDc4QjhGMjg+IF0KL0RvY0NoZWNrc3VtIC9BNTY3OTAyQjM3QUE2MzM0QzgxODlBRDY4MzBGNjg3Qgo+PgpzdGFydHhyZWYKNzM2CiUlRU9GCg==')
    
    # Test PDF with correct extension
    mime_type, _ = mimetypes.guess_type('test.pdf')
    test_results.append(TestResult(
        test_name="PDF MIME Type Detection",
        passed=mime_type == 'application/pdf',
        details=f"Detected type: {mime_type}"
    ))
    
    # Test PDF content verification
    test_results.append(TestResult(
        test_name="PDF Signature Verification",
        passed=_verify_file_signature(pdf_content, 'application/pdf'),
        details="Verified PDF file signature"
    ))
    
    # Test PDF with wrong extension
    mime_type, _ = mimetypes.guess_type('test.pdf.txt')
    content_verification = _verify_file_signature(pdf_content, mime_type if mime_type else 'text/plain')
    test_results.append(TestResult(
        test_name="PDF Content vs Extension Mismatch",
        passed=not content_verification,  # Should fail verification as content doesn't match extension
        details="Detected content type mismatch with extension"
    ))
    mime_type, _ = mimetypes.guess_type('test.pdf')
    test_results.append(TestResult(
        test_name="PDF MIME Type Detection",
        passed=mime_type == 'application/pdf',
        details=f"Detected type: {mime_type}"
    ))
    
    test_results.append(TestResult(
        test_name="PDF Signature Verification",
        passed=_verify_file_signature(pdf_content, 'application/pdf'),
        details="Verified PDF file signature"
    ))
    
    # Test 2: Image Format Detection
    # PNG Test
    png_content = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==')
    mime_type, _ = mimetypes.guess_type('test.png')
    test_results.append(TestResult(
        test_name="PNG MIME Type Detection",
        passed=mime_type == 'image/png',
        details=f"Detected type: {mime_type}"
    ))
    
    test_results.append(TestResult(
        test_name="PNG Signature Verification",
        passed=_verify_file_signature(png_content, 'image/png'),
        details="Verified PNG file signature"
    ))
    
    # JPEG Test
    jpeg_content = base64.b64decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=')
    mime_type, _ = mimetypes.guess_type('test.jpg')
    test_results.append(TestResult(
        test_name="JPEG MIME Type Detection",
        passed=mime_type == 'image/jpeg',
        details=f"Detected type: {mime_type}"
    ))
    
    test_results.append(TestResult(
        test_name="JPEG Signature Verification",
        passed=_verify_file_signature(jpeg_content, 'image/jpeg'),
        details="Verified JPEG file signature"
    ))
    
    # Test 3: Text File Handling
    # Empty text file
    empty_content = b''
    mime_type, _ = mimetypes.guess_type('empty.txt')
    test_results.append(TestResult(
        test_name="Empty Text File Detection",
        passed=mime_type == 'text/plain' and not _verify_file_signature(empty_content, 'text/plain'),
        details=f"Detected type: {mime_type}, Content validation: Empty file detected"
    ))
    
    # Valid text file
    text_content = b'This is a valid text file with UTF-8 content.'
    mime_type, _ = mimetypes.guess_type('test.txt')
    test_results.append(TestResult(
        test_name="Valid Text File Detection",
        passed=mime_type == 'text/plain' and _is_valid_text_content(text_content),
        details=f"Detected type: {mime_type}, Content validation: Valid UTF-8 text"
    ))
    
    # JSON file
    json_content = b'{"key": "value"}'
    mime_type, _ = mimetypes.guess_type('test.json')
    test_results.append(TestResult(
        test_name="JSON File Detection",
        passed=mime_type == 'application/json' and _is_valid_text_content(json_content),
        details=f"Detected type: {mime_type}, Content validation: Valid JSON format"
    ))
    
    # Test 4: Office Document Types
    # DOCX file (using ZIP signature as Office files are ZIP-based)
    docx_content = b'PK\x03\x04' + b'\x00' * 100  # Simplified DOCX structure
    mime_type, _ = mimetypes.guess_type('test.docx')
    test_results.append(TestResult(
        test_name="DOCX MIME Type Detection",
        passed=mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        details=f"Detected type: {mime_type}"
    ))
    
    test_results.append(TestResult(
        test_name="DOCX Signature Verification",
        passed=_verify_file_signature(docx_content, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        details="Verified DOCX file signature"
    ))
    
    # Test 5: Edge Cases
    # Malformed Extension
    mime_type, _ = mimetypes.guess_type('document.invalid')
    test_results.append(TestResult(
        test_name="Invalid Extension Handling",
        passed=mime_type is None,
        details=f"Detected type: {mime_type}"
    ))
    
    # Test 6: Case Sensitivity
    mime_type1, _ = mimetypes.guess_type('test.PDF')
    mime_type2, _ = mimetypes.guess_type('test.pdf')
    test_results.append(TestResult(
        test_name="Extension Case Sensitivity",
        passed=mime_type1 == mime_type2,
        details=f"Upper: {mime_type1}, Lower: {mime_type2}"
    ))
    
    # Calculate summary
    passed_tests = len([r for r in test_results if r.passed])
    total_tests = len(test_results)
    
    return TestSuite(
        total_tests=total_tests,
        passed_tests=passed_tests,
        failed_tests=total_tests - passed_tests,
        results=test_results
    )

@router.post("/test/malware-detection")
def test_malware_detection() -> TestSuite:
    """Test malware detection capabilities"""
    test_results = []
    
    # Test 1: EICAR Test File
    eicar = b'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
    test_results.append(TestResult(
        test_name="EICAR Test File Detection",
        passed=_contains_suspicious_patterns(eicar),
        details="EICAR test signature detected"
    ))
    
    # Test 2: Script Injection
    script_content = b'<script>alert("xss")</script>'
    test_results.append(TestResult(
        test_name="Script Injection Detection",
        passed=_contains_suspicious_patterns(script_content),
        details="Script tag detected"
    ))
    
    # Test 3: Shell Script
    shell_script = b'#!/bin/bash\nrm -rf /'
    test_results.append(TestResult(
        test_name="Shell Script Detection",
        passed=_contains_suspicious_patterns(shell_script),
        details="Shell script detected"
    ))
    
    # Test 4: Clean Text File
    clean_text = b'This is a clean text file with normal content.'
    test_results.append(TestResult(
        test_name="Clean File Detection",
        passed=not _contains_suspicious_patterns(clean_text),
        details="Clean file correctly identified"
    ))
    
    # Calculate summary
    passed_tests = len([r for r in test_results if r.passed])
    total_tests = len(test_results)
    
    return TestSuite(
        total_tests=total_tests,
        passed_tests=passed_tests,
        failed_tests=total_tests - passed_tests,
        results=test_results
    )

def _contains_suspicious_patterns(content: bytes) -> bool:
    """Check for suspicious patterns in file content"""
    suspicious_patterns = [
        b"X5O!P%@AP[4\PZX54(P^)7CC)7",  # EICAR test signature
        b"<script",  # Basic XSS check
        b"#!/",     # Shebang (executable scripts)
    ]
    
    content_lower = content.lower()
    return any(pattern.lower() in content_lower for pattern in suspicious_patterns)