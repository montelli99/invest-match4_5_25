import { Card } from "@/components/ui/card";
import React from "react";

export interface Props {}

export function DeveloperVersioningDocs({}: Props) {
  return (
    <Card className="p-6 prose dark:prose-invert max-w-none">
      <h1>Document Versioning System - Technical Documentation</h1>

      <h2>System Architecture</h2>

      <h3>Overview</h3>
      <p>
        The document versioning system is built on top of FastAPI and uses
        Databutton's storage system for maintaining document versions and
        metadata.
      </p>

      <h3>Key Components</h3>
      <ol>
        <li>
          <strong>Document Storage</strong>
          <ul>
            <li>
              Binary content stored in <code>db.storage.binary</code>
            </li>
            <li>
              Metadata stored in <code>db.storage.json</code>
            </li>
            <li>Encryption using Fernet symmetric encryption</li>
          </ul>
        </li>
        <li>
          <strong>Version Tracking</strong>
          <ul>
            <li>Sequential version numbering</li>
            <li>
              Previous versions stored with <code>_v{"{number}"}</code> suffix
            </li>
            <li>Metadata includes version history</li>
          </ul>
        </li>
      </ol>

      <h2>Implementation Details</h2>

      <h3>Document Metadata Model</h3>
      <pre>
        <code>
          {`class DocumentMetadata(BaseModel):
    document_id: str
    version: int = 1
    previous_versions: List[str] = []
    # ... other fields`}
        </code>
      </pre>

      <h3>Storage Structure</h3>
      <ul>
        <li>
          Current version: <code>document_{"{id}"}</code>
        </li>
        <li>
          Previous versions:{" "}
          <code>
            document_{"{id}"}_v{"{version}"}
          </code>
        </li>
        <li>
          Metadata: <code>document_metadata_{"{id}"}</code>
        </li>
      </ul>

      <h3>Version Management Flow</h3>

      <h4>1. Upload New Version</h4>
      <pre>
        <code>
          {`# Save current as previous version
old_version_id = f"{document_id}_v{current_version}"
db.storage.binary.put(f"document_{old_version_id}", current_content)

# Update metadata
metadata.version += 1
metadata.previous_versions.append(old_version_id)

# Store new version
db.storage.binary.put(f"document_{document_id}", new_content)`}
        </code>
      </pre>

      <h4>2. Version Restoration</h4>
      <pre>
        <code>
          {`# Store current as new previous version
old_version_id = f"{document_id}_v{current_version}"
db.storage.binary.put(f"document_{old_version_id}", current_content)

# Restore selected version
version_content = db.storage.binary.get(f"document_{version_id}")
db.storage.binary.put(f"document_{document_id}", version_content)

# Update metadata
metadata.version += 1
metadata.previous_versions.append(old_version_id)`}
        </code>
      </pre>

      <h2>API Endpoints</h2>

      <h3>Version Management</h3>
      <ul>
        <li>
          <code>GET /documents/{"{document_id}"}/versions</code> - List all
          versions
        </li>
        <li>
          <code>
            GET /documents/{"{document_id}"}/versions/{"{version}"}
          </code>{" "}
          - Get specific version
        </li>
        <li>
          <code>
            POST /documents/{"{document_id}"}/restore/{"{version}"}
          </code>{" "}
          - Restore to version
        </li>
      </ul>

      <h3>Access Control</h3>
      <ul>
        <li>Owner has full access (upload, restore, delete)</li>
        <li>Shared users can view and download versions</li>
        <li>Version access follows document access permissions</li>
      </ul>

      <h2>Testing</h2>
      <p>
        Comprehensive test suite in <code>test_document_versioning.py</code>{" "}
        covers:
      </p>
      <ol>
        <li>Version tracking</li>
        <li>Version retrieval</li>
        <li>Version restoration</li>
        <li>Access control</li>
      </ol>

      <h2>Error Handling</h2>

      <h3>1. Version Not Found</h3>
      <pre>
        <code>
          {`if version_id not in metadata.previous_versions:
    raise HTTPException(status_code=404, detail="Version not found")`}
        </code>
      </pre>

      <h3>2. Access Denied</h3>
      <pre>
        <code>
          {`if user_id != metadata.uploaded_by and user_id not in metadata.shared_with:
    raise HTTPException(status_code=403, detail="Access denied")`}
        </code>
      </pre>

      <h2>Performance Considerations</h2>

      <h3>1. Storage Efficiency</h3>
      <ul>
        <li>Each version stored separately</li>
        <li>Consider implementing cleanup policies</li>
        <li>Monitor storage usage</li>
      </ul>

      <h3>2. Rate Limiting</h3>
      <ul>
        <li>Version endpoints rate-limited</li>
        <li>Prevents abuse and ensures stability</li>
      </ul>

      <h2>Security</h2>

      <h3>1. Encryption</h3>
      <ul>
        <li>All versions encrypted at rest</li>
        <li>Fernet symmetric encryption</li>
        <li>Key management through secrets</li>
      </ul>

      <h3>2. Access Control</h3>
      <ul>
        <li>Version-level permissions</li>
        <li>Audit logging for all operations</li>
      </ul>

      <h2>Future Improvements</h2>

      <h3>1. Differential Storage</h3>
      <ul>
        <li>Store only changes between versions</li>
        <li>Reduce storage requirements</li>
      </ul>

      <h3>2. Version Tagging</h3>
      <ul>
        <li>Add metadata to versions</li>
        <li>Improve version management</li>
      </ul>

      <h3>3. Retention Policies</h3>
      <ul>
        <li>Automatic version cleanup</li>
        <li>Based on age or count</li>
      </ul>
    </Card>
  );
}
