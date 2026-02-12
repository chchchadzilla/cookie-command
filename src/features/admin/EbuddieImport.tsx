import React, { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileText, RefreshCw } from 'lucide-react';
import { parseEbuddieReport, validateScoutMatches, generateTemplateCSV, ImportResult } from '../../utils/ebuddieImporter';
import { useCookieStore } from '../../lib/store';
import { CookieType, COOKIE_LABELS } from '../../lib/types';
import './EbuddieImport.css';

export function EbuddieImport() {
  const { users, updateInventoryField } = useCookieStore();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<{
    scoutName: string;
    cookieType: CookieType;
    quantity: number;
  }[] | null>(null);
  const [updateMode, setUpdateMode] = useState<'replace' | 'add'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scouts = users.filter(u => !u.isAdmin);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);
    setPreviewData(null);

    try {
      const importResult = await parseEbuddieReport(file);
      
      if (importResult.success && importResult.data) {
        // Validate scout matches
        const { matched, unmatched } = validateScoutMatches(importResult.data, scouts);
        
        if (unmatched.length > 0) {
          setResult({
            success: false,
            message: `Could not match ${unmatched.length} scout(s) in the file`,
            errors: [
              `Unmatched scouts: ${unmatched.join(', ')}`,
              'Please make sure scout names in the file exactly match names in CookieCommand'
            ]
          });
        } else {
          // Show preview
          setPreviewData(importResult.data);
          setResult({
            success: true,
            message: `Found ${matched.size} scout(s) with ${importResult.data.length} cookie entries`,
            data: importResult.data
          });
        }
      } else {
        setResult(importResult);
      }
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: 'An error occurred while importing',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    
    setImporting(true);
    
    try {
      // Group data by scout
      const scoutData = new Map<string, Map<CookieType, number>>();
      
      for (const entry of previewData) {
        // Find the scout ID
        const scout = scouts.find(s => 
          s.name.toLowerCase() === entry.scoutName.toLowerCase() ||
          s.username.toLowerCase() === entry.scoutName.toLowerCase()
        );
        
        if (!scout) continue;
        
        if (!scoutData.has(scout.id)) {
          scoutData.set(scout.id, new Map());
        }
        
        scoutData.get(scout.id)!.set(entry.cookieType, entry.quantity);
      }
      
      // Update inventory for each scout
      for (const [userId, cookies] of scoutData) {
        for (const [cookieType, quantity] of cookies) {
          if (updateMode === 'replace') {
            // Replace the 'starting' field with the new value
            await updateInventoryField(userId, cookieType, 'starting', quantity, true);
          } else {
            // Add to existing 'additional' field
            await updateInventoryField(userId, cookieType, 'additional', quantity, true);
          }
        }
      }
      
      setResult({
        success: true,
        message: `✅ Successfully imported data for ${scoutData.size} scout(s)!`
      });
      setPreviewData(null);
      
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: 'Failed to update inventory',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ebuddie-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancel = () => {
    setPreviewData(null);
    setResult(null);
  };

  return (
    <div className="ebuddie-import">
      <div className="import-header">
        <div className="import-title">
          <Upload size={20} />
          <h3>Import from eBuddie</h3>
        </div>
        <p className="import-subtitle">
          Upload a report from the Girl Scout eBuddie system to sync cookie inventory
        </p>
      </div>

      <div className="import-instructions">
        <h4>How to use:</h4>
        <ol>
          <li>Download a cookie inventory report from eBuddie (Excel or CSV format)</li>
          <li>Upload the file below</li>
          <li>Review the preview and confirm the import</li>
        </ol>
        
        <div className="import-mode-selector">
          <label>
            <input
              type="radio"
              value="replace"
              checked={updateMode === 'replace'}
              onChange={(e) => setUpdateMode(e.target.value as 'replace')}
            />
            <span>Replace "Starting" inventory</span>
            <small>Best for initial inventory setup</small>
          </label>
          <label>
            <input
              type="radio"
              value="add"
              checked={updateMode === 'add'}
              onChange={(e) => setUpdateMode(e.target.value as 'add')}
            />
            <span>Add to "Additional" inventory</span>
            <small>Best for restocking/additional orders</small>
          </label>
        </div>

        <button className="btn-download-template" onClick={handleDownloadTemplate}>
          <Download size={16} /> Download CSV Template
        </button>
      </div>

      <div className="import-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="ebuddie-file-input"
        />
        <label htmlFor="ebuddie-file-input" className="btn-upload">
          <FileText size={16} />
          {importing ? 'Processing...' : 'Choose File'}
        </label>
      </div>

      {result && (
        <div className={`import-result ${result.success ? 'success' : 'error'}`}>
          <div className="result-icon">
            {result.success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className="result-content">
            <p className="result-message">{result.message}</p>
            {result.errors && result.errors.length > 0 && (
              <ul className="result-errors">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {previewData && previewData.length > 0 && (
        <div className="import-preview">
          <h4>Preview Import ({previewData.length} entries)</h4>
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Scout</th>
                  <th>Cookie Type</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 50).map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.scoutName}</td>
                    <td>
                      <span className="cookie-badge">{entry.cookieType}</span>
                      {' '}
                      {COOKIE_LABELS[entry.cookieType]}
                    </td>
                    <td className="qty-cell">{entry.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 50 && (
              <p className="preview-note">Showing first 50 of {previewData.length} entries</p>
            )}
          </div>

          <div className="preview-actions">
            <button className="btn-cancel" onClick={handleCancel} disabled={importing}>
              Cancel
            </button>
            <button 
              className="btn-confirm-import" 
              onClick={handleConfirmImport}
              disabled={importing}
            >
              <RefreshCw size={16} />
              {importing ? 'Importing...' : `Confirm Import (${updateMode === 'replace' ? 'Replace' : 'Add'})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
