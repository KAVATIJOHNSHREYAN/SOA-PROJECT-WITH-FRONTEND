import React, { useState, useMemo } from 'react';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiSearch, FiDownload, FiX } from 'react-icons/fi';
import '../../styles/components.css';

const PAGE_SIZE = 10;

function DataTable({ columns = [], data = [], onEdit, onDelete, actions, title }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const rawItems = Array.isArray(data) ? data : [];

  // Client-side multi-column search
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return rawItems;
    const lower = searchTerm.toLowerCase();
    return rawItems.filter(item => {
      return columns.some(col => {
        const val = item[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lower);
      });
    });
  }, [rawItems, searchTerm, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pageData = filteredItems.slice(startIdx, startIdx + PAGE_SIZE);

  // One-click CSV Export
  const exportToCsv = () => {
    if (filteredItems.length === 0) return;
    const headers = columns.map(c => `"${c.label}"`).join(',');
    const rows = filteredItems.map(row => {
      return columns.map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="table-container">
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="table-search-box">
          <FiSearch className="table-search-icon" />
          <input
            type="text"
            className="table-search-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              className="table-search-clear"
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="table-toolbar-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportToCsv}
            disabled={filteredItems.length === 0}
            title="Export filtered records to CSV"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="table-scroll-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(onEdit || onDelete || actions) && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="empty-row">
                  <div className="empty-state-content">
                    <p>{searchTerm ? `No records matching "${searchTerm}"` : 'No data records found'}</p>
                    {searchTerm && (
                      <button className="btn btn-outline btn-sm" onClick={() => setSearchTerm('')}>
                        Clear search filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="actions-cell-wrapper">
                      <div className="actions-cell">
                        {actions && actions(row)}
                        {onEdit && (
                          <button className="btn-icon btn-edit" onClick={() => onEdit(row)} title="Edit">
                            <FiEdit2 />
                          </button>
                        )}
                        {onDelete && (
                          <button className="btn-icon btn-delete" onClick={() => onDelete(row)} title="Delete">
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enterprise Pagination Bar */}
      <div className="pagination">
        <div className="pagination-info">
          {filteredItems.length > 0 ? (
            <span>
              Showing <strong>{startIdx + 1}</strong> to <strong>{Math.min(startIdx + PAGE_SIZE, filteredItems.length)}</strong> of <strong>{filteredItems.length}</strong> records
              {searchTerm && ` (filtered from ${rawItems.length} total)`}
            </span>
          ) : (
            <span>0 records found</span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              title="Previous page"
            >
              <FiChevronLeft />
            </button>
            <span className="pagination-current-page">
              Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              className="pagination-btn"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              title="Next page"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
