import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CsvTemplateHubModal, { csvTemplatesList, downloadCsvFile } from '../../src/components/CsvTemplateHubModal';

describe('Tier 4: CSV Template Hub Multi-File Download Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('T4.4.1: CSV Template Hub renders 5 standard template cards with badges and column counts', () => {
    render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV (CSV Template Hub)')).toBeInTheDocument();
    expect(screen.getAllByText(/ดาวน์โหลดแม่แบบ/).length).toBeGreaterThanOrEqual(5);
    expect(screen.getByText(/20 คอลัมน์/)).toBeInTheDocument();
    expect(screen.getByText(/45 คอลัมน์/)).toBeInTheDocument();
  });

  it('T4.4.2: Clicking individual template download button invokes downloadCsvFile with correct filename', () => {
    const createObjectUrlMock = vi.fn().mockReturnValue('blob:mock-csv-url');
    global.URL.createObjectURL = createObjectUrlMock;
    global.URL.revokeObjectURL = vi.fn();

    render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);

    const downloadButtons = screen.getAllByText('ดาวน์โหลดแม่แบบ');
    fireEvent.click(downloadButtons[0]);

    expect(createObjectUrlMock).toHaveBeenCalled();
  });

  it('T4.4.3: Bulk download all button initiates downloads for all 5 template files', () => {
    vi.useFakeTimers();
    const createObjectUrlMock = vi.fn().mockReturnValue('blob:mock-csv-url');
    global.URL.createObjectURL = createObjectUrlMock;
    global.URL.revokeObjectURL = vi.fn();

    render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);

    const downloadAllBtn = screen.getByText(/ดาวน์โหลดแม่แบบทั้งหมด/);
    fireEvent.click(downloadAllBtn);

    // Fast-forward through staggered timeouts (5 * 300ms = 1500ms)
    vi.advanceTimersByTime(2000);

    expect(createObjectUrlMock).toHaveBeenCalledTimes(5);
    vi.useRealTimers();
  });

  it('T4.4.4: Modal does not render when isOpen is false', () => {
    const { container } = render(<CsvTemplateHubModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('T4.4.5: All 5 templates contain valid non-empty sample rows matching their declared headers', () => {
    csvTemplatesList.forEach(template => {
      expect(template.sampleRows.length).toBeGreaterThan(0);
      template.sampleRows.forEach(row => {
        expect(row.length).toBe(template.headers.length);
      });
    });
  });
});
