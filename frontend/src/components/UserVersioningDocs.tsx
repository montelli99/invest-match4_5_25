import { Card } from "@/components/ui/card";
import React from "react";

export interface Props {}

export function UserVersioningDocs({}: Props) {
  return (
    <Card className="p-6 prose dark:prose-invert max-w-none">
      <h1>Document Versioning Guide</h1>

      <h2>Overview</h2>
      <p>
        InvestMatch provides a robust document versioning system that allows you
        to track changes, access previous versions, and restore documents to
        earlier states. This guide explains how to use these features
        effectively.
      </p>

      <h2>Features</h2>

      <h3>Version Tracking</h3>
      <ul>
        <li>
          Every time you upload a new version of a document, the system
          automatically creates a version history
        </li>
        <li>Each version is numbered sequentially (1, 2, 3, etc.)</li>
        <li>
          The original document becomes version 1, with subsequent updates
          incrementing the version number
        </li>
      </ul>

      <h3>Viewing Version History</h3>
      <ol>
        <li>Navigate to your document list</li>
        <li>Select a document</li>
        <li>Click "View Versions" to see all versions of the document</li>
        <li>
          The list shows:
          <ul>
            <li>Version number</li>
            <li>Upload date</li>
            <li>Last modified date</li>
            <li>File size</li>
          </ul>
        </li>
      </ol>

      <h3>Accessing Previous Versions</h3>
      <ol>
        <li>From the version history view</li>
        <li>Click on any version to view or download it</li>
        <li>
          Each version maintains its original content exactly as it was when
          uploaded
        </li>
      </ol>

      <h3>Restoring Previous Versions</h3>
      <ol>
        <li>In the version history view</li>
        <li>Find the version you want to restore</li>
        <li>Click "Restore This Version"</li>
        <li>
          The system will:
          <ul>
            <li>
              Create a new version with the content from the selected version
            </li>
            <li>Maintain the complete version history</li>
            <li>Set the restored content as the current version</li>
          </ul>
        </li>
      </ol>

      <h3>Version Access Control</h3>
      <ul>
        <li>
          Document owners can:
          <ul>
            <li>View all versions</li>
            <li>Restore any version</li>
            <li>Share version access with other users</li>
          </ul>
        </li>
        <li>
          Users with shared access can:
          <ul>
            <li>View all versions they have been granted access to</li>
            <li>Download previous versions</li>
            <li>Cannot restore versions (owner only)</li>
          </ul>
        </li>
      </ul>

      <h2>Best Practices</h2>

      <h3>1. Regular Updates</h3>
      <ul>
        <li>Keep your documents up to date</li>
        <li>Each update creates a new version automatically</li>
      </ul>

      <h3>2. Version Notes</h3>
      <ul>
        <li>Use descriptive filenames</li>
        <li>Consider adding version-specific tags</li>
      </ul>

      <h3>3. Access Management</h3>
      <ul>
        <li>Share access only with necessary users</li>
        <li>Review shared access periodically</li>
      </ul>

      <h2>Storage Considerations</h2>
      <ul>
        <li>Each version counts towards your storage quota</li>
        <li>Consider periodically reviewing old versions</li>
        <li>The system maintains all versions until explicitly deleted</li>
      </ul>

      <h2>Support</h2>
      <p>If you need assistance with document versioning:</p>
      <ol>
        <li>Check this documentation</li>
        <li>Contact our support team</li>
        <li>Submit a support ticket through the platform</li>
      </ol>
    </Card>
  );
}
